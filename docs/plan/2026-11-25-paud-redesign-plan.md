# PAUD Redesign Plan v2.1 — Restrukturisasi, Redesign & Recoding

- Tanggal: 2026-11-25 · Revisi: v2.2 (v2.1: detail eksekusi untuk AI & audio tanpa voice-over; v2.2: integrasi CMS Supabase + login admin)
- Status: **in-progress** — Seluruh task AI Fase 0–7 selesai; tersisa task manusia (T5.6, T6.3, T6.4, T7.6, T7.8)
- Menggantikan: [plan v1](../archive/plan-v1-2026-11-25-paud-redesign.md)
- Dokumen wajib (baca semuanya sebelum task pertama):

| Dokumen | Isi | Otoritas |
| --- | --- | --- |
| [Brief asli](../archive/brief.md) | Kebutuhan awal pengguna | Sumber kebutuhan |
| [PRD](../prd.md) | Tujuan, katalog G01–G09, FR | Produk |
| [Design v2](../design.md) | Token, komponen, motion, layout | Visual & interaksi |
| [Architecture](../architecture.md) | Stack, struktur aktual | Teknis |
| [AI agents](../ai-agents.md) | Konvensi kerja agen | Workflow |
| [specs/game-specs](../specs/game-specs.md) | Mekanik rinci G01–G09, tracing | Perilaku game |
| [specs/content](../specs/content.md) | Kata, angka, huruf, hijaiyyah, objek, stiker | Konten |
| [specs/audio](../specs/audio.md) | Musik, ambient, SFX anak-anak, klip bicara, API | Audio |
| [specs/assets-brief](../specs/assets-brief.md) | Latar, karakter, objek, ikon | Aset visual |
| [specs/copy](../specs/copy.md) | Semua teks UI ID/EN | Teks |
| [specs/cms](../specs/cms.md) | CMS Supabase, login admin, manifest konten | CMS & data konten |
| [plan CMS](2026-11-25-cms-admin-plan.md) | Task C0–C7 (dieksekusi berdampingan dengan plan ini, lihat §1 plan CMS) | Plan pendamping |

---

## 0. Cara mengeksekusi plan ini (WAJIB dibaca AI pelaksana)

### 0.1 Aturan kerja

1. **Kerjakan task sesuai urutan ID.** Jangan memulai task sebelum semua `Bergantung pada` di task tersebut berstatus `[x]`. Task bertanda `‖` boleh dikerjakan paralel dengan task lain di fase yang sama.
2. **Satu task = satu unit kerja tuntas.**
   - Selesaikan langkahnya, jalankan bagian *Verifikasi*, lalu centang `[x]` pada task dan tambahkan baris di §8 Log Eksekusi (tanggal, task, hasil verifikasi singkat, catatan).
   - Jangan mencentang task yang verifikasinya belum dijalankan atau gagal.
3. **Gerbang kualitas setiap task** (jalankan dari `project/`):
   ```bash
   npm run lint && npm test && npm run build
   ```
   Ketiganya harus lulus tanpa error **dan tanpa warning baru**. Jika gagal, perbaiki sebelum lanjut.
4. **Aplikasi harus tetap bisa dijalankan setiap kali task selesai.** Halaman lama tetap berfungsi sampai digantikan di Fase 4 (strategi *strangler*): komponen baru dibangun berdampingan, lalu rute dialihkan, lalu kode lama dihapus.
5. **Spesifikasi adalah hukum.**
   - Jika spesifikasi kurang jelas, bertentangan, atau tidak bisa diimplementasikan: **berhenti**, tulis pertanyaan di §8 Log dengan label `BLOCKED:`, lalu tanya pengguna.
   - Jangan menebak keputusan produk/visual. Keputusan teknis kecil yang tidak mengubah perilaku (nama variabel lokal, pemecahan file internal) boleh diambil sendiri.
6. **Dilarang tanpa izin eksplisit pengguna:**
   - commit, push, deploy;
   - menambah dependensi di luar daftar §3.6;
   - mengubah ID game/URL;
   - menghapus file di luar daftar hapus task;
   - menambah Tailwind/GSAP/Phaser/Next.js/backend/analitik.
7. **Jangan meninggalkan TODO kosong, data dummy, atau teks hardcoded** di kode yang dinyatakan selesai. Placeholder yang memang disengaja (audio yang belum ada) harus melewati mekanisme fallback yang ditentukan, bukan file palsu.
8. Task bertanda **HUMAN** dikerjakan manusia. AI hanya menyiapkan prasyarat dan memverifikasi hasilnya.

### 0.2 Konvensi kode

| Hal | Aturan |
| --- | --- |
| Bahasa | TypeScript strict, tanpa `any` (kecuali tipe generik `GameModule<any>` di catalog, diberi komentar) |
| Import | Pakai alias `@/` (sudah ada di `vite.config.ts`) untuk lintas-folder; relatif hanya dalam folder yang sama |
| Komponen | `PascalCase.tsx` + `PascalCase.module.css` di folder yang sama; satu komponen publik per file; named export (kecuali modul game: `export default`) |
| Hook | `useCamelCase.ts` |
| Logika murni | File `.ts` terpisah dari komponen + `*.test.ts` di sebelahnya |
| CSS | Hanya token `var(--…)`. **Tidak ada literal hex/rgb** di `*.module.css` (pengecualian: `src/design/tokens.css`, `src/worlds/**`, `src/assets/illustrations/**`) |
| Teks | Hanya lewat `t()`. Tidak ada string literal yang terlihat di JSX |
| Acak | Hanya `createRng(seed)` dari `@/lib/random/rng`. `Math.random()` hanya boleh di Intro untuk membuat seed |
| Animasi | Komponen `m.*` dari `motion/react` (LazyMotion strict sudah aktif); semua durasi/spring dari `@/design/motion` |
| Konten | Game & halaman anak membaca objek/kata/hijaiyyah/URL media hanya lewat `useContent()` (`@/lib/content`), bukan import langsung `src/content/*` (kecuali `glyphs/` dan `lib/content/defaults.ts`) |
| Supabase | `@supabase/supabase-js` hanya boleh di-import dari `src/admin/**` dan `src/lib/supabase/**` (ESLint `no-restricted-imports`, plan CMS C0.2) |
| Efek samping | Setiap `useEffect` yang menambah listener/timer/rAF/audio wajib punya cleanup |

**Perintah pengecekan konvensi** (dipakai di Verifikasi, dijalankan dari root repo):

```bash
# hex di CSS module (harus kosong)
grep -rnE "#[0-9a-fA-F]{3,8}\b|rgba?\(" project/src --include=*.module.css
# teks literal di JSX (harus kosong; abaikan baris yang hanya berisi simbol/angka)
grep -rnE ">[[:space:]]*[A-Za-z][A-Za-z ,.!?'’-]{2,}[[:space:]]*<" project/src --include=*.tsx | grep -v "/_kit/"
# Math.random di luar Intro (harus kosong)
grep -rn "Math.random" project/src | grep -v "pages/Intro/" | grep -v ".test.ts"
```

### 0.3 Definisi "Selesai" untuk sebuah game (DoD-Game)

Game boleh diubah ke `status: 'ready'` di `catalog.ts` hanya jika semua poin ini terpenuhi (_templat per game, bukan tugas: tidak dicentang di sini; pembuktiannya ada di task game masing-masing dan Log_):

