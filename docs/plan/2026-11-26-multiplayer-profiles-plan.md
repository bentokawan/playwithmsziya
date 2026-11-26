# Multiplayer, Profil Pemain & Peringkat — Implementation Plan

- Status: **complete (kode)** — 12 task selesai & lulus; sisa: commit (menunggu izin) dan uji sentuh 2 anak di tablet fisik. Bagian 2 Perangkat digantikan oleh dual-mode plan dan kini **on-hold** ([room-hardening plan](2026-11-26-room-hardening-security-plan.md)).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Profil pemain permanen dengan quick-select, mode 2 pemain kompetitif (layar dibagi dan 2 perangkat lewat kode ruang), peringkat yang memotivasi, intro yang dirombak, dan overlay "Ayo main!" di Home dihapus.

**Architecture:**
- **Penyimpanan:** profil dan skor disimpan per perangkat di `localStorage` lewat `lib/storage`, dengan skema berversi dan ekspor/impor JSON. Peringkat dihitung dari catatan sesi, bukan disimpan.
- **Layar dibagi:** `PlayPage` merender dua instance `Round` di dua panel, masing-masing dengan state sendiri, digerakkan oleh `raceReducer` (pure).
- **Dua perangkat:** keduanya membangkitkan ronde yang sama dari seed yang sama (deterministik). Supabase Realtime (Broadcast + Presence, kunci anon, **tanpa tabel**) hanya mengirim `hello`, `start`, `progress`, `done`, dan `leave`. Transport diabstraksi sehingga tes dan e2e memakai BroadcastChannel.

**Tech Stack:**
- Aplikasi: React 19, TS 6, Motion 14, CSS Modules (+ container queries).
- Realtime: `@supabase/supabase-js` (sudah ada, tanpa dependensi baru).
- Tes: Vitest 5, Playwright 1.65.

**Spec:** permintaan user tanggal 2026-11-26 (bagian "Keputusan" di bawah). Plan ini berlaku setelah `docs/plan/2026-11-26-ux-polish-plan.md`.

---

## Keputusan (bisa diubah sebelum eksekusi)

| # | Keputusan |
|---|---|
| D1 | **Lokasi data:** profil dan skor tersimpan **per perangkat** (localStorage + `navigator.storage.persist()`), dengan cadangan berupa ekspor/impor JSON di halaman Pemain. Sinkron cloud tidak termasuk, karena butuh akun dan data anak masuk server. |
| D2 | **Profil:** nama 1–12 karakter, 8 avatar hewan (`kelinci kucing beruang panda rubah katak ayam gajah`), dan 8 warna `--player-*`. Kombinasi avatar+warna harus unik. Roster maksimal 40 profil, dan profil yang dihapus diarsipkan (soft delete). |
| D3 | **Mode main:** `solo`, `giliran` (perilaku 2 pemain yang sudah ada), `layar` (layar dibagi kiri/kanan), `online` (2 perangkat). Tanpa profil terpilih, anak bermain sebagai "Tamu" dan skornya tidak dicatat. |
| D4 | **Ketersediaan mode per game:**<br>• `layar`: **semua game kecuali** G04 Bunyi Awal dan G06 Dengar & Temukan (keduanya bergantung pada suara, jadi dua suara akan bertabrakan) serta G08 Kartu Kembar (satu papan bersama, tetap `giliran`).<br>• `online`: semua game kecuali G08.<br>• `layar` hanya muncul bila lebar viewport ≥ 900 px. |
| D5 | **Skor:** benar di percobaan pertama = 3, percobaan kedua = 2, selebihnya = 1. G08 dihitung 2 per pasangan.<br>Bintang dihitung dari `score/maxScore`: ≥ 0,9 → 3, ≥ 0,6 → 2, di bawahnya → 1. Nilai minimum selalu 1 bintang. |
| D6 | **Balapan (layar & online):** kedua pemain mendapat ronde identik. Balapan selesai saat keduanya tamat, atau **45 detik** setelah pemain pertama tamat (muncul banner "Ayo, sedikit lagi!"). Keduanya tetap mendapat stiker. Pemenang mendapat mahkota, pemain lainnya mendapat "Hebat!" dan tidak pernah disebut "kalah". |
| D7 | **Peringkat positif:**<br>• Per game+level: urut skor terbaik.<br>• "Semua game": urut total bintang terbaik.<br>• Chip `Rekor baru!` atau `+N` muncul bila ada peningkatan. Selisih negatif tidak pernah ditampilkan (diganti chip netral "Ayo main lagi").<br>• Badge "Paling berkembang" untuk peningkatan terbesar dalam 7 hari.<br>• Tidak ada label peringkat terakhir. Medali hanya untuk peringkat 1–3, sisanya bernomor biasa. |
| D8 | **Kode ruang:** **4 digit** (keypad angka besar). Channel `msz-room-<kode>`.<br>• Host dan payload berversi `v:1`.<br>• Ruang ditolak bila presence ≥ 2. Tidak ada auth.<br>• Data yang dikirim hanya nama depan, avatar, dan warna. Sifatnya ephemeral (broadcast) dan tidak disimpan di server.<br>• Bila Supabase belum dikonfigurasi, opsi `online` disembunyikan. |
| D9 | **Overlay "Ayo main!" di Home dihapus.** Audio di-unlock lewat listener `pointerdown`/`keydown` sekali di `AudioProvider`, sehingga ketukan pertama pada kartu langsung membuka game dan menyalakan suara. Splash `/` tetap ada. |
| D10 | **Manajemen pemain:** halaman Pemain (`/pemain`, tempat edit, arsip, dan ekspor) dikunci dengan `GrownUpGate`. Menambah pemain dari intro tetap bisa tanpa gate. |

