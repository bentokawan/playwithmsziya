# Spesifikasi CMS & Login Admin

- Versi: 1.0 — 2026-11-25
- Plan eksekusi: [plan CMS](../plan/2026-11-25-cms-admin-plan.md). Terkait: [plan redesign](../plan/2026-11-25-paud-redesign-plan.md), [content](content.md), [audio](audio.md), [architecture](../architecture.md).

**Keputusan pengguna (2026-11-25):**

| # | Keputusan |
| --- | --- |
| C-D1 | Login **hanya untuk admin CMS** di `/admin/login`, berisi **username + password saja**. Anak tetap bermain tanpa akun, dan tidak ada data anak yang dikirim ke server |
| C-D2 | Backend **Supabase**: Postgres + Storage + Auth. Tanpa server sendiri dan tanpa Edge Function |
| C-D3 | Cakupan CMS: **media + konten item**, yaitu upload/ganti gambar objek dan suara, serta tambah/edit/nonaktifkan objek, kata, dan klip. Mekanik game, parameter level, teks UI, latar dunia, karakter, dan jalur tulis (glyph) **tetap di kode** |
| C-D4 | Suara hijaiyyah bisa **direkam langsung di browser** atau diunggah, lalu ditandai "sudah direview" oleh peninjau. Semua itu dilakukan tanpa mengubah kode |

## 1. Arsitektur

```text
                 (admin, login)                                   (anak, tanpa login)
/admin/* ──supabase-js──▶ Postgres (tabel CMS, RLS: admin only)
        ──supabase-js──▶ Storage bucket `media`  (public read, admin write)
        ──"Terbitkan"──▶ Storage bucket `content`: manifest-<v>.json + latest.json  ◀──fetch── app anak
                                                                                    (fallback: konten bawaan di bundle)
```

- **App anak tidak memuat `@supabase/supabase-js`.** App anak hanya melakukan `fetch` ke URL publik `latest.json` → `manifest-<v>.json` → file media. Paket supabase-js hanya di-import dari `src/admin/**` dan `src/lib/supabase/**` (ditegakkan dengan ESLint `no-restricted-imports`).
- **Model draft → terbit.** Perubahan di CMS tidak langsung terlihat anak. Perubahan baru terlihat setelah admin menekan **Terbitkan**, yang membuat snapshot JSON lengkap. Rollback dilakukan dengan mengarahkan `latest.json` ke manifest lama.
- **Tanpa CMS tetap jalan.** Jika env Supabase kosong, jaringan mati, atau manifest invalid, app memakai konten bawaan (`src/content/*` + `public/audio/*` + `src/assets/illustrations/*`) dan cache manifest terakhir.

## 2. Konfigurasi & lingkungan

| Variabel (`project/.env.local`, contoh di `.env.example`) | Contoh | Wajib |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | `https://abcd.supabase.co` | Untuk CMS |
| `VITE_SUPABASE_ANON_KEY` | `eyJ…` (publik, aman di klien karena RLS) | Untuk CMS |
| `VITE_CONTENT_BASE_URL` | `https://abcd.supabase.co/storage/v1/object/public` | Untuk app anak membaca konten terbit |
| `VITE_ADMIN_EMAIL_DOMAIN` | `admin.playwithmsziya.local` | Untuk login username |

- `service_role` key **tidak pernah** dipakai di klien atau repo.
- `.env.local` sudah tercakup oleh `.gitignore` (`*.local`). Ini wajib diverifikasi di task C0.2.

**Pengaturan Supabase (HUMAN, dicatat di plan CMS C0.1):**
- Region `ap-southeast-1` (Singapura).
- Auth → Email provider ON, **"Allow new users to sign up" OFF**, Confirm email OFF.
- Minimum password length 12.
- Rate limit default dibiarkan.

## 3. Login username + password

Supabase Auth berbasis email, jadi username dipetakan ke email sintetis:

```ts
// src/lib/supabase/auth.ts
export const USERNAME_RE = /^[a-z0-9._-]{3,32}$/;
export function usernameToEmail(username: string, domain: string): string | null {
  const u = username.trim().toLowerCase();
  return USERNAME_RE.test(u) ? `${u}@${domain}` : null;
}
```

