# Fokus 1 Perangkat, Rapikan Intro & Room Hardening (On-Hold) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

- Tanggal: 2026-11-26 (revisi 3: intro lega + pratinjau animasi)
- Status: **Fase Aktif selesai (kode)** — sisa: QA HP fisik, commit (izin). **Fase Berikutnya (On-Hold)** tidak dieksekusi
- Referensi: [dual-mode-entry-sync-plan](2026-11-26-dual-mode-entry-sync-plan.md) (protokol v2, sudah terimplementasi)

**Goal:** Mode 2 pemain difokuskan ke satu perangkat (layar dibagi / bergiliran) supaya profil & skor terpusat; fitur 2 perangkat disembunyikan di balik feature flag; halaman Intro disederhanakan; HP bisa main berdua dalam landscape.

**Architecture:** Kode room (Supabase Realtime / BroadcastChannel) **tidak dihapus**, hanya dimatikan lewat satu titik: `isOnlineConfigured()` juga mensyaratkan flag `VITE_FEATURE_ONLINE_ROOM=1`. Kelayakan layar dibagi berubah dari "lebar ≥ 900" menjadi aturan orientasi-aware per game. Intro menjadi satu panel tanpa langkah bernomor.

**Tech Stack:** React 19, TS 6, Vite 8, React Router 7, Motion 14, CSS Modules, Vitest 5, Playwright 1.65.

## Keputusan (berlaku sebagai spec)

**K1 — Hold 2 Perangkat.** Semua UI 2 perangkat hilang saat flag mati (default): pilihan "Main di mana?", tombol "Gabung teman" di Home, route `/game/:id/ruang`, `/gabung`, `/gabung/:code` → redirect. Kode & test room tetap hidup; project Playwright `chromium-online` menyalakan flag.

**K2 — Mode 2 pemain di satu perangkat.**
| Mode | Kapan | Status |
|---|---|---|
| **Layar dibagi (lomba)** | Default "2 anak" bila game & layar mendukung | Aktif (sudah ada) |
| **Bergiliran (pass-and-play)** | Otomatis untuk game yang tidak cocok dibagi (G04/G06/G08) atau anak memilihnya di layar putar HP | Aktif (sudah ada, `play.turn` "Giliran {name}!") |
| **Kerja sama (co-op)** | Dua anak mengisi satu skor tim; tanpa pemenang | **Fase Berikutnya** — paling cocok untuk PAUD (tanpa rasa kalah), tapi butuh skor & layar Hasil baru |

Tidak ada pilihan mode tambahan di Intro (tetap: 1 anak / 2 anak).

**K3 — HP & orientasi (direvisi setelah review).** Rencana awal: split landscape di HP (A). Pengukuran di 740×360 menunjukkan pane arena + baki jawaban setinggi 626–838 px (G01 626, G02 630, G09 734, G03 838), jadi baki jawaban berada di bawah layar dan dua anak harus scroll halaman bersama. Tata letak game tidak diubah di task ini, maka:
- **Dipilih:** HP selalu **bergiliran** untuk 2 anak (Intro memberi catatan). Layar dibagi butuh `vp.h >= SPLIT_MIN_HEIGHT (600)` dan `vp.w >= splitMinWidth (default 900)`.
- Tablet portrait yang akan muat setelah diputar: split + prompt "Putar layarmu ke samping" + tombol "Main bergantian saja". Layar kecil yang tidak muat walau diputar: prompt "Layar ini kurang lega…" + tombol bergiliran.
- Split di HP landscape (A) dan portrait berhadapan (B) → Fase Berikutnya (H6), membutuhkan tata letak pane adaptif per game.

**K4 — Intro: lega, tanpa kotak di kiri, dengan pratinjau animasi per game** (revisi 3, dari audit screenshot).

Temuan dari screenshot: (1) kolom kiri dan panel kanan hanya berjarak 24px dan Level hampir menempel Mulai; (2) judul dibungkus kartu bukit hijau + bayangan yang menyaingi panel; (3) ikon apel statis, tidak menjelaskan game; (4) label 14px dan 5 grup rapat.

