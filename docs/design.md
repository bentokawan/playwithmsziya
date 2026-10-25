# design.md — Panduan Desain: Play with Ms Ziya

Panduan ini mendokumentasikan spesifikasi desain visual dan antarmuka untuk web game anak usia 4–6 tahun berbasis layar sentuh lanskap (1280×720). Desain mengusung filosofi **clean, minimalist, and simple** yang terinspirasi dari estetika Skandinavia untuk anak-anak, tata letak bersih _Khan Academy Kids_, dan ketenangan visual _Headspace for Kids_.

Pendekatan ini sengaja **meninggalkan gaya konvensional game anak yang ramai, berantakan, bergaris tepi tebal, atau penuh ornamen dekoratif** (seperti referensi arcade/karnaval). Fokus utama adalah menghadirkan ruang bermain digital yang lapang, tenang, hangat, dan ramah sensori bagi anak usia prasekolah.

---

## 1. Prinsip Desain

1. **Clean & Breathable (Bebas Distraksi Sensorik):**
   - Ruang bernapas (_whitespace_) yang sangat lega dan kanvas latar polos bernuansa hangat (`#FAF8F5`).
   - Bebas dari pola latar belakang berulang, huruf dekoratif melayang, glitter berlebihan, atau taburan konfeti yang membingungkan mata anak.
2. **Minimalist & Fungsional:**
   - Setiap elemen memiliki tujuan interaksi dan edukasi yang jelas.
   - Warna kategori tidak diaplikasikan sebagai blok warna mencolok yang masif, melainkan sebagai aksen lembut (_tint_ 10–12%) pada lencana kategori, wadah ikon, dan penanda progres.
3. **Simple & Intuitif (Prinsip 3 Detik):**
   - Anak usia 4–6 tahun dapat memahami apa yang harus disentuh dalam 3 detik pertama tanpa bergantung pada instruksi teks.
   - Ikonografi garis bersih (_clean line-art_) atau ilustrasi datar (_flat art_ minimalis) dengan target sentuh ramah motorik kasar anak (touch target ≥ 64 px).
4. **Tanpa Garis Tebal & Shadow Keras (Soft Aesthetics):**
   - Mengganti garis tepi tebal (_chunky outlines_ 4–6 px) dengan garis pemisah tipis 1 px netral (`#E8E4DF`) atau pemisahan berbasis bayangan blur lembut (_subtle blur shadow_).
   - Sudut membulat proporsional (_corner radius_ 16 px untuk kartu, 12 px untuk tombol) yang terasa nyaman dan organik.
5. **Selalu Menyemangati (Tanpa Rasa Takut):**
   - Tidak ada indikator penalti, skor berwarna merah keras, atau suara sirine kegagalan.
   - Evaluasi keliru disampaikan lewat animasi goyangan lembut (_gentle wobble_) dan ajakan hangat "coba lagi" dengan aksen peach/oranye lembut (`#FF9F43`).
6. **Konsistensi Lintas Halaman:**
   - Seluruh 13 halaman (mulai dari Layar Preload hingga Dasbor Orang Tua) berbagi sistem token warna, tipografi, dan grid yang harmonis.

---

## 2. Acuan Visual Layar Menu Utama (Home Screen)

Berdasarkan spesifikasi desain acuan pada `docs/prompt_home_stitch.md`:

| Elemen                        | Spesifikasi Visual Acuan                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Latar Belakang Canvas**     | Warm white polos (`#FAF8F5`) atau pale cream (`#FFF9F2`), tenang tanpa pola/ornamen mengambang                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| **Header Kiri**               | Avatar Ms Ziya lingkaran bersih (40×40 px, border halus 2 px putih, soft shadow) berdampingan dengan logo teks **"Play with Ms Ziya"** (Fredoka SemiBold 18 px, Deep Navy `#1F2A5C`, tanpa outline/stroke gelembung)                                                                                                                                                                                                                                                                                                                                                                                  |
| **Header Kanan**              | 3 tombol utilitas kapsul minimalis berlatar abu hangat (`#F3F1EE`): Pemilih Bahasa (`ID/EN` berikon gembok kecil 🔒), Tombol Layar Penuh (`⛶`), dan Tombol Suara (`🔊`) dengan ikon _line-art_ navy tipis                                                                                                                                                                                                                                                                                                                                                                                             |
| **Tab Kategori (Filter Bar)** | Kapsul rounded pipih (tinggi 40 px, gap 10 px):<br>• ☀️ **Semua Mainan** (Aktif: Latar putih `#FFFFFF` + soft shadow halus, teks Navy)<br>• 🔢 **Angka (1 2 3)** (Inaktif: Transparan, teks abu-abu lembut `#9CA3AF`)<br>• 🔤 **Huruf (A B C)** (Inaktif: Transparan, teks abu-abu lembut)<br>• 🌙 **Hijaiyyah (ا ب ت)** (Inaktif: Transparan, teks abu-abu lembut)<br>• 🧩 **Ingat & Main** (Inaktif: Transparan, teks abu-abu lembut)                                                                                                                                                               |
| **Grid Permainan**            | Grid 3 kolom × 3 baris dengan jarak antar kartu 16–20 px horizontal & vertikal, seimbang di tengah layar                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| **Struktur Tiap Kartu**       | Permukaan putih murni (`#FFFFFF`), sudut lengkung 16 px, tanpa border tebal (menggunakan `box-shadow: 0 2px 16px rgba(31, 42, 92, 0.05)`):<br>• **Area Ikon:** Ilustrasi flat/line-art minimalis di atas wadah rounded pastel (_tint_ kategori 10% opacity)<br>• **Badge Kategori:** Pill kecil (11 px) dengan latar _tint_ pastel 12% dan teks warna kategori<br>• **Judul Game:** Fredoka SemiBold 15 px warna Deep Navy, ringkas 1 baris<br>• **Rating Bintang:** 3 bintang datar (14 px): Bintang terisi warna emas `#FFD200`, bintang kosong warna abu netral `#E5E7EB` (tanpa garis tepi tebal) |
| **Dock Status Bawah**         | Bilah horizontal melayang putih (`#FFFFFF`) berbayangan halus ke atas (`box-shadow: 0 -2px 16px rgba(31, 42, 92, 0.06)`), sudut 20 px, memuat 4 modul rapi:<br>1. **Profil Anak:** Avatar bulat 32 px + Nama _"Adik Bintang"_ + Subteks streak _"🔥 3 hari berturut"_<br>2. **Counter Hadiah:** Ikon bintang emas minimalis + teks _"12 Bintang"_<br>3. **Toggle Mode:** Segmen kapsul ramping `[ 👤 1 Pemain ]` vs `[ 👥 2 Pemain ]`<br>4. **Gerbang Orang Tua:** Tombol kapsul abu netral dengan ikon gembok 🔒 dan teks _"Orang Tua"_                                                              |

---

## 3. Palet Warna (Color System)

Selaras dengan prinsip minimalis, warna fungsional dipisahkan dengan jelas antara permukaan latar, tipografi, dan aksen pastel.

| Peran Token               | Nilai Heks / RGBA           | Penggunaan                                                                      |
| ------------------------- | --------------------------- | ------------------------------------------------------------------------------- |
| **Primary Canvas**        | `#FAF8F5`                   | Latar utama seluruh halaman (warm white, menenangkan mata)                      |
| **Pale Canvas (Alt)**     | `#FFF9F2`                   | Variasi latar area permainan tertentu yang membutuhkan suasana hangat           |
| **Card Surface**          | `#FFFFFF`                   | Permukaan kartu permainan, bilah dock bawah, kontainer modal                    |
| **Subtle Surface**        | `#F3F1EE`                   | Latar tombol utilitas header, segmen toggle inaktif, chip sekunder              |
| **Border / Divider**      | `#E8E4DF`                   | Garis pembagi tipis (1 px solid), batas kontainer yang memerlukan pemisah fisik |
| **Primary Text**          | `#1F2A5C`                   | Teks utama, judul game, heading, ikon navigasi aktif (Deep Navy kontras tinggi) |
| **Secondary Text**        | `#9CA3AF` / `#6B7280`       | Subteks, teks inaktif, penanda informasi pendamping                             |
| **Angka Accent**          | `#4DB8FF`                   | Aksen warna kategori Angka (Soft Blue)                                          |
| **Angka Tint (Card)**     | `rgba(77, 184, 255, 0.10)`  | Latar wadah ikon & badge kartu kategori Angka                                   |
| **Huruf Accent**          | `#FF6B6B`                   | Aksen warna kategori Huruf (Soft Coral)                                         |
| **Huruf Tint (Card)**     | `rgba(255, 107, 107, 0.10)` | Latar wadah ikon & badge kartu kategori Huruf                                   |
| **Hijaiyyah Accent**      | `#3DE6CF`                   | Aksen warna kategori Hijaiyyah (Soft Teal)                                      |
| **Hijaiyyah Tint (Card)** | `rgba(61, 230, 207, 0.10)`  | Latar wadah ikon & badge kartu kategori Hijaiyyah                               |
| **Ingat & Main Accent**   | `#9B8CFF`                   | Aksen warna kategori Ingat & Main (Soft Lavender)                               |
| **Ingat & Main Tint**     | `rgba(155, 140, 255, 0.10)` | Latar wadah ikon & badge kartu kategori Daya Ingat                              |
| **Star Gold**             | `#FFD200`                   | Bintang terisi, capaian belajar (kuning emas bersih tanpa border gelap)         |
| **Star Empty**            | `#E5E7EB`                   | Bintang belum tercapai (abu-abu terang netral)                                  |
| **Feedback Benar**        | `#3CCB7F`                   | Umpan balik jawaban tepat (Mint Green segar)                                    |
| **Feedback Coba Lagi**    | `#FF9F43`                   | Umpan balik coba lagi (Peach/Oranye lembut, ramah anak)                         |