## Global Constraints

- Tidak ada dependensi baru. Tidak ada migrasi Supabase. Jangan menyentuh project Supabase sungguhan tanpa izin. Jangan memakai `service_role` di klien.
- Setiap kunci i18n baru wajib ada di `id.ts` **dan** `en.ts` (`i18n.test.ts`).
- Kunci storage baru adalah `msz:profiles:v1` dan `msz:scores:v1`. Semua baca/tulis lewat `readJSON`/`writeJSON` dengan parser yang menolak data rusak (kembalikan `null` atau default, jangan crash).
- Catatan skor maksimal 2000. Bila lebih, catatan terlama dibuang.
- Target sentuh tetap ≥ `--touch-choice`. Semua animasi menghormati `useCalmMotion`.
- Komponen `Round` tidak boleh memakai `position: fixed` atau `window` keydown tanpa scope panel (supaya aman untuk layar dibagi).
- Commit hanya bila user mengizinkan. Langkah "Commit" di bawah dijalankan hanya setelah izin itu ada.

## Review Focus

1. **Multi-touch di layar dibagi:** dua jari menekan di panel berbeda pada saat yang sama. Keduanya harus tercatat; ketukan panel kiri tidak boleh membatalkan panel kanan. Diuji di Task 6 (`usePress` + e2e dua `touchscreen.tap` paralel).
2. **Koneksi 2 perangkat putus di tengah permainan:** pemain yang tersisa melihat "Teman terputus" lalu lanjut solo, dan skornya tetap tercatat. Diuji di Task 10.
3. **Kode ruang salah, ruang penuh, atau host belum ada:** pesan ramah muncul dalam ≤ 5 detik, tanpa spinner tanpa akhir. Diuji di Task 9/10.
4. **localStorage rusak, penuh, atau dihapus:** aplikasi tetap jalan dengan roster kosong; saat menulis ke storage yang penuh, catatan terlama dipangkas lalu dicoba sekali lagi. Diuji di Task 1/2.
5. **Data berubah dari luar sesi:** profil yang dipakai di URL (`p1`/`p2`) sudah diarsipkan, atau konten CMS beda versi antar perangkat. URL berprofil diturunkan ke Tamu; konten yang beda versi menampilkan "Muat ulang dulu". Diuji di Task 4/9.

---

## File map

```
src/lib/profiles/        profiles.ts (+test)          store & validasi profil
src/lib/scores/          scoring.ts, records.ts, leaderboard.ts (+tests)
src/lib/race/            raceReducer.ts (+test)
src/lib/room/            protocol.ts, lobbyReducer.ts, transport.ts,
                         supabaseTransport.ts, localTransport.ts (+tests)
src/lib/press/           usePress.ts, pressTracker.ts (+test)
src/components/Avatar/   AnimalAvatar.tsx, PlayerChip.tsx
src/components/Roster/   RosterPicker.tsx, ProfileEditor.tsx, ModePicker.tsx
src/components/RaceBar/  RaceBar.tsx
src/pages/Players/       PlayersPage.tsx        (/pemain)
src/pages/Leaderboard/   LeaderboardPage.tsx    (/peringkat)
src/pages/Room/          HostRoomPage.tsx (/game/:id/ruang), JoinRoomPage.tsx (/gabung)
src/pages/Play/          SplitPlay.tsx, OnlinePlay.tsx, PlayPage.tsx (mode switch)
Modify: session.ts, catalog.ts, types.ts, AudioProvider.tsx, HomePage, IntroPage,
        ResultPage, Arena.module.css, HandHint, TurnBanner, PetualanganLabirinRound,
        BlockButton, Tile, tokens.css, Icon.tsx, routes.tsx, i18n
```

---

### Task 1: Store profil

**Files:**
- Create: `src/lib/profiles/profiles.ts`
- Test: `src/lib/profiles/profiles.test.ts`

