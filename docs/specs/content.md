# Spesifikasi Konten Belajar

- Versi: 1.0 — 2026-11-25
- Pemilik: produk/konten. Dipakai oleh [plan v2](../plan/2026-11-25-paud-redesign-plan.md), [game-specs](game-specs.md), [audio](audio.md), dan [assets-brief](assets-brief.md).
- Aturan: dokumen ini mendefinisikan **konten bawaan** (dibundel di app dan menjadi seed database CMS). Setelah CMS aktif, admin dapat menambah/mengubah/menonaktifkan objek, kata, dan media lewat CMS tanpa mengubah dokumen atau kode ([cms](cms.md)). Yang tetap hanya bisa diubah lewat kode + dokumen ini: daftar 28 hijaiyyah dan keluarganya, himpunan huruf/angka per level, data glyph, dan stiker.

## 1. Konvensi ID

| Jenis | Format | Contoh | Catatan |
| --- | --- | --- | --- |
| `GameId` | kebab-case Indonesia (stabil, dipakai di URL) | `bunyi-awal` | Jangan diganti; URL lama harus tetap valid |
| `WorldId` | `angka` \| `huruf` \| `hijaiyyah` \| `memori` | `huruf` | Sama dengan ID kategori lama |
| `ObjectId` | kebab-case Inggris | `ice-cream` | Gambar netral bahasa, dipakai lintas locale |
| `StickerId` | `<worldId>-<nn>` | `angka-01` | 9 per dunia, nomor 01–09 |
| `HijaiyyahId` | transliterasi latin | `tsa` | Lihat §5 |
| Kata | huruf kapital tanpa spasi | `RUMAH` | Ditampilkan sebagai balok kapital |

## 2. Daftar objek ilustrasi (`ObjectId`)

Semua objek berupa SVG flat (lihat [assets-brief](assets-brief.md) §4). Kolom "Dipakai" menunjukkan game yang memakai objek tersebut.

| ObjectId | ID | EN | Dipakai |
| --- | --- | --- | --- |
| apple | apel | apple | G01, G04, G03-EN, G09, stiker |
| orange | jeruk | orange | G01, G04-ID, G09, stiker |
| ball | bola | ball | G01, G03, G04, stiker |
| star | bintang | star | G01, G03-EN, stiker |
| flower | bunga | flower | G01, stiker |
| carrot | wortel | carrot | G01, G04-ID, G09, stiker |
| fish | ikan | fish | G01, G03, G04, G08 |
| duck | bebek | duck | G01, G03, G04-EN, G08 |
| cake | kue | cake | G01, G03, G09, stiker |
| gecko | cicak | gecko | G04-ID |
| sheep | domba | sheep | G04-ID, G08 |
| bucket | ember | bucket | G04-ID |
| elephant | gajah | elephant | G04-ID, G08 |
| tiger | harimau | tiger | G04-ID, G08 |
| cat | kucing | cat | G03-EN, G04, G08 |
| lamp | lampu | lamp | G04-ID |
| car | mobil | car | G04-ID |
| pineapple | nanas | pineapple | G04-ID, G09 |
| umbrella | payung | umbrella | G04, stiker |
| house | rumah | house | G03, G04-ID, stiker |
| cow | sapi | cow | G03-ID, G04-ID, G08 |
| hat | topi | hat | G03, G04 |
| snake | ular | snake | G03-EN, G04-ID |
| zebra | zebra | zebra | G03-EN, G04 |
| egg | telur | egg | G03, G04-EN |
| goat | kambing | goat | G04-EN, G08 |
| juice | jus | juice | G03-ID, G04-EN |
| kite | layang-layang | kite | G04-EN, stiker |
| lion | singa | lion | G03-ID, G04-EN, G08 |
| moon | bulan | moon | G03, G04-EN, stiker |
| nest | sarang | nest | G04-EN |
| octopus | gurita | octopus | G04-EN, stiker |
| pencil | pensil | pencil | G04-EN |
| rabbit | kelinci | rabbit | G04-EN, G08, stiker |
| sun | matahari | sun | G03-EN, G04-EN, stiker |
| tree | pohon | tree | G03-EN, G04-EN |
| van | mobil van | van | G04-EN |
| whale | paus | whale | G04-EN, G08, stiker |
| bus | bus | bus | G03 |
| fire | api unggun | campfire | G03-ID |
| bag | tas | bag | G03-ID |
| tire | ban | tire | G03-ID |
| book | buku | book | G03, stiker |
| milk | susu | milk | G03-ID |
| foot | kaki | foot | G03-ID |
| eye | mata | eye | G03-ID |
| table | meja | table | G03-ID |
| shirt | baju | shirt | G03-ID |
| ant | semut | ant | G03-ID |
| frog | katak | frog | G03, G08 |
| cup | cangkir | cup | G03-EN |
| shoe | sepatu | shoe | G03-EN |
| horse | kuda | horse | G03-EN |
| chair | kursi | chair | G03-EN |
| bread | roti | bread | G03-EN |
| train | kereta | train | G03-EN, stiker |
| clock | jam | clock | G03-EN |
| truck | truk | truck | G03-EN |
| lantern | lentera | lantern | stiker |
| mosque | masjid | mosque | stiker |
| camel | unta | camel | stiker |
| dates | kurma | dates | stiker |
| owl | burung hantu | owl | stiker |
| firefly | kunang-kunang | firefly | stiker |
| palm-tree | pohon kurma | palm tree | stiker |
| shell | kerang | shell | stiker |
| starfish | bintang laut | starfish | stiker |
| crab | kepiting | crab | stiker |
| sandcastle | istana pasir | sandcastle | stiker |
| boat | perahu | boat | stiker |
| coconut | kelapa | coconut | stiker |