```
[←]                                                    [🔊] [⛶]

   ·  ·  🍎 🍎 🍎   ← pratinjau animasi (tanpa kotak)
        ( 1 · 2 · 3 )
                                         Siapa yang main?
   Ayo Berhitung  (?)                    ( 1 anak | 2 anak )
   Hitung bendanya, pilih angkanya.      [🐰 Gavin]  [🐰 Zia]

                                         Level
                                         [★ Mudah][★★ Sedang][★★★ Menantang]

                                         [ ▶  Mulai berdua              ]
```

| Aspek | Keputusan |
|---|---|
| Kolom kiri | **Tanpa** kartu/background/bayangan/`WorldBackground` pembungkus; teks langsung di kanvas `Scene`. Kontras dijaga `text-shadow: 0 2px 0 rgb(255 255 255 / .7)` dan teks diletakkan di area langit (bukan di garis bukit). Tombol "?" tetap di samping judul. |
| Jarak | Gap kolom `clamp(var(--space-6), 5vw, 72px)` (token terbesar `--space-7` = 48px); padding panel `var(--space-5)`, `var(--space-6)` di ≥1024px; antar-grup `var(--space-6)`; dalam grup `var(--space-3)`; Mulai terpisah dari Level oleh jarak antar-grup. Kolom 5fr/6fr. |
| Hierarki | Satu hal dominan: **Mulai** (tinggi 80px). Level (72px) sekunder. "1/2 anak" dan slot profil (56px) tersier. Label grup 16px/700, navy penuh (≥ 4.5:1). Chip slot profil memakai cincin warna pemain agar nyambung dengan pane layar dibagi. |
| Tanpa layout shift | Slot pemain ke-2 selalu menempati ruangnya; pada "1 anak" tampil redup + `aria-disabled` (bukan hilang). |
| Responsif | ≥1024: 2 kolom penuh. 700–1023: 2 kolom, pratinjau mengecil (`clamp`). Lebar <700 atau tinggi <480 (HP landscape 740×360, lihat K3): pratinjau jadi ikon statis 56px, judul 1 baris, panel boleh scroll internal dengan tombol Mulai `position: sticky; bottom: 0`. |
| Alur | Toggle 1/2 anak, lalu profil, level, Mulai. Tidak ada elemen baru. |

**Pratinjau kontekstual per game.** Komponen `GamePreview` menyesuaikan materi game yang dibuka. Tanpa dependency baru: `motion/react` sudah ada; GSAP dan Tailwind tidak dipakai karena tidak ada di proyek dan Motion sudah mencukupi.

| Game | Template | Animasi (diputar sekali saat masuk, lalu diam; diulang saat level diganti) |
|---|---|---|
| G01 Ayo Berhitung | `count` | Apel muncul satu per satu (stagger 0.35s, spring), tiap muncul angka 1·2·3 menyala bergantian; jumlah apel 3/5/8 untuk Mudah/Sedang/Menantang (nilai khusus pratinjau, bukan aturan game). |
| G02 Menulis Angka, G05 Menulis Huruf, G07 Tebalkan Hijaiyyah | `trace` | Garis angka/huruf tergambar (`pathLength` 0 ke 1) mengikuti glyph asli di `src/content/glyphs/*` (digit `3`, `a`, `ا`), titik awal berdenyut, titik "jari" bergerak di jalur. |
| G03 Susun Kata | `letters` | Ubin huruf B-A-L terbang ke slot berurutan, lalu `ObjectImage` bola memantul. |
| G04 Bunyi Awal | `sound` | Gelombang suara (cincin membesar dan memudar) dari bola, ubin "B" bergoyang. |
| G06 Dengar & Temukan | `sound` | Gelombang dari lentera, ikon suara berdenyut. |
| G08 Kartu Kembar | `memory` | Dua kartu berputar (`rotateY` 0 ke 180) menampilkan kucing yang sama, lalu goyang senang. |
| G09 Petualangan Labirin | `maze` | Titik menyusuri jalur SVG (`pathLength`) menuju wortel, wortel membesar saat tiba. |

