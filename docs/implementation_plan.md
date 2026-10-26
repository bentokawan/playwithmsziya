# 📋 Implementation Plan — Play with Ms zia

> Dokumen ini adalah panduan step-by-step pengerjaan proyek **Play with Ms zia** dari nol hingga siap rilis. Setiap fase memiliki langkah-langkah detail, deliverables, dan kriteria selesai.

---

## Fase 0 · UI/UX Design (Design First)

> [!IMPORTANT]
> **Design sebelum kode.** Seluruh visual dan alur pengguna harus dirancang, diiterasi, dan disetujui di tahap ini sebelum satu baris kode pun ditulis. Pendekatan "Design First" memastikan konsistensi visual, mengurangi revisi di fase development, dan memberikan panduan yang jelas bagi developer.

### 0.1 Riset & Moodboard

- [x] Kumpulkan referensi visual aplikasi edukasi anak yang **clean, minimalist, dan modern**:
  - Headspace for Kids (ketenangan, whitespace, warna lembut)\
  - Desain anak-anak bergaya Skandinavia (sederhana, fungsional, hangat)
  - **JANGAN** mengacu pada gaya visual kids game yang ramai/berantakan (chunky borders, warna neon, elemen dekoratif bertaburan)
- [x] Buat moodboard di Figma:
  - Gaya visual: clean minimalist dengan sentuhan playful yang halus
  - Palet warna: lembut, pastel, banyak white space, latar netral hangat
  - Tipografi: rounded, mudah dibaca anak-anak, tanpa outline/stroke berlebihan
  - Ikonografi: sederhana, garis tipis, flat minimal, mudah dipahami
- [x] Tentukan design principles proyek:
  - **Clean:** bersih, lega, fokus pada konten, latar polos tanpa pola dekoratif
  - **Minimalist:** elemen seminimal mungkin, setiap elemen punya tujuan jelas
  - **Simple:** mudah dipahami anak 4-6 tahun dalam 3 detik pertama
  - **Child-friendly:** warna lembut, bentuk rounded, ukuran besar, shadow halus
- [x] Review & approval moodboard oleh stakeholder

### 0.2 Design System di Figma

- [x] Buat Figma project "Play with Ms zia - Design System"
- [x] Definisikan **Color Tokens:**
  - Primary, secondary, accent
  - Semantic colors (success, warning, info)
  - Background colors (neutral, warm)
  - Kategori game: Angka (biru), Huruf (karang), Hijaiyyah (tosca), Ingat & Main (lembayung)
- [x] Definisikan **Typography Scale:**
  - Heading 1-3 (Fredoka / Baloo 2)
  - Body, caption (Nunito)
  - Arabic (Noto Naskh Arabic / Scheherazade New)
  - Ukuran minimum untuk keterbacaan anak
- [x] Definisikan **Spacing & Grid System:**
  - Base unit: 8px grid
  - Padding, margin, gap yang konsisten
  - Layout grid untuk landscape 1280x720
- [x] Definisikan **Component Library:**
  - Tombol (primary, secondary, icon-only, ukuran anak)
  - Kartu game
  - Bintang rating (terisi / kosong)
  - Input fields
  - Balon ucapan (speech bubble)
  - Progress bar / loading bar
  - Badge, chip, tag
  - Navigasi bar, status bar
- [x] Definisikan **Icon Set:**
  - Home, speaker, fullscreen, ulang, panah, gear, lock
  - Konsisten: outline style, stroke width seragam
- [x] Definisikan **Elevation & Shadow:**
  - Level shadow untuk komponen (flat -> raised -> floating)
- [x] Definisikan **Motion & Animation Guidelines:**
  - Durasi transisi standar (150ms, 300ms, 500ms)
  - Easing curves
  - Panduan animasi feedback (benar/salah)
- [x] Dokumentasikan semua tokens dalam halaman "Design Tokens" di Figma

### 0.3 Wireframe (Low-Fidelity) di Stitch / Figma

- Buat wireframe untuk setiap layar sesuai `docs/page.md`:
  [x] Halaman 01: Layar Muat / Preload
  [x] Halaman 02: Pilih Bahasa
  [x] Halaman 03: Menu Utama / Beranda (Home)
  [x] Halaman 04: Pilih Level Kesulitan
  [x] Halaman 05: Layar Mulai / Ready Stage
  [x] Halaman 06: Arena Bermain — Mode 1 Pemain
  [ ] Halaman 07: Arena Bermain — Mode 2 Pemain (Duel Split-Screen)
  [x] Halaman 08: Layar Hasil & Bintang (Result)
  [ ] Halaman 09: Modal Gerbang Orang Tua (Parental Gate)
  [ ] Halaman 10: Dasbor Orang Tua & Pengaturan
  [ ] Halaman 11: Profil Anak & Ringkasan Kemajuan
  [ ] Halaman 12: Kebijakan Privasi & Ketentuan
  [x] Layar Khusus: Panduan Rotasi Layar Lanskap (Orientation Guard)
- [ ] Tentukan alur navigasi antar layar (user flow diagram) — referensi diagram di `docs/page.md` §1
- [ ] Tentukan hierarki informasi per layar
- [ ] Review & iterasi wireframe dengan stakeholder
- [ ] Approval wireframe sebelum lanjut ke high-fidelity

### 0.4 Prototyping (High-Fidelity) di Stitch

- [x] Generate desain high-fidelity di **Stitch (stitch.google)** menggunakan prompt terstruktur per halaman:
  - **Halaman 01:** Layar Muat / Preload (lihat `docs/prompt_preload_stitch.md`)
  - **Halaman 02:** Pilih Bahasa (lihat `docs/prompt_language_stitch.md`)
  - **Halaman 03:** Menu Utama / Beranda (lihat `docs/prompt_home_stitch.md`)
  - **Halaman 04:** Pilih Level Kesulitan (lihat `docs/prompt_level_stitch.md`)
  - **Halaman 05:** Layar Mulai / Ready Stage (lihat `docs/prompt_ready_stitch.md`)
  - **Halaman 06:** Arena Bermain 1 Pemain (lihat `docs/prompt_gameplay_1p_stitch.md`)
  - **Halaman 07:** Arena Duel Split-Screen 2 Pemain (lihat `docs/prompt_gameplay_2p_stitch.md`)
  - **Halaman 08:** Layar Hasil & Bintang (lihat `docs/prompt_result_stitch.md`)
  - **Halaman 09:** Modal Gerbang Orang Tua (lihat `docs/prompt_parentgate_stitch.md`)
  - **Halaman 10:** Dasbor Orang Tua & Pengaturan (lihat `docs/prompt_parent_dashboard_stitch.md`)
  - **Halaman 11:** Profil Anak & Ringkasan Kemajuan (lihat `docs/prompt_progress_stitch.md`)
  - **Halaman 12:** Kebijakan Privasi & Ketentuan (lihat `docs/prompt_privacy_stitch.md`)
  - **Layar Khusus:** Panduan Rotasi Layar Lanskap (lihat `docs/prompt_orientation_stitch.md`)
