# Play with Ms Ziya — Design System v2 (PAUD)

- Versi: 2.1 — 2026-11-25 (menggantikan [design v1](archive/design-v1-2026-11-25.md)). v2.1: audio tanpa voice-over.
- Spesifikasi rinci: [game-specs](specs/game-specs.md) · [content](specs/content.md) · [audio](specs/audio.md) · [assets-brief](specs/assets-brief.md) · [copy](specs/copy.md)
- Audiens: anak PAUD 4–6 tahun, didampingi orang tua/guru
- Terkait: [PRD](prd.md) · [Architecture](architecture.md) · [Plan redesign](plan/2026-11-25-paud-redesign-plan.md) · [Brief asli](archive/brief.md)

<!-- ryux-context:start -->
- **Audience**: Anak 4–6 tahun (belum lancar membaca) + pendamping.
- **UI direction**: "Dunia per kategori" — flat illustration, bentuk membulat, balok huruf/angka 3D-datar. Hybrid: latar pastel biru muda/pink, elemen yang bisa diketuk biru/pink pekat dengan teks putih.
- **Motion direction**: Bouncy tapi singkat; gerak hanya sebagai respons tindakan anak. Tanpa loop ramai, flash, atau shake keras.
- **Technology**: Motion (`motion/react`, LazyMotion) + CSS Modules + CSS custom properties. GSAP tidak dipakai di baseline.
<!-- ryux-context:end -->

---

## 1. Prinsip desain

1. **Tanpa membaca pun bisa main.** Instruksi disampaikan lewat demo tangan animasi dan gambar, sedangkan setiap aksi punya SFX. Tidak ada voice-over narasi. Teks hanya pelengkap untuk pendamping.
2. **Satu layar, satu tugas, satu tombol utama.** Pilihan untuk anak maksimal 4 per layar.
3. **Besar, bulat, dan bisa ditekan.** Semua yang interaktif tampil seperti balok mainan: ada sisi bawah yang lebih gelap dan terasa "turun" saat ditekan.
4. **Tenang dulu, meriah sebentar.** Latar diam. Gerak muncul hanya setelah anak bertindak, lalu berhenti.
5. **Salah itu bagian dari bermain.** Jawaban salah tidak mengurangi apa pun. Respon untuk salah lebih lembut dibanding respon untuk benar.
6. **Jujur.** Tidak ada bintang, streak, atau statistik palsu. Yang tampil hanya hasil sesi yang benar-benar terjadi.

Brief awal menyebut arah "clean, minimalist" ala Khan Academy Kids. Di v2, prinsip itu dipertahankan lewat **arena yang bersih**, sedangkan karakter dan dekorasi diletakkan di tepi layar.

## 2. Referensi dan adaptasi (Amati–Tiru–Modifikasi)

### 2.1 Gambar referensi pengguna (`image.png`)

| Yang diamati | Yang ditiru (pola) | Modifikasi untuk Ms Ziya |
| --- | --- | --- |
| Latar berlapis: langit → siluet bukit bergelombang → tanah, objek kecil (awan, bunga, pohon) | Layer latar 3–4 bidang flat tanpa gradien | Satu dunia per kategori (§5), palet biru/pink |
| Gelembung pikiran putih berisi gambar petunjuk (es krim, rumah) | "Gelembung petunjuk" = soal visual, bisa diketuk untuk mendengar kata | Gelembung selalu di kiri atas arena dan juga menjadi tombol 🔊 |
| Balok huruf: kotak rounded, warna pekat, huruf putih tebal, sisi bawah gelap | Komponen `Tile` (§7.2) | Biru = jawaban/aktif, pink = slot/target, putih = netral |
| Slot kosong berwarna (biru) di dalam kata | `Slot` kosong menandai tempat jawaban | Slot diberi garis putus-putus dan denyut halus satu kali saat menunggu |
| Karakter alam berwajah sederhana memegang balok jawaban | "Teman penjaga soal" yang memegang pilihan | Karakter **orisinal** per dunia (§5); bukan pohon/gunung referensi |
| Tombol kembali bulat + nomor level dalam awan | Navigasi bulat di kiri atas | Kembali + penanda ronde berupa titik (●●○), bukan angka |

