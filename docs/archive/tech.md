# tech.md — Tech Stack: Play with Ms Ziya

Dokumen ini turunan dari PRD (web, layar sentuh, usia 4–6 tahun, 9 game, ID/EN, 1 dan 2 pemain). Isinya usulan untuk disepakati tim teknis; versi library memakai rilis stabil terbaru yang sudah ditambal saat proyek dimulai.

**Keputusan pemilik produk (versi ini):** hosting Vercel, autentikasi dan database Supabase. Next.js diganti dengan **Vite + React sebagai situs statis (SPA)**: tanpa server aplikasi, sehingga tidak ada lapisan server yang bisa diserang (lihat bagian 7). Dampaknya pada PRD: "akun dan login" yang tadinya di luar MVP kini perlu diputuskan lagi (lihat bagian 4).

## 1. Ringkasan Keputusan

| Lapisan         | Pilihan                                                        | Alasan singkat                                                                                  |
| --------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Bahasa          | TypeScript                                                     | Aman untuk konfigurasi game yang banyak (level, bahasa, konten)                                 |
| Build tool      | Vite                                                           | Cepat, sederhana, hasil build berupa berkas statis                                              |
| Framework web   | React (SPA, tanpa server-side rendering) + React Router        | Halaman landing, privasi, dan area orang tua; seluruh kode berjalan di peramban                 |
| Game engine     | Phaser 3                                                       | Canvas/WebGL, input sentuh multi-pointer, tween, scene, audio, scaling dan fullscreen sudah ada |
| UI di luar game | React + CSS (Tailwind atau CSS Modules)                        | Untuk gerbang orang tua, pengaturan, login orang tua, dan halaman kebijakan privasi             |
| Audio           | Phaser Sound (Web Audio) + audio sprite                        | Satu berkas per bahasa, jeda minimal saat main                                                  |
| Bahasa/i18n     | File JSON per bahasa + fungsi `t()` kecil                      | Cukup untuk 2 bahasa, tanpa library berat                                                       |
| State           | Objek store sederhana + localStorage                           | Bahasa, volume, level terakhir; dasar untuk main tanpa login                                    |
| PWA/offline     | vite-plugin-pwa (Workbox)                                      | Bisa dipasang ke layar utama dan main tanpa internet                                            |
| Backend         | Supabase (BaaS terkelola) + Supabase Edge Functions bila perlu | Tidak perlu membangun server sendiri; lihat bagian 4                                            |
| Autentikasi     | Supabase Auth, **hanya akun orang tua**                        | Anak tidak punya akun; data minimal                                                             |
| Database        | Supabase Postgres dengan Row Level Security (RLS)              | Kemajuan anak per orang tua; lokasi proyek Singapura (ap-southeast-1)                           |
| Hosting         | Vercel (situs statis)                                          | Deploy otomatis dari Git, CDN global, preview per PR; tanpa fungsi server                       |
| Analitik        | Vercel Web Analytics atau Plausible (tanpa cookie)             | Anonim, ringan, sesuai privasi anak                                                             |
| Pengujian       | Vitest, Playwright (emulasi sentuh), uji di perangkat nyata    | Lihat bagian 8                                                                                  |
| CI/CD           | GitHub Actions → deploy otomatis                               | Build, lint, test, deploy preview per PR                                                        |

## 2. Frontend

### 2.1 Mengapa Phaser 3 (bukan React murni)

- 9 game butuh canvas: menelusuri huruf dengan jari, seret karakter di labirin, kartu membalik, benda berpindah ke keranjang.
- Phaser menyediakan scene manager, tween/animasi, input multi-pointer (penting untuk mode 2 pemain), dan penskalaan layar (`Scale.FIT`, fullscreen).
- Alternatif yang dipertimbangkan: PixiJS (lebih ringan tapi harus membangun scene dan input sendiri), React + Konva (nyaman untuk UI, kurang cocok untuk game), Godot web export (ukuran besar, kurang ramah muat cepat).

### 2.1b Vite + React + Phaser: cara menyatukan

