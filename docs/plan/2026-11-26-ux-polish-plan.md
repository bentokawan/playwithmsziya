# UX Polish PAUD (Beranda, Intro, Berhitung, Menulis, Audit Game) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

- Tanggal: 2026-11-26
- Status: **done (kode)** — sisa: commit (izin) dan 4 verifikasi manual di browser/perangkat.

- Referensi:
  - [Design](../design.md)
  - [Game specs](../specs/game-specs.md)
  - [Content](../specs/content.md)
  - [Copy](../specs/copy.md)
  - Plan induk: [redesign](2026-11-25-paud-redesign-plan.md)

**Goal:** Buat aplikasi anak lebih rapi, sederhana, dan halus di desktop maupun HP. Cakupannya lima hal:
- beranda langsung menampilkan semua game;
- intro dirapikan;
- Ayo Berhitung langsung pilih jumlah;
- menulis bisa dipakai dengan mouse;
- tiap game dipoles.

**Architecture:** Halaman Dunia (`/dunia/:worldId`) dihapus. Beranda menjadi satu grid 9 kartu game; warna dunia tetap dipakai sebagai tema kartu dan latar arena. Semua game memakai satu tata letak arena baru: soal di atas, baki jawaban di bawah. Engine tracing diperbaiki dari dua sisi:
- bug render di React StrictMode;
- aturan jejak yang lebih pemaaf, untuk sentuhan maupun mouse.

**Tech Stack:** React 19, TypeScript 6, Vite 8, Motion 14 (`motion/react`, `m.*`), CSS Modules, Vitest 5 (environment node, tanpa testing-library), Playwright 1.65.

**Spec:** Spec diambil dari permintaan pengguna 2026-11-26 (5 poin + 2 screenshot), ditambah hasil audit di §A di bawah. Dokumen spec lama yang berubah disinkronkan di Task 13.

## A. Hasil audit (bukti dari kode saat ini)

| # | Temuan | Bukti |
| --- | --- | --- |
| A1 | **Menulis angka tidak tergambar di dev.** Kanvas kosong (0 piksel). Cleanup effect memanggil `cancelAnimationFrame` tetapi tidak me-reset `rafRef.current`. Setelah StrictMode me-mount ulang, `schedulePaint` mengira frame masih tertunda sehingga tidak pernah menggambar lagi. Masalahnya ada di render, bukan touch vs mouse. | `TracingCanvas.tsx:168-195`. Direproduksi dengan Playwright di 1360×640: piksel non-transparan = 0, juga setelah resize. |
| A2 | Jejak terlalu ketat untuk anak dan mouse. Lookahead hanya 6 sampel (12 unit), awal goresan harus tepat di titik, salah mulai membunyikan `retry`, dan tidak ada jeda selebrasi (onComplete 300 ms). | `tracing.ts:123,155`; `TracingCanvas.tsx:213,240` |
| A3 | G02 Menantang memakai angka 2 digit (10–20) yang digabung mengecil, sehingga sulit dan tidak "simple". | `content/numbers.ts:12`, `menulis-angka/rounds.ts:19-23` |
| A4 | G01: pilihan angka **terkunci** sampai semua benda diketuk (kecuali Menantang). Posisi benda acak (jitter), jadi sulit dihitung. | `AyoBerhitungRound.tsx:31,93`, `rounds.ts:20-38` |
| A5 | Beranda hanya berisi 4 pintu dunia yang ilustrasinya terpotong (lihat screenshot). Mascot `position: fixed` menutupi konten, dan ada halaman perantara Dunia. | `HomePage.tsx`, `HomePage.module.css:27-35`, `WorldDoor` |
| A6 | Intro: kartu demo abstrak (slot + "A" + tangan) tidak menjelaskan game. Kontrol rata kiri dengan lebar tidak sama, warna terpilih tidak konsisten (level pink, pemain biru), dan "Untuk pendamping" melebar. | `IntroPage.tsx:83-148`, screenshot 2 |
| A7 | Arena: pilihan berada di kolom kanan bersama karakter, sehingga mata anak bolak-balik kiri–kanan. Di HP, karakter memakan ruang. | `Arena.module.css:1-65` |
| A8 | Bunyi menumpuk: `select` + `correct`/`retry` + ucapan diputar bersamaan. | `AyoBerhitungRound.tsx:51-58`, `BunyiAwalRound.tsx:45-55`, `SusunKataRound.tsx:36-42` |
| A9 | G04 Menantang menampilkan kotak putih kosong (`char=''`), sehingga terlihat rusak. | `BunyiAwalRound.tsx:87` |
| A10 | G06 punya dua pemicu suara yang sama (tombol Lulu + HintBubble). | `DengarTemukanRound.tsx:58-63` |
| A11 | G08: `rotateY` tanpa `perspective`/`backface-visibility`, sehingga flip terlihat "patah" dan isi berganti mendadak. | `KartuKembarRound.tsx:95-118` |
| A12 | G09: hanya D-pad/keyboard; papan tidak bisa diketuk atau digeser. Keempat tombol panah memakai label `play.hint` (bug a11y). | `PetualanganLabirinRound.tsx:153-167` |
| A13 | Transisi kasar: rute memakai `y:16` + `AnimatePresence mode="wait"` sehingga jeda terasa lambat. Pergantian ronde langsung tanpa transisi. | `routes.tsx:124-137`, `PlayPage.tsx:236-247` |
| A14 | `Scene` memakai `overflow: hidden`, sehingga di desktop pendek (≤ 640 px) tombol bawah terpotong. | `Scene.module.css:6` |
| A15 | Playwright hanya punya proyek touch (tablet/iPad); tidak ada proyek desktop mouse maupun HP. | `playwright.config.ts:14-28` |

## B. Keputusan (default yang dipakai; ubah sebelum eksekusi bila tidak setuju)

| ID | Keputusan |
| --- | --- |
| K1 | Halaman Dunia dihapus. `/dunia/:worldId` → redirect ke `/home`. Alur anak: Beranda → Intro → Main (2 ketukan sampai ▶). |
| K2 | Beranda: grid kartu game. ≤ 599 px: 1 kolom dengan kartu horizontal. 600–1023 px: 2 kolom. ≥ 1024 px: 3 kolom (9 game = 3×3). Kartu "Segera hadir" diletakkan paling akhir. |
| K3 | Setiap kartu berisi ilustrasi objek di panel warna dunia (`WORLDS[w].palette.sky`), judul, dan **deskripsi singkat** 1 kalimat (`game.<id>.tagline`). |
| K4 | Arena v2 untuk semua game: area **soal** di atas (flex 1), **baki** jawaban di bawah (satu baris, rata tengah). Karakter dunia menjadi dekorasi kecil di pojok kanan bawah soal, disembunyikan bila lebar < 600 px. |
| K5 | G01: benda tampil rapi per baris isi 5 (gaya ten-frame) dan tidak bisa diketuk. Tiga pilihan angka selalu aktif di semua level. Salah jawab → animasi hitung otomatis (benda menyala 1..N + badge angka) sebagai petunjuk. |
| K6 | G02: kumpulan angka mudah 1–5, sedang 0–9, menantang 0–9 tanpa panah. Tidak ada angka 2 digit. |
| K7 | Tracing (G02/G05/G07): tol mudah 14 / sedang 11 / menantang 9 (×1.3 bila garis tebal). Mulai diterima dalam 2.5×tol. Lookahead 15 sampel. Goresan selesai pada 90 %. Salah mulai senyap. Titik mulai berdenyut. Ada tombol "Ulangi". Selebrasi 600 ms sebelum ronde berikutnya. |
| K8 | Satu kejadian = satu suara: memilih jawaban hanya memutar `correct` atau `retry` (tanpa `select`), lalu ucapan item sesudah `correct`. |
| K9 | Intro: satu kartu rata tengah. Kiri: ilustrasi + judul + tagline. Kanan: level (3 kolom sama lebar), pemain (2 kolom sama lebar), Mulai lebar penuh. "Untuk pendamping" menjadi tombol teks yang membuka `Dialog`. Demo abstrak dihapus. |