> Hak cipta: gambar referensi tidak boleh di-trace, disalin, atau dipakai sebagai aset. Kata Spanyol, komposisi persis, dan karakter pohon/gunung tidak diambil. Yang diadopsi hanya tata bahasa visualnya.

### 2.2 games.kidsfromhome.com (konsep, diamati 2026-11-25)

| Pola situs | Adopsi di Ms Ziya |
| --- | --- |
| Katalog kartu + filter skill (Numbers, Letters, Memory, Hijaiyah, Writing) dan usia | Beranda menampilkan semua 9 game langsung dalam grid kartu dengan tema warna dunia |
| Level "Easy / Medium / Tricky" dipilih sebelum Start | Mudah / Sedang / Menantang, ditampilkan sebagai 1/2/3 bintang bergambar + tombol ▶ besar |
| Halaman game memuat "About this game / What your child practises" | Panel **Untuk Pendamping** (dapat dilipat) di Intro, tidak tampil di jalur utama anak |
| "Tap a friend to hear it" / "Tap any letter to hear its name" | Item belajar yang punya klip (angka, huruf, kata, hijaiyyah) bisa diketuk untuk didengar. Karakter yang diketuk memberi tawa anak-anak (`kids-giggle`) |
| "My stickers" (koleksi stiker) | **Buku Stiker**: setiap sesi selesai memberi 1 stiker dunia. Ini menggantikan skor dan streak |
| "More games to try" | Di layar hasil: maksimal 2 saran game dari dunia yang sama |
| Grown-up gate sebelum tautan luar; tanpa iklan, chat, atau sign-up | **Gerbang pendamping** (tahan tombol 2 detik + soal hitung sederhana) untuk Pengaturan |

Game di luar brief, seperti Bubble math dan Shape sorter, hanya **kandidat backlog**. Tidak masuk ke rilis ini.

## 3. Warna (Hybrid)

Aturan dasar: **bidang besar pastel, bidang yang bisa diketuk pekat.** Teks putih hanya boleh dipakai di atas warna pekat dengan ukuran besar dan tebal (≥ 20 px bold), yang memenuhi ambang AA teks besar 3:1. Teks biasa memakai navy.

### 3.1 Token inti

| Token | Hex | Peran | Kontras terukur |
| --- | --- | --- | --- |
| `--sky-50` | `#EAF7FF` | Kanvas utama | navy 13.2:1 |
| `--sky-100` | `#CDEFFF` | Permukaan sekunder, langit dunia | navy 11.9:1 |
| `--sky-300` | `#7FD3FF` | Dekorasi (bukit jauh, awan bayangan) | dekor saja |
| `--blue-500` | `#0A8FD6` | **Primer**: tombol utama, balok jawaban | putih 3.55:1 (teks besar ✔) |
| `--blue-700` | `#0670AE` | Sisi bawah balok biru, ikon di atas putih | — |
| `--pink-50` | `#FFF0F6` | Kanvas dunia Huruf, latar kartu aktif | navy 13.1:1 |
| `--pink-200` | `#FFC2DC` | Dekorasi, highlight terpilih | dekor saja |
| `--pink-500` | `#E8458B` | **Sekunder**: slot target, pilihan aktif, badge | putih 3.71:1 (teks besar ✔) |
| `--pink-700` | `#B8306C` | Sisi bawah balok pink | — |
| `--navy-900` | `#1B2559` | Teks utama, ring fokus | — |
| `--ink-500` | `#5A6588` | Teks pendamping (≥ 16 px) | di kanvas 5.27:1 ✔ |
| `--white` | `#FFFFFF` | Kartu, gelembung, huruf pada balok | — |

### 3.2 Warna fungsional

Warna fungsional tidak pernah menjadi satu-satunya penanda. Selalu ada ikon, suara, atau gerak yang menyertai.

| Token | Hex | Pakai untuk |
| --- | --- | --- |
| `--success-500` / `--success-700` | `#1F9E5C` / `#167A46` | Balok benar (+ ✓ + suara ceria) |
| `--sun-400` | `#FFB020` | Bintang/stiker, sorotan progres (tidak untuk teks) |
| `--coral-400` | `#FF8A3D` | "Coba lagi" lembut (+ ikon tangan menunjuk). **Tidak memakai merah.** |

