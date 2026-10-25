# 📋 Implementation Plan — Play with Ms Ziya

> Dokumen ini adalah panduan step-by-step pengerjaan proyek **Play with Ms Ziya** dari nol hingga siap rilis. Setiap fase memiliki langkah-langkah detail, deliverables, dan kriteria selesai.

---

## Fase 0 · Instalasi & Setup Proyek (Fondasi)

### 0.1 Inisialisasi Repositori
- [ ] Buat repositori GitHub `play-with-ms-ziya`
- [ ] Tambahkan `.gitignore` (Node, Vite, IDE, OS files)
- [ ] Tambahkan `README.md` awal
- [ ] Setup branching strategy (main, develop, feature branches)

### 0.2 Setup Vite + React + TypeScript
- [ ] Inisialisasi proyek: `npm create vite@latest . -- --template react-ts`
- [ ] Install dependencies dasar:
  ```
  react, react-dom, react-router-dom
  ```
- [ ] Install dev dependencies:
  ```
  typescript, @types/react, @types/react-dom, eslint, prettier
  ```
- [ ] Konfigurasi `tsconfig.json` (strict mode, path aliases)
- [ ] Konfigurasi `vite.config.ts`
- [ ] Konfigurasi ESLint + Prettier
- [ ] Verifikasi: `npm run dev` berjalan, halaman kosong tampil

### 0.3 Setup Phaser 3
- [ ] Install Phaser: `npm install phaser`
- [ ] Buat komponen React `PhaserGame.tsx` sebagai wrapper canvas
- [ ] Buat file konfigurasi Phaser (`game/config.ts`):
  - Resolusi 1280×720 (Scale.FIT)
  - Mode Canvas/WebGL auto
  - Input: touch, mouse
  - Audio: Web Audio API
- [ ] Buat scene placeholder: `Boot.ts`, `Preload.ts`
- [ ] Verifikasi: canvas Phaser muncul di dalam React

### 0.4 Setup Tailwind CSS
- [ ] Install Tailwind CSS & PostCSS:
  ```
  tailwindcss, postcss, autoprefixer
  ```
- [ ] Konfigurasi `tailwind.config.ts` dengan warna kustom dari design.md:
  - Matahari `#FFC62E`, Karang `#FF6B6B`, Langit `#4DB8FF`
  - Tosca `#3DE6CF`, Lembayung `#9B8CFF`, Navy `#1F2A5C`
  - Krem `#FFF6E5`, Hijau benar `#3CCB7F`, Oranye coba lagi `#FF9F43`
- [ ] Verifikasi: styling Tailwind bekerja di React

### 0.5 Setup Font
- [ ] Download & self-host font (tanpa CDN pihak ketiga):
  - **Fredoka** atau **Baloo 2** (judul, tombol)
  - **Nunito** (teks isi)
  - **Noto Naskh Arabic** atau **Scheherazade New** (hijaiyyah)
- [ ] Konfigurasi `@font-face` di CSS
- [ ] Verifikasi: font tampil dengan benar di peramban

### 0.6 Setup PWA
- [ ] Install `vite-plugin-pwa`
- [ ] Buat `manifest.webmanifest`:
  - Nama: "Play with Ms Ziya"
  - Orientasi: landscape
  - Display: standalone
  - Ikon aplikasi (placeholder dulu)
- [ ] Konfigurasi Workbox untuk caching strategy
- [ ] Verifikasi: aplikasi bisa di-install sebagai PWA

### 0.7 Setup i18n (Internasionalisasi)
- [ ] Buat struktur file bahasa: `src/i18n/id.json`, `src/i18n/en.json`
- [ ] Buat fungsi `t()` sederhana untuk lookup teks
- [ ] Isi teks dasar UI (Mulai, Level, Pemain, dll.)
- [ ] Verifikasi: teks berubah sesuai bahasa terpilih

### 0.8 Setup State Management
- [ ] Buat `src/game/core/Storage.ts`:
  - Simpan/baca bahasa, volume, level terakhir dari localStorage
  - Penanganan error (storage penuh, mode privat)
