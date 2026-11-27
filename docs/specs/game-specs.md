# Spesifikasi Game G01–G09

- Versi: 1.1 — 2026-11-27
- Kontrak kode: [plan v2 §3](../plan/2026-11-25-paud-redesign-plan.md#3-arsitektur-dan-kontrak-target). Konten: [content](content.md). Audio: [audio](audio.md). Visual/motion: [design](../design.md).

## 0. Aturan bersama (berlaku untuk semua game)

### 0.1 Ronde, anti-cheat 2 pemain, dan timer sesi

| | Mudah | Sedang | Menantang |
| --- | --- | --- | --- |
| Ronde per sesi (default) | 3 | 4 | 5 |
| Timer sesi (bila `timed: true` dan `prefs.timerOn`) | 60 s | 90 s | 120 s |

Pengecualian: G08 selalu 1 ronde (satu papan), dan G09 mengikuti content §7. Nilai ronde dan flag `timed` (`false` untuk G08/G09) ditulis di `catalog.ts`.

- `createRounds(config, content)` bersifat **murni dan deterministik**: hasilnya hanya bergantung pada `config.seed`, `difficulty`, `locale`, dan isi `content`. Pool item diambil dari `ResolvedContent` (CMS atau bawaan) dan hanya berisi item **layak** ([cms §7](cms.md#7-aturan-kelengkapan-dipakai-cms-dan-app-anak)). Gambar objek dirender lewat `ObjectImage`. Pakai `createRng(config.seed)` dari `lib/random`. **Jangan** memakai `Math.random()` di game.
- Item yang sama tidak muncul dua kali dalam satu sesi selama pool cukup.
- **Anti-cheat 2 pemain (`per-round`):** Pemain 2 mendapat ronde yang berbeda lewat `createPlayerRounds` dengan seed turunan deterministik `roundSeed(config.seed, 2)` (mencoba hingga 4 kandidat untuk meminimalkan tabrakan per indeks) di mode `layar` **dan** `giliran`. Game `in-game` (G08) tetap memakai papan bersama.
- **Timer sesi:** bersifat chess-clock di mode `giliran` (jam berjalan hanya saat giliran pemain aktif dan berhenti saat banner/tab tersembunyi), jam bersama di mode `layar` (memotong *last-call* 45 s bila habis lebih awal), dapat dimatikan lewat pengaturan pendamping `timerOn` (default nyala). Saat habis → SFX `time-up` + frasa `time-up`, overlay 1.2 s "Waktu habis!", ronde yang belum selesai bernilai 0. Online, G08, dan G09 tidak memakai timer sesi.

### 0.1.1 Ketersediaan mode per game (D4)

| Game | `solo` | `giliran` | `layar` (≥ 768 px) | `online` (2 perangkat) |
| --- | :---: | :---: | :---: | :---: |
| G01 Ayo Berhitung, G02 Menulis Angka, G03 Susun Kata, G04 Bunyi Awal, G05 Menulis Huruf, G06 Dengar & Temukan, G07 Menulis Hijaiyyah, G09 Labirin | ✓ | ✓ | ✓ | ✓ |
| G08 Kartu Kembar | ✓ | ✓ (papan bersama `in-game`) | — | — |

### 0.2 Alur satu ronde (state machine standar game pilihan)

```text
intro ──(≤300ms masuk)──▶ waiting ──pilih──▶ evaluating ──benar──▶ celebrating ──(≤600ms)──▶ onComplete()
                              ▲                    │
                              └──── retry (≤400ms) ◀┘ salah
```

- `evaluating` berlangsung sinkron. Animasi hanya menyajikan hasilnya (design §9.4).
- Selama `evaluating`, `celebrating`, dan `retry`: input pilihan dikunci (`pointer-events: none` + `aria-disabled`). Navigasi (kembali/suara) **tidak** dikunci.
- `attempts` bertambah setiap kali ada jawaban yang dievaluasi. `firstTry = attempts === 1`.
- `onComplete` dipanggil **tepat sekali** per ronde. Gunakan guard ref (`completedRef`).

### 0.3 Feedback standar

| Event | Visual (design §9.3) | Audio |
| --- | --- | --- |
| Pilih jawaban | Evaluasi langsung (tanpa bunyi `select` tambahan) | `correct` atau `retry` (satu kejadian = satu suara) |
| Benar | Slot/objek pop + hijau + ✓ + teman penjaga `wow` | `correct` (+ ucapan item). Jika ronde terakhir: tambah `kids-yay` |
| Salah | Tile kembali + goyang lembut, teman penjaga `thinking`, garis coral | `retry` |
| Ketuk karakter | Karakter melompat kecil sekali | `kids-giggle` (throttle 3 detik) |

### 0.4 Petunjuk idle

- Timer diam (tanpa pointerdown di arena) 8 detik → petunjuk ke-1: animasi `HandHint` menunjuk ke **sumber soal** (gelembung/objek). Jika soal punya klip, klip diputar ulang.
- Diam 8 detik lagi → petunjuk ke-2, **hanya di Mudah**: pilihan benar diberi glow `--sun-400` statis selama 2 detik.
- Setelah itu tidak ada petunjuk lagi sampai anak berinteraksi. Timer di-reset setiap pointerdown.

### 0.5 Keyboard

Semua pilihan berupa `<button>`. Urutan Tab: gelembung soal → pilihan (kiri → kanan) → slot. Enter/Space = ketuk. Tracing tidak bisa dimainkan dengan keyboard (dijelaskan di panel pendamping). Maze mendukung tombol panah.

### 0.6 Layout arena (Arena v2)

```text
┌──────────────────────────────────────────────┐
│ TopNav (88px)                                │
│ ┌──────────────── .prompt (flex: 1) ───────┐ │
│ │          HintBubble / area kerja         │ │
│ │                                  [.buddy]│ │  ← disembunyikan di < 600 px
│ └──────────────────────────────────────────┘ │
│ ┌──────────────── .tray (rata tengah) ─────┐ │
│ │              [ A ]  [ B ]  [ C ]         │ │
│ └──────────────────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

CSS: `.arena` memakai `display: flex; flex-direction: column; gap: var(--space-5)`. `.prompt` memakai `flex: 1; position: relative` dan `.tray` menampilkan pilihan satu baris rata tengah di bawah. `.buddy` adalah dekorasi kecil di pojok kanan bawah `.prompt` (disembunyikan pada `@media (max-width: 599px)`), dan **dihapus** dari G01 & G02 agar area kerja lebih lapang.

---

## G01 — Ayo Berhitung (`ayo-berhitung`, dunia `angka`, engine `choice-round`)

**Tujuan belajar:** korespondensi satu-satu dan mengenal angka 1–20.

**Tipe ronde:**

```ts
interface CountRound {
  objectId: ObjectId;
  count: number;
  options: number[]; // tepat 3 opsi unik, berisi count, sudah diacak
}
```

**Pembuatan ronde:**
- `count` diambil acak dari rentang level (content §3).
- Opsi: **3** di semua level. Distraktor diambil dari `count±1`, `count±2` dalam rentang 1–20, tanpa duplikat.
- Tata letak benda memakai `countLayout(count)` per baris maksimal 5 (gaya ten-frame). Ukuran benda: 88 px (≤ 5), 72 px (≤ 10), atau 56 px (> 10).

**Interaksi:**
1. Benda tampil rapi dalam kartu putih (`.field`) dan bukan tombol. Tiga `Tile` angka di `.tray` selalu aktif sejak awal di semua level.
2. Ketuk angka benar → `correct` + `speak({kind:'num', key:val})`, semua benda mendapat badge angka 1..N sekaligus.
3. Ketuk angka salah → `retry` + frasa `count-together` (bila `!pane?.quiet`), lalu jalankan **hitung otomatis**: setiap 450 ms benda ke-i menyala (`scale` 1→1.12→1) + badge `i+1` + `count-pop` + `speak(i+1)`. **Baki tetap aktif** selama hitung otomatis (`retryLockMs: 0`): mengetuk angka menghentikan hitung otomatis dan langsung menilai jawaban baru; salah lagi mengulang hitung dari 1. Bila `calmMotion`, semua badge muncul sekaligus tanpa ucapan beruntun.

**Petunjuk idle ke-1 (8 detik):** menjalankan hitung otomatis yang sama satu kali per ronde.

**Tes wajib (`engines/choice-round` + `g01/rounds.test.ts`):**
- `countLayout` menyusun baris maksimal 5;
- tepat 3 opsi unik berisi jawaban di semua level (tanpa `positions`);
- seed sama menghasilkan ronde sama.

## G02 — Menulis Angka (`menulis-angka`, dunia `angka`, engine `tracing`)

Lihat **§T (Tracing bersama)** di bawah. Kumpulan angka tunggal saja (tanpa 2 digit): Mudah 1–5, Sedang 0–9, Menantang 0–9 tanpa panah arah. Tile model angka tampil di atas kanvas (ketuk = ucapkan). Angka diucapkan sekali saat ronde mulai dan sekali saat selesai (`speak({kind:'num', key})`).

## G03 — Susun Kata (`susun-kata`, dunia `huruf`, engine `choice-round` mode urutan)

**Tujuan belajar:** mengurutkan huruf menjadi kata (mengeja).

**Tipe ronde:**

```ts
interface SpellRound {
  word: string;
  objectId: ObjectId;
  tiles: { id: string; letter: string }[]; // diacak; id unik walau huruf kembar
  showGhost: boolean;
}
```

**Level:**

| Level | Kata | Tile | Ghost (huruf samar di slot) |
| --- | --- | --- | --- |
| Mudah | 3 huruf | Huruf kata saja | Ya |
| Sedang | 4 huruf | Huruf kata saja | Tidak |
| Menantang | 5 huruf | Huruf kata + 2 distraktor (huruf acak bukan anggota kata) | Tidak |

**Interaksi:**
1. Gelembung petunjuk berisi gambar objek. Ketuk gelembung → `speak word`.
2. Baris slot pink sejumlah huruf di `.prompt`, tile pilihan di `.tray`.
3. Ketuk tile salah → hanya `retry` (tanpa ucapan huruf).
4. Ketuk tile benar → `whoosh` + `speak letter`, tile muncul di **slot kosong paling kiri** dengan animasi pop (`scale 0.6→1, opacity 0→1`, `SPRING.gentle`; tanpa `layoutId`).
5. Huruf kembar (mis. SUSU): tile mana pun dengan huruf yang sama dianggap benar.
6. Slot terakhir benar → kata pop, `correct` + `speak word`.
7. Ketuk tile di slot (sebelum kata selesai) → tile kembali ke baki (`tap`).

`attempts` = jumlah penempatan salah + 1.

**Tes wajib:** tile tepat berisi huruf kata (+2 distraktor di Menantang), distraktor tidak sama dengan huruf kata, evaluasi huruf kembar.

## G04 — Bunyi Awal (`bunyi-awal`, dunia `huruf`, engine `choice-round`)

**Tujuan belajar:** mengenali bunyi/huruf awal kata.

**Tipe ronde:**

```ts
interface InitialRound {
  word: string;
  objectId: ObjectId;
  options: string[]; // huruf kapital, berisi word[0]
}
```

**Level:**

| Level | Opsi | Sisa kata | Distraktor |
| --- | --- | --- | --- |
| Mudah | 2 | Selalu ditampilkan (balok putih, huruf navy) | Tidak boleh satu grup `CONFUSABLE_GROUPS` dengan jawaban |
| Sedang | 3 | Selalu ditampilkan | Bebas (selain jawaban) |
| Menantang | 4 | Selalu ditampilkan | Minimal 1 dari grup confusable jawaban, bila ada |

Distraktor diambil dari huruf awal kata lain di daftar locale yang sama.

**Interaksi:**
1. Saat ronde mulai: `speak word` diputar otomatis sekali.
2. Ketuk gelembung → ulangi `speak word`.
3. Pilihan berada di `.tray`. Ketuk opsi → evaluasi langsung (hanya `correct` + `speak word` atau `retry`, tanpa `select`).

**Tes wajib:** jawaban selalu ada di opsi, aturan distraktor per level, tanpa `showRest`, kata diambil dari locale yang benar.

## G05 — Menulis Huruf (`menulis-huruf`, dunia `huruf`, engine `tracing`)

Lihat §T. Huruf dari content §4.1. Setelah selesai: `speak letter`.

## G06 — Dengar & Temukan Hijaiyyah (`dengar-temukan`, dunia `hijaiyyah`, engine `choice-round`)

**Tipe ronde:**

```ts
interface ListenRound {
  target: HijaiyyahId;
  options: HijaiyyahId[];
}
```

**Level:**

| Level | Pool target | Opsi | Distraktor |
| --- | --- | --- | --- |
| Mudah | 10 huruf (content §5) | 2 | Keluarga bentuk berbeda |
| Sedang | 28 | 3 | Bebas |
| Menantang | 28 | 4 | Minimal 1 dari keluarga bentuk yang sama, bila keluarga itu punya anggota lain |

**Interaksi:**
1. Satu-satunya pemicu suara adalah `HintBubble` besar di tengah `.prompt` (ikon `sound-on` 56 px). Lulu berada di `.buddy` sebagai dekorasi. Saat ronde mulai: `speak hija` otomatis sekali.
2. Opsi berupa lentera di `.tray` (tile kuning `#FFE29A` + huruf Arab navy 64–96 px, `lang="ar"`).
3. Ketuk lentera = memilih jawaban (`correct` atau `retry`, tanpa `select`). Lentera **tidak** memutar bunyinya sendiri.
4. Benar → lentera menyala + `correct`.

**Status:** kesiapan ditentukan oleh readiness: klip `hija-*` harus ada dan berstatus `audioReviewed` di CMS (direkam/diunggah di `/admin/hijaiyyah`).

## G07 — Menulis Hijaiyyah (`tebalkan-hijaiyyah`, dunia `hijaiyyah`, engine `tracing`)

Lihat §T. Huruf dari content §5 (grup tracing). Status `ready` sejak 2026-11-27 (keputusan pengguna). Glyph bawaan (`content/glyphs/hijaiyyah.ts`, 28 huruf; mudah 6 / sedang 9 / menantang 13) dianggap `traceReviewed`, sehingga G07 terbuka di production tanpa centang CMS. Centang "Urutan tulis sudah direview" di CMS kini hanya bersifat catatan (`resolve.ts`: `cms || bundled`). Setelah selesai: `speak hija`.

## G08 — Kartu Kembar (`kartu-kembar`, dunia `memori`, engine `memory`, `turnMode: 'in-game'`)

**Tipe ronde:**

```ts
interface MemoryRound {
  cards: { id: string; face: ObjectId }[]; // 2 × pairs, diacak
  cols: number;
  rows: number;
}
```

Ukuran papan dan grid mengikuti content §7.

**Engine murni (`engines/memory/memory.ts`):**

```ts
type MemoryState = {
  open: string[];                  // maks 2 id
  matched: Record<string, 1 | 2>;  // id kartu → pemain yang menemukan
  currentPlayer: 1 | 2;
  locked: boolean;
};
function flip(state, cardId, cards): MemoryState  // abaikan bila locked, sudah open, atau matched
function resolve(state, cards, players): MemoryState // dipanggil setelah delay saat open.length===2
```

**Aturan:**
- Kartu ke-2 terbuka → `locked = true`.
- Cocok: kedua kartu matched oleh `currentPlayer`, `match`, langsung `resolve` (tanpa delay 900 ms). Pemain **tetap** sama.
- Tidak cocok: setelah 900 ms, kedua kartu tertutup. Pada mode 2 pemain, giliran pindah (`turn` + `TurnBanner`).
- Timer delay dibersihkan saat unmount.
- Selesai ketika semua kartu matched → `kids-yay` → `onComplete({attempts: jumlahPercobaan, firstTry: false})`.

**Visual:**
- Kartu tertutup (`.back`): tile biru dengan bintang.
- Kartu terbuka (`.front`): putih + objek, diputar `rotateY(180deg)`.
- Matched: bingkai biru (P1) atau pink (P2) + ✓.
- Flip 3D: `.board` memakai `perspective: 900px`, `.inner` memakai `transform-style: preserve-3d` dengan `rotateY` (`0 → 180`, `SPRING.gentle`), dan kedua sisi memakai `backface-visibility: hidden`. Dengan calm motion: `duration: 0`.

**Tes wajib:**
- tidak bisa membuka kartu ke-3 saat 2 terbuka;
- kartu matched tidak bisa dibuka lagi;
- semua pasangan ada tepat dua kali;
- giliran pindah hanya saat tidak cocok.

## G09 — Petualangan Labirin (`petualangan-labirin`, dunia `memori`, engine `maze`)

**Tipe ronde:**

```ts
interface MazeRound {
  size: number;
  walls: Uint8Array;  // per sel bitmask N=1,E=2,S=4,W=8
  start: [0, 0];
  goal: [number, number];  // [size-1, size-1]
  goalObject: ObjectId;
}
```

**Engine (`engines/maze/maze.ts`):**
- `generateMaze(size, rng)` memakai recursive backtracker iteratif (tanpa rekursi JS).
- `canMove(maze, cell, dir)`.
- `solve(maze)` memakai BFS → path.

**Interaksi:**
1. Kuku berada di sel start. Objek tujuan berada di sel goal.
2. **Ketuk atau geser papan:** `onPointerDown` + `onPointerUp` pada `.grid` (`touch-action: none`). Geser ≥ 30 px (`dirFromSwipe`) memindahkan Kuku ke sumbu dominan; ketuk sel tetangga langsung (`dirFromTap`) memindahkan Kuku ke sel tersebut. Jika terhalang dinding → `bump` (throttle 300 ms).
3. **Tombol arah:** 4 `BlockButton` (88 px) di `.tray` dengan label aksesibel `maze.up`/`down`/`left`/`right`. Keyboard memakai tombol panah.
4. Jejak sel yang sudah dilalui diberi titik pasir.
5. Mencapai goal → Kuku memakan makanan (pop) + `kids-yay` → `onComplete({attempts: 1, firstTry: true})`.

Labirin tidak punya kondisi gagal dan tidak punya timer.

**Petunjuk idle ke-1:** jejak samar 3 sel ke depan dari path solusi.

**Tes wajib:** semua sel terjangkau (perfect maze), `solve` menemukan path untuk 200 seed acak per ukuran, `canMove` konsisten dua arah.

---

## §T — Tracing bersama (G02, G05, G07)

**Engine (`engines/tracing/tracing.ts`, murni, tanpa DOM):**

```ts
interface TraceState {
  strokeIndex: number;   // goresan aktif
  progress: number;      // indeks sampel terakhir yang dicapai di goresan aktif
  done: boolean;
  rejectedStarts: number; // pointerdown yang ditolak
}
function prepareGlyph(glyph: Glyph): PreparedGlyph // resample tiap stroke ke jarak 2 unit
function pointerDown(state, prepared, p: Point, tol: number): { state; accepted: boolean }
function pointerMove(state, prepared, p: Point, tol: number): TraceState
function pointerUp(state): TraceState
```

**Aturan:**
- `pointerDown` diterima jika `dist(p, sample[progress]) ≤ tol * 2.5` (`START_RADIUS_FACTOR = 2.5`). Ini memungkinkan melanjutkan dari titik terakhir setelah jari/mouse diangkat. Jika ditolak: `rejectedStarts++` secara **senyap** (tanpa sfx `retry`).
- `pointerMove`: cari `j` terjauh dalam `progress+1 … progress+15` (`LOOKAHEAD_SAMPLES = 15`) yang berjarak ≤ `tol` → `progress = j`. Gerakan mundur atau keluar jalur tidak menambah progress dan tidak menghapusnya.
- Stroke selesai ketika `progress >= Math.ceil(0.9 * (samples.length - 1))` (`COMPLETE_RATIO = 0.9`) → `stroke-done`, lalu lanjut ke stroke berikutnya (`progress = 0`).
- Stroke `dot`: selesai jika `pointerDown` berada dalam `tol * 2.5` dari titik.
- Glyph selesai ketika semua stroke selesai.
- `attempts = 1 + rejectedStarts`, `firstTry = rejectedStarts === 0`.

**Toleransi per level** (unit logis dari kotak 100):

| Level | `tol` | Panah arah | Nomor urut goresan | Lebar jalur visual |
| --- | --- | --- | --- | --- |
| Mudah | 14 | Ya (di stroke aktif) | Tidak | `tol*2` |
| Sedang | 11 | Ya (di stroke aktif) | Tidak | `tol*2` |
| Menantang | 9 | Tidak (hanya titik mulai) | Tidak | `tol*2` |

Preferensi pendamping "Garis tebal" mengalikan `tol` dengan 1.3.

**Komponen `TracingCanvas` (`engines/tracing/TracingCanvas.tsx`):**
- Kotak persegi (`width: min(100%, 440px); aspect-ratio: 1`) dipusatkan. Koordinat pointer dipetakan ke 0–100. `cursor: crosshair; user-select: none; touch-action: none`.
- Ukuran canvas diatur oleh `ResizeObserver`. Repaint memakai `createFrameScheduler` (aman terhadap React StrictMode unmount/remount).
- Titik mulai aktif berupa elemen `.startDot` hijau (`var(--success-500)`) berdenyut halus (scale 1→1.15→1, 1.2 s; mati saat `calmMotion`, disembunyikan saat pointer aktif atau selesai).
- Tombol **Ulangi** (`trace.again`, ikon `replay`) di pojok kanan atas me-reset goresan sambil mempertahankan `rejectedStarts`.
- Glyph selesai → seluruh glyph hijau + `correct`, lalu `onComplete` setelah `DUR.celebrate` (600 ms; 0 ms bila `calmMotion`).

**Tes wajib (`tracing.test.ts`):**
- jalur lurus dari awal ke akhir selesai;
- mulai dari ujung yang salah ditolak;
- coretan zig-zag acak di luar jalur tidak menyelesaikan;
- urutan stroke ditegakkan (stroke 2 tidak bisa diisi sebelum stroke 1);
- angkat dan lanjut dari `progress` diterima;
- dot stroke selesai dengan satu ketukan;
- fixture `A`, `1`, dan `ba` dari content §6.
