# design.md — Panduan Desain: Play with Ms Ziya

Panduan ini mendokumentasikan spesifikasi desain visual dan antarmuka untuk web game anak usia 4–6 tahun berbasis layar sentuh, dengan acuan layar lanskap (Stitch / Figma). Desain mengedepankan gaya visual ramah anak: warna cerah ceria, garis tepi navy tebal, kartu rounded lebar, ubin filter kategori tab, serta dock profil & status yang rapi di bagian bawah.

---

## 1. Prinsip Desain
1. **Dibaca tanpa membaca.** Ikon visual, warna khas kategori, dan narasi suara memimpin interaksi; teks berfungsi sebagai pendukung bagi pendamping.
2. **Besar dan mudah ditekan.** Target sentuh besar, jarak lega (touch target ≥ 64 px), ramah motorik kasar anak usia 4–6 tahun.
3. **Selalu menyemangati.** Tidak ada skor merah atau penalti "kalah"; jawaban keliru diberi animasi goyang lembut dan ajakan "coba lagi".
4. **Satu layar, navigasi jelas.** Menu utama menampilkan 9 game dalam grid terstruktur 3×3 dengan filter kategori instan di atasnya.
5. **Konsisten.** Palet warna kategori (Angka, Huruf, Hijaiyyah, Ingat & Main) seragam mulai dari tab filter, badge kartu, hingga latar game.

---

## 2. Acuan Visual Layar Menu Utama (Home)
Berdasarkan hasil rancangan visual acuan:

| Elemen | Spesifikasi Visual Acuan |
| --- | --- |
| **Latar Belakang** | Kuning matahari (`#FFC62E`) cerah, dihiasi huruf samar dekoratif (A, B, 1, ا) dan kilau lembut di sudut |
| **Header Kiri** | Avatar maskot Ms Ziya bulat lingkaran berbingkai navy tebal di dalam kapsul logo teks: **"Play with Ms Ziya"** (warna-warni) |
| **Header Kanan** | Tiga tombol utilitas rounded/pill: Pemilih Bahasa (`ID/EN` berikon gembok kecil), Tombol Layar Penuh (`⛶`), dan Tombol Suara (`🔊`) |
| **Tab Kategori (Filter Bar)** | Baris tombol filter di bawah header: <br>• ☀️ **Semua Mainan** (Putih aktif)<br>• 🔢 **Angka (1 2 3)** (Biru langit)<br>• 🔤 **Huruf (A B C)** (Merah karang)<br>• 🌙 **Hijaiyyah (ا ب ت)** (Hijau tosca)<br>• 🧩 **Ingat & Main** (Lembayung ungu) |
| **Grid Permainan** | Grid 3 kolom × 3 baris (total 9 game). Kartu putih rounded berbingkai navy tebal dengan bayangan lembut |
| **Struktur Tiap Kartu** | • **Header kartu:** Badge nama kategori di kiri atas + Badge usia target `"Usia 4-6 th"` di kanan atas<br>• **Area ilustrasi:** Kanvas putih tengah berisi preview visual ikon game<br>• **Footer kartu:** Judul game tebal + deskripsi pendek di kiri bawah, serta indikator rating bintang (`★★★`) di kanan bawah |
| **Dock Status Bawah** | Baris panel bawah terbagi 4 modul:<br>1. **Profil Anak:** Avatar bulat + nama anak (*"Adik Bintang"*) + streak badge (*"3 Hari Beruntun 🔥"* / level tamu)<br>2. **Counter Hadiah:** Ikon bintang emas + total bintang (*"12 Bintang / Koleksi Terkumpul!"*)<br>3. **Pilihan Mode:** Switcher toggle pil: `[ 👤 1 Pemain ]` vs `[ 👥 2 Pemain ]`<br>4. **Gerbang Orang Tua:** Tombol *"Area Orang Tua"* dengan indikator *"Tahan 3 Detik"* dan ikon gembok |

---

## 3. Palet Warna