- [x] Pastikan setiap prompt mengacu konsep **clean, minimalist, simple** sesuai design principles (0.1)
- [x] Pastikan alur navigasi antar halaman konsisten dengan diagram alur di `docs/page.md`
- [x] Ekspor hasil Stitch ke Figma untuk refinement
- [x] Pastikan setiap desain konsisten dengan Design System (0.2)

### 0.5 Refinement & Polishing di Figma

- [x] Rapikan hasil Stitch di Figma:
  - Ganti komponen dengan komponen dari Design System
  - Sesuaikan spacing, alignment, dan grid
  - Pastikan konsistensi warna, tipografi, dan ukuran
  - Pastikan estetika **clean & minimalist** terjaga (tanpa border tebal, tanpa dekorasi berlebihan)
- [x] Buat variasi state untuk setiap komponen interaktif:
  - Default, hover, pressed, disabled, focus
- [ ] Buat variasi untuk responsive breakpoint:
  - Tablet landscape (primary: 1280x720)
  - Tablet portrait (orientasi salah -> tampilkan pesan putar layar)
  - Mobile landscape (fallback)
- [ ] Desain mode 2 pemain (split screen layout)
- [ ] Desain untuk setiap game area:
  - Tracing (angka, huruf, hijaiyyah)
  - Choice/Quiz (pilihan ganda)
  - Drag & drop (susun kata)
  - Memory cards (kartu kembar)
  - Maze (labirin)
  - Counting (ayo berhitung)

### 0.6 Desain Maskot & Ilustrasi

- [ ] Desain karakter maskot **Ms zia:**
  - Konsep: karakter clean & minimalist, ekspresi ramah
  - 6 pose utama: menyapa, berpikir, bertepuk tangan, menyemangati, menunjuk, tidur
  - Style: flat vector, simple shapes, minim detail berlebihan
- [ ] Desain ilustrasi pendukung:
  - Benda hitung (buah, hewan, balon) - gaya minimalis
  - Gambar kosakata (ID dan EN)
  - Gambar kartu kembar
  - Karakter dan makanan untuk labirin
- [ ] Desain logo "Play with Ms zia"
- [ ] Desain ikon aplikasi dan PWA

### 0.7 Prototype Interaktif & User Flow

- [ ] Hubungkan semua layar di Figma menjadi prototype interaktif (clickable)
- [ ] Buat alur lengkap yang bisa diklik:
  - Pilih Bahasa -> Home -> Pilih Game -> Mode -> Level -> Mulai -> Game -> Hasil -> Kembali
  - Home -> Area Orang Tua -> Login -> Profil Anak -> Ringkasan
- [ ] Tambahkan transisi dan animasi dasar di prototype
- [ ] Verifikasi: semua alur bisa dijalankan tanpa dead-end

### 0.8 Usability Testing (Design)

- [ ] Uji prototype dengan 2-3 anak usia 4-6 tahun:
  - Apakah anak bisa menemukan game yang ingin dimainkan?
  - Apakah tombol cukup besar dan mudah diketuk?
  - Apakah anak mengerti arti ikon tanpa bantuan?
  - Apakah alur navigasi intuitif?
- [ ] Uji dengan 2-3 orang tua:
  - Apakah area orang tua mudah diakses?
  - Apakah informasi perkembangan anak jelas?
- [ ] Dokumentasikan temuan dan iterasi desain
- [ ] Approval final dari stakeholder

### 0.9 Handoff ke Development

- [ ] Pastikan semua komponen di Figma rapi dan terorganisir
- [ ] Buat halaman "Developer Handoff" di Figma:
  - Spesifikasi spacing, ukuran, warna dalam kode (hex, px, rem)
  - Panduan implementasi animasi dan transisi
  - Catatan interaksi khusus per komponen
- [ ] Ekspor aset dari Figma:
  - Ikon dalam format SVG
  - Ilustrasi dalam format SVG / PNG @2x
  - Maskot dalam format SVG / PNG @2x
- [ ] Dokumentasikan mapping: layar Figma <-> scene/halaman di kode
- [ ] Buat daftar aset yang masih placeholder vs. yang sudah final

> **Kriteria selesai Fase 0:** Design system lengkap di Figma, semua layar sudah di-desain high-fidelity, prototype interaktif bisa diklik end-to-end, usability test selesai dan diiterasi, semua aset siap di-handoff ke developer. **Tidak ada development dimulai sebelum fase ini selesai.**

---

## Fase 1 · Instalasi & Setup Proyek (Fondasi)

### 1.1 Inisialisasi Repositori

- [x] Buat repositori GitHub `play-with-ms-ziya`
- [x] Tambahkan `.gitignore` (Node, Vite, IDE, OS files)
- [x] Tambahkan `README.md` awal
- [x] Setup branching strategy (main, develop, feature branches)

### 1.2 Setup Vite + React + TypeScript

- [x] Inisialisasi proyek: `npm create vite@latest . -- --template react-ts`
- [x] Install dependencies dasar:
  ```
  react, react-dom, react-router-dom
  ```
- [x] Install dev dependencies:
  ```
  typescript, @types/react, @types/react-dom, eslint, prettier
  ```
- [x] Konfigurasi `tsconfig.json` (strict mode, path aliases)
- [x] Konfigurasi `vite.config.ts`
- [x] Konfigurasi ESLint + Prettier
- [x] Verifikasi: `npm run dev` berjalan, halaman kosong tampil

### 1.3 Setup Phaser 3

- [ ] Install Phaser: `npm install phaser`
- [ ] Buat komponen React `PhaserGame.tsx` sebagai wrapper canvas
- [ ] Buat file konfigurasi Phaser (`game/config.ts`):
  - Resolusi 1280×720 (Scale.FIT)
  - Mode Canvas/WebGL auto
  - Input: touch, mouse
  - Audio: Web Audio API
- [ ] Buat scene placeholder: `Boot.ts`, `Preload.ts`
- [ ] Verifikasi: canvas Phaser muncul di dalam React

### 1.4 Setup Tailwind CSS

- [ ] Install Tailwind CSS & PostCSS:
  ```
  tailwindcss, postcss, autoprefixer
  ```