- **Pembuatan akun admin (HUMAN):** Dashboard → Authentication → Add user → email `<username>@<VITE_ADMIN_EMAIL_DOMAIN>`, password ≥ 12 karakter, Auto Confirm ON. Setelah itu tambahkan baris di tabel `admins` (SQL di §4).
  - Jika dashboard menolak domain sintetis, berhenti dan tanyakan domain milik pengguna (`BLOCKED:` di Log).
- **Alur login:**
  1. Validasi lokal: username sesuai `USERNAME_RE` dan password tidak kosong. Bila gagal, tampilkan pesan "Username atau password salah" tanpa request ke server.
  2. `supabase.auth.signInWithPassword({ email, password })`.
  3. `supabase.rpc('is_admin')`. Bila `false`, jalankan `signOut()` dan tampilkan "Akun ini tidak punya akses admin".
  4. Sukses → navigasi ke `?next=` (hanya path yang diawali `/admin`) atau `/admin`.
- **Pesan error:**

  | Kondisi | Pesan |
  | --- | --- |
  | 400 / invalid credentials | "Username atau password salah" (tidak membedakan username tidak ada vs password salah) |
  | 429 | "Terlalu banyak percobaan. Coba lagi beberapa menit lagi." |
  | Jaringan / env kosong | "Tidak bisa terhubung ke server" / "CMS belum dikonfigurasi" |
- **Sesi:** `persistSession: true`, `storageKey: 'msz-admin-auth'`, auto refresh. Logout lewat tombol "Keluar" di header admin.
- **Guard:** `RequireAdmin` membungkus semua `/admin/*` kecuali `/admin/login`. Tanpa sesi admin → redirect `/admin/login?next=<path>`.
- **Tidak ada** tautan daftar, lupa password, login sosial, atau "ingat saya". Lupa password ditangani pemilik proyek lewat dashboard (reset manual).
- Tidak ada tautan ke `/admin` dari app anak.

## 4. Skema database (`project/supabase/migrations/0001_cms.sql`)

```sql
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
```

- `0002_seed.sql` di-generate oleh `project/scripts/gen-cms-seed.mjs` dari konten bawaan: objek + kata (content §2, §4.2, §4.3, dengan flag `countable`/`card_face`/`maze_goal` dari content §3/§7), 28 hijaiyyah (content §5), `speech_clips` (num 0–20 × id/en, letter a–z × id/en), dan `scene_audio` (semua ID di audio §2–§3).
- Semua `audio_id`/`image_id` bernilai `null` di seed. Media bawaan diimpor lewat tombol CMS (§6.7).
- Admin pertama: `insert into public.admins (user_id, username) values ('<uuid dari dashboard>', '<username>');`.

## 5. Path storage & aturan file

| Jenis | Path di bucket `media` | Format diterima | Batas |
| --- | --- | --- | --- |
| Gambar objek | `images/objects/<objectId>-<sha8>.<ext>` | `svg`, `png`, `webp` | ≤ 200 kB. Raster ≥ 240×240 px, rasio 1:1 ±10% |
| Speech kata | `audio/speech/<locale>/word-<word lowercase>-<sha8>.<ext>` | `mp3`, `wav`, `m4a` | ≤ 1 MB, durasi 0.2–4 s |
| Speech angka/huruf | `audio/speech/<locale>/<kind>-<key>-<sha8>.<ext>` | sama | sama |
| Hijaiyyah | `audio/speech/ar/hija-<id>-<sha8>.<ext>` | sama | sama |
| Musik | `audio/music/<id>-<sha8>.mp3` | `mp3` | ≤ 3 MB, 30–180 s |
| Ambient | `audio/ambient/<id>-<sha8>.mp3` | `mp3` | ≤ 1 MB |
| SFX | `audio/sfx/<id>-<sha8>.mp3` | `mp3`, `wav` | ≤ 300 kB, ≤ 3 s |