- Seluruh aplikasi dibangun menjadi berkas statis (HTML, JS, aset) dan disajikan dari CDN Vercel. Tidak ada server-side rendering, tidak ada Server Actions, tidak ada middleware.
- Halaman game satu rute (misalnya `/play`) yang memuat kanvas Phaser dalam komponen React; perpindahan antar scene terjadi di dalam Phaser, bukan antar rute, agar tidak ada muat ulang saat anak bermain.
- Halaman lain (landing, privasi, area orang tua, login) memakai React biasa. Halaman game dimuat dengan _lazy loading_ agar landing tetap ringan.
- Aset game besar (audio, atlas) disajikan dari `public/` dan di-cache service worker.
- Pengaturan Vercel: proyek dipasang sebagai situs statis dengan _rewrite_ semua rute ke `index.html` (dibutuhkan SPA) dan _header_ keamanan lewat `vercel.json` (lihat bagian 7).
- Alternatif yang dipertimbangkan: SvelteKit atau Astro (juga bisa statis), tetapi React dipilih karena ekosistem komponen dan kemudahan mencari tenaga pengembang.

### 2.2 Arsitektur scene

```
Boot → Preload → LanguageSelect → Menu → ModeSelect → LevelSelect → Ready (Klik Mulai)
        → <GameScene> → Result → (Main lagi | Naik level | Menu)
```

- `GameBase` (kelas induk): menerima `{ gameId, level, mode, lang }`, mengelola HUD, giliran/skor, umpan balik benar/salah, bantuan setelah diam 30 detik, dan layar hasil.
- Setiap game mewarisi `GameBase` dan hanya mengisi aturan soal.
- Konten game **berbasis data** (JSON per game, per level, per bahasa) agar penambahan kata atau soal tidak mengubah kode.

### 2.3 Modul bersama

| Modul             | Fungsi                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `TracingEngine`   | Dipakai H-02, A-02, L-03: memuat jalur goresan (polyline), menghitung kemajuan telusur, toleransi jalur per level, animasi tebal saat benar |
| `ChoiceRound`     | Dipakai H-01, A-01 (bagian cocokkan), L-02: tampilkan N pilihan, deteksi ketukan, umpan balik                                               |
| `DuelSplitScreen` | Membagi layar jadi dua zona, memetakan `pointer.id` ke zona, mengabaikan sentuhan di zona lawan                                             |
| `VoiceGuide`      | Memutar suara Ms Ziya sesuai bahasa, tombol ulang, antrean agar suara tidak bertabrakan                                                     |
| `ParentGate`      | Tahan 3 detik atau soal hitung sederhana (DOM overlay)                                                                                      |
| `Storage`         | Pembungkus localStorage (bahasa, volume, level terakhir) dengan penanganan error                                                            |
| `Analytics`       | Pembungkus peristiwa anonim; mati bila dinonaktifkan                                                                                        |

### 2.4 Algoritma kunci

- **Tracing:** jalur huruf disimpan sebagai titik-titik berurutan (hasil ekspor dari SVG). Jari dianggap benar bila jarak ke titik berikutnya ≤ toleransi; progres naik berurutan, sehingga urutan goresan dan arah ikut diperiksa. Titik hijaiyyah (nuqtah) diperlakukan sebagai target ketuk terpisah.
- **Labirin:** pembangkit _recursive backtracker_ dengan _seed_; ukuran 5×5, 7×7, 9×9; jalan buntu ditambah sesuai level; pemeriksaan bahwa jalur selalu ada.
- **Kartu kembar:** Fisher–Yates untuk acak, kunci input saat dua kartu sedang dibandingkan.
- **Ayo Berhitung:** posisi benda diacak dengan aturan jarak minimum agar tidak bertumpuk; benda yang sudah dihitung diberi penanda.

### 2.5 Layar sentuh dan penskalaan

- Kanvas desain tetap **1280 × 720 (16:9)**, diskalakan `FIT` dan dipusatkan; area aman tetap terlihat di rasio lain.
- `touch-action: none`, `user-select: none`, matikan zoom, gulir, tekan-lama menu konteks, dan tarik-segarkan.
- Target sentuh minimal 64 px pada kanvas desain (lihat design.md).
- Fullscreen: Fullscreen API (termasuk awalan `webkit`); bila tidak tersedia (iPhone Safari) tombol disembunyikan dan PWA mode _standalone_ dianjurkan.
- Kunci orientasi lanskap lewat manifest PWA; di potret tampilkan petunjuk putar layar.