- [ ] Konfigurasi `tailwind.config.ts` dengan warna kustom dari design.md:
  - Background: Warm White `#FAF8F5`, Pale Cream `#FFF9F2`, White `#FFFFFF`, Light Gray `#F3F1EE`
  - Kategori: Langit `#4DB8FF`, Karang `#FF6B6B`, Tosca `#3DE6CF`, Lembayung `#9B8CFF`
  - Teks & Border: Navy `#1F2A5C`, Border Gray `#E8E4DF`, Muted Gray `#9CA3AF`
  - Rewards & Feedback: Bintang Emas `#FFD200`, Hijau benar `#3CCB7F`, Oranye coba lagi `#FF9F43`
- [ ] Verifikasi: styling Tailwind bekerja di React

### 1.5 Setup Font

- [ ] Download & self-host font (tanpa CDN pihak ketiga):
  - **Fredoka** atau **Baloo 2** (judul, tombol)
  - **Nunito** (teks isi)
  - **Noto Naskh Arabic** atau **Scheherazade New** (hijaiyyah)
- [ ] Konfigurasi `@font-face` di CSS
- [ ] Verifikasi: font tampil dengan benar di peramban

### 1.6 Setup PWA

- [ ] Install `vite-plugin-pwa`
- [ ] Buat `manifest.webmanifest`:
  - Nama: "Play with Ms zia"
  - Orientasi: landscape
  - Display: standalone
  - Ikon aplikasi (placeholder dulu)
- [ ] Konfigurasi Workbox untuk caching strategy
- [ ] Verifikasi: aplikasi bisa di-install sebagai PWA

### 1.7 Setup i18n (Internasionalisasi)

- [ ] Buat struktur file bahasa: `src/i18n/id.json`, `src/i18n/en.json`
- [ ] Buat fungsi `t()` sederhana untuk lookup teks
- [ ] Isi teks dasar UI (Mulai, Level, Pemain, dll.)
- [ ] Verifikasi: teks berubah sesuai bahasa terpilih

### 1.8 Setup State Management

- [ ] Buat `src/game/core/Storage.ts`:
  - Simpan/baca bahasa, volume, level terakhir dari localStorage
  - Penanganan error (storage penuh, mode privat)
- [ ] Buat store sederhana untuk state global (bahasa, volume)
- [ ] Verifikasi: preferensi tersimpan setelah refresh

### 1.9 Setup Supabase

- [ ] Buat proyek Supabase (region **ap-southeast-1 / Singapura**)
- [ ] Install Supabase client: `npm install @supabase/supabase-js`
- [ ] Buat file klien: `src/lib/supabase/client.ts`
- [ ] Simpan `VITE_SUPABASE_URL` dan `VITE_SUPABASE_ANON_KEY` di `.env`
- [ ] Jalankan migrasi SQL untuk tabel awal:
  - `profiles` (id, created_at)
  - `children` (id, parent_id, nickname, avatar, created_at)
  - `progress` (child_id, game_id, level, stars, best_result, updated_at)
  - `rounds` (id, child_id, game_id, level, mode, correct, total, duration_s, played_at)
  - `milestones` (child_id, milestone_id, achieved_at)
- [ ] Aktifkan **Row Level Security (RLS)** di semua tabel
- [ ] Tulis kebijakan RLS: orang tua hanya akses data miliknya
- [ ] Setup Supabase Auth (email magic link / OTP)
- [ ] Verifikasi: koneksi Supabase berhasil, RLS bekerja

### 1.10 Setup Vercel Hosting

