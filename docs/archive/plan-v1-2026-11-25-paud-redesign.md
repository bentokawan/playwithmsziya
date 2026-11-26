# PAUD redesign plan

- Tanggal: 2026-11-25
- Status: in-progress; vertical slice G05 dan fondasi redesign telah diterapkan.
- Keputusan pengguna: usia 4–6 tahun; Motion + CSS Modules; GSAP hanya bila diperlukan.
- Acuan: [PRD](../prd.md), [Design](../design.md), [Architecture](../architecture.md), [AI agents](../ai-agents.md).
- Tujuan: alur bermain yang mudah dipahami tanpa membaca, visual biru muda/pink seperti tata bentuk referensi pengguna, feedback responsif tanpa overstimulasi, serta data sesi yang jujur.

## Audit berbasis kode

Audit statis terhadap routing, registry/kontrak, halaman utama, intro, arena, hasil, preload, modal bahasa, dan CSS/token terkait. Belum ada pengujian browser, pengukuran fps/kontras, atau observasi anak; temuan visual runtime perlu diverifikasi pada fase QA.

| Prioritas | Bukti | Temuan dan tindakan |
| --- | --- | --- |
| P1 | project/src/games/registry.ts; pages/Home/homeData.ts | Sembilan kartu, hanya Menulis Huruf terdaftar. Satukan metadata/availability agar game belum siap tidak menuju arena kosong |
| P1 | pages/GameShell/GameShellPage.tsx | Fullscreen/audio/Dengar lagi tanpa handler; tombol Dengar lagi berada dalam aside aria-hidden. Hubungkan kontrol dan perbaiki semantik |
| P1 | pages/Result/ResultPage.tsx; resultData.ts | Fallback hasil 3 bintang/100, statistik dari game berhitung, minimal satu bintang meski nol; Main Lagi membuang query sesi. Ganti dengan hasil nyata dan fallback tanpa hasil |
| P1 | pages/Home/Home.tsx; components/BottomDock.tsx | Nama, streak 3 hari, 12 bintang hardcoded; parent callback opsional tidak terpasang di App; label tahan 3 detik tetapi handler click. Hilangkan data contoh dan samakan perilaku/label |
| P1 | games/MenulisHuruf/MenulisHurufGame.tsx | Hanya huruf A, difficulty/players diabaikan; cakupan 70% langsung 3 bintang, tidak memvalidasi urutan; timeout hasil tidak dibersihkan; tidak ada pointercancel/active pointer ID. Perbaiki sesi/input/evaluasi sebelum memperluas game |
| P1 | pages/GameShell/GameShellPage.tsx | level di-cast tanpa validasi, players menerima angka arbitrer. Validasi enum dan hanya 1/2 pemain |
| P2 | pages/Home/Home.tsx; GameIntroPage.tsx; GameShellPage.tsx | Bahasa disimpan lokal di Home tetapi label/materi halaman lain hardcoded; preferensi audio juga lokal Home. Buat sumber preferensi lintas rute |
| P2 | pages/Home/Home.tsx | Status fullscreen disetel sebelum promise berhasil; tidak mengikuti fullscreenchange/Escape. Sinkronkan dari browser |
| P2 | pages/Preload/usePreloadProgress.ts | Progres acak interval tidak mewakili aset. Ganti loader nyata atau indikator tak tentu |
| P2 | pages/Home/components/LanguageModal.tsx | Escape tersedia, tetapi focus trap/initial focus/restore belum ada. Terapkan perilaku dialog lengkap |
| P2 | styles/tokens.css; HeaderBar.module.css; CategoryTabs.module.css | Warna lama, kontrol header/tab 36–40 px, label 13–13,5 px; belum memenuhi spesifikasi target sentuh PAUD 64 px |
| P2 | MenulisHurufGame.tsx | Canvas di-resize/reset dan listener resize dipasang ulang saat progress berubah. Pisahkan resize dari paint dan ukur performa input |
| P3 | pages/GameIntro/introData.ts dan gameIntroData.ts; assets/react.svg dan vite.svg | Kandidat data/aset sisa. Telusuri import sebelum memindahkan/menghapus; jangan menganggap semuanya tidak terpakai |

Fondasi yang dipertahankan: project/ terpisah dari docs/, TypeScript, route intro/play/result, registry, kontrak GameProps, CSS Modules bersebelahan dengan komponen, token global, fallback ID game arena, storage bahasa dengan try/catch. Restrukturisasi dilakukan pada kepemilikan data/kontrol bersama, bukan menulis ulang aplikasi sekaligus.