- [ ] Buat store sederhana untuk state global (bahasa, volume)
- [ ] Verifikasi: preferensi tersimpan setelah refresh

### 0.9 Setup Supabase
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

### 0.10 Setup Vercel Hosting
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

### 0.11 Setup Testing
- [ ] Install Vitest: `npm install -D vitest`
- [ ] Install Playwright: `npm install -D @playwright/test`
- [ ] Buat konfigurasi test dasar
- [ ] Buat test pertama (smoke test)
- [ ] Verifikasi: `npm test` berjalan

### 0.12 Setup CI/CD (GitHub Actions)
- [ ] Buat workflow `.github/workflows/ci.yml`:
  - Trigger: push ke main & PR
  - Steps: install → lint → test → build
- [ ] Aktifkan Dependabot untuk update dependensi
- [ ] Hubungkan deploy otomatis Vercel pada push ke main
- [ ] Verifikasi: CI berjalan pada PR, deploy preview muncul

### 0.13 Setup Struktur Folder Proyek
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

> **✅ Kriteria selesai Fase 0:** `npm run dev` menampilkan halaman React dengan canvas Phaser kosong, PWA bisa di-install, Supabase terhubung, deploy ke Vercel berhasil, CI/CD berjalan.

---

## Fase 1 · Kerangka Bersama & Alur Navigasi

### 1.1 Scene Boot & Preload
- [ ] Implementasi `Boot` scene: setup konfigurasi game, load pengaturan dari localStorage
- [ ] Implementasi `Preload` scene:
  - Bilah loading berbentuk pil kuning
  - Teks "Memuat…" / "Loading…"
  - Preload aset UI bersama (tombol, bintang, ikon)
  - Preload audio sprite dasar (klik, benar, salah)

### 1.2 Layar Pilih Bahasa (LanguageSelect)
- [ ] Dua tombol besar: 🇮🇩 Bahasa Indonesia & 🇬🇧 English
- [ ] Suara pengucapan nama bahasa saat ditekan
- [ ] Simpan pilihan ke localStorage
- [ ] Animasi transisi halus

### 1.3 Menu Utama (Home)
- [ ] Layout grid kartu game per kelompok keterampilan:
  - **Angka** (biru): Ayo Berhitung, Menulis Angka
  - **Huruf** (karang): Susun Kata, Bunyi Awal, Menulis Huruf
  - **Hijaiyyah** (tosca): Dengar & Temukan, Tebalkan Hijaiyyah
  - **Ingat & Main** (lembayung): Kartu Kembar, Petualangan Labirin
- [ ] Kartu game: ubin ikon, nama game, 3 bintang pencapaian
- [ ] Maskot Ms Ziya dengan balon ucapan "Ayo main!"
- [ ] Tombol tetap: 🌐 bahasa, ⛶ layar penuh, 🔊 suara
- [ ] Panel bawah: avatar dan jumlah bintang

### 1.4 Layar Pilih Mode (ModeSelect)
- [ ] Tombol 1 Pemain 👤 dan 2 Pemain 👤👤
- [ ] Ikon besar, mudah diketuk
- [ ] Animasi transisi

### 1.5 Layar Pilih Level (LevelSelect)
- [ ] Tiga tombol: ★ Mudah, ★★ Sedang, ★★★ Menantang
- [ ] Semua level terbuka (tidak terkunci)
- [ ] Warna sesuai kelompok keterampilan game yang dipilih

### 1.6 Layar Mulai (Ready)
- [ ] Judul game + ilustrasi
- [ ] Tombol besar "Klik Mulai" / "Click Start" dengan ikon panah ▶
- [ ] Ms Ziya membacakan instruksi singkat
- [ ] Tombol 🔊 untuk mengulang instruksi

### 1.7 Layar Hasil (Result)
- [ ] Bintang muncul satu per satu dengan animasi dan suara
- [ ] Maskot bertepuk tangan
- [ ] Tiga tombol: Main Lagi, Naik Level, Menu
- [ ] Mode duel: tampilkan pemenang (mahkota) dan "seri", kedua anak dapat bintang