**Aturan upload:**
- `sha8` adalah 8 karakter pertama SHA-256 isi file (`crypto.subtle.digest`). Nama file selalu baru, sehingga cache bisa immutable (`cacheControl: '31536000'`).
- File dengan sha256 yang sama dengan baris `media` yang sudah ada tidak diunggah ulang; baris lama dipakai kembali.
- **Validasi SVG** (tolak bila ada): `<script`, atribut `on*=`, `<foreignObject`, `href`/`xlink:href` yang bukan `#…`, `<!ENTITY`. Gambar selalu ditampilkan lewat `<img>`, tidak pernah di-inline ke DOM.
- **Validasi audio:** decode dengan `AudioContext.decodeAudioData`. Gagal decode berarti file ditolak. Durasi dibaca dari buffer. Peak > −0.1 dBFS diberi peringatan "mungkin pecah" (tidak menolak).
- Kolom lisensi wajib diisi. Untuk `cc-by-4.0`, `author` + `source_url` wajib. Untuk `recorded-consent`, centang wajib: "Saya punya izin tertulis dari orang yang direkam / orang tuanya".

## 6. Halaman admin

Admin UI memakai **Bahasa Indonesia saja**, dengan teks di `src/admin/strings.ts`. Aturan i18n anak tidak berlaku. Target utama desktop/tablet ≥ 1024 px, dan tetap bisa dipakai di 768 px. Gaya mengikuti design §13 (Admin).

| Rute | Isi |
| --- | --- |
| `/admin/login` | §3 |
| `/admin` | Dasbor: kartu **Kelengkapan per game** (§7), versi terbit terakhir + waktu, jumlah perubahan sejak terbit, tombol ke Terbitkan |
| `/admin/objek` | Tabel objek: thumbnail, id, nama ID/EN, flag, aktif. Filter: "tanpa gambar", "nonaktif". Pencarian. Tombol "+ Objek baru" |
| `/admin/kata` | Tab ID / EN. Kolom: kata, objek (pemilih bergambar), Bunyi Awal ✓, Susun Kata ✓, audio (▶ / unggah / rekam), aktif |
| `/admin/hijaiyyah` | Grid 28 kartu: huruf besar (`lang=ar`), nama, ▶ putar, **Rekam** / **Unggah**, toggle "Bunyi sudah direview", toggle "Urutan tulis sudah direview" (+ tombol "Lihat animasi urutan tulis" dari glyph di kode), kolom nama peninjau |
| `/admin/suara` | Tab **Angka** (0–20 × ID/EN), **Huruf** (a–z × ID/EN), **Musik & efek** (daftar `scene_audio` dengan deskripsi brief dari audio §2–§3) |
| `/admin/terbitkan` | Ringkasan perubahan vs versi terakhir, validasi pra-terbit (§8), catatan, tombol **Terbitkan**. Riwayat versi dengan tombol **Jadikan aktif** (rollback) |

### 6.1 Form objek
- `id` (hanya saat baru; regex kebab-case, unik, tidak bisa diubah setelah disimpan).
- Nama ID dan EN.
- Gambar (uploader + pratinjau di atas 4 latar dunia).
- Centang "Bisa dihitung (G01)", "Wajah kartu (G08)", "Tujuan labirin (G09)", serta "Aktif".
- Menonaktifkan objek yang masih dipakai kata aktif → peringatan + daftar kata terkait (tidak diblokir).

### 6.2 Uploader media (komponen `MediaField`)
- Drag & drop atau pilih file. Validasi §5, lalu pratinjau (gambar / pemutar audio + durasi).
- Form lisensi.
- Tombol Simpan: upload ke storage → insert `media` → update FK baris induk.
- Progres upload ditampilkan. Bila gagal, file storage yang sudah terunggah dihapus kembali (best effort).

### 6.3 Perekam (komponen `VoiceRecorder`, untuk kata/angka/huruf/hijaiyyah)
1. Tombol **Rekam** (minta izin mikrofon) → hitung mundur 3-2-1 → rekam maksimal 4 detik, atau berhenti saat tombol **Stop** ditekan.
2. Proses otomatis di browser:
   - `MediaRecorder` → blob → `decodeAudioData`;
   - potong hening awal/akhir (ambang −40 dBFS, sisakan 30 ms di awal dan 120 ms di akhir);
   - normalisasi peak ke −1 dBFS;
   - resample mono 22.05 kHz via `OfflineAudioContext`;
   - encode **WAV PCM 16-bit** (encoder sendiri, tanpa dependensi).
3. Pratinjau ▶ dengan tombol **Ulangi** dan **Pakai rekaman ini**. Rekaman yang dipakai diunggah lewat `MediaField` dengan lisensi default `recorded-consent`.
4. Ukuran WAV 1 detik ≈ 44 kB (di bawah batas 1 MB).

