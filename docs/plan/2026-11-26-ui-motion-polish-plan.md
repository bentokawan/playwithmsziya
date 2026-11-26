# UI & Motion Polish (Intro, Hasil, Beranda, Halaman Sekunder) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

- Tanggal: 2026-11-26
- Status: ready
- Referensi: [room-hardening plan](2026-11-26-room-hardening-security-plan.md) (Intro v4, `GamePreview`), [design](../design.md)

**Goal:** Merapikan tampilan dan gerak di Intro, Hasil, Beranda, Pemain, Peringkat, Stiker, dan arena main supaya terasa hidup, jelas, dan konsisten — tanpa dependency baru.

**Architecture:** Gerak memakai `motion/react` (free, `LazyMotion` `domAnimation` strict, hanya `m.*`). Token gerak bersama di `src/design/motion.ts`. Latar halaman non-game memakai satu komponen dekoratif `PageBackdrop` (CSS + SVG ringan). Semua gerak punya frame akhir statis saat `useCalmMotion()` benar.

**Tech Stack:** React 19, TS 6, Vite 8, motion 14 (`motion/react`), CSS Modules, Vitest 5 (tanpa DOM env), Playwright 1.65 (proyek: `chromium-tablet`, `webkit-ipad`, `chromium-desktop`, `chromium-phone`, `chromium-online`).

## Spec (temuan audit, berlaku sebagai spec)

**A. Screenshot Intro yang "jelek".** Di screenshot, seluruh CSS module Intro tidak termuat (judul polos, tombol `?` bawaan browser, elemen selebar layar). Dev server baru (port 4176) dan build produksi merender Intro dengan benar → penyebabnya dev server lama yang kehilangan stylesheet setelah `IntroPage.module.css` ditulis ulang saat server berjalan (HMR). **Perbaikan pengguna:** hentikan lalu jalankan ulang `npm run dev` dan hard reload. **Perbaikan kode:** smoke test "gaya termuat" di semua halaman utama (Review Focus 1) agar kejadian serupa di build tertangkap.

**B. Intro (sudah ber-gaya) masih kurang:**
- B1 Kolom kiri menempel ke atas (`align-self: start`); kolom kanan di tengah → tidak seimbang, ruang kosong di kiri bawah.
- B2 Garis "tanah" pratinjau tampak seperti garis melayang; pratinjau kecil (± 150px) dibanding panel.
- B3 Glyph pratinjau tracing bersudut (polyline) dan jalur putih kontras rendah di langit biru muda.
- B4 Pratinjau hitung menganimasikan 16 node di level Menantang (> batas 12).

**C. Halaman Hasil:** Ms Ziya memakai ekspresi `wow` (mulut "O", tampak kaget) untuk "Hebat!"; stiker jenis karakter tampil sebagai lingkaran berisi `★` (placeholder); latar polos tanpa dunia game; tidak ada perayaan (konfeti, skor naik).

**D. Beranda:** latar polos `--sky-50`; enam tombol ikon tanpa teks di atas (guru sulit tahu Stiker/Peringkat/Pemain/Pengaturan); kartu muncul tanpa gerak dan tidak bereaksi saat disentuh.

**E. Pemain, Peringkat, Stiker:** latar polos; empty state hanya teks (Peringkat tanpa tombol aksi); stiker karakter = `★`; progres "0 dari 9" hanya teks.

**F. Arena main (desktop/tablet):** konten hanya mengisi ± 400px atas dari 768px; ubin jawaban 96px, separuh bawah kosong.

**G. Sisa minor dari eksekusi sebelumnya:** prompt putar layar tidak menghentikan jam lomba dan tidak memindahkan fokus; Level tertutup tombol Mulai di 740×360 (diterima, tidak dikerjakan).

## Global Constraints

- Tanpa dependency baru; GSAP/Tailwind/Motion+ tidak dipakai. Hanya `m.*` dari `motion/react`.
- Animasi hanya `transform`, `opacity`, dan `pathLength` SVG; maksimal 12 node beranimasi per komponen; semua `repeat` terbatas (tidak ada `Infinity` baru).
- `useCalmMotion()` benar → frame akhir langsung tampil, tanpa animasi berjalan.
- Target sentuh ≥ 48px; teks ≥ 4.5:1; copy baru di `src/i18n/id.ts` **dan** `en.ts`.
- Playwright default memakai `npm run preview` (folder `dist`) → **jalankan `npm run build` sebelum `npx playwright test`**.
- Jangan `git commit`/push tanpa izin; "checkpoint" = test hijau. Semua command dari `project/`.
- Game yang `playable=false` di build produksi (mis. `menulis-angka`, `tebalkan-hijaiyyah`) tidak dipakai di e2e halaman Intro; pakai `ayo-berhitung`.