### 3.3 Palet dunia (latar saja)

| Dunia | Langit | Bukit jauh | Tanah | Aksen |
| --- | --- | --- | --- | --- |
| Angka — *Padang Hitung* | `#CDEFFF` | `#9FE0C4` | `#3DBE7A` | bunga putih |
| Huruf — *Taman Permen* | `#FFF0F6` | `#FFC2DC` | `#F48FB8` | awan biru `#7FD3FF` |
| Hijaiyyah — *Langit Lentera* | `#DCE6FF` | `#A9B8F5` | `#6C7FD8` | bintang `#FFE29A`, bulan sabit |
| Ingat & Main — *Pulau Pasir* | `#FFF3DD` | `#FFD7A8` | `#F2B36F` | ombak `#7FD3FF` |

Latar dunia memakai saturasi lebih rendah daripada balok supaya objek interaktif selalu paling menonjol. Hijaiyyah sengaja dibuat paling tenang (senja, bukan malam gelap).

### 3.4 Warna profil pemain (`--player-*`)

Delapan warna profil ramah aksesibilitas (kontras ≥ 4.7:1 terhadap teks putih) dipakai untuk chip pemain, avatar, dan runner `RaceBar`:
`--player-merah`, `--player-oranye`, `--player-kuning`, `--player-hijau`, `--player-tosca`, `--player-biru`, `--player-ungu`, `--player-merah-muda`.

Dipasangkan dengan 8 SVG avatar hewan orisinal (`AnimalAvatar`: `kelinci`, `kucing`, `beruang`, `panda`, `rubah`, `katak`, `ayam`, `gajah`).

## 4. Tipografi

| Peran | Font | Ukuran (tablet) | Catatan |
| --- | --- | --- | --- |
| Huruf/angka pada balok | Fredoka Bold | 40–64 px | Huruf Latin memakai bentuk "a/g" satu tingkat (ramah PAUD) |
| Judul layar | Fredoka SemiBold | 32–40 px | Maks 3 kata |
| Label tombol | Fredoka SemiBold | 22–28 px | Selalu ditemani ikon |
| Teks pendamping | Nunito SemiBold | 16–18 px | Hanya di panel pendamping |
| Hijaiyyah | Noto Naskh Arabic Bold | 56–96 px | `lang="ar" dir="rtl"` per elemen saja |

Font di-*self-host* (woff2, subset Latin + Arab) dengan `font-display: swap`. Tidak ada teks di bawah 16 px. Ukuran memakai `clamp()` terhadap sisi pendek viewport.

## 5. Dunia, karakter, dan ilustrasi

### 5.1 Konsep "Dunia sebagai tema warna"

Empat dunia (Angka, Huruf, Hijaiyyah, Ingat & Main) berperan sebagai **tema warna kartu, latar arena, karakter pendamping, musik, dan suara alam** — bukan halaman perantara terpisah. Beranda menampilkan semua 9 game langsung dalam satu grid kartu. Game di dalam satu dunia berbagi palet dan latar yang sama.

| Dunia | Game (ID PRD) | Teman penjaga soal (orisinal) | Cara memegang pilihan |
| --- | --- | --- | --- |
| Padang Hitung | G01 Ayo Berhitung, G02 Menulis Angka | **Jeje** si jerapah biru | Balok angka menempel bertumpuk di lehernya |
| Taman Permen | G03 Susun Kata, G04 Bunyi Awal, G05 Menulis Huruf | **Pipi** si awan pink | Balok huruf menggantung dari awan seperti tetes hujan |
| Langit Lentera | G06 Dengar & Temukan, G07 Menulis Hijaiyyah | **Lulu** si lentera bulan | Huruf hijaiyyah berada di lentera-lentera kecil |
| Pulau Pasir | G08 Kartu Kembar, G09 Labirin | **Kuku** si kura-kura | Kartu tersusun di tempurung; maze dibangun dari jalan pasir |

**Ms Ziya** (maskot utama) muncul di Beranda, Intro, dan Hasil sebagai pemandu visual (ekspresi + gerak), tanpa narasi suara. Di dalam arena, peran itu diambil teman penjaga supaya cukup satu karakter dominan per layar.

### 5.2 Aturan gaya ilustrasi