### 1.8 GameBase (Kelas Induk)
- [ ] Menerima `{ gameId, level, mode, lang }`
- [ ] Mengelola HUD: bintang, tombol home, layar penuh, suara, ulang
- [ ] Sistem umpan balik benar/salah (animasi + suara)
- [ ] Bantuan otomatis setelah diam 30 detik
- [ ] Jeda otomatis setelah 2 menit tanpa sentuhan
- [ ] Transisi ke Result scene saat game selesai
- [ ] Penghitungan skor dan bintang

### 1.9 Fitur Umum UI
- [ ] **Tombol layar penuh** (U-05): Fullscreen API + fallback iPhone
- [ ] **Gerbang orang tua** (U-10): tahan 3 detik atau soal hitung sederhana
- [ ] **Tombol home/kembali** (U-09): dilindungi gerbang orang tua
- [ ] **Orientasi lanskap**: deteksi potret → tampilkan petunjuk putar layar
- [ ] **Touch handling**: matikan zoom, scroll, long-press, pull-to-refresh
- [ ] **Audio unlock**: sentuhan pertama di layar bahasa/Mulai

### 1.10 VoiceGuide Module
- [ ] Sistem antrean suara (agar tidak bertabrakan)
- [ ] Putar suara Ms Ziya sesuai bahasa
- [ ] Tombol 🔊 untuk mengulang instruksi
- [ ] Fallback jika audio gagal dimuat (game tidak crash)

### 1.11 Analytics Module
- [ ] Pembungkus peristiwa anonim (game, level, mode, bahasa, durasi, hasil)
- [ ] Bisa dimatikan
- [ ] Tanpa cookie, tanpa pengenal pengguna

> **✅ Kriteria selesai Fase 1:** Alur lengkap dari pilih bahasa → menu → mode → level → layar mulai → (game placeholder kosong) → layar hasil berjalan mulus di dua bahasa. Tombol layar penuh, suara, dan gerbang orang tua berfungsi.

---

## Fase 2 · Modul Bersama (Shared Modules)

### 2.1 TracingEngine
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

### 2.2 ChoiceRound
- [ ] Tampilkan N pilihan dalam kotak/lingkaran ≥ 160px
- [ ] Jarak antar pilihan ≥ 24px
- [ ] Deteksi ketukan pada pilihan
- [ ] Umpan balik benar: membesar-mengecil, kilau, bintang terbang (≤ 800ms)
- [ ] Umpan balik salah: goyang kiri-kanan lembut (≤ 400ms)
- [ ] Suara umpan balik
- [ ] Kedipan bantuan: pilihan benar berkedip pelan setelah N kali salah (per level)

### 2.3 DuelSplitScreen
- [ ] Membagi canvas jadi dua zona (kiri-kanan atau atas-bawah)
- [ ] Warna latar berbeda per zona (biru dan oranye lembut)
- [ ] Memetakan `pointer.id` ke zona masing-masing
- [ ] Mengabaikan sentuhan di zona lawan
- [ ] Palm rejection dasar
- [ ] HUD per pemain (skor, bintang)
- [ ] Sorot giliran (untuk game bergilir seperti Kartu Kembar)

### 2.4 ParentGate (React Component)
- [ ] Overlay DOM di atas canvas
- [ ] Mode 1: tahan tombol 3 detik (cincin pengisi animasi)
- [ ] Mode 2: soal hitung sederhana (misalnya "3 + 4 = ?")
- [ ] Dipakai untuk: ubah bahasa, login, keluar game, pengaturan

### 2.5 Storage Module
- [ ] Pembungkus localStorage:
  - Bahasa, volume, level terakhir per game
- [ ] Pembungkus IndexedDB (idb-keyval) untuk data bermain lokal
- [ ] Antrean lokal: simpan hasil putaran sebelum dikirim ke Supabase
- [ ] Sinkronisasi: kirim antrean ke server saat online dan login
- [ ] Penanganan error (storage penuh, mode privat browser)

> **✅ Kriteria selesai Fase 2:** Tracing engine bisa menelusuri huruf A dengan jari, ChoiceRound menampilkan pilihan dan umpan balik, DuelSplitScreen membagi layar tanpa konflik sentuhan. Semua modul lolos unit test.

