# Play with Ms Ziya — Architecture

Baseline 2026-11-25; cakupan [PRD](prd.md), UI [design](design.md), aturan kerja [ai-agents](ai-agents.md).

## Keadaan aktual dan keputusan

Aplikasi berada di `project/`, memakai React 19, TypeScript, Vite 8, React Router 7, Motion (LazyMotion strict), CSS Modules, CSS tokens v2, font self-hosted (`@fontsource/fredoka`, `@fontsource/nunito`, `@fontsource/noto-naskh-arabic`), dan Vitest 5. `package-lock.json` adalah sumber versi terpasang. Setelah Fase 5 + CMS C6 (2026-11-25):

- Sumber tunggal metadata game adalah `project/src/games/catalog.ts` (`CATALOG`, 9 game lazy-loaded dengan kontrak `GameModule` di `src/games/types.ts`). Seluruh kode/halaman legacy telah dihapus.
- 4 engine murni/reusable berada di `project/src/games/engines/`: `choice` (`choice.ts`, `useRoundMachine.ts`), `tracing` (`tracing.ts`, `TracingCanvas.tsx`), `memory` (`memory.ts`), dan `maze` (`maze.ts`), melayani 9 modul game (`ayo-berhitung`, `menulis-angka`, `susun-kata`, `bunyi-awal`, `menulis-huruf`, `dengar-temukan`, `tebalkan-hijaiyyah`, `kartu-kembar`, `petualangan-labirin`).
- Data glyph tracing berada di `project/src/content/glyphs/` (`digits.ts`, `latin-upper.ts`, `latin-lower.ts`, `hijaiyyah.ts`, total 90 glyph) dan data angka di `project/src/content/numbers.ts`. Game membaca objek/kata/hijaiyyah dari `ContentProvider` (`useContent()`), bukan import statis.
- Preferensi (`PreferencesProvider`), konten (`ContentProvider`, urutan CMS → cache → bawaan), dan audio (`AudioProvider` + `AudioManager`) aktif di `project/src/app/App.tsx` dengan router lazy + `AnimatePresence` (`project/src/app/routes.tsx`) dan `ErrorBoundary`.
- CMS admin (`/admin/*`) lazy-loaded lewat `AdminRoutes` (`src/admin/`) dengan `@supabase/supabase-js` dan guard ESLint `no-restricted-imports` agar hanya boleh di-import dari `src/admin/**` dan `src/lib/supabase/**`. Phaser, Tailwind, dan PWA tidak digunakan.

Pertahankan React dan Canvas untuk kebutuhan saat ini. Jangan memasukkan engine atau backend lain untuk mengikuti dokumen arsip; satu-satunya backend yang disetujui adalah Supabase untuk CMS admin (2026-11-25). Evaluasi engine hanya setelah keterbatasan terukur. Tidak ada kebutuhan SSR untuk baseline; folder Next.js belum ada dan tidak dibuat oleh restrukturisasi dokumentasi ini. Jika kelak dipilih, letakkan implementasi di bawah project/ dengan rencana migrasi eksplisit.

Keputusan redesign 2026-11-25: Motion dipasang sebagai library animasi React melalui LazyMotion, CSS Modules dipertahankan; GSAP tidak dipasang. Vitest menyediakan unit test kontrak sesi dan evaluasi tracing. Palet biru muda/pink dan motion mengikuti [design](design.md); status migrasi terdapat pada [plan PAUD](plan/2026-11-25-paud-redesign-plan.md).

## Struktur

