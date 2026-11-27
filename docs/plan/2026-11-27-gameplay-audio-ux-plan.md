# Gameplay, Audio & UX Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

- Tanggal: 2026-11-27
- Status: **selesai — seluruh pengujian otomatis lulus; tinggal cek manual HP fisik**
- Referensi: [Design](../design.md), [Audio spec](../specs/audio.md), [Game specs](../specs/game-specs.md), [Copy](../specs/copy.md), plan sebelumnya [ux-polish](2026-11-26-ux-polish-plan.md), [multiplayer-profiles](2026-11-26-multiplayer-profiles-plan.md)

**Goal:** Ada lima perbaikan:
- pipeline suara (TTS gratis + inventaris BGM/SFX);
- G01 tetap bisa diketuk selama hitung otomatis;
- soal berbeda untuk P1/P2;
- timer hitung mundur per tingkat;
- UI yang lebih bersih, giliran di HP yang jelas, umpan balik saat salah di gerbang pendamping, dan peringkat yang selalu menampilkan semua peserta.

**Architecture:**
- **Suara:** dibuat *saat build*, bukan runtime. Skrip `scripts/tts/` menghasilkan mp3 statis ke `public/audio/speech/...` dengan skema path yang sudah ada, jadi `AudioManager` tidak berubah kecuali menambah satu `SpeechClip.kind` baru: `phrase`.
- **Gameplay:** logika baru ditulis sebagai fungsi murni yang bisa dites Vitest (env node): `roundSeeds`, `countdown`, `leaderboard`. Komponen hanya merangkai hasilnya.

**Tech Stack:** React 19, TS 6, Vite 8, Motion 14, CSS Modules, Vitest 5 (tanpa testing-library), Playwright 1.65. Untuk tooling TTS: Python 3.11 + `edge-tts` / `piper-tts`, dan `ffmpeg` (loudnorm).

**Spec:** Permintaan pengguna 2026-11-27 (4 poin + 3 screenshot: gerbang pendamping, peringkat kosong, split G01).

## A. Audit (bukti kode saat ini)

| # | Temuan | Bukti |
| --- | --- | --- |
| A1 | Tidak ada file audio sama sekali (`bundled.json` → `files: []`). Speech jatuh ke `speechSynthesis` browser, yang suaranya robotik dan tidak tersedia di semua HP. | `public/audio/bundled.json`, `AudioManager.ts:393` |
| A2 | Spec audio melarang narasi ("Tidak ada voice-over narasi"). Permintaan TTS ini **mengubah keputusan itu**, jadi spec perlu disinkronkan. | `docs/specs/audio.md` §Keputusan 1 |
| A3 | G01: hitung otomatis sudah jalan saat salah, tetapi baki **dikunci** selama berhitung (`trayLocked = locked \|\| autoCounting`). Fase `retry` juga mengunci baki selama `DUR.base`. | `AyoBerhitungRound.tsx:91`, `useRoundMachine.ts:89-96` |
| A4 | Mode `layar` (split) memakai **array ronde yang sama** untuk P1 dan P2, sehingga soalnya identik dan berdampingan (screenshot 3: 19 bintang, opsi 17/16/19 di kedua sisi). Mode `giliran` hanya mengacak urutan set yang sama. | `PlayPage.tsx:93-101,302-312`, `SplitPlay.tsx:178` |
| A5 | Belum ada timer sesi. Yang ada hanya *last-call* 45 s setelah satu pemain selesai (split). | `raceReducer.ts:4` |
| A6 | Jeje (jerapah) dirender sebagai `.buddy` dekoratif `aria-hidden`, tanpa interaksi. Di arena ≥ 600 px posisinya di kanan bawah. Audit 6 game lain: `BunyiAwalRound` (`Pipi` 140px), `SusunKataRound` (`Pipi` 140px), `MenulisHurufRound` (`Pipi` 140px), `DengarTemukanRound` (`Lulu` 96px), `TebalkanHijaiyyahRound` (`Lulu` 96px), `KartuKembarRound` (`Kuku` 96px) juga memakai `.buddy` dekoratif `aria-hidden` tanpa interaksi — dicatat saja, belum dihapus tanpa konfirmasi. | `AyoBerhitungRound.tsx:146`, `MenulisAngkaRound.tsx:53`, `Arena.module.css:44-49` |
| A7 | `TurnBanner` menampilkan "Pemain 1/2" generik dengan siluet SVG (bukan nama/avatar profil) dan otomatis hilang setelah 1 s, sehingga di HP mudah terlewat. Saat bermain juga tidak ada penanda giliran yang menetap. | `TurnBanner.tsx:44`, `PlayPage.tsx:110-117` |
| A8 | Gerbang pendamping: jawaban salah langsung menutup dialog (`setProblem(null)`) tanpa umpan balik apa pun. | `GrownUpGate.tsx:83-88` |
| A9 | Peringkat hanya berisi profil yang **punya record**. Peserta dengan skor 0 tidak muncul, dan empty state CTA-nya "Ayo main" → `/home`, bukan tambah peserta. | `leaderboard.ts:70-77`, `LeaderboardPage.tsx:200-205` |