Aturan motion (semua pratinjau dan elemen Intro):
- Hanya `transform`, `opacity`, dan `pathLength` SVG; tanpa animasi `width/height/top/left`. Maksimum 12 node beranimasi.
- `useCalmMotion()` benar: **frame akhir statis** (semua apel tampil, glyph tergambar penuh), tanpa loop dan tanpa pulsa Mulai.
- Pratinjau `aria-hidden="true"`, tidak fokus, tidak menangkap sentuhan; dimuat lewat `React.lazy` agar chunk Intro tidak membengkak.
- Masuk halaman: kolom kiri naik-fade `DUR.fast` (stagger 60ms), panel masuk dari kanan 12px; toggle 1/2 anak memakai pil geser (`layoutId`, transform saja); pulsa halus `scale 1 ke 1.02` (2.4s) pada Mulai hanya bila pilihan lengkap dan tidak calm; tekan = `scale .97`.
- Audit MotionScore tidak tersedia (server Motion+ belum login). Gantinya: Performance panel (tanpa long task > 50ms, tanpa layout shift) dan tes e2e di Task 3.

**K5 — Dipertahankan dari plan lama:** wake lock (berguna untuk layar dibagi), `navigator.storage.persist()`, validasi `parseOutcome` di Result.

## Global Constraints

- Jangan `git commit`/push/deploy, jangan tambah dependency, jangan sentuh project Supabase sungguhan tanpa izin eksplisit user. "Checkpoint" = jalankan test.
- Jangan menghapus file di `src/lib/room/`, `src/pages/Room/`, `e2e/online.spec.ts`.
- Copy baru wajib ada di `src/i18n/id.ts` **dan** `src/i18n/en.ts`.
- Target sentuh ≥ 48px; tombol Mulai tetap ukuran `primary`.
- `useCalmMotion` tetap dihormati di semua animasi baru.
- Semua command dari `project/`. Semua test lama tetap hijau (selector/screenshot boleh diperbarui, bukan dihapus).

## Review Focus

1. **Pengguna lama dengan `msz:intro:last` `place:'dua'`** — Intro tetap terbuka di mode 1 perangkat, tidak blank. Test di Task 1.
2. **Tautan lama `/gabung/1234` dibuka saat flag mati** — diarahkan ke Home, tidak error. Test di Task 1.
3. **HP diputar ke portrait di tengah permainan berdua** — overlay putar muncul, permainan tidak reset; diputar balik → lanjut. Test di Task 2.
4. **Game tidak muat di pane 320px** — game itu otomatis memakai bergiliran di HP, bukan tampilan terpotong. Test di Task 2.
5. **Profil kosong / 2 anak tanpa profil** — Mulai tetap aktif, slot kosong jadi Tamu (perilaku lama) di layout baru. Test di Task 3.

---

## Fase Aktif

### Task 1: Feature flag — hold 2 Perangkat

**Files:**
- Modify: `src/lib/env.ts` (`AppEnv.onlineRoom: boolean` ← `source.VITE_FEATURE_ONLINE_ROOM === '1'`)
- Modify: `src/lib/room/supabaseTransport.ts` (`isOnlineConfigured()` → `false` bila `!readEnv().onlineRoom`, berlaku juga untuk transport `local`)
- Modify: `src/app/routes.tsx:112-120` (route room dibungkus `<OnlineGate>`; flag mati → `<Navigate to="/home" replace />`)
- Modify: `playwright.config.ts` (webServer port 4174 `env.VITE_FEATURE_ONLINE_ROOM: '1'`)
- Modify: `.env.example` bila ada (tambah `VITE_FEATURE_ONLINE_ROOM=0`)
- Test: `src/lib/env.test.ts` (buat bila belum ada), `e2e/flows.spec.ts`