### 2.6 Font

- Tampilan: font bulat tebal berlisensi terbuka (Fredoka atau Baloo 2), teks isi Nunito. Di-host sendiri (tanpa CDN pihak ketiga) demi privasi dan offline.
- Huruf hijaiyyah ditampilkan dengan Noto Naskh Arabic atau Scheherazade New; **jalur tulisnya tetap dari data jalur**, bukan dari font, agar urutan goresan akurat.

## 3. Audio

- Format utama MP3 (kompatibel luas termasuk Safari); cadangan OGG bila perlu.
- **Audio sprite per bahasa dan kategori** (misalnya `id-angka.mp3` dengan peta waktu JSON) agar jumlah permintaan sedikit dan jeda kecil.
- Rekaman asli oleh narator (bukan suara sintetis) untuk hijaiyyah dan ejaan; normalisasi volume ke satu level (skrip ffmpeg).
- Peramban iOS menuntut sentuhan pertama untuk membuka audio: layar bahasa/Mulai berfungsi sebagai pembuka (_audio unlock_).
- Efek suara lebih pelan dari suara pemandu; tombol bisukan selalu ada.

## 4. Backend dan Database

### 4.1 Apakah butuh backend?

- **Untuk bermain: tidak.** Seluruh 9 game berjalan di peramban dan tidak butuh server.
- **Untuk login dan menyimpan kemajuan: ya, tetapi tidak perlu server buatan sendiri.** Supabase menyediakan Auth, database Postgres, dan API otomatis, sehingga bagian "backend" cukup berupa konfigurasi, aturan akses (RLS), dan beberapa fungsi kecil.
- Logika yang memang harus di server (misalnya menghapus akun dan seluruh data anak, yang butuh hak khusus) dijalankan sebagai **Supabase Edge Function**, bukan server buatan sendiri. Klien memanggilnya dengan token sesi orang tua; kunci `service_role` hanya ada di rahasia Edge Function. Selebihnya langsung dari klien ke Supabase dengan RLS.

### 4.2 Prinsip: main dulu, login belakangan

1. **Mode tamu (tanpa login) adalah jalur utama.** Anak bisa langsung bermain; bahasa, volume, dan level terakhir disimpan di peramban.
2. **Login hanya untuk orang tua dan bersifat opsional.** Gunanya: menyimpan kemajuan agar tidak hilang, memakai di beberapa perangkat, dan (nanti) laporan kemajuan.
3. Saat orang tua login pertama kali, kemajuan lokal disalin ke akun (sinkronisasi satu arah, lalu dua arah).
4. Anak tidak mengisi apa pun: tidak ada email, tidak ada kata sandi, tidak ada nama asli.

### 4.3 Autentikasi (Supabase Auth)

| Aspek        | Usulan                                                                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| Metode       | Email magic link atau OTP; opsional Google. Tanpa kata sandi agar mudah bagi orang tua                                                         |
| Lokasi login | Di balik gerbang orang tua (menu pengaturan), bukan di layar awal anak                                                                         |
| Sesi         | `supabase-js` di peramban; token sesi disimpan di penyimpanan peramban, sehingga CSP ketat dan tanpa skrip pihak ketiga wajib (lihat bagian 7) |
| Penghapusan  | Orang tua bisa menghapus akun dan semua data anak dari menu pengaturan                                                                         |

### 4.4 Model data (usulan awal)

| Tabel        | Kolom utama                                                                                         | Catatan                                                                                                      |
| ------------ | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `profiles`   | `id` (= `auth.users.id`), `created_at`                                                              | Satu baris per orang tua                                                                                     |
| `children`   | `id`, `parent_id`, `nickname`, `avatar`, `created_at`                                               | Hanya nama panggilan dan avatar, bukan nama asli atau tanggal lahir                                          |
| `progress`   | `child_id`, `game_id`, `level`, `stars`, `best_result`, `updated_at`                                | Unik per (`child_id`, `game_id`, `level`); dipakai menu (bintang, level terakhir)                            |
| `rounds`     | `id`, `child_id`, `game_id`, `level`, `mode` (1p/2p), `correct`, `total`, `duration_s`, `played_at` | Satu baris per putaran selesai; bahan menghitung perkembangan. Tanpa isi jawaban mentah atau rekaman apa pun |
| `milestones` | `child_id`, `milestone_id`, `achieved_at`                                                           | Capaian "sudah bisa…" yang sudah tercapai (lihat 4.5)                                                        |