> Struktur di bawah adalah keadaan aktual. Target restrukturisasi v2 (app/, design/, components/, worlds/, games/engines, content/, i18n/) ada di [plan PAUD v2 §3](plan/2026-11-25-paud-redesign-plan.md#3-arsitektur-dan-kontrak-target).

```text
/
├── docs/
│   ├── prd.md
│   ├── design.md
│   ├── architecture.md
│   ├── ai-agents.md
│   ├── plan/
│   ├── specs/
│   └── archive/
└── project/
    ├── package.json / package-lock.json
    ├── scripts/         # check-audio.mjs
    ├── public/          # audio/CREDITS.md, audio/bundled.json
    └── src/
        ├── main.tsx
        ├── admin/       # AdminRoutes, AdminLayout, RequireAdmin, media/, publish/, pages/
        ├── app/         # App.tsx, routes.tsx, ErrorBoundary.tsx, providers/
        ├── assets/      # logo.svg, ASSETS.md, illustrations/objects/ (71 SVG)
        ├── components/  # 18 komponen dasar + icons/ + ObjectImage/
        ├── content/     # objects, words, hijaiyyah, stickers, numbers, glyphs/
        ├── design/      # tokens.css, typography.css, global.css, motion.ts, useCalmMotion.ts
        ├── games/       # ids, catalog, types, Arena.module.css, engines/{choice,tracing,memory,maze}, 9 modul game
        ├── i18n/        # id.ts, en.ts, types.ts, useT.ts
        ├── lib/         # env.ts, storage/, random/, session/, stickers/, audio/, content/, fullscreen/, supabase/
        ├── pages/       # Splash, Home, World, Intro, Play, Result, Stickers, Parents, Kit (dev-only)
        └── worlds/      # worlds.ts, WorldBackground.tsx, 4 latar dunia, characters/ (5 × 3 mood)
```

Metadata .git tetap di root. i18n/, content/, dan lib/ merupakan direktori target yang ditambahkan hanya saat ada implementasi penggunanya. Komponen khusus halaman tetap di pages/<Page>/components; ekstraksi bersama dilakukan ketika benar-benar dipakai lintas halaman.

## Routing dan aliran data

Rute aktual: /, /preload, /game/:gameId/intro, /game/:gameId/play, /game/:gameId/result. Beranda memilih game → intro membentuk konfigurasi sesi → shell memvalidasi gameId terhadap registry → komponen game menerima GameProps → onFinish(GameResult) → hasil. onQuit kembali ke beranda. ID tak dikenal atau sesi hasil hilang harus memberi fallback yang aman; perilaku fallback masih perlu diuji.

Game menyimpan state putaran lokal; shell memiliki navigasi dan kontrol sesi. Kontrak aktual memuat gameId, difficulty (mudah/sedang/tantang), players, onFinish, onQuit; hasil stars dan score. Label UI “Menantang” dipetakan ke ID tantang. Bahasa, seed soal, giliran, dan hasil per pemain adalah kebutuhan target: perlu perluasan kontrak secara terencana, bukan dianggap sudah didukung oleh players saja.

Target data: preferensi tersimpan → konfigurasi tervalidasi → materi sesuai bahasa/kesulitan → input → evaluasi → hasil sesi → progres lokal berversi. Hindari penyimpanan setiap pointermove; simpan checkpoint/hasil seperlunya. Bila storage gagal, sesi tetap berjalan di memori. Jangan memakai state navigasi sebagai satu-satunya sumber hasil yang harus bertahan setelah refresh.

## Mesin game dan konten

Tracing memakai Pointer Events, pointer capture, koordinat logis, urutan goresan dan toleransi sesuai perangkat; tangani pointercancel dan cegah scroll hanya di arena. Pilihan soal, susun kata, memory, dan maze memisahkan data konten dari evaluasi. Pengacak/seed terkontrol memungkinkan materi setara pada dua pemain. Validasi rute maze dan keterselesaian konten sebelum dimuat.

Target berkas konten memuat ID stabil, locale, difficulty, prompt/audio, jawaban dan aset; jangan memasukkan soal ke komponen visual. Bunyi hijaiyyah dan jalur tulis ditinjau pengajar. Audio dimuat per game dan diputar setelah gesture; cleanup timer, listener, dan audio saat unmount. Lazy-load game ketika jumlah modul membesar.

## Penyimpanan, keamanan, deployment

Keputusan 2026-11-25 (menggantikan "tanpa backend"):

- **App anak:** tanpa akun. Preferensi (`msz:prefs`), profil lokal permanen (`msz:profiles:v1`), skor (`msz:scores:v1`), pilihan intro terakhir (`msz:intro:last` v2), stiker (`msz:stickers`), hasil sesi (`msz:outcome` v2), serta sesi ruang aktif (`msz:room:active`, `msz:room:sid`, `msz:room:seq:<sid>` di `sessionStorage`) disimpan lokal dengan `schemaVersion` dan fallback in-memory. App anak hanya melakukan GET file publik (manifest konten + media) tanpa identitas atau cookie.
- **Mode 2 perangkat (`online`, protokol v2):** memakai abstraksi `RoomTransport` v2 (`src/lib/room/`), `roomReducer` murni (`connecting → waiting → ready-check → countdown → playing → finalizing → final`), dan pengontrol singleton `roomSession`/`useRoomSession` agar koneksi terjaga lintas rute Lobby → Play → Result (rematch). Implementasi memakai `BroadcastChannel` (`VITE_ROOM_TRANSPORT=local` untuk uji lokal/E2E dengan `simulateDrop`) dan **Supabase Realtime Broadcast + Presence** (`msz-room-<code>`, key presence `sid`, tanpa tabel Postgres baru).
  - **Protokol & aturan R1–R7:** envelope `{v:2, seq, sid}` dengan dedup `seq`, snapshot kumulatif + heartbeat setiap `HEARTBEAT_MS = 2_000` ms, deteksi peer basi `PEER_STALE_MS = 6_000` ms, masa tenggang putus/reload `RECONNECT_GRACE_MS = 30_000` ms, hitung mundur `COUNTDOWN_MS = 3_000` ms, last-call `LAST_CALL_MS = 45_000` ms, `JOIN_TIMEOUT_MS = 5_000` ms, dan kedaluwarsa `sessionStorage` `ROOM_SESSION_MAX_AGE_MS = 600_000` ms. Host otoritatif menghitung `decideFinal`; `msz:room:active` dibersihkan saat `final`, `bye`, atau > 10 menit. Privasi D1/D8 tetap dijaga: hanya nama panggilan (≤ 12), avatar, dan warna yang melintasi jaringan. Untuk mengaktifkan di produksi: cukup aktifkan **Realtime** di proyek Supabase yang sama dengan CMS; tidak perlu migrasi database.
- **CMS admin:** Supabase (Postgres + Storage + Auth), dipakai langsung dari klien dengan anon key dan RLS. Login di `/admin/login` dengan username + password; username dipetakan ke email sintetis, dan pendaftaran publik dimatikan. `@supabase/supabase-js` hanya di-import dari `src/admin/**` dan `src/lib/supabase/**`. `service_role` tidak pernah berada di klien atau repo.
- **Konten:** model draft → terbit. Tombol "Terbitkan" membuat `manifest-<v>.json` + `latest.json` di bucket publik. App anak memuat konten dengan urutan CMS → cache → konten bawaan. Spesifikasi lengkap ada di [specs/cms](specs/cms.md), eksekusinya di [plan CMS](plan/2026-11-25-cms-admin-plan.md).

Variabel `VITE_*` bersifat publik dan tidak boleh berisi rahasia (anon key aman karena RLS). Build statis dari `project/dist`; hosting harus mengarahkan deep link SPA (termasuk `/admin/*`) ke `index.html`. Tanpa tracker, chat, atau iklan.

## Verifikasi dan target kualitas

Jalankan `npm run lint`, `npm test` (Vitest, 33 file / 82 test), `npm run build`, dan `npm run e2e` (Playwright + `@axe-core/playwright`, 48/48 lulus pada `chromium-tablet` & `webkit-ipad`) dari `project/`. Audit bundle C7.3 memastikan `@supabase/supabase-js` dan `VITE_SUPABASE_ANON_KEY` hanya berada di chunk lazy `AdminRoutes` (~71.4 kB gzip ≤ 120 kB), sementara `index` (~120.5 kB gzip ≤ 180 kB) dan tiap modul game (1.05–2.24 kB gzip ≤ 40 kB) berada jauh di bawah anggaran. Uji manual audio/fullscreen/touch & performa 60 fps pada tablet Android dan iPad nyata dicatat pada `T7.6`.

## Mode dua pemain saat ini

Mode dua pemain aktif di satu perangkat: `layar` untuk game yang mendukung split, atau `giliran` untuk game lain. `splitFits` mensyaratkan tinggi viewport ≥ `SPLIT_MIN_HEIGHT` (600 px; pane arena + baki jawaban setinggi ±600 px, terukur 626–838 px di 740×360) dan lebar ≥ `splitMinWidth` game (default 900 px). HP (landscape maupun portrait) otomatis bergiliran dengan catatan di Intro. Tablet portrait yang akan muat setelah diputar tetap membuka split dengan prompt "putar layar" dan pilihan bergiliran; layar yang terlalu kecil mendapat prompt "kurang lega" dengan tombol bergiliran. Split di HP landscape menunggu tata letak pane yang adaptif (Fase Berikutnya).

Mode dua perangkat berstatus **On-Hold**. `VITE_FEATURE_ONLINE_ROOM=1` diperlukan sebelum `isOnlineConfigured()` membuka UI dan route room; default flag mati, termasuk transport lokal. Kode room tetap tersedia untuk pengujian. Sebelum mengaktifkan kembali di produksi, perlu mengatasi penerimaan pesan dari `sid` asing, kapasitas/persetujuan host, klaim kode, dan validasi data room. Channel empat digit publik masih memungkinkan pihak ketiga mendengar nama panggilan dan mengganggu presence; mitigasi tuntas memerlukan private channel dengan RLS atau identitas channel acak panjang.