**Interfaces:**
- Produces: `AppEnv.onlineRoom: boolean`; `OnlineGate({ children }: { children: ReactNode }): ReactElement` di `src/app/OnlineGate.tsx`. Intro & Home tidak berubah kodenya — mereka sudah bergantung pada `isOnlineConfigured()`.

- [x] **Step 1: Test gagal:**
  - `readEnv({ VITE_FEATURE_ONLINE_ROOM: '1' }).onlineRoom === true`; `readEnv({}).onlineRoom === false`; `'true'` → `false` (hanya `'1'`).
  - e2e (project `chromium-tablet`, port 4173): `test('online UI hidden when flag off')` — Home tidak punya tombol berlabel `nav.joinRoom`; Intro tidak punya teks `intro.whereToPlay`; `page.goto('/gabung/1234')` → URL berakhir `/home` (Review Focus 2).
  - e2e: `test('old intro state place dua falls back to one device')` — set `localStorage['msz:intro:last'] = {schemaVersion:2, place:'dua', count:1, ids:[null,null]}` → Intro menampilkan tombol Mulai (Review Focus 1).
- [x] **Step 2:** `npx vitest run src/lib/env.test.ts` dan `npx playwright test e2e/flows.spec.ts --project=chromium-tablet` → FAIL.
- [x] **Step 3:** Implementasi.
- [x] **Step 4:** `npm test && npx playwright test` → PASS (termasuk `chromium-online` dengan flag nyala).

### Task 2: Layar dibagi butuh layar tinggi + prompt putar/kecil (HP = bergiliran)

**Files:**
- Modify: `src/games/catalog.ts:137-163` (`CatalogEntry.splitMinWidth?: number`, `availableModes`, `resolveLocalMode`)
- Create: `src/lib/device/viewport.ts` (`useViewport(): { w: number; h: number }`, mengganti `useState/resize` di `IntroPage.tsx`)
- Create: `src/components/RotatePrompt/RotatePrompt.tsx` (+ `.module.css`)
- Modify: `src/pages/Play/SplitPlay.tsx`, `src/pages/Intro/IntroPage.tsx`
- Test: `src/games/catalog.test.ts`, Create: `e2e/phone-split.spec.ts`

**Interfaces:**
- Produces:
  - `export interface Viewport { readonly w: number; readonly h: number }`
  - `export function splitFits(entry: CatalogEntry, vp: Viewport): boolean` — `vp.w >= 900 || (vp.w > vp.h && vp.w >= (entry.splitMinWidth ?? 640) && vp.h >= 340)`
  - `availableModes(entry, vp: Viewport, onlineConfigured)` — `layar` bila `splitFits` (signature lama `viewportWidth: number` diganti; perbarui semua pemanggil)
  - `resolveLocalMode(entry, players, vp: Viewport): { mode: 'solo'|'layar'|'giliran'; fallback: boolean; needsRotate: boolean }` — `needsRotate = mode==='layar'` dari kondisi `splitFits(entry, {w: vp.h, h: vp.w}) && !splitFits(entry, vp)`
  - `RotatePrompt({ onTurns }: { onTurns: () => void })`
- Copy: `play.rotate`: `Putar HP-mu ke samping untuk main berdua` / `Turn your phone sideways to play together`; `play.rotateTurns`: `Main bergantian saja` / `Take turns instead`; `intro.rotateHint`: `Nanti putar HP ke samping ya` / `You'll turn your phone sideways`.

- [x] **Step 1: Test unit gagal** di `catalog.test.ts`:
  - `splitFits(G01, {w:740,h:360}) === true`; `{w:360,h:740}` → `false`; `{w:1024,h:768}` → `true`; `{w:640,h:320}` → `false` (tinggi < 340).
  - `resolveLocalMode(G01, 2, {w:390,h:844})` → `{mode:'layar', fallback:false, needsRotate:true}`; `resolveLocalMode(G04, 2, {w:740,h:360})` → `{mode:'giliran', fallback:true, needsRotate:false}`; 1 pemain → `solo`.