| Nama | Heks | Penggunaan |
| --- | --- | --- |
| **Matahari (Background Utama)** | `#FFC62E` | Latar utama layar, aksen bintang, bilah muat utama |
| **Langit (Kategori Angka)** | `#4DB8FF` | Tab Angka, badge kartu Angka, tombol sekunder |
| **Karang (Kategori Huruf)** | `#FF6B6B` | Tab Huruf, badge kartu Huruf, aksen ceria |
| **Tosca (Kategori Hijaiyyah)** | `#3DE6CF` | Tab Hijaiyyah, badge kartu Hijaiyyah |
| **Lembayung (Kategori Ingat & Main)** | `#9B8CFF` | Tab Ingat & Main, badge kartu Daya Ingat |
| **Navy (Border & Teks Utama)** | `#1F2A5C` | Garis tepi luar (border 4–6 px), teks heading dan isi |
| **Krem Putih (Permukaan Kartu)** | `#FFFFFF` / `#FFFDF5` | Permukaan kartu game, panel dock bawah, kontainer soal |
| **Lavender Muda** | `#E8E9F7` | Garis pembagi, bintang kosong / belum tercapai |
| **Bintang Emas** | `#FFD200` | Bintang terisi, piala/reward |
| **Hijau Benar** | `#3CCB7F` | Umpan balik jawaban tepat |
| **Oranye Lembut** | `#FF9F43` | Umpan balik coba lagi (pengganti warna merah menyengat) |

---

## 4. Tipografi
- **Judul & Logo (Display):** *Fredoka* atau *Baloo 2* (Bold / ExtraBold, rounded, garis tepi navy).
- **Sub-judul & Label Kartu:** *Nunito* (Bold / SemiBold).
- **Hijaiyyah:** *Noto Naskh Arabic* atau *Scheherazade New* untuk teks statis; jalur telusur finger-tracing menggunakan data polyline SVG.
- **Skala Ukuran (Kanvas 1280 × 720 px):**
  - Judul logo: 36–48 px
  - Label kategori / Tab bar: 20–24 px
  - Judul kartu game: 22–26 px
  - Subteks / deskripsi kartu: 14–16 px
  - Angka counter & tombol dock: 18–22 px
  - Huruf/Angka sasaran saat bermain di dalam game: 160–240 px

---

## 5. Tata Letak Layar Acuan (Home Screen 1280 × 720)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ [Ms Ziya] Play with Ms Ziya                                      [ID/EN 🔒] [⛶] [🔊]   │
│                                                                                        │
│ [ ☀️ Semua Mainan ] [ 🔢 Angka(123) ] [ 🔤 Huruf(ABC) ] [ 🌙 Hijaiyyah ] [ 🧩 Ingat&Main ] │
│                                                                                        │
│ ┌─ Kartu 1: Angka ────┐  ┌─ Kartu 2: Angka ────┐  ┌─ Kartu 3: Huruf ────┐              │
│ │ [Angka]  [Usia 4-6] │  │ [Angka]  [Usia 4-6] │  │ [Huruf]  [Usia 4-6] │              │
│ │    🍎 🍌 [123]      │  │     5 (tracing)     │  │    🍎 [A P E L]     │              │
│ │ Ayo Berhitung  ★★★  │  │ Menulis Angka  ★★★  │  │ Susun Kata     ★★★  │              │
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘              │
│                                                                                        │
│ ┌─ Kartu 4: Huruf ────┐  ┌─ Kartu 5: Huruf ────┐  ┌─ Kartu 6: Hijaiyyah ─┐              │
│ │ [Huruf]  [Usia 4-6] │  │ [Huruf]  [Usia 4-6] │  │ [Hijaiyyah] [Usia]  │              │
│ │  🐥 "B-b-Burung"    │  │       A             │  │      ب [🔊]         │              │
│ │ Bunyi Awal     ★★★  │  │ Menulis Huruf  ★★★  │  │ Dengar&Temukan ★★★  │              │
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘              │
│                                                                                        │
│ ┌─ Kartu 7: Hijaiyyah ┐  ┌─ Kartu 8: Ingat&Main┐  ┌─ Kartu 9: Ingat&Main┐              │
│ │ [Hijaiyyah] [Usia]  │  │ [Ingat]   [Usia4-6] │  │ [Ingat]   [Usia4-6] │              │
│ │      ج (dotted)     │  │     [★] [★]         │  │   🧁  🌀 🏁         │              │
│ │ Tebalkan Hij.  ★★★  │  │ Kartu Kembar   ★★★  │  │ Labirin        ★★★  │              │
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘              │
│                                                                                        │
│ ┌──────────────────────┐  ┌───────────────┐  ┌───────────────┐  ┌────────────────────┐ │
│ │ [👦] Adik Bintang    │  │ ⭐ 12 Bintang │  │ [👤 1P] [👥 2P]│  │ 🔒 Area Orang Tua  │ │
│ │      3 Hari Beruntun │  │    Koleksi    │  │     Mode      │  │    Tahan 3 Detik   │ │
│ └──────────────────────┘  └───────────────┘  └───────────────┘  └────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Spesifikasi Visual Kartu Permainan (9 Kartu)