## Review Focus

1. **Stylesheet halaman tidak termuat** (kasus screenshot) — panel Intro tetap putih, judul ≥ 32px. Test di Task 1 (Intro) dan Task 4 (Beranda/Pemain/Peringkat/Stiker).
2. **Calm motion** — konfeti, skor naik, dan stagger kartu langsung di frame akhir. Test di Task 2 dan Task 3.
3. **Hasil 2 anak / tanpa rekor pribadi** — tidak ada wajah kaget; konfeti sekali; kedua pemain tampil. Test di Task 2.
4. **HP 390×844 dan 740×360** — label nav dan layout Hasil tanpa scroll horizontal. Test di Task 3 dan Task 2.
5. **Stiker karakter** di Hasil dan Buku Stiker — gambar karakter dunia, bukan `★`. Test di Task 2.

---

### Task 1: Intro v5 — seimbang, pratinjau lebih besar dan halus

**Files:**
- Modify: `src/pages/Intro/IntroPage.module.css` (`.hero` `align-self: center`, `.heroStage` tinggi `clamp(180px, 30vh, 240px)`)
- Modify: `src/components/GamePreview/GamePreview.tsx` + `.module.css` (ganti `.ground` dengan `.halo`: lingkaran `radial-gradient` warna `--white` 55% → transparan, ukuran 86% stage, di belakang konten; bukan kotak)
- Create: `src/components/GamePreview/geometry.ts` (+ `geometry.test.ts`)
- Modify: `templates/Trace.tsx` (path halus), `templates/Count.tsx` (apel + badge dalam satu `m.div`)
- Test: `e2e/intro-preview.spec.ts`

**Interfaces:**
- Produces: `export function smoothPath(points: readonly (readonly [number, number])[]): string` — `''` untuk 0 titik; `M x y` untuk 1; `M … L …` untuk 2; ≥ 3 titik: `M` lalu segmen `Q` dengan titik kontrol = titik asli dan titik akhir = titik tengah antar-titik, ditutup `L` ke titik terakhir.

- [ ] **Step 1: Tes gagal.**
  - `geometry.test.ts`: `smoothPath([])` → `''`; `smoothPath([[0,0]])` → `'M 0 0'`; `smoothPath([[0,0],[10,0]])` → `'M 0 0 L 10 0'`; `smoothPath([[0,0],[10,0],[10,10]])` → `'M 0 0 Q 10 0 10 5 L 10 10'`.
  - `e2e/intro-preview.spec.ts` (desktop):
    - `test('intro styles are loaded')`: background panel setup `rgb(255, 255, 255)`; `font-size` `h1` ≥ 32px; tombol `?` `border-radius` = `50%` → `24px`.
    - `test('hero is vertically centered with the panel')`: |pusat-y `heroCopy`/stage − pusat-y panel| ≤ 80px.
    - `test('count preview animates at most 12 nodes')` (level Menantang, calm off): jumlah elemen `[data-preview] [style*="transform"], [data-preview] [style*="opacity"]` ≤ 12 setelah 100ms.
    - `test('preview stage is large')`: tinggi `[data-preview]` ≥ 180px.
- [ ] **Step 2:** `npx vitest run src/components/GamePreview` dan `npm run build && npx playwright test e2e/intro-preview.spec.ts --project=chromium-desktop` → FAIL.
- [ ] **Step 3:** Implementasi. Trace: guide & ink memakai `<path d={smoothPath(points)}>`; guide = putih 14px + `filter: drop-shadow(0 2px 0 rgb(27 37 89 / .15))`; ink = `--blue-500` 9px. Count: ukuran apel 88/64 (≤5 / >5).
- [ ] **Step 4:** Ulangi command Step 2 → PASS; seluruh `e2e/intro-preview.spec.ts` dan `e2e/flows.spec.ts` tetap hijau.

### Task 2: Hasil — perayaan, ekspresi tepat, stiker karakter