## Global Constraints

- Semua perintah dijalankan dari `project/`. Quality gate tiap task: `npm run lint && npm test && npm run build` hijau.
- Dependensi baru **dilarang** (tidak ada GSAP, Tailwind, testing-library).
- Animasi memakai `m.*` dari `motion/react` (LazyMotion strict). Durasi/spring hanya dari `@/design/motion` (`DUR`, `SPRING`, `EASE_OUT_SOFT`, `pressProps`).
- Setiap animasi baru wajib punya cabang `calmMotion`/`useCalmMotion()` yang mematikan gerak (duration 0, tanpa pulse/loop).
- Warna hanya token CSS `var(--…)` dari `design/tokens.css` (pengecualian: canvas tracing dan folder `worlds/`).
- Target sentuh: navigasi ≥ 64 px, pilihan ≥ `var(--touch-choice)` (88 px), tombol utama ≥ `var(--touch-primary)`.
- Teks UI hanya lewat `useT()`. Setiap key baru ditulis di `i18n/id.ts` **dan** `i18n/en.ts` (dijaga `i18n.test.ts`).
- Tidak ada horizontal scroll pada 390×844, 1024×768, 1366×768, dan 1360×640.
- Commit hanya jika pengguna sudah mengizinkan commit. Bila belum, lewati langkah commit dan catat di Log.

## Review Focus

1. **Mouse dilepas di luar kanvas di tengah goresan.** Progres harus tetap tersimpan, dan tekan berikutnya di dekat titik progres melanjutkan goresan → tes `resumes from progress after pointer up` (Task 2).
2. **Gerakan mouse cepat yang melompati > 12 unit per event.** Progres harus tetap maju → tes `advances across a 20-unit jump in one move` (Task 2).
3. **StrictMode mount → unmount → mount.** Kanvas harus tetap tergambar → tes `schedules again after cancel` (Task 1) + e2e `canvas is painted on desktop` (Task 3).
4. **URL lama `/dunia/angka` dari bookmark** harus diarahkan ke `/home` tanpa layar kosong → e2e `old world URL redirects home` (Task 7).
5. **Ketukan ganda pada pilihan G01 saat animasi hitung otomatis berjalan.** Hanya satu jawaban yang dinilai → aturan `locked` di Task 5. Verifikasinya lewat langkah e2e `double click submits once`.

---

## Peta file

| File | Tanggung jawab | Task |
| --- | --- | --- |
| `src/games/engines/tracing/frameScheduler.ts` (baru) | Penjadwal rAF yang aman untuk StrictMode | 1 |
| `src/games/engines/tracing/tracing.ts` | Aturan jejak pemaaf | 2 |
| `src/games/engines/tracing/TracingCanvas.tsx` / `.module.css` | Render, titik berdenyut, Ulangi, selebrasi | 1, 3 |
| `playwright.config.ts`, `e2e/desktop.spec.ts` (baru) | Proyek desktop mouse + HP | 1, 3, 7 |
| `src/games/Arena.module.css` + 9 file `*Round.tsx` | Arena v2 | 4 |
| `src/games/ayo-berhitung/*` | G01 sederhana | 5 |
| `src/games/menulis-angka/*`, `src/content/numbers.ts` | G02 sederhana | 6 |
| `src/games/catalog.ts`, `src/components/GameCard/*`, `src/pages/Home/*`, `src/app/routes.tsx` | Beranda semua game, hapus Dunia | 7 |
| `src/pages/Intro/*`, `src/components/LevelPicker/*`, `src/components/PlayerPicker/*` | Intro rapi | 8 |
| `src/games/{susun-kata,bunyi-awal,dengar-temukan}/*` | Polesan game pilihan | 9 |
| `src/games/kartu-kembar/*` | Flip 3D | 10 |
| `src/games/engines/maze/maze.ts`, `src/games/petualangan-labirin/*` | Ketuk/geser + label | 11 |
| `src/app/routes.tsx`, `src/pages/Play/PlayPage.tsx`, `src/components/Scene/Scene.module.css` | Transisi halus, scroll aman | 12 |
| `docs/**` | Sinkronisasi dokumen + QA akhir | 13 |

---

### Task 1: Perbaiki kanvas tracing yang tidak tergambar (StrictMode) + proyek e2e desktop

**Files:**
- Create: `project/src/games/engines/tracing/frameScheduler.ts`
- Test: `project/src/games/engines/tracing/frameScheduler.test.ts`
- Modify: `project/src/games/engines/tracing/TracingCanvas.tsx:37-195`
- Modify: `project/playwright.config.ts` (tambah dua proyek)

**Interfaces:**
- Produces:
  ```ts
  export interface FrameScheduler { schedule(): void; cancel(): void }
  export function createFrameScheduler(
    paint: () => void,
    raf: (cb: FrameRequestCallback) => number,
    caf: (id: number) => void,
  ): FrameScheduler;
  ```
- Produces (Playwright):
  - project `chromium-desktop`: `{ browserName: 'chromium', viewport: { width: 1366, height: 768 }, hasTouch: false }`
  - project `chromium-phone`: `{ browserName: 'chromium', viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true }`

- [x] **Step 1: Tulis tes gagal** `frameScheduler.test.ts`. Gunakan fake `raf` yang menyimpan callback dan `caf` yang mencatat id:

```ts
it('requests one frame for many schedules', () => { s.schedule(); s.schedule(); expect(rafCalls).toBe(1); });
it('paints once when the frame fires and can schedule again', () => { s.schedule(); fire(); expect(paints).toBe(1); s.schedule(); expect(rafCalls).toBe(2); });
it('cancel stops a pending paint', () => { s.schedule(); s.cancel(); expect(cafIds).toEqual([1]); fire(); expect(paints).toBe(0); });
it('schedules again after cancel', () => { s.schedule(); s.cancel(); s.schedule(); expect(rafCalls).toBe(2); }); // regresi StrictMode
```