- Vektor flat (SVG): bidang warna solid, **tanpa outline hitam**, tanpa gradien, tanpa tekstur. Bayangan cukup satu bidang lebih gelap.
- Wajah: dua mata titik + senyum garis + pipi bulat. Ekspresi yang disediakan: senang, berpikir, kagum. **Tidak ada ekspresi marah/sedih**, termasuk saat anak salah (yang dipakai: "berpikir").
- Bentuk: radius besar, siluet terbaca dari jauh. Objek soal minimal 96 px.
- Objek soal berasal dari dunia sehari-hari anak Indonesia (apel, rumah, kucing, bola, ikan). Kata dipilih supaya gambarnya tidak ambigu di ID maupun EN.
- Format: SVG inline/sprite untuk karakter dan UI, ditambah WebP untuk latar besar bila SVG terlalu berat. Setiap aset dicatat di `project/src/assets/ASSETS.md` (sumber, pembuat, lisensi).
- Emoji prototipe dihapus seluruhnya dari UI anak.

## 6. Layout dan ruang sentuh

### 6.1 Target sentuh (wajib)

| Elemen | Minimum | Disarankan | Jarak antar target |
| --- | --- | --- | --- |
| Navigasi (kembali, suara, layar penuh) | 64×64 px | 72×72 px | ≥ 16 px |
| Pilihan jawaban / balok / kartu | 88×88 px | 96–120 px | ≥ 20 px |
| Tombol utama (▶ Mulai, Main lagi) | 96 px tinggi | 112 px, lebar ≥ 240 px | — |
| Kartu game di Beranda | 120 px tinggi (HP) / 248 px (tablet+) | Grid 1 / 2 / 3 kolom | ≥ 20 px |

Ukuran diukur dari bounding box elemen yang bisa diketuk, bukan dari ikonnya. Area sentuh boleh lebih besar dari visual (dengan `::after` inset negatif), tetapi tidak boleh tumpang tindih. Kontrol diletakkan ≥ 24 px dari tepi layar dan menghormati `env(safe-area-inset-*)`. Tidak ada aksi yang bergantung pada hover, double-tap, long-press (kecuali gerbang pendamping), atau multi-touch.

### 6.2 Kerangka layar (Arena v2)

```text
┌──────────────────────────────────────────────────────────┐
│ (◀)  ●●○                                   (🔊) (⛶)       │  ← zona navigasi tetap (88 px)
│                                                          │
│                  ☁ Gelembung petunjuk                    │
│                  [ ][ E ][ L ][ A ]       ┌────────┐     │  ← area soal (.prompt, flex: 1)
│                       ↑ slot              │ buddy  │     │     karakter dekoratif (≥600px)
│                                           └────────┘     │
│                   [ G ]  [ P ]  [ T ]                    │  ← baki jawaban (.tray, satu baris)
│ ~~~~~~~~ bukit / tanah (dekorasi diam) ~~~~~~~~~~~~~~~~~~│
└──────────────────────────────────────────────────────────┘
```

- Semua game memakai satu tata letak Arena v2: **soal di atas** (`flex: 1`) dan **baki jawaban di bawah** (satu baris, rata tengah). Karakter dunia menjadi dekorasi kecil (`.buddy`) di pojok kanan bawah soal dan disembunyikan di bawah 600 px.
- Posisi navigasi **tidak pernah berpindah**: kembali di kiri atas, suara dan layar penuh di kanan atas (sesuai brief).
- Penanda ronde berupa titik (maks 5 ronde per sesi), bukan angka atau timer.
- `Scene` memakai `overflow-x: hidden; overflow-y: auto` agar tombol bawah tidak terpotong di layar pendek. Gunakan `touch-action: none` hanya di kanvas tracing/maze.

## 7. Komponen

### 7.1 Inventaris

