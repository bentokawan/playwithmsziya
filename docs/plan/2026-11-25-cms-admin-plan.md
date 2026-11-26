# CMS & Login Admin Plan

- Tanggal: 2026-11-25
- Status: **in-progress** — Seluruh task AI C0.2–C7.5 selesai; tersisa task manusia/opsional (C0.1, C7.1, C7.4)
- Spesifikasi (wajib dibaca): [specs/cms.md](../specs/cms.md)
- Terkait:
  - [plan redesign v2.1](2026-11-25-paud-redesign-plan.md) — aturan eksekusi §0 berlaku penuh di sini
  - [content](../specs/content.md), [audio](../specs/audio.md), [design §13](../design.md#13-admin-cms), [architecture](../architecture.md)
- Tujuan:
  - Gambar objek dan suara (terutama hijaiyyah) bisa diisi, diganti, direkam, direview, dan diterbitkan oleh admin **tanpa mengubah kode**.
  - Login admin hanya berisi username + password.
  - App anak tetap tanpa akun dan tetap berjalan tanpa CMS.

## 0. Aturan

1. Semua aturan §0 [plan redesign](2026-11-25-paud-redesign-plan.md#0-cara-mengeksekusi-plan-ini-wajib-dibaca-ai-pelaksana) berlaku: urutan task, gerbang kualitas, Log, larangan commit/dependensi tanpa izin, dan `BLOCKED:`.
2. Log eksekusi plan ini ditulis di §6 file ini.
3. **Keamanan**, tanpa pengecualian:
   - tidak ada `service_role` key di repo/klien;
   - RLS aktif di semua tabel;
   - `@supabase/supabase-js` tidak boleh ter-bundle di chunk app anak (diverifikasi di C7.3);
   - tidak ada data anak yang dikirim ke server.
4. Task bertanda **HUMAN** butuh akses dashboard Supabase milik pengguna. AI boleh memakai Supabase MCP/CLI **hanya** jika pengguna mengizinkan eksplisit di percakapan, dan izin itu harus dicatat di Log.
5. Dependensi yang diizinkan untuk plan ini: `@supabase/supabase-js` (runtime, hanya admin) dan `supabase` CLI (dev, opsional untuk C7.4).

## 1. Integrasi dengan plan redesign

| Task CMS | Bergantung pada (redesign) | Mengubah/menjadi prasyarat untuk |
| --- | --- | --- |
| C1 (lapisan konten anak) | T1.6, T1.7, T1.8 | **Semua game Fase 5 wajib membaca konten lewat `useContent()`**, bukan import statis `src/content/*` |
| C2 (Supabase & skema) | T0.1 | — |
| C3 (login + guard) | T1.9, T2.4 | — |
| C4–C6 (halaman admin, terbitkan) | C2, C3, T2.4 | T6.3 & T6.4 (audio/hijaiyyah) dikerjakan lewat CMS |
| C7 (QA) | T7.1 | T7.8 rilis |

**Urutan yang disarankan:**
1. T1.1–T1.9
2. **C1**
3. Fase 2–4 redesign ‖ C2–C3
4. Fase 5 redesign ‖ C4–C6
5. Fase 6–7 redesign + C7

## 2. Task

### C0 — Persiapan

- [ ] **C0.1 — HUMAN: Buat proyek Supabase.** ⏸ _`.env.local` sudah berisi URL/anon key dan `supabase/migrations` ada, jadi proyek tampaknya sudah dibuat; belum dicentang karena Log belum mencatat region, signup OFF, dan domain admin._
  - *Langkah:*
    1. Buat proyek (region `ap-southeast-1`) dan atur Auth sesuai [cms §2](../specs/cms.md#2-konfigurasi--lingkungan): signup OFF, confirm OFF, password minimal 12.
    2. Coba buat user `<username>@admin.playwithmsziya.local`. Jika ditolak, catat `BLOCKED:` dan pilih domain lain milik pengguna.
    3. Berikan `URL` + `anon key` ke AI lewat `.env.local` (jangan ditempel di chat publik).
  - *Selesai jika:* Log mencatat region, status signup OFF, dan domain email admin.

- [x] **C0.2 — Env & guard bundle.**
  - *Bergantung pada:* T1.9
  - *File:*
    - `project/.env.example` (4 variabel cms §2, nilai kosong + komentar)
    - `project/src/lib/env.ts` (`readEnv()` → objek bertipe; nilai kosong → `null`, tanpa throw)
    - `project/src/vite-env.d.ts` (tipe `ImportMetaEnv`)
    - `eslint.config.js`
  - *ESLint:* tambahkan `no-restricted-imports` untuk path `@supabase/supabase-js` di semua file kecuali `src/admin/**` dan `src/lib/supabase/**`.
  - *Verifikasi:* `git check-ignore project/.env.local` mengembalikan path (berarti diabaikan). Import uji coba supabase di `src/pages/` membuat lint gagal; hapus import uji itu setelahnya.

### C1 — Lapisan konten di app anak (tanpa Supabase)

- [x] **C1.1 — Tipe & konten bawaan.**
  - *Bergantung pada:* T1.6
  - *File:* `src/lib/content/types.ts` (`ResolvedContent`), `defaults.ts`, `defaults.test.ts`
  - *Isi:*
    ```ts
    export interface ResolvedObject { id: string; name: { id: string; en: string }; imageUrl: string | null; countable: boolean; cardFace: boolean; mazeGoal: boolean }
    export interface ResolvedWord { locale: Locale; word: string; objectId: string; initial: boolean; spell: boolean; audioUrl: string | null }
    export interface ResolvedHijaiyyah { id: HijaiyyahId; char: string; family: string; traceGroup: DifficultyId; audioUrl: string | null; audioReviewed: boolean; traceReviewed: boolean }
    export interface ResolvedContent {
      version: number | null; source: 'cms' | 'cache' | 'bundled';
      objects: Map<string, ResolvedObject>; words: ResolvedWord[]; hijaiyyah: Map<HijaiyyahId, ResolvedHijaiyyah>;
      speechUrl(clip: SpeechClip): string | null;      // num/letter/word/hija
      sceneAudioUrl(id: `${'music'|'ambient'|'sfx'}:${string}`): string | null;
      credits: ManifestV1['credits'];
    }
    ```
  - *Konten bawaan:*
    - flag `countable`/`cardFace`/`mazeGoal` diturunkan dari content §3/§7;
    - URL gambar dari `objects/index.ts`;
    - URL audio = path `public/audio` hanya bila terdaftar di `public/audio/bundled.json`. File ini di-generate oleh `npm run audio:check -- --write-index` sebagai daftar file yang benar-benar ada, karena keberadaan file tidak bisa dicek di runtime tanpa request;
    - hijaiyyah bawaan: `audioReviewed`/`traceReviewed` = `false`.
  - *Tes:* jumlah objek/kata/hijaiyyah sesuai content, flag benar.

- [x] **C1.2 — Manifest parser, resolver, readiness.**
  - *Bergantung pada:* C1.1
  - *File:* `src/lib/content/manifest.ts` (+test), `resolve.ts` (+test), `readiness.ts` (+test)
  - *Langkah:* implementasikan sesuai [cms §7–§9](../specs/cms.md#7-aturan-kelengkapan-dipakai-cms-dan-app-anak).
  - *Tes:* semua baris tabel §7, fallback media bawaan, serta manifest dengan objek baru `id` yang tidak ada di bundle.

- [x] **C1.3 — Loader + Provider + integrasi.**
  - *Bergantung pada:* C1.2, T1.8
  - *File:* `src/lib/content/loader.ts` (+test dengan `fetch` mock, timeout memakai fake timers), `ContentProvider.tsx`, `useContent.ts`
  - *Langkah:*
    1. Bungkus app dengan `ContentProvider` (di dalam `PreferencesProvider`).
    2. Splash menunggu konten.
    3. `AudioManager` me-resolve URL lewat `content.sceneAudioUrl`/`speechUrl` (ganti pemakaian langsung `manifest.ts` untuk path). URL null → perilaku "file hilang" ([audio §4](../specs/audio.md#4-klip-bicara-speech)).
    4. `catalog` + `readiness` menentukan kartu `ready`/`soon` di World/Intro.
  - *Selesai jika:*
    - tanpa env → `source: 'bundled'` dan app berjalan seperti sebelumnya;
    - dengan `latest.json` tiruan (letakkan sementara di `public/` dan arahkan base URL ke dev server) → `source: 'cms'`.

- [x] **C1.4 — Aturan untuk game.**
  - *Bergantung pada:* C1.3
  - *Langkah:*
    1. Perbarui `GameModule.createRounds` menjadi `createRounds(config, content: ResolvedContent)` di `src/games/types.ts` dan di plan redesign §3.3 (dokumen sudah disesuaikan).
    2. Semua pool item diambil dari `content` dan hanya item **layak** (readiness §7).
    3. Gambar objek dirender lewat komponen `ObjectImage({ objectId })`, yang memakai `content.objects.get(id).imageUrl` dan placeholder lingkaran `--sky-100` bila null.
  - *Selesai jika:* `grep -rn "content/words\|content/objects" project/src/games` kosong (game tidak meng-import konten statis langsung).

### C2 — Supabase: skema, seed, klien

- [x] **C2.1 — Migrasi SQL.**
  - *Bergantung pada:* C0.1
  - *File:* `project/supabase/migrations/0001_cms.sql`, isinya **persis** [cms §4](../specs/cms.md#4-skema-database-projectsupabasemigrations0001_cmssql).
  - *Langkah:* HUMAN atau AI (dengan izin) menjalankannya di SQL Editor/CLI, lalu Log mencatat bahwa migrasi sukses.

- [x] **C2.2 — Generator seed.**
  - *Bergantung pada:* C1.1, C2.1
  - *File:* `project/scripts/gen-cms-seed.mjs` → menulis `project/supabase/migrations/0002_seed.sql`
  - *Langkah:*
    1. Script membaca data dari `src/content/*.ts` dengan regex/eval aman. Lebih disarankan: ekspor tambahan `src/content/seed-data.json` yang di-generate oleh tes Vitest `defaults.test.ts` dengan flag `WRITE_SEED=1`.
    2. Setiap SQL memakai `insert … on conflict do nothing`.
    3. Tambahkan script npm `"cms:seed": "node scripts/gen-cms-seed.mjs"`.
  - *Verifikasi:* script mencetak jumlah baris per tabel, dan angka itu harus sama dengan hasil `select count(*)` setelah seed dijalankan. Angka tetap yang wajib cocok:
    - `hijaiyyah` = 28
    - `speech_clips` = 94 (21×2 angka + 26×2 huruf)
    - `scene_audio` = 27 (6 music + 4 ambient + 17 sfx)

    Kata yang dipakai di Bunyi Awal dan Susun Kata sekaligus menjadi **satu baris** dengan kedua flag aktif. Jumlah objek dan kata dicatat di Log.

- [x] **C2.3 — Klien Supabase.**
  - *Bergantung pada:* C0.2
  - *Langkah:*
    1. `npm i @supabase/supabase-js`.
    2. Buat `src/lib/supabase/client.ts`: `getSupabase()` (lazy singleton, `null` bila env kosong, opsi auth dari cms §3).
    3. Buat `src/lib/supabase/auth.ts` (`usernameToEmail`, `signIn(username, password)` → `{ ok: true } | { ok: false; reason: 'invalid' | 'not-admin' | 'rate-limit' | 'network' | 'not-configured' }`, `signOut`, `useAdminSession`).
    4. Buat `src/lib/supabase/db.ts`: fungsi bertipe per tabel (`listObjects`, `upsertObject`, …) yang mengembalikan `{ data } | { error: string }` dengan pesan Indonesia.
    5. Buat `src/lib/supabase/types.ts`. Jika CLI tersedia: `supabase gen types typescript`. Jika tidak, tulis manual sesuai skema.
  - *Tes:* `usernameToEmail`, dan pemetaan error (`AuthApiError` status 400/429, `TypeError` network) ke `reason`.

### C3 — Login & kerangka admin

- [x] **C3.1 — Halaman `/admin/login`.**
  - *Bergantung pada:* C2.3, T2.4
  - *File:* `src/admin/pages/LoginPage.tsx` + `.module.css`
  - *UI:* kartu putih di tengah, logo kecil, judul "Masuk Admin", dan **hanya**:
    - input `Username` (`autocomplete="username"`, `autocapitalize="none"`, `spellcheck=false`);
    - input `Password` (`type=password`, `autocomplete="current-password"`, tombol ikon tampilkan/sembunyikan);
    - tombol **Masuk** (`type=submit`, state loading, disabled saat loading).
  - *Pesan:* area pesan `role="alert"` dengan teks dari cms §3.
  - *Perilaku:* Enter = submit. Setelah gagal, fokus kembali ke password dan password dikosongkan. Sudah login → redirect `/admin`.
  - *Larangan:* tidak ada tautan lain.
  - *Selesai jika:* E2E C7.2 skenario login lulus (bisa dikerjakan setelah T7.1; sebelum itu uji manual dengan akun HUMAN).

- [x] **C3.2 — Guard & layout admin.**
  - *Bergantung pada:* C3.1
  - *File:* `src/admin/AdminRoutes.tsx` (lazy dari `app/routes.tsx` untuk path `/admin/*`), `RequireAdmin.tsx`, `AdminLayout.tsx` (sidebar: Dasbor, Objek, Kata, Hijaiyyah, Suara, Terbitkan; header: nama admin + Keluar), `src/admin/strings.ts`
  - *Rute anak:* rute `/admin/*` tidak memakai `Scene`, musik, atau `TopNav` anak. Panggil `audio.setScene({ music: null, ambient: null })` saat masuk.
  - *Env kosong:* semua `/admin/*` menampilkan "CMS belum dikonfigurasi" + daftar variabel env yang hilang.
  - *Selesai jika:* tanpa sesi → redirect login dengan `next`. Logout → kembali ke login.

### C4 — Komponen media

- [x] **C4.1 — Validator file.**
  - *Bergantung pada:* C2.3
  - *File:* `src/admin/media/validate.ts` (+test)
  - *Langkah:* aturan [cms §5](../specs/cms.md#5-path-storage--aturan-file) per jenis. Kembalikan `{ ok, errors: string[], warnings: string[], meta: { mime, bytes, sha256, durationMs?, width?, height? } }`.

- [x] **C4.2 — `MediaField` + upload.**
  - *Bergantung pada:* C4.1
  - *File:* `src/admin/media/MediaField.tsx`, `upload.ts`
  - *Langkah:* alur [cms §6.2](../specs/cms.md#62-uploader-media-komponen-mediafield), dedup sha256, form lisensi dengan validasi kondisional, dan rollback upload saat insert gagal.

- [x] **C4.3 — `VoiceRecorder`.**
  - *Bergantung pada:* C4.2
  - *File:* `src/admin/media/VoiceRecorder.tsx`, `audioProcess.ts` (+test: trim, normalize, resample dengan buffer sintetis), `wav.ts` (+test header)
  - *Langkah:* alur [cms §6.3](../specs/cms.md#63-perekam-komponen-voicerecorder-untuk-kataangkahurufhijaiyyah). Uji manual di Chrome dan Safari (Log). Tangani penolakan izin mikrofon dengan pesan "Izinkan mikrofon di pengaturan browser".

### C5 — Halaman konten

- [x] **C5.1 — Objek** (`/admin/objek`).
  - *Bergantung pada:* C4.2
  - *Langkah:* sesuai cms §6 + §6.1. Pratinjau di 4 latar memakai `worlds/*/Background` (variant `home-door`).
- [x] **C5.2 — Kata** (`/admin/kata`).
  - *Bergantung pada:* C5.1, C4.3
  - *Validasi:* kata `^[A-Z]{2,8}$` (input otomatis diubah ke kapital); Susun Kata hanya untuk panjang 3–5 (beri peringatan bila di luar).
- [x] **C5.3 — Hijaiyyah** (`/admin/hijaiyyah`).
  - *Bergantung pada:* C4.3, T5.11 (glyph untuk animasi; sebelum ada, tombol animasi disembunyikan)
  - *Langkah:* sesuai cms §6.4.
- [x] **C5.4 — Suara** (`/admin/suara`).
  - *Bergantung pada:* C4.3
  - *Langkah:* tiga tab sesuai cms §6. Deskripsi brief untuk musik/SFX diambil dari tabel di `src/admin/strings.ts` (salin dari audio §2–§3).

### C6 — Dasbor, impor, terbitkan

- [x] **C6.1 — Dasbor** (`/admin`).
  - *Bergantung pada:* C1.2, C5.1
  - *Langkah:* kartu kelengkapan per game (pakai `computeReadiness` dengan `production: true` atas data tabel → `ResolvedContent` sementara), versi terbit terakhir, dan jumlah baris yang `updated_at` > waktu terbit terakhir.
- [x] **C6.2 — Impor media bawaan.**
  - *Bergantung pada:* C6.1, C4.2
  - *Langkah:* sesuai cms §6.7. Idempoten (jalankan 2× → kali kedua "0 diimpor").
- [x] **C6.3 — Terbitkan & rollback** (`/admin/terbitkan`).
  - *Bergantung pada:* C6.1
  - *Langkah:* sesuai [cms §8](../specs/cms.md#8-terbitkan-publish--manifest). Builder manifest berupa fungsi murni `buildManifest(rows) → ManifestV1` (+test, roundtrip dengan `parseManifest`).
  - *Selesai jika:* setelah terbit, app anak (reload) menampilkan `source: 'cms'` (tampilkan di `/_kit` atau console DEV) dan objek/kata baru muncul. Rollback mengembalikan versi lama setelah reload.

### C7 — QA & dokumen

- [ ] **C7.1 — HUMAN: Isi hijaiyyah.**
  - *Langkah:* pengisi suara dan ustadz/ustadzah merekam/mengunggah 28 bunyi di `/admin/hijaiyyah`, mereview, mengisi nama peninjau, lalu menerbitkan.
  - *Hasil:* menggantikan T6.4 redesign. Log redesign mencatat tanggal review.
- [x] **C7.2 — E2E admin & konten.**
  - *Bergantung pada:* T7.1, C3, C6
  - *File:* `e2e/admin.spec.ts`, `e2e/content.spec.ts`
  - *Langkah:* skenario [cms §10](../specs/cms.md#10-pengujian), dengan `page.route` meng-intercept `**/auth/v1/**`, `**/rest/v1/**`, dan `**/storage/v1/**`.
- [x] **C7.3 — Audit bundle.**
  - *Bergantung pada:* C3
  - *Langkah:* `npm run build`, lalu `grep -l "supabase" project/dist/assets/*.js` → hanya chunk admin. Chunk entry/Home tidak mengandung string `supabase.co`. Ukuran chunk admin dicatat (tanpa batas keras, target ≤ 120 kB gzip).
- [ ] **C7.4 — Uji RLS (opsional, bila Docker tersedia).**
  - *Langkah:* `supabase start` lalu jalankan `supabase/tests/rls.sql`: anon tidak bisa select/insert, non-admin ditolak, admin bisa. Bila Docker tidak tersedia, uji manual di proyek nyata dengan akun non-admin sementara (HUMAN), lalu catat di Log.
- [x] **C7.5 — Sinkron dokumen.**
  - *Langkah:* perbarui architecture (status aktual CMS), PRD (status), dan Log kedua plan.

## 3. Peta ketergantungan

```text
T1.6,T1.7,T1.8 → C1.1 → C1.2 → C1.3 → C1.4 → (Fase 5 redesign)
C0.1(HUMAN) → C2.1 → C2.2
T1.9 → C0.2 → C2.3 → C3.1 → C3.2
C2.3 → C4.1 → C4.2 → C4.3
C4.2 → C5.1 → C5.2 ; C4.3 → C5.3 ; C4.3 → C5.4
C1.2 + C5.1 → C6.1 → C6.2 ; C6.3
C6.3 → C7.1(HUMAN) ; T7.1 → C7.2 ; C7.3 ; C7.4 ; C7.5
```

## 4. Risiko

| Risiko | Mitigasi |
| --- | --- |
| Supabase menolak email domain sintetis | Dicek paling awal di C0.1. Bila ditolak, pakai domain milik pengguna (`BLOCKED:`) |
| Anon key bocor dianggap rahasia | Anon key memang publik. Keamanan ada di RLS (C7.4). `service_role` tidak pernah dipakai |
| Admin menerbitkan konten rusak | Validasi pra-terbit, `parseManifest` di klien (manifest invalid → cache/bawaan), rollback 1 klik |
| Supabase down / free tier di-pause | App anak memakai cache/bawaan, sehingga tidak ada fitur anak yang bergantung pada server |
| Rekaman jelek (noise) | Pratinjau wajib sebelum dipakai, trim/normalize otomatis, review hijaiyyah oleh peninjau |
| Upload file berbahaya (SVG) | Validasi SVG + render hanya via `<img>` + hanya admin yang bisa upload |
| Bundle anak membengkak | Lint `no-restricted-imports` + audit C7.3 |

**Rollback kode:** per task (`git revert`). Rollback konten: tombol "Jadikan aktif" pada versi lama. Rollback skema: migrasi baru (jangan mengedit migrasi yang sudah dijalankan).

## 5. Di luar cakupan

- Akun orang tua/anak, sinkronisasi progres/stiker ke cloud.
- Multi-role (editor vs reviewer).
- Edit glyph/jalur tulis, parameter level, atau teks UI lewat CMS.
- Pembersihan otomatis file media yatim.
- Edge Function, notifikasi, analitik.

## 6. Log eksekusi

| Tanggal | Task | Hasil verifikasi | Catatan |
| --- | --- | --- | --- |
| 2026-11-25 | — | — | Plan dibuat. Keputusan: login admin saja, Supabase, CMS media + konten item |
| 2026-11-25 | C0.2 | `git check-ignore project/.env.local` OK · lint 0 | Pengguna mengizinkan pemakaian `supabase_mcp` (project `jtxrtzrcclexjargoqzc`) untuk C2.1–C2.2. `.env` dipindahkan ke `.env.local` tanpa `service_role`. `.env.example`, `lib/env.ts`, `vite-env.d.ts`, dan ESLint `no-restricted-imports` ditambahkan |
| 2026-11-25 | C1.1–C1.4 | lint 0 · test 45/45 · build lulus · grep `src/games` 0 | Konten bawaan (71 objek, 75 kata, 28 hijaiyyah), `parseManifest`, `resolveManifest`, `computeReadiness`, `loadContent` (timeout + cache), `ContentProvider` terhubung ke `AudioProvider`, dan komponen `ObjectImage` |
| 2026-11-25 | C2.1–C2.2 | Migrasi & seed sukses via `supabase_mcp` (`jtxrtzrcclexjargoqzc`) | `0001_cms.sql` (8 tabel + RLS + 2 bucket storage) & `0002_seed.sql` via `npm run cms:seed`: `objects`=71, `words`=75, `hijaiyyah`=28, `speech_clips`=94, `scene_audio`=27 |
| 2026-11-25 | C2.3 | lint 0 · test 47/47 · build lulus | `src/lib/supabase/{client,auth,db,types}.ts` + `auth.test.ts`; `@supabase/supabase-js` tetap terisolasi di `src/lib/supabase/**` |
| 2026-11-25 | C3.1–C3.2 | lint 0 · test 49/49 · build lulus · `supabase` hanya di chunk `AdminRoutes` | `/admin/login` (username + password saja), `RequireAdmin`, `AdminLayout`, `AdminRoutes` lazy-loaded dari `routes.tsx`, dan state env kosong |
| 2026-11-25 | C4.1–C4.3 | lint 0 · test 61/61 (`validate`, `wav`, `audioProcess` lulus) · build lulus | Validator file + SVG, `upload.ts` (dedup sha256 + rollback), `MediaField`, `VoiceRecorder` (3-2-1, trim/normalize/resample 22.05 kHz, WAV PCM 16-bit) |
| 2026-11-25 | C5.1–C6.3 | lint 0 · test 61/61 (`buildManifest` roundtrip lulus) · build lulus | Halaman `/admin/objek`, `/admin/kata`, `/admin/hijaiyyah`, `/admin/suara`, `/admin` (dasbor readiness + impor bawaan), dan `/admin/terbitkan` (publish + rollback) |
| 2026-11-26 | C7.2, C7.3, C7.5 | E2E `admin` + `content` 10/10 lulus (Chromium + WebKit) · `AdminRoutes` 71.38 kB gzip (≤ 120 kB) | `contentEnv.ts` memisahkan `VITE_CONTENT_BASE_URL` dari `lib/env.ts` sehingga `@supabase/supabase-js` & `VITE_SUPABASE_ANON_KEY` 100% terisolasi di chunk `AdminRoutes` (di `index` hanya ada URL publik bucket `VITE_CONTENT_BASE_URL`). Dokumen disinkronkan; `C7.1` (HUMAN) & `C7.4` (Docker/manual) tetap `[ ]` |