- [x] **Step 2:** `npx vitest run src/games/catalog.test.ts` → FAIL.
- [x] **Step 3:** Implementasi. `SplitPlay`: render `RotatePrompt` (overlay penuh, tidak me-unmount pane → state permainan utuh) selama `vp.w < vp.h && !splitFits(entry, vp)`; `onTurns` → `navigate` ke URL sesi yang sama dengan `mode=giliran` (`replace: true`). Intro: tampilkan `intro.rotateHint` satu baris bila `needsRotate`; `handleStartLocal` memanggil `screen.orientation?.lock?.('landscape')` dalam `try/catch` + `.catch(() => {})`.
- [x] **Step 4:** Unit PASS. Buat `e2e/phone-split.spec.ts` (jalan di project `chromium-phone`; spec memakai `test.use({ viewport: { width: 740, height: 360 } })`):
  - Untuk tiap game dengan `layar` di `modes`: buka sesi `mode=layar&players=2` → `document.documentElement.scrollWidth <= 740` dan semua tombol jawaban di kedua pane `boundingBox().width >= 48` (Review Focus 4). Game yang gagal → set `splitMinWidth: 900` di `catalog.ts` (jangan ubah layout game di task ini), test untuk game itu mengharapkan Intro memilih `giliran`.
  - `test('rotate to portrait mid-game shows prompt and keeps progress')` — jawab 1 ronde, `setViewportSize(360×740)` → teks `play.rotate` tampil; balik `740×360` → indikator ronde tetap ronde 2 (Review Focus 3).
  - `test('rotate prompt can switch to turns')` → klik `play.rotateTurns` → URL berisi `mode=giliran`, teks `play.turn` tampil.
- [x] **Step 5:** `npm test && npx playwright test` → PASS.

### Task 3: Intro lega + pratinjau animasi per game

**Files:**
- Modify: `src/pages/Intro/IntroPage.tsx`, `src/pages/Intro/IntroPage.module.css` (hapus `.hero` kartu, `heroBg`, `mascotBubble`, `stepNum`, `stepCard`)
- Create: `src/components/GamePreview/GamePreview.tsx`, `GamePreview.module.css`, `previews.ts` (`PREVIEW_BY_GAME`), `templates/{Count,Trace,Letters,Sound,Memory,Maze}.tsx`
- Modify: `src/components/LevelPicker/LevelPicker.tsx` (+ css), `src/components/Roster/PlayerSlots.tsx` (+ css)
- Test: `src/components/GamePreview/previews.test.ts`, `e2e/flows.spec.ts`, `e2e/a11y.spec.ts`, `e2e/__screenshots__`

**Interfaces:**
- Consumes: Task 2 `resolveLocalMode(...).needsRotate`, `useViewport`; `useCalmMotion()`; glyph di `src/content/glyphs/*`; `ObjectImage`.
- Produces:
  - `export type PreviewTemplate = 'count' | 'trace' | 'letters' | 'sound' | 'memory' | 'maze'`
  - `export interface PreviewSpec { readonly template: PreviewTemplate; readonly objectId: string; readonly glyph?: string }`
  - `export const PREVIEW_BY_GAME: Record<GameId, PreviewSpec>` (mencakup **semua** `GameId`)
  - `export function previewCount(level: DifficultyId): 3 | 5 | 8`
  - `GamePreview({ gameId, level }: { gameId: GameId; level: DifficultyId }): ReactElement` (`aria-hidden`, memakai `useCalmMotion()`)
  - `LevelPicker` prop `size?: 'default' | 'compact'`