## B. Keputusan (default; ubah sebelum eksekusi bila tidak setuju)

| ID | Keputusan |
| --- | --- |
| K1 | **TTS utama: Edge-TTS** ([rany2/edge-tts](https://github.com/rany2/edge-tts)), voice `id-ID-GadisNeural`, `rate=-10%`, `pitch=+8Hz`. Ini yang paling natural dan ramah anak untuk Bahasa Indonesia, gratis, tanpa API key. Hanya dipakai **sekali saat build**; hasilnya di-commit sebagai mp3. EN: `en-US-AnaNeural` (suara anak). |
| K2 | **Fallback offline penuh/open-source: Piper** ([OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl)), voice `id_ID-news_tts-medium`. Dipakai bila Edge-TTS tidak tersedia atau bila ada kebutuhan lisensi yang ketat. **Wajib cek MODEL_CARD lisensi voice sebelum rilis.** |
| K3 | Alternatif yang ditolak: **Kokoro** (tidak ada Bahasa Indonesia), **MMS-TTS `facebook/mms-tts-ind`** (CC-BY-NC), **Coqui XTTS-v2** (CPML non-komersial), **ElevenLabs** (berbayar). |
| K4 | Narasi dibatasi pada **frasa pendek tetap** (≤ 4 kata) lewat kind baru `phrase`. Nama anak **tidak** diucapkan karena dinamis dan tidak bisa di-generate saat build; giliran cukup diumumkan dengan frasa "Giliranmu!" + SFX `turn`. CMS tetap bisa menimpa semua klip. |
| K5 | Anti-cheat: P2 memakai `createRounds({...config, seed: roundSeed(config.seed, 2)})`. Berlaku untuk mode `layar` **dan** `giliran`. Online sudah beda perangkat → di luar cakupan. Untuk game `in-game` (G08) tidak berubah karena papannya dipakai bersama. |
| K6 | Timer = **jam sesi per pemain** (bukan per ronde). Durasi: `mudah` 60 s (default), `sedang` 90 s, `tantang` 120 s, karena tingkat lebih tinggi punya ronde lebih banyak dan angka lebih besar. Untuk `giliran`, jam bersifat chess-clock: jam pemain hanya berjalan saat gilirannya dan berhenti saat banner. Untuk `layar`, jam bersama, dan *last-call* tetap 45 s tetapi dipotong oleh sisa jam sesi. Waktu habis → sesi selesai, ronde yang belum diselesaikan bernilai 0. Online & G08/G09 tidak memakai timer di plan ini. |
| K7 | Pendamping bisa mematikan timer lewat pref baru `timerOn` (default **nyala**) di halaman Pendamping, karena timer bisa membuat anak PAUD tertekan. |
| K8 | G01: baki **selalu aktif** selama hitung otomatis. Ketuk saat hitung berjalan → hitungan dihentikan dan jawaban langsung dinilai. Salah lagi → hitung ulang dari 1. Kunci `retry` di G01 dikurangi menjadi 0 ms (`retryLockMs: 0`), cukup untuk animasi goyang tile. |
| K9 | Jeje `.buddy` dihapus dari G01 & G02. Kelas `.buddy` tetap dipakai game lain yang karakternya tidak ada di screenshot; audit visual dicatat di Task 6. |
| K10 | Gerbang pendamping, saat salah: dialog **tetap terbuka**, tombol salah bergetar dan dinonaktifkan, muncul pesan "Belum tepat, coba lagi" (`role="alert"`), dan SFX `retry` diputar. Setelah 2 kali salah, soal diganti (`createProblem()`). |
| K11 | Peringkat: semua profil aktif (non-arsip) selalu muncul, termasuk yang skornya 0, diurutkan skor ↓ lalu `createdAt` ↑. Ikon piala hanya muncul bila `best > 0`. Bila **tidak ada profil aktif**: EmptyState "Belum ada peserta" + CTA **"Tambah Peserta"** → `/pemain`. Tab "Per Game" juga menampilkan semua profil (skor 0 bila belum main game/level itu). |

## Global Constraints

- Tidak ada dependency runtime baru. TTS/ffmpeg hanya dipakai sebagai tooling dev di `scripts/tts/` dan tidak masuk bundle.
- Path speech yang ada tidak berubah: `/audio/speech/{locale}/{kind}-{key}.mp3`. Kind baru: `phrase` → `/audio/speech/{locale}/phrase-{key}.mp3`.
- Semua audio: mp3 mono 44.1 kHz, loudnorm −16 LUFS (speech) / −20 LUFS (music), dan dicatat di `public/audio/CREDITS.md` (sumber, lisensi, tanggal).
- Semua copy UI baru ditambahkan ke `src/i18n/id.ts` **dan** `en.ts`; `i18n.test.ts` harus tetap lulus.
- `calmMotion` → tanpa getar atau animasi hitung (pola yang sudah ada).
- Fungsi murni baru wajib punya unit test, dan verifikasi akhir harus lulus `npm run test`, `npm run lint`, `npm run build`, `npm run e2e`.

## Review Focus

1. **Ketuk berulang cepat saat hitung otomatis (G01).** Tidak boleh ada timer hitung yatim yang terus membunyikan `count-pop` setelah ronde berganti, dan `submit` hanya boleh dinilai sekali per ketukan. → test e2e `e2e/count-interactive.spec.ts`.
2. **Ronde P2 kebetulan identik dengan P1** (seed turunan menghasilkan count yang sama di indeks yang sama). Harus dicegah: maksimal 0 kecocokan `(objectId,count)` per indeks bila pool cukup. → unit `roundSeeds.test.ts`.
3. **Tab disembunyikan atau layar diputar saat timer berjalan.** Jam harus berhenti (pola `pausedAtRef` sudah ada di SplitPlay) dan tidak boleh langsung "waktu habis" setelah kembali. → unit `countdown.test.ts` (pause/resume).
4. **Profil diarsipkan, atau record milik profil yang sudah dihapus.** Tidak boleh muncul di peringkat dan tidak boleh crash. → unit `leaderboard.test.ts`.
5. **Mp3 speech hilang untuk satu angka.** Harus jatuh ke `speechSynthesis` tanpa error, dan `audio:check --strict` harus melaporkan file yang hilang. → test yang sudah ada di `AudioManager.test.ts` + langkah verifikasi Task 1.

---

## C. Arsitektur audio

```
scripts/tts/
  phrases.json        # daftar frasa {key, id, en}
  build-manifest.mjs  # gabung: num 0–20, letter a–z, word (content), phrase → tts-jobs.json
  gen_speech.py       # edge-tts (default) | --engine piper ; tulis mp3 → public/audio/speech/
  normalize.sh        # ffmpeg loudnorm -16 LUFS, mono, 44.1k, trim silence
public/audio/{music,ambient,sfx,speech}/   # aset statis (offline/bawaan)
CMS override → ResolvedContent → AudioUrlResolver → AudioManager (tidak berubah)
```

Frasa (`phrase`) awal:

| key | id | en |
| --- | --- | --- |
| `count-together` | Ayo hitung bersama! | Let's count together! |
| `try-again` | Coba lagi, ya! | Try again! |
| `great` | Hebat! | Great job! |
| `your-turn` | Giliranmu! | Your turn! |
| `time-up` | Waktu habis! | Time's up! |
| `ready-go` | Siap… mulai! | Ready… go! |

### Inventaris BGM & SFX

Sumber yang disetujui:
- [Kenney.nl](https://kenney.nl/assets?q=audio) — CC0
- [Pixabay Music/SFX](https://pixabay.com/sound-effects/) — Pixabay Content License, tanpa atribusi wajib
- [Freesound](https://freesound.org) — filter **CC0** saja
- [OpenGameArt](https://opengameart.org) — CC0
- [Incompetech](https://incompetech.com) — CC-BY 4.0, atribusi di CREDITS

| ID | Lapisan | Kebutuhan | Sumber utama (kata kunci pencarian) | Status |
| --- | --- | --- | --- | --- |
| `home` | music | Ukulele/glockenspiel ceria 100–115 BPM, loop | Pixabay Music: "kids ukulele happy" | ada slot |
| `world-angka` | music | Marimba bouncy | Pixabay: "marimba playful children" | ada slot |
| `world-huruf` | music | Xylophone/celesta manis | Pixabay: "xylophone cute" | ada slot |
| `world-hijaiyyah` | music | Tanpa perkusi, kotak musik/pad | Pixabay: "music box lullaby" | ada slot |
| `world-memori` | music | Ukulele pantai | Pixabay: "ukulele beach kids" | ada slot |
| `result-jingle` | music | Jingle naik 3–5 s | Kenney *Music Jingles* (CC0) | ada slot |
| `tap`, `select` | sfx | Klik bubble/kayu | Kenney *Interface Sounds* / *UI Audio* | ada slot |
| `correct` | sfx | Chime 2 nada naik | Kenney *Interface Sounds* ("confirmation") | ada slot |
| `retry` | sfx | "Bwoop" turun lembut, bukan buzzer | Kenney *Interface Sounds* ("error" lembut) / Freesound CC0 "soft boop" | ada slot |
| `count-pop` | sfx | Pop bulat | Kenney *Interface Sounds* ("pluck"/"drop") | ada slot |
| `kids-yay`, `kids-cheer` | sfx | Sorak anak | Pixabay SFX: "kids yay", "children cheering" | ada slot |
| **`tick`** (baru) | sfx | Tik lembut 5 detik terakhir | Kenney *Interface Sounds* ("tick") | **baru** |
| **`time-up`** (baru) | sfx | Gong/chime turun lembut | Kenney *Music Jingles* (jingle pendek minor lembut) | **baru** |
| **`go`** (baru) | sfx | "Ding" mulai setelah 3-2-1 | Kenney *Digital Audio* ("powerUp") | **baru** |

---

## Task 1: Pipeline TTS + kind `phrase` + SFX baru

**Files:**
- Create: `project/scripts/tts/phrases.json`, `project/scripts/tts/build-manifest.mjs`, `project/scripts/tts/gen_speech.py`, `project/scripts/tts/normalize.sh`, `project/scripts/tts/README.md`
- Modify: `project/src/lib/audio/types.ts` (SpeechClip + `SFX_IDS`), `project/src/lib/audio/manifest.ts` (`speechPath`), `project/scripts/check-audio.mjs`, `project/package.json` (`"audio:tts"`), `docs/specs/audio.md` (keputusan 1 → frasa pendek K4; §3 tambah `tick`/`time-up`/`go`; §4 tambah `phrase`), `project/public/audio/CREDITS.md`
- Test: `project/src/lib/audio/AudioManager.test.ts`

**Interfaces:**
- Produces: `SpeechClip` += `{ kind: 'phrase'; locale: 'id' | 'en'; key: PhraseId }`; `PHRASE_IDS = ['count-together','try-again','great','your-turn','time-up','ready-go'] as const`; `SFX_IDS` += `'tick' | 'time-up' | 'go'`.

- [ ] **Step 1:** Tes gagal: `speechPath({kind:'phrase',locale:'id',key:'try-again'}) === '/audio/speech/id/phrase-try-again.mp3'`.
- [ ] **Step 2:** `npx vitest run src/lib/audio` → FAIL (kind belum ada).
- [ ] **Step 3:** Tambahkan tipe, `PHRASE_IDS`, case `phrase` di `speechPath`, dan SFX baru. Update `check-audio.mjs` agar membaca `PHRASE_IDS`.
- [ ] **Step 4:** `npx vitest run src/lib/audio` → PASS.
- [ ] **Step 5:** Tulis `gen_speech.py` dengan argumen `--engine edge|piper`, `--locale id|en`, `--only <kind>`, `--force`. File yang sudah ada dilewati kecuali `--force`. Setiap output dilewatkan ke `normalize.sh`.
- [ ] **Step 6:** Jalankan `npm run audio:tts -- --locale id` lalu `npm run audio:check -- --strict --game ayo-berhitung` → 0 file speech hilang untuk G01. Dengarkan 5 sampel dan nilai: jelas, tempo anak, tanpa klik di awal/akhir.
- [ ] **Step 7:** Commit `feat(audio): build-time TTS pipeline + phrase clips + timer sfx`.

## Task 2: G01 baki interaktif selama hitung otomatis

**Files:**
- Modify: `project/src/games/engines/choice/useRoundMachine.ts`, `project/src/games/ayo-berhitung/AyoBerhitungRound.tsx`
- Test: `project/e2e/count-interactive.spec.ts` (baru)

**Interfaces:**
- Produces: `UseRoundMachineOptions.retryLockMs?: number` (default `Math.round(DUR.base*1000)`; G01 memberi `0`).

- [ ] **Step 1:** Tulis tes e2e. Di G01 `level=mudah`: ketuk opsi salah → assert badge `1` muncul (hitung berjalan) → dalam ≤ 300 ms ketuk opsi benar → assert tile `state=correct`, lalu ronde berganti.
- [ ] **Step 2:** `npx playwright test count-interactive` → FAIL (baki `pointer-events:none`).
- [ ] **Step 3:** `trayLocked = locked` (hapus `autoCounting`). `handlePickOption` memanggil `clearAutoTimers()` sebelum `submit`. Saat `onWrong`, mainkan `retry` lalu `startAutoCount()` + frasa `count-together` (bila `!pane?.quiet`). Teruskan `retryLockMs: 0`. Bila `retryLockMs === 0`, `submit` langsung kembali ke `waiting`.
- [ ] **Step 4:** Tes PASS, lalu `npx vitest run` tetap hijau.
- [ ] **Step 5:** Commit `feat(g01): keep number tiles clickable during auto-count`.

## Task 3: Soal berbeda P1/P2 (anti-cheat)

**Files:**
- Create: `project/src/lib/random/roundSeeds.ts`, `project/src/lib/random/roundSeeds.test.ts`
- Modify: `project/src/pages/Play/PlayPage.tsx:93-101,302-312`, `project/src/pages/Play/SplitPlay.tsx` (prop `rounds` → `roundsByPlayer: Record<PlayerNumber, readonly unknown[]>`)

**Interfaces:**
- Produces:
  - `roundSeed(baseSeed: number, player: PlayerNumber): number` — P1 mengembalikan `baseSeed` (supaya replay/URL tetap kompatibel); P2 mengembalikan hash deterministik `(baseSeed ^ 0x9e3779b9) >>> 0`.
  - `createPlayerRounds<R>(mod: GameModule<R>, config, content): Record<PlayerNumber, readonly R[]>`. Untuk P2, coba hingga 4 seed turunan; pilih yang jumlah tabrakan `JSON.stringify(r1[i]) === JSON.stringify(r2[i])`-nya paling kecil.

- [ ] **Step 1:** Unit test:
  - `roundSeed(42,1) === 42`
  - `roundSeed(42,2) !== 42`
  - deterministik untuk input yang sama
  - untuk G01 `mudah`, seed 1..200: `collisions(p1,p2) === 0` di ≥ 95% seed, dan panjang `p1.length === p2.length`
- [ ] **Step 2:** FAIL → implementasikan → PASS.
- [ ] **Step 3:** PlayPage memakai `createPlayerRounds` bila `players === 2 && turnMode === 'per-round'`, lalu menghapus `shuffle(p1)`. SplitPlay memakai `roundsByPlayer[playerNum]`. `totalRounds` diambil dari `roundsByPlayer[player].length`.
- [ ] **Step 4:** Tambahkan assert di `e2e/split.spec.ts`: teks opsi pane 1 ≠ pane 2 pada ronde pertama (seed tetap di URL).
- [ ] **Step 5:** `npm run test && npx playwright test split phone-split` PASS, lalu commit `feat(play): distinct rounds per player in 2-player modes`.

## Task 4: Timer hitung mundur berbasis tingkat

**Files:**
- Create: `project/src/lib/timer/countdown.ts`, `project/src/lib/timer/countdown.test.ts`, `project/src/lib/timer/useCountdown.ts`, `project/src/components/CountdownPill/CountdownPill.tsx` + `.module.css`
- Modify: `project/src/app/providers/preferences.ts` (+`timerOn`), `project/src/pages/Parents/ParentsPage.tsx` (toggle), `project/src/pages/Play/playReducer.ts` (+`TIME_UP`), `project/src/pages/Play/PlayPage.tsx`, `project/src/lib/race/raceReducer.ts` (+`sessionEndsAt`, `TIME_UP` via `TICK`), `project/src/pages/Play/SplitPlay.tsx`, `project/src/games/catalog.ts` (+`timed: boolean`; `false` untuk `kartu-kembar`, `petualangan-labirin`), i18n `timer.label`, `timer.timeUp`, `parents.timerOn`

**Interfaces:**
- Produces:
  - `TIME_LIMIT_MS: Record<DifficultyId, number> = { mudah: 60_000, sedang: 90_000, tantang: 120_000 }`
  - `interface Clock { readonly remainingMs: number; readonly runningSince: number | null }`
  - `startClock(c, now)`, `pauseClock(c, now)`, `remainingAt(c, now): number`, `isExpired(c, now): boolean` — semuanya murni
  - `useCountdown({ durationMs, running, onExpire }): { remainingMs }` — interval 250 ms, otomatis pause saat `document.hidden`
  - `<CountdownPill remainingMs warnBelowMs={10_000} />`: format `m:ss`, `role="timer"`, `aria-live="off"`, berubah ke warna coral dan berdenyut < 10 s (statis bila calm)
  - `playReducer`: action `{ type: 'TIME_UP'; player: PlayerNumber; turns }`. Bila `players===1` → `finished`. Bila `giliran` → semua giliran tersisa milik pemain itu di-skip; bila tidak ada lagi giliran → `finished`.
  - `raceReducer`: `createInitialRaceState(skipCountdown, sessionMs?)`. `GO` menetapkan `sessionEndsAt = now + sessionMs`. `TICK` menyelesaikan race bila `now >= min(lastCallEndsAt, sessionEndsAt)`.

- [ ] **Step 1:** Unit test `countdown.test.ts`:
  - `remainingAt` turun linear
  - `pause` → `resume` mengembalikan waktu yang dijeda
  - tidak pernah di bawah 0
  - `isExpired` tepat di 0
- [ ] **Step 2:** Unit test `playReducer.test.ts`:
  - `TIME_UP` solo → `finished`
  - `TIME_UP` P1 di giliran → giliran P1 tersisa dibuang, P2 lanjut
- [ ] **Step 3:** Unit test `raceReducer.test.ts`:
  - `TICK` setelah `sessionEndsAt` → `finished` walau belum ada yang selesai
  - last-call dipotong oleh `sessionEndsAt` bila lebih awal
- [ ] **Step 4:** Semua FAIL → implementasikan fungsi murni + reducer → PASS.
- [ ] **Step 5:** UI:
  - `CountdownPill` di slot `TopNav center` (solo/giliran, di sebelah `RoundDots`) dan di `paneHeader` SplitPlay.
  - SFX `tick` tiap detik pada 5 s terakhir.
  - Saat habis: SFX `time-up` + frasa `time-up`, overlay 1.2 s "Waktu habis!", lalu finalize.
  - Jam berhenti selama `turn-banner`, `countdown` 3-2-1, dan `RotatePrompt`.
  - Timer tidak dirender bila `!prefs.timerOn || !entry.timed || mode==='online'`.
- [ ] **Step 6:** e2e `e2e/timer.spec.ts`: pakai `page.clock.install()`, mainkan G01 solo `mudah`, `clock.fastForward(61_000)` → navigasi ke `/result`, dan skor = ronde yang selesai.
- [ ] **Step 7:** `npm run test && npx playwright test timer split` PASS, lalu commit `feat(play): difficulty-based session countdown`.

## Task 5: Penanda giliran di HP (pass-and-play)

**Files:**
- Modify: `project/src/components/TurnBanner/TurnBanner.tsx` + `.module.css`, `project/src/pages/Play/PlayPage.tsx`, `project/src/pages/Play/playReducer.ts`, i18n `play.turnReady` ("Aku siap!")
- Test: `project/e2e/flows.spec.ts` (tambah kasus), `project/src/pages/Play/playReducer.test.ts`

**Interfaces:**
- Consumes: `Profile` (`name`, `avatar`, `color`) dari `profilesById`.
- Produces: `TurnBannerProps = { profile: Pick<Profile,'name'|'avatar'|'color'>; visible: boolean; variant: 'handoff' | 'chip'; onReady?: () => void }`.

- [ ] **Step 1:** Unit test: status `turn-banner` **tidak** berubah tanpa `BANNER_DONE` (tidak ada auto-dismiss di reducer; sudah benar, kunci perilaku ini dengan test).
- [ ] **Step 2:** `variant='handoff'`:
  - overlay layar penuh berwarna `var(--player-{color})`
  - `AnimalAvatar` 120 px + "Giliran {name}!" ukuran `t-display`
  - tombol besar **"Aku siap!"** (`onReady` → `BANNER_DONE`)
  - SFX `turn` + frasa `your-turn`
  - Fallback: auto-lanjut 4 s **hanya** di viewport ≥ 600 px. Di HP < 600 px anak wajib mengetuk "Aku siap!", supaya HP sempat berpindah tangan.
- [ ] **Step 3:** `variant='chip'`: chip avatar + nama yang menetap di `TopNav` (slot kiri setelah tombol back) selama `playing` di mode `giliran`.
- [ ] **Step 4:** Hapus siluet `PlayerAnimalSvg` dan timer 1000 ms di `PlayPage.tsx:110-117`.
- [ ] **Step 5:** e2e di proyek HP (390×844): G01 `mode=giliran`, P1 selesaikan ronde via `__MSZ_TEST__.solveRound` → overlay dengan nama profil P2 terlihat → klik "Aku siap!" → chip menampilkan nama P2.
- [ ] **Step 6:** PASS, lalu commit `feat(play): profile-aware handoff banner and turn chip`.

## Task 6: Decluttering (hapus Jeje dekoratif)

**Files:**
- Modify: `project/src/games/ayo-berhitung/AyoBerhitungRound.tsx:146-148`, `project/src/games/menulis-angka/MenulisAngkaRound.tsx:53-55` (hapus import `Jeje` + `.buddy`; hapus `mood` yang tidak terpakai)
- Test: `e2e/__screenshots__` (perbarui baseline G01/G02)

- [ ] **Step 1:** Hapus blok `.buddy` di kedua file, lalu `npm run lint` (tanpa import/variabel tak terpakai).
- [ ] **Step 2:** Audit 6 game lain yang memakai `.buddy`. Bila karakter juga murni dekoratif dan ikut menyempitkan area soal, catat di tabel A plan ini. **Jangan dihapus tanpa konfirmasi** (di luar permintaan).
- [ ] **Step 3:** `npx playwright test --update-snapshots desktop` → tinjau diff, pastikan hanya karakter yang hilang. Commit `chore(arena): remove decorative giraffe from number games`.

## Task 7: Gerbang pendamping, umpan balik saat salah

**Files:**
- Modify: `project/src/components/GrownUpGate/GrownUpGate.tsx` + `.module.css`, i18n `gate.wrong` ("Belum tepat, coba lagi" / "Not quite, try again")
- Test: `project/e2e/a11y.spec.ts` atau `e2e/flows.spec.ts` (kasus gate)

**Interfaces:**
- Produces: `GrownUpGate` menambah state internal `wrong: ReadonlySet<number>`, `wrongCount: number`. Prop tidak berubah.

- [ ] **Step 1:** e2e: tahan pemicu 2 s → klik opsi ≠ jawaban:
  - assert dialog masih `open`
  - `getByRole('alert')` berisi `gate.wrong`
  - tombol salah `disabled`
  - klik jawaban benar → `onPass` (halaman Pendamping terbuka)
- [ ] **Step 2:** FAIL → implementasikan. `handleAnswer` salah: `audio.sfx('retry')`, tambah ke `wrong`, getar `x:[0,-8,8,-4,0]` 300 ms (dilewati bila calm). Bila `wrongCount===2` → `setProblem(createProblem())` + reset `wrong`. Bila benar → reset lalu `onPass()`.
- [ ] **Step 3:** PASS + axe tanpa pelanggaran baru, lalu commit `feat(gate): corrective feedback on wrong answer`.

## Task 8: Peringkat, semua peserta + CTA "Tambah Peserta"

**Files:**
- Modify: `project/src/lib/scores/leaderboard.ts`, `project/src/pages/Leaderboard/LeaderboardPage.tsx`, `project/src/components/EmptyState/EmptyState.tsx` (+prop `actionIcon?: IconName`, default `'play'`), `project/src/components/icons/Icon.tsx` (+`'plus'` bila belum ada), i18n `leaderboard.noPlayers` ("Belum ada peserta"), `leaderboard.addPlayer` ("Tambah Peserta")
- Test: `project/src/lib/scores/leaderboard.test.ts`, `project/e2e/leaderboard.spec.ts`

**Interfaces:**
- Produces: `leaderboard(...)` mengembalikan baris untuk **setiap** profil aktif. Profil tanpa record: `best:0, plays:0, bestStars:1, isNewRecord:false, lastImprovement:0, mostImproved:false`.

- [ ] **Step 1:** Unit test:
  - 3 profil aktif + 1 arsip, record hanya untuk A → `rows.length === 3`, A rank 1, B & C `best 0` dengan rank sama (2), urut `createdAt`
  - profil arsip tidak ikut
  - record dengan `profileId` tak dikenal diabaikan
  - filter per-game: profil tanpa record game itu muncul dengan 0
- [ ] **Step 2:** FAIL → seed `byProfile` dengan semua `activeById` (list kosong), lalu tangani `sorted.length===0` sebelum `Math.max` → PASS.
- [ ] **Step 3:** UI:
  - `rows.length===0` (tidak ada profil) → `EmptyState message=leaderboard.noPlayers actionLabel=leaderboard.addPlayer actionIcon='plus' onAction=() => navigate('/pemain')`
  - piala hanya bila `row.best > 0`
  - chip `plays` disembunyikan bila 0
  - Bila profil ada tetapi semua skornya 0, tampilkan daftar + teks kecil `leaderboard.empty` di atasnya (CTA "Ayo main" tetap di bawah daftar)
- [ ] **Step 4:** e2e:
  - storage kosong → tombol "Tambah Peserta" terlihat → klik → URL `/pemain`
  - buat 2 profil tanpa main → 2 baris dengan "0 poin"
- [ ] **Step 5:** PASS, lalu commit `feat(leaderboard): list all players and add-player empty CTA`.

## Task 9: Sinkronisasi dokumen & verifikasi akhir

**Files:**
- Modify: `docs/specs/audio.md` (bila belum di Task 1), `docs/specs/game-specs.md` (G01 baki aktif, timer, soal beda P1/P2), `docs/specs/copy.md` (string baru), status plan ini

- [ ] **Step 1:** Perbarui spec sesuai K4–K11.
- [ ] **Step 2:** `npm run lint && npm run test && npm run build && npm run e2e` → semua PASS. Tulis hasil aktual di §Verifikasi.
- [ ] **Step 3:** Cek manual di HP fisik:
  - giliran G01 dengan nama profil
  - timer + tab disembunyikan
  - split dengan soal berbeda
  - suara TTS terdengar natural
- [ ] **Step 4:** Commit `docs: sync specs for gameplay/audio/ux update`.

## Acceptance criteria

- [x] Klip `num 0–20`, `letter a–z`, `word`, dan `phrase` (`id` & `en`, total 181 file) ada sebagai mp3; `audio:check --strict --only speech` lulus (0 hilang); `bundledFiles.json` & `CREDITS.md` terisi.
- [x] Inventaris BGM/SFX (§C) terpetakan; slot `tick`/`time-up`/`go` ada di kode dan di spec.
- [x] G01: tile angka bisa diketuk saat hitung otomatis berjalan; salah jawab memicu hitung + suara korektif (`retry` + frasa `count-together`).
- [x] Split & giliran: soal P1 ≠ P2 pada indeks yang sama (seed tetap).
- [x] Timer 60/90/120 s per tingkat tampil, bisa dimatikan pendamping (`timerOn`), menjeda saat banner/rotate/tab tersembunyi, dan mengakhiri sesi saat habis.
- [x] Jeje tidak lagi tampil di arena G01/G02.
- [x] HP giliran: overlay nama + avatar profil, tombol "Aku siap!", chip giliran menetap.
- [x] Gerbang pendamping: salah → dialog tetap terbuka dengan pesan, getar, dan suara; 2× salah → soal baru.
- [x] Peringkat: semua profil aktif tampil (termasuk 0); tanpa profil → CTA "Tambah Peserta" → `/pemain`.

## Verifikasi

- `npm run audio:check -- --write-index --strict --only speech` → PASS (`[speech-num] 42/42`, `[speech-letter] 52/52`, `[speech-word] 75/75`, `[speech-phrase] 12/12`, 181 bundled files ditulis ke `public/audio/bundled.json` dan `src/lib/audio/bundledFiles.json`)
- `npm run lint` → PASS (0 errors, 0 warnings)
- `npm run test` → PASS (55 test files, 191 tests passed)
- `npm run build` → PASS (`tsc -b && vite build`, 814 modules)
- `npm run e2e` → PASS (241 passed, 0 failed, 83 skipped across `chromium-tablet`, `webkit-ipad`, `chromium-desktop`, `chromium-phone`, `chromium-online`)
- Cek manual di HP fisik: menunggu verifikasi pengguna (giliran G01 dengan nama profil, timer + tab disembunyikan, split soal berbeda, kualitas suara TTS).

## D. Addendum 2026-11-27 — audit suara & keputusan pengguna

Keputusan pengguna:
- **Motion memakai tier gratis saja.** Paket `motion` (MIT) via `motion/react`. Tidak ada Motion+ (berbayar); hasil dokumentasi berlabel Motion+ diabaikan.
- **Suara: pakai engine yang sudah disebut (Edge-TTS gratis), tidak menunggu voice-over manusia.** Termasuk hijaiyyah.

Audit `npm run audio:check` **sebelum** perbaikan:

| Lapisan | Ada | Dampak |
| --- | --- | --- |
| speech num/letter/word/phrase | 181/181 | OK |
| **speech hija** | **0/28** | G06 diam. Di production `audioReviewed=false` → G06 **terkunci** "Segera hadir". Di dev jatuh ke `speechSynthesis` `ar-SA` yang membaca ID Latin ("alif"). |
| **sfx** | **0/20** | Semua klik/benar/salah/timer **senyap** (`sceneAudioUrl` → `null`, dilewati tanpa error). |
| **music** | **0/6** | Tanpa BGM. |
| **ambient** | **0/4** | Tanpa suara latar. |

Perbaikan yang sudah dijalankan:
- [x] Hijaiyyah TTS: `HIJAIYYAH_AR` (28 nama huruf gaya iqro berharakat) di `scripts/tts/build-manifest.mjs`, locale `ar` → `ar-SA-ZariyahNeural` rate −20 % di `gen_speech.py`, plus perbaikan crash cetak Unicode di konsol Windows. Hasil: 28 mp3 berdurasi 0.4–0.7 s.
- [x] `audioReviewed` untuk klip bawaan = `audioUrl !== null` (`defaults.ts`). CMS tanpa file mewarisi status bawaan (`resolve.ts`). Test: `defaults.test.ts`, `resolve.test.ts`, `readiness.test.ts` (G06 siap di production dengan klip yang dikirim).
- [x] SFX: 3 paket Kenney CC0 → 20 slot `sfx/*` + `music/result-jingle` lewat `scripts/audio/import_sfx.py`. `kids-yay`/`kids-giggle`/`kids-cheer` masih **placeholder** (jingle/pluck), bukan suara anak.
- [x] `audio:check --write-index` → 230 file bundled. Seluruh 230 mp3 berhasil di-decode ffmpeg tanpa error.

Sisa (belum dikerjakan):
- [x] **Music 6/6 + ambient 4/4 terisi** (permintaan 2026-11-27: suara latar di beranda + setiap game). Disintesis sendiri (CC0) oleh `scripts/audio/gen_scene_audio.py` sesuai brief §2 spec audio. Bug autoplay diperbaiki: loop yang diblokir sebelum ketukan pertama kini dimulai ulang saat `unlock()` / saat content resolver siap (test di `AudioManager.test.ts`). Hasil ukur: music 70–82 s, −20.5 LUFS, peak ≤ −6 dBFS, 1.1–1.3 MB; ambient 48 s, −26 LUFS, 375 kB.
- [ ] Suara anak asli untuk `kids-*` (Pixabay SFX "kids yay"/"children cheering").
- [ ] Dengarkan manual: 28 klip hijaiyyah (terutama `ain`, `ghain`, `hha`, `shad`, `dhad`, `tha`, `zha`) + pemetaan SFX (`retry` harus lembut, bukan buzzer).
- [ ] G07 `tebalkan-hijaiyyah` tetap `status: 'soon'` karena **review glyph tracing** (`traceReviewed`), bukan audio. Di luar cakupan addendum ini.

Verifikasi addendum: `npm run test` 201/201 PASS, `npm run lint` PASS, `npm run build` PASS, `npx playwright test` 254 passed / 86 skipped / 0 failed.

## Risiko dan rollback

- **Edge-TTS** memakai endpoint Microsoft yang tidak resmi; endpoint bisa berubah dan ToS-nya ambigu untuk redistribusi. Mitigasi: generate sekali lalu commit mp3, siapkan engine Piper sebagai fallback (K2), dan klip tetap bisa diganti lewat CMS/rekam suara (VoiceRecorder sudah ada).
- **Timer** bisa membuat anak stres. Mitigasi: durasi longgar, toggle pendamping (K7), dan tidak ada penalti selain ronde tidak selesai.
- **Seed P2** mengubah isi ronde P2 untuk URL lama (`giliran` sebelumnya memakai shuffle). Dampaknya hanya replay yang tidak identik, tanpa data hilang.
- **Rollback:** setiap task punya commit sendiri → `git revert <sha>` per fitur. Aset audio hanya berupa file statis tambahan.