---

## Fase 3 · Game — Kelompok Hijaiyyah 🟩

### 3.1 H-01 · Dengar & Temukan Hijaiyyah
- [ ] Ms Ziya mengucapkan bunyi huruf hijaiyyah
- [ ] Tampilkan pilihan huruf (pakai ChoiceRound)
- [ ] **Mudah:** 2 pilihan, 10 huruf awal, kedipan bantuan setelah 2× salah
- [ ] **Sedang:** 3 pilihan, 20 huruf
- [ ] **Menantang:** 4 pilihan, 28 huruf (termasuk mirip: ب ت ث)
- [ ] Tombol speaker besar untuk ulang bunyi
- [ ] Mode 1 pemain: 5–10 soal per putaran
- [ ] Mode 2 pemain: satu bunyi, dua papan pilihan, adu cepat, poin terbanyak dari 5 soal

### 3.2 H-02 · Tebalkan Hijaiyyah
- [ ] Huruf hijaiyyah sebagai garis putus-putus (pakai TracingEngine)
- [ ] **Mudah:** huruf besar, jalur lebar, panah arah, titik awal berkedip, toleran
- [ ] **Sedang:** jalur lebih sempit, tanpa panah, titik awal saja
- [ ] **Menantang:** jalur sempit, huruf kecil, tanpa titik awal, bantuan setelah 10 detik
- [ ] Jejak berwarna saat ditelusuri
- [ ] Mode 2 pemain: dua huruf sama di dua area, adu cepat dan akurat
- [ ] **Konten:** data jalur 28 huruf hijaiyyah (bentuk tunggal/terpisah)

> **✅ Kriteria selesai Fase 3:** Dua game hijaiyyah berjalan di 3 level, 1 dan 2 pemain, dalam 2 bahasa. Suara hijaiyyah benar.

---

## Fase 4 · Game — Kelompok Angka 🔵

### 4.1 A-01 · Ayo Berhitung
- [ ] Tampilkan benda (buah, hewan, balon) di layar
- [ ] Anak mengetuk benda satu per satu → benda bergerak ke keranjang + Ms Ziya sebut angka
- [ ] Benda sudah dihitung berubah tampilan (tidak bisa dihitung ulang)
- [ ] Cocokkan jumlah dengan angka yang benar
- [ ] **Mudah:** 1–5, 2 pilihan, benda tersusun rapi
- [ ] **Sedang:** 1–10, 3 pilihan, benda tersebar
- [ ] **Menantang:** 1–20, 4 pilihan, beberapa jenis benda (hitung satu jenis saja)
- [ ] Mode 2 pemain: dua kelompok benda terpisah, adu cepat
- [ ] Posisi benda diacak dengan jarak minimum agar tidak bertumpuk

### 4.2 A-02 · Menulis Angka
- [ ] Angka sebagai jalur putus-putus (pakai TracingEngine)
- [ ] **Mudah:** 0–9, jalur lebar, panah arah, titik awal berkedip
- [ ] **Sedang:** 10–15, jalur sedang, tanpa panah
- [ ] **Menantang:** 16–20, jalur sempit, dua digit ditulis berurutan
- [ ] Mode 2 pemain: angka sama di dua area, adu cepat
- [ ] **Konten:** data jalur angka 0–20

> **✅ Kriteria selesai Fase 4:** Dua game angka berjalan di 3 level, 1 dan 2 pemain. Benda bisa dihitung, angka bisa ditulis.

---

## Fase 5 · Game — Kelompok Huruf 🔴

### 5.1 L-01 · Susun Kata
- [ ] Gambar benda + Ms Ziya mengeja huruf demi huruf
- [ ] Anak menyeret/mengetuk kepingan huruf ke kotak urutan yang benar
- [ ] **Mudah:** 3 huruf, kotak berisi huruf samar sebagai petunjuk, tanpa pengecoh
- [ ] **Sedang:** 4 huruf, tanpa huruf samar, 1–2 huruf pengecoh
- [ ] **Menantang:** 5–6 huruf, beberapa pengecoh, Ms Ziya hanya mengeja sekali
- [ ] Kotak benar menyala hijau lembut
- [ ] Mode 2 pemain: kata sama, dua papan susun, adu cepat
- [ ] **Konten:** daftar kosakata per bahasa (kata, gambar, suara)