- [ ] Hubungkan repositori GitHub ke Vercel
- [ ] Konfigurasi `vercel.json`:
  - Rewrite semua rute ke `index.html` (SPA)
  - Header keamanan:
    - `Content-Security-Policy` (strict)
    - `Strict-Transport-Security`
    - `X-Content-Type-Options: nosniff`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Permissions-Policy` (matikan kamera, mikrofon, lokasi)
    - `X-Frame-Options: DENY`
- [ ] Set environment variables di Vercel (Supabase URL, anon key)
- [ ] Verifikasi: deploy berhasil, HTTPS aktif, header keamanan terpasang

### 1.11 Setup Testing

- [ ] Install Vitest: `npm install -D vitest`
- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Buat konfigurasi test dasar
- [ ] Buat test pertama (smoke test)
- [ ] Verifikasi: `npm test` berjalan

### 1.12 Setup CI/CD (GitHub Actions)

- [ ] Buat workflow `.github/workflows/ci.yml`:
  - Trigger: push ke main & PR
  - Steps: install → lint → test → build
- [ ] Aktifkan Dependabot untuk update dependensi
- [ ] Hubungkan deploy otomatis Vercel pada push ke main
- [ ] Verifikasi: CI berjalan pada PR, deploy preview muncul

### 1.13 Setup Struktur Folder Proyek

- [ ] Buat struktur folder sesuai tech.md:
  ```
  src/
  ├── pages/          (Landing, Play, Parent, Privacy)
  ├── game/
  │   ├── core/       (GameBase, Storage, Analytics, VoiceGuide)
  │   ├── modules/    (TracingEngine, ChoiceRound, DuelSplitScreen)
  │   ├── scenes/     (Boot, Preload, LanguageSelect, Menu, dll.)
  │   └── games/
  │       ├── hijaiyyah/
  │       ├── angka/
  │       ├── huruf/
  │       └── memori/
  ├── components/     (ParentGate, Settings, LoginForm)
  ├── lib/supabase/
  ├── i18n/
  └── content/
  public/
  assets/
  ├── art/
  ├── audio/{id,en}/
  └── fonts/
  supabase/
  scripts/
  tests/
  ```

> **✅ Kriteria selesai Fase 1:** `npm run dev` menampilkan halaman React dengan canvas Phaser kosong, PWA bisa di-install, Supabase terhubung, deploy ke Vercel berhasil, CI/CD berjalan.

---

## Fase 2 · Kerangka Bersama & Alur Navigasi

> [!NOTE]
> **Progres development per 2026-10-26** — arsitektur dev menyimpang terkendali dari rencana awal:
> - **Phaser 3 belum dipakai.** Implementasi UI pakai React + CSS Modules murni. Game pertama (Menulis Huruf) pakai HTML Canvas langsung. Keputusan final Phaser vs full-React perlu ditetapkan sebelum Fase 3.
> - **Arsitektur game:** `src/games/registry.ts` (gameId → meta + komponen), kontrak `GameProps` di `src/games/types.ts`, kerangka bersama di `src/pages/GameShell/`. Nambah game = folder baru + 1 entri registry.
> - **Alur sudah nyambung end-to-end:** Home → Intro (`/game/:id/intro`, pilih level) → Play (`/game/:id/play?level=…`) → Result (`/game/:id/result`, hasil via `location.state`).
> - **Tailwind tidak dipakai** — styling pakai CSS Modules + design tokens (`src/styles/tokens.css`).
>
> **Next target (urutan saran):**
> 1. ModeSelect (1 pemain / 2 pemain) — sebelum atau setelah intro level
> 2. Bintang live update di GameShell HUD (game → shell)
> 3. ParentGate component (dipakai tombol home & settings)
> 4. Fullscreen + tombol audio berfungsi di GameShell
> 5. Orientasi lanskap guard
> 6. Ekstrak MenulisHuruf tracing jadi `TracingEngine` reusable (data jalur JSON)
> 7. Putuskan & setup audio (VoiceGuide + audio unlock)

### 2.1 Scene Boot & Preload

- [x] Implementasi `Boot` scene: setup konfigurasi game, load pengaturan dari localStorage
  > **Notes (2026-10-26):** Implementasi sebagai React `PreloadPage` (bukan Phaser scene). Progress simulasi via `usePreloadProgress.ts`. Nanti diganti/ditambah preload aset nyata saat asset pipeline siap.
- [ ] Implementasi `Preload` scene:
  - Bilah loading berbentuk pil kuning *(✅ sudah — `LoadingBar` component)*
  - Teks "Memuat…" / "Loading…" *(✅ sudah — `StatusPill` component)*
  - Preload aset UI bersama (tombol, bintang, ikon) *(belum — aset masih placeholder)*
  - Preload audio sprite dasar (klik, benar, salah) *(belum — butuh audio pipeline)*

### 2.2 Layar Pilih Bahasa (LanguageSelect)

- [x] Dua tombol besar: 🇮🇩 Bahasa Indonesia & 🇬🇧 English
  > **Notes:** Implementasi sebagai `LanguageModal` di Home (modal, bukan layar terpisah). Muncul otomatis saat belum ada pilihan tersimpan.
- [ ] Suara pengucapan nama bahasa saat ditekan *(belum — butuh VoiceGuide/audio)*
- [x] Simpan pilihan ke localStorage *(key `lang`, handled di `Home.tsx`)*
- [ ] Animasi transisi halus *(belum)*

### 2.3 Menu Utama (Home)

- [x] Layout grid kartu game per kelompok keterampilan: *(semua 9 game terdaftar di `homeData.ts`, filter per kategori via `CategoryTabs`)*
  - **Angka** (biru): Ayo Berhitung, Menulis Angka ✅
  - **Huruf** (karang): Susun Kata, Bunyi Awal, Menulis Huruf ✅
  - **Hijaiyyah** (tosca): Dengar & Temukan, Tebalkan Hijaiyyah ✅
  - **Ingat & Main** (lembayung): Kartu Kembar, Petualangan Labirin ✅
- [x] Kartu game: ubin ikon, nama game, 3 bintang pencapaian *(SVG ikon custom per game di `GameCardIcon.tsx`)*
- [ ] Maskot Ms zia dengan balon ucapan "Ayo main!" *(belum — avatar masih placeholder emoji)*
- [x] Tombol tetap: 🌐 bahasa, ⛶ layar penuh, 🔊 suara *(`HeaderBar.tsx`)*
- [x] Panel bawah: avatar dan jumlah bintang *(`BottomDock.tsx`, data statis)*

### 2.4 Layar Pilih Mode (ModeSelect)

- [ ] Tombol 1 Pemain 👤 dan 2 Pemain 👤👤 *(belum — mode sekarang hardcoded `?players=1` di URL; perlu layar/step sebelum intro level)*
- [ ] Ikon besar, mudah diketuk
- [ ] Animasi transisi

### 2.5 Layar Pilih Level (LevelSelect)

- [x] Tiga tombol: ★ Mudah, ★★ Sedang, ★★★ Menantang *(implementasi sebagai bagian `GameIntroPage`, bukan layar terpisah — data di `gameIntroData.ts`)*
- [x] Semua level terbuka (tidak terkunci)
- [x] Warna sesuai kelompok keterampilan game yang dipilih *(per-opsi color/tint di data intro)*

### 2.6 Layar Mulai (Ready)

- [x] Judul game + ilustrasi *(tergabung ke `GameIntroPage` — banner, judul, deskripsi)*
- [x] Tombol besar "Klik Mulai" / "Click Start" dengan ikon panah ▶ *(tombol "Mulai Bermain")*
- [ ] Ms zia membacakan instruksi singkat *(belum — butuh audio/VoiceGuide)*
- [ ] Tombol 🔊 untuk mengulang instruksi *(UI tombol ada di GameShell, fungsinya belum)*

### 2.7 Layar Hasil (Result)

- [ ] Bintang muncul satu per satu dengan animasi dan suara *(bintang statis sesuai hasil; animasi berurutan + suara belum)*
- [ ] Maskot bertepuk tangan *(belum)*
- [ ] Tiga tombol: Main Lagi, Naik Level, Menu *(Main Lagi + Menu sudah berfungsi; tombol "Naik Level" belum ada)*
- [x] Menerima hasil nyata dari game via `location.state` ({ stars, score }) *(dikerjakan saat wiring alur Home→Intro→Play→Result)*
- [ ] Mode duel: tampilkan pemenang (mahkota) dan "seri", kedua anak dapat bintang *(belum — tunggu ModeSelect & DuelSplitScreen)*

### 2.8 GameBase (Kelas Induk)

- [x] Menerima `{ gameId, level, mode, lang }` *(implementasi React: kontrak `GameProps` di `src/games/types.ts` — gameId, difficulty, players, onFinish, onQuit. `lang` belum masuk kontrak)*
- [x] Mengelola HUD: bintang, tombol home, layar penuh, suara, ulang *(implementasi React: `GameShellPage.tsx`. HUD bintang masih statis — belum live update dari game; tombol fullscreen/audio belum berfungsi penuh)*
- [ ] Sistem umpan balik benar/salah (animasi + suara) *(belum — per game dulu, nanti diekstrak ke shared)*
- [ ] Bantuan otomatis setelah diam 30 detik *(belum)*
- [ ] Jeda otomatis setelah 2 menit tanpa sentuhan *(belum)*
- [x] Transisi ke Result scene saat game selesai *(via `onFinish` → navigate result)*
- [ ] Penghitungan skor dan bintang *(kontrak ada (`GameResult`), logika per game belum seragam)*

> **Catatan arsitektur (2026-10-26):** 2.8 direalisasikan bukan sebagai kelas Phaser `GameBase`, melainkan **GameShell (React)** + **GameRegistry** (`src/games/registry.ts`). Tiap game = folder sendiri di `src/games/<Nama>/`, export komponen bertipe `GameProps`. Route `/game/:gameId/play`. Contoh game pertama: `MenulisHurufGame` (tracing huruf A di canvas). Alur Home → Intro → Play → Result sudah terhubung end-to-end.

### 2.9 Fitur Umum UI

- [x] **Tombol layar penuh** (U-05): Fullscreen API *(berfungsi di Home; fallback iPhone belum)*
- [ ] **Gerbang orang tua** (U-10): tahan 3 detik atau soal hitung sederhana *(belum — Home sudah punya hook `onOpenParentGate` tapi belum ada komponennya)*
- [ ] **Tombol home/kembali** (U-09): dilindungi gerbang orang tua *(belum — home dari shell langsung keluar tanpa gate)*
- [ ] **Orientasi lanskap**: deteksi potret → tampilkan petunjuk putar layar *(belum)*
- [ ] **Touch handling**: matikan zoom, scroll, long-press, pull-to-refresh *(sebagian — `touch-action: none` di canvas game; global belum)*
- [ ] **Audio unlock**: sentuhan pertama di layar bahasa/Mulai *(belum)*

### 2.10 VoiceGuide Module

- [ ] Sistem antrean suara (agar tidak bertabrakan)
- [ ] Putar suara Ms zia sesuai bahasa
- [x] Tombol 🔊 untuk mengulang instruksi *(UI ada di GameShell ("Dengar lagi") — fungsi audio belum; dikerjakan sebagai bagian shell)*
- [ ] Fallback jika audio gagal dimuat (game tidak crash)

### 2.11 Analytics Module

- [ ] Pembungkus peristiwa anonim (game, level, mode, bahasa, durasi, hasil)
- [ ] Bisa dimatikan
- [ ] Tanpa cookie, tanpa pengenal pengguna

> **✅ Kriteria selesai Fase 2:** Alur lengkap dari pilih bahasa → menu → mode → level → layar mulai → (game placeholder kosong) → layar hasil berjalan mulus di dua bahasa. Tombol layar penuh, suara, dan gerbang orang tua berfungsi.

---

## Fase 3 · Modul Bersama (Shared Modules)

### 3.1 TracingEngine

- [ ] Muat jalur goresan dari data JSON (titik-titik polyline)
- [ ] Render huruf/angka dari garis putus-putus
- [ ] Deteksi telusur jari: toleransi jarak per level
- [ ] Enforsi urutan goresan dan arah
- [ ] Animasi garis tebal berwarna saat ditelusuri benar
- [ ] Titik awal berkedip (level Mudah)
- [ ] Panah arah goresan (level Mudah)
- [ ] Nuqtah/titik hijaiyyah sebagai target ketuk terpisah
- [ ] Konfeti kecil saat huruf selesai
- [ ] Support 3 level toleransi: lebar → sedang → sempit
- [ ] **Verifikasi:** test di tablet dan HP, nyaman untuk jari anak

### 3.2 ChoiceRound

- [ ] Tampilkan N pilihan dalam kotak/lingkaran ≥ 160px
- [ ] Jarak antar pilihan ≥ 24px
- [ ] Deteksi ketukan pada pilihan
- [ ] Umpan balik benar: membesar-mengecil, kilau, bintang terbang (≤ 800ms)
- [ ] Umpan balik salah: goyang kiri-kanan lembut (≤ 400ms)
- [ ] Suara umpan balik
- [ ] Kedipan bantuan: pilihan benar berkedip pelan setelah N kali salah (per level)

### 3.3 DuelSplitScreen

- [ ] Membagi canvas jadi dua zona (kiri-kanan atau atas-bawah)
- [ ] Warna latar berbeda per zona (biru dan oranye lembut)
- [ ] Memetakan `pointer.id` ke zona masing-masing
- [ ] Mengabaikan sentuhan di zona lawan
- [ ] Palm rejection dasar
- [ ] HUD per pemain (skor, bintang)
- [ ] Sorot giliran (untuk game bergilir seperti Kartu Kembar)

### 3.4 ParentGate (React Component)

- [ ] Overlay DOM di atas canvas
- [ ] Mode 1: tahan tombol 3 detik (cincin pengisi animasi)
- [ ] Mode 2: soal hitung sederhana (misalnya "3 + 4 = ?")
- [ ] Dipakai untuk: ubah bahasa, login, keluar game, pengaturan

### 3.5 Storage Module

- [ ] Pembungkus localStorage:
  - Bahasa, volume, level terakhir per game
- [ ] Pembungkus IndexedDB (idb-keyval) untuk data bermain lokal
- [ ] Antrean lokal: simpan hasil putaran sebelum dikirim ke Supabase
- [ ] Sinkronisasi: kirim antrean ke server saat online dan login
- [ ] Penanganan error (storage penuh, mode privat browser)

> **✅ Kriteria selesai Fase 3:** Tracing engine bisa menelusuri huruf A dengan jari, ChoiceRound menampilkan pilihan dan umpan balik, DuelSplitScreen membagi layar tanpa konflik sentuhan. Semua modul lolos unit test.

---

## Fase 4 · Game — Kelompok Hijaiyyah 🟩

### 4.1 H-01 · Dengar & Temukan Hijaiyyah

- [ ] Ms zia mengucapkan bunyi huruf hijaiyyah
- [ ] Tampilkan pilihan huruf (pakai ChoiceRound)
- [ ] **Mudah:** 2 pilihan, 10 huruf awal, kedipan bantuan setelah 2× salah
- [ ] **Sedang:** 3 pilihan, 20 huruf
- [ ] **Menantang:** 4 pilihan, 28 huruf (termasuk mirip: ب ت ث)
- [ ] Tombol speaker besar untuk ulang bunyi
- [ ] Mode 1 pemain: 5–10 soal per putaran
- [ ] Mode 2 pemain: satu bunyi, dua papan pilihan, adu cepat, poin terbanyak dari 5 soal

### 4.2 H-02 · Tebalkan Hijaiyyah

- [ ] Huruf hijaiyyah sebagai garis putus-putus (pakai TracingEngine)
- [ ] **Mudah:** huruf besar, jalur lebar, panah arah, titik awal berkedip, toleran
- [ ] **Sedang:** jalur lebih sempit, tanpa panah, titik awal saja
- [ ] **Menantang:** jalur sempit, huruf kecil, tanpa titik awal, bantuan setelah 10 detik
- [ ] Jejak berwarna saat ditelusuri
- [ ] Mode 2 pemain: dua huruf sama di dua area, adu cepat dan akurat
- [ ] **Konten:** data jalur 28 huruf hijaiyyah (bentuk tunggal/terpisah)

> **✅ Kriteria selesai Fase 4:** Dua game hijaiyyah berjalan di 3 level, 1 dan 2 pemain, dalam 2 bahasa. Suara hijaiyyah benar.

---

## Fase 5 · Game — Kelompok Angka 🔵

### 5.1 A-01 · Ayo Berhitung

- [ ] Tampilkan benda (buah, hewan, balon) di layar
- [ ] Anak mengetuk benda satu per satu → benda bergerak ke keranjang + Ms zia sebut angka
- [ ] Benda sudah dihitung berubah tampilan (tidak bisa dihitung ulang)
- [ ] Cocokkan jumlah dengan angka yang benar
- [ ] **Mudah:** 1–5, 2 pilihan, benda tersusun rapi
- [ ] **Sedang:** 1–10, 3 pilihan, benda tersebar
- [ ] **Menantang:** 1–20, 4 pilihan, beberapa jenis benda (hitung satu jenis saja)
- [ ] Mode 2 pemain: dua kelompok benda terpisah, adu cepat
- [ ] Posisi benda diacak dengan jarak minimum agar tidak bertumpuk

### 5.2 A-02 · Menulis Angka

- [ ] Angka sebagai jalur putus-putus (pakai TracingEngine)
- [ ] **Mudah:** 0–9, jalur lebar, panah arah, titik awal berkedip
- [ ] **Sedang:** 10–15, jalur sedang, tanpa panah
- [ ] **Menantang:** 16–20, jalur sempit, dua digit ditulis berurutan
- [ ] Mode 2 pemain: angka sama di dua area, adu cepat
- [ ] **Konten:** data jalur angka 0–20

> **✅ Kriteria selesai Fase 5:** Dua game angka berjalan di 3 level, 1 dan 2 pemain. Benda bisa dihitung, angka bisa ditulis.

---

## Fase 6 · Game — Kelompok Huruf 🔴

### 6.1 L-01 · Susun Kata

- [ ] Gambar benda + Ms zia mengeja huruf demi huruf
- [ ] Anak menyeret/mengetuk kepingan huruf ke kotak urutan yang benar
- [ ] **Mudah:** 3 huruf, kotak berisi huruf samar sebagai petunjuk, tanpa pengecoh
- [ ] **Sedang:** 4 huruf, tanpa huruf samar, 1–2 huruf pengecoh
- [ ] **Menantang:** 5–6 huruf, beberapa pengecoh, Ms zia hanya mengeja sekali
- [ ] Kotak benar menyala hijau lembut
- [ ] Mode 2 pemain: kata sama, dua papan susun, adu cepat
- [ ] **Konten:** daftar kosakata per bahasa (kata, gambar, suara)

### 6.2 L-02 · Bunyi Awal

- [ ] Ms zia sebut kata + gambar tampil
- [ ] Anak mengetuk huruf pertama dari kata (pakai ChoiceRound)
- [ ] **Mudah:** 2 pilihan, gambar tetap, kata diulang otomatis
- [ ] **Sedang:** 3 pilihan, ulang lewat ikon speaker
- [ ] **Menantang:** 4 pilihan, huruf mirip (b/d, m/n)
- [ ] Mode 2 pemain: satu kata, dua papan pilihan, adu cepat, poin dari 5 soal

### 6.3 L-03 · Menulis Huruf

- [ ] Huruf sebagai jalur putus-putus (pakai TracingEngine)
- [ ] **Mudah:** A–Z huruf besar, jalur lebar, panah, titik awal berkedip
- [ ] **Sedang:** A–Z huruf besar, jalur sempit, tanpa panah
- [ ] **Menantang:** a–z huruf kecil, jalur sempit, hanya titik awal
- [ ] Warna jejak berbeda tiap goresan
- [ ] Mode 2 pemain: huruf sama di dua area, adu cepat
- [ ] **Konten:** data jalur A–Z dan a–z

> **✅ Kriteria selesai Fase 6:** Tiga game huruf berjalan di 3 level, 1 dan 2 pemain. Kosakata ID dan EN lengkap.

---

## Fase 7 · Game — Kelompok Daya Ingat & Game 🟣

### 7.1 G-01 · Kartu Kembar

- [ ] Kartu tertutup bermotif bintang tersusun dalam grid
- [ ] Ketuk 2 kartu → balik → cocok = tetap terbuka, tidak = tutup setelah 1,5 detik
- [ ] **Mudah:** 6 kartu (3 pasang), gambar besar dan beda jelas
- [ ] **Sedang:** 12 kartu (6 pasang), gambar lebih bervariasi
- [ ] **Menantang:** 20 kartu (10 pasang), gambar mirip, dibuka 2 detik di awal
- [ ] Animasi balik 300ms, kartu cocok berkedip
- [ ] Tema kartu dari konten game lain (hewan, buah, angka, huruf, hijaiyyah)
- [ ] Algoritma acak Fisher–Yates, kunci input saat dua kartu dibandingkan
- [ ] Mode 2 pemain: bergiliran, sorotan warna giliran siapa, pasangan terbanyak menang

### 7.2 G-02 · Petualangan Labirin

- [ ] Anak geser karakter dengan jari (seret) melewati labirin menuju makanan
- [ ] Dinding tidak mematikan: karakter berhenti dan bergetar pelan
- [ ] **Mudah:** 5×5, satu jalur utama, tanpa jalan buntu
- [ ] **Sedang:** 7×7, beberapa jalan buntu
- [ ] **Menantang:** 9×9, banyak jalan buntu, 3 bintang dikumpulkan
- [ ] Labirin diacak (recursive backtracker) dengan jaminan selalu bisa diselesaikan
- [ ] Labirin berwarna lembut, dinding tebal berwarna
- [ ] Mode 2 pemain: dua labirin identik berdampingan, adu cepat ke makanan

> **✅ Kriteria selesai Fase 7:** Dua game daya ingat berjalan di 3 level, 1 dan 2 pemain. Labirin selalu solvable.

---

## Fase 8 · Akun Orang Tua & Perkembangan Anak

### 8.1 Mode Tamu (U-13)

- [ ] Semua game bisa dimainkan tanpa login
- [ ] Data tersimpan di perangkat (localStorage + IndexedDB)

### 8.2 Login Orang Tua (U-14)

- [ ] Halaman login di balik gerbang orang tua
- [ ] Supabase Auth: email magic link atau OTP
- [ ] Opsional: Google OAuth
- [ ] Tanpa kata sandi (mudah bagi orang tua)

### 8.3 Profil Anak (U-15)

- [ ] Orang tua tambah profil anak: nama panggilan + avatar (bukan nama asli)
- [ ] Pilih profil dari menu
- [ ] Mode 2 pemain: tiap pemain pilih profil sendiri

### 8.4 Simpan Data Bermain (U-16)

- [ ] Hasil putaran tersimpan ke tabel `rounds`
- [ ] Data mode tamu bisa dipindahkan ke akun saat login pertama
- [ ] Sinkronisasi satu arah → dua arah
- [ ] Anak tidak pernah menunggu jaringan

### 8.5 Ringkasan Perkembangan (U-17)

- [ ] Halaman orang tua: capaian per keterampilan
- [ ] Teks capaian "Sudah bisa…" (dari `milestones.json`)
- [ ] Aturan capaian: ≥ 80% benar pada 3 putaran terakhir
- [ ] Menampilkan "sedang dilatih" untuk keterampilan yang belum tercapai

### 8.6 Hapus Data (U-18)

- [ ] Orang tua bisa hapus profil anak → CASCADE hapus semua data terkait
- [ ] Orang tua bisa hapus seluruh akun → Edge Function hapus akun Auth + semua data

### 8.7 Lanjut di Perangkat Lain (U-19)

- [ ] Level dan bintang tersinkron saat login di perangkat lain

### 8.8 Supabase Edge Functions

- [ ] Edge Function: hapus akun lengkap (butuh `service_role` key)
- [ ] Edge Function: ringkas data lama (> 12 bulan)

> **✅ Kriteria selesai Fase 8:** Orang tua bisa login, buat profil anak, lihat ringkasan perkembangan. RLS lolos uji dua akun berbeda.

---

## Fase 9 · Konten & Aset

> ⚠️ **PENTING:** Fase ini harus berjalan **paralel** dengan Fase 1–6. Konten adalah pekerjaan terbesar di luar kode.

### 9.1 Rekaman Suara Ms zia

- [ ] Rekam per bahasa (Indonesia dan Inggris):
  - Instruksi setiap game
  - Umpan balik (benar, coba lagi, pujian)
  - Angka 0–20
  - Huruf A–Z
  - 28 huruf hijaiyyah (ditinjau guru ngaji)
  - Kata kosakata untuk Susun Kata dan Bunyi Awal
- [ ] Bersihkan (derau), potong per kata
- [ ] Normalisasi volume (skrip ffmpeg)
- [ ] Buat audio sprite (satu file per bahasa + peta waktu JSON)

### 9.2 Efek Suara & Musik

- [ ] Klik tombol, benar, coba lagi, bintang, kemenangan
- [ ] Musik latar lembut (bisa dibisukan)
- [ ] Hindari suara keras mendadak

### 9.3 Ilustrasi & Maskot

- [ ] Desain maskot Ms zia: 6 pose (menyapa, berpikir, bertepuk tangan, menyemangati, menunjuk, tidur)
- [ ] Benda hitung (buah, hewan, balon)
- [ ] Gambar kosakata (ID dan EN)
- [ ] Gambar kartu kembar
- [ ] Karakter dan makanan untuk labirin
- [ ] Logo "Play with Ms zia"
- [ ] Ikon aplikasi dan PWA
- [ ] Gaya: vektor datar, garis tepi navy tebal, sudut membulat

### 9.4 Komponen UI

- [ ] Tombol (pil kuning, pil biru, lingkaran ikon)
- [ ] Kartu game
- [ ] Bintang (terisi kuning, kosong lavender)
- [ ] Bilah muat
- [ ] Balon ucapan
- [ ] Ikon (home, speaker, layar penuh, ulang, panah)

### 9.5 Data Jalur Tulisan

- [ ] Jalur goresan angka 0–20 (polyline dari SVG)
- [ ] Jalur goresan A–Z dan a–z
- [ ] Jalur goresan 28 huruf hijaiyyah (bentuk tunggal)
- [ ] Urutan goresan hijaiyyah ditinjau guru ngaji/ahli
- [ ] Skrip ekspor SVG → JSON

### 9.6 Daftar Kosakata

- [ ] Kata-kata per bahasa untuk Susun Kata (3, 4, 5–6 huruf)
- [ ] Kata-kata per bahasa untuk Bunyi Awal
- [ ] Gambar dan suara per kata
- [ ] Kata mudah, bersuku kata jelas, netral budaya

### 9.7 Data Capaian (Milestones)

- [ ] Buat `src/content/milestones.json`:
  - Per keterampilan, game, level
  - Teks dalam ID dan EN

> **✅ Kriteria selesai Fase 9:** Semua aset suara, gambar, dan data konten lengkap dan terintegrasi ke dalam game.

---

## Fase 10 · Polish, Animasi & Aksesibilitas

### 10.1 Animasi & Transisi

- [ ] Tombol ditekan: turun 4px lalu memantul (120ms)
- [ ] Jawaban benar: membesar-mengecil, kilau, bintang terbang ke HUD (≤ 800ms)
- [ ] Jawaban salah: goyang kiri-kanan lembut (≤ 400ms)
- [ ] Pindah layar: geser/pudar halus (300ms)
- [ ] Selesai: bintang satu per satu, maskot tepuk tangan
- [ ] Konfeti untuk menulis angka/huruf selesai

### 10.2 Aksesibilitas

- [ ] Kontras teks ≥ 4,5:1 dan ikon ≥ 3:1
- [ ] Benar/salah tidak hanya lewat warna (tambah bentuk dan suara)
- [ ] Target sentuh ≥ 64px (utama ≥ 96px), jarak ≥ 16px
- [ ] Menu orang tua mendukung pembaca layar dan navigasi keyboard
- [ ] Label ARIA pada elemen interaktif
- [ ] Opsi "kurangi gerak" untuk orang tua
- [ ] Hindari kedipan > 3 kali per detik

### 10.3 Halaman Tambahan (React)

- [ ] Landing page
- [ ] Halaman kebijakan privasi (dua bahasa)
- [ ] Halaman "Tentang" (opsional)

### 10.4 Opsi Pengaturan Orang Tua

- [ ] Ganti bahasa (lewat gerbang orang tua)
- [ ] Volume (suara pemandu vs efek)
- [ ] Kurangi gerak
- [ ] Bisukan

> **✅ Kriteria selesai Fase 10:** Semua animasi halus, kontras lulus uji, pembaca layar berfungsi di menu orang tua, kebijakan privasi tersedia.

---

## Fase 11 · Testing & Quality Assurance

### 11.1 Unit Test (Vitest)

- [ ] Logika labirin (selalu solvable)
- [ ] Pengacak kartu (Fisher–Yates)
- [ ] Penilaian tracing (toleransi, urutan goresan)
- [ ] Skor duel
- [ ] Fungsi `t()` i18n
- [ ] Aturan capaian (milestones)
- [ ] Storage module

### 11.2 E2E Test (Playwright)

- [ ] Alur lengkap: bahasa → menu → mode → level → mulai → game → hasil
- [ ] Emulasi sentuh dan multi-sentuh
- [ ] Mode 2 pemain tidak bertabrakan
- [ ] Gerbang orang tua berfungsi
- [ ] Login orang tua → profil anak → ringkasan

### 11.3 Performa (Lighthouse CI)

- [ ] Muat pertama ≤ 3 detik di 4G
- [ ] Ukuran muat awal ≤ 5 MB
- [ ] 60 fps di tablet menengah
- [ ] Total aset ≤ 60 MB

### 11.4 Visual Test

- [ ] Screenshot per layar per viewport (mobile, tablet)
- [ ] Pastikan teks tidak terpotong
- [ ] Warna sesuai design system

### 11.5 Uji Perangkat Nyata

- [ ] Tablet Android kelas menengah
- [ ] HP Android entry-level
- [ ] iPad
- [ ] iPhone (Safari)
- [ ] Sentuhan, audio, fullscreen di setiap perangkat

### 11.6 Uji Keamanan

- [ ] RLS: akun orang tua A tidak bisa akses data orang tua B
- [ ] `service_role` key tidak ada di kode klien atau variabel `VITE_*`
- [ ] CSP header aktif dan ketat
- [ ] Tidak ada skrip pihak ketiga
- [ ] `npm audit` bersih

### 11.7 Uji Pengguna (User Testing)

- [ ] 3–5 anak usia 4–6 tahun dengan pendamping
- [ ] Observasi:
  - Bisa menyelesaikan 1 putaran tanpa bantuan?
  - Tracing nyaman di layar kecil?
  - Suara jelas?
  - Berapa lama fokus bermain?
  - Mode 2 pemain bisa dipakai?
- [ ] Iterasi berdasarkan temuan

> **✅ Kriteria selesai Fase 11:** Semua test hijau, performa sesuai target, uji pengguna lulus, keamanan lolos audit.

---

## Fase 12 · Rilis & Pasca-Rilis

### 12.1 Persiapan Rilis

- [ ] Tinjauan hukum kepatuhan data anak (sebelum login dirilis)
- [ ] Kebijakan privasi final (dua bahasa)
- [ ] Tinjauan konten hijaiyyah oleh guru ngaji
- [ ] Ikon dan screenshot untuk PWA store listing
- [ ] Vercel: pastikan paket sesuai (Hobby vs Pro)

### 12.2 Rilis MVP

- [ ] Deploy ke production (Vercel)
- [ ] Smoke test di production
- [ ] Monitor error (Vercel logs)
- [ ] Monitor analitik anonim (Vercel Web Analytics / Plausible)

### 12.3 Pasca-Rilis & Iterasi

- [ ] Pantau metrik:
  - Sesi tanpa bantuan ≥ 70%
  - Durasi sesi 8–12 menit
  - Pengguna kembali 7 hari ≥ 30%
  - Naik level ≥ 40%
  - Mode 2 pemain ≥ 20%
  - Muat ≤ 3 detik ≥ 90% sesi
- [ ] Kumpulkan umpan balik orang tua
- [ ] Bug fix dan perbaikan berdasarkan data

### 12.4 Rencana Fase 2 (Pasca-MVP)

- [ ] Album stiker koleksi
- [ ] Laporan perkembangan rinci (grafik mingguan, ekspor PDF)
- [ ] Bahasa tambahan (Arab, Sunda)
- [ ] Mode online antar perangkat
- [ ] Huruf hijaiyyah bentuk awal/tengah/akhir
- [ ] Aplikasi native (iOS, Android)

---

## Ringkasan Tech Stack

| Lapisan     | Teknologi                                 |
| ----------- | ----------------------------------------- |
| Bahasa      | TypeScript                                |
| Build Tool  | Vite                                      |
| Framework   | React (SPA) + React Router                |
| Game Engine | Phaser 3                                  |
| Styling     | Tailwind CSS                              |
| Audio       | Phaser Sound (Web Audio) + audio sprite   |
| i18n        | File JSON + fungsi `t()`                  |
| State       | localStorage + IndexedDB                  |
| PWA         | vite-plugin-pwa (Workbox)                 |
| Backend     | Supabase (Auth, Postgres, Edge Functions) |
| Hosting     | Vercel (situs statis)                     |
| Analitik    | Vercel Web Analytics / Plausible          |
| Testing     | Vitest + Playwright                       |
| CI/CD       | GitHub Actions + Dependabot               |

---

## Ringkasan 9 Game

| #   | Game                              | Kelompok      | Modul Utama             |
| --- | --------------------------------- | ------------- | ----------------------- |
| 1   | Dengar & Temukan Hijaiyyah (H-01) | Hijaiyyah 🟩  | ChoiceRound             |
| 2   | Tebalkan Hijaiyyah (H-02)         | Hijaiyyah 🟩  | TracingEngine           |
| 3   | Ayo Berhitung (A-01)              | Angka 🔵      | Custom + ChoiceRound    |
| 4   | Menulis Angka (A-02)              | Angka 🔵      | TracingEngine           |
| 5   | Susun Kata (L-01)                 | Huruf 🔴      | Custom (drag & drop)    |
| 6   | Bunyi Awal (L-02)                 | Huruf 🔴      | ChoiceRound             |
| 7   | Menulis Huruf (L-03)              | Huruf 🔴      | TracingEngine           |
| 8   | Kartu Kembar (G-01)               | Daya Ingat 🟣 | Custom (flip cards)     |
| 9   | Petualangan Labirin (G-02)        | Daya Ingat 🟣 | Custom (maze generator) |

---

> [!IMPORTANT]
> **Fase 9 (Konten & Aset) harus dimulai paralel sejak Fase 2.** Rekaman suara dan data jalur tulisan adalah jalur kritis yang membutuhkan waktu paling lama dan melibatkan pihak luar (narator, guru ngaji).

> [!WARNING]
> **Sebelum merilis fitur login orang tua**, wajib konsultasi ahli hukum mengenai UU Pelindungan Data Pribadi (pemrosesan data anak, persetujuan orang tua, retensi, lokasi server).