Masing-masing kartu berukuran proporsional (sekitar 380 × 170 px pada grid 3×3 kanvas 1280×720):
- **Sudut Lengkung:** `border-radius: 20px`
- **Border:** `3px - 4px solid #1F2A5C` (Navy)
- **Background Utama:** Putih (`#FFFFFF`) dengan container preview abu-abu/krem lembut bergaris tepi tipis
- **Badge Kategori (Kiri Atas):** Pill kecil berwarna sesuai kategori (misal: Biru untuk Angka, Karang untuk Huruf)
- **Badge Usia (Kanan Atas):** Pill putih/krem dengan border navy tipis bertuliskan `"Usia 4-6 th"`

### Detail Konten 9 Kartu Sesuai Acuan:
1. **Ayo Berhitung** (Kategori Angka)
   - Preview visual: Buah apel merah 🍎, pisang 🍌, dan keranjang kuning bertuliskan `123`.
   - Judul & Subteks: **Ayo Berhitung** — *Menghitung Buah Ria*
   - Status Bintang: Rating `★★★`
2. **Menulis Angka** (Kategori Angka)
   - Preview visual: Angka `5` besar warna biru muda dengan teks panduan kecil `"- Tarik garis"`, `"- Ikuti titik"`.
   - Judul & Subteks: **Menulis Angka** — *Latihan Tracing Garis*
   - Status Bintang: Rating `★★★`
3. **Susun Kata** (Kategori Huruf)
   - Preview visual: Ilustrasi apel di atas, balok huruf bulat berwarna `[A] [P] [E] [L]` di bawah.
   - Judul & Subteks: **Susun Kata** — *Balok Huruf & Kosakata*
   - Status Bintang: Rating `★★★`
4. **Bunyi Awal** (Kategori Huruf)
   - Preview visual: Lingkaran kuning berisi ilustrasi anak ayam 🐥 dengan teks fonik `"B-b-Burung"` dan ikon nada `♫ Fonik Lagu`.
   - Judul & Subteks: **Bunyi Awal** — *Suara Fonik Seru*
   - Status Bintang: Rating `★★★`
5. **Menulis Huruf** (Kategori Huruf)
   - Preview visual: Huruf besar `A` warna karang dengan ilustrasi pensil kecil di goresannya.
   - Judul & Subteks: **Menulis Huruf** — *Jejak Huruf Alfabet*
   - Status Bintang: Rating `★★★`
6. **Dengar & Temukan** (Kategori Hijaiyyah)
   - Preview visual: Huruf hijaiyyah `ب` hijau tosca disandingkan dengan tombol speaker bulat `[🔊]`.
   - Judul & Subteks: **Dengar & Temukan** — *Tebak Suara Hijaiyyah*
   - Status Bintang: Rating `★★★`