### 5.2 L-02 · Bunyi Awal
- [ ] Ms Ziya sebut kata + gambar tampil
- [ ] Anak mengetuk huruf pertama dari kata (pakai ChoiceRound)
- [ ] **Mudah:** 2 pilihan, gambar tetap, kata diulang otomatis
- [ ] **Sedang:** 3 pilihan, ulang lewat ikon speaker
- [ ] **Menantang:** 4 pilihan, huruf mirip (b/d, m/n)
- [ ] Mode 2 pemain: satu kata, dua papan pilihan, adu cepat, poin dari 5 soal

### 5.3 L-03 · Menulis Huruf
- [ ] Huruf sebagai jalur putus-putus (pakai TracingEngine)
- [ ] **Mudah:** A–Z huruf besar, jalur lebar, panah, titik awal berkedip
- [ ] **Sedang:** A–Z huruf besar, jalur sempit, tanpa panah
- [ ] **Menantang:** a–z huruf kecil, jalur sempit, hanya titik awal
- [ ] Warna jejak berbeda tiap goresan
- [ ] Mode 2 pemain: huruf sama di dua area, adu cepat
- [ ] **Konten:** data jalur A–Z dan a–z

> **✅ Kriteria selesai Fase 5:** Tiga game huruf berjalan di 3 level, 1 dan 2 pemain. Kosakata ID dan EN lengkap.

---

## Fase 6 · Game — Kelompok Daya Ingat & Game 🟣

### 6.1 G-01 · Kartu Kembar
- [ ] Kartu tertutup bermotif bintang tersusun dalam grid
- [ ] Ketuk 2 kartu → balik → cocok = tetap terbuka, tidak = tutup setelah 1,5 detik
- [ ] **Mudah:** 6 kartu (3 pasang), gambar besar dan beda jelas
- [ ] **Sedang:** 12 kartu (6 pasang), gambar lebih bervariasi
- [ ] **Menantang:** 20 kartu (10 pasang), gambar mirip, dibuka 2 detik di awal
- [ ] Animasi balik 300ms, kartu cocok berkedip
- [ ] Tema kartu dari konten game lain (hewan, buah, angka, huruf, hijaiyyah)
- [ ] Algoritma acak Fisher–Yates, kunci input saat dua kartu dibandingkan
- [ ] Mode 2 pemain: bergiliran, sorotan warna giliran siapa, pasangan terbanyak menang

### 6.2 G-02 · Petualangan Labirin
- [ ] Anak geser karakter dengan jari (seret) melewati labirin menuju makanan
- [ ] Dinding tidak mematikan: karakter berhenti dan bergetar pelan
- [ ] **Mudah:** 5×5, satu jalur utama, tanpa jalan buntu
- [ ] **Sedang:** 7×7, beberapa jalan buntu
- [ ] **Menantang:** 9×9, banyak jalan buntu, 3 bintang dikumpulkan
- [ ] Labirin diacak (recursive backtracker) dengan jaminan selalu bisa diselesaikan
- [ ] Labirin berwarna lembut, dinding tebal berwarna
- [ ] Mode 2 pemain: dua labirin identik berdampingan, adu cepat ke makanan

> **✅ Kriteria selesai Fase 6:** Dua game daya ingat berjalan di 3 level, 1 dan 2 pemain. Labirin selalu solvable.

---

## Fase 7 · Akun Orang Tua & Perkembangan Anak

### 7.1 Mode Tamu (U-13)
- [ ] Semua game bisa dimainkan tanpa login
- [ ] Data tersimpan di perangkat (localStorage + IndexedDB)

### 7.2 Login Orang Tua (U-14)
- [ ] Halaman login di balik gerbang orang tua
- [ ] Supabase Auth: email magic link atau OTP
- [ ] Opsional: Google OAuth
- [ ] Tanpa kata sandi (mudah bagi orang tua)