- [x] **Step 2:** `npx vitest run src/games/engines/tracing/frameScheduler.test.ts` → FAIL (modul tidak ada).
- [x] **Step 3:** Implementasikan `createFrameScheduler`. `cancel()` wajib mengosongkan id tertunda.
- [x] **Step 4:** Jalankan ulang → PASS.
- [x] **Step 5:** Pakai di `TracingCanvas`:
  - simpan `paint` di `paintRef`;
  - buat scheduler di dalam effect resize dengan `(() => paintRef.current(), requestAnimationFrame, cancelAnimationFrame)`;
  - simpan ke `schedulerRef`, dan panggil `schedulerRef.current?.cancel()` di cleanup;
  - semua handler pointer memanggil `schedulerRef.current?.schedule()`;
  - hapus `rafRef`.
- [x] **Step 6:** Tambah dua proyek Playwright di atas. Proyek lama `chromium-tablet` dan `webkit-ipad` tetap ada.
- [ ] **Step 7:** Verifikasi manual di dev (`npm run dev`, buka `/game/menulis-angka/play?level=mudah&players=1&lang=id&seed=7`). Jalur abu-abu dan titik hijau harus terlihat sebelum ada interaksi. ⏸ _manual/perangkat fisik, belum ada bukti_
- [x] **Step 8:** Quality gate → hijau. Commit `fix(tracing): repaint after StrictMode remount`. _(bagian commit dilewati: belum ada izin)_

---

### Task 2: Engine tracing pemaaf (touch + mouse)

**Files:**
- Modify: `project/src/games/engines/tracing/tracing.ts`
- Test: `project/src/games/engines/tracing/tracing.test.ts`

**Interfaces:**
- Produces:
  - `export const START_RADIUS_FACTOR = 2.5`
  - `export const LOOKAHEAD_SAMPLES = 15`
  - `export const COMPLETE_RATIO = 0.9`
  - `toleranceForLevel(d, thick)` → mudah 14, sedang 11, tantang 9, dikali 1.3 bila `thick`.
  - Signature `pointerDown`, `pointerMove`, `pointerUp`, dan `TraceState` **tidak berubah**.

- [x] **Step 1: Tulis/ubah tes** (fixture `FIXTURE_1` yang sudah ada, `tol = 14`):

```ts
it('toleranceForLevel', () => { expect(toleranceForLevel('mudah')).toBe(14); expect(toleranceForLevel('sedang')).toBe(11); expect(toleranceForLevel('tantang')).toBe(9); expect(toleranceForLevel('mudah', true)).toBeCloseTo(18.2); });
it('accepts a start press within 2.5×tol of the current target', () => { const p = { x: s0.x + 14 * 2.4, y: s0.y }; expect(pointerDown(INITIAL_TRACE_STATE, prep, p, 14).accepted).toBe(true); });
it('rejects a start press beyond 2.5×tol and counts it', () => { const r = pointerDown(INITIAL_TRACE_STATE, prep, { x: s0.x + 14 * 2.6, y: s0.y }, 14); expect(r.accepted).toBe(false); expect(r.state.rejectedStarts).toBe(1); });
it('advances across a 20-unit jump in one move', () => { /* down di samples[0], move ke samples[10] */ expect(res.state.progress).toBeGreaterThanOrEqual(10); });
it('completes a stroke at 90% progress', () => { const idx = Math.ceil(0.9 * (n - 1)); /* move bertahap ke samples[idx] */ expect(last.strokeCompleted).toBe(true); expect(last.state.done).toBe(true); });
it('resumes from progress after pointer up', () => { /* trace ke samples[8], pointerUp, pointerDown di samples[8] */ expect(r.accepted).toBe(true); expect(r.state.progress).toBe(8); });
```

  Sesuaikan tes lama yang memakai nilai tol 12/9/7.
- [x] **Step 2:** `npx vitest run src/games/engines/tracing/tracing.test.ts` → FAIL pada tes baru.
- [x] **Step 3:** Implementasi:
  - `pointerDown` membandingkan jarak dengan `tol * START_RADIUS_FACTOR`;
  - `pointerMove` mencari sampel terjauh dalam `progress + LOOKAHEAD_SAMPLES` yang berjarak ≤ tol;
  - goresan selesai bila `best >= Math.ceil(COMPLETE_RATIO * (samples.length - 1))`.
- [x] **Step 4:** Jalankan ulang → PASS. Jalankan juga `npm test` untuk memastikan tes glyph/huruf lain tetap hijau.
- [ ] **Step 5:** Commit `feat(tracing): forgiving start, lookahead and 90% completion`. ⏸ _menunggu izin commit_

---

### Task 3: TracingCanvas lebih sederhana dan halus

**Files:**
- Modify: `project/src/games/engines/tracing/TracingCanvas.tsx`, `TracingCanvas.module.css`
- Modify (props): `project/src/games/menulis-angka/MenulisAngkaRound.tsx`, `project/src/games/menulis-huruf/MenulisHurufRound.tsx`, `project/src/games/tebalkan-hijaiyyah/TebalkanHijaiyyahRound.tsx`
- Create: `project/e2e/desktop.spec.ts`
- Modify: `project/src/i18n/id.ts`, `project/src/i18n/en.ts`

**Interfaces:**
- Consumes: Task 1 (`createFrameScheduler`) dan Task 2 (konstanta, `toleranceForLevel`).
- Produces: `TracingCanvasProps` berisi:
  - field lama: `glyph`, `difficulty`, `player`, `thickLines`, `onComplete`;
  - field baru: `readonly calmMotion: boolean`.
- Produces: elemen `.wrap` membawa `data-glyph-id={glyph.id}` dan `data-done`, dipakai e2e.
- Produces: i18n `trace.again` — ID "Ulangi", EN "Again".

- [x] **Step 1: Tulis e2e gagal** `e2e/desktop.spec.ts`. Jalankan hanya di `chromium-desktop` (`test.skip(info.project.name !== 'chromium-desktop')`).
  - Tes `canvas is painted on desktop`: buka `/game/menulis-angka/play?level=mudah&players=1&lang=id&seed=7`, lalu hitung piksel alpha > 0 lewat `getImageData`. Harapan: `> 0`.
  - Tes `mouse can trace a full number`:
    - baca `data-glyph-id`;
    - ambil glyph dari `../src/content/glyphs/digits` (`DIGIT_GLYPHS`);
    - untuk tiap stroke: `mouse.move` ke titik pertama, `mouse.down`, lalu `mouse.move` ke tiap titik (logis 0–100 → piksel dari `boundingBox`, `steps: 8`), lalu `mouse.up`;
    - harapan: `[data-done="true"]` terlihat dalam 2 detik.