| Komponen | Pakai di | State wajib |
| --- | --- | --- |
| `BlockButton` (primer/sekunder/ikon) | semua | default, pressed, focus-visible, disabled, loading |
| `Tile` (balok huruf/angka/hijaiyyah) | arena | idle, terpilih, terbang, benar, coba-lagi, terkunci |
| `Slot` | arena | kosong-menunggu, terisi, benar |
| `HintBubble` | arena | idle, berbicara (audio main) |
| `GameCard` | beranda (`grid`), hasil (`compact`) | ilustrasi berlatar warna dunia + judul + tagline; default, pressed, belum-tersedia |
| `LevelPicker` (1/2/3 bintang) | intro | terpilih jelas lewat bentuk + warna + centang |
| `PlaceChooser` & `PlayerSlots` | intro | `PlaceChooser` (`1 Layar` vs `2 Perangkat`) hanya bila flag room menyala; `PlayerSlots`: 1/2 anak + slot profil/Tamu opsional |
| `GamePreview` | intro | pratinjau kontekstual 6 template (count, trace, letters, sound, memory, maze); `motion/react`, hanya transform/opacity/pathLength, frame akhir statis saat calm, `aria-hidden`, dimuat lazy |
| `RosterPicker` | modal slot pemain, gabung ruang | chip profil (`AnimalAvatar` + warna), "+ Pemain baru", "Tamu" |
| `RaceBar` | layar dibagi (vertikal) & online (horizontal) | 2 lintasan warna pemain + `AnimalAvatar` bergerak sesuai progres + lencana `menyambung…` & cincin masa tenggang 30 detik |
| `RoomLobby` | `/game/:id/ruang`, `/gabung/:code` | lobby terpadu host & guest (kode 72 px, salin tautan, kartu cek siap, hitung mundur 3-2-1, error ramah) |
| `TurnBanner` | arena 2 pemain | P1 biru / P2 pink + nama ikon hewan |
| `RoundDots` | arena | selesai / aktif / belum |
| `StickerReveal` | hasil | tertutup → terbuka |
| `GrownUpGate` | pengaturan | tahan 2 detik → soal hitung → masuk |
| `Dialog` | konfirmasi keluar, bahasa | focus trap, Escape, restore focus |

### 7.2 Anatomi balok (`BlockButton` / `Tile`)

```text
   ╭──────────╮   radius 20 px (tile) / 28 px (tombol utama)
   │    A     │   muka: --blue-500 · huruf putih Fredoka Bold
   ╰──────────╯
   ▔▔▔▔▔▔▔▔▔▔▔▔   sisi bawah: 6 px --blue-700 (box-shadow 0 6px 0)
pressed → translateY(4px) + sisi bawah tinggal 2 px
```

- Varian warna: **biru** = bisa dipilih, **pink** = slot/target, **putih + navy** = netral/sekunder, **hijau** = benar.
- Tanpa blur shadow. Kedalaman hanya dari sisi bawah solid.
- Fokus keyboard: ring navy 4 px + offset 4 px di luar sisi bawah.

## 8. Navigasi dan alur anak

```text
Splash (memuat nyata) → Beranda: grid semua 9 game (1/2/3 kolom, tanpa overlay audio) + tombol Gabung Ruang
→ Intro v4: 5/6 kolom kiri tanpa kartu (pratinjau animasi per game `GamePreview` + judul + `?` pendamping, langsung di kanvas dunia)
           + 6/11 satu panel putih lega ("Siapa yang main?" 1/2 anak + slot profil → "Pilih level" → ▶ Mulai 80px);
           "Main di mana?" hanya tampil bila flag 2 Perangkat menyala; HP landscape pendek: pratinjau jadi ikon statis, panel scroll dengan Mulai menempel di bawah
→ Arena (Solo / Bergiliran / Layar dibagi + RaceBar vertikal / 2 perangkat via RoomLobby cek siap → 3-2-1 → OnlinePlay + banner putus/sambung)
→ Hasil v2 (bintang, skor, chip positif, podium serentak identik untuk online, stiker)
→ ▶ Main lagi (rematch di ruang yang sama untuk online) | 🏆 Peringkat | 🏠 Beranda | saran game (compact)
```