### 7.3 Profil Anak (U-15)
- [ ] Orang tua tambah profil anak: nama panggilan + avatar (bukan nama asli)
- [ ] Pilih profil dari menu
- [ ] Mode 2 pemain: tiap pemain pilih profil sendiri

### 7.4 Simpan Data Bermain (U-16)
- [ ] Hasil putaran tersimpan ke tabel `rounds`
- [ ] Data mode tamu bisa dipindahkan ke akun saat login pertama
- [ ] Sinkronisasi satu arah → dua arah
- [ ] Anak tidak pernah menunggu jaringan

### 7.5 Ringkasan Perkembangan (U-17)
- [ ] Halaman orang tua: capaian per keterampilan
- [ ] Teks capaian "Sudah bisa…" (dari `milestones.json`)
- [ ] Aturan capaian: ≥ 80% benar pada 3 putaran terakhir
- [ ] Menampilkan "sedang dilatih" untuk keterampilan yang belum tercapai

### 7.6 Hapus Data (U-18)
- [ ] Orang tua bisa hapus profil anak → CASCADE hapus semua data terkait
- [ ] Orang tua bisa hapus seluruh akun → Edge Function hapus akun Auth + semua data

### 7.7 Lanjut di Perangkat Lain (U-19)
- [ ] Level dan bintang tersinkron saat login di perangkat lain

### 7.8 Supabase Edge Functions
- [ ] Edge Function: hapus akun lengkap (butuh `service_role` key)
- [ ] Edge Function: ringkas data lama (> 12 bulan)

> **✅ Kriteria selesai Fase 7:** Orang tua bisa login, buat profil anak, lihat ringkasan perkembangan. RLS lolos uji dua akun berbeda.

---

## Fase 8 · Konten & Aset

> ⚠️ **PENTING:** Fase ini harus berjalan **paralel** dengan Fase 1–6. Konten adalah pekerjaan terbesar di luar kode.

### 8.1 Rekaman Suara Ms Ziya
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

### 8.2 Efek Suara & Musik
- [ ] Klik tombol, benar, coba lagi, bintang, kemenangan
- [ ] Musik latar lembut (bisa dibisukan)
- [ ] Hindari suara keras mendadak

### 8.3 Ilustrasi & Maskot
- [ ] Desain maskot Ms Ziya: 6 pose (menyapa, berpikir, bertepuk tangan, menyemangati, menunjuk, tidur)
- [ ] Benda hitung (buah, hewan, balon)
- [ ] Gambar kosakata (ID dan EN)
- [ ] Gambar kartu kembar
- [ ] Karakter dan makanan untuk labirin
- [ ] Logo "Play with Ms Ziya"
- [ ] Ikon aplikasi dan PWA
- [ ] Gaya: vektor datar, garis tepi navy tebal, sudut membulat

### 8.4 Komponen UI
- [ ] Tombol (pil kuning, pil biru, lingkaran ikon)
- [ ] Kartu game
- [ ] Bintang (terisi kuning, kosong lavender)
- [ ] Bilah muat
- [ ] Balon ucapan
- [ ] Ikon (home, speaker, layar penuh, ulang, panah)

### 8.5 Data Jalur Tulisan
- [ ] Jalur goresan angka 0–20 (polyline dari SVG)
- [ ] Jalur goresan A–Z dan a–z
- [ ] Jalur goresan 28 huruf hijaiyyah (bentuk tunggal)
- [ ] Urutan goresan hijaiyyah ditinjau guru ngaji/ahli
- [ ] Skrip ekspor SVG → JSON

### 8.6 Daftar Kosakata
- [ ] Kata-kata per bahasa untuk Susun Kata (3, 4, 5–6 huruf)
- [ ] Kata-kata per bahasa untuk Bunyi Awal
- [ ] Gambar dan suara per kata
- [ ] Kata mudah, bersuku kata jelas, netral budaya

### 8.7 Data Capaian (Milestones)
- [ ] Buat `src/content/milestones.json`:
  - Per keterampilan, game, level
  - Teks dalam ID dan EN

> **✅ Kriteria selesai Fase 8:** Semua aset suara, gambar, dan data konten lengkap dan terintegrasi ke dalam game.