Aturan RLS (wajib aktif di setiap tabel): orang tua hanya dapat membaca dan menulis baris miliknya (`parent_id = auth.uid()`; `progress`, `rounds`, dan `milestones` lewat anak miliknya). Tidak ada akses publik anonim ke tabel mana pun.

### 4.4b Alur data bermain

1. Game selesai satu putaran → klien menulis ke antrean lokal (IndexedDB) → bila ada sesi login dan ada internet, dikirim ke `rounds` secara berkelompok; bila tidak, tetap menunggu di perangkat. Anak tidak pernah menunggu jaringan.
2. Mode tamu: hanya antrean lokal. Saat orang tua login pertama kali, ia memilih profil anak mana yang menerima data lokal itu.
3. Mode 2 pemain: tiap pemain memiliki `child_id` sendiri (atau tamu); satu putaran duel menghasilkan satu baris `rounds` per pemain.
4. Penulisan hanya lewat klien orang tua yang sedang login dan dibatasi RLS; klien tidak dapat menulis ke profil anak milik orang lain.

### 4.5 Menghitung capaian perkembangan

- Capaian didefinisikan sebagai data di `src/content/milestones.json`: `id`, keterampilan, `game_id`, level, dan teks dalam ID/EN (contoh: `count_10` = "Sudah bisa berhitung sampai 10").
- Aturan (usulan, bisa diubah tanpa mengubah kode): capaian tercapai bila **3 putaran terakhir** pada game dan level tersebut masing-masing memiliki **≥ 80% benar**.
- Pemeriksaan dijalankan di klien setiap putaran selesai, lalu hasilnya ditulis ke `milestones`; halaman orang tua hanya membaca `milestones` dan `rounds` terakhir untuk menampilkan "sedang dilatih".
- Alternatif bila ingin satu sumber kebenaran di server: view atau fungsi Postgres yang menghitung dari `rounds`. Pilih salah satu sebelum implementasi.
- Teks ringkasan bersifat gambaran hasil bermain, bukan penilaian atau diagnosis; hindari kata seperti "terlambat" atau "di bawah rata-rata".

### 4.6 Retensi dan penghapusan

- `rounds` yang lebih tua dari 12 bulan diringkas lalu dihapus (usulan); `milestones` dan `progress` dipertahankan selama profil ada.
- Hapus profil anak = hapus semua baris terkait (`ON DELETE CASCADE`). Hapus akun = hapus semua profil anak dan akun Auth, lewat Edge Function.
- Tidak ada data lokasi, perangkat, atau pengenal iklan yang disimpan.

### 4.7 Penyimpanan di perangkat

- `localStorage` untuk pengaturan kecil; `IndexedDB` (idb-keyval) bila data lokal membesar.
- Analitik anonim melalui layanan tanpa cookie; peristiwa hanya berisi nama game, level, mode, bahasa, durasi, dan hasil (tanpa pengenal pengguna).

### 4.8 Kepatuhan data anak

- Data anak adalah data sensitif secara praktik. Kumpulkan seminimal mungkin, dan hanya setelah persetujuan orang tua.
- Konsultasikan dengan ahli hukum soal UU Pelindungan Data Pribadi (pemrosesan data anak, persetujuan orang tua, retensi, lokasi server) **sebelum** fitur login dirilis. Dokumen ini bukan nasihat hukum.
- Siapkan kebijakan privasi dua bahasa yang menjelaskan data apa yang disimpan, di mana, dan cara menghapusnya.

## 5. PWA dan Offline

- Service worker (Workbox) men-cache cangkang aplikasi dan aset; aset per game dimuat saat pertama dibutuhkan lalu di-cache.
- Anggaran ukuran: muat awal ≤ 5 MB; total aset ≤ 60 MB (usulan, perlu dicek setelah aset jadi).
- Pembaruan: tampilkan pesan kecil bagi orang tua (di menu pengaturan) bila versi baru tersedia; jangan menyela anak yang sedang bermain.

## 6. Performa dan Kompatibilitas