**Interfaces:**
- Produces:
  ```ts
  type AnimalId = 'kelinci'|'kucing'|'beruang'|'panda'|'rubah'|'katak'|'ayam'|'gajah';
  type PlayerColor = 'merah'|'oranye'|'kuning'|'hijau'|'tosca'|'biru'|'ungu'|'merah-muda';
  interface Profile { id: string; name: string; avatar: AnimalId; color: PlayerColor; createdAt: string; archived: boolean }
  loadProfiles(): Profile[]                        // termasuk archived
  activeProfiles(list): Profile[]                  // !archived, urut createdAt
  addProfile(list, input: {name, avatar, color}): { list } | { error: 'name'|'taken'|'full' }
  updateProfile(list, id, patch): { list } | { error }
  archiveProfile(list, id): Profile[]
  saveProfiles(list): boolean
  firstFreeCombo(list): { avatar, color }
  exportProfilesJSON(): string;  importProfilesJSON(text): { count } | { error: 'invalid' }
  ```

- [x] **Step 1:** Tes:
  - `addProfile` memangkas spasi.
  - Nama kosong atau lebih dari 12 karakter → `{error:'name'}`.
  - Kombinasi avatar+warna yang sudah dipakai profil aktif → `'taken'`.
  - Profil aktif ke-41 → `'full'`.
  - `loadProfiles` dengan JSON rusak, `schemaVersion` asing, atau item tanpa `id` → item buruk dibuang dan tidak throw.
  - `firstFreeCombo` melewati kombinasi yang dipakai.
  - Round-trip ekspor/impor; impor melakukan merge berdasarkan `id`.
- [x] **Step 2:** `npx vitest run src/lib/profiles` → FAIL.
- [x] **Step 3:** Implementasi:
  - Simpan `{schemaVersion:1, profiles}` di `msz:profiles:v1`. `id` dibuat dengan `crypto.randomUUID()` (fallback `Date.now()+rng`).
  - `saveProfiles` memanggil `navigator.storage?.persist?.()` sekali per sesi.
- [x] **Step 4:** Tes → PASS.
- [ ] **Step 5:** Commit `feat(profiles): local profile store`. ⏸ _menunggu izin commit_

### Task 2: Skor, catatan sesi, peringkat

**Files:**
- Create: `src/lib/scores/scoring.ts`, `records.ts`, `leaderboard.ts`
- Test: tiga file `*.test.ts` yang sesuai

**Interfaces:**
- Consumes: `RoundResult`, `GameId`, `DifficultyId`, `Profile` (Task 1).
- Produces:
  ```ts
  type PlayMode = 'solo'|'giliran'|'layar'|'online';
  roundPoints(r: RoundResult): 1|2|3
  scoreSession(results: RoundResult[], perPlayerPairs?: number, totalPairs?: number): { score; maxScore }
  starsFor(score, maxScore): 1|2|3
  interface SessionRecord { id; profileId; gameId; difficulty; mode: PlayMode; score; maxScore; firstTryCount; rounds; finishedAt; won?: boolean }
  appendRecord(rec): { record: SessionRecord; isPersonalBest: boolean; improvement: number /* ≥0 */ }
  loadRecords(): SessionRecord[]
  interface LeaderRow { profile: Profile; rank: number; best: number; bestStars: 1|2|3; lastImprovement: number; isNewRecord: boolean; mostImproved: boolean; plays: number }
  leaderboard(records, profiles, filter: { gameId: GameId; difficulty: DifficultyId } | 'all', now: Date): LeaderRow[]
  ```

- [x] **Step 1:** Tes:
  - `roundPoints({firstTry:true,attempts:1})===3`, `attempts:2 → 2`, `attempts:5 → 1`.
  - Untuk G08: `scoreSession([], 3, 6)` → `{score:6, maxScore:12}`.
  - `starsFor(9,10)===3`, `starsFor(6,10)===2`, `starsFor(0,10)===1`.
  - `appendRecord` pertama → `isPersonalBest:true, improvement:0`. Skor yang lebih tinggi → improvement = selisih terhadap best lama. Skor lebih rendah → `improvement 0`, `isPersonalBest false`.
  - Dari 2001 catatan, yang tersimpan 2000 dan catatan terlama dibuang.
  - Bila `writeJSON` gagal: pangkas 500 catatan terlama lalu coba lagi sekali.
  - `leaderboard`:
    - Skor seri → peringkat sama (1,1,3).
    - Profil yang diarsipkan dan profil tanpa catatan tidak muncul.
    - `mostImproved` hanya pada satu baris, yaitu kenaikan terbesar dalam 7 hari terakhir (> 0).
    - Mode `'all'` = jumlah `bestStars` per (game, level).
- [x] **Step 2:** FAIL → **Step 3:** implementasi (`msz:scores:v1`, `{schemaVersion:1, records}`) → **Step 4:** PASS.
- [ ] **Step 5:** Commit `feat(scores): scoring, records, leaderboard`. ⏸ _menunggu izin commit_

### Task 3: Hapus overlay "Ayo main!" (unlock audio otomatis)