- [x] **Step 1: Tes gagal.**
  - `previews.test.ts`: kunci `PREVIEW_BY_GAME` sama dengan semua `GameId` di `CATALOG`; template `trace` hanya untuk game ber-`mechanic: 'tracing'`; `previewCount('mudah'|'sedang'|'menantang')` = `3|5|8`; tiap `glyph` ada di `src/content/glyphs/*`.
  - `e2e/flows.spec.ts` (`chromium-desktop`, 1366×768):
    - `test('intro has no step numbers, no hero card, one start button')`: `[class*="stepNum"]` dan `[class*="mascotBubble"]` count `0`; container judul `h1` punya `box-shadow: none` dan background transparan (`getComputedStyle`); tepat satu tombol `intro.start`/`intro.startBoth`.
    - `test('intro spacing is generous')`: jarak horizontal container judul ke panel >= 40px; jarak vertikal blok Level ke tombol Mulai >= 24px; tinggi Mulai >= 72px.
    - `test('preview follows the game')`: `ayo-berhitung` punya `[data-preview="count"]` dengan 3 `[data-preview-item]`; klik Level "Sedang" jadi 5; `menulis-angka` punya `[data-preview="trace"]`; `kartu-kembar` punya `memory`.
    - `test('calm motion renders final static frame')`: `page.emulateMedia({ reducedMotion: 'reduce' })`, semua `[data-preview-item]` ber-`opacity` `1` seketika dan `document.getAnimations().length === 0`.
    - `test('start button does not shift when switching 1/2 kids')`: `boundingBox().y` tombol Mulai sama sebelum dan sesudah klik "2 anak".
    - `test('two kids without profiles can start')`: tanpa memilih profil klik Mulai, URL `/play` berisi `players=2` (Review Focus 5).
  - `chromium-phone` (740×360): `test('intro fits short landscape')`: tombol Mulai terlihat dalam viewport tanpa scroll halaman dan pratinjau berupa `[data-preview="static"]`.
- [x] **Step 2:** `npx vitest run src/components/GamePreview` dan `npx playwright test e2e/flows.spec.ts --project=chromium-desktop` → FAIL.
- [x] **Step 3: Implementasi** sesuai K4 (jarak, hierarki, responsif, motion). `GamePreview` membaca `PREVIEW_BY_GAME[gameId]` dan me-render template; `key={level}` memutar ulang animasi saat level berganti. Template `trace` menggambar path dari glyph asli; template lain memakai `ObjectImage`.
- [x] **Step 4:** `npx vitest run src/components/GamePreview` → PASS; `npx playwright test e2e/flows.spec.ts e2e/a11y.spec.ts` → PASS (axe tanpa pelanggaran baru; kontras label dan judul >= 4.5:1).
- [x] **Step 5: Verifikasi visual** pada 1366×768, 1024×768, 740×360, 390×844 (screenshot sebelum/sesudah dilampirkan ke Log) dan Performance panel pada Intro `ayo-berhitung`: tanpa long task > 50ms dan tanpa layout shift. Perbarui screenshot baseline (`--update-snapshots`) **setelah** tinjauan ini.

### Task 4: Wake lock, persistent storage, validasi Result

**Files:**
- Create: `src/lib/device/wakeLock.ts` (+ `.test.ts`), `src/lib/storage/persist.ts`, `src/pages/Result/parseOutcome.ts` (+ `.test.ts`)
- Modify: `src/pages/Play/SplitPlay.tsx`, `src/pages/Play/OnlinePlay.tsx`, root app (`src/main.tsx` atau provider root), `src/pages/Result/ResultPage.tsx:22-34`

**Interfaces:**
- Produces:
  - `useWakeLock(active: boolean): void` — `navigator.wakeLock?.request('screen')` saat aktif; release saat nonaktif/unmount; minta ulang saat `visibilitychange` → visible; semua error ditelan.
  - `requestPersistentStorage(): Promise<boolean>` — `navigator.storage?.persist?.()` sekali; `false` bila tak didukung/error.
  - `parseOutcome(raw: unknown): SessionOutcome | null` — wajib `config.profileIds` array (elemen string/undefined); `players[i].stars` integer di-clamp 0–3; `onlineFinal` (bila ada) wajib `scores.host/guest` finite ≥ 0, `winner` ∈ host/guest/seri/null, `role` host/guest, `localPlayer`/`peerPlayer` objek.