Larangan konten: babi, anjing (sensitif bagi sebagian keluarga Muslim), senjata, makanan berlabel merek, dan mushaf Al-Qur'an sebagai objek mainan/stiker.

## 3. Konten angka

| Game | Mudah | Sedang | Menantang |
| --- | --- | --- | --- |
| G01 Ayo Berhitung — jumlah benda | 1–5 | 1–10 | 6–20 |
| G01 — benda yang dihitung (acak dari) | apple, orange, ball, star | apple, orange, ball, star, flower, carrot | semua 9 objek G01 |
| G02 Menulis Angka — angka | 1–5 | 0–9 | 0–9 (tanpa panah arah) |

## 4. Konten huruf Latin

### 4.1 G05 Menulis Huruf

| Level | Himpunan huruf | Bentuk |
| --- | --- | --- |
| Mudah | E F H I L T A K M N V W X Y Z | Kapital, goresan lurus |
| Sedang | B C D G J O P Q R S U | Kapital, ada lengkung |
| Menantang | a–z (26) | Kecil, `a` dan `g` bentuk satu tingkat (ɑ, ɡ) |

### 4.2 G04 Bunyi Awal

Kata ditampilkan kapital. Huruf awal adalah jawaban.

**Bahasa Indonesia (20 kata):**

| Kata | ObjectId | Kata | ObjectId |
| --- | --- | --- | --- |
| APEL | apple | LAMPU | lamp |
| BOLA | ball | MOBIL | car |
| CICAK | gecko | NANAS | pineapple |
| DOMBA | sheep | PAYUNG | umbrella |
| EMBER | bucket | RUMAH | house |
| GAJAH | elephant | SAPI | cow |
| HARIMAU | tiger | TOPI | hat |
| IKAN | fish | ULAR | snake |
| JERUK | orange | WORTEL | carrot |
| KUCING | cat | ZEBRA | zebra |

**English (22 kata):**

| Kata | ObjectId | Kata | ObjectId |
| --- | --- | --- | --- |
| APPLE | apple | MOON | moon |
| BALL | ball | NEST | nest |
| CAT | cat | OCTOPUS | octopus |
| DUCK | duck | PENCIL | pencil |
| EGG | egg | RABBIT | rabbit |
| FISH | fish | SUN | sun |
| GOAT | goat | TREE | tree |
| HAT | hat | UMBRELLA | umbrella |
| JUICE | juice | VAN | van |
| KITE | kite | WHALE | whale |
| LION | lion | ZEBRA | zebra |