**Files:**
- Modify: `src/app/providers/AudioProvider.tsx`, `src/pages/Home/HomePage.tsx` (+ `.module.css`: hapus `.unlockOverlay`)
- Test: `e2e/flows.spec.ts`

- [x] **Step 1:** E2E `home tanpa overlay`:
  - `goto('/home')` langsung → tidak ada tombol bernama `splash.start`.
  - Klik kartu "Ayo Berhitung" sekali → URL `/game/ayo-berhitung/intro`.
- [x] **Step 2:** `npx playwright test flows -g "tanpa overlay"` → FAIL.
- [x] **Step 3:** Implementasi:
  - `AudioProvider` memasang listener `pointerdown` + `keydown` di `window` (`{capture:true}`) yang memanggil `manager.unlock()` lalu melepas diri setelah berhasil.
  - Hapus state `needsUnlock` dan overlay dari `HomePage`.
- [x] **Step 4:** PASS, dan `npm test` tetap hijau.
- [ ] **Step 5:** Commit `fix(home): remove start overlay, unlock audio on first gesture`. ⏸ _menunggu izin commit_

### Task 4: Session config v2 + kapabilitas mode

**Files:**
- Modify: `src/lib/session/session.ts`, `src/games/catalog.ts`
- Test: `session.test.ts`, `catalog.test.ts`

**Interfaces:**
- Produces:
  - `SessionConfig` mendapat field `mode: PlayMode` (default `'solo'`), `profileIds: readonly [string?, string?]`, dan `room?: string` (4 digit).
  - `players` tetap ada dan diturunkan dari mode (`solo|online` → 1).
  - `parseSessionConfig(gameId, search, knownProfileIds: ReadonlySet<string>)`: id yang tidak dikenal dibuang, sehingga sesi itu dicatat sebagai Tamu.
  - `CatalogEntry.modes: readonly PlayMode[]`, mengikuti D4.
  - `availableModes(entry, viewportWidth, onlineConfigured): PlayMode[]`.

- [x] **Step 1:** Tes:
  - Parse `mode=layar&p1=a&p2=b` → `players:2`.
  - `mode=layar` untuk `bunyi-awal` → turun ke `giliran`.
  - `p1` yang tidak dikenal → `profileIds[0]` undefined.
  - Round-trip `build→parse`.
  - `room=12a4` dibuang.
  - `availableModes(G01, 800, true)` tidak memuat `'layar'`.
  - `availableModes(G08, 1366, true)` = `['solo','giliran']`.
  - `catalog.test`: setiap entri punya `modes` yang dimulai dengan `'solo'`.
- [x] **Step 2:** FAIL → **Step 3:** implementasi. Semua pemanggil `parseSessionConfig` (Intro, Play, Result) mengirim id dari `activeProfiles(loadProfiles())`. → **Step 4:** PASS, dan `tsc -b` bersih.
- [ ] **Step 5:** Commit `feat(session): play modes and profile ids`. ⏸ _menunggu izin commit_

### Task 5: Avatar, roster quick-select, editor profil, halaman Pemain

**Files:**
- Create:
  - `src/components/Avatar/AnimalAvatar.tsx`, `PlayerChip.tsx`
  - `src/components/Roster/RosterPicker.tsx`, `ProfileEditor.tsx`
  - `src/pages/Players/PlayersPage.tsx` (+ css)
- Modify:
  - `src/design/tokens.css`: `--player-merah … --player-merah-muda`. Setiap warna kontras ≥ 4.5 dengan `--white`.
  - `src/components/icons/Icon.tsx`: tambah `trophy`, `users`, `link`, `plus`, `crown`.
  - `routes.tsx`: route `/pemain`.
  - `HomePage`: tombol "Pemain" di TopNav, lewat `GrownUpGate`.
  - i18n.
- Test: `e2e/profiles.spec.ts`

**Interfaces:**
- Consumes: Task 1.
- Produces:
  - `<AnimalAvatar animal size />` (SVG flat, `aria-hidden`).
  - `<PlayerChip profile selected order?: 1|2 onPress />`.
  - `<RosterPicker profiles selected: string[] max: 1|2 onChange(ids) onAdd() />`:
    - Ketukan memilih atau membatalkan pilihan.
    - Ketukan ke-3 saat `max=2` mengganti pilihan terlama.
    - Badge "1"/"2" menunjukkan urutan.
  - `<ProfileEditor open initial? onSave(input) onClose />`:
    - Input nama (`maxLength=12`, `enterKeyHint="done"`).
    - Grid 8 avatar dan 8 warna. Kombinasi yang dipakai profil lain dinonaktifkan dan dicoret.
    - Pratinjau langsung.

- [x] **Step 1:** E2E:
  - Di `/pemain` (lewat gate), tambah profil "Ana" lewat `ProfileEditor` → kartu Ana muncul. `RosterPicker` diuji di `/_kit` (ketukan ke-3 menggantikan pilihan terlama). Integrasi ke intro dilakukan di Task 11.
  - Reload → Ana masih ada.
  - Di `/pemain` (lewat gate), ubah nama → berubah. Arsipkan → hilang dari intro.
  - Ekspor menghasilkan unduhan `.json`.