7. **Tebalkan Hijaiyyah** (Kategori Hijaiyyah)
   - Preview visual: Huruf hijaiyyah `ج` hijau dari garis putus-putus dengan bintang kecil di titik awal goresan.
   - Judul & Subteks: **Tebalkan Hijaiyyah** — *Latihan Garis Dotted*
   - Status Bintang: Rating `★★★`
8. **Kartu Kembar** (Kategori Ingat & Main)
   - Preview visual: Dua kartu rounded persegi lavender kembar berdampingan dengan lambang bintang kuning `[★] [★]`.
   - Judul & Subteks: **Kartu Kembar** — *Asah Memori Ceria*
   - Status Bintang: Rating `★★★`
9. **Petualangan Labirin** (Kategori Ingat & Main)
   - Preview visual: Kue mangkuk manis 🧁, pusaran rintangan 🌀, tanda panah `➔`, dan bendera finis kotak-kotak 🏁.
   - Judul & Subteks: **Petualangan Labirin** — *Cari Jalan ke Kue Manis*
   - Status Bintang: Rating `★★★`

---

## 7. Interaksi dan State Khusus

### 7.1 Filter Tab Kategori
- Mengklik salah satu tab (misal `Angka (1 2 3)`) akan memfilter tampilan kartu di grid, hanya menampilkan 2 game angka terkait (dengan ukuran lebih besar atau posisi fokus).
- Tombol `Semua Mainan` mengembalikan tampilan ke 9 game dalam format grid penuh 3×3.
- State tab aktif: Tombol terangkat dengan border tebal dan warna solid sesuai kategori. State tidak aktif: sedikit transparan atau berlatar putih dengan border outline warna.

### 7.2 Switcher Mode Pemain di Dock Bawah
- Memungkinkan anak/pendamping memilih mode bermain langsung dari beranda:
  - `[ 👤 1 Pemain ]`: Mode solo standar.
  - `[ 👥 2 Pemain ]`: Mode duel split-screen saat kartu game diklik.

### 7.3 Tombol Gerbang Orang Tua (Parent Gate)
- Terletak di dock kanan bawah: Tombol putih berikon gembok 🔒.
- Memerlukan interaksi tahan sentuhan selama 3 detik (*"Tahan 3 Detik"* dengan visual cincin pengisi) sebelum membuka panel pengaturan / autentikasi.

---

## 8. Gerak, Audio, dan Umpan Balik (Motion & Sound)

| Peristiwa | Gerak / Animasi | Efek Suara |
| --- | --- | --- |
| **Kartu Game Ditekan** | Kartu menekan ke bawah (offset 4 px) lalu memantul halus (120 ms) | Efek *"pop"* ceria |
| **Ganti Tab Kategori** | Kartu yang muncul bertransisi fade-in & scale-up lembut (200 ms) | Suara klik lembut / *whoosh* |
| **Tombol Dock Ditekan** | Skala mengecil 95% lalu kembali | Klik lembut |
| **Tahan Gerbang Orang Tua** | Cincin pengisi lingkaran terisi penuh searah jarum jam (3 detik) | Nada dengung frekuensi naik |
| **Bintang Hadiah** | Kilau berkedip setiap kali bintang bertambah | Nada arpeggio gembira |

---

## 9. Aksesibilitas & Standar Perangkat Sentuh
- **Orientasi:** Terkunci pada orientasi lanskap (*Landscape* 16:9).
- **Target Sentuh:** Seluruh kartu (380 × 170 px) dan tombol utilitas (≥ 64 px) memiliki area sentuh luas tanpa risiko salah pencet.
- **Pencegahan Sentuhan Tak Sengaja:** Menonaktifkan fungsi pinch-to-zoom, seleksi teks, serta menu klik-kanan/konteks di peramban tablet.
- **Kontras Warna:** Teks Navy (`#1F2A5C`) di atas permukaan Putih (`#FFFFFF`) dan Kuning Matahari (`#FFC62E`) memenuhi standar WCAG AA (rasio kontras > 7:1).