**Files:**
- Modify: `src/pages/Result/ResultPage.tsx` + `.module.css` (bungkus `<Scene worldId={entry.worldId}>`; mood maskot; konfeti; skor naik)
- Create: `src/components/Confetti/Confetti.tsx` (+ `.module.css`), `src/lib/motion/countUp.ts` (+ `countUp.test.ts`), `src/lib/motion/useCountUp.ts`
- Modify: `src/components/Sticker/Sticker.tsx` (jenis `character` → `<WorldCharacter worldId={def.worldId} mood="happy" size={Math.round(size*0.7)} />`)
- Modify: `src/worlds/characters/MsZiya.tsx` (tambah `data-mood={mood}` di elemen akar)
- Test: `src/lib/motion/countUp.test.ts`, Create: `e2e/result.spec.ts`

**Interfaces:**
- Produces:
  - `export function countUpValue(elapsedMs: number, target: number, durationMs: number): number` — integer, easing out-cubic, `0` di 0ms, `target` di ≥ `durationMs`, tidak pernah > `target`, `target ≤ 0` → `0`.
  - `export function useCountUp(target: number, durationMs: number): number` — memakai `requestAnimationFrame`; `useCalmMotion()` benar → langsung `target`.
  - `export function resultMood(o: { readonly isPersonalBest?: boolean }): 'happy' | 'wow'` (di `ResultPage.tsx` atau `src/pages/Result/resultMood.ts`) — `'wow'` hanya bila rekor pribadi, selain itu `'happy'`.
  - `Confetti({ burst }: { burst: boolean })` — 12 kepingan (`m.span`), sekali jalan ±1.2s, `aria-hidden`, `data-confetti`; calm → tidak dirender.

- [ ] **Step 1: Tes gagal.**
  - `countUp.test.ts`: `countUpValue(0, 9, 900)` → `0`; `(900, 9, 900)` → `9`; `(5000, 9, 900)` → `9`; `(450, 9, 900)` antara 1 dan 8; nilai monoton naik pada 0..900 per 50ms; `(100, 0, 900)` → `0`.
  - `resultMood` di file test yang sama (pindahkan ke `src/pages/Result/resultMood.ts`): `{isPersonalBest:true}` → `'wow'`; `{}` → `'happy'`.
  - `e2e/result.spec.ts` (selesaikan sesi `ayo-berhitung` via `window.__MSZ_TEST__.solveRound`, seperti `e2e/flows.spec.ts`):
    - `test('result celebrates with confetti and a happy mascot')` (calm off): `[data-confetti]` ada; `svg[data-mood="happy"]` atau `[data-mood="wow"]` hanya jika rekor pribadi; skor akhir teks = `9 poin` setelah 1.5s.
    - `test('calm result shows final score immediately')` (calm on): `[data-confetti]` count 0; teks `9 poin` tampil < 300ms setelah halaman Hasil muncul.
    - `test('character sticker renders the world character, not a star')`: seed `localStorage['msz:stickers']` dengan `angka-01`, buka `/stiker` → kartu stiker pertama tidak berisi teks `★` dan berisi `svg`.
    - `test('two-player result shows both players without a surprised face')` (`players=2`, `mode=giliran`): dua kartu pemain; `[data-mood="wow"]` hanya bila rekor pribadi.
    - `test('result has no horizontal scroll on 390x844')`: `scrollWidth <= 390`.
- [ ] **Step 2:** `npx vitest run src/lib/motion src/pages/Result` dan `npm run build && npx playwright test e2e/result.spec.ts` → FAIL.
- [ ] **Step 3:** Implementasi. Konfeti hanya saat Hasil pertama kali tampil (bukan saat kembali dari Peringkat); warna dari `--sun-400`, `--pink-400`, `--blue-500`, `--green-400`; arah acak memakai `createRng(seed)` dari `lib/random` (seed dari `finishedAt`).
- [ ] **Step 4:** Ulangi Step 2 → PASS.

### Task 3: Beranda — latar, label nav, gerak kartu

**Files:**
- Create: `src/components/PageBackdrop/PageBackdrop.tsx` (+ `.module.css`)
- Modify: `src/pages/Home/HomePage.tsx` + `.module.css`, `src/components/GameCard/GameCard.tsx` (+ css)
- Modify: `src/design/motion.ts`
- Test: `e2e/flows.spec.ts` (atau Create `e2e/home.spec.ts`)