- [x] **Step 2:** FAIL → **Step 3:** implementasi → **Step 4:** PASS + `a11y.spec` untuk `/pemain`.
- [ ] **Step 5:** Commit `feat(profiles): avatars, roster picker, players page`. ⏸ _menunggu izin commit_

### Task 6: Siap layar dibagi (panel aman + multi-touch)

**Files:**
- Create: `src/lib/press/pressTracker.ts` (+test), `src/lib/press/usePress.ts`
- Modify:
  - `BlockButton.tsx`, `Tile.tsx`: pakai `usePress`, bukan `onClick`.
  - `Arena.module.css`, `KartuKembarRound.module.css`: `@media` → `@container arena (...)`, dan root Arena diberi `container: arena / inline-size`.
  - `HandHint.module.css`: `fixed` → `absolute` di dalam `.arena` (`position:relative`).
  - `TurnBanner.module.css`: `absolute` relatif terhadap panel.
  - `types.ts`: `RoundProps.pane?: { side: 'left'|'right'; quiet: boolean }`.
  - `PetualanganLabirinRound.tsx`: keydown hanya aktif bila `!pane`. Di panel, kiri memakai `WASD` dan kanan memakai panah, sehingga `keyMapFor(pane)` dipakai bersama.
  - Round yang memanggil `audio.speak` otomatis harus melewatinya bila `pane?.quiet` (G01, G02, G03, G05, G07, G09). Ketukan tombol dengar tetap berbunyi.
- Test: `pressTracker.test.ts`, `e2e/touch.spec.ts`

**Interfaces:**
- Produces:
  - `createPressTracker()` → `{ down(pointerId, targetKey), up(pointerId, targetKey): boolean /* true = press valid */, cancel(pointerId) }`.
  - `usePress(onPress, opts?) → { onPointerDown, onPointerUp, onPointerCancel, onKeyDown }`. Enter/Space tetap memicu tekan, dan `click` dengan `detail===0` (pembaca layar) tetap memicu tekan.

- [x] **Step 1:** Tes `pressTracker`:
  - `down(1,'a'); down(2,'b'); up(2,'b')===true; up(1,'a')===true`.
  - `down(1,'a'); up(1,'b')===false`.
  - `cancel(1)` → `up(1,'a')===false`.
- [x] **Step 2:** E2E `touch`: dua `dispatchEvent` pointer serentak pada dua tombol di `/_kit` (demo dua BlockButton) → kedua counter bertambah.
- [x] **Step 3:** FAIL → implementasi → PASS. Seluruh `flows`/`a11y`/`desktop` tetap hijau (perilaku satu layar tidak berubah).
- [ ] **Step 4:** Commit `refactor(games): pane-safe rounds and multi-touch press`. ⏸ _menunggu izin commit_

### Task 7: Mode layar dibagi + race bar

**Files:**
- Create:
  - `src/lib/race/raceReducer.ts` (+test)
  - `src/components/RaceBar/RaceBar.tsx` (+css)
  - `src/pages/Play/SplitPlay.tsx` (+css)
- Modify: `PlayPage.tsx` (bila `config.mode==='layar'`, render `<SplitPlay>`)
- Test: `raceReducer.test.ts`, `e2e/split.spec.ts`

**Interfaces:**
- Consumes: Task 2 (`roundPoints`), Task 4 (`config.mode`), Task 6 (`pane`).
- Produces:
  ```ts
  interface RacePlayer { roundIndex: number; results: RoundResult[]; score: number; finishedAt: number|null }
  interface RaceState { status: 'countdown'|'racing'|'last-call'|'finished'; players: Record<1|2, RacePlayer>; lastCallEndsAt: number|null }
  raceReducer(state, action:
    | {type:'GO'}
    | {type:'ROUND_DONE'; player:1|2; result: RoundResult; totalRounds: number; now: number}
    | {type:'TICK'; now: number}
    | {type:'REMOTE_PROGRESS'; roundsDone: number; score: number}   // dipakai Task 10
    | {type:'PEER_LEFT'}): RaceState
  raceWinner(state): 1|2|'seri'|null   // skor lebih tinggi; bila seri → finishedAt lebih awal; bila sama → 'seri'
  LAST_CALL_MS = 45_000
  ```
- UI:
  - Countdown "3-2-1" (dilewati bila calm), lalu dua panel 50/50 dengan border `--player-<warna>`. Header tiap panel menampilkan `PlayerChip` dan skor.
  - Pembatas tengah berisi `RaceBar` vertikal: dua jalur dengan avatar yang bergerak sesuai `roundIndex/total` dan animasi spring.
  - Panel yang sudah tamat menampilkan "Hebat! Tunggu temanmu" dengan MsZiya.
  - Saat `last-call`, muncul banner "Ayo, sedikit lagi!" dan cincin hitung mundur.
  - Ikon `confirm-exit` di TopNav menghentikan kedua pemain.