- [x] **Step 1: Test gagal:**
  - `wakeLock.test.ts`: `active:true` → `request('screen')` 1x; `false` → `release` dipanggil; tanpa `navigator.wakeLock` → tidak throw; `request` reject → tidak throw.
  - `parseOutcome.test.ts`: tanpa `profileIds` → `null`; `onlineFinal: {}` → `null`; `stars: 1e9` → `3`; outcome valid → setara input.
- [x] **Step 2:** `npx vitest run src/lib/device src/pages/Result` → FAIL.
- [x] **Step 3:** Implementasi; `useWakeLock(true)` di `SplitPlay`; `useWakeLock(phase === 'playing' || phase === 'countdown')` di `OnlinePlay`; `void requestPersistentStorage()` sekali di root.
- [x] **Step 4:** `npm test && npm run build` → PASS.

### Task 5: Dokumentasi & QA

**Files:** `docs/architecture.md`, `docs/PRD.md` (bagian multiplayer), plan ini (Log)

- [x] **Step 1:** `architecture.md`: tulis flag `VITE_FEATURE_ONLINE_ROOM`, aturan `splitFits`, dan status 2 Perangkat = On-Hold beserta sisa risiko keamanan yang tercatat di Fase Berikutnya. `PRD.md`: mode 2 pemain = layar dibagi / bergiliran; co-op & 2 perangkat = fase berikutnya.
- [x] **Step 2:** `npm run lint && npm test && npm run build && npx playwright test` → semua hijau; catat hasil aktual di Log.
- [ ] **Step 3:** QA manual di HP sungguhan (Android & iPhone, landscape & portrait) — catat game mana yang jatuh ke bergiliran. ⏸ _perlu perangkat fisik, belum dijalankan_

---

## Fase Berikutnya (On-Hold) — jangan dieksekusi

Prasyarat membuka kembali: keputusan database (ranking/profil lintas perangkat) **dan** flag `VITE_FEATURE_ONLINE_ROOM` dinyalakan. Detail desain & temuan audit dipertahankan di bawah ini agar tidak hilang.

**H1 — Keamanan room (Vuln 1, Medium, terverifikasi).** Pesan dari `sid` mana pun diterima reducer (`src/lib/room/roomReducer.ts:370-580`); channel `msz-room-<4 digit>` publik.
- [ ] Protokol: pesan `deny {to, reason:'full'|'in-match'|'rejected'}`, `hello.build` (`__BUILD_ID__` via `vite.config.ts` define), `MAX_COUNTDOWN_MS = 10_000`, `parseStartMsg` bersama.
- [ ] Reducer: bind peer ke satu `sid`; pesan dari sid lain dibuang tanpa menyentuh `lastSeq`; `start/sync/final/rematch` hanya dari host terikat; `sync` saat resume hanya dari `expectedPeerSid` (disimpan sebagai `StoredRoom.peerSid`); clamp `snap.score ≤ totalRounds*3`, `roundsDone ≤ totalRounds`; build berbeda → `error:'version-mismatch'`.
- [ ] E2E: tab ketiga mem-post `final` palsu ke `BroadcastChannel('msz-room-<code>')` → guest tetap bermain.

**H2 — Kapasitas & persetujuan host.**
- [ ] `pendingPeer` + `APPROVE_PEER`/`REJECT_PEER`; kartu "{name} ingin bergabung — Terima/Tolak"; perangkat ketiga mendapat copy `room.errFull` / `room.errInMatch` / `room.errRejected`; rematch & reconnect sid sama tanpa approval ulang.