---

## 4. Tipografi

Sistem tipografi dirancang agar ramah anak prasekolah tanpa mengorbankan kerapian visual:

- **Display & Judul (Headings / Game Titles):**
  - Font: **Fredoka** atau **Baloo 2** (Weight: SemiBold).
  - Karakteristik: Geometri membulat, bersahabat, namun tidak diberi _text-stroke_ atau _drop shadow_ tebal. Tampil bersih dan tajam.
- **Isi, Label, & Badge (Body & UI Labels):**
  - Font: **Nunito** (Weight: SemiBold / Regular).
  - Karakteristik: Keterbacaan sangat tinggi, kurva lembut, nyaman untuk anak yang baru belajar membaca dan orang tua pendamping.
- **Aksara Hijaiyyah:**
  - Font: **Noto Naskh Arabic** atau **Scheherazade New** untuk teks Arab standar; jalur penelusuran goresan (_finger-tracing_) menggunakan kurva vektor polyline SVG yang presisi.

### Skala Tipografi (Kanvas 1280 × 720 px):

- Judul Aplikasi (Header): 18–20 px (Fredoka SemiBold)
- Tab Kategori: 13–14 px (Nunito SemiBold)
- Judul Kartu Game: 15–16 px (Fredoka SemiBold)
- Badge Kategori: 11–12 px (Nunito SemiBold)
- Subteks / Counter Dock: 13–14 px (Nunito Regular / SemiBold)
- Judul Layar & Modal: 24–28 px (Fredoka SemiBold)
- Karakter Huruf / Angka / Hijaiyyah di Area Bermain: 140–200 px (Stroke tebal dan jelas)

---

## 5. Tata Letak Layar Acuan (Home Screen 1280 × 720)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [● Ms Ziya] Play with Ms Ziya                                     [ID/EN 🔒] [⛶] [🔊]  │
│                                                                                        │
│          [ ☀️ Semua Mainan ]  [ 🔢 Angka ]  [ 🔤 Huruf ]  [ 🌙 Hijaiyyah ]  [ 🧩 Ingat ]          │
│                                                                                        │
│ ┌─ Kartu 1: Angka ────┐  ┌─ Kartu 2: Angka ────┐  ┌─ Kartu 3: Huruf ────┐              │
│ │   [Angka]           │  │   [Angka]           │  │   [Huruf]           │              │
│ │     🍎 🍌 (123)     │  │       5 (garis)     │  │    [A][P][E][L]     │              │
│ │ Ayo Berhitung  ★★★  │  │ Menulis Angka  ★★★  │  │ Susun Kata     ★★★  │              │
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘              │
│                                                                                        │
│ ┌─ Kartu 4: Huruf ────┐  ┌─ Kartu 5: Huruf ────┐  ┌─ Kartu 6: Hijaiyyah ─┐              │
│ │   [Huruf]           │  │   [Huruf]           │  │   [Hijaiyyah]       │              │
│ │    👂 B (Fonik)     │  │       A (jejak)     │  │      ب [🔊]         │              │
│ │ Bunyi Awal     ★★★  │  │ Menulis Huruf  ★★★  │  │ Dengar&Temukan ★★★  │              │
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘              │
│                                                                                        │
│ ┌─ Kartu 7: Hijaiyyah ┐  ┌─ Kartu 8: Ingat ────┐  ┌─ Kartu 9: Ingat ────┐              │
│ │   [Hijaiyyah]       │  │   [Ingat & Main]    │  │   [Ingat & Main]    │              │
│ │     ج (titik garis) │  │       🂠 ★ 🂠         │  │     ╭─╮ 🏁          │              │
│ │ Tebalkan Hij.  ★★★  │  │ Kartu Kembar   ★★★  │  │ Labirin        ★★★  │              │
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘              │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ [👤] Adik Bintang   │  ⭐ 12 Bintang  │  [ 👤 1 Pemain | 👥 2 Pemain ]  │  🔒 Orang Tua │   │
│   │      3 hari berturut│                 │                                │               │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Spesifikasi Visual Kartu Permainan (9 Kartu)