- [x] **Step 1:** Tes reducer:
  - Pemain pertama tamat → `last-call` dan `lastCallEndsAt = now+45000`.
  - `TICK` melewati batas → `finished`.
  - Keduanya tamat → `finished` seketika.
  - `ROUND_DONE` setelah pemain tamat diabaikan.
  - `raceWinner` seri skor → finishedAt lebih awal yang menang.
  - `PEER_LEFT` → `status` tetap racing untuk pemain lokal (online).
- [x] **Step 2:** E2E pada `chromium-desktop` `?mode=layar&p1&p2&seed=7` (profil di-seed via `localStorage`):
  - Ada dua `[data-pane]`.
  - `__MSZ_TEST__.solveRound(1)` ×N → panel kiri tamat dan banner `last-call` muncul.
  - `solveRound(2)` ×N → halaman hasil menampilkan dua pemain beserta satu mahkota.
  - `solveRound` diperluas dengan argumen `player?`.
- [x] **Step 3:** FAIL → implementasi → PASS.
- [ ] **Step 4:** Commit `feat(play): split-screen race mode`. ⏸ _menunggu izin commit_

### Task 8: Pencatatan skor + Result v2 + halaman Peringkat

**Files:**
- Modify:
  - `PlayPage.tsx`: finalisasi semua mode memanggil `appendRecord` per profil (Tamu dilewati).
  - `SessionOutcome` naik ke `schemaVersion: 2`, dengan `PlayerOutcome` + `{profileId?, score, maxScore, stars, isPersonalBest, improvement, won?}`. `parseOutcome` menerima v1 dan v2.
  - `ResultPage.tsx`: tampilkan bintang, skor, chip `Rekor baru!` / `+N`, dan podium berdampingan untuk 2 pemain. Mahkota diberikan untuk pemenang `layar`/`online`.
- Create: `src/pages/Leaderboard/LeaderboardPage.tsx` (`/peringkat`)
  - Filter chip game (`Semua` + 9 game) dan level.
  - Baris: medali/nomor, avatar, nama, skor terbaik/bintang, chip peningkatan, badge "Paling berkembang".
  - Empty state: "Belum ada skor. Ayo main!"
  - Tombol trophy ditambahkan di TopNav Home dan ResultPage.
- Test: `e2e/leaderboard.spec.ts`

- [x] **Step 1:** E2E:
  - Profil Ana main G01 solo (`solveRound` dengan `attempts:2`) → hasil menampilkan "Rekor baru!".
  - Main lagi dengan `attempts:1` → chip `+N`.
  - `/peringkat?game=ayo-berhitung&level=mudah` → Ana peringkat 1.
  - Tambah Budi dengan skor lebih rendah → tidak ada teks "terakhir" dan tidak ada angka negatif.
- [x] **Step 2:** FAIL → implementasi → PASS.
- [ ] **Step 3:** Commit `feat(scores): record sessions, result v2, leaderboard page`. ⏸ _menunggu izin commit_

### Task 9: Protokol ruang + transport

**Files:**
- Create in `src/lib/room/`:
  - `protocol.ts`, `lobbyReducer.ts`, `transport.ts`
  - `localTransport.ts` (BroadcastChannel)
  - `supabaseTransport.ts`
- Test: `protocol.test.ts`, `lobbyReducer.test.ts`, `localTransport.test.ts` (memakai `createLoopbackPair()`)

**Interfaces:**
- Produces:
  ```ts
  type RoomMsg =
    | {v:1; t:'hello'; role:'host'|'guest'; player:{name; avatar; color}; content: string}
    | {v:1; t:'start'; gameId; difficulty; seed; locale}
    | {v:1; t:'progress'; roundsDone; score}
    | {v:1; t:'done'; score; maxScore; finishedAt}
    | {v:1; t:'leave'}
  parseRoomMsg(raw: unknown): RoomMsg | null          // tolak v≠1, field salah tipe, nama >12
  newRoomCode(rng?): string                           // '0000'–'9999', 4 digit
  contentFingerprint(content: ResolvedContent): string // hash FNV-1a dari id objek/kata/hijaiyyah terurut
  interface RoomTransport {
    join(code, me: 'host'|'guest'): Promise<{ ok: true } | { ok: false; reason: 'full'|'no-host'|'offline'|'timeout' }>;
    send(msg: RoomMsg): void;
    onMessage(cb): () => void;  onPeer(cb: (present: boolean) => void): () => void;
    leave(): void;
  }
  createRoomTransport(): RoomTransport | null   // Supabase bila env ada; local bila import.meta.env.VITE_ROOM_TRANSPORT==='local'; selain itu null
  lobbyReducer(state, action) // idle → hosting(code) → paired(peer) → started(cfg) → playing → ended; guest: joining → paired → started
  JOIN_TIMEOUT_MS = 5000
  ```
