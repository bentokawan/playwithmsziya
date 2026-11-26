-- ===== Admin & helper =====
create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  username text not null unique,
  created_at timestamptz not null default now()
);
create or replace function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
grant execute on function public.is_admin() to authenticated;

create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ===== Media (setiap file yang diunggah) =====
create table public.media (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('image','audio')),
  storage_path text not null unique,           -- path di bucket `media`
  mime text not null,
  bytes int not null check (bytes > 0),
  sha256 text not null,
  duration_ms int check (duration_ms is null or duration_ms > 0),
  width int, height int,
  license text not null check (license in ('project','pixabay','cc0','cc-by-4.0','recorded-consent')),
  author text,
  source_url text,
  created_by uuid default auth.uid() references auth.users(id),
  created_at timestamptz not null default now()
);

-- ===== Konten item =====
create table public.objects (
  id text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name_id text not null check (length(name_id) between 1 and 40),
  name_en text not null check (length(name_en) between 1 and 40),
  image_id uuid references public.media(id),
  countable boolean not null default false,   -- boleh dipakai G01
  card_face boolean not null default false,   -- boleh dipakai G08
  maze_goal boolean not null default false,   -- boleh dipakai G09
  active boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.words (
  id uuid primary key default gen_random_uuid(),
  locale text not null check (locale in ('id','en')),
  word text not null check (word ~ '^[A-Z]{2,8}$'),
  object_id text not null references public.objects(id),
  use_initial boolean not null default false,  -- G04
  use_spell boolean not null default false,    -- G03 (level dari panjang kata: 3/4/5)
  audio_id uuid references public.media(id),
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  unique (locale, word)
);

create table public.hijaiyyah (
  id text primary key,                         -- HijaiyyahId (28 baris, di-seed)
  char text not null,
  name_id text not null,
  family text not null,
  trace_group text not null check (trace_group in ('mudah','sedang','tantang')),
  audio_id uuid references public.media(id),
  audio_reviewed boolean not null default false,
  trace_reviewed boolean not null default false,
  reviewer text,
  reviewed_at timestamptz,
  active boolean not null default true,
  updated_at timestamptz not null default now(),
  check (not audio_reviewed or audio_id is not null),
  check (not (audio_reviewed or trace_reviewed) or reviewer is not null)
);

create table public.speech_clips (               -- angka & nama huruf (di-seed)
  kind text not null check (kind in ('num','letter')),
  locale text not null check (locale in ('id','en')),
  key text not null,
  audio_id uuid references public.media(id),
  updated_at timestamptz not null default now(),
  primary key (kind, locale, key)
);

create table public.scene_audio (                -- musik, ambient, sfx (di-seed dari audio.md)
  id text primary key,                         -- 'music:home', 'ambient:night', 'sfx:kids-yay', ...
  layer text not null check (layer in ('music','ambient','sfx')),
  audio_id uuid references public.media(id),
  updated_at timestamptz not null default now()
);

create table public.publications (
  version int generated always as identity primary key,
  manifest_path text not null,                 -- 'manifests/manifest-<version>.json' di bucket `content`
  counts jsonb not null,
  note text,
  published_by uuid default auth.uid() references auth.users(id),
  published_at timestamptz not null default now()
);

-- updated_at triggers
create trigger t_objects before update on public.objects for each row execute function public.touch_updated_at();
create trigger t_words before update on public.words for each row execute function public.touch_updated_at();
create trigger t_hija before update on public.hijaiyyah for each row execute function public.touch_updated_at();
create trigger t_speech before update on public.speech_clips for each row execute function public.touch_updated_at();
create trigger t_scene before update on public.scene_audio for each row execute function public.touch_updated_at();

-- ===== RLS: hanya admin; anon tidak punya akses tabel =====
alter table public.admins enable row level security;
alter table public.media enable row level security;
alter table public.objects enable row level security;
alter table public.words enable row level security;
alter table public.hijaiyyah enable row level security;
alter table public.speech_clips enable row level security;
alter table public.scene_audio enable row level security;
alter table public.publications enable row level security;

create policy admins_self_read on public.admins for select to authenticated using (user_id = auth.uid());
-- Tabel dengan CRUD penuh oleh admin
create policy media_all   on public.media        for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy objects_all on public.objects      for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy words_all   on public.words        for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy pub_read    on public.publications for select to authenticated using (public.is_admin());
create policy pub_insert  on public.publications for insert to authenticated with check (public.is_admin());
-- Tabel ber-seed: hanya select + update (tanpa insert/delete)
create policy hija_read    on public.hijaiyyah    for select to authenticated using (public.is_admin());
create policy hija_update  on public.hijaiyyah    for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy speech_read  on public.speech_clips for select to authenticated using (public.is_admin());
create policy speech_update on public.speech_clips for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy scene_read   on public.scene_audio  for select to authenticated using (public.is_admin());
create policy scene_update on public.scene_audio  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- ===== Storage =====
insert into storage.buckets (id, name, public) values ('media','media', true), ('content','content', true)
  on conflict (id) do nothing;
create policy storage_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id in ('media','content') and public.is_admin());
create policy storage_admin_update on storage.objects for update to authenticated
  using (bucket_id in ('media','content') and public.is_admin());
create policy storage_admin_delete on storage.objects for delete to authenticated
  using (bucket_id in ('media','content') and public.is_admin());
-- Baca publik lewat URL public bucket (tanpa policy select untuk anon pada listing).