**Pasangan huruf mirip** (`CONFUSABLE_GROUPS`): `[B,D,P]`, `[M,N,W]`, `[I,J,L]`, `[C,G,O]`, `[U,V]`, `[E,F]`.

### 4.3 G03 Susun Kata

| Level | ID | EN |
| --- | --- | --- |
| Mudah (3 huruf) | KUE cake · BUS bus · API fire · TAS bag · JUS juice · BAN tire | CAT cat · SUN sun · BUS bus · EGG egg · CUP cup · HAT hat |
| Sedang (4 huruf) | BOLA ball · BUKU book · IKAN fish · SUSU milk · TOPI hat · KAKI foot · MATA eye · SAPI cow · MEJA table · BAJU shirt | BALL ball · FISH fish · CAKE cake · BOOK book · DUCK duck · MOON moon · TREE tree · FROG frog · STAR star · SHOE shoe |
| Menantang (5 huruf) | RUMAH house · BEBEK duck · BULAN moon · SEMUT ant · TELUR egg · SINGA lion · KATAK frog | APPLE apple · HOUSE house · SNAKE snake · HORSE horse · CHAIR chair · BREAD bread · TRAIN train · CLOCK clock · ZEBRA zebra · TRUCK truck |

## 5. Konten hijaiyyah

| # | Huruf | HijaiyyahId | Nama (ID) | Keluarga bentuk | Grup tracing G07 |
| --- | --- | --- | --- | --- | --- |
| 1 | ا | alif | Alif | alif | Mudah |
| 2 | ب | ba | Ba | ba | Sedang |
| 3 | ت | ta | Ta | ba | Sedang |
| 4 | ث | tsa | Tsa | ba | Sedang |
| 5 | ج | jim | Jim | jim | Menantang |
| 6 | ح | hha | Ḥa | jim | Menantang |
| 7 | خ | kha | Kha | jim | Menantang |
| 8 | د | dal | Dal | dal | Mudah |
| 9 | ذ | dzal | Dzal | dal | Sedang |
| 10 | ر | ra | Ra | ra | Mudah |
| 11 | ز | zai | Zai | ra | Sedang |
| 12 | س | sin | Sin | sin | Menantang |
| 13 | ش | syin | Syin | sin | Menantang |
| 14 | ص | shad | Shad | shad | Menantang |
| 15 | ض | dhad | Dhad | shad | Menantang |
| 16 | ط | tha | Tha | tha | Menantang |
| 17 | ظ | zha | Zha | tha | Menantang |
| 18 | ع | ain | 'Ain | ain | Menantang |
| 19 | غ | ghain | Ghain | ain | Menantang |
| 20 | ف | fa | Fa | fa | Sedang |
| 21 | ق | qaf | Qaf | fa | Sedang |
| 22 | ك | kaf | Kaf | kaf | Menantang |
| 23 | ل | lam | Lam | lam | Mudah |
| 24 | م | mim | Mim | mim | Mudah |
| 25 | ن | nun | Nun | ba | Sedang |
| 26 | و | waw | Waw | waw | Mudah |
| 27 | ه | haa | Ha | haa | Menantang |
| 28 | ي | ya | Ya | ba | Sedang |

Jumlah: Mudah 6, Sedang 9, Menantang 13. Total 28.

**G06 Dengar & Temukan — pool target:**
- Mudah: `alif, ba, jim, dal, ra, sin, ain, fa, mim, waw` (bentuk sangat berbeda).
- Sedang dan Menantang: semua 28 huruf.

Huruf ditampilkan dalam **bentuk tunggal (isolated)**. Nama huruf hanya dipakai di panel pendamping. Anak tidak diminta membaca nama latin.

> Wajib review: bunyi dan urutan goresan ditinjau ustadz/ustadzah atau guru TPA. Status review disimpan di CMS (`hijaiyyah.audio_reviewed`, `trace_reviewed`, `reviewer`), **bukan** di kode. Bila CMS tidak tersedia, semua hijaiyyah dianggap belum direview dan G06/G07 tidak bisa dimainkan di production. Ringkasan review juga dicatat di §8.

