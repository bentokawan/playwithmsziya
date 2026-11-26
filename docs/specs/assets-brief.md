# Brief Aset Visual

- Versi: 1.0 — 2026-11-25
- Gaya visual: [design §5](../design.md#5-dunia-karakter-dan-ilustrasi). Konten objek: [content §2](content.md#2-daftar-objek-ilustrasi-objectid).
- Penggantian tanpa kode: gambar **objek** (§4) dapat diunggah/diganti admin lewat CMS (`/admin/objek`, [cms](cms.md)). Latar dunia, karakter, ikon, dan logo tetap berupa komponen kode.
- Produksi: **AI pelaksana membuat versi v0** sebagai SVG tulisan tangan (kode) sesuai brief ini. Ilustrator manusia boleh mengganti file secara 1:1 dengan nama, viewBox, dan API komponen yang sama.
- Larangan: men-trace atau menyalin gambar referensi pengguna, aset kidsfromhome.com, atau karakter waralaba mana pun.

## 1. Aturan umum SVG

- Warna hanya dari palet design §3. Hex boleh ditulis langsung di file SVG/komponen ilustrasi (pengecualian aturan "tanpa hex" untuk folder `worlds/` dan `assets/illustrations/`).
- Tanpa `stroke` hitam, tanpa gradien, tanpa filter blur. Bayangan berupa satu bidang lebih gelap (`opacity` tidak dipakai untuk bayangan).
- Sudut membulat: `stroke-linejoin="round"` dan `stroke-linecap="round"` untuk detail garis (mulut, kaki) dengan warna navy `#1B2559`.
- Wajah karakter: mata = lingkaran navy r≈4% lebar karakter; senyum = path busur navy; pipi = lingkaran pink `#FFC2DC`.
- Ukuran file: objek ≤ 4 kB, karakter (semua mood) ≤ 12 kB, latar dunia ≤ 20 kB (sebelum gzip).
- Aksesibilitas: ilustrasi dekoratif diberi `aria-hidden="true"`. Ilustrasi yang menjadi soal diberi `role="img"` + `alt`/`aria-label` dari nama objek di konten (`content.objects.get(id).name[locale]`).

## 2. Latar dunia (`project/src/worlds/<worldId>/Background.tsx`)

**API:** `export function Background({ variant }: { variant: 'home-door' | 'scene' }): JSX.Element`.
- `scene`: layar penuh, `position: absolute; inset: 0`.
- `home-door`: crop tengah untuk kartu pintu.

**Komposisi:** viewBox `0 0 1600 1000`, `preserveAspectRatio="xMidYMax slice"`.
- Layer 1: langit penuh.
- Layer 2: bukit jauh, gelombang dengan puncak di y≈620.
- Layer 3: bukit dekat/tanah, puncak di y≈760.
- Layer 4: dekor kecil.

**Zona aman:** area tengah x 200–1400, y 120–700 harus polos (tanpa dekor) karena di situ arena berada.

| worldId | Langit | Bukit jauh | Tanah | Dekor (maks 6 objek kecil) |
| --- | --- | --- | --- | --- |
| angka | `#CDEFFF` | `#9FE0C4` | `#3DBE7A` + `#2FA866` | 2 awan putih, 3 bunga putih-kuning, 1 pohon bulat |
| huruf | `#FFF0F6` | `#FFC2DC` | `#F48FB8` + `#E8769F` | 3 awan biru `#7FD3FF`, 2 permen lolipop |
| hijaiyyah | `#DCE6FF` | `#A9B8F5` | `#6C7FD8` + `#5A6CC4` | bulan sabit `#FFE29A`, 4 bintang kecil, 2 lentera |
| memori | `#FFF3DD` | `#7FD3FF` (laut) | `#F2B36F` + `#E3A15A` (pasir) | 2 kerang, 1 pohon kelapa, ombak putih |

## 3. Karakter (`project/src/worlds/characters/<Name>.tsx`)

**API:**

```ts
interface CharacterProps {
  mood: 'happy' | 'thinking' | 'wow';
  size: number;
  className?: string;
}
```

Ekspresi tiap mood:
- `happy`: senyum.
- `thinking`: mata melirik ke atas + mulut datar kecil.
- `wow`: mulut "o" + alis naik.

Komponen **tidak** menganimasikan dirinya sendiri. Animasi diatur oleh pemanggil melalui Motion.

| Komponen | Deskripsi | viewBox | Area pegangan pilihan |
| --- | --- | --- | --- |
| `MsZiya` | Guru muda ramah berhijab, warna pink `#E8458B` + biru `#0A8FD6`, setengah badan, melambai | `0 0 240 300` | — |
| `Jeje` | Jerapah biru `#0A8FD6` dengan bintik `#7FD3FF`, leher panjang tegak, tangan kecil | `0 0 220 420` | Kolom vertikal di leher: x 70–150, y 60–330 |
| `Pipi` | Awan pink `#FFC2DC` gemuk dengan wajah, melayang | `0 0 360 220` | Baris di bawah awan, balok "menggantung" pada benang |
| `Lulu` | Lentera bulat kuning `#FFE29A` bertopi bulan sabit, berkilau lembut | `0 0 220 280` | Lentera-lentera kecil di kiri/kanan (diatur pemanggil) |
| `Kuku` | Kura-kura hijau `#3DBE7A`, tempurung biru `#0A8FD6` berpetak | `0 0 300 220` | — (memori/maze) |

Ms Ziya harus dibuat ulang sebagai SVG yang terinspirasi dari `project/src/assets/mascot-ziya.png` (warna dan kesan), bukan hasil trace otomatis.

## 4. Objek (`project/src/assets/illustrations/objects/<ObjectId>.svg`)

- Gambar dari CMS boleh berformat SVG/PNG/WebP (aturan [cms §5](cms.md#5-path-storage--aturan-file)). Versi bawaan selalu SVG.
- viewBox `0 0 120 120`. Objek mengisi area 12–108 dan berdiri pada "lantai" y≈104 dengan bayangan elips netral `#1B2559` dengan `fill-opacity="0.12"` (satu-satunya pengecualian aturan opacity, agar objek cocok di semua dunia).
- Satu objek, menghadap depan atau tiga perempat. Bentuk harus dikenali anak 4 tahun (siluet khas: apel dengan daun, kucing dengan telinga segitiga, dan seterusnya).
- Daftar lengkap ada di content §2 (±72 file).
- Loader: `project/src/assets/illustrations/objects/index.ts` memakai `import.meta.glob('./*.svg', { eager: true, query: '?url', import: 'default' })` → `Record<ObjectId, string>`. Tes memastikan setiap ObjectId di content punya file.

## 5. Stiker

Stiker tidak dibuat sebagai file terpisah. Komponen `Sticker({ stickerId, revealed })` me-render objek/karakter dengan:
- bingkai die-cut putih (outline putih 8 px lewat `paint-order: stroke`),
- latar lingkaran warna dunia,
- siluet `#C9D3E6` jika belum dimiliki.

## 6. Ikon UI (`project/src/components/icons/`)

Ikon berupa SVG inline 24×24, stroke 2.5, `currentColor`, round caps:
- `back`, `home`, `sound-on`, `sound-off`, `fullscreen-enter`, `fullscreen-exit`, `settings`, `play` (segitiga terisi), `replay`, `star`, `lock`, `check`, `arrow-up/down/left/right` (maze), `hand-point` (petunjuk), `listen` (telinga/gelombang).

## 7. Logo dan favicon

- Logo "Play with Ms Ziya": wordmark Fredoka Bold. Kata "Play" berada di balok biru, "Ms Ziya" di balok pink, dengan sisi bawah gelap. Disimpan sebagai `project/src/assets/logo.svg`.
- Favicon `project/public/favicon.svg`: balok pink huruf "Z" putih.

## 8. Pencatatan

Semua aset dicatat di `project/src/assets/ASSETS.md`:

| file | pembuat (AI v0 / nama ilustrator) | tanggal | lisensi | catatan |
| --- | --- | --- | --- | --- |
