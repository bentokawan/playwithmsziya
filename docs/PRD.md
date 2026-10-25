# PRD – Play with Ms Ziya (Game Edukasi Anak 4–6 Tahun)

Oct 24, 2026 · @Ms Ziya

## 1. Ringkasan Produk

Play with Ms Ziya adalah kumpulan game edukasi berbasis web untuk anak usia 4–6 tahun, dimainkan lewat layar sentuh dalam Bahasa Indonesia atau Inggris, sendiri (1 pemain) atau berdua (duel).

Produk ini melatih lima keterampilan dasar: angka dan menulis angka, huruf dan menulis huruf, hijaiyyah dan menulis hijaiyyah, serta daya ingat. Setiap keterampilan punya tiga level (mudah, sedang, menantang) agar anak bisa naik tingkat sesuai kemampuannya.

Referensi gaya dan pengalaman: [Kids From Home Games](https://games.kidsfromhome.com/). Hashtag kampanye: #playwithmsziya.

## 2. Tujuan & Metrik Keberhasilan

Tujuan utamanya: anak bisa bermain sendiri tanpa dibimbing terus-menerus dan menikmatinya cukup lama untuk benar-benar berlatih. Karena produk ini web tanpa akun, metrik diukur anonim lewat analitik dasar.

| Tujuan | Metrik | Target awal (usulan) |
| --- | --- | --- |
| Anak mudah memulai | Anak menekan Mulai dan menyelesaikan 1 putaran tanpa bantuan orang dewasa | ≥ 70% sesi |
| Anak betah bermain | Rata-rata durasi sesi | 8–12 menit |
| Anak ingin kembali | Pengguna yang kembali dalam 7 hari | ≥ 30% |
| Anak naik level | Sesi yang naik dari Mudah ke Sedang | ≥ 40% |
| Mode berdua dipakai | Porsi sesi 2 pemain | ≥ 20% |
| Berjalan lancar di perangkat orang tua | Game dimuat dalam ≤ 3 detik di HP/tablet menengah | ≥ 90% sesi |

Angka target di atas adalah usulan awal dan perlu disepakati sebelum pengembangan.

## 3. Target Pengguna

Pengguna utama adalah anak 4–6 tahun yang belum lancar membaca, sehingga semua instruksi harus berupa suara, ikon, dan animasi, bukan teks panjang.

- **Anak 4–6 tahun (pemain utama):** belum bisa membaca instruksi, jari masih belum presisi, rentang fokus pendek (sekitar 5–10 menit per game).
- **Orang tua (pendamping):** memilih bahasa, menyalakan layar penuh, dan duduk bersama saat mode 2 pemain.
- **Guru PAUD/TK dan TPQ (opsional):** memakai di kelas lewat tablet atau layar interaktif, terutama untuk hijaiyyah.

**Asumsi perangkat:** layar sentuh (tablet, HP, atau layar interaktif sekolah), orientasi lanskap, dan peramban modern (Chrome atau Safari). Mouse dan keyboard tetap berfungsi, tetapi bukan prioritas desain.

**Usia berpengaruh pada level:** Mudah untuk anak 4 tahun atau pemula, Sedang untuk 5 tahun, Menantang untuk 6 tahun atau anak yang sudah mahir.

## 4. Hasil Brainstorming

Brief sudah kuat di sisi konten; yang perlu dipertajam adalah pengalaman anak 4–6 tahun yang belum bisa membaca, serta cara dua pemain berbagi satu layar.

**Insight dari brief**

1. Semua game mengikuti pola sama (pilih bahasa → pilih mode → pilih level → main), jadi satu kerangka bersama bisa dipakai ulang oleh seluruh game dan menghemat pengembangan.
2. Empat keterampilan (angka, huruf, hijaiyyah, daya ingat) punya game "menulis dengan jari" yang mirip. Satu mesin tracing bisa dipakai untuk angka, huruf, dan hijaiyyah.
3. Suara adalah antarmuka utama. Anak belum membaca, sehingga setiap instruksi, huruf, dan angka harus diucapkan dalam dua bahasa.

**Ide tambahan yang disarankan**

| Ide | Manfaat | Rekomendasi |
| --- | --- | --- |
| Maskot Ms Ziya sebagai pemandu bersuara | Anak merasa ditemani, instruksi jelas tanpa teks | Masuk MVP |
| Bintang hadiah di akhir putaran | Motivasi tanpa tekanan kalah | Masuk MVP |
| Gerbang orang tua (tahan 3 detik atau soal sederhana) untuk bahasa, layar penuh, dan keluar | Anak tidak tak sengaja keluar atau mengubah pengaturan | Masuk MVP |
| Umpan balik lembut saat salah (getar atau goyang + coba lagi, tanpa suara marah) | Tidak membuat anak frustrasi | Masuk MVP |
| Tombol ulang suara (ikon speaker) | Anak bisa mendengar petunjuk lagi | Masuk MVP |
| Album stiker koleksi | Alasan kembali bermain | Fase 2 |
| Penyimpanan data bermain di perangkat dan di akun orang tua | Level terakhir diingat | Masuk MVP |
| Ringkasan perkembangan anak untuk orang tua | Nilai tambah bagi orang tua | Masuk MVP (versi sederhana); laporan rinci menyusul |
| Dukungan bahasa tambahan (Arab, Sunda) | Jangkauan lebih luas | Ditunda |

**Hal yang sengaja tidak diusulkan:** iklan, pembelian dalam aplikasi, akun pengguna, dan tautan keluar. Semuanya menambah risiko untuk anak dan memperlambat peluncuran.

## 5. Ruang Lingkup

MVP mencakup seluruh 9 game dari brief dalam dua bahasa, tiga level, dan dua mode pemain, tanpa akun dan tanpa server pengguna.

**Masuk MVP**

- Pilih bahasa (Indonesia, Inggris) di awal.
- 9 game: Dengarkan & Temukan Hijaiyyah, Tebalkan Hijaiyyah, Ayo Berhitung, Menulis Angka, Susun Kata, Bunyi Awal, Menulis Huruf, Kartu Kembar, Petualangan Labirin.
- Tiga level (Mudah, Sedang, Menantang) di setiap game.
- Mode 1 pemain dan 2 pemain (duel).
- Tombol layar penuh di pojok kanan atas.
- Pemandu suara dan efek suara, bintang hadiah.
- Gerbang orang tua untuk bahasa, login, dan keluar; akun orang tua opsional untuk menyimpan data bermain dan melihat ringkasan perkembangan anak (bagian 7).

**Di luar MVP**

- Akun untuk anak (akun hanya untuk orang tua).
- Iklan, pembelian, dan toko.
- Laporan perkembangan rinci (grafik mingguan, ekspor PDF, notifikasi).
- Bahasa selain Indonesia dan Inggris.
- Mode online antarperangkat.
- Aplikasi native (iOS dan Android).

## 6. Struktur Layar & Alur Pengguna

&#91;embedded content: alur layar · 7 layar\]

Setiap game memakai alur yang sama: pilih bahasa sekali di awal, lalu menu game, mode, level, dan Layar Mulai sebelum bermain. Dari Layar hasil anak bisa main lagi, naik level, atau kembali ke menu.

Tombol Beranda di pojok kiri atas dilindungi gerbang orang tua; tombol layar penuh ada di pojok kanan atas pada semua layar.

## 7. Fitur Umum (Semua Game)

Fitur ini dibangun sekali sebagai kerangka bersama, lalu dipakai oleh seluruh game.

| Kode | Fitur | Kebutuhan | Prioritas |
| --- | --- | --- | --- |
| U-01 | Pilih bahasa | Di layar awal ada dua tombol besar: Bahasa Indonesia dan English. Semua teks dan suara mengikuti pilihan. Bahasa bisa diganti lewat gerbang orang tua. | Wajib |
| U-02 | Layar Mulai | Setiap game dibuka dengan tombol besar bertuliskan "Klik Mulai" (ID) atau "Click Start" (EN) ditambah ikon panah, dan dibacakan suara. | Wajib |
| U-03 | Pilih level | Tiga tombol: Mudah, Sedang, Menantang, dengan ikon 1, 2, 3 bintang. Level terkunci tidak dipakai agar anak bebas memilih. | Wajib |
| U-04 | Pilih mode | Tombol 1 Pemain dan 2 Pemain dengan ikon satu dan dua anak. | Wajib |
| U-05 | Layar penuh | Tombol di pojok kanan atas untuk masuk dan keluar layar penuh. Jika peramban tidak mendukung (misalnya iPhone Safari), tombol disembunyikan dan game tetap memenuhi layar semaksimal mungkin. | Wajib |
| U-06 | Pemandu suara | Ms Ziya membacakan instruksi dan umpan balik dalam bahasa terpilih. Ikon speaker mengulang instruksi. | Wajib |
| U-07 | Umpan balik benar/salah | Benar: animasi, suara ceria, bintang. Salah: goyang lembut dan "coba lagi", tanpa suara negatif atau nilai merah. | Wajib |
| U-08 | Layar hasil | Menampilkan bintang yang didapat dengan tombol Main Lagi, Naik Level, dan Beranda. Dalam mode duel menampilkan pemenang atau "seri". | Wajib |
| U-09 | Tombol Beranda/Kembali | Selalu ada di pojok kiri atas, dilindungi gerbang orang tua atau konfirmasi dua langkah. | Wajib |
| U-10 | Gerbang orang tua | Tahan tombol 3 detik atau jawab soal sederhana untuk membuka pengaturan dan keluar dari permainan. | Wajib |
| U-11 | Jeda otomatis | Jika tidak ada sentuhan 30 detik, Ms Ziya mengulang instruksi; setelah 2 menit game berhenti sementara. | Sebaiknya |
| U-12 | Simpan level terakhir | Level terakhir per game tersimpan di perangkat; bila orang tua login, tersimpan juga di akun (lihat U-13 sampai U-19). | Wajib |

### Akun Orang Tua & Perkembangan Anak

Akun orang tua bersifat opsional dan tujuannya dua: menyimpan data bermain, dan menunjukkan perkembangan anak dalam kalimat sederhana seperti "sudah bisa berhitung sampai 10". Anak tetap bisa bermain penuh tanpa login.

| Kode | Fitur | Kebutuhan | Prioritas |
| --- | --- | --- | --- |
| U-13 | Mode tamu | Semua game dapat dimainkan tanpa login; data tersimpan di perangkat. | Wajib |
| U-14 | Akun orang tua | Daftar dan masuk lewat email (tautan masuk atau kode) di balik gerbang orang tua. Anak tidak mengisi apa pun. | Wajib |
| U-15 | Profil anak | Orang tua menambah satu atau lebih profil anak dengan nama panggilan dan avatar (bukan nama asli, tanpa tanggal lahir). Profil dipilih dari menu. | Wajib |
| U-16 | Simpan data bermain | Hasil tiap putaran (game, level, jumlah benar dari total, durasi) tersimpan ke profil anak. Data mode tamu di perangkat dapat dipindahkan saat login pertama. | Wajib |
| U-17 | Ringkasan perkembangan | Halaman orang tua menampilkan capaian per keterampilan dan keterampilan yang sedang dilatih. | Wajib |
| U-18 | Hapus data | Orang tua dapat menghapus profil anak atau seluruh akun beserta datanya. | Wajib |
| U-19 | Lanjut di perangkat lain | Level dan bintang tersinkron saat orang tua login di perangkat lain. | Sebaiknya |

**Mode 2 pemain:** tiap pemain memilih profilnya sendiri (atau tamu), sehingga hasil duel tercatat ke anak masing-masing.

**Capaian perkembangan (usulan).** Capaian dianggap tercapai bila anak menyelesaikan level tersebut dengan sedikitnya 80% benar pada 3 putaran terakhir. Angka 80% dan 3 putaran adalah usulan awal dan perlu diuji dengan anak.

| Keterampilan | Capaian "Sudah bisa…" | Sumber data |
| --- | --- | --- |
| Angka | Berhitung sampai 5 / 10 / 20 | A-01 level Mudah / Sedang / Menantang |
| Angka | Menulis angka 0–9 / 10–15 / 16–20 | A-02 |
| Huruf | Mengenali bunyi awal kata | L-02 |
| Huruf | Mengeja kata 3 / 4 / 5–6 huruf | L-01 |
| Huruf | Menulis huruf besar dan huruf kecil | L-03 |
| Hijaiyyah | Mengenal 10 / 20 / 28 huruf | H-01 |
| Hijaiyyah | Menulis hijaiyyah (jalur lebar sampai sempit) | H-02 |
| Daya ingat | Kartu kembar 3 / 6 / 10 pasang | G-01 |
| Daya ingat | Labirin 5×5 / 7×7 / 9×9 | G-02 |

**Batasan:** ringkasan hanya menggambarkan hasil bermain dan bukan penilaian atau diagnosis perkembangan anak. Data yang disimpan seminimal mungkin, dapat dihapus kapan saja, dan tidak dipakai untuk iklan.

## 8. Fitur Hijaiyyah

Dua game: mengenali huruf hijaiyyah lewat bunyi, lalu menulisnya dengan menebalkan jalur huruf memakai jari.

**H-01 · Dengarkan Bunyi, Temukan Hurufnya**

Ms Ziya mengucapkan bunyi sebuah huruf (misalnya "alif", "ba", "ta"), lalu anak mengetuk huruf yang benar di antara beberapa pilihan.

| Level | Jumlah pilihan | Huruf yang dipakai | Bantuan |
| --- | --- | --- | --- |
| Mudah | 2 | 10 huruf awal | Bunyi bisa diulang tanpa batas, huruf benar berkedip pelan setelah 2 kali salah |
| Sedang | 3 | 20 huruf | Bunyi bisa diulang |
| Menantang | 4 | Seluruh 28 huruf, termasuk yang bentuknya mirip (ب ت ث) | Tanpa kedipan bantuan |

**H-02 · Menulis Hijaiyyah: Tebalkan dengan Jarimu**

Huruf hijaiyyah ditampilkan sebagai garis putus-putus. Anak menelusurinya dengan jari mengikuti urutan goresan, dan garis berubah menjadi tebal berwarna ketika ditelusuri dengan benar.

| Level | Cara | Bantuan |
| --- | --- | --- |
| Mudah | Huruf besar, jalur lebar, panah arah goresan, titik awal berkedip | Jalur toleran, jari yang melenceng dikembalikan ke jalur |
| Sedang | Jalur lebih sempit, tanpa panah | Titik awal saja |
| Menantang | Jalur sempit, huruf kecil, dan tanpa titik awal | Bantuan muncul setelah 10 detik tanpa gerakan |

**Catatan konten:** bentuk huruf yang diajarkan adalah bentuk tunggal (terpisah). Bentuk awal, tengah, dan akhir kata ditunda ke fase berikutnya. Urutan huruf dan lafal mengikuti kurikulum yang dipakai Ms Ziya; ini perlu dikonfirmasi (lihat Pertanyaan Terbuka).

## 9. Fitur Angka

Dua game: berhitung benda satu per satu dengan angka 1–20, dan menulis angka dengan jari.

**A-01 · Ayo Berhitung**

Benda (buah, hewan, balon) tampil di layar. Anak mengetuk tiap benda satu per satu; setiap ketukan membuat benda bergerak ke keranjang dan Ms Ziya menyebut angkanya. Setelah selesai, anak mencocokkan jumlah dengan angka yang benar.

| Level | Rentang angka | Pilihan jawaban | Bantuan |
| --- | --- | --- | --- |
| Mudah | 1–5 | 2 | Benda tersusun rapi dalam satu baris |
| Sedang | 1–10 | 3 | Benda tersebar tetapi tidak bertumpuk |
| Menantang | 1–20 | 4 | Benda tersebar dengan beberapa jenis berbeda, hanya satu jenis yang dihitung |

**A-02 · Menulis Angka dengan Jari**

Angka ditampilkan sebagai jalur putus-putus yang ditelusuri anak mengikuti arah goresan (memakai mesin tracing yang sama dengan H-02 dan L-03).

| Level | Rentang angka | Cara |
| --- | --- | --- |
| Mudah | 0–9 | Jalur lebar, panah arah, titik awal berkedip |
| Sedang | 10–15 | Jalur sedang, tanpa panah |
| Menantang | 16–20 | Jalur sempit, angka dua digit ditulis berurutan |

Aturan interaksi: ketukan benda yang sudah dihitung tidak dihitung ulang; benda yang sudah dihitung berubah tampilannya agar anak tahu mana yang belum.

## 10. Fitur Huruf

Tiga game: mengeja dengan menyusun kata, mengenali bunyi awal sebuah kata, dan menulis huruf dengan jari.

**L-01 · Susun Kata untuk Mengeja**

Gambar benda ditampilkan (misalnya BOLA). Ms Ziya mengeja huruf demi huruf, lalu anak menyeret atau mengetuk kepingan huruf ke kotak dengan urutan yang benar.

| Level | Panjang kata | Bantuan |
| --- | --- | --- |
| Mudah | 3 huruf (contoh: IBU, KAP) | Kotak berisi huruf samar sebagai petunjuk, tanpa huruf pengecoh |
| Sedang | 4 huruf | Tanpa huruf samar, ada 1–2 huruf pengecoh |
| Menantang | 5–6 huruf | Beberapa huruf pengecoh, Ms Ziya hanya mengeja sekali |

**L-02 · Bunyi Awal Kata**

Ms Ziya menyebut sebuah kata dengan gambar (misalnya "apel"). Anak mengetuk huruf pertama dari kata itu.

| Level | Jumlah pilihan | Bantuan |
| --- | --- | --- |
| Mudah | 2 | Gambar tetap terlihat, kata diulang otomatis |
| Sedang | 3 | Kata dapat diulang dengan ikon speaker |
| Menantang | 4 | Huruf mirip atau bunyinya hampir sama (b/d, m/n) |

**L-03 · Menulis Huruf dengan Jari**

Sama dengan mesin tracing pada H-02 dan A-02. Huruf besar (A–Z) lebih dulu, lalu huruf kecil (a–z) di level Menantang.

| Level | Huruf | Cara |
| --- | --- | --- |
| Mudah | A–Z huruf besar | Jalur lebar, panah arah, titik awal berkedip |
| Sedang | A–Z huruf besar | Jalur sempit, tanpa panah |
| Menantang | a–z huruf kecil | Jalur sempit, hanya titik awal |

**Catatan:** daftar kosakata (kata, gambar, rekaman suara) dibuat per bahasa. Kata untuk game Indonesia dan Inggris berbeda, bukan terjemahan satu sama lain, agar ejaan dan bunyi awalnya tetap benar.

## 11. Fitur Game & Daya Ingat

Dua game yang melatih ingatan dan fokus, tanpa unsur membaca.

**G-01 · Kartu Kembar**

Kartu tertutup tersusun dalam kotak. Anak mengetuk 2 kartu untuk membaliknya; jika gambarnya sama, kartu tetap terbuka, jika berbeda, kartu menutup lagi setelah 1,5 detik. Permainan selesai ketika semua pasangan ditemukan.

| Level | Jumlah kartu | Aturan tambahan |
| --- | --- | --- |
| Mudah | 6 (3 pasang) | Gambar besar dan sangat berbeda |
| Sedang | 12 (6 pasang) | Gambar lebih bervariasi |
| Menantang | 20 (10 pasang) | Beberapa gambar mirip, kartu sebentar dibuka di awal selama 2 detik |

Tema kartu bisa dipilih dari tema konten game lain (hewan, buah, angka, huruf, hijaiyyah) sehingga game ini sekaligus pengulangan materi.

**G-02 · Petualangan Labirin**

Anak menggeser karakter dengan jari (menyeret) melewati labirin menuju makanan enak di ujung jalan. Dinding tidak mematikan: karakter hanya berhenti dan bergetar pelan.

| Level | Ukuran labirin | Isi |
| --- | --- | --- |
| Mudah | 5 × 5, satu jalur utama | Tanpa jalan buntu |
| Sedang | 7 × 7 | Beberapa jalan buntu |
| Menantang | 9 × 9 | Banyak jalan buntu dan 3 bintang untuk dikumpulkan |

Labirin dibuat secara acak dari beberapa pola yang sudah dicek agar selalu bisa diselesaikan dan tidak terlalu sulit untuk usia 4–6 tahun.

## 12. Mode 2 Pemain (Duel)

Setiap game punya mode 2 pemain di satu layar yang sama; rekomendasinya layar dibagi dua dan dimainkan bersamaan agar tidak ada anak yang menunggu lama, kecuali Kartu Kembar yang bergiliran.

**Prinsip desain**

- Layar dibagi dua area berwarna berbeda (misalnya biru dan oranye). Pemain 1 di sisi kiri atau bawah, Pemain 2 di sisi seberang (untuk tablet yang diletakkan di meja, kedua anak berhadapan).
- Kedua pemain mengerjakan soal yang sama pada saat yang sama; yang benar lebih dulu mendapat poin.
- Tidak ada "kalah": layar akhir menyorot pemenang, tetapi kedua anak mendapat bintang.
- Soal dan level sama untuk keduanya; level mengikuti pilihan awal.

**Cara duel per game**

| Game | Bentuk duel | Pemenang |
| --- | --- | --- |
| Dengar & Temukan Hijaiyyah (H-01) | Satu bunyi, dua papan pilihan; yang mengetuk huruf benar lebih dulu dapat 1 poin | Poin terbanyak dari 5 soal |
| Tebalkan Hijaiyyah (H-02) | Dua huruf yang sama ditelusuri bersamaan di dua area | Yang selesai lebih dulu dan akurat |
| Ayo Berhitung (A-01) | Dua kelompok benda terpisah, masing-masing menghitung dan mencocokkan | Yang selesai lebih dulu dengan benar |
| Menulis Angka (A-02) | Dua angka yang sama ditelusuri bersamaan | Yang selesai lebih dulu dan akurat |
| Susun Kata (L-01) | Kata sama, dua papan susun | Yang menyusun benar lebih dulu |
| Bunyi Awal (L-02) | Satu kata, dua papan pilihan | Poin terbanyak dari 5 soal |
| Menulis Huruf (L-03) | Dua huruf yang sama ditelusuri bersamaan | Yang selesai lebih dulu dan akurat |
| Kartu Kembar (G-01) | Bergiliran: giliran berpindah jika gagal; sorotan warna menunjukkan giliran siapa | Pasangan terbanyak |
| Petualangan Labirin (G-02) | Dua labirin identik berdampingan, adu cepat ke makanan | Yang sampai lebih dulu |

**Aturan umum:** sentuhan multi-jari dipisahkan per area sehingga sentuhan di area pemain lain diabaikan; telapak tangan yang menyentuh layar (palm rejection dasar) tidak dihitung sebagai ketukan.

## 13. Kebutuhan UX Layar Sentuh & Ramah Anak

Semua interaksi dirancang untuk jari kecil yang belum presisi dan anak yang belum membaca.

| Aspek | Kebutuhan |
| --- | --- |
| Ukuran target sentuh | Minimal 64 × 64 px (sekitar 12 mm), jarak antar tombol minimal 16 px; tombol utama (Mulai, pilihan jawaban) minimal 96 px |
| Gestur | Hanya ketuk, seret, dan telusuri dengan satu jari. Tanpa gestur dua jari (cubit atau geser dua jari) kecuali di mode 2 pemain yang diisolasi per area |
| Toleransi sentuh | Ketukan diterima jika jari bergerak kecil (≤ 12 px); telusuri toleran terhadap jari yang melenceng dari jalur |
| Pencegahan sentuhan tak sengaja | Matikan zoom dan gulir halaman saat bermain, abaikan sentuhan telapak tangan, tombol keluar dilindungi gerbang orang tua |
| Orientasi | Lanskap sebagai utama; di mode potret tampilkan petunjuk memutar layar dengan ikon |
| Teks | Minimal; instruksi utama berupa suara dan ikon. Teks yang ada memakai huruf besar, tebal, kontras tinggi (min 4,5 : 1) |
| Warna dan kontras | Warna cerah, tidak hanya warna yang membedakan benar dan salah (tambah bentuk dan suara) agar aman untuk buta warna |
| Suara | Pemandu suara jelas dan lambat, volume efek lebih rendah dari suara pemandu, tombol bisukan di pojok layar |
| Animasi | Singkat (≤ 1 detik) untuk umpan balik; hindari kedipan cepat (risiko kejang fotosensitif) |
| Keamanan anak | Tanpa iklan, tanpa tautan keluar, tanpa kolom isian teks, tanpa pengumpulan data pribadi |
| Umpan balik salah | Selalu positif dan memberi kesempatan mencoba lagi; tidak ada penalti atau nilai negatif |

Ukuran target di atas adalah titik awal dan perlu diuji pada beberapa ukuran tablet dan HP dengan anak sungguhan sebelum rilis.

## 14. Kebutuhan Teknis & Non-Fungsional

Produk adalah web app yang dibuka lewat peramban, tanpa instal dan tanpa akun, dengan satu basis kode untuk semua perangkat sentuh.

| Area | Kebutuhan |
| --- | --- |
| Platform | Web responsif; peramban target: Chrome dan Safari (dua versi terakhir) di Android, iPadOS, dan iOS, serta Chrome di Windows layar sentuh |
| Teknologi (usulan) | HTML5 + JavaScript/TypeScript, canvas untuk tracing dan labirin, Web Audio untuk suara; framework game ringan atau komponen web biasa, diputuskan tim teknis |
| Performa | Muat pertama ≤ 3 detik di jaringan 4G; 60 fps di tablet menengah; ukuran awal ≤ 5 MB, aset game lain dimuat saat dibutuhkan |
| Offline | PWA (dapat dipasang ke layar utama) dengan cache aset, agar bisa dimainkan tanpa internet setelah dibuka sekali |
| Layar penuh | Fullscreen API di Android dan desktop; di iPhone Safari tombol disembunyikan dan layar dioptimalkan lewat PWA mode standalone |
| Audio | Rekaman suara per bahasa (bukan suara sintetis) agar lafal huruf, hijaiyyah, dan ejaan akurat; suara dimuat sebelum game dimulai untuk menghindari jeda |
| Penyimpanan | Mode tamu: penyimpanan lokal peramban (level terakhir, bahasa, volume). Mode akun orang tua: data bermain disimpan di Supabase (Postgres, wilayah Singapura) dengan aturan akses per orang tua (RLS). Tidak ada data pribadi anak selain nama panggilan |
| Privasi | Akun hanya untuk orang tua dan opsional (anak tidak punya akun); tanpa pelacak pihak ketiga; analitik anonim saja dan dapat dimatikan. Pemrosesan data anak perlu ditinjau ahli hukum sebelum fitur login dirilis. Kebijakan privasi singkat diperlukan sebelum rilis publik |
| Aksesibilitas | Dukungan pembaca layar untuk menu orang tua; tidak diwajibkan untuk game anak, tetapi label ARIA tetap diberikan |
| Lokalisasi | Semua teks dan suara dipisahkan dari kode (file bahasa) sehingga bahasa baru dapat ditambah tanpa mengubah game |
| Keandalan | Tidak ada layar buntu: setiap layar punya tombol kembali yang valid; game tidak crash jika suara gagal dimuat |

## 15. Kebutuhan Konten & Aset

Konten (suara, gambar, kosakata) adalah pekerjaan terbesar di luar kode dan perlu dimulai paralel dengan pengembangan.

| Aset | Isi | Catatan |
| --- | --- | --- |
| Rekaman suara Ms Ziya | Instruksi, umpan balik, angka 0–20, huruf A–Z, 28 huruf hijaiyyah, kata kosakata, dalam Bahasa Indonesia dan Inggris | Satu narator per bahasa; suara hijaiyyah perlu pengucapan yang benar dan sebaiknya ditinjau guru ngaji |
| Efek suara dan musik | Klik, benar, coba lagi, bintang, kemenangan, musik latar lembut | Bisa dibisukan; hindari suara keras mendadak |
| Ilustrasi | Maskot Ms Ziya, benda hitung (buah, hewan, balon), gambar kosakata, kartu kembar, labirin, makanan | Gaya ilustrasi konsisten, ramah anak, bebas dari karakter berhak cipta |
| Jalur tulisan | Jalur goresan untuk 0–20, A–Z dan a–z, 28 huruf hijaiyyah dengan urutan goresan benar | Hijaiyyah perlu ditinjau ahli (urutan goresan dan titik) |
| Daftar kosakata | Kata, gambar, dan suara untuk Susun Kata dan Bunyi Awal, per bahasa | Pilih kata yang mudah, bersuku kata jelas, dan netral budaya |
| Teks antarmuka | Judul, tombol (Mulai/Start, Level, 1 Pemain/2 Pemain), pesan gerbang orang tua | Dalam file bahasa terpisah |

**Catatan penting:** referensi [Kids From Home](https://games.kidsfromhome.com/) dipakai sebagai inspirasi pengalaman bermain saja. Ilustrasi, suara, dan karakter harus dibuat sendiri agar tidak melanggar hak cipta pihak lain.

## 16. Roadmap Rilis

&#91;embedded content: roadmap MVP · 4 tahap, 3 gerbang\]

MVP dibangun dalam empat tahap; game yang tidak butuh tulisan jari dikerjakan lebih dulu, sedangkan game tulis dan labirin menyusul setelah mesin tracing terbukti nyaman di layar sentuh. Tanggal belum ditentukan karena tim dan target rilis belum diketahui.

1. **Gerbang 1:** anak uji bisa menyelesaikan satu jalur tulis di tablet dan HP; rekaman suara pertama selesai.
2. **Gerbang 2:** alur lengkap dari pilih bahasa sampai layar hasil berjalan dalam dua bahasa tanpa layar buntu.
3. **Gerbang 3:** sentuhan dua pemain tidak bertabrakan; uji dengan anak 4–6 tahun dan orang tua lulus; performa sesuai bagian 14; aturan akses data (RLS) lolos uji dengan dua akun orang tua berbeda.

## 17. Risiko & Pertanyaan Terbuka

Risiko terbesar ada di konten hijaiyyah dan pekerjaan rekaman suara dua bahasa, bukan di kode.

**Risiko**

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Kesalahan bentuk, titik, atau urutan goresan hijaiyyah | Anak belajar yang salah, kepercayaan orang tua turun | Tinjau konten oleh guru ngaji atau ahli sebelum rilis |
| Rekaman suara dua bahasa lama selesai | Rilis tertunda | Mulai rekaman sejak awal; rilis fase 1 dengan satu bahasa jika perlu |
| Tracing tidak akurat di layar kecil | Anak frustrasi | Jalur toleran, uji di HP dan tablet dengan anak |
| Layar penuh tidak didukung di iPhone Safari | Pengalaman berbeda | Sembunyikan tombol dan sarankan PWA |
| Mode 2 pemain di layar HP terlalu sempit | Sentuhan bertabrakan | Rekomendasikan tablet; di HP kecil tampilkan peringatan |
| Iklan atau pelacak membuat orang tua tidak percaya | Kepercayaan hilang | Kebijakan tanpa iklan dan tanpa data pribadi |

**Pertanyaan terbuka**

- [ ] Apakah seluruh 9 game wajib ada di rilis pertama, atau mulai dengan sebagian dulu?
- [ ] Kurikulum hijaiyyah apa yang dipakai (urutan huruf, penyebutan "alif, ba, ta" atau metode lain seperti Iqra)?
- [ ] Siapa yang merekam suara Ms Ziya, dan apakah ada suara tambahan untuk Inggris?
- [ ] Apakah produk diberi nama resmi "Play with Ms Ziya" dan siapa maskotnya (sosok nyata atau karakter ilustrasi)?
- [ ] Apakah perlu bisa dipasang sebagai PWA dan dimainkan offline sejak awal?
- [ ] Angka 0 ikut dilatih, atau mulai dari 1 saja?
- [ ] Apakah ada rencana monetisasi (gratis, donasi, berlangganan) yang memengaruhi desain sekarang?
- [ ] Berapa target tanggal rilis dan siapa tim pengembangnya?