- [x] **Step 2:** `npm run build && npx playwright test e2e/desktop.spec.ts --project=chromium-desktop` → FAIL (atribut belum ada).
- [x] **Step 3: Implementasi UI:**
  - Hapus angka urutan goresan (blok `difficulty === 'mudah'` `fillText`).
  - Panah arah hanya untuk `mudah`/`sedang` (tetap).
  - Titik mulai berupa `<span className={styles.startDot}>` absolut, diposisikan dengan `left/top` % dari titik target goresan aktif:
    - diameter `tol*2` % lebar kanvas, warna `var(--success-500)`;
    - keyframes `pulse` scale 1→1.15→1, 1.2 s, infinite;
    - disembunyikan saat goresan sedang ditarik (`active`) atau `done`;
    - tanpa animasi bila `calmMotion`.
  - Hapus `audio.sfx('retry')` pada salah mulai.
  - Tombol `BlockButton variant="white" size="nav" icon="replay" label={t('trace.again')}` di pojok kanan atas `.wrap`. Tombol ini me-reset `stateRef` ke `INITIAL_TRACE_STATE`, `completedRef=false`, lalu menggambar ulang. `rejectedStarts` dipertahankan untuk `firstTry`.
  - Saat `done`: isi hijau, `audio.sfx('correct')`, lalu `onComplete` setelah `calmMotion ? 0 : DUR.celebrate*1000` ms.
  - CSS `.canvas { cursor: crosshair; user-select: none; touch-action: none }`. `.wrap` memakai `width: min(100%, 440px); aspect-ratio: 1` (hapus `height:100%`, `min-*`, `max-*`) agar selalu persegi di desktop dan HP.
- [x] **Step 4:** Teruskan `calmMotion` dari `RoundProps` di ketiga Round tracing.
- [x] **Step 5:** Build + e2e desktop → PASS. Jalankan juga `npx playwright test --project=chromium-tablet` → tetap PASS.
- [x] **Step 6:** Quality gate. Commit `feat(tracing): pulsing start dot, again button, celebration delay`. _(bagian commit dilewati: belum ada izin)_

---

### Task 4: Arena v2 (soal di atas, baki jawaban di bawah)

**Files:**
- Modify: `project/src/games/Arena.module.css` (tulis ulang)
- Modify: 9 file `project/src/games/*/*Round.tsx` (hanya struktur kelas dan posisi karakter)
- Modify: `project/src/components/Scene/Scene.module.css:6`

**Interfaces:**
- Produces: kelas CSS `arena`, `prompt`, `tray`, `options`, `wordRow`, `buddy`, `locked`, `charTap`. Kelas `stage` dan `keeper` **dihapus**.

- [x] **Step 1:** Tulis ulang `Arena.module.css`:
  - `.arena`: `display:flex; flex-direction:column; gap: var(--space-5); width:100%; max-width:1080px; flex:1; min-height:0`.
  - `.prompt`: `position:relative; flex:1; display:flex; flex-direction:column; align-items:center; justify-content:center; gap: var(--space-5)`.
  - `.tray`: `display:flex; justify-content:center; padding-bottom: env(safe-area-inset-bottom)`.
  - `.options`: `display:flex; flex-wrap:wrap; justify-content:center; gap: var(--space-4)`.
  - `.buddy`: `position:absolute; right:0; bottom:0; pointer-events:none`. Di `@media (max-width: 599px)` diganti `display:none`.
  - Hapus blok `@media (orientation: portrait)` lama.
- [x] **Step 2:** Di setiap Round:
  - `stage` → `prompt`, dan `keeper` → `tray`;
  - komponen karakter dunia (Jeje/Pipi/Lulu/Kuku) dipindah ke `<div className={arenaStyles.buddy} aria-hidden="true">` di dalam `.prompt`, ukuran 96 (Pipi 140);
  - Tile model di G02/G05/G07 pindah ke `.prompt` di atas kanvas;
  - D-pad G09 tetap di `.tray`.
- [x] **Step 3:** `Scene.module.css`: ganti `overflow: hidden` dengan `overflow-x: hidden; overflow-y: auto`.
- [x] **Step 4:** Tambah tes di `e2e/desktop.spec.ts`: `no horizontal overflow in play pages`.
  - Untuk 9 game (kecuali yang `soon`), buka `/game/<id>/play?level=mudah&players=1&lang=id&seed=7`.
  - Harapan: `document.documentElement.scrollWidth <= innerWidth`.
  - Jalankan di `chromium-desktop` dan `chromium-phone` (hapus `test.skip` untuk tes ini; skip hanya untuk tablet/iPad).
- [x] **Step 5:** Build + e2e → PASS. Quality gate. Commit `refactor(arena): prompt-top, answer-tray layout for all games`. _(bagian commit dilewati: belum ada izin)_

---

### Task 5: Ayo Berhitung — langsung pilih jumlahnya

**Files:**
- Modify: `project/src/games/ayo-berhitung/rounds.ts`, `rounds.test.ts`, `AyoBerhitungRound.tsx`, `AyoBerhitungRound.module.css`, `index.ts`
- Modify: `project/src/i18n/id.ts`, `en.ts` (`game.ayo-berhitung.howTo`)

**Interfaces:**
- Produces:
  ```ts
  export interface CountRound { readonly objectId: string; readonly count: number; readonly options: readonly number[] } // `positions` dihapus
  export function countLayout(count: number): readonly number[]; // isi tiap baris, maks 5
  ```

- [x] **Step 1: Tes gagal** di `rounds.test.ts`. Ganti tes `positions` dengan:

```ts
it('lays out objects in rows of five', () => {
  expect(countLayout(1)).toEqual([1]); expect(countLayout(5)).toEqual([5]); expect(countLayout(7)).toEqual([5, 2]);
  expect(countLayout(10)).toEqual([5, 5]); expect(countLayout(12)).toEqual([5, 5, 2]); expect(countLayout(20)).toEqual([5, 5, 5, 5]);
});
it('offers exactly 3 unique options containing the answer at every level', () => {
  for (const d of ['mudah', 'sedang', 'tantang'] as const) for (const r of createAyoBerhitungRounds(cfg(d), content)) {
    expect(r.options).toHaveLength(3); expect(new Set(r.options).size).toBe(3); expect(r.options).toContain(r.count);
    expect('positions' in r).toBe(false);
  }
});
```

- [x] **Step 2:** `npx vitest run src/games/ayo-berhitung` → FAIL.
- [x] **Step 3:** Implementasi `rounds.ts`:
  - hapus `generateGridJitterPositions`;
  - `optionCount = 3` untuk semua level;
  - tambah `countLayout`.
- [x] **Step 4:** Jalankan ulang → PASS.
- [x] **Step 5: Implementasi `AyoBerhitungRound`:**
  - **Soal:** kartu putih `.field` (`max-width: 640px`, padding `var(--space-5)`). Tiap baris dari `countLayout` dirender sebagai flex rata tengah berisi `ObjectImage`.
  - **Ukuran benda:** ≤ 5 → 88, ≤ 10 → 72, selain itu 56.
  - **Benda bukan tombol:** pakai `<div>` dan `role="img"` dari `ObjectImage`.
  - **Baki:** 3 `Tile` angka biru yang selalu aktif.
  - **Benar:**
    - `submit(true)`, lalu `audio.sfx('correct')` + `speak(num)`;
    - semua benda mendapat badge angka 1..N sekaligus.
  - **Salah:**
    - `submit(false)`, lalu `audio.sfx('retry')`;
    - setelah itu jalankan **hitung otomatis**: `hintIndex` naik 0→N tiap 450 ms;
    - benda ke-i mendapat badge `i+1` + `scale` 1→1.12→1 (`SPRING.gentle`) + `audio.sfx('count-pop')` + `speak(i+1)`;
    - bila `calmMotion`, semua badge muncul sekaligus tanpa ucapan beruntun;
    - selama hitung otomatis, baki memakai `arenaStyles.locked`.
  - **Idle 8 detik:** sambungkan `onIdle` dari `useRoundMachine`. Level 1 menjalankan hitung otomatis yang sama, satu kali per ronde.
  - **Suara:** hapus `audio.sfx('select')` (K8).
