# Play with Ms Ziya — PRD

Status: baseline produk, 2026-11-25. Sumber kebutuhan: [brief asli](archive/brief.md). Aturan visual: [design](design.md); implementasi: [architecture](architecture.md); workflow: [ai-agents](ai-agents.md).

## Tujuan dan pengguna

Web game belajar untuk anak 4–6 tahun dengan pendamping orang tua/guru. Anak berlatih angka, literasi, hijaiyyah, dan daya ingat lewat sesi singkat, demo visual, musik dan SFX ramah anak, klip bunyi item (angka/huruf/kata/hijaiyyah), dan sentuhan. Tidak ada voice-over narasi (keputusan 2026-11-25, lihat [audio](specs/audio.md)). Bahasa antarmuka dan materi tersedia dalam Indonesia/Inggris; bunyi hijaiyyah tetap bahasa Arab. Salah ketik brief “huruf + menulis angka” ditafsirkan sebagai menulis huruf berdasarkan rincian brief berikutnya.

Anak membutuhkan pilihan yang mudah dikenali, bantuan tanpa kemampuan membaca, dan kesempatan mencoba lagi. Pendamping membutuhkan pilihan bahasa, kesulitan, serta permainan bersama pada satu perangkat.

## Referensi dan batas cakupan

[Kids From Home Games](https://games.kidsfromhome.com/) ditinjau 2026-11-25 melalui konten publik. Katalog menjelaskan mekanik menghitung, bunyi awal, menyusun kata, pasangan kartu, labirin, tracing angka/huruf/hijaiyyah, dan dengar-temukan hijaiyyah. Ambil pola fungsional tersebut; gunakan identitas, ilustrasi, audio, dan kode milik sendiri. Aturan skor, kesulitan, dan duel di bawah adalah keputusan produk proyek ini, belum diverifikasi sebagai perilaku referensi.

## Katalog target

| ID | Game | Mekanik dan kriteria selesai |
| --- | --- | --- |
| G01 | Ayo Berhitung | Ketuk objek satu per satu lalu pilih jumlah 1–20; objek tidak dihitung dua kali |
| G02 | Menulis Angka | Ikuti jalur angka dengan jari; validasi urutan dan cakupan goresan |
| G03 | Susun Kata | Urutkan huruf menjadi kata bergambar; sediakan alternatif ketuk selain drag |
| G04 | Bunyi Awal | Dengarkan kata lalu pilih huruf awal sesuai bahasa materi |
| G05 | Menulis Huruf | Ikuti jalur huruf dengan jari; panduan titik awal dan arah |
| G06 | Dengar & Temukan Hijaiyyah | Putar bunyi Arab lalu pilih karakter yang sesuai |
| G07 | Menulis Hijaiyyah | Ikuti jalur per karakter dan urutan goresan yang ditinjau pengajar |
| G08 | Kartu Kembar | Buka maksimal dua kartu; pasangan cocok menetap; selesai ketika semua cocok |
| G09 | Petualangan Labirin | Gerakkan karakter melalui lintasan sah sampai makanan tujuan |

Angka berhitung mencakup 1–20; tracing angka mencakup angka tunggal 0–9 (Mudah 1–5, Sedang/Menantang 0–9). Materi huruf Latin dan hijaiyyah diluncurkan bertahap dengan daftar konten yang eksplisit, bukan mengklaim alfabet lengkap dari prototipe satu huruf.

## Alur aplikasi

Beranda → pilih kategori/game → intro (instruksi, mode, kesulitan) → Mulai/Start dengan panah → muat aset game → bermain → hasil → main lagi atau beranda. Pemilih bahasa tersedia di beranda; bahasa awal mengikuti preferensi tersimpan, default Indonesia. Loading menampilkan progres nyata atau indikator tak tentu; kegagalan aset menyediakan Coba Lagi/Kembali.

## Kebutuhan fungsional

- FR01: katalog memfilter empat kategori; game belum tersedia diberi status jelas dan tidak membuka arena kosong.
- FR02: seluruh label, instruksi, umpan balik, dan materi mendukung ID/EN; ganti bahasa tidak mengubah bunyi Arab.
- FR03: setiap game mempunyai Mudah, Sedang, Menantang. Tingkat menaikkan jumlah pilihan, panjang materi, jumlah pasangan atau kompleksitas lintasan; bukan sekadar mengganti label. Parameter per game harus ditetapkan dalam plan konten.
- FR04: satu pemain dan dua pemain tersedia untuk semua game. Di Intro ("Main di mana?"), **"1 Layar"** terpilih default tanpa kode (zero-friction): 1 anak → `solo`, 2 anak → langsung **Layar dibagi (`layar`)** dengan input multi-touch independen (G01–G07 & G09 pada layar ≥ 900 px) atau otomatis fallback ke **Bergiliran (`giliran`)** bila layar/game tidak mendukung. **"2 Perangkat (`online`)"** adalah pilihan eksplisit opsional dengan lobby cek siap (`RoomLobby`), kode ruang 4 angka/tautan `/gabung/:code`, progres real-time, pemulihan putus/reload 30 detik, hasil serentak identik, dan rematch di ruang yang sama (G01–G07 & G09 saat Supabase Realtime dikonfigurasi). Hasil menampilkan pencapaian masing-masing tanpa mempermalukan pemain; pemenang balapan mendapat mahkota, tanpa label kalah atau angka negatif.
- FR05: tombol ulang bunyi item (pada game yang memakai klip), mute, kembali, serta fullscreen di kanan atas. Fullscreen dipicu tindakan pengguna; jika browser menolak/tidak mendukung, bermain tetap berjalan.
- FR06: jawaban salah memberi petunjuk dan retry tanpa kehilangan akses. Hasil menampilkan bintang 1–3, skor sesi nyata (`scoreSession`: 3/2/1 poin per ronde), chip peningkatan positif (`Rekor baru!` / `+N` / `Ayo main lagi`), dan halaman **Peringkat (`/peringkat`)** yang selalu positif (terbaik per profil + badge "Paling berkembang").
- FR07: preferensi bahasa/audio, **profil pemain lokal permanen** (`/pemain`: nama 1–12 huruf, avatar hewan, warna; ekspor/impor JSON; tanpa login), skor, dan stiker disimpan lokal dengan versi skema (`msz:profiles:v1`, `msz:scores:v1`, `msz:intro:last`) dan fallback jika penyimpanan gagal. Anak tidak login; tidak ada chat, iklan, atau penyimpanan identitas anak ke server.
- FR08 (2026-11-25): **CMS admin.** Pengelola konten login di `/admin/login` dengan **username + password saja** (tanpa daftar/lupa password). Lewat CMS, admin dapat mengunggah/mengganti gambar objek, mengunggah atau merekam klip suara (angka, huruf, kata, dan terutama **hijaiyyah** beserta status review peninjau), mengatur musik/SFX, menambah/mengedit/menonaktifkan objek dan kata, lalu **menerbitkan** snapshot konten dengan rollback. App anak membaca konten terbit tanpa login dan tetap berjalan dengan konten bawaan bila CMS tidak tersedia. Detail: [specs/cms](specs/cms.md), [plan CMS](plan/2026-11-25-cms-admin-plan.md).

## Status dan rilis

Setelah seluruh task AI Fase 0–7, CMS C0–C7, UX Polish, dan Multiplayer + Profil + Peringkat (2026-11-26): seluruh alur layar (`Splash`, `Home` langsung tanpa overlay unlock audio, `Intro` v3 3-langkah dinamis, `Play` Arena v2 + `SplitPlay` + `OnlinePlay`, `Result` v2, `Stickers`, `Players` `/pemain`, `Leaderboard` `/peringkat`, `Room` `/game/:gameId/ruang` & `/gabung`, `Parents`), 9 modul game (`G01–G09`), 4 engine bersama, CMS admin (`/admin/*`), serta E2E Playwright di 4 proyek (`chromium-tablet`, `webkit-ipad`, `chromium-desktop`, `chromium-phone`) telah selesai dan terverifikasi.

Task manusia yang tersisa sebelum rilis produksi: uji slice & perangkat nyata dengan anak (`T5.6`, `T7.6`), pengisian suara final via CMS (`T6.3`), review hijaiyyah di `/admin/hijaiyyah` (`T6.4`/`C7.1`), uji RLS opsional (`C7.4`), dan deployment rilis (`T7.8`). Akun orang tua/anak, sinkronisasi progres ke cloud, PWA/offline, analitik, dan dashboard perkembangan tetap di luar cakupan.

## Penerimaan dan ukuran keberhasilan

Semua sembilan game dapat dimulai dan diselesaikan dalam kedua bahasa dan tiga kesulitan; mode dua pemain menjaga giliran dan hasil terpisah. Uji retry, keluar, refresh, audio diblokir, fullscreen ditolak, dan aset gagal. Uji tablet Android, iPad/Safari, serta desktop dengan pointer/keyboard. Anak dengan pendamping dapat menemukan dan memulai game tanpa penjelasan tambahan; catat hambatan melalui observasi, tanpa pelacak identitas. Target awal sesi 2–5 menit adalah hipotesis untuk uji pengguna, bukan angka hasil riset.

## Status mode dua pemain (2026-11-26)

Mode aktif: satu perangkat dengan layar dibagi pada layar yang memadai, atau bergiliran otomatis bila game tidak mendukung split. HP selalu bergiliran (split butuh tinggi ≥ 600 px); tablet portrait mendapat prompt putar layar dengan pilihan bergiliran. Intro memilih 1 atau 2 anak dalam satu panel. Mode kerja sama dengan skor tim dan mode dua perangkat berada di fase berikutnya; fitur room tersembunyi secara default lewat `VITE_FEATURE_ONLINE_ROOM`.