Setiap kartu berukuran proporsional (kurang lebih 270 × 165 px pada grid 3×3 kanvas 1280×720):

- **Permukaan:** Putih solid (`#FFFFFF`)
- **Border:** Tanpa garis tepi pekat (opsional border 1 px sangat halus `#E8E4DF`)
- **Bayangan:** `box-shadow: 0 2px 16px rgba(31, 42, 92, 0.05)`
- **Sudut Lengkung:** `border-radius: 16px`
- **Jarak Dalam (Padding):** 16 px

### Rincian Konten 9 Kartu Sesuai Konsep Minimalis:

1. **Ayo Berhitung** (Kategori Angka · Biru Lembut)
   - Ikon: Ilustrasi line-art 3 buah (apel, pisang, jeruk) di atas lingkaran pastel biru muda (`rgba(77, 184, 255, 0.10)`).
   - Judul & Badge: Badge _"Angka"_, Judul **"Ayo Berhitung"**, Bintang `★★★` (emas & abu).
2. **Menulis Angka** (Kategori Angka · Biru Lembut)
   - Ikon: Angka `5` ramping bersih dengan titik awal goresan dan garis panduan minimalis.
   - Judul & Badge: Badge _"Angka"_, Judul **"Menulis Angka"**, Bintang `★★★`.
3. **Susun Kata** (Kategori Huruf · Karang Lembut)
   - Ikon: 3 balok huruf minimalis `[A] [P] [L]` dengan aksen warna coral transparan.
   - Judul & Badge: Badge _"Huruf"_, Judul **"Susun Kata"**, Bintang `★★★`.
4. **Bunyi Awal** (Kategori Huruf · Karang Lembut)
   - Ikon: Ikon telinga minimalis mendengarkan gelombang suara dengan huruf awal `B`.
   - Judul & Badge: Badge _"Huruf"_, Judul **"Bunyi Awal"**, Bintang `★★★`.
5. **Menulis Huruf** (Kategori Huruf · Karang Lembut)
   - Ikon: Huruf `A` bersih dengan jalur putus-putus tipis dan indikator pensil minimalis.
   - Judul & Badge: Badge _"Huruf"_, Judul **"Menulis Huruf"**, Bintang `★★★`.
6. **Dengar & Temukan** (Kategori Hijaiyyah · Tosca Lembut)
   - Ikon: Huruf hijaiyyah `ب` elegan disandingkan dengan simbol suara line-art.
   - Judul & Badge: Badge _"Hijaiyyah"_, Judul **"Dengar & Temukan"**, Bintang `★★★`.
7. **Tebalkan Hijaiyyah** (Kategori Hijaiyyah · Tosca Lembut)
   - Ikon: Huruf hijaiyyah `ج` bertitik rapi dengan titik awal bercahaya lembut.
   - Judul & Badge: Badge _"Hijaiyyah"_, Judul **"Tebalkan Hijaiyyah"**, Bintang `★★★`.
8. **Kartu Kembar** (Kategori Ingat & Main · Lembayung Lembut)
   - Ikon: Dua kartu datar berjejer, satu terbuka menampilkan bintang, satu tertutup.
   - Judul & Badge: Badge _"Ingat & Main"_, Judul **"Kartu Kembar"**, Bintang `★★★`.