---

## Fase 9 · Polish, Animasi & Aksesibilitas

### 9.1 Animasi & Transisi
- [ ] Tombol ditekan: turun 4px lalu memantul (120ms)
- [ ] Jawaban benar: membesar-mengecil, kilau, bintang terbang ke HUD (≤ 800ms)
- [ ] Jawaban salah: goyang kiri-kanan lembut (≤ 400ms)
- [ ] Pindah layar: geser/pudar halus (300ms)
- [ ] Selesai: bintang satu per satu, maskot tepuk tangan
- [ ] Konfeti untuk menulis angka/huruf selesai

### 9.2 Aksesibilitas
- [ ] Kontras teks ≥ 4,5:1 dan ikon ≥ 3:1
- [ ] Benar/salah tidak hanya lewat warna (tambah bentuk dan suara)
- [ ] Target sentuh ≥ 64px (utama ≥ 96px), jarak ≥ 16px
- [ ] Menu orang tua mendukung pembaca layar dan navigasi keyboard
- [ ] Label ARIA pada elemen interaktif
- [ ] Opsi "kurangi gerak" untuk orang tua
- [ ] Hindari kedipan > 3 kali per detik

### 9.3 Halaman Tambahan (React)
- [ ] Landing page
- [ ] Halaman kebijakan privasi (dua bahasa)
- [ ] Halaman "Tentang" (opsional)

### 9.4 Opsi Pengaturan Orang Tua
- [ ] Ganti bahasa (lewat gerbang orang tua)
- [ ] Volume (suara pemandu vs efek)
- [ ] Kurangi gerak
- [ ] Bisukan

> **✅ Kriteria selesai Fase 9:** Semua animasi halus, kontras lulus uji, pembaca layar berfungsi di menu orang tua, kebijakan privasi tersedia.

---

## Fase 10 · Testing & Quality Assurance

### 10.1 Unit Test (Vitest)
- [ ] Logika labirin (selalu solvable)
- [ ] Pengacak kartu (Fisher–Yates)
- [ ] Penilaian tracing (toleransi, urutan goresan)
- [ ] Skor duel
- [ ] Fungsi `t()` i18n
- [ ] Aturan capaian (milestones)
- [ ] Storage module

### 10.2 E2E Test (Playwright)
- [ ] Alur lengkap: bahasa → menu → mode → level → mulai → game → hasil
- [ ] Emulasi sentuh dan multi-sentuh
- [ ] Mode 2 pemain tidak bertabrakan
- [ ] Gerbang orang tua berfungsi
- [ ] Login orang tua → profil anak → ringkasan

### 10.3 Performa (Lighthouse CI)
- [ ] Muat pertama ≤ 3 detik di 4G
- [ ] Ukuran muat awal ≤ 5 MB
- [ ] 60 fps di tablet menengah
- [ ] Total aset ≤ 60 MB

### 10.4 Visual Test
- [ ] Screenshot per layar per viewport (mobile, tablet)
- [ ] Pastikan teks tidak terpotong
- [ ] Warna sesuai design system

### 10.5 Uji Perangkat Nyata
- [ ] Tablet Android kelas menengah
- [ ] HP Android entry-level
- [ ] iPad
- [ ] iPhone (Safari)
- [ ] Sentuhan, audio, fullscreen di setiap perangkat

### 10.6 Uji Keamanan
- [ ] RLS: akun orang tua A tidak bisa akses data orang tua B
- [ ] `service_role` key tidak ada di kode klien atau variabel `VITE_*`
- [ ] CSP header aktif dan ketat
- [ ] Tidak ada skrip pihak ketiga
- [ ] `npm audit` bersih

### 10.7 Uji Pengguna (User Testing)
- [ ] 3–5 anak usia 4–6 tahun dengan pendamping
- [ ] Observasi:
  - Bisa menyelesaikan 1 putaran tanpa bantuan?
  - Tracing nyaman di layar kecil?
  - Suara jelas?
  - Berapa lama fokus bermain?
  - Mode 2 pemain bisa dipakai?
- [ ] Iterasi berdasarkan temuan