## Baseline verifikasi

2026-11-25: npm run lint selesai tanpa error, satu warning unused eslint-disable di MenulisHurufGame.tsx:139. npm run build berhasil (65 modules; JS 303,07 kB, gzip 93,79 kB). Ini baseline kompilasi, bukan bukti game/aksesibilitas berfungsi. Belum ada test runner di package.json; Motion/GSAP/Tailwind belum terpasang.

## Fase 0 — Kontrak dan acceptance

- [ ] Inventarisasi tiap tombol/rute, status game, data dummy, locale, dan aset beserta lisensi.
- [x] Definisikan SessionConfig tervalidasi: gameId, difficulty, players, locale; hasil per sesi/pemain dan status selesai.
- [ ] Tetapkan pemetaan skor/bintang per mekanik; jangan memakai threshold prototipe sebagai ukuran kemampuan anak.
- [x] Tetapkan parameter tiga kesulitan G05; game lain tetap ditandai belum tersedia.
- [ ] Buat matriks Home/Intro/Play/Result × loading/ready/error/empty; tetapkan pemilik state.
- [ ] Acceptance: setiap klaim UI dapat ditelusuri ke data/fitur nyata; tidak ada keputusan yang hanya tersimpan di plan tanpa pembaruan dokumen pemilik.

## Fase 1 — Restrukturisasi fondasi dan perbaikan alur

- [ ] Pertahankan src/pages dan src/games; gabungkan metadata katalog/intro dengan registry melalui ID stabil, hindari dua daftar availability.
- [ ] Tambahkan src/lib/session dan src/lib/preferences hanya saat dibutuhkan; shared components di src/components untuk kontrol yang benar-benar lintas halaman.
- [ ] Tambahkan src/i18n untuk ID/EN dan src/content untuk soal/jalur; pisahkan copy dari UI tanpa memindahkan state game ke global.
- [x] Validasi query/rute, sediakan fallback untuk ID salah dan hasil hilang/refresh; Main Lagi mempertahankan konfigurasi.
- [x] Perbaiki hasil dan statistik dummy; tampilkan empty state bila belum ada progres.
- [x] Satukan kontrol audio/fullscreen dengan error handling dan cleanup; sembunyikan parent control yang belum terpasang.
- [x] Ganti preload simulasi dengan kesiapan font nyata.
- [ ] Acceptance: satu alur G05 dari beranda sampai hasil/retry dapat dibuktikan; tidak ada kontrol terlihat yang diam.

## Fase 2 — Design system biru muda/pink

- [x] Tambahkan semantic token biru muda/pink dan migrasikan Canvas serta kontrol utama; warna kategori lama masih menjadi compatibility alias.
- [ ] Buat varian tombol/balok, kartu game, pilihan jawaban, kontrol suara, dan dialog dengan default/focus/pressed/disabled/loading.
- [x] Terapkan target 64 px pada navigasi utama dan 80 px pada pilihan/CTA intro; pengukuran browser lintas viewport masih pending.
- [ ] Susun brief ilustrasi asli: Ms Ziya, ikon sembilan game, objek soal; catat provenance dan lisensi. Hindari copy aset referensi.
- [ ] Ganti emoji yang menjadi ilustrasi utama dengan satu set flat konsisten; sisakan arena bersih.
- [ ] Acceptance: token lama terpetakan; kontras setiap pasangan aktual diukur; target sentuh diukur dari bounding box, bukan ukuran ikon.

## Fase 3 — Redesign layar dan motion

- [ ] Home: prioritaskan game siap, label singkat dan gambar; pengaturan pendamping sekunder; kategori mudah ditemukan tanpa scroll tersembunyi.
- [ ] Intro: contoh tindakan, pilihan kesulitan/mode dengan state terpilih jelas, satu Mulai dominan.
- [ ] Arena: instruksi singkat dan ulang suara, ruang bermain dominan, posisi Back/audio/fullscreen konsisten.
- [x] Result: pujian berdasarkan penyelesaian nyata, Main Lagi utama, Beranda sekunder; tanpa statistik yang tidak tersedia.
- [x] Terapkan initial focus, focus trap, Escape dan restore focus pada dialog bahasa; audit penuh orientasi portrait masih pending.
- [x] Tambahkan Motion dengan LazyMotion; CSS Modules dipertahankan. JS baseline 303,07 kB/93,79 kB gzip, sesudah Motion 385,84 kB/124,31 kB gzip.
- [x] Terapkan entrance motion terarah dan reduced-motion global; motion feedback game lanjutan mengikuti implementasi tiap game.
- [ ] GSAP hanya jika timeline spesifik tidak terlayani Motion; tulis keputusan dan evaluasi biaya sebelum instalasi.
- [ ] Acceptance: semua tindakan tetap berjalan tanpa animasi; input segera merespons; tidak ada loop dekoratif atau animasi yang menghalangi jawaban.