- Kedalaman maksimal **2 ketukan** dari Beranda ke bermain (Kartu game → ▶). Level default Mudah, pemain default 1, jadi ▶ bisa langsung diketuk. URL lama `/dunia/:worldId` diarahkan ke `/home`.
- Bahasa dipilih sekali di awal (dialog bergambar: bendera Merah-Putih / bola dunia), lalu dapat diubah di Pengaturan pendamping.
- Tombol **kembali** dari arena memunculkan dialog "Keluar?" dengan dua balok besar (✔ hijau / ↩ biru) bergambar. Tidak ada teks panjang.
- Instruksi diputar otomatis **sekali** saat ronde pertama dimulai (setelah ada gesture). Setelah itu anak bisa mengetuk gelembung untuk mengulang.
- Jika anak diam 8 detik, teman penjaga memberi **satu** petunjuk visual (tangan menunjuk). Bila soal punya klip item, klip diputar ulang. Tidak ada hitung mundur dan tidak ada kekalahan karena waktu.
- **Mode 2 anak**: bergiliran di perangkat yang sama. `TurnBanner` muncul 1 detik ("Giliran 🐰 Kelinci!"), soal setara, dan hasil ditampilkan sebagai dua stiker. Tidak ada label kalah.
- **Gerbang pendamping**: Pengaturan (bahasa, suara, musik, layar penuh, info "Untuk Pendamping") hanya terbuka lewat `GrownUpGate`.

## 9. Motion

### 9.1 Teknologi

- **Motion** (`motion/react`) dengan `LazyMotion` + `domAnimation` (sudah terpasang). Dipakai untuk press/spring, enter/exit, layout terbang (tile → slot memakai `layoutId`), serta stagger kecil.
- **CSS Modules**: transisi state sederhana (warna, sisi bawah) dan keyframe dekorasi yang sangat ringan.
- **GSAP**: tidak dipasang di baseline. Boleh diusulkan hanya untuk timeline karakter multi-langkah yang terbukti tidak bisa ditangani Motion, dengan catatan ukuran bundle dan lazy-load per game.
- **Tailwind**: tidak dipakai.
- Satu properti hanya boleh dikendalikan satu sistem: Motion **atau** CSS, tidak keduanya.

### 9.2 Token motion

```css
--ease-out-soft: cubic-bezier(0.22, 1, 0.36, 1);
--dur-tap: 90ms;   --dur-fast: 180ms;   --dur-base: 260ms;   --dur-celebrate: 600ms;
/* Motion springs (JS) */
springPress  = { type: 'spring', stiffness: 700, damping: 30 }
springBouncy = { type: 'spring', stiffness: 420, damping: 16, mass: 0.8 } // overshoot ≈ 6–8 %
springGentle = { type: 'spring', stiffness: 260, damping: 24 }
/* Masuk daftar/kartu (src/design/motion.ts) */
STAGGER_S = 0.04   ENTER = { opacity: 0, y: 12 }
enterProps(calm, index) // calm: tanpa initial, durasi 0; selain itu springGentle, delay = min(index, 9) × STAGGER_S
```

### 9.3 Katalog gerak

| Pemicu | Gerak | Batas | Reduced motion |
| --- | --- | --- | --- |
| Tekan balok/tombol | scale 0.96 + turun 4 px (sisi bawah menipis) | ≤ 90 ms, respons instan | Warna/sisi bawah saja |
| Lepas | `springBouncy` kembali ke 1 | 1 pantulan, ≤ 300 ms | Langsung |
| Masuk layar | fade + naik 16 px, stagger 40 ms antar pilihan (maks 4) | ≤ 300 ms total; kontrol sudah bisa diketuk sejak frame pertama | Muncul langsung |
| Tile → slot | terbang via `layoutId`, `springGentle` | ≤ 400 ms; input lain dikunci selama terbang | Pindah langsung |
| Benar | slot pop 1 → 1.12 → 1 + warna hijau + ✓ + SFX `correct`; karakter melompat sekali | ≤ 600 ms | Hijau + ✓ statis |
| Coba lagi | tile kembali ke tempat asal dengan goyang lembut ±4° ×2; karakter berekspresi "berpikir"; slot berdenyut sekali | ≤ 400 ms, **tanpa** shake horizontal keras | Kembali langsung + garis coral |
| Petunjuk idle (8 detik) | tangan menunjuk bergerak 2× lalu berhenti | 1.2 s, lalu diam | Tangan statis |
| Pindah giliran | banner geser masuk/keluar | 250 ms + tampil 1 s | Banner statis |
| Hasil: perayaan | konfeti 12 kepingan (`Confetti`, warna `--sun-400`, `--pink-500`, `--blue-500`, `--green-400`) dari satu titik di atas maskot + skor naik 0 → nilai (≈ 0.9 s, `useCountUp`) | sekali saat Hasil pertama tampil (bukan saat kembali dari Peringkat), ≤ 1.2 s | Tanpa konfeti, skor langsung akhir |
| Hasil / stiker | stiker membalik (rotateY) + 8–12 partikel bintang kecil di sekitar stiker, bukan layar penuh | ≤ 1.2 s, sekali | Stiker langsung terbuka |
| Transisi rute / ronde | rute fade 180 ms (tanpa lompatan vertikal); ronde geser horizontal 24 px | ≤ 260 ms | 0 ms (tanpa gerak) |