**Interfaces:**
- Produces:
  - `PageBackdrop({ children }: { children: ReactNode })` — latar gradien `--sky-100` → `--sky-50`, 3 awan SVG statis di atas, pita bukit SVG di bawah (tinggi ≤ 18vh, `aria-hidden`), `data-backdrop`; konten di atasnya.
  - `design/motion.ts`: `export const STAGGER_S = 0.04`; `export const ENTER = { opacity: 0, y: 12 } as const`; `export function enterProps(calm: boolean, index: number)` → `{ initial: calm ? false : ENTER, animate: { opacity: 1, y: 0 }, transition: calm ? { duration: 0 } : { ...SPRING.gentle, delay: Math.min(index, 9) * STAGGER_S } }`.
- Label nav: tombol Stiker, Peringkat, Pemain, Pengaturan menampilkan teks (`hideLabel={false}`) pada lebar ≥ 1024px; < 1024px tetap ikon dengan `aria-label`. Suara & layar penuh tetap ikon.
- Kartu: `enterProps(calm, index)`; `whileHover` `{ y: -4 }` hanya `@media (hover: hover)` (pakai `matchMedia('(hover: hover)')` sekali); tekan memakai `pressProps(calm)`.

- [ ] **Step 1: Tes gagal** (`e2e/home.spec.ts`):
  - `test('home has a backdrop and loaded styles')`: `[data-backdrop]` ada; judul `Mau main apa hari ini?` `font-size` ≥ 28px.
  - `test('nav shows text labels on desktop')` (desktop): tombol berteks `Stiker` dan `Peringkat` terlihat.
  - `test('nav stays icon-only and fits on phone')` (`chromium-phone`): `scrollWidth <= 390`; tombol Peringkat punya `aria-label`.
  - `test('calm home cards are visible immediately')` (calm on): semua kartu `opacity` `1` saat load.
- [ ] **Step 2:** `npm run build && npx playwright test e2e/home.spec.ts` → FAIL.
- [ ] **Step 3:** Implementasi; `HomePage` dibungkus `PageBackdrop`.
- [ ] **Step 4:** PASS; `e2e/a11y.spec.ts` dan `e2e/flows.spec.ts` tetap hijau.

### Task 4: Pemain, Peringkat, Stiker — latar, empty state, progres

**Files:**
- Modify: `src/pages/Players/*`, `src/pages/Leaderboard/*`, `src/pages/Stickers/*` (bungkus `PageBackdrop`; hapus `background: var(--sky-50)` di css halaman)
- Create: `src/components/EmptyState/EmptyState.tsx` (+ css)
- Test: `e2e/leaderboard.spec.ts`, `e2e/profiles.spec.ts`, Create `e2e/stickers.spec.ts`

**Interfaces:**
- Consumes: Task 3 `PageBackdrop`, `enterProps`.
- Produces: `EmptyState({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void })` — `MsZiya mood="happy" size={96}` + pesan + `BlockButton` opsional, `data-empty-state`.
- Copy: `leaderboard.emptyAction`: `Ayo main` / `Let's play` (→ `/home`).
- Stiker: progres per dunia = bar (`role="progressbar"`, `aria-valuenow`, `aria-valuemax=9`) + teks lama.

- [ ] **Step 1: Tes gagal:**
  - `leaderboard.spec.ts`: `test('empty leaderboard offers a play button')` → klik `Ayo main` → URL `/home`.
  - `profiles.spec.ts`: `test('empty players page shows mascot empty state')` → `[data-empty-state]` ada.
  - `stickers.spec.ts`: `test('sticker book shows progress bars')` → 4 `[role="progressbar"]`; `test('pages share the backdrop')` → `[data-backdrop]` di `/pemain`, `/peringkat`, `/stiker`.
- [ ] **Step 2:** `npm run build && npx playwright test e2e/leaderboard.spec.ts e2e/profiles.spec.ts e2e/stickers.spec.ts` → FAIL.
- [ ] **Step 3:** Implementasi.
- [ ] **Step 4:** PASS; `e2e/a11y.spec.ts` hijau.

### Task 5: Arena — memakai ruang layar besar

**Files:**
- Modify: css arena bersama (`arenaStyles` yang diimpor `src/games/*/…Round.tsx`; cari dengan `grep -rn "arenaStyles" src/games`), `src/components/Tile/Tile.module.css`

**Aturan:** bila tinggi viewport ≥ 700px dan mode bukan `layar`: arena (soal + baki) dipusatkan vertikal di ruang di bawah TopNav; ubin jawaban `clamp(96px, 14vh, 128px)`; kartu soal tumbuh proporsional (`max-width: min(880px, 70vw)`). Mode `layar` dan layar < 700px tidak berubah.