- [x] **Step 6:** Tambah atribut `data-state={state}` pada `<m.button>` di `components/Tile/Tile.tsx` (dipakai e2e; kelas CSS Module ter-hash). Ubah `index.ts` `speechFor`: tetap angka 1..count (dipakai hitung otomatis).
- [x] **Step 7:** Ubah `game.ayo-berhitung.howTo`:
  - ID: "Lihat bendanya, hitung, lalu ketuk angka yang benar."
  - EN: "Look, count, then tap the right number."
- [x] **Step 8:** E2e `double click submits once` di `desktop.spec.ts` (Review Focus 5):
  - aktifkan test mode seperti `flows.spec.ts` (`enableTestMode`);
  - `dblclick` pada tile angka yang salah, lalu tunggu 1 detik;
  - harapan: `RoundDots` masih ronde 1 dan jumlah `[data-state="retry"]` ≤ 1 dan tidak ada `[data-state="correct"]`.
- [x] **Step 9:** Quality gate + e2e. Commit `feat(g01): pick the count directly with auto-count hint`. _(bagian commit dilewati: belum ada izin)_

---

### Task 6: Menulis Angka — lebih sederhana

**Files:**
- Modify: `project/src/content/numbers.ts:9-13`
- Modify: `project/src/games/menulis-angka/rounds.ts`, `rounds.test.ts`, `MenulisAngkaRound.tsx`
- Modify: `project/src/games/engines/tracing/tracing.ts` + tes (hapus `combineGlyphsSideBySide` bila tidak ada pemakai lain)
- Modify: `project/src/i18n/id.ts`, `en.ts` (`game.menulis-angka.howTo`)

**Interfaces:**
- Produces: `TRACE_NUMBER_POOLS = { mudah: [1,2,3,4,5], sedang: [0..9], tantang: [0..9] }`, dan `TraceNumberRound { num: number; glyph: Glyph }` (tidak berubah).

- [x] **Step 1: Tes gagal:**

```ts
it('uses single digits only', () => { for (const d of LEVELS) for (const r of createMenulisAngkaRounds(cfg(d))) { expect(r.glyph.id).toHaveLength(1); expect(r.num).toBeLessThanOrEqual(9); } });
it('mudah uses 1–5', () => { for (const r of createMenulisAngkaRounds(cfg('mudah'))) expect([1, 2, 3, 4, 5]).toContain(r.num); });
it('never repeats a number in one session', () => { const nums = createMenulisAngkaRounds(cfg('tantang')).map((r) => r.num); expect(new Set(nums).size).toBe(nums.length); });
```

- [x] **Step 2:** `npx vitest run src/games/menulis-angka` → FAIL.
- [x] **Step 3:** Ubah pool dan sederhanakan `glyphForNumber` menjadi `DIGIT_GLYPHS[String(n)]`. `grep -rn combineGlyphsSideBySide src`: bila hanya tersisa di tracing.ts dan tesnya, hapus fungsi dan tesnya.
- [x] **Step 4:** Jalankan ulang → PASS.
- [x] **Step 5:** `MenulisAngkaRound`:
  - di `.prompt`, tampilkan baris: Tile model angka (ketuk = ucapkan) + `TracingCanvas` di bawahnya;
  - ucapkan angka sekali saat ronde mulai (`useEffect`), dan sekali saat selesai;
  - hapus `setMood`; karakter dekoratif tetap `happy` lalu `wow` saat selesai.
- [x] **Step 6:** `howTo`:
  - ID: "Mulai dari titik hijau, lalu ikuti jalurnya dengan jari atau mouse."
  - EN: "Start at the green dot and follow the path with a finger or mouse."
  - Samakan kalimat `game.menulis-huruf.howTo` dengan pola ini (ganti "angka" → "huruf").
- [x] **Step 7:** Quality gate + `npx playwright test e2e/desktop.spec.ts --project=chromium-desktop`. Commit `feat(g02): single-digit pools and simpler round`. _(bagian commit dilewati: belum ada izin)_

---

### Task 7: Beranda menampilkan semua game + hapus halaman Dunia

**Files:**
- Modify: `project/src/games/catalog.ts` (+ `catalog.test.ts`)
- Modify: `project/src/components/GameCard/GameCard.tsx`, `GameCard.module.css`
- Modify: `project/src/pages/Home/HomePage.tsx`, `HomePage.module.css`
- Modify: `project/src/app/routes.tsx`, `project/src/pages/Intro/IntroPage.tsx:80`, `project/src/pages/Play/PlayPage.tsx:255`, `project/src/pages/Result/ResultPage.tsx:47-56,107`, `project/src/pages/Kit/KitPage.tsx:21,176-179`
- Delete: `project/src/pages/World/`, `project/src/components/WorldDoor/`
- Modify: `project/e2e/flows.spec.ts:77-80`, `project/e2e/a11y.spec.ts:25`, `project/e2e/touch.spec.ts:12`, `project/e2e/desktop.spec.ts`
- Modify: `project/src/i18n/id.ts`, `en.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface HomeGameItem { readonly entry: CatalogEntry; readonly playable: boolean }
  export function homeGameList(isPlayable: (entry: CatalogEntry) => boolean): readonly HomeGameItem[]; // playable dulu, lalu urut code
  ```
- Produces: `GameCardProps` berisi `entry`, `onOpen`, `isReady?`, `readonly layout?: 'grid' | 'compact'` (default `'grid'`; Result memakai `'compact'`).
- Produces: i18n `home.greeting` dan `game.<id>.tagline` (9 key). `gamesInWorld` **dihapus** (Result tidak memakainya lagi).

- [x] **Step 1: Tes gagal** di `catalog.test.ts` (hapus tes `gamesInWorld`):

```ts
it('homeGameList puts playable games first in code order', () => {
  const list = homeGameList((e) => e.status === 'ready');
  expect(list).toHaveLength(9);
  expect(list.at(-1)?.entry.id).toBe('tebalkan-hijaiyyah');
  expect(list.at(-1)?.playable).toBe(false);
  expect(list.slice(0, 8).map((i) => i.entry.code)).toEqual(['G01', 'G02', 'G03', 'G04', 'G05', 'G06', 'G08', 'G09']);
});
```