## Fase 4 — Recoding game secara bertahap

- [x] Stabilkan G05: active pointer, capture/release/cancel, cleanup timeout, resize/DPR, paint terpisah, dan evaluasi coverage teruji.
- [ ] Ekstrak tracing engine setelah kebutuhan bersama jelas; pakai untuk G02/G07 dengan jalur konten tervalidasi pengajar.
- [ ] Implementasikan satu pola choice round untuk G01/G04/G06; sesuaikan materi, audio dan kesulitan.
- [ ] Implementasikan G03 dengan ketuk-pilih/ketuk-slot sebagai alternatif drag; kata sesuai locale, bukan teks pada gambar referensi.
- [ ] Implementasikan G08 (lock dua kartu, cleanup delay) dan G09 (validasi langkah, maze dapat diselesaikan).
- [ ] Aktifkan game di katalog hanya setelah acceptance game itu lulus; jangan menunggu sembilan game untuk menguji satu alur lengkap.
- [x] Implementasikan dua pemain bergiliran pada G05 dengan materi setara dan skor sesi gabungan; hasil per pemain rinci masih pengembangan berikutnya.
- [ ] Acceptance: kedua locale dan tiga kesulitan memengaruhi materi secara nyata; restart/quit tidak meninggalkan callback sesi lama.

## Fase 5 — QA dan rilis

- [x] Tambahkan Vitest untuk validasi sesi dan evaluasi tracing; tes memory/maze menunggu implementasi gamenya.
- [ ] Uji E2E Home → Intro → Play → Result → Main Lagi, query invalid, refresh, storage ditolak, audio diblokir, fullscreen ditolak/Escape, dan klik cepat.
- [ ] Uji keyboard/fokus/dialog, reduced motion, mute dan screen reader untuk kontrol; dokumentasikan batas aksesibilitas tracing.
- [ ] Uji 360×800, 768×1024, 1024×768, 1280×720; zoom 200%, safe area dan label EN terpanjang. Ukuran ini matriks uji, bukan layout terkunci.
- [ ] Uji sentuh pada Android tablet dan iPad/Safari; ukur input Canvas/frame time dan bundle sesudah Motion. Target 60 fps harus dibuktikan pada perangkat sasaran.
- [ ] Observasi anak 4–6 tahun dengan pendamping: apakah dapat memilih, mulai, memahami retry dan menyelesaikan tugas; catat kebingungan sebelum menambah efek.
- [ ] Jalankan npm run lint dan npm run build dari project/; tuntaskan warning terkait perubahan.
- [ ] Sinkronkan PRD/architecture/status plan; rilis hanya game dan mode yang telah lolos.

## Urutan, risiko, dan rollback

Urutan wajib: fase 0 → 1 → 2 → 3 → G05 fase 4 → QA alur pertama; game berikutnya mengikuti siklus yang sama. Backend/login/PWA dan migrasi Next.js tetap di luar lingkup. Perubahan dokumentasi ini tidak mengizinkan recoding otomatis.

Risiko terbesar: motion menutupi input, rewrite merusak rute/state, aset belum siap, serta parameter tracing tidak cocok motorik anak. Mitigasi: satu vertical slice G05, uji perangkat/anak lebih awal, reduced-motion, availability per game, dan penilaian konten bersama pengajar. Buat commit kecil per fase ketika diizinkan; rollback lewat revert commit terkait, jangan reset worktree pengguna. Pertahankan ID game dan data lama sampai migrasi progres berversi terbukti aman.

## Review dokumen

- PRODUCT/CONTENT: PASS untuk spesifikasi; pilihan usia/stack berasal dari pengguna, target dan keadaan kode dipisahkan.
- UX/UI/DESIGN SYSTEM: spesifikasi tersedia; hasil implementasi belum diverifikasi.
- ACCESSIBILITY/RESPONSIVE/VISUAL QA: NOT VERIFIED runtime; matriks dan kriteria uji tersedia di atas.
- CODE QUALITY: baseline lint/build lulus dengan satu warning lama; tidak ada kode aplikasi diubah dalam tugas ini.
- FINAL: dokumen siap menjadi panduan implementasi; penerimaan aplikasi menunggu fase QA.