- **Supabase:**
  - `channel('msz-room-'+code, {config:{broadcast:{self:false}, presence:{key: role}}})`.
  - Host yang mendapati presence sudah berisi `host` → coba kode baru, maksimal 3 kali.
  - Guest yang tidak menemukan `host` dalam 5 detik → `'no-host'`. Bila sudah ada `guest` → `'full'`.

- [x] **Step 1:** Tes:
  - `parseRoomMsg` menolak `{v:2}`, `score:'x'`, dan nama 13 karakter.
  - `newRoomCode` selalu `/^\d{4}$/`.
  - `contentFingerprint` stabil terhadap urutan input.
  - Lobby: `hello` dengan `content` berbeda → `state.error==='content-mismatch'`.
  - `peer false` saat `playing` → `peerLeft:true`.
  - Loopback: pesan host diterima guest, dan `leave()` memicu `onPeer(false)`.
- [x] **Step 2:** FAIL → implementasi → PASS. Belum ada UI dan belum ada koneksi ke Supabase sungguhan.
- [ ] **Step 3:** Commit `feat(room): protocol, lobby reducer, transports`. ⏸ _menunggu izin commit_

### Task 10: UI 2 perangkat (buat/gabung ruang + main online)

**Files:**
- Create:
  - `src/pages/Room/HostRoomPage.tsx` (`/game/:gameId/ruang?level&p1`)
  - `src/pages/Room/JoinRoomPage.tsx` (`/gabung`)
  - `src/pages/Play/OnlinePlay.tsx`
- Modify:
  - Home: tombol "Gabung teman" (ikon `link`), hanya bila `createRoomTransport()!==null`.
  - `routes.tsx`, i18n.
- Test: `e2e/online.spec.ts` (build dengan `VITE_ROOM_TRANSPORT=local`, project `chromium-desktop`)

**Alur:**
- **Host:** Intro, pilih 1 profil, mode "2 perangkat", lalu Mulai. Halaman ruang menampilkan kode 4 digit besar (dibacakan per digit lewat `audio.speak num`), tombol salin, dan status "Menunggu teman…". Saat guest masuk, chip guest muncul dan tombol "Mulai balapan" aktif. Host mengirim `start`, lalu kedua perangkat masuk ke `/game/:id/play?mode=online&room=…&seed=…`.
- **Guest:** Home → "Gabung teman" → pilih profil → keypad 4 digit (tombol `--touch-choice`, ada hapus). Muncul "Menunggu host memulai", lalu otomatis masuk play.
- **OnlinePlay:**
  - Satu panel penuh untuk pemain lokal, plus `RaceBar` horizontal di atas (avatar lawan bergerak dari `progress`).
  - `progress` dikirim setiap `ROUND_DONE`; `done` dikirim saat tamat. Aturan last-call memakai `raceReducer` yang sama.
  - Bila koneksi putus: toast "Teman terputus, lanjut main ya" dan permainan berlanjut solo.
  - Skor dicatat hanya untuk profil lokal (`mode:'online'`, `won`).

- [x] **Step 1:** E2E dengan dua `page` dalam satu `context` (BroadcastChannel dipakai bersama):
  - Host membuka `/game/ayo-berhitung/ruang?level=mudah&p1=<id>` langsung (tombol intro ditambahkan di Task 11), guest mengetik kode → keduanya masuk play dengan `data-glyph-id`/ronde pertama yang identik.
  - Host `solveRound` semua → guest melihat avatar lawan di ujung `RaceBar`.
  - Guest menutup halaman → host melihat toast terputus.
  - Kode salah → "Ruang tidak ditemukan" dalam ≤ 6 detik.
- [x] **Step 2:** FAIL → implementasi → PASS.
- [ ] **Step 3:** Commit `feat(room): two-device play with room code`. ⏸ _menunggu izin commit_

### Task 11: Redesign Intro (dinamis & rapi)

**Files:**
- Modify: `src/pages/Intro/IntroPage.tsx` (+ css)
- Create: `src/components/Roster/ModePicker.tsx`
- Delete: `src/components/PlayerPicker/*` (digantikan RosterPicker + ModePicker)
- Test: `e2e/flows.spec.ts`, `a11y.spec.ts`, screenshot `e2e/__screenshots__` (desktop 1366, tablet 1024, phone 390)

**Layout:**
- **Hero (kiri, 5/12):**
  - Panel ber-background `WorldBackground` dunia game (bukan warna polos).
  - Ikon game besar dengan animasi melayang (`y: [0,-8,0]`, 3 detik, berhenti bila calm).
  - Bubble MsZiya berisi `howTo` singkat dan tombol dengar. Judul + tagline.