9. **Petualangan Labirin** (Kategori Ingat & Main · Lembayung Lembut)
   - Ikon: Jalur labirin geometris minimalis menuju bendera finis kecil.
   - Judul & Badge: Badge _"Ingat & Main"_, Judul **"Petualangan Labirin"**, Bintang `★★★`.

---

## 7. Interaksi dan State Khusus

### 7.1 Filter Tab Kategori

- Tab **Semua Mainan** menampilkan 9 game secara utuh dalam grid 3×3.
- Mengklik tab kategori (misal: _Angka_) memfilter tampilan kartu menjadi 2 kartu permainan terkait dengan animasi _cross-fade_ lembut (200 ms).
- State aktif: Latar putih murni `#FFFFFF` dengan bayangan lembut `0 2px 8px rgba(0, 0, 0, 0.06)`, teks Deep Navy.
- State inaktif: Latar transparan, teks abu-abu lembut `#9CA3AF`, berubah menjadi abu sangat terang (`#F9F7F4`) saat disentuh/hover.

### 7.2 Switcher Mode Pemain di Dock Bawah

- Menggunakan komponen _segmented control_ ramping pada dock:
  - `[ 👤 1 Pemain ]`: Mode bermain individu standar.
  - `[ 👥 2 Pemain ]`: Mode bermain bersama (split-screen) di tablet yang sama.
- Segmen aktif memiliki latar putih dan bayangan lembut, segmen inaktif transparan.

### 7.3 Tombol Gerbang Orang Tua (Parental Gate)

- Tombol kapsul netral berlatar `#F3F1EE` dengan label _"Orang Tua"_ dan ikon gembok 🔒.
- Memerlukan sentuhan tahan 3 detik dengan indikator lingkaran progres yang terisi halus searah jarum jam untuk mencegah akses tidak sengaja oleh anak.

---

## 8. Gerak, Audio, dan Umpan Balik (Motion & Sound)

Animasi dirancang untuk memberikan ketenangan (_calm interactions_), bukan stimulasi berlebih:

| Peristiwa                     | Gerak / Animasi                                                     | Efek Suara                                     |
| ----------------------------- | ------------------------------------------------------------------- | ---------------------------------------------- |
| **Sentuh Kartu Game**         | Skala mengecil sangat halus (98%) lalu kembali (150 ms)             | Nada "pop" akustik lembut (kayu/bel)           |
| **Ganti Tab Kategori**        | Kartu bertransisi fade-in dan geser halus 6 px (200 ms)             | Suara klik lembut / desiran ringan             |
| **Jawaban Benar**             | Kilau lembut (_subtle shimmer_), kartu/objek membesar 104% (400 ms) | Harmoni lonceng manis / nada ceria             |
| **Jawaban Salah / Coba Lagi** | Goyangan lembut kiri-kanan (_soft wobble_ ±4 px, 300 ms)            | Nada marimba lembut bernuansa hangat           |
| **Bintang Hadiah**            | Bintang emas muncul bertahap dengan efek skala elastis lembut       | Arpeggio lembut mengalir                       |
| **Tahan Gerbang Orang Tua**   | Cincin lingkaran terisi searah jarum jam secara linear (3000 ms)    | Nada dengung lembut yang meninggi secara halus |

---

## 9. Aksesibilitas & Standar Perangkat Sentuh

- **Rasio Kontras Tinggi (WCAG AA & AAA):** Teks Deep Navy (`#1F2A5C`) di atas kanvas Warm White (`#FAF8F5`) dan kartu Putih (`#FFFFFF`) memiliki rasio kontras > 12:1 (jauh melampaui batas minimum 4.5:1).
- **Target Sentuh Nyaman (Touch Target Size):** Seluruh elemen interaktif memiliki area sentuh minimum 48×48 px (kartu game 270×165 px, tombol aksi utama ≥ 64 px).
- **Reduksi Beban Sensorik (Sensory-Friendly):**
  - Tidak ada animasi berkedip lebih dari 2 kali per detik.
  - Menghindari warna jenuh neon di area permukaan luas.
  - Mendukung preferensi sistem `prefers-reduced-motion` dan opsi "Kurangi Gerakan" di dasbor orang tua.
- **Pencegahan Sentuhan Tak Sengaja:** Menonaktifkan _pinch-to-zoom_, seleksi teks sengaja/tidak sengaja, dan menu konteks bawaan peramban tablet.