- [ ] **Step 1: Tes gagal** (`e2e/desktop.spec.ts`, `chromium-desktop` 1366×768): `test('solo arena uses the screen')` → tinggi ubin jawaban pertama ≥ 104px dan sisi bawah baki ≥ 0.5 × 768.
- [ ] **Step 2:** `npm run build && npx playwright test e2e/desktop.spec.ts --project=chromium-desktop` → FAIL.
- [ ] **Step 3:** Implementasi CSS saja.
- [ ] **Step 4:** PASS; `e2e/split.spec.ts`, `e2e/touch.spec.ts`, `e2e/phone-split.spec.ts` tetap hijau (layar dibagi tidak berubah).

### Task 6: Prompt putar layar — jam berhenti & fokus

**Files:**
- Modify: `src/pages/Play/SplitPlay.tsx` (`promptOpen` menghentikan countdown/last-call), `src/components/RotatePrompt/RotatePrompt.tsx` (fokus ke tombol bergiliran saat muncul), panes diberi `inert` selama prompt terbuka
- Test: `e2e/phone-split.spec.ts`

- [ ] **Step 1: Tes gagal:**
  - `test('rotate prompt focuses the take-turns button and blocks the panes')`: tablet portrait 768×1024 di URL split → `document.activeElement` = tombol `Main bergantian saja`; `[data-pane="1"]` punya atribut `inert`.
  - `test('last-call timer pauses while the prompt is open')`: `page.clock.install()`; pemain 1 selesai (`solveRound` sampai `[data-last-call]` muncul); putar ke 768×1024; `page.clock.runFor(10_000)`; teks detik pada banner tidak berubah.
- [ ] **Step 2:** `npm run build && npx playwright test e2e/phone-split.spec.ts` → FAIL.
- [ ] **Step 3:** Implementasi.
- [ ] **Step 4:** PASS.

### Task 7: Dokumen, screenshot, QA

**Files:** `docs/design.md` (Intro v5, Hasil, Beranda, PageBackdrop, token gerak), plan ini (Log), `e2e/__screenshots__`

- [ ] **Step 1:** Perbarui `design.md`; catat token `STAGGER_S`, `ENTER`, `enterProps`, aturan konfeti.
- [ ] **Step 2:** `npm run lint && npm test && npm run build && npx playwright test` → semua hijau; perbarui baseline screenshot hanya setelah tinjauan visual di 1366×768, 1024×768, 740×360, 390×844; catat angka aktual di Log.
- [ ] **Step 3:** QA manual di tablet & HP fisik (gerak terasa halus, tidak mengganggu, calm motion benar) — perlu perangkat, catat di Log.

---

## Audit plan lama (status per 2026-11-26)

| Plan | Belum beres | Jenis |
|---|---|---|
| Semua plan 2026-11-26 | ±20 langkah commit | Menunggu izin/aksi Anda (repo masih 3 commit awal, 92 perubahan belum di-commit) |
| `cms-admin` | C0.1 catatan region/signup/domain di Log; C7.1 isi hijaiyyah; C7.4 uji RLS (opsional) | Manusia |
| `paud-redesign` | T5.6 & T7.6 uji dengan anak/perangkat; T6.3 audio lewat CMS; T6.4 review hijaiyyah; T7.8 rilis; DoD per game (templat) | Manusia / izin |
| `multiplayer-profiles` | Uji sentuh 2 anak di tablet fisik | Perangkat fisik |
| `dual-mode-entry-sync` | Uji 2 perangkat dengan Supabase | Izin + fitur on-hold |
| `ux-polish` | 4 verifikasi manual di browser/perangkat | Manual |
| `room-hardening-security` | QA HP fisik; H1–H6 (keamanan room, persetujuan host, klaim kode, co-op, mode berhadapan, spike multi-touch) | Perangkat / On-Hold |
| Eksekusi terakhir | Prompt putar (jam & fokus) → **Task 6 plan ini**; 16 node pratinjau hitung → **Task 1**; Level tertutup di 740×360 → diterima | Kode |

## Log

- 2026-11-26: Plan dibuat dari audit screenshot Intro (CSS tidak termuat di dev server lama; build & dev server baru normal) dan tangkapan layar Beranda, Arena, Layar dibagi, Hasil, Pemain, Peringkat, Stiker, Splash pada 1366×768.