- **Setup (kanan, 7/12), tiga langkah bernomor** dengan gaya card section:
  1. **"Siapa yang main?"** → `RosterPicker` (max 2) + chip "+ Pemain baru" + chip "Tamu".
  2. **"Cara main"** → `ModePicker`:
     - Hanya muncul bila 2 profil dipilih, atau bila 1 profil + Supabase aktif (opsi 2 perangkat).
     - Kartu ikon untuk `giliran` / `layar` / `online` dari `availableModes`.
     - Opsi yang tidak tersedia disembunyikan, tidak dinonaktifkan.
  3. **"Pilih level"** → `LevelPicker`.
- **Interaksi:**
  - Section muncul dengan `AnimatePresence` + `layout` (height auto) saat langkah 2 aktif.
  - Tombol Mulai menampilkan ringkasan pemain ("Ana vs Budi").
  - `online` mengarah ke HostRoomPage, mode lain ke Play.
- **Responsif:**
  - Di bawah 900 px: hero dipadatkan menjadi strip horizontal (ikon 72 + judul), lalu setup.
  - Di bawah 600 px: tombol Mulai `position: sticky; bottom: var(--space-4)`.
  - Link "Untuk pendamping" pindah ke ikon `?` di pojok hero.
- **Persistensi:** pilihan pemain terakhir per perangkat diingat (`msz:intro:last`, berisi id dan mode) sehingga guru cukup menekan Mulai.

- [x] **Step 1:** E2E:
  - Pilih 2 profil → ModePicker muncul dengan `layar` di desktop dan tanpa `layar` di `chromium-phone`.
  - Mulai `giliran` → URL memuat `mode=giliran&p1=…&p2=…`.
  - Reload intro → pilihan sebelumnya masih terpilih.
  - Tidak ada overflow horizontal di 3 viewport.
  - axe bersih.
- [x] **Step 2:** FAIL → implementasi → PASS. Perbarui screenshot setelah ditinjau.
- [ ] **Step 3:** Commit `feat(intro): dynamic step-based intro with roster and modes`. ⏸ _menunggu izin commit_

### Task 12: Sinkron dokumen + QA penuh

- [x] Perbarui:
  - `docs/prd.md`: fitur profil, multiplayer, peringkat; hapus "2 pemain = giliran saja".
  - `docs/design.md`: Intro v3, race UI, token `--player-*`, avatar.
  - `docs/architecture.md`: storage v1 keys, transport ruang, privasi D1/D8.
  - `docs/specs/game-specs.md`: kolom mode per game.
  - Catatan setup Supabase Realtime (aktifkan Realtime; tanpa tabel).
- [x] `npm run lint && npm test && npm run build && npx playwright test` → semua hijau. Laporkan hasil apa adanya.
- [ ] Uji manual di tablet sungguhan: dua anak mengetuk bersamaan di layar dibagi (Review Focus 1). ⏸ _manual/perangkat fisik, belum ada bukti_
- [ ] Commit `docs: multiplayer, profiles, leaderboard`. ⏸ _menunggu izin commit_

---

## Log
- 2026-11-26: Plan dibuat. Menunggu konfirmasi keputusan D1–D10 dan metode eksekusi.
- 2026-11-26: Seluruh 12 task selesai dieksekusi dan terverifikasi:
  - `npm run lint`: 0 errors, 0 warnings.
  - `npm test` (Vitest): 43/43 file, 132/132 test lulus.
  - `npm run build` (`tsc -b && vite build`): lulus bersih (709 ms).
  - `npx playwright test` (4 proyek: `chromium-tablet`, `webkit-ipad`, `chromium-desktop`, `chromium-phone`): 138 passed, 26 skipped, 0 failed (49.5s), termasuk axe a11y di `/`, `/home`, `/game/ayo-berhitung/intro`, `/game/ayo-berhitung/play`, `/stiker`, `/pemain`, `/peringkat`, `/pendamping`.
  - `VITE_ROOM_TRANSPORT=local` + `npx playwright test e2e/online.spec.ts --project=chromium-desktop`: 2 passed, 0 failed (8.9s) untuk balapan 2-halaman `BroadcastChannel`, kode ruang salah, dan deteksi putus koneksi.
  - Commit git dilewati sesuai aturan kerja (menunggu izin eksplisit pengguna). Uji manual multi-touch 2 anak di tablet sungguhan tetap menjadi tugas verifikasi perangkat fisik.
- 2026-11-26 (lanjutan): `lobbyReducer` dan `ModePicker` telah digantikan oleh `roomReducer` (protokol v2) serta `PlaceChooser` & `PlayerSlots` dalam `docs/plan/2026-11-26-dual-mode-entry-sync-plan.md`.
- 2026-11-26 (audit checklist): centang disinkronkan dengan kode. `npm run lint` 0 error; `npm test` 47 file / 151 test lulus; `npm run build` lulus (entry 126.82 kB gzip). Tersisa: 12 langkah commit (menunggu izin) dan uji sentuh 2 anak di tablet fisik.