**H3 — Klaim kode.**
- [ ] `resolveHostClaim(self, others): 'ok'|'lost'` (`src/lib/room/hostClaim.ts`), jendela `HOST_CLAIM_SETTLE_MS = 600`, auto-retry `HOST_CLAIM_MAX_TRIES = 3` di `RoomLobby`.

**H4 — Robustness data room.**
- [ ] `parseMatch` → `parseStartMsg`; `parseLocalProgress` tolak `attempts` non-finite & `results.length > MAX_SNAP_ROUNDS`, clamp `roundIndex ≤ totalRounds`.

**H5 — Sisa risiko yang diterima** (dicatat, tidak diperbaiki di H1–H4): pihak ketiga masih bisa mendengar nama panggilan (≤ 12 char) dan mengganggu (spoof presence, `hello` mendahului host) — keduanya DoS/informational. Penutup tuntas: Realtime private channel + RLS `realtime.messages`, atau nama channel acak panjang via tautan gabung.

**H6 — Ide 1 perangkat berikutnya.**
- [ ] Mode **Kerja sama (co-op)**: satu skor tim, ronde bergantian/simultan, Hasil "Kalian hebat bersama!" tanpa pemenang.
- [ ] Mode **berhadapan portrait** (pane atas diputar 180°) untuk HP/tablet yang diletakkan di meja.
- [ ] Spike: sentuhan bersamaan di dua pane (Pointer Events + `setPointerCapture` per pane) di perangkat iOS/Android nyata.

## Log

- 2026-11-26: plan v1 — room hardening & security (audit: Vuln 1 terverifikasi Medium; spoof presence & paparan nama = DoS/informational).
- 2026-11-26: revisi 3 — audit checklist `docs/plan/` disinkronkan dengan kode (lint 0 error, 47 file / 151 test lulus, build lulus); Task 3 diperluas: Intro tanpa kotak kiri, jarak lega, pratinjau animasi per game (K4).
- 2026-11-26: revisi 2 — scope pivot: 2 Perangkat di-hold via flag; fokus layar dibagi/bergiliran; HP landscape; Intro disederhanakan. Task room lama dipindah ke Fase Berikutnya (H1–H5).
- 2026-11-26: Fase Aktif diimplementasikan di `project/`: flag room default mati, split HP landscape dengan prompt putar, Intro satu panel, wake lock, storage persistence, validasi Result. Verifikasi: lint lulus; Vitest 151/151; build lulus; Playwright 184 lulus, 20 skip (termasuk H2 on-hold). Screenshot Intro setelah perubahan pada 1366×768, 1024×768, 740×360, 390×844 di `project/e2e/__screenshots__/`. QA Android dan iPhone fisik masih perlu dijalankan; pengujian browser emulasi bukan pengganti perangkat nyata.
- 2026-11-26 (review akhir, fix pass): split di 740×360 tidak muat (626–838 px) → `splitFits` kini butuh tinggi ≥ 600 & lebar ≥ 900, HP bergiliran; copy prompt netral perangkat; `isOnlineConfigured` dipindah ke `src/lib/room/online.ts` agar SDK Supabase (57 kB gzip) tidak ikut preload entry saat flag mati (entry 126.88 → 124.63 kB gzip); titik "jari" ditambahkan di pratinjau trace.
- 2026-11-26 (eksekusi native, Task 3): `GamePreview` (6 template) + Intro tanpa kartu kiri + jarak lega. Verifikasi: `npm run lint` 0 error; Vitest 48 file / 156 test lulus; `npm run build` lulus (entry 126.88 kB gzip, preview lazy); Playwright 191 lulus / 41 skip / 0 gagal (5 proyek), termasuk `e2e/intro-preview.spec.ts` (7 test). Pemeriksaan visual dev server 1366×768, 1344×636, 1024×768, 740×360, 390×844 (9 game kecuali Tebalkan Hijaiyyah yang `soon`). Catatan: di 740×360 panel Intro scroll internal dengan Mulai menempel; belum dicoba di perangkat fisik.