- [x] **Step 2:** `npx vitest run src/games/catalog.test.ts` → FAIL.
- [x] **Step 3:** Implementasi `homeGameList`, lalu hapus `gamesInWorld`. Jalankan ulang → PASS.
- [x] **Step 4: Copy** (ID / EN), ditulis persis:

| key | ID | EN |
| --- | --- | --- |
| `home.greeting` | Mau main apa hari ini? | What shall we play today? |
| `game.ayo-berhitung.tagline` | Hitung bendanya, pilih angkanya. | Count the things, pick the number. |
| `game.menulis-angka.tagline` | Tebalkan angka 0 sampai 9. | Trace the numbers 0 to 9. |
| `game.susun-kata.tagline` | Susun huruf jadi kata. | Put letters together into a word. |
| `game.bunyi-awal.tagline` | Dengar kata, cari huruf awalnya. | Listen, then find the first letter. |
| `game.menulis-huruf.tagline` | Tebalkan huruf A sampai Z. | Trace the letters A to Z. |
| `game.dengar-temukan.tagline` | Dengar bunyinya, temukan hurufnya. | Listen and find the letter. |
| `game.tebalkan-hijaiyyah.tagline` | Tebalkan huruf hijaiyyah. | Trace hijaiyyah letters. |
| `game.kartu-kembar.tagline` | Cari dua kartu yang sama. | Find the matching pairs. |
| `game.petualangan-labirin.tagline` | Bantu Kuku menemukan jalan. | Help Kuku find the way. |

- [x] **Step 5: GameCard v2:**
  - **Struktur:** `<m.button>` berisi `.art` (panel `background: WORLDS[entry.worldId].palette.sky`, radius `var(--radius-tile)`, `ObjectImage` 96 di tengah, tinggi 140 px) → `.title` (Fredoka 600, `clamp(20px, 2.4vw, 26px)`, navy) → `.tagline` (Nunito 16 px, `var(--ink-500)`, maksimal 2 baris dengan `-webkit-line-clamp: 2`).
  - **Gaya kartu:** min-height 248 px, latar putih, `var(--side-white)`, padding `var(--space-4)`, gap `var(--space-3)`, rata kiri.
  - **Varian `compact`** (dan semua kartu ≤ 599 px): grid 2 kolom `96px 1fr`; `.art` 96×96 dengan `ObjectImage` 72; min-height 120.
  - **Kartu `soon`:** badge kunci tetap, opacity 0.6, shake tetap.
  - **Animasi:** hanya `pressProps(calm)` + hover desktop `@media (hover: hover) { .card:hover { transform: translateY(-2px) } }`.
- [x] **Step 6: HomePage:**
  - TopNav tetap: leftSlot stiker, rightExtra GrownUpGate.
  - Di bawahnya `<header className={styles.hero}>`: tombol MsZiya 72 px (logika giggle/hop dipertahankan) + `<h1 className="t-title">{t('home.greeting')}</h1>`. Mascot `position: fixed` dihapus.
  - `<main>` berisi `<ul className={styles.grid}>` dari `homeGameList(e => e.status === 'ready' && readiness(e.id).ready)`. Tiap `<li>` membungkus `GameCard`; klik → `navigate('/game/<id>/intro')`.
  - Grid: `max-width: 1120px; margin: 0 auto; gap: var(--space-5); padding: 0 var(--space-5) var(--space-6)`. Kolom: `1fr` (≤ 599 px), `repeat(2, 1fr)` (600–1023 px), `repeat(3, 1fr)` (≥ 1024 px).
  - Masuk bertahap: `opacity 0→1, y 12→0`, `delay: idx*0.03`, `DUR.base`; tanpa animasi bila calm.
  - Overlay unlock audio dipertahankan.
- [x] **Step 7: Routing & navigasi:**
  - `routes.tsx`: hapus `WorldPage`/`ValidatedWorldRoute`; `/dunia/:worldId` → `<Navigate to="/home" replace />`.
  - Intro back → `/home`; `PlayPage` ConfirmExit `onLeave` → `/home`.
  - Result: tombol yang tadinya ke dunia menjadi ikon `home` ke `/home`. Saran berasal dari `homeGameList(...)`: yang `playable`, bukan game ini, utamakan dunia yang sama, ambil 2, lalu render `GameCard layout="compact"`.
  - KitPage: hapus bagian WorldDoor.
  - Hapus folder `pages/World` dan `components/WorldDoor`.
- [x] **Step 8: E2e:**
  - `flows.spec.ts`: dari `/home` klik kartu "Ayo Berhitung" langsung (hapus langkah Padang Hitung).
  - `a11y.spec.ts` dan `touch.spec.ts`: ganti path `/dunia/angka` dengan `/home`.
  - Tambah ke `desktop.spec.ts` (semua proyek):
    - `old world URL redirects home`: buka `/dunia/angka` → URL `/home`;
    - `home shows all 9 games`: `getByRole('listitem')` berjumlah 9;
    - `home has no horizontal overflow`.
- [x] **Step 9:** `npm run build && npx playwright test` → semua proyek PASS. Quality gate. Commit `feat(home): show all games with short descriptions; remove world pages`. _(bagian commit dilewati: belum ada izin)_

---

### Task 8: Intro rapi

**Files:**
- Modify: `project/src/pages/Intro/IntroPage.tsx`, `IntroPage.module.css`
- Modify: `project/src/components/LevelPicker/LevelPicker.tsx`, `.module.css`; `project/src/components/PlayerPicker/PlayerPicker.tsx`, `.module.css`
- Modify: `project/src/i18n/id.ts`, `en.ts`

**Interfaces:**
- Consumes: `game.<id>.tagline` (Task 7) dan `Dialog` (`open`, `onClose`, `labelledBy`, `children`).
- Produces: i18n `intro.playersLabel` — ID "Berapa anak?", EN "How many players?". Key `intro.level` ("Pilih level") dipakai sebagai label level.

- [x] **Step 1: Struktur `IntroPage`**:
  - `Scene` → `TopNav` (back `/home`) → `<main className={styles.main}>`.
  - `main` berisi `<section className={styles.card}>` dengan dua kolom:
    - **`.info`:** lingkaran 200 px berlatar `palette.sky` + `ObjectImage` 140 (decorative), `h1.t-title` judul, `p.tagline` (18 px, `--ink-500`).
    - **`.setup`:** `h2.label` `intro.level` + `LevelPicker`; `h2.label` `intro.playersLabel` + `PlayerPicker`; `BlockButton primary/primary icon=play` dengan `className={styles.start}` (`width:100%`).
  - Di bawah kartu: `<button className={styles.grownUps}>` bertuliskan `intro.forGrownUps` (teks navy 16 px bergaris bawah, tinggi ≥ 44 px). Tombol ini membuka `Dialog` berisi `howTo`, `skills`, dan catatan a11y tracing.
  - Hapus `demoStage`, `replayBtn`, `HandHint`, `Slot`, `Tile`, dan state `demoKey`.