- Target: 60 fps di tablet menengah; muat pertama ≤ 3 detik di 4G.
- Aset gambar: SVG untuk ilustrasi, dikemas menjadi atlas tekstur (PNG/WebP) lewat skrip build; hindari bobot tekstur berlebih.
- Peramban target: Chrome dan Safari (dua versi terakhir) di Android, iPadOS, iOS; Chrome di Windows layar sentuh.
- Uji minimal di: satu tablet Android kelas menengah, satu HP Android entry-level, satu iPad, satu iPhone.

## 7. Keamanan dan Privasi

- Tanpa pihak ketiga yang menaruh skrip pelacak; semua font dan pustaka di-host sendiri.
- _Content Security Policy_ ketat, HTTPS saja, `Referrer-Policy` ketat.
- Tidak ada tautan keluar; bila ada (kebijakan privasi, hubungi kami) letakkan di balik gerbang orang tua.
- Tidak ada kolom isian teks untuk anak.
- Kebijakan privasi singkat dalam dua bahasa sebelum rilis publik.

### Keamanan pilihan stack (situs statis + Supabase)

- **Mengapa bukan Next.js:** Next.js menjalankan kode di server (middleware, Server Actions, React Server Components), dan lapisan itu pernah beberapa kali kena kerentanan serius (bypass otorisasi di middleware pada 2025, eksekusi kode jarak jauh pada protokol React Server Components pada akhir 2025, serta rilis keamanan lanjutan sepanjang 2026). Game ini tidak membutuhkan lapisan server tersebut. Situs statis tidak punya runtime server di sisi kita yang bisa diserang.
- **Catatan jujur:** tidak ada stack yang bebas risiko. Situs statis memindahkan risiko ke (a) dependensi npm (rantai pasokan), (b) skrip yang berjalan di peramban (XSS), dan (c) konfigurasi Supabase (RLS). Tiga hal itu yang dijaga di bawah ini.
- **Dependensi:** kunci versi dengan lockfile, aktifkan Dependabot atau Renovate, jalankan `npm audit` di CI, hindari paket yang tidak perlu, dan tinjau paket baru sebelum ditambahkan.
- **XSS:** CSP ketat lewat `vercel.json` (`default-src 'self'`; izinkan hanya domain Supabase untuk koneksi; tanpa `unsafe-inline` bila memungkinkan), tanpa skrip pihak ketiga, tanpa `dangerouslySetInnerHTML`, dan tanpa kolom isian bebas untuk anak. Karena sesi login disimpan di peramban, ini penting.
- **Header lain:** `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (matikan kamera, mikrofon, lokasi karena tidak dipakai), dan `frame-ancestors 'none'`.
- **Supabase:** aktifkan RLS di semua tabel sejak awal dan uji dengan dua akun orang tua berbeda (satu orang tua tidak boleh melihat data lain). Hanya `anon key` yang boleh ada di klien; kunci `service_role` tidak boleh ada di kode klien, di repositori, maupun di variabel `VITE_*` (semua variabel berawalan itu ikut terbawa ke peramban). Pasang batas laju (rate limit) login di pengaturan Auth.
- **Akun dan Vercel:** aktifkan autentikasi dua langkah di akun Vercel, GitHub, dan Supabase; batasi anggota tim seperlunya.
- Vercel Hobby (gratis) ditujukan untuk penggunaan pribadi nonkomersial; bila produk dimonetisasi atau dipakai organisasi, perlu paket Pro. Cek syarat terbaru Vercel.

## 8. Pengujian

| Jenis           | Alat                                              | Cakupan                                                             |
| --------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| Unit            | Vitest                                            | Logika labirin, pengacak kartu, penilaian tracing, skor duel, `t()` |
| Komponen/e2e    | Playwright (emulasi sentuh dan multi-sentuh)      | Alur lengkap bahasa → hasil, mode 2 pemain tidak bertabrakan        |
| Performa        | Lighthouse CI                                     | Ukuran muat dan waktu muat                                          |
| Visual          | Tangkapan layar per layar dan per ukuran viewport | Mencegah teks terpotong                                             |
| Perangkat nyata | Uji manual (atau BrowserStack)                    | Sentuhan, audio, fullscreen                                         |
| Uji pengguna    | Anak 4–6 tahun dengan pendamping                  | Kenyamanan jalur tulis, kejelasan suara, durasi fokus               |

## 9. Struktur Proyek (usulan)

```
play-with-ms-zia/
├─ public/                # manifest, ikon PWA, audio dan atlas yang disajikan langsung
├─ src/
│  ├─ pages/              # React Router: Landing, Play, Parent (login, kemajuan), Privacy
│  ├─ App.tsx             # rute
│  ├─ main.tsx            # titik masuk Vite
│  ├─ game/               # semua kode Phaser (tanpa import dari React)
│  │  ├─ core/            # GameBase, Storage, Analytics, VoiceGuide
│  │  ├─ modules/         # TracingEngine, ChoiceRound, DuelSplitScreen
│  │  ├─ scenes/          # Boot, Preload, LanguageSelect, Menu, ModeSelect, LevelSelect, Ready, Result
│  │  └─ games/
│  │     ├─ hijaiyyah/    # listen-find, trace
│  │     ├─ angka/        # count, trace
│  │     ├─ huruf/        # spell, first-sound, trace
│  │     └─ memori/       # memory-cards, maze
│  ├─ components/         # React: ParentGate, Settings, LoginForm
│  ├─ lib/supabase/       # klien browser, tipe tabel
│  ├─ i18n/               # id.json, en.json, t.ts
│  └─ content/            # data per game, per level, per bahasa (kata, jalur tulis, labirin)
├─ supabase/              # migrasi SQL, kebijakan RLS, seed, functions/ (Edge Functions)
├─ vercel.json            # rewrite SPA dan header keamanan
├─ assets/
│  ├─ art/                # SVG sumber ilustrasi
│  ├─ audio/{id,en}/      # rekaman mentah dan sprite
│  └─ fonts/
├─ scripts/               # build atlas, build audio sprite, ekspor jalur tulis dari SVG
├─ tests/
└─ .github/workflows/
```

## 10. Peralatan Pendukung Konten

- **Jalur tulis:** digambar di Inkscape/Figma dengan urutan goresan, diekspor ke JSON lewat skrip; ditinjau guru ngaji untuk hijaiyyah.
- **Rekaman:** direkam, dibersihkan (derau), dipotong per kata, lalu dibuat audio sprite lewat skrip.
- **Ilustrasi:** vektor datar bergaya konsisten (lihat design.md), dikelola dalam satu file sumber per kelompok.

## 11. Keputusan Terbuka

| Keputusan                   | Opsi                                                     | Rekomendasi                                                                                     |
| --------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Engine game                 | Phaser 3 / PixiJS                                        | Phaser 3                                                                                        |
| Offline sejak MVP           | Ya / ditunda                                             | Ya (PWA ringan)                                                                                 |
| Framework                   | Next.js / Vite + React SPA / SvelteKit atau Astro statis | **Vite + React SPA** (Next.js diganti agar tidak ada lapisan server); game murni klien          |
| Hosting                     | Vercel                                                   | Vercel (sudah diputuskan); pakai paket Pro bila komersial                                       |
| Auth dan database           | Supabase                                                 | Supabase (sudah diputuskan); proyek di Singapura                                                |
| Login di MVP                | Wajib / opsional / tidak ada                             | **Opsional untuk orang tua; mode tamu tetap penuh** (perlu persetujuan, mengubah PRD)           |
| Analitik                    | Vercel Web Analytics / Plausible / tanpa analitik        | Vercel Web Analytics atau Plausible, anonim                                                     |
| Kontrol versi dan CI        | GitHub + Actions                                         | GitHub + Actions, ditambah Dependabot                                                           |
| Kepatuhan data anak         | Tinjauan hukum sebelum fitur login                       | Wajib sebelum rilis login                                                                       |
| Ringkasan perkembangan anak | MVP / fase 3                                             | **MVP** (capaian "sudah bisa…", versi sederhana); grafik mingguan dan ekspor menyusul di Fase 2 |
| Penghitung capaian          | Di klien / di server (Postgres)                          | Di klien dahulu; pindah ke server bila perlu satu sumber kebenaran                              |
| Aturan capaian              | 80% benar pada 3 putaran terakhir / lain                 | Usulan 80% dan 3 putaran; uji dengan anak                                                       |