> **✅ Kriteria selesai Fase 10:** Semua test hijau, performa sesuai target, uji pengguna lulus, keamanan lolos audit.

---

## Fase 11 · Rilis & Pasca-Rilis

### 11.1 Persiapan Rilis
- [ ] Tinjauan hukum kepatuhan data anak (sebelum login dirilis)
- [ ] Kebijakan privasi final (dua bahasa)
- [ ] Tinjauan konten hijaiyyah oleh guru ngaji
- [ ] Ikon dan screenshot untuk PWA store listing
- [ ] Vercel: pastikan paket sesuai (Hobby vs Pro)

### 11.2 Rilis MVP
- [ ] Deploy ke production (Vercel)
- [ ] Smoke test di production
- [ ] Monitor error (Vercel logs)
- [ ] Monitor analitik anonim (Vercel Web Analytics / Plausible)

### 11.3 Pasca-Rilis & Iterasi
- [ ] Pantau metrik:
  - Sesi tanpa bantuan ≥ 70%
  - Durasi sesi 8–12 menit
  - Pengguna kembali 7 hari ≥ 30%
  - Naik level ≥ 40%
  - Mode 2 pemain ≥ 20%
  - Muat ≤ 3 detik ≥ 90% sesi
- [ ] Kumpulkan umpan balik orang tua
- [ ] Bug fix dan perbaikan berdasarkan data

### 11.4 Rencana Fase 2 (Pasca-MVP)
- [ ] Album stiker koleksi
- [ ] Laporan perkembangan rinci (grafik mingguan, ekspor PDF)
- [ ] Bahasa tambahan (Arab, Sunda)
- [ ] Mode online antar perangkat
- [ ] Huruf hijaiyyah bentuk awal/tengah/akhir
- [ ] Aplikasi native (iOS, Android)

---

## Ringkasan Tech Stack

| Lapisan | Teknologi |
| --- | --- |
| Bahasa | TypeScript |
| Build Tool | Vite |
| Framework | React (SPA) + React Router |
| Game Engine | Phaser 3 |
| Styling | Tailwind CSS |
| Audio | Phaser Sound (Web Audio) + audio sprite |
| i18n | File JSON + fungsi `t()` |
| State | localStorage + IndexedDB |
| PWA | vite-plugin-pwa (Workbox) |
| Backend | Supabase (Auth, Postgres, Edge Functions) |
| Hosting | Vercel (situs statis) |
| Analitik | Vercel Web Analytics / Plausible |
| Testing | Vitest + Playwright |
| CI/CD | GitHub Actions + Dependabot |

---

## Ringkasan 9 Game

| # | Game | Kelompok | Modul Utama |
|---|------|----------|-------------|
| 1 | Dengar & Temukan Hijaiyyah (H-01) | Hijaiyyah 🟩 | ChoiceRound |
| 2 | Tebalkan Hijaiyyah (H-02) | Hijaiyyah 🟩 | TracingEngine |
| 3 | Ayo Berhitung (A-01) | Angka 🔵 | Custom + ChoiceRound |
| 4 | Menulis Angka (A-02) | Angka 🔵 | TracingEngine |
| 5 | Susun Kata (L-01) | Huruf 🔴 | Custom (drag & drop) |
| 6 | Bunyi Awal (L-02) | Huruf 🔴 | ChoiceRound |
| 7 | Menulis Huruf (L-03) | Huruf 🔴 | TracingEngine |
| 8 | Kartu Kembar (G-01) | Daya Ingat 🟣 | Custom (flip cards) |
| 9 | Petualangan Labirin (G-02) | Daya Ingat 🟣 | Custom (maze generator) |

---

> [!IMPORTANT]
> **Fase 8 (Konten & Aset) harus dimulai paralel sejak Fase 1.** Rekaman suara dan data jalur tulisan adalah jalur kritis yang membutuhkan waktu paling lama dan melibatkan pihak luar (narator, guru ngaji).

> [!WARNING]
> **Sebelum merilis fitur login orang tua**, wajib konsultasi ahli hukum mengenai UU Pelindungan Data Pribadi (pemrosesan data anak, persetujuan orang tua, retensi, lokasi server).