### 6.4 Hijaiyyah
- Toggle "Bunyi sudah direview" hanya aktif bila audio ada. Mengaktifkannya meminta isian **nama peninjau** (disimpan di `reviewer`, `reviewed_at = now()`).
- Mengganti audio otomatis mereset `audio_reviewed = false`.
- "Urutan tulis sudah direview" berlaku untuk glyph di kode. Animasi urutan tulis diambil dari `src/content/glyphs/hijaiyyah.ts` lewat komponen yang sama dengan `/_kit`.

### 6.5 Konfirmasi dan state
- Semua aksi hapus/nonaktif/rollback memakai dialog konfirmasi.
- Simpan bersifat optimistik: tampilkan status "Tersimpan ✓" atau pesan error dari Supabase dalam bahasa manusia.
- Tabel memakai paginasi 50 baris.

### 6.6 Keamanan UI
- Tidak menampilkan error mentah SQL.
- Logout membersihkan cache query.
- Sesi kedaluwarsa → redirect ke login dengan `next`.

### 6.7 Impor media bawaan
- Tombol di dasbor: **"Impor media bawaan"**. Fungsinya: untuk setiap objek/klip/scene yang `image_id`/`audio_id`-nya null dan punya file bawaan di bundle (`src/assets/illustrations/objects/*.svg`, `public/audio/**`), ambil file lewat URL app → upload → isi FK (lisensi `project` untuk gambar AI v0; untuk audio, baca dari `public/audio/CREDITS.md`).
- Proses idempoten dan menampilkan laporan "N diimpor, M dilewati".

## 7. Aturan kelengkapan (dipakai CMS dan app anak)

Fungsi murni `src/lib/content/readiness.ts`, dipakai bersama oleh dasbor CMS dan app anak:

```ts
export interface Readiness { gameId: GameId; ready: boolean; perLevel: Record<DifficultyId, { have: number; need: number }>; missing: string[] }
export function computeReadiness(content: ResolvedContent, gameId: GameId, opts: { production: boolean }): Readiness;
```

Item **layak pakai** per game:

| Game | Item layak | Minimal per level |
| --- | --- | --- |
| G01 | objek `countable && active && image` | 4 objek |
| G02, G05 | glyph di kode (tidak bergantung CMS) + klip `num`/`letter` (production) | Jumlah ronde level |
| G03 | kata `use_spell && active`, panjang sesuai level, objek berimage, (production) audio kata | 6 kata per level per locale |
| G04 | kata `use_initial && active`, objek berimage, **audio kata wajib** | 8 kata per locale, ≥ 4 huruf awal berbeda |
| G06 | hijaiyyah `active && audio && audio_reviewed` dalam pool level | Mudah: 10 (semua pool), Sedang/Menantang: 12 |
| G07 | hijaiyyah `active && trace_reviewed` dalam grup level | Jumlah ronde level |
| G08 | objek `card_face && active && image` | 6 objek |
| G09 | objek `maze_goal && active && image` | 1 objek |

- Game hanya bisa dimainkan bila `catalog.status === 'ready'` **dan** `readiness.ready` untuk locale aktif.
- Bila belum siap, kartu game tampil sebagai "Segera hadir" (sama seperti `soon`).
- Pada `production: false` (DEV), syarat audio dilonggarkan karena ada fallback TTS.

## 8. Terbitkan (publish) & manifest

**Validasi pra-terbit** (berjalan di klien, memblokir tombol bila gagal):
- setiap `media` yang direferensikan ada;
- kata aktif menunjuk objek aktif;
- tidak ada duplikat `locale+word`;
- semua hijaiyyah `audio_reviewed` punya reviewer.

Peringatan (tidak memblokir): game yang menjadi tidak siap dibanding versi terbit sebelumnya.

**Langkah terbit:**
1. Baca semua tabel.
2. Bangun `Manifest` (skema di bawah).
3. Hitung `counts`.
4. Insert `publications` → dapat `version`.
5. Upload `manifests/manifest-<version>.json` ke bucket `content` (`cacheControl: '31536000'`, `upsert: false`).
6. Upload `latest.json` = `{ "schemaVersion": 1, "version": <v>, "manifest": "manifests/manifest-<v>.json" }` (`cacheControl: '60'`, `upsert: true`).