- [x] **Step 2: CSS:**
  - `.main`: `display:flex; justify-content:center; align-items:center; padding: var(--space-4) var(--space-5) var(--space-6)`.
  - `.card`: `width: min(100%, 960px); display:grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); padding: var(--space-6); background: var(--white); border-radius: var(--radius-card); box-shadow: var(--side-white)`.
  - `.info`: kolom rata tengah, teks center.
  - `@media (max-width: 899px)`: `grid-template-columns: 1fr`, lingkaran 140 px, `ObjectImage` 100, padding `var(--space-5)`.
  - Hapus blok `orientation: portrait`.
- [x] **Step 3: Picker:**
  - `.group`: `display:grid; gap: var(--space-3); width:100%`, dengan `grid-template-columns: repeat(3, 1fr)` (level) dan `repeat(2, 1fr)` (pemain).
  - `.option`: `min-height: var(--touch-choice)`, kolom ikon di atas label, latar putih, `var(--side-white)`.
  - `.selected` (keduanya sama): `background: var(--blue-500); color: var(--white); box-shadow: var(--side-blue)` + ikon check. Hapus varian pink.
  - Label level < 400 px boleh turun ke 18 px, tanpa wrap.
- [x] **Step 4:** Tambah ke `desktop.spec.ts` (semua proyek), `intro is tidy`:
  - buka `/game/susun-kata/intro`;
  - harapan: tombol "Mulai" terlihat di viewport tanpa scroll pada 1366×768 dan 1360×640 (set viewport di tes);
  - harapan: tidak ada horizontal overflow;
  - harapan: klik "Untuk pendamping" membuka `role="dialog"`.
- [x] **Step 5:** Quality gate + e2e. Commit `feat(intro): single centered card with equal-width pickers`. _(bagian commit dilewati: belum ada izin)_

---

### Task 9: Polesan game pilihan (G03, G04, G06)

**Files:**
- Modify: `project/src/games/susun-kata/SusunKataRound.tsx`
- Modify: `project/src/games/bunyi-awal/rounds.ts`, `rounds.test.ts`, `BunyiAwalRound.tsx`
- Modify: `project/src/games/dengar-temukan/DengarTemukanRound.tsx`

**Interfaces:**
- Produces: `InitialRound` tanpa field `showRest`.

- [x] **Step 1: Tes** `bunyi-awal/rounds.test.ts`: ganti dua asersi `showRest` menjadi `expect('showRest' in r).toBe(false)` untuk semua level. Jalankan `npx vitest run src/games/bunyi-awal` → FAIL.
- [x] **Step 2:** Hapus `showRest` dari `rounds.ts` → PASS. Di `BunyiAwalRound`, sisa huruf selalu tampil sebagai Tile putih berisi huruf.
- [x] **Step 3: G04 & G06 suara (K8):** hapus `audio.sfx('select')` di `handlePick`.
- [x] **Step 4: G06:**
  - Lulu bukan tombol lagi (pindah ke `.buddy`, Task 4);
  - satu-satunya pemicu suara adalah `HintBubble` besar di tengah `.prompt` dengan ikon `sound-on` 56.
- [x] **Step 5: G03:**
  - salah huruf hanya memutar `retry` (hapus `speak` huruf sebelum evaluasi);
  - huruf benar memutar `whoosh` + `speak` huruf;
  - hapus `layoutId` dari Tile (lompatan antar-kontainer terasa patah);
  - Tile yang masuk slot memakai `initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}` dengan `SPRING.gentle` (calm: tanpa animasi). Bungkus di `m.div` dalam `Slot` karena `Tile` tidak menerima props animasi tambahan.
- [x] **Step 6:** Quality gate + `npx playwright test e2e/flows.spec.ts`. Commit `fix(g03,g04,g06): one sound per event, no blank tiles, single listen button`. _(bagian commit dilewati: belum ada izin)_

---

### Task 10: Kartu Kembar — flip 3D yang benar

**Files:**
- Modify: `project/src/games/kartu-kembar/KartuKembarRound.tsx`, `KartuKembarRound.module.css`

- [x] **Step 1: Struktur kartu:**
  - `<button className={styles.card}>` (tanpa animasi; `pressProps` tetap) berisi `<m.div className={styles.inner} animate={{ rotateY: isOpen ? 180 : 0 }} transition={calm ? {duration:0} : SPRING.gentle}>`;
  - `.inner` berisi dua anak: `.back` (bintang, sisi tertutup) dan `.front` (`ObjectImage` + check), dengan `.front { transform: rotateY(180deg) }`;
  - kedua sisi: `position:absolute; inset:0; backface-visibility:hidden; -webkit-backface-visibility:hidden; display:flex; align-items:center; justify-content:center; border-radius: var(--radius-tile)`.
- [x] **Step 2: CSS:**
  - `.board`: `perspective: 900px; display:grid; gap: var(--space-3); width: min(100%, 720px)`; kolom `repeat(cols, minmax(72px, 1fr))` (inline style tetap).
  - `.card`: `aspect-ratio: 1; min-height: var(--touch-choice)` ≥ 88 px di tablet/desktop; di ≤ 599 px boleh 72 px bila kolom ≥ 4. Gunakan `min-width: 0` agar tidak overflow.
  - `.inner`: `transform-style: preserve-3d; width:100%; height:100%; position:relative`.
- [x] **Step 3:** Kuku pindah ke `.buddy` (Task 4). Board memakai lebar penuh `.prompt`.
- [ ] **Step 4: Verifikasi manual** (dev, desktop dan 390 px): flip memperlihatkan sisi belakang saat berputar, tidak ada teks cermin, dan pasangan cocok tetap terbuka. Jalankan `npx playwright test e2e/flows.spec.ts` (alur memori tetap lulus). Quality gate. Commit `fix(g08): proper 3D card flip`. ⏸ _manual/perangkat fisik, belum ada bukti_

---

### Task 11: Labirin — ketuk/geser papan dan label tombol

**Files:**
- Modify: `project/src/games/engines/maze/maze.ts`, `maze.test.ts`
- Modify: `project/src/games/petualangan-labirin/PetualanganLabirinRound.tsx`, `.module.css`
- Modify: `project/src/i18n/id.ts`, `en.ts`

**Interfaces:**
- Produces:
  ```ts
  export function dirFromTap(pos: readonly [number, number], cell: readonly [number, number]): MazeDir | null; // hanya tetangga langsung
  export function dirFromSwipe(dx: number, dy: number, minPx?: number): MazeDir | null; // default minPx 30, sumbu dominan
  ```
- Produces: i18n `maze.up`/`maze.down`/`maze.left`/`maze.right` — ID "Ke atas"/"Ke bawah"/"Ke kiri"/"Ke kanan", EN "Up"/"Down"/"Left"/"Right".

- [x] **Step 1: Tes gagal** `maze.test.ts`:

```ts
it('dirFromTap', () => { expect(dirFromTap([1, 1], [1, 0])).toBe('N'); expect(dirFromTap([1, 1], [2, 1])).toBe('E'); expect(dirFromTap([1, 1], [1, 2])).toBe('S'); expect(dirFromTap([1, 1], [0, 1])).toBe('W'); expect(dirFromTap([1, 1], [2, 2])).toBeNull(); expect(dirFromTap([1, 1], [1, 1])).toBeNull(); expect(dirFromTap([1, 1], [3, 1])).toBeNull(); });
it('dirFromSwipe', () => { expect(dirFromSwipe(40, 5)).toBe('E'); expect(dirFromSwipe(-40, 10)).toBe('W'); expect(dirFromSwipe(3, -50)).toBe('N'); expect(dirFromSwipe(0, 45)).toBe('S'); expect(dirFromSwipe(10, 12)).toBeNull(); });
```

- [x] **Step 2:** `npx vitest run src/games/engines/maze` → FAIL. Implementasi → PASS.
- [x] **Step 3: Round:**
  - grid papan mendapat `onPointerDown` (catat titik) dan `onPointerUp`;
  - bila `dirFromSwipe(dx, dy)` ≠ null → `move(dir)`;
  - bila tidak, cari sel di bawah pointer (`data-x`/`data-y` pada `.cell`, dicari via `closest('[data-x]')`) → `dirFromTap(pos, cell)` → `move`;
  - setiap `.cell` mendapat `data-x`, `data-y`; sel pemain juga mendapat `data-player="true"` dan `data-open-dirs` (huruf arah yang `canMove`, mis. `"ES"`), dipakai e2e;
  - `.grid { touch-action: none }`;
  - label D-pad memakai `maze.*`;
  - papan `width: min(100%, 520px); aspect-ratio: 1`;
  - D-pad di `.tray`.
- [x] **Step 4:** Tambah ke `desktop.spec.ts` (`chromium-desktop`), `maze accepts click on neighbour cell`:
  - buka `/game/petualangan-labirin/play?level=mudah&players=1&lang=id&seed=7`;
  - ambil sel tetangga yang terbuka dari posisi awal (baca `data-open-dirs` sel pemain, ambil arah pertama);
  - klik sel itu;
  - harapan: sel tersebut kini berisi Kuku (`[data-player="true"]`).
- [x] **Step 5:** Quality gate + e2e. Commit `feat(g09): tap or swipe on the board; arrow labels`. _(bagian commit dilewati: belum ada izin)_

---

### Task 12: Transisi halus dan aturan suara global

**Files:**
- Modify: `project/src/app/routes.tsx:122-139`
- Modify: `project/src/pages/Play/PlayPage.tsx:236-247`
- Modify: `project/src/games/ayo-berhitung/AyoBerhitungRound.tsx` (cek ulang K8; sudah di Task 5)

- [x] **Step 1: Transisi rute:**
  - `initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}`;
  - `transition={{ duration: calm ? 0 : DUR.fast, ease: EASE_OUT_SOFT }}`;
  - hapus `y`; `AnimatePresence mode="wait"` tetap.
- [x] **Step 2: Pergantian ronde di `PlayPage`:**
  - bungkus `RoundView` dengan `<AnimatePresence mode="wait">` dan `<m.div key={`${player}-${roundIndex}`} className={styles.roundWrap} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={calm ? { duration: 0 } : { duration: DUR.base, ease: EASE_OUT_SOFT }}>`;
  - `.roundWrap { width:100%; flex:1; display:flex; justify-content:center; min-height:0 }`.
- [x] **Step 3: Audit suara:** `grep -rn "sfx('select')" src/games` harus kosong. Pengecualian yang boleh: tap benda/kartu yang bukan jawaban (`flip`, `count-pop`, `step`).
- [ ] **Step 4: Verifikasi manual** di desktop dan 390 px: ⏸ _manual/perangkat fisik, belum ada bukti_
  - perpindahan halaman ≤ 200 ms tanpa lompatan vertikal;
  - ronde berganti dengan geser halus;
  - preferensi "Gerak tenang" (Pendamping) mematikan semuanya.

  Jalankan `npx playwright test` (semua proyek). Quality gate. Commit `feat(motion): calmer route and round transitions`.

---

### Task 13: Sinkronisasi dokumen + QA akhir

**Files:**
- Modify: `docs/design.md`:
  - §6.2 (kerangka: Arena v2);
  - §7.1 (hapus WorldDoor, GameCard v2);
  - §8 (alur: Beranda semua game → Intro → Arena; maksimal 2 ketukan);
  - §5.1 (dunia = tema warna, bukan halaman).
- Modify: `docs/specs/game-specs.md`:
  - §0.6 (diagram arena v2);
  - G01 (K5);
  - G02 + §T (K6, K7: tol 14/11/9, 2.5×, 15 sampel, 90 %, Ulangi, titik berdenyut);
  - G03/G04/G06/G08/G09 (Task 9–11).
- Modify: `docs/specs/content.md:104` (pool G02: 1–5 / 0–9 / 0–9).
- Modify: `docs/specs/copy.md` §2–§3 (key baru: `home.greeting`, `game.<id>.tagline`, `intro.playersLabel`, `trace.again`, `maze.*`; `howTo` baru).
- Modify: `docs/prd.md:48` (alur `Home` semua game, tanpa `World`).
- Modify: `docs/plan/2026-11-25-paud-redesign-plan.md` §8 Log (satu baris yang menunjuk plan ini).

- [x] **Step 1:** Perbarui dokumen di atas. `grep -rn "/dunia/\|WorldDoor\|Pintu Dunia\|10–20" docs --include=*.md | grep -v archive` hanya boleh menyisakan catatan historis di Log.
- [x] **Step 2: QA penuh:** `npm run lint && npm test && npm run build && npx playwright test` → semua hijau di 4 proyek. Tulis angka lulus/gagal aktual di Log.
- [ ] **Step 3: QA manual** di `npm run dev` (StrictMode aktif) dengan mouse pada 1366×768 dan 1360×640, plus DevTools 390×844 touch: ⏸ _manual/perangkat fisik, belum ada bukti_
  - beranda 3×3 / 2 kolom / 1 kolom rapi;
  - intro tanpa potongan;
  - G01 langsung bisa memilih;
  - G02/G05 bisa ditulis dengan mouse dan jari;
  - G08 flip mulus;
  - G09 bisa diketuk.
- [ ] **Step 4:** Commit `docs: sync design and specs with UX polish`. ⏸ _menunggu izin commit_

---

## Log

| Tanggal | Task | Catatan |
| --- | --- | --- |
| 2026-11-26 | — | Plan dibuat. Bug A1 direproduksi dengan Playwright (dev server, 1360×640): kanvas 0 piksel. |
| 2026-11-26 | Task 1–13 | Semua 13 task dieksekusi & terverifikasi: `npm run lint` (0 error), `npm test` (34 file, 97/97 lulus), `npm run build` (lulus, `index` 120.76 kB gzip), `npx playwright test` (4 proyek: 114 lulus, 14 skip per proyek, 0 gagal). Commit dilewati sesuai Global Constraints (belum ada izin commit). |
| 2026-11-26 | Audit | Centang disinkronkan dengan kode (lint 0 error, 47 file / 151 test lulus, build lulus). Tersisa: commit (izin) dan 4 verifikasi manual. |