- [ ] Semua perilaku di `specs/game-specs.md` untuk game itu sudah diimplementasikan.
- [ ] 3 level menghasilkan materi berbeda sesuai tabel level.
- [ ] Bisa dimainkan di locale `id` dan `en`, dan teks/kata mengikuti locale.
- [ ] Mode 1 anak dan 2 anak berjalan, dengan giliran dan hasil per pemain.
- [ ] Feedback benar/salah/idle sesuai game-specs §0.3–§0.4, dan reduced/calm motion tetap bisa diselesaikan.
- [ ] Tes wajib game dan engine-nya lulus.
- [ ] `computeReadiness(gameId, { production: true })` bernilai `ready` untuk kedua locale, baik dengan konten bawaan maupun manifest CMS terbit ([cms §7](../specs/cms.md#7-aturan-kelengkapan-dipakai-cms-dan-app-anak)). `npm run audio:check -- --game <id>` hanya informasi untuk file bawaan.
- [ ] Tidak ada error/warning di console selama 1 sesi penuh di dev.
- [ ] E2E alur game itu lulus (setelah T7.2 tersedia; sebelum itu, uji manual dan catat di Log).

---

## 1. Keputusan terkunci

| # | Keputusan | Sumber |
| --- | --- | --- |
| D1 | Target anak 4–6 tahun, bisa dimainkan tanpa membaca | Pengguna |
| D2 | Warna hybrid: latar pastel, elemen interaktif `--blue-500 #0A8FD6` / `--pink-500 #E8458B` dengan huruf putih ≥ 20 px bold | Pengguna |
| D3 | Motion (`motion/react`) + CSS Modules. GSAP tidak dipakai (lihat T6.5). Tailwind tidak dipakai | Pengguna |
| D4 | Konsep 4 dunia per kategori (Angka, Huruf, Hijaiyyah, Ingat & Main) dengan karakter orisinal | Pengguna |
| D5 | **Tanpa voice-over narasi/instruksi.** Suasana diisi musik + ambient + SFX suara anak-anak (bebas royalti). Instruksi disampaikan lewat demo tangan animasi (ghost hand) dan visual | Pengguna (2026-11-25) |
| D6 | Klip bicara pendek hanya untuk angka, nama huruf, kata, dan hijaiyyah (G01–G07) | Pengguna (2026-11-25) |
| D7 | Musik/SFX dari Pixabay/Freesound (CC0/CC-BY). AI menyiapkan manifest + placeholder, manusia memilih file | Pengguna (2026-11-25) |
| D8 | Musik **nyala** secara default (gain 0.35). Bisa dimatikan di Pengaturan pendamping | Turunan D5 |
| D9 | Hadiah berupa stiker per sesi selesai. Tanpa skor, streak, peringkat, atau bintang penilaian | Design §2.2 |
| D10 | Dua pemain bergiliran di satu perangkat. Tanpa split-screen | PRD FR04 |
| D11 | **Anak tanpa akun.** Progres/preferensi anak hanya di `localStorage`/`sessionStorage`. Satu-satunya backend adalah **Supabase untuk CMS admin** (login username + password di `/admin/login`). App anak hanya GET file publik. Tanpa analitik/iklan | PRD FR07–FR08, [cms](../specs/cms.md) (revisi 2026-11-25) |
| D13 | Gambar objek, klip suara, musik/SFX, serta daftar objek/kata/hijaiyyah dikelola lewat CMS dan dibaca app anak dari manifest terbit, dengan fallback ke konten bawaan. Game **wajib** membaca konten lewat `useContent()` | Pengguna (2026-11-25) |
| D12 | ID game & URL `/game/:gameId/*` dipertahankan | Kompatibilitas |

---

## 2. Audit codebase (snapshot 2026-11-25)

### 2.1 Baseline teknis

| Perintah (`project/`) | Hasil |
| --- | --- |
| `npm run lint` | 0 error, 0 warning |
| `npm test` | Vitest 5.1: 2 file, 5 tes lulus |
| `npm run build` | Lulus. JS 386.07 kB (gzip 124.41 kB), CSS 30.88 kB, 1 chunk |

Stack: React 19.3, TypeScript ~6.0, Vite 8.3, React Router 7.18, Motion 14.14, Vitest 5.1, ESLint 10, Prettier 3. Font dimuat dari Google Fonts CDN di `index.html`. Alias `@` → `src` sudah ada.

### 2.2 Struktur aktual

```text
project/src/
├── App.tsx (LazyMotion + 5 rute), main.tsx, index.css
├── assets/      hero.png (byte-identik dengan mascot-ziya.png), mascot-ziya.png, react.svg, vite.svg
├── games/       registry.ts, types.ts, MenulisHuruf/{MenulisHurufGame.tsx,.module.css, tracing.ts, tracing.test.ts}
├── lib/session/ session.ts, session.test.ts
├── pages/       Home/ (+7 komponen, homeData.ts, types.ts), Preload/, GameIntro/ (+gameIntroData.ts, introData.ts), GameShell/, Result/
└── styles/tokens.css
```

### 2.3 Temuan

| ID | P | Bukti | Temuan | Ditangani di |
| --- | --- | --- | --- | --- |
| Q1 | P1 | `homeData.ts`, `registry.ts`, `gameIntroData.ts`, `introData.ts` | 4 sumber metadata game. `introData.ts` tidak di-import. Field `stars:3`, `byline`, `ageLabel` hanya dekoratif | T1.6 |
| Q2 | P1 | Semua `pages/*` | Teks hardcoded Indonesia. EN tidak berfungsi | T1.5, Fase 4 |
| Q3 | P1 | `GameShellPage.tsx:96` | Pil bintang statis "0 dari 3", typo "Ms zia", ID `tantang` tampil mentah, instruksi huruf A hardcoded | T4.6 |
| Q4 | P1 | `Home.tsx`, `GameShellPage.tsx` | State mute/fullscreen terduplikasi dan tidak tersimpan. Mute tidak memengaruhi game. Audio hanya `speechSynthesis` | T1.4, T1.8 |
| Q5 | P1 | `MenulisHurufGame.tsx` | Hanya huruf A. Penilaian hanya cakupan. `paint()` me-resize canvas per pointermove. `setProgress` per move. Warna di luar token | T5.2–T5.4 |
| Q6 | P1 | `ResultPage.tsx` | Hasil hanya di `location.state` (hilang saat refresh). Tidak ada hasil per pemain | T1.7, T4.7 |
| Q7 | P2 | `GameIntroPage.tsx` | Ikon pengaturan palsu (`aria-hidden`), emoji karakter, level awal tidak dibaca dari query, hex di luar token | T4.5 |
| Q8 | P2 | `Home.tsx`, `BottomDock.tsx`, `homeData.ts` | `BottomDock` mati (prop tidak pernah diisi). `NAV_ITEMS` tidak dipakai. Footer berisi teks pemasaran | T1.1, T4.3 |
| Q9 | P2 | `Result.module.css` | 52 selector, hanya 9 dipakai | T4.11 |
| Q10 | P2 | `App.tsx` | `/preload` di luar alur. Semua di-bundle eager | T1.1, T1.9 |
| Q11 | P3 | `assets/` | Aset duplikat/sisa template. Maskot berupa PNG | T1.1, T3.2 |
| Q12 | P3 | `index.html` | Font dari CDN Google (privasi anak, offline) | T2.1 |

### 2.4 Kesenjangan terhadap Design v2

| Area | Sekarang | Target | Task |
| --- | --- | --- | --- |
| Warna/bentuk | Pastel + kartu dashboard + shadow blur | Hybrid + balok dengan sisi bawah solid | T2.2, T2.4 |
| Ilustrasi | Emoji + 1 PNG | SVG orisinal: 4 dunia, 5 karakter, ±72 objek | Fase 3 |
| Beranda | Tab teks + grid 9 kartu | 4 pintu dunia | T4.3 |
| Intro | Kartu teks | Demo tangan + level bergambar + ▶ | T4.5 |
| Arena | Layout kartu putih | Latar dunia + gelembung + teman penjaga | T4.6 |
| Hasil | Persen + bintang | Stiker | T4.7 |
| Target sentuh | 36–40 px | ≥ 64/88/96 px | T2.4, T7.4 |
| Motion | Hanya fade Result | Katalog design §9 | T2.3, Fase 4–6 |
| Audio | TTS 1 tombol | Musik/ambient/SFX anak + klip item | T1.8, Fase 6 |
| Game | 1/9 prototipe | 9 game DoD | Fase 5 |

---

## 3. Arsitektur dan kontrak target

### 3.1 Struktur folder akhir

```text
project/
├── public/audio/{music,ambient,sfx}/*.mp3, speech/{id,en,ar}/*.mp3, CREDITS.md
├── scripts/check-audio.mjs
├── e2e/*.spec.ts                      (Fase 7)
├── playwright.config.ts               (Fase 7)
└── src/
    ├── main.tsx
    ├── app/
    │   ├── App.tsx                    providers + router
    │   ├── routes.tsx                 definisi rute + lazy pages
    │   ├── ErrorBoundary.tsx
    │   └── providers/
    │       ├── PreferencesProvider.tsx   + usePreferences.ts
    │       └── AudioProvider.tsx         + useAudio.ts
    ├── design/
    │   ├── tokens.css  typography.css  global.css
    │   ├── motion.ts                  springs, durasi
    │   └── useCalmMotion.ts
    ├── components/                    BlockButton, Tile, Slot, HintBubble, HandHint, TopNav, RoundDots,
    │   │                              TurnBanner, Dialog, ConfirmExit, GrownUpGate, Sticker, StickerReveal,
    │   │                              WorldDoor, GameCard, LevelPicker, PlayerPicker, Scene
    │   └── icons/                     Icon.tsx (+ set ikon)
    ├── worlds/
    │   ├── worlds.ts                  WORLDS: Record<WorldId, WorldDef>
    │   ├── angka/Background.tsx  huruf/…  hijaiyyah/…  memori/…
    │   └── characters/MsZiya.tsx Jeje.tsx Pipi.tsx Lulu.tsx Kuku.tsx
    ├── games/
    │   ├── ids.ts                     GameId, WorldId (+ daftar const)
    │   ├── types.ts                   GameModule, RoundProps, RoundResult, SessionOutcome
    │   ├── catalog.ts                 CATALOG (satu-satunya sumber metadata game)
    │   ├── engines/
    │   │   ├── choice/  tracing/  memory/  maze/
    │   ├── ayo-berhitung/ menulis-angka/ susun-kata/ bunyi-awal/ menulis-huruf/
    │   ├── dengar-temukan/ tebalkan-hijaiyyah/ kartu-kembar/ petualangan-labirin/
    │   │     └── index.ts (export default GameModule), rounds.ts, rounds.test.ts, <Name>Round.tsx, .module.css
    ├── content/
    │   ├── objects.ts  words.ts  numbers.ts  hijaiyyah.ts  stickers.ts
    │   └── glyphs/ digits.ts latin-upper.ts latin-lower.ts hijaiyyah.ts
    ├── i18n/ id.ts en.ts types.ts useT.ts
    ├── lib/
    │   ├── session/ session.ts (+test)          (ada, diperluas)
    │   ├── storage/ storage.ts (+test)
    │   ├── random/ rng.ts (+test)
    │   ├── stickers/ stickers.ts (+test)
    │   ├── fullscreen/ fullscreen.ts
    │   └── audio/ manifest.ts AudioManager.ts (+test)
    ├── pages/ Splash/ Home/ World/ Intro/ Play/ Result/ Stickers/ Parents/ Kit/ (dev-only)
    ├── admin/                         (plan CMS) AdminRoutes, RequireAdmin, AdminLayout, strings.ts, pages/, media/
    ├── lib/content/                   (plan CMS C1) types, defaults, manifest, resolve, readiness, loader, ContentProvider
    ├── lib/supabase/                  (plan CMS C2.3) client, auth, db, types
    ├── lib/env.ts                     (plan CMS C0.2)
    └── assets/ logo.svg, illustrations/objects/*.svg + index.ts, ASSETS.md
```

Folder lama `pages/Home`, `pages/GameIntro`, `pages/GameShell`, `pages/Result`, `pages/Preload`, `games/MenulisHuruf`, `games/registry.ts`, dan `styles/` dihapus di T4.11.

### 3.2 Rute

| Path | Halaman | Musik (`setScene`) | Catatan |
| --- | --- | --- | --- |
| `/` | Splash → setelah ▶ navigasi ke `/home` | `home` (setelah unlock) | Bila `prefs.locale === null`, tampilkan dialog bahasa setelah ▶ |
| `/home` | Home | `home` | Jika audio belum di-unlock (deep link/refresh), tombol ▶ kecil "Ayo main!" muncul di overlay pertama |
| `/dunia/:worldId` | World | `world-<id>` + ambient | `worldId` invalid → redirect `/home` |
| `/game/:gameId/intro` | Intro | `world-<id>` + ambient | Bila game `soon`/tidak dikenal → halaman NotFound dengan tombol ke `/home` |
| `/game/:gameId/play?level&players&lang&seed` | Play | `world-<id>` + ambient | Query divalidasi `parseSessionConfig` |
| `/game/:gameId/result` | Result | `result-jingle` (sekali), lalu `home` | Data dari `sessionStorage` |
| `/stiker` | Stickers | `home` | — |
| `/pendamping` | Parents | `null` | Hanya dari `GrownUpGate`. Akses langsung via URL diperbolehkan (pendamping) |
| `/_kit` | Kit | — | Hanya ada bila `import.meta.env.DEV` |
| `/admin/login` | Login admin (username + password saja) | `null` | Plan CMS C3.1. Tidak ditautkan dari app anak |
| `/admin/*` | Dasbor, Objek, Kata, Hijaiyyah, Suara, Terbitkan | `null` | Dilindungi `RequireAdmin`. Chunk terpisah |
| `*` | redirect `/home` | — | — |

Semua halaman di-`lazy()`. Modul game di-load lewat `catalog[id].load()`.

### 3.3 Kontrak TypeScript (tulis persis, boleh menambah field opsional)

```ts
// src/games/ids.ts
export const WORLD_IDS = ['angka', 'huruf', 'hijaiyyah', 'memori'] as const;
export type WorldId = (typeof WORLD_IDS)[number];
export const GAME_IDS = ['ayo-berhitung','menulis-angka','susun-kata','bunyi-awal','menulis-huruf',
  'dengar-temukan','tebalkan-hijaiyyah','kartu-kembar','petualangan-labirin'] as const;
export type GameId = (typeof GAME_IDS)[number];
export const isGameId = (v: string): v is GameId => (GAME_IDS as readonly string[]).includes(v);
export const isWorldId = (v: string): v is WorldId => (WORLD_IDS as readonly string[]).includes(v);

// src/lib/session/session.ts (perluas yang sudah ada; pertahankan tes lama + tambah tes seed)
export type DifficultyId = 'mudah' | 'sedang' | 'tantang';
export type PlayerCount = 1 | 2;
export type PlayerNumber = 1 | 2;
export type Locale = 'id' | 'en';
export interface SessionConfig {
  readonly gameId: GameId;
  readonly difficulty: DifficultyId;
  readonly players: PlayerCount;
  readonly locale: Locale;
  readonly seed: number;          // uint32. Query `seed`; invalid/hilang → 1
}
export function parseSessionConfig(gameId: GameId, search: URLSearchParams): SessionConfig;
export function buildSessionSearch(c: SessionConfig): string; // level, players, lang, seed
export function newSeed(): number; // Math.floor(Math.random() * 2 ** 32) >>> 0 — hanya dipanggil dari Intro/Result

// src/lib/random/rng.ts
export interface Rng { next(): number; int(min: number, maxInclusive: number): number;
  pick<T>(arr: readonly T[]): T; shuffle<T>(arr: readonly T[]): T[]; sample<T>(arr: readonly T[], n: number): T[]; }
export function createRng(seed: number): Rng; // mulberry32

// src/games/types.ts
export interface RoundResult { readonly attempts: number; readonly firstTry: boolean;
  /** hanya untuk turnMode 'in-game' (G08): pasangan per pemain */ readonly perPlayer?: Partial<Record<PlayerNumber, number>>; }
export interface RoundProps<R> {
  readonly round: R;
  readonly config: SessionConfig;
  readonly player: PlayerNumber;          // pemain giliran ini (in-game: pemain awal = 1)
  readonly roundIndex: number;            // 0-based dalam urutan pemain ini
  readonly calmMotion: boolean;
  readonly thickLines: boolean;
  readonly onComplete: (result: RoundResult) => void; // tepat sekali, setelah perayaan ≤ 600 ms
}
export interface GameModule<R> {
  readonly turnMode: 'per-round' | 'in-game';
  createRounds(config: SessionConfig, content: ResolvedContent): readonly R[]; // murni & deterministik; pool hanya item layak (cms §7)
  speechFor?(round: R, config: SessionConfig): SpeechClip[]; // untuk preload & audio:check
  readonly Round: React.ComponentType<RoundProps<R>>;
}
export interface PlayerOutcome { readonly player: PlayerNumber; readonly roundsCompleted: number;
  readonly firstTryCount: number; readonly stickerId: StickerId; readonly stickerIsNew: boolean; }
export interface SessionOutcome { readonly schemaVersion: 1; readonly config: SessionConfig;
  readonly players: readonly PlayerOutcome[]; readonly finishedAt: string /* ISO */; }

// src/games/catalog.ts
export interface CatalogEntry {
  readonly id: GameId; readonly code: 'G01'|'G02'|'G03'|'G04'|'G05'|'G06'|'G07'|'G08'|'G09';
  readonly worldId: WorldId; readonly status: 'ready' | 'soon';
  readonly icon: string;                           // ObjectId bawaan untuk gambar kartu game
  readonly rounds: Record<DifficultyId, number>;   // game-specs §0.1 / content §7
  readonly mechanic: 'choice' | 'tracing' | 'memory' | 'maze'; // untuk demo tangan di Intro
  readonly load: () => Promise<{ default: GameModule<any> }>; // eslint-disable-line @typescript-eslint/no-explicit-any -- modul heterogen
}
export const CATALOG: Record<GameId, CatalogEntry>;
export const gamesInWorld: (w: WorldId) => CatalogEntry[]; // urut sesuai kode G

// src/worlds/worlds.ts
export interface WorldDef { readonly id: WorldId; readonly music: MusicId; readonly ambient: AmbientId;
  readonly character: 'Jeje' | 'Pipi' | 'Lulu' | 'Kuku';
  readonly palette: { sky: string; hillFar: string; ground: string; groundDark: string; accent: string }; }

// src/lib/storage/storage.ts
export type StorageArea = 'local' | 'session';
export function readJSON<T>(area: StorageArea, key: string, parse: (raw: unknown) => T | null): T | null;
export function writeJSON(area: StorageArea, key: string, value: unknown): boolean; // false bila gagal
export function removeKey(area: StorageArea, key: string): void;
// Bila akses storage melempar error → fallback Map in-memory per area (sesi tetap jalan).

// Kunci storage (tidak boleh ada kunci lain):
//  local   'msz:prefs'     Preferences
//  local   'msz:stickers'  { schemaVersion: 1; owned: StickerId[] }
//  session 'msz:outcome'   SessionOutcome
//  local   'lang'          LEGACY: hanya dibaca sekali untuk migrasi locale, lalu dibiarkan

// src/app/providers/usePreferences.ts
export interface Preferences { readonly schemaVersion: 1; readonly locale: Locale | null;
  readonly muted: boolean; readonly musicOn: boolean; readonly hijaiyyahNatureOnly: boolean;
  readonly calmMotion: boolean; readonly thickLines: boolean; }
export const DEFAULT_PREFS: Preferences = { schemaVersion: 1, locale: null, muted: false, musicOn: true,
  hijaiyyahNatureOnly: false, calmMotion: false, thickLines: false };
export function usePreferences(): { prefs: Preferences; update(patch: Partial<Omit<Preferences,'schemaVersion'>>): void };
```

Tipe `ResolvedContent` mengikuti [plan CMS C1.1](2026-11-25-cms-admin-plan.md#c1--lapisan-konten-di-app-anak-tanpa-supabase). `ObjectId` bawaan tetap berupa union const, tetapi di runtime objek dari CMS memakai `string` yang divalidasi oleh `ResolvedContent.objects`. Tipe `MusicId`, `AmbientId`, `SfxId`, `SpeechClip`, dan `AudioApi` mengikuti [audio §7](../specs/audio.md#7-api-audiomanager). Tipe `ObjectId`, `HijaiyyahId`, `StickerId`, dan `Glyph` mengikuti [content](../specs/content.md).

### 3.4 Alur data sesi

```text
Intro: pilih level/pemain → seed = newSeed() → navigate(/play?level&players&lang=prefs.locale&seed)
Play:  config = parseSessionConfig → module = await CATALOG[id].load() → content = useContent()
       roundsP1 = module.createRounds(config, content)
       roundsP2 = createRng(config.seed + 1).shuffle(roundsP1)   (hanya players=2 & per-round)
       turns    = buildTurnQueue(players, roundsP1.length, turnMode)  // P1r0,P2r0,P1r1,P2r1,…
       render <module.Round key={`${player}-${roundIndex}`} …/> → onComplete → catat → turn berikut
       (players=2 & pemain berganti → TurnBanner 1 s + sfx 'turn')
       selesai → award stiker (lib/stickers) → writeJSON('session','msz:outcome') → navigate(/result)
Result: readJSON('session','msz:outcome') → validasi gameId sama → tampilkan
        "Main lagi" = config sama + seed baru
```

### 3.5 Konvensi motion (`src/design/motion.ts`)

```ts
export const DUR = { tap: 0.09, fast: 0.18, base: 0.26, celebrate: 0.6 } as const;        // detik
export const SPRING = {
  press:  { type: 'spring', stiffness: 700, damping: 30 },
  bouncy: { type: 'spring', stiffness: 420, damping: 16, mass: 0.8 },
  gentle: { type: 'spring', stiffness: 260, damping: 24 },
} as const;
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const;
// useCalmMotion(): boolean = useReducedMotion() || prefs.calmMotion
// Bila calm: semua transition → { duration: 0 } kecuali opacity fade ≤ DUR.fast.
```

### 3.6 Dependensi yang diizinkan

| Paket | Fase | Untuk |
| --- | --- | --- |
| `@fontsource/fredoka`, `@fontsource/nunito`, `@fontsource/noto-naskh-arabic` | T2.1 | Self-host font (OFL) |
| `@playwright/test`, `@axe-core/playwright` (dev) | T7.1 | E2E & a11y |
| `@supabase/supabase-js` | Plan CMS C2.3 | Klien CMS admin saja |
| `supabase` CLI (dev, opsional) | Plan CMS C7.4 | Uji RLS lokal |

Paket lain memerlukan persetujuan pengguna (tulis `BLOCKED:` di Log).

---

## 4. Fase dan task

> Format task: **ID — judul** · *Bergantung pada* · *File* · *Langkah* · *Selesai jika* · *Verifikasi*. Gerbang kualitas §0.1-3 selalu berlaku dan tidak ditulis ulang.

### Fase 0 — Persiapan

- [x] **T0.1 — Baseline & pembacaan.**
  - *Bergantung pada:* —
  - *Langkah:*
    1. Baca semua dokumen di tabel atas.
    2. Jalankan `git status` dan catat file yang belum di-commit.
    3. Jalankan gerbang kualitas dan catat hasilnya di Log.
    4. Jika pengguna mengizinkan commit, buat branch `feat/paud-redesign-v2`.
  - *Selesai jika:* baseline tercatat di §8.

### Fase 1 — Restrukturisasi fondasi (UI lama tetap berjalan)

- [x] **T1.1 — Hapus kode/aset mati.**
  - *Bergantung pada:* T0.1
  - *Hapus:*
    - `src/assets/hero.png`, `src/assets/react.svg`, `src/assets/vite.svg`
    - `src/pages/GameIntro/introData.ts`
    - `src/pages/Home/components/BottomDock.tsx` + `.module.css`
    - export `NAV_ITEMS` dan tipe `NavItem`
    - rute `/preload` + folder `src/pages/Preload/` (beserta `usePreloadProgress.ts`)
  - *Ubah:* `Home.tsx` (hapus prop `onOpenParentGate` dan render `BottomDock`), `App.tsx` (hapus rute).
  - *Langkah:* sebelum menghapus, jalankan `grep -rn "<nama>" project/src` untuk memastikan tidak ada importir lain.
  - *Selesai jika:* build lulus dan `grep -rn "hero.png\|introData\|BottomDock\|NAV_ITEMS\|Preload" project/src` kosong.

- [x] **T1.2 — ID domain & RNG.** ‖
  - *Bergantung pada:* T0.1
  - *File baru:* `src/games/ids.ts`, `src/lib/random/rng.ts`, `rng.test.ts`
  - *Langkah:* implementasikan sesuai §3.3. RNG memakai mulberry32 (`seed >>> 0`). `shuffle` memakai Fisher–Yates tanpa memutasi input. `sample` mengembalikan n elemen unik.
  - *Tes:*
    - seed sama → urutan `next()` sama (10 nilai);
    - `int` dalam batas untuk 1000 panggilan;
    - `shuffle` mempertahankan multiset;
    - `sample(n > length)` melempar `RangeError`.
  - *Selesai jika:* tes lulus.

- [x] **T1.3 — Storage berversi.** ‖
  - *Bergantung pada:* T0.1
  - *File:* `src/lib/storage/storage.ts`, `storage.test.ts`
  - *Langkah:* implementasikan sesuai §3.3. `readJSON`: `JSON.parse` dalam try/catch → `parse(raw)`, null bila gagal. Fallback in-memory dipakai saat `localStorage.getItem` melempar error.
  - *Tes (Vitest, environment default node + mock `globalThis.localStorage`):*
    - roundtrip;
    - JSON rusak → null;
    - storage melempar error → fallback memori tetap bisa read-after-write;
    - `parse` menolak data → null.
  - *Selesai jika:* tes lulus.

- [x] **T1.4 — Preferences provider.**
  - *Bergantung pada:* T1.3
  - *File:* `src/app/providers/PreferencesProvider.tsx`, `usePreferences.ts`, `preferences.ts` (parse + migrasi murni), `preferences.test.ts`
  - *Langkah:*
    1. `parsePrefs(raw)` memvalidasi tiap field dan mengisi default untuk field hilang/invalid.
    2. Migrasi: jika `msz:prefs` tidak ada dan `localStorage.lang` bernilai `id`/`en`, pakai sebagai `locale`.
    3. Provider menyimpan ke `msz:prefs` setiap `update`.
    4. Set `document.documentElement.lang` = `locale ?? 'id'`.
  - *Bungkus* `App.tsx` dengan provider. Home lama memakai `usePreferences` untuk bahasa/mute (ganti state lokal `language`/`isMuted`).
  - *Tes:* default, field invalid, migrasi `lang`.
  - *Selesai jika:* ganti bahasa di Home lama tersimpan setelah reload (uji manual, catat).

- [x] **T1.5 — i18n.**
  - *Bergantung pada:* T1.4
  - *File:* `src/i18n/types.ts`, `id.ts`, `en.ts`, `useT.ts`, `i18n.test.ts`
  - *Langkah:*
    1. `id.ts` berisi `export const id = {...} as const` dengan **semua** key dari [copy.md](../specs/copy.md).
    2. `types.ts` berisi `export type MessageKey = keyof typeof id; export type Messages = Record<MessageKey, string>;`.
    3. `en.ts` diketik `export const en: Messages`.
    4. `useT()` mengembalikan `t(key, vars?)` berdasarkan `prefs.locale ?? 'id'`. Variabel `{x}` diganti literal.
    5. Migrasikan teks di halaman lama ke `t()`. Halaman lama tetap ada sampai Fase 4, tetapi teksnya sudah lewat i18n.
  - *Tes:* jumlah key `id` = `en`, dan interpolasi. Nama objek **tidak** berada di i18n: nama diambil dari konten (`content.objects.get(id).name[locale]`), sehingga bisa diedit lewat CMS.
  - *Selesai jika:* perintah grep teks literal (§0.2) kosong dan beralih ke EN mengubah semua teks halaman lama.

- [x] **T1.6 — Satu katalog & data dunia.**
  - *Bergantung pada:* T1.2, T1.5
  - *File:* `src/games/catalog.ts`, `src/worlds/worlds.ts`, `src/content/objects.ts` (`OBJECT_IDS` const + tipe `ObjectId`), `catalog.test.ts`
  - *Langkah:*
    1. Isi 9 entri. Semua `status: 'soon'` kecuali `menulis-huruf: 'ready'`, yang sementara masih memakai komponen lama lewat adapter `load: () => import('./legacy/menulisHurufAdapter')`. Adapter ini dihapus di T5.4.
    2. `rounds` sesuai game-specs §0.1 (G08 `{1,1,1}`, G09 `{2,2,3}`).
    3. `worlds.ts` berisi palet dari assets-brief §2.
    4. Ubah Home lama, GameIntro lama, dan GameShell lama agar membaca dari `CATALOG` (judul via `t('game.<id>.title')`).
    5. Hapus `homeData.ts` (HOME_GAMES, CATEGORY_FILTERS dipindah: kategori = `WORLD_IDS`), `gameIntroData.ts`, `registry.ts`, `pages/Home/types.ts` (pindahkan yang masih dibutuhkan).
    6. `src/content/*.ts` berstatus **konten bawaan** (default). Setelah plan CMS C1 selesai, konten ini hanya dibaca lewat `lib/content/defaults.ts`.
  - *Tes:* setiap `GameId` ada di CATALOG, setiap game punya world valid, `gamesInWorld` mengembalikan total 9.
  - *Selesai jika:* `grep -rn "HOME_GAMES\|GAME_REGISTRY\|GAME_INTRO_DATA" project/src` kosong dan alur lama Home → Intro → Play → Result untuk `menulis-huruf` masih jalan.

- [x] **T1.7 — Sesi v2, turn queue, stiker.**
  - *Bergantung pada:* T1.6
  - *File:* `lib/session/session.ts` (+seed, `GameId`), `src/games/types.ts` (kontrak §3.3), `src/pages/Play/turns.ts` + test (fungsi murni `buildTurnQueue`), `src/content/stickers.ts` (`STICKERS: Record<WorldId, StickerDef[9]>` dari content §7), `src/lib/stickers/stickers.ts` + test (`awardSticker(owned, worldId, rng) → { stickerId, isNew }`, `loadStickers()`, `saveStickers()`)
  - *Tes:*
    - session: seed valid/invalid, roundtrip build/parse;
    - turns: 1 pemain → urutan r0..rn, 2 pemain → P1r0, P2r0, P1r1, P2r1…, `in-game` → satu turn;
    - stiker: nomor terkecil yang belum dimiliki, penuh → `isNew: false` + deterministik oleh seed.
  - *Selesai jika:* tes lulus. Kontrak lama `GameProps` boleh tetap ada sampai T4.11 untuk adapter.

- [x] **T1.8 — AudioManager + manifest + checker.**
  - *Bergantung pada:* T1.4
  - *File:* `src/lib/audio/manifest.ts`, `AudioManager.ts`, `AudioManager.test.ts`, `src/app/providers/AudioProvider.tsx`, `useAudio.ts`, `project/scripts/check-audio.mjs`, `project/public/audio/CREDITS.md` (header tabel saja)
  - *Langkah:*
    1. `manifest.ts` memetakan ID → path (`/audio/music/<id>.mp3`, dst.) + gain dasar ([audio §1](../specs/audio.md#1-lapisan-suara)), serta fungsi `speechPath(clip)`.
    2. `AudioManager` adalah kelas tanpa dependensi React yang mengimplementasikan `AudioApi` persis seperti [audio §7](../specs/audio.md#7-api-audiomanager). Konstruktor menerima `{ createContext: () => AudioContext; fetch: typeof fetch; createMediaElement: () => HTMLAudioElement }` agar bisa di-mock. Kelas juga menerapkan aturan ducking, throttle 80 ms, maksimal 3 SFX, pause saat `visibilitychange`, serta mute/musicOn/hijaiyyahNatureOnly dari preferensi (metode `applyPrefs(prefs)`).
    3. File hilang (fetch 404 / error media): di DEV, `speak` fallback ke `speechSynthesis` + `console.warn`. Untuk lapisan lain dan di production, abaikan diam-diam. **Tidak boleh melempar error ke UI.**
    4. `AudioProvider` membuat satu instance, memanggil `applyPrefs` saat prefs berubah, dan `dispose()` saat unmount.
    5. `check-audio.mjs`: baca daftar ID dari `manifest.ts` (parse sederhana: regex array const) dan daftar klip dari content (word/number/letter/hija). Laporkan file yang hilang per kategori. Flag `--game <id>` membatasi ke klip game itu. Exit code 1 bila ada yang hilang **dan** flag `--strict`. Tambah script npm `"audio:check": "node scripts/check-audio.mjs"`.
    6. Ganti `speechSynthesis` di GameShell lama dengan `useAudio()`.
    7. Setelah plan CMS C1.3, URL file tidak lagi dibangun langsung dari `manifest.ts`, melainkan dari `content.sceneAudioUrl()` / `content.speechUrl()`. `manifest.ts` tetap menjadi sumber daftar ID + gain.
  - *Tes (mock AudioContext):*
    - `sfx` sama < 80 ms diabaikan;
    - SFX ke-4 bersamaan diabaikan;
    - `speak` baru menghentikan yang lama;
    - ducking: gain music 0.4× selama speech;
    - muted → master gain 0;
    - musicOn=false → music & ambient 0, sfx tetap.
  - *Selesai jika:* tes lulus dan `npm run audio:check` berjalan, melaporkan semua file hilang (wajar, karena belum ada aset).

- [x] **T1.9 — Router baru, lazy loading, ErrorBoundary.**
  - *Bergantung pada:* T1.6, T1.8
  - *File:* `src/app/App.tsx`, `routes.tsx`, `ErrorBoundary.tsx`, `src/main.tsx` (import dari `app/`)
  - *Langkah:*
    1. Pindahkan `App.tsx` ke `app/`.
    2. Definisikan rute §3.2. Untuk sementara, `/home` dan `/` sama-sama merender Home lama, `/game/:id/*` merender halaman lama, dan `/dunia`, `/stiker`, `/pendamping` merender placeholder `<NotFound>` sampai Fase 4.
    3. Semua halaman memakai `React.lazy`.
    4. ErrorBoundary menampilkan `t('error.title')` + tombol `error.retry` (reload) + ke `/home`.
    5. Validasi `:gameId` dengan `isGameId`.
  - *Selesai jika:* build menghasilkan > 1 chunk JS dan URL tidak dikenal diarahkan ke `/home`.

- [x] **T1.10 — Sinkron dokumen Fase 1.**
  - *Bergantung pada:* T1.1–T1.9
  - *Langkah:* perbarui `docs/architecture.md` (struktur aktual + kontrak baru), `docs/ai-agents.md` (registry → catalog), dan Log.

### Fase 2 — Design system v2

- [x] **T2.1 — Font self-host.**
  - *Bergantung pada:* T1.9
  - *Langkah:*
    1. `npm i @fontsource/fredoka @fontsource/nunito @fontsource/noto-naskh-arabic`.
    2. Di `src/design/typography.css`, import bobot yang dipakai saja: Fredoka 500/600/700, Nunito 600/700, Noto Naskh Arabic 700.
    3. Hapus `<link>` Google Fonts dan `preconnect` dari `index.html`.
    4. Definisikan kelas utilitas tipografi sesuai design §4 dengan `clamp()`:
       - `.t-tile` = `clamp(40px, 7vmin, 64px)`
       - `.t-title` = `clamp(28px, 5vmin, 40px)`
       - `.t-button` = `clamp(22px, 3.6vmin, 28px)`
       - `.t-body` = 18px
       - `.t-arabic` = `clamp(56px, 10vmin, 96px)`
  - *Selesai jika:* tab Network tidak berisi request ke `fonts.googleapis.com`.

- [x] **T2.2 — Token v2 (berdampingan dengan legacy).**
  - *Bergantung pada:* T2.1
  - *Langkah:*
    1. Pindahkan `src/styles/tokens.css` lama → `src/design/tokens-legacy.css` (tetap di-import oleh `index.css` sampai T4.11).
    2. Buat `src/design/tokens.css` berisi semua token design §3.1–§3.2 dengan nama persis, plus:
       ```css
       --radius-tile: 20px; --radius-button: 28px; --radius-card: 28px; --radius-dialog: 32px; --radius-pill: 999px;
       --side-blue: 0 6px 0 var(--blue-700); --side-pink: 0 6px 0 var(--pink-700);
       --side-white: 0 6px 0 #C9D3E6; --side-success: 0 6px 0 var(--success-700);
       --side-pressed-blue: 0 2px 0 var(--blue-700);
       --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px; --space-6: 32px; --space-7: 48px;
       --touch-nav: 72px; --touch-choice: 96px; --touch-primary: 112px; --nav-height: 88px;
       --dur-tap: 90ms; --dur-fast: 180ms; --dur-base: 260ms; --ease-out-soft: cubic-bezier(.22,1,.36,1);
       --font-display: 'Fredoka', system-ui, sans-serif; --font-body: 'Nunito', system-ui, sans-serif;
       --font-arabic: 'Noto Naskh Arabic', serif;
       ```
    3. Jika nama token baru bentrok dengan legacy (`--radius-card`, `--radius-button`, `--font-*`), **token baru menang**: hapus definisi yang bentrok dari legacy dan pastikan halaman lama tetap terbaca.
    4. Buat `src/design/global.css` berisi reset (dari `index.css`), `body { background: var(--sky-50); color: var(--navy-900); }`, `:focus-visible` ring navy 4 px offset 4 px, `@media (prefers-reduced-motion)` (pertahankan), `-webkit-tap-highlight-color: transparent`, `user-select: none` pada `button`, dan `overscroll-behavior: none` pada `body`.
  - *Selesai jika:* build lulus dan halaman lama masih tampil (boleh dengan warna berubah).

- [x] **T2.3 — Motion tokens & `useCalmMotion`.**
  - *Bergantung pada:* T2.2
  - *File:* `src/design/motion.ts`, `useCalmMotion.ts`
  - *Langkah:* tulis sesuai §3.5. Tambahkan juga helper `pressProps(calm)` yang mengembalikan `{ whileTap: calm ? undefined : { scale: 0.96, y: 4 }, transition: SPRING.press }`.
  - *Selesai jika:* dipakai oleh T2.4.

- [x] **T2.4 — Komponen dasar.**
  - *Bergantung pada:* T2.3
  - Setiap komponen berada di `src/components/<Name>/<Name>.tsx` + `.module.css`. Semua state di design §7.1 wajib ada.

  | Komponen | Props (wajib) | Spesifikasi kunci |
  | --- | --- | --- |
  | `Icon` | `name`, `size?` | assets-brief §6 |
  | `BlockButton` | `variant: 'primary'\|'pink'\|'white'\|'icon'`, `size: 'nav'\|'choice'\|'primary'`, `label` (aria/tampil), `icon?`, `onPress`, `disabled?`, `loading?`, `hideLabel?` | `<m.button>`. Tinggi min dari token `--touch-*`. Sisi bawah `--side-*`. Saat ditekan: `--side-pressed-*` + `pressProps`. `onPress` dipanggil pada `click` (bukan pointerdown) dan memainkan `sfx('tap')`. `loading` = spinner statis + `aria-busy` |
  | `Tile` | `char`, `color: 'blue'\|'pink'\|'white'\|'success'\|'lantern'`, `state`, `layoutId?`, `onPress?`, `lang?` | design §7.2. `state: 'idle'\|'selected'\|'correct'\|'retry'\|'locked'`. `retry` = goyang ±4° ×2 (`DUR.base`). `correct` = pop 1→1.12→1 + ikon ✓ di sudut |
  | `Slot` | `state: 'empty'\|'filled'\|'correct'\|'hint'`, `children?`, `ghostChar?` | Pink, garis putus-putus putih saat kosong. `hint` = glow `--sun-400` statis |
  | `HintBubble` | `objectId?`, `children?`, `onListen?` | Awan putih (SVG) berisi gambar. Bila `onListen` ada → bubble menjadi `<button>` dengan `aria-label=t('play.listen')` + ikon `listen` kecil |
  | `HandHint` | `target: DOMRect \| null`, `mode: 'point'\|'trace'` | Tangan SVG. Bergerak 2× lalu diam. Calm motion → statis |
  | `TopNav` | `onBack`, `backIcon: 'back'\|'home'`, `center?` | Kiri: tombol kembali. Kanan: sound toggle (prefs.muted) + fullscreen (sembunyikan bila `!document.fullscreenEnabled`). Tinggi `--nav-height`. `padding: max(24px, env(safe-area-inset-*))` |
  | `RoundDots` | `total`, `done`, `player?` | Titik 20 px. Selesai = biru/pink sesuai pemain. `role="img"` + `aria-label=t('play.round',…)` |
  | `TurnBanner` | `player`, `visible` | Pita penuh lebar, warna pemain, ikon hewan, teks `t('play.turn')`. Muncul 250 ms, tampil 1 s |
  | `Dialog` | `open`, `onClose`, `labelledBy`, `children` | Native `<dialog>` + `showModal()` (focus trap bawaan), Escape → `onClose`, kembalikan fokus ke pemicu, backdrop navy 40% |
  | `ConfirmExit` | `open`, `onStay`, `onLeave` | Dialog dengan 2 `BlockButton` besar (✔ `play.exit.yes` white, ↩ `play.exit.no` primary). Fokus awal pada "lanjut main" |
  | `GrownUpGate` | `onPass` | Tombol ikon ⚙ (nav). `pointerdown` mulai cincin progres 2 s (SVG `stroke-dashoffset`), dilepas sebelum 2 s → batal. Selesai → Dialog soal `a+b` (a, b ∈ 2..9 dari `createRng(Date.now())` — **pengecualian sah** untuk RNG non-seed, beri komentar) dengan 4 opsi angka. Benar → `onPass`. Salah → tutup. Keyboard: Enter ditahan 2 s juga berlaku |
  | `Sticker` | `stickerId`, `owned`, `size` | assets-brief §5 |
  | `StickerReveal` | `stickerId`, `isNew`, `onDone?` | rotateY 180° + 8–12 bintang kecil (`m.span`) di sekitar, sekali (≤ 1.2 s), `sfx('sticker')` |
  | `WorldDoor` | `worldId`, `onOpen` | Kartu ≥ 200 px berisi `<Background variant="home-door">` + karakter + nama dunia (pita putih). Sisi bawah tebal. Ketuk → `sfx('door')` + scale 1.04 → `onOpen` |
  | `GameCard` | `entry: CatalogEntry`, `onOpen` | Ilustrasi `icon` + judul. `soon` → opacity 0.55 + ikon gembok + `aria-disabled`. Ketuk `soon` → goyang kecil, tanpa navigasi |
  | `LevelPicker` | `value`, `onChange` | 3 `BlockButton` white berisi 1/2/3 ikon bintang + label. Terpilih = pink + ✓ + `aria-pressed` |
  | `PlayerPicker` | `value`, `onChange` | 2 tombol: 1 wajah kelinci / kelinci + kucing |
  | `Scene` | `worldId`, `children` | Layout halaman: `<Background variant="scene">` absolut + konten di atas (grid nav/konten) |

  - *Selesai jika:* semua komponen dipakai di `/_kit` (T2.5) dan tidak ada hex di CSS module.

- [x] **T2.5 — Halaman `/_kit` (dev).**
  - *Bergantung pada:* T2.4 (WorldDoor/Scene/Sticker memakai placeholder sampai Fase 3)
  - *Langkah:* tampilkan setiap komponen × setiap state × setiap varian dalam grid berlabel (teks label kit boleh literal karena berada di folder `/_kit/`, yang dikecualikan grep). Tambahkan toggle calm motion dan locale.
  - *Selesai jika:* semua state bisa dilihat dan diklik. Bounding box setiap tombol ≥ token minimum (cek DevTools, catat 5 sampel di Log).

### Fase 3 — Ilustrasi v0 (dibuat AI sebagai SVG; ‖ dengan Fase 2)

- [x] **T3.1 — Latar 4 dunia.** ‖
  - *Bergantung pada:* T1.6
  - *Langkah:* sesuai assets-brief §2. Zona aman dihormati.
  - *Selesai jika:* tampil di `/_kit` dalam varian `scene` dan `home-door`, ukuran file ≤ 20 kB.
- [x] **T3.2 — Karakter.** ‖
  - *Bergantung pada:* T1.6
  - *Langkah:* MsZiya, Jeje, Pipi, Lulu, Kuku × 3 mood (assets-brief §3).
  - *Selesai jika:* `/_kit` menampilkan 15 kombinasi. `mascot-ziya.png` boleh dihapus setelah semua pemakaiannya diganti (T4.11).
- [x] **T3.3 — Objek.** ‖
  - *Bergantung pada:* T1.6
  - *Langkah:*
    1. Buat semua ObjectId di content §2 sebagai SVG + `objects/index.ts`.
    2. Tes `objects.test.ts`: setiap `OBJECT_IDS` punya URL.
    3. Kerjakan bertahap. Urutan prioritas: objek G04 + G05 (vertical slice), lalu G01, lalu G03, lalu G08/G09, lalu stiker.
  - *Selesai jika:* tes lulus.
- [x] **T3.4 — Ikon UI, logo, favicon.** ‖
  - *Bergantung pada:* T1.6
  - *Langkah:* sesuai assets-brief §6–§7.
- [x] **T3.5 — `ASSETS.md`.**
  - *Bergantung pada:* T3.1–T3.4
  - *Langkah:* satu baris per file (pembuat: "AI v0", lisensi: "milik proyek").

### Fase 4 — Layar baru (menggantikan halaman lama)

> Setiap halaman menggunakan `Scene`/`TopNav`, semua teks lewat `t()`, dan memanggil `audio.setScene` sesuai §3.2 dalam `useEffect`.

- [x] **T4.1 — Splash `/`.**
  - *Bergantung pada:* T2.4, T3.2, T3.4
  - *Langkah:*
    1. Layout: logo + MsZiya (`happy`) di tengah, latar `--sky-50` dengan bukit dunia angka.
    2. Tunggu `document.fonts.ready` (timeout 3 s). Jika sudah > 300 ms, tampilkan indikator tak-tentu (3 titik memantul, statis bila calm) + `t('splash.loading')`.
    3. Setelah siap, tampilkan `BlockButton primary size=primary` ▶ `t('splash.start')`.
    4. Ketuk ▶ → `await audio.unlock()` → `setScene({music:'home'})`. Jika `prefs.locale === null`, buka Dialog bahasa (T4.2). Selain itu, navigasi ke `/home`.
  - *Selesai jika:* refresh di `/` selalu menampilkan ▶, dan musik mulai setelah diketuk (manual).

- [x] **T4.2 — Dialog bahasa.**
  - *Bergantung pada:* T4.1
  - *Langkah:* 2 `BlockButton` white besar: ID = bendera Merah-Putih (SVG sederhana) + `t('lang.id')`; EN = ikon bola dunia (netral, bukan bendera negara) + `t('lang.en')`. Pilih → `update({locale})` → navigasi `/home`. Dipakai ulang di Parents.
  - *Selesai jika:* pilihan tersimpan dan teks berubah.

- [x] **T4.3 — Home `/home`.**
  - *Bergantung pada:* T4.1, T3.1
  - *Layout:* `TopNav` (kiri: tombol Buku Stiker ikon ★ → `/stiker`; kanan: sound, fullscreen, `GrownUpGate` → `/pendamping`). Tengah: grid `WorldDoor` 2×2 (landscape) / 1 kolom scroll vertikal (portrait < 600 px lebar) / 2×2 (portrait tablet). MsZiya `happy` di pojok kiri bawah (ketuk → `kids-giggle` + lompat).
  - *Motion:* pintu masuk stagger 40 ms (calm → langsung).
  - *Audio overlay:* jika `!audio.unlocked` saat mount (deep link), tampilkan lapisan semi-transparan dengan ▶ "Ayo main!". Ketuk → `unlock` → overlay hilang.
  - *Selesai jika:* tidak ada teks pemasaran/footer, dan ketuk pintu → `/dunia/<id>`.

- [x] **T4.4 — World `/dunia/:worldId`.**
  - *Bergantung pada:* T4.3
  - *Layout:* `Scene worldId`, `TopNav backIcon='home'` → `/home`. Tengah: `GameCard` untuk `gamesInWorld(id)` (2–3 kartu, satu baris landscape / kolom portrait). Karakter dunia di kanan bawah (`happy`).
  - *Langkah:* kartu `ready` → `/game/<id>/intro`. Kartu `soon` → animasi goyang + `sfx('retry')`.
  - *Selesai jika:* 4 dunia tampil dengan game yang benar.

- [x] **T4.5 — Intro `/game/:gameId/intro`.**
  - *Bergantung pada:* T4.4
  - *Layout (landscape):* kiri 55% berisi kartu demo; kanan berisi `LevelPicker`, `PlayerPicker`, dan ▶ `intro.start` (primary, lebar ≥ 240 px). Portrait: bertumpuk. `TopNav` back → `/dunia/<worldId>`.
  - *Demo:* `HandHint mode` per `entry.mechanic`, diputar loop **maks 2 kali** lalu berhenti, dengan tombol ↻ kecil untuk mengulang:
    - `choice`: tangan mengetuk balok, lalu balok terbang ke slot;
    - `tracing`: tangan menelusuri garis;
    - `memory`: tangan membalik 2 kartu;
    - `maze`: tangan menggeser karakter.
  - *Panel pendamping:* `<details>` dengan `summary` = `t('intro.forGrownUps')`, isi = `howTo`, `skills`, dan untuk tracing `game.tracing.a11yNote`.
  - *Default:* level dari query `level` (bila valid), selain itu `mudah`. Pemain default 1.
  - *Langkah:* ▶ → `newSeed()` → navigate play dengan `buildSessionSearch`.
  - *Game `soon` / ID invalid:* tampilkan NotFound (`notFound.title` + tombol ke `/home`).
  - *Selesai jika:* dari Home sampai Play ≤ 3 ketukan (pintu → kartu → ▶).

- [x] **T4.6 — Play shell `/game/:gameId/play`.**
  - *Bergantung pada:* T4.5, T1.7
  - *File:* `src/pages/Play/PlayPage.tsx`, `usePlaySession.ts` (reducer murni `playReducer` + test), `turns.ts`
  - *Reducer state:* `{ status: 'loading'|'playing'|'turn-banner'|'finished'|'error', turnIndex, results: Record<PlayerNumber, RoundResult[]> }`
  - *Aksi:* `LOADED`, `ROUND_COMPLETE`, `BANNER_DONE`, `LOAD_FAILED`
  - *Langkah:*
    1. Load modul (`CATALOG[id].load()`) dengan `Suspense`-like state. Gagal → status error + `error.retry`.
    2. Hitung rounds/turns sesuai §3.4.
    3. Render `Scene worldId` + `TopNav` (back → `ConfirmExit` bila ada ronde yang sudah selesai atau sedang berjalan; Leave → `/dunia/<worldId>`) + `RoundDots` di tengah TopNav.
    4. Render `module.Round` dengan `key={`${player}-${roundIndex}`}`.
    5. `ROUND_COMPLETE` → turn berikutnya. Jika pemain berikutnya berbeda dan players=2 → `turn-banner` (1 s, `sfx('turn')`).
    6. Selesai → award stiker per pemain (urut P1 lalu P2, `createRng(seed)`), simpan stickers + `msz:outcome`, lalu `navigate('/game/<id>/result', {replace:true})`.
    7. Preload: setelah rounds dibuat, panggil `module.speechFor` untuk semua rounds dan preload buffernya (abaikan error).
  - *Tes reducer:* urutan 1/2 pemain, banner hanya saat pemain berganti, finished setelah turn terakhir, `ROUND_COMPLETE` ganda pada turn yang sama diabaikan.
  - *Selesai jika:* G05 (via adapter) bisa dimainkan sampai Result di shell baru.

- [x] **T4.7 — Result `/game/:gameId/result`.**
  - *Bergantung pada:* T4.6
  - *Langkah:*
    1. Baca `msz:outcome`. Jika tidak valid atau `gameId` berbeda → empty state (`result.empty.*` + tombol ke `/home`).
    2. Layout: MsZiya `wow` + `t('result.great')` + satu `StickerReveal` per pemain (label `result.newSticker` / `result.repeatSticker`) + `setScene({music:'result-jingle', loop:false})` + `sfx('kids-cheer')`.
    3. Tombol: ▶ `result.again` (primary, config sama + `newSeed()`), 🏠 `result.world` (white → `/dunia/<worldId>`).
    4. Baris `result.more`: maksimal 2 `GameCard` `ready` lain dari dunia yang sama (urut kode G), lalu dari dunia lain jika kurang.
    5. Tanpa persen, skor, atau peringkat.
  - *Selesai jika:* refresh di Result tetap menampilkan hasil yang sama.

- [x] **T4.8 — Stickers `/stiker`.**
  - *Bergantung pada:* T4.7
  - *Langkah:* 4 bagian per dunia, grid 3×3 `Sticker` (dimiliki/siluet), `t('stickers.count')` per dunia. Ketuk stiker dimiliki → pop + nama objek via `speak` word bila klip ada, bila tidak `sfx('select')`. TopNav back → `/home`.

- [x] **T4.9 — Parents `/pendamping`.**
  - *Bergantung pada:* T4.2
  - *Langkah:*
    1. Layout sederhana (bukan dunia anak): kartu putih di `--sky-50`.
    2. Isi:
       - Bahasa (2 tombol);
       - toggle musik, `hijaiyyahNatureOnly`, calm motion, thick lines (`<button role="switch" aria-checked>`, ≥ 64 px);
       - reset stiker (Dialog konfirmasi `parents.resetConfirm`);
       - Tentang (`parents.aboutBody`);
       - Kredit: bila `content.source !== 'bundled'`, tampilkan `content.credits` dari manifest CMS. Bila tidak, render `public/audio/CREDITS.md` + `ASSETS.md` sebagai daftar sederhana (parse baris tabel markdown `|`, tanpa library).
    4. Tidak ada tautan ke `/admin` dari halaman ini.
    3. Tombol `parents.close` → `/home`.
  - *Selesai jika:* semua toggle tersimpan dan berpengaruh langsung (musik berhenti, gerak minimal aktif).

- [x] **T4.10 — Transisi antar-rute.**
  - *Bergantung pada:* T4.3–T4.9
  - *Langkah:* `AnimatePresence mode="wait"` di `routes.tsx`, dengan crossfade + konten naik 16 px (`DUR.base`). Calm → fade ≤ `DUR.fast`. Jangan mentransisikan perubahan query di Play.

- [x] **T4.11 — Hapus legacy.**
  - *Bergantung pada:* T4.1–T4.10
  - *Hapus:*
    - `src/pages/Home`, `src/pages/GameIntro`, `src/pages/GameShell`, `src/pages/Result` (lama)
    - `src/design/tokens-legacy.css`, `src/styles/`
    - `src/assets/mascot-ziya.png` (bila tidak lagi dipakai)
    - tipe `GameProps`/`GameEntry` lama
  - Adapter `menulisHurufAdapter` tetap ada sampai T5.4.
  - *Selesai jika:* `grep -rn "tokens-legacy\|GameShellPage\|GameIntroPage\|--primary-blue\|--cat-" project/src` kosong dan semua rute §3.2 berfungsi.

### Fase 5 — Recoding game

> Aturan bersama: [game-specs §0](../specs/game-specs.md#0-aturan-bersama-berlaku-untuk-semua-game). Setiap game ditutup dengan **DoD-Game** (§0.3). Folder game: `src/games/<gameId>/`.

- [x] **T5.1 — Engine choice (murni).**
  - *Bergantung pada:* T1.2
  - *File:* `src/games/engines/choice/choice.ts` + test
  - *Isi:*
    - `pickDistractors(answer, pool, n, rng, opts?: { exclude?: (c) => boolean; requireOneOf?: (c) => boolean })`
    - `evaluate<T>(answer: T, chosen: T): boolean`
    - `useRoundMachine()` (hook kecil di `useRoundMachine.ts`) dengan state `intro|waiting|evaluating|celebrating|retry`, timer berdasarkan `DUR` (calm → 0), guard `onComplete` sekali, `attempts` counter, idle timer 8 s (game-specs §0.4) dengan callback `onIdle(level: 1 | 2)`.
  - *Tes:* distraktor unik tanpa jawaban, `exclude` dihormati, `requireOneOf` dipenuhi bila mungkin, fallback bila tidak mungkin.

- [x] **T5.2 — Engine tracing + `TracingCanvas`.**
  - *Bergantung pada:* T1.2, T2.4
  - *Langkah:* sesuai [game-specs §T](../specs/game-specs.md#t--tracing-bersama-g02-g05-g07). Tipe `Glyph` di `src/content/glyphs/types.ts`.
  - *Tes:* semua tes wajib §T.
  - *Selesai jika:* di `/_kit` ada demo canvas glyph `A` yang bisa ditelusuri dengan mouse.

- [x] **T5.3 — Data glyph Latin & angka.**
  - *Bergantung pada:* T5.2
  - *Langkah:* tulis `digits.ts` (0–9), `latin-upper.ts` (A–Z), `latin-lower.ts` (a–z) sesuai content §6.
  - *Tes:* setiap glyph memiliki ≥ 1 stroke, semua titik dalam 10–90, jarak antar titik ≤ 6 setelah validasi (atau engine resample), dan semua ID content §3–§4 ada.
  - *Verifikasi visual:* `/_kit` menampilkan seluruh glyph dalam grid. Periksa manual bentuk dan urutan, lalu catat di Log.

- [x] **T5.4 — G05 Menulis Huruf (slice 1).**
  - *Bergantung pada:* T5.3, T4.6
  - *File:* `src/games/menulis-huruf/{index.ts, rounds.ts, rounds.test.ts, MenulisHurufRound.tsx, .module.css}`
  - *Langkah:*
    1. `createRounds` mengambil sampel huruf dari himpunan level (content §4.1) tanpa duplikat.
    2. `speechFor` → `letter`.
    3. Layout: arena = `TracingCanvas` (kiri/atas), Pipi `happy` + tile huruf target (kanan).
    4. Hapus adapter legacy + `src/games/MenulisHuruf/`, lalu arahkan catalog ke modul baru.
  - *Selesai jika:* DoD-Game.

- [x] **T5.5 — G04 Bunyi Awal (slice 2).**
  - *Bergantung pada:* T5.1, T3.3, T4.6
  - *File:* `src/content/words.ts` (konten bawaan dari content §4.2–4.3, bertipe `{ word: string; objectId: ObjectId }[]` per locale & kegunaan) + `src/games/bunyi-awal/*`. Game membaca kata lewat `content.words` (`initial === true`), bukan import langsung.
  - *Langkah:* sesuai game-specs G04. Ubah status → `ready`.
  - *Selesai jika:* DoD-Game.

- [ ] **T5.6 — HUMAN-1: Uji slice dengan anak.**
  - *Bergantung pada:* T5.4, T5.5
  - *Langkah:* 2–3 anak 4–6 tahun + pendamping, di tablet. Amati: bisa memilih dunia, memulai, memahami demo tangan tanpa penjelasan, memahami "coba lagi", menyelesaikan sesi, dan apakah musik/suara terasa mengganggu.
  - *Output:* temuan ditulis di Log.
  - *AI:* setelah temuan masuk, buat task perbaikan `T5.6a…` di bawah ini **sebelum** lanjut ke T5.7. Penyesuaian toleransi/durasi dilakukan di sini.

- [x] **T5.7 — G06 Dengar & Temukan.**
  - *Bergantung pada:* T5.6, `src/content/hijaiyyah.ts` (tabel content §5)
  - *Langkah:* sesuai spec. Pool hanya hijaiyyah dengan `audioReviewed && audioUrl` (production). Status `ready` di catalog boleh diset setelah DoD, karena kesiapan nyata ditentukan readiness dari CMS (C7.1). Uji di dev dengan fallback TTS.

- [x] **T5.8 — G01 Ayo Berhitung.**
  - *Bergantung pada:* T5.6, `src/content/numbers.ts`
  - *Langkah:* sesuai spec.
  - *Selesai jika:* DoD-Game.

- [x] **T5.9 — G03 Susun Kata.**
  - *Bergantung pada:* T5.6
  - *Langkah:* sesuai spec.
  - *Selesai jika:* DoD-Game.

- [x] **T5.10 — G02 Menulis Angka.**
  - *Bergantung pada:* T5.6, T5.3
  - *Langkah:* sesuai spec (dua digit = dua `TracingCanvas` berdampingan atau satu canvas dengan 2 glyph berurutan; pilih **satu canvas dengan glyph gabungan** yang di-offset x).
  - *Selesai jika:* DoD-Game.

- [x] **T5.11 — Data glyph hijaiyyah + G07.**
  - *Bergantung pada:* T5.6
  - *Langkah:* tulis 28 glyph, lalu G07 sesuai spec. `createRounds` hanya memakai hijaiyyah dengan `content.hijaiyyah.get(id).traceReviewed === true` di production (`import.meta.env.PROD`), dan semua glyph di DEV. Status `soon` sampai review di CMS (plan CMS C7.1).

- [x] **T5.12 — Engine memory + G08.**
  - *Bergantung pada:* T5.6
  - *Langkah:* sesuai spec (`turnMode: 'in-game'`). Shell memberi stiker ke kedua pemain.
  - *Selesai jika:* DoD-Game.

- [x] **T5.13 — Engine maze + G09.**
  - *Bergantung pada:* T5.6
  - *Langkah:* sesuai spec.
  - *Selesai jika:* DoD-Game.

- [x] **T5.14 — Sinkron dokumen Fase 5.**
  - *Langkah:* PRD (status game), architecture (engines), dan Log.

### Fase 6 — Audio & polish

- [x] **T6.1 — Integrasi scene audio.**
  - *Bergantung pada:* Fase 4
  - *Langkah:*
    1. Verifikasi setiap rute memanggil `setScene` sesuai §3.2.
    2. Hijaiyyah + `hijaiyyahNatureOnly` → `music: null`.
    3. Ambient ikut toggle musik.
    4. Uji manual: berpindah Home ↔ Dunia ↔ Play tanpa musik restart bila ID sama, crossfade terdengar halus, dan tab disembunyikan → semua audio berhenti.

- [x] **T6.2 — Pemetaan SFX ke event.**
  - *Bergantung pada:* Fase 5 slice
  - *Langkah:* audit setiap event di [audio §3](../specs/audio.md#3-suara-pengantar-anak-anak--sfx) dan pastikan dipanggil tepat di tempatnya. Pastikan `kids-*` hanya muncul pada pemicu yang ditentukan.
  - *Selesai jika:* tabel audio §3 dicentang satu per satu di Log.

- [ ] **T6.3 — HUMAN-2: Sumber audio (lewat CMS).** Jika CMS (plan CMS C5.4/C6.3) sudah tersedia, langkah di bawah dilakukan dengan **mengunggah di `/admin/suara` & `/admin/kata` lalu Terbitkan** (tanpa menaruh file di repo). Jalur `public/audio/` di bawah hanya untuk konten bawaan/offline.
  - *Prasyarat dari AI:* `npm run audio:check` menghasilkan daftar file yang dibutuhkan (salin ke Log).
  - *Manusia:*
    1. Pilih musik/ambient/SFX dari Pixabay/Freesound sesuai brief audio §2–§3 dan §6.
    2. Siapkan klip speech (audio §4).
    3. Proses loudness (audio §5).
    4. Taruh di `public/audio/` dan isi `CREDITS.md`.
  - *AI setelahnya:*
    1. Jalankan `npm run audio:check -- --strict` (harus exit 0 untuk lapisan music/ambient/sfx).
    2. Cek ukuran file sesuai audio §5 (`ls -la`).
    3. Uji putar setiap adegan.

- [ ] **T6.4 — HUMAN-3: Review hijaiyyah (digantikan plan CMS C7.1).** Review dilakukan di `/admin/hijaiyyah` (rekam/unggah, toggle review, nama peninjau, Terbitkan). Flag `reviewed` di kode glyph **tidak dipakai lagi**; status review berasal dari `content.hijaiyyah` (`audioReviewed`, `traceReviewed`). Langkah lama di bawah dipertahankan sebagai catatan:
  - *Langkah:* ustadz/ustadzah meninjau bunyi `hija-*` dan urutan goresan 28 glyph lewat `/_kit` (tampilkan animasi urutan goresan).
  - *AI setelahnya:* set `reviewed: true` untuk glyph yang disetujui, catat review di content §8, lalu ubah G06/G07 → `ready` bila DoD terpenuhi.

- [x] **T6.5 — Tuning motion & evaluasi GSAP.**
  - *Bergantung pada:* T6.1
  - *Langkah:*
    1. Uji di tablet nyata: tidak ada animasi yang mengunci input > 400 ms dan tidak ada perayaan yang tumpang tindih.
    2. Sesuaikan nilai di `motion.ts` saja (bukan nilai lokal) dan catat perubahannya.
  - *GSAP:* default **tidak dipasang**. Hanya bila ada timeline karakter yang terbukti tidak bisa dibuat dengan Motion: tulis `BLOCKED:` + proposal (ukuran bundle, lazy per game) untuk keputusan pengguna.

### Fase 7 — QA & rilis

- [x] **T7.1 — Setup Playwright.**
  - *Langkah:*
    1. `npm i -D @playwright/test @axe-core/playwright` → `npx playwright install chromium webkit`.
    2. Buat `playwright.config.ts` dengan `webServer: npm run build && npm run preview -- --port 4173`, projects: `chromium-tablet` (1024×768, `hasTouch`) dan `webkit-ipad` (`devices['iPad (gen 7) landscape']`).
    3. Script npm `"e2e": "playwright test"`.
    4. Audio di E2E: set `window.__MSZ_TEST__ = true` lewat `addInitScript`, dan AudioManager memakai implementasi no-op bila flag ada.
- [x] **T7.2 — E2E alur.**
  - *File:* `e2e/flows.spec.ts`
  - *Skenario:*
    - Splash ▶ → bahasa → Home → dunia → game `ready` → Intro → ▶ → selesaikan sesi (pakai helper `__MSZ_TEST__.solveRound()` yang diekspos game di mode test, berisi jawaban benar) → Result → Main lagi;
    - query invalid (`level=x&players=9`) → fallback;
    - refresh di Result;
    - `localStorage` diblokir (`addInitScript` override yang melempar error) → aplikasi tetap jalan;
    - fullscreen ditolak → tidak error;
    - double-tap cepat pada pilihan → hanya satu evaluasi;
    - mode 2 anak → `TurnBanner` muncul + 2 stiker di Result;
    - EN → judul berbahasa Inggris.
- [x] **T7.3 — Aksesibilitas.**
  - *File:* `e2e/a11y.spec.ts`
  - *Langkah:* axe di setiap rute tanpa pelanggaran `serious`/`critical`; alur keyboard Home → Intro → G04 selesai dengan Tab/Enter; fokus Dialog (trap, Escape, restore).
- [x] **T7.4 — Target sentuh & responsif.**
  - *File:* `e2e/touch.spec.ts`
  - *Langkah:*
    1. Di viewport 360×800, 768×1024, 1024×768, 1280×800, ambil semua `button, a, [role=button], [role=switch]` yang terlihat dan assert `boundingBox` ≥ 64×64 (navigasi) / ≥ 88×88 (pilihan arena: selector `[data-choice]`).
    2. Pastikan tidak ada scroll horizontal (`scrollWidth <= clientWidth`).
    3. Ambil screenshot setiap rute per viewport → `e2e/__screenshots__` untuk review manual.
- [x] **T7.5 — Performa.**
  - *Langkah:*
    1. `npm run build` → bundle awal (entry + Splash + Home) ≤ 180 kB gzip, per modul game ≤ 40 kB gzip (di luar aset).
    2. Lighthouse mobile di `/home`: Performance ≥ 85, Accessibility ≥ 95 (catat angka).
    3. Tracing: Performance panel di tablet, frame ≤ 16.7 ms selama menulis.
- [ ] **T7.6 — HUMAN-4: Uji perangkat & anak.**
  - *Langkah:* tablet Android (Chrome) + iPad (Safari). 3–5 anak. Checklist design §12. Temuan masuk Log, lalu buat task perbaikan bila perlu.
- [x] **T7.7 — Sinkron dokumen akhir.**
  - *Langkah:* perbarui PRD (status), architecture (struktur aktual), design (bila ada nilai yang berubah saat tuning), dan plan (status `complete`).
- [ ] **T7.8 — Rilis (dengan izin pengguna).**
  - *Langkah:* hanya game `ready`. Hosting statis dengan fallback SPA ke `index.html`. Header cache untuk `/audio/*` dan `/assets/*`.

---

## 5. Peta ketergantungan

```text
T0.1 → T1.1 ┐
       T1.2 ┼→ T1.6 → T1.7 ─────────────┐
       T1.3 → T1.4 → T1.5 ┘    T1.8 ─┐  │
                              T1.9 ←─┘  │
T1.9 → T2.1 → T2.2 → T2.3 → T2.4 → T2.5 │
T1.6 → T3.1‖T3.2‖T3.3‖T3.4 → T3.5       │
T2.4+T3.x → T4.1 → T4.2 → T4.3 → T4.4 → T4.5 → T4.6(←T1.7) → T4.7 → T4.8 ; T4.9 ; T4.10 → T4.11
T5.1, T5.2→T5.3 → T5.4 + T5.5 → T5.6(HUMAN) → T5.7…T5.13 → T5.14
Fase 4 → T6.1 → T6.2 → T6.3(HUMAN) ; T6.4(HUMAN) ; T6.5
Semua → T7.1 → T7.2…T7.5 → T7.6(HUMAN) → T7.7 → T7.8

Plan CMS: T1.6–T1.8 → C1.1…C1.4 (WAJIB sebelum T5.4); C2–C6 paralel dengan Fase 2–5; C7 bersama Fase 7.
```

## 6. Risiko & mitigasi

| Risiko | Mitigasi |
| --- | --- |
| Audio final terlambat (HUMAN-2) | Manifest + fallback DEV, game tetap bisa diuji. Status `ready` untuk G01–G07 menunggu klip speech, sedangkan G08/G09 tidak butuh speech |
| Musik dirasa mengganggu/overstimulasi | Gain 0.35, ducking, toggle musik, Hijaiyyah tanpa perkusi + opsi suara alam saja, observasi T5.6 |
| SVG v0 buatan AI kurang menarik | Kontrak komponen/nama file tetap, sehingga ilustrator bisa mengganti 1:1 tanpa ubah kode |
| Toleransi tracing tidak cocok | Nilai per level di satu tempat + preferensi garis tebal + T5.6 |
| Rewrite merusak alur | Strangler (halaman lama hidup sampai T4.11), gerbang kualitas per task, E2E |
| Konten hijaiyyah salah | `reviewed` flag + HUMAN-3 sebagai gerbang rilis |
| Kemiripan dengan referensi | Karakter/komposisi orisinal, `ASSETS.md` wajib, larangan trace |

**Rollback:** per task/commit dengan `git revert`. Jangan `reset --hard` di worktree pengguna. Data `localStorage` lama (`lang`) hanya dibaca, tidak dihapus.

## 7. Di luar cakupan

Akun orang tua/anak (login hanya untuk admin CMS), sinkronisasi progres/stiker ke cloud, PWA/offline, analitik, dashboard progres, split-screen, toko/iklan, voice-over narasi, game tambahan dari kidsfromhome (Bubble math, Shape sorter, Pattern train, dst.). Semuanya menjadi backlog dengan keputusan tersendiri.

## 8. Log eksekusi

| Tanggal | Task | Hasil verifikasi | Catatan |
| --- | --- | --- | --- |
| 2026-11-25 | — | lint 0 · test 5/5 · build 386 kB / 124 kB gzip | Plan v2 dibuat |
| 2026-11-25 | — | — | Plan v2.1: audio tanpa voice-over (D5–D8), spesifikasi dipecah ke `docs/specs/*`, task ber-ID untuk AI |
| 2026-11-25 | — | — | Plan v2.2: CMS Supabase + login admin (D11 direvisi, D13). Task C0–C7 ada di plan CMS; game wajib memakai `useContent()` |
| 2026-11-25 | T0.1 | lint 0 · test 5/5 · build 386 kB / 124 kB gzip | Semua dokumen dibaca; worktree tetap di branch saat ini sesuai instruksi pengguna |
| 2026-11-25 | T1.1–T1.3 | lint 0 · test 13/13 · build lulus | Kode/aset mati dihapus; `ids.ts`, `rng.ts`, `storage.ts` dibuat; `.env` dipindah ke `.env.local` tanpa `service_role` |
| 2026-11-25 | T1.4–T1.5 | lint 0 · test 18/18 · build 390.6 kB · JSX literal 0 | `PreferencesProvider` + migrasi `lang`, i18n penuh dari `copy.md`, seluruh halaman lama bermigrasi ke `t()` |
| 2026-11-25 | T1.6–T1.7 | lint 0 · test 26/26 · build lulus | `catalog.ts` tunggal (9 game), `worlds.ts`, konten objek/hijaiyyah/stiker, `session.ts` v2 (+seed), `turns.ts`, `stickers.ts` |
| 2026-11-25 | T1.8–T1.9 | lint 0 · test 30/30 · build multi-chunk (entry 112 kB gzip) | `AudioManager`, `AudioProvider`, `check-audio.mjs` (+`bundled.json`), `ErrorBoundary`, `app/routes.tsx` dengan `React.lazy` |
| 2026-11-25 | T1.10 | lint 0 · test 45/45 · build multi-chunk (entry 118.7 kB gzip) | `architecture.md`, `ai-agents.md`, dan Log disinkronkan bersama CMS C0.2 & C1.1–C1.4 |
| 2026-11-25 | T2.1–T2.3 | lint 0 · test 45/45 · build lulus (font woff2 self-host) | `@fontsource/fredoka`, `@fontsource/nunito`, `@fontsource/noto-naskh-arabic` dipasang; Google Fonts dihapus dari `index.html`; `tokens.css` v2 + `tokens-legacy.css` + `global.css` + `motion.ts` + `useCalmMotion.ts` |
| 2026-11-25 | T2.4–T2.5 | lint 0 · test 47/47 · build lulus · hex di CSS module 0 | 18 komponen dasar + `Icon` + `lib/fullscreen` dibuat tanpa literal hex; halaman dev `/_kit` terdaftar (`import.meta.env.DEV`) |
| 2026-11-25 | T3.1–T3.5 | lint 0 · test 49/49 (`objects.test.ts` lulus) · build lulus | 4 latar dunia SVG (`WorldBackground`), 5 karakter × 3 mood (`MsZiya`, `Jeje`, `Pipi`, `Lulu`, `Kuku`), 71 SVG objek (≤ 4 kB) + loader `import.meta.glob`, `logo.svg`, `favicon.svg`, `ASSETS.md`, dan showcase `/_kit` diperbarui |
| 2026-11-25 | T4.1–T4.11 | lint 0 · test 52/52 (`playReducer.test.ts` lulus) · build lulus · grep legacy/hex 0 | Semua layar baru (`Splash`, `LanguageDialog`, `Home` 4 pintu, `World`, `Intro`, `Play` shell v2 + `playReducer`, `Result` stiker + `sessionStorage`, `Stickers`, `Parents`), transisi rute `AnimatePresence`, dan semua kode/token legacy dihapus |
| 2026-11-25 | T5.1–T5.5, T5.7–T5.14 | lint 0 · test 82/82 (33 file) · build lulus (`index` 120.8 kB gzip, tiap game 1.05–2.24 kB gzip) · grep konvensi 0 | 4 engine (`choice`, `tracing` + `TracingCanvas`, `memory`, `maze`), 90 glyph (`digits`, `latin-upper`, `latin-lower`, `hijaiyyah`) + showcase `/_kit`, 9 modul game (`G01–G09`) memakai `useContent()`, `MenulisHuruf/` & `games/legacy/` dihapus, `prd.md` & `architecture.md` disinkronkan. `T5.6` (HUMAN-1) tetap `[ ]` untuk uji anak |
| 2026-11-26 | T6.1, T6.2, T6.5 | lint 0 · test 82/82 · `audio:check` (music 0/6, ambient 0/4, sfx 0/17, speech-num 0/42, speech-letter 0/52, speech-hija 0/28) | Audit semua `setScene` (9 rute), `hijaiyyahNatureOnly`, `visibilitychange`; 17/17 SFX terpetakan (`tap`, `select`, `whoosh`, `correct`, `retry`, `kids-yay` + ronde terakhir `PlayPage`, `kids-giggle`, `kids-cheer`, `count-pop`, `flip`, `match`, `step`, `bump`, `stroke-done`, `turn`, `door`, `sticker`); `motion.ts` ≤ 260 ms & GSAP tidak dipasang. `T6.3`/`T6.4` (HUMAN) tetap `[ ]` |
| 2026-11-26 | T7.1–T7.5, T7.7 | lint 0 · test 82/82 · **E2E 48/48 lulus** (`chromium-tablet` + `webkit-ipad`) · build `index` 120.5 kB gzip, game 1.05–2.24 kB gzip, `AdminRoutes` 71.38 kB gzip | Playwright + `@axe-core/playwright` terpasang; 5 spec (`flows`, `a11y`, `touch`, `admin`, `content`); kontras WCAG AA 4.5:1 diperbaiki di `tokens.css` (`--blue-500: #087ec0`, `--pink-500: #d6337b`, `--ink-500: #4d5778`), 0 pelanggaran axe `serious`/`critical` di semua rute, 0 overflow di 4 viewport + screenshot `e2e/__screenshots__/`; `prd.md` & `architecture.md` disinkronkan. `T7.6` (HUMAN-4) & `T7.8` (rilis) tetap `[ ]` |
| 2026-11-26 | UX Polish | Lihat [plan UX polish](2026-11-26-ux-polish-plan.md) | Beranda semua 9 game (hapus halaman Dunia), Intro rapi, Arena v2, G01 langsung pilih, tracing StrictMode + mouse + pemaaf, G02 single-digit, polesan G03/G04/G06/G08/G09, transisi halus & audit suara. |