## 6. Data jalur tulis (tracing)

Disimpan di `project/src/content/glyphs/{digits,latin-upper,latin-lower,hijaiyyah}.ts` dengan format berikut:

```ts
export interface GlyphStroke {
  /** Titik polyline dalam kotak logis 100×100 (x kanan, y bawah), berurutan sesuai arah tulis. */
  readonly points: readonly (readonly [number, number])[];
  /** true = titik/dot (diselesaikan dengan satu ketukan), points berisi tepat 1 titik. */
  readonly dot?: boolean;
}
export interface Glyph {
  readonly id: string;            // '7', 'A', 'a', 'ba'
  readonly strokes: readonly GlyphStroke[]; // urutan = urutan goresan
}
```

Aturan penulisan data:
- Glyph ditulis di area 10–90 (margin 10) agar tidak terpotong.
- Kurva ditulis sebagai polyline dengan jarak antar titik ≤ 6 unit. Engine akan me-resample ke jarak 2 unit.
- Huruf Latin mengikuti urutan goresan standar sekolah dasar Indonesia: dari atas ke bawah, kiri ke kanan.
- Hijaiyyah ditulis kanan → kiri. Titik (nuqthah) adalah goresan `dot: true` terakhir, dari kanan ke kiri.

Contoh wajib (dipakai juga sebagai fixture tes):

```ts
// A: kaki kiri, kaki kanan, palang
{ id: 'A', strokes: [
  { points: [[50,12],[22,88]] },
  { points: [[50,12],[78,88]] },
  { points: [[33,62],[67,62]] },
]}
// 1
{ id: '1', strokes: [ { points: [[38,26],[52,12],[52,88]] } ] }
// ب (ba): badan dari kanan ke kiri, lalu titik di bawah
{ id: 'ba', strokes: [
  { points: [[86,46],[84,58],[76,64],[50,66],[24,64],[16,58],[14,48]] },
  { points: [[50,80]], dot: true },
]}
```

## 7. Kartu, labirin, dan stiker

**G08 Kartu Kembar** memakai pool wajah kartu `cat, duck, fish, lion, rabbit, elephant, cow, frog, whale, sheep, tiger, goat`.

| Level | Pasang | Grid (landscape) | Grid (portrait) |
| --- | --- | --- | --- |
| Mudah | 3 | 3×2 | 2×3 |
| Sedang | 4 | 4×2 | 2×4 |
| Menantang | 6 | 4×3 | 3×4 |

**G09 Labirin** memakai tujuan acak dari `apple, cake, carrot, orange, pineapple`.

| Level | Grid | Jumlah labirin per sesi |
| --- | --- | --- |
| Mudah | 4×4 | 2 |
| Sedang | 6×6 | 2 |
| Menantang | 8×8 | 3 |

**Stiker (36):**

| Dunia | 01 | 02 | 03 | 04 | 05 | 06 | 07 | 08 | 09 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| angka | jeje | star | apple | orange | ball | flower | carrot | fish | duck |
| huruf | pipi | house | kite | umbrella | cake | book | rabbit | sun | train |
| hijaiyyah | lulu | moon | lantern | mosque | camel | dates | owl | firefly | palm-tree |
| memori | kuku | whale | octopus | shell | starfish | crab | sandcastle | boat | coconut |

**Aturan pemberian stiker:**
1. Setiap pemain yang menyelesaikan sesi mendapat 1 stiker dari dunia game tersebut.
2. Stiker yang diberikan adalah nomor terkecil yang belum dimiliki.
3. Jika semua 9 stiker dunia sudah dimiliki, tampilkan stiker acak dari dunia itu (berdasarkan seed) dengan label "Lagi!" tanpa menambah koleksi.
4. Pada mode 2 anak, pemain 1 diproses dulu, lalu pemain 2.

## 8. Log review konten

| Tanggal | Peninjau | Cakupan | Hasil |
| --- | --- | --- | --- |
| — | — | Hijaiyyah (nama, bunyi, urutan goresan) | Belum direview |