Jika langkah 5 atau 6 gagal, tampilkan error dan biarkan baris publikasi tetap ada. Tombol "Ulangi unggah" memakai versi yang sama.

**Rollback:** upload ulang `latest.json` yang menunjuk manifest versi lama.

```ts
// src/lib/content/manifest.ts
export interface ManifestV1 {
  schemaVersion: 1;
  version: number;
  publishedAt: string;                     // ISO
  mediaBase: string;                       // `${VITE_CONTENT_BASE_URL}/media/`
  objects: { id: string; name: { id: string; en: string }; image: string | null;
             countable: boolean; cardFace: boolean; mazeGoal: boolean }[];
  words: { locale: 'id' | 'en'; word: string; objectId: string; initial: boolean; spell: boolean; audio: string | null }[];
  hijaiyyah: { id: HijaiyyahId; audio: string | null; audioReviewed: boolean; traceReviewed: boolean }[];
  speech: { kind: 'num' | 'letter'; locale: 'id' | 'en'; key: string; audio: string | null }[];
  sceneAudio: { id: string; audio: string | null }[];  // 'music:home' dst.
  credits: { path: string; license: string; author: string | null; sourceUrl: string | null }[];
}
export function parseManifest(raw: unknown): ManifestV1 | null; // validator manual, tanpa library
```

- Hanya item `active` yang masuk manifest.
- `image`/`audio` adalah path relatif bucket `media`. URL lengkapnya `mediaBase + path`.

## 9. Pemuatan konten di app anak (`src/lib/content/`)

| File | Isi |
| --- | --- |
| `defaults.ts` | Konten bawaan, dibangun dari `src/content/*` dalam bentuk `ResolvedContent` (URL gambar bundle, URL `public/audio`) |
| `loader.ts` | `loadContent(): Promise<{ content: ResolvedContent; source: 'cms' \| 'cache' \| 'bundled' }>` |
| `ContentProvider.tsx` + `useContent.ts` | Menyediakan `content` + `readiness` ke seluruh app |

**Algoritma `loadContent`:**
1. Jika `VITE_CONTENT_BASE_URL` kosong → `bundled`.
2. `fetch(`${base}/content/latest.json`, { cache: 'no-cache' })` dengan timeout 2.5 s, lalu `fetch` manifest (cache default).
3. `parseManifest` valid → simpan ke `localStorage['msz:content-cache']` (`{ version, manifest }`) → `resolve(manifest)` → `cms`.
4. Gagal di langkah mana pun → jika cache valid → `cache`, selain itu `bundled`.

`resolve(manifest)`: **manifest berlaku penuh** sebagai snapshot lengkap (database di-seed dari konten bawaan). Pengecualiannya: bila `image`/`audio` null dan ada file bawaan untuk ID yang sama, pakai file bawaan.

Lain-lain:
- Splash menunggu `loadContent` (dihitung dalam timeout Splash 3 s). Konten tidak di-reload selama sesi. Perubahan baru berlaku setelah app dibuka ulang.
- Gambar objek dirender `<img src={url} alt={name}>` dengan `loading="eager"` untuk ronde aktif. Preload gambar ronde sesi dilakukan saat Play memuat.
- **Privasi:** request ke Supabase dari app anak hanya GET file publik, tanpa cookie/identitas. Tidak ada analitik.

## 10. Pengujian

| Area | Tes |
| --- | --- |
| Unit | `usernameToEmail`, validator SVG, validator file (mime/ukuran/durasi via mock), encoder WAV (header RIFF benar, panjang data), trim/normalize (buffer sintetis), `parseManifest` (valid, versi salah, field hilang), `resolve` (fallback media bawaan), `computeReadiness` (setiap baris tabel §7), `loadContent` (cms/cache/bundled dengan `fetch` mock + timeout) |
| E2E (Playwright, route intercept) | Login: username invalid → pesan lokal tanpa request; 400 → "salah"; 429 → pesan rate limit; sukses + `is_admin=false` → ditolak; sukses → `/admin`. Guard: `/admin/objek` tanpa sesi → login dengan `next`. App anak: `latest.json` 404 → konten bawaan; manifest valid → kata baru dari manifest muncul di G04 |
| Integrasi (opsional, Supabase lokal via `supabase start`) | RLS: anon tidak bisa select/insert tabel; user non-admin ditolak; admin bisa CRUD; storage anon tidak bisa upload |