### 9.3a Pembaruan UI & motion (2026-11-26)

- **Intro v5:** kolom kiri (`hero`) sejajar tengah dengan panel setup. `GamePreview` setinggi `clamp(180px, 30vh, 240px)`, bertumpu pada `.halo` (lingkaran radial putih 55 % → transparan), bukan garis tanah. Glyph pratinjau tracing digambar dengan `smoothPath` (kurva `Q` halus). Pratinjau hitung menganimasikan satu `m.div` per benda (apel + badge), maksimal 8 simpul, jauh di bawah batas 12.
- **Hasil:** dibungkus `Scene` dunia permainan. Maskot `happy`; `wow` hanya untuk rekor pribadi (`resultMood`). Stiker jenis karakter menampilkan karakter dunia (`WorldCharacter`), bukan `★`.
- **`PageBackdrop`:** latar bersama Beranda, Pemain, Peringkat, Stiker: gradien `--sky-100` → `--sky-50`, tiga awan statis, pita bukit di bawah (≤ 18vh). Dekoratif, `aria-hidden`, tanpa animasi.
- **Beranda:** tombol Stiker, Peringkat, Pemain, Pengaturan memakai teks pendek di lebar ≥ 1024 px; di bawahnya tetap ikon dengan `aria-label`. Kartu masuk dengan `enterProps`, terangkat 4 px saat hover hanya di perangkat `(hover: hover)`.
- **Empty state:** `EmptyState` (Ms Ziya `happy` 96 px + pesan + tombol opsional) untuk Pemain dan Peringkat. Buku Stiker menampilkan bar progres per dunia (`role="progressbar"`).
- **Arena:** tinggi viewport ≥ 700 px dan bukan layar dibagi: ubin jawaban `clamp(96px, 14vh, 128px)`, kartu soal `max-width: min(880px, 70vw)`. Pane layar dibagi (`[data-pane]`) tidak berubah.
- **Prompt putar layar:** fokus pindah ke tombol "Main bergantian saja", pane `inert`, hitung mundur dan last-call berhenti; waktu jeda dikembalikan ke tenggat (`EXTEND_LAST_CALL`).

### 9.4 Aturan anti-overstimulasi

- **Tidak ada loop idle** pada karakter, latar, atau tombol. Kedip mata karakter diperbolehkan maksimal tiap 6–8 detik, dan dimatikan bila reduced motion aktif.
- Maksimal **satu** rangkaian animasi perayaan aktif pada satu waktu. Ketukan cepat tidak boleh menumpuk animasi atau suara.
- Tidak ada flash > 3× per detik, parallax, zoom kamera, guncangan layar, atau konfeti layar penuh.
- Animasi tidak boleh menunda evaluasi jawaban. Logika berjalan dulu, animasi hanya menyajikan hasilnya.
- Pointer tracing digambar langsung di Canvas (rAF) tanpa smoothing spring.
- Semua animasi dibatalkan saat unmount/navigasi. Dekorasi berhenti saat `document.hidden`.
- `prefers-reduced-motion` dan toggle "Gerak minimal" di Pengaturan pendamping memakai satu hook (`useCalmMotion`) yang dibaca semua komponen.

## 10. Audio

Keputusan 2026-11-25: **tanpa voice-over narasi/instruksi.** Spesifikasi lengkap ada di [specs/audio.md](specs/audio.md). Ringkasnya:

- **Musik + suara alam per adegan** (default nyala, gain 0.35/0.25) supaya aplikasi tidak sepi. Dunia Hijaiyyah memakai musik tanpa perkusi, dengan opsi "hanya suara alam".
- **SFX dan suara pengantar anak-anak:** tap/benar/coba lagi, plus sorak "yay", tawa, dan tepuk tangan anak pada momen tertentu saja (ronde terakhir, hasil, ketuk karakter).
- **Klip item pendek** (angka, nama huruf, kata, hijaiyyah) hanya untuk game yang mekaniknya butuh mendengar. Hijaiyyah wajib rekaman manusia yang direview.
- Audio dimulai setelah gesture pertama (▶ di Splash). Speech memakai satu kanal dan membuat musik ducking ke 40%. Maksimal 3 SFX bersamaan. Semua audio berhenti saat tab disembunyikan.
- SFX salah berupa nada lembut menurun, tanpa buzzer atau sirene. Mute global berada di kanan atas, toggle musik di Pengaturan pendamping. Semua preferensi disimpan.

## 11. Aksesibilitas dan inklusi

- Semua kontrol punya nama aksesibel (ID/EN). Ikon-only button wajib `aria-label`.
- Navigasi keyboard penuh untuk pendamping/aksesibilitas. Game pilihan bisa dimainkan dengan Tab + Enter. Tracing dan maze menyediakan alternatif (maze: tombol panah besar). Keterbatasan tracing dijelaskan di panel pendamping.
- Benar/salah tidak hanya ditandai warna (ada ikon ✓/↺ + SFX + bentuk).
- Kontras token sudah diverifikasi (§3.1). Setiap pasangan baru wajib diukur sebelum dipakai.
- Zoom 200% tidak boleh memotong tombol utama.

## 12. Checklist QA desain

- [ ] Semua target sentuh sesuai §6.1 diukur via bounding box di 360×800, 768×1024, 1024×768, 1280×800.
- [ ] Alur Beranda → main ≤ 3 ketukan, dan dapat dilakukan tanpa membaca (uji: anak tidak dibacakan apa pun, hanya melihat demo tangan).
- [ ] Reduced motion: semua tugas tetap bisa diselesaikan dan tidak ada animasi > 0 ms selain fade.
- [ ] Tidak ada loop idle, tumpukan suara, atau animasi yang mengunci input > 400 ms.
- [ ] Label EN terpanjang dan teks Arab tidak terpotong.
- [ ] Tidak ada emoji, angka dummy, atau aset tanpa catatan lisensi di UI anak.
- [ ] Observasi 3–5 anak 4–6 tahun: bisa memilih dunia, memulai, mengerti "coba lagi", dan menyelesaikan satu sesi.

## 13. Admin (CMS)

Area `/admin/*` ditujukan untuk orang dewasa pengelola konten, **bukan** dunia anak. Aturan target sentuh anak (§6.1), dunia, musik, dan motion bouncy tidak berlaku di sini. Spesifikasi fungsional ada di [specs/cms](specs/cms.md).

- **Gaya:** kanvas `--sky-50`, kartu `--white` (radius 20 px), teks navy Nunito 16 px, judul Fredoka 24–28 px. Tombol memakai `BlockButton` dengan sisi bawah 3 px dan tinggi 44 px. Pakai token yang sama; jangan menambah hex baru.
- **Login `/admin/login`:** satu kartu di tengah (lebar 360–400 px) berisi logo kecil, judul "Masuk Admin", field Username, field Password (dengan tombol tampil/sembunyi), tombol **Masuk** lebar penuh, dan area pesan error (`role="alert"`, warna teks navy dengan garis kiri coral). **Tidak ada elemen lain**: tanpa tautan daftar, lupa password, atau ilustrasi anak.
- **Layout:** sidebar 240 px (Dasbor, Objek, Kata, Hijaiyyah, Suara, Terbitkan) + header (username + Keluar). Di bawah 900 px, sidebar menjadi menu atas.
- **Pratinjau:** gambar objek ditampilkan di atas keempat latar dunia agar admin melihat hasilnya seperti di mata anak. Audio memakai pemutar dengan durasi.
- **Status:** badge teks + ikon, tidak hanya warna. Contoh: "Belum ada suara", "Menunggu review", "Sudah direview ✓", "Belum diterbitkan".
- **Motion:** hanya transisi 150 ms untuk state tombol/dialog. Tanpa spring atau animasi dekoratif.

