# Entry Flow Dua Mode & Sinkron Real-Time — Implementation Plan

- Status: **complete (kode), on-hold (fitur)** — Task 1–7 selesai & lulus; sisa: commit (izin) dan uji 2 perangkat Supabase (izin). Fitur 2 Perangkat akan disembunyikan lewat flag `VITE_FEATURE_ONLINE_ROOM` ([room-hardening plan](2026-11-26-room-hardening-security-plan.md)).

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:**
- **Satu Layar (default, tanpa kode):** layar dibagi bisa langsung dimulai.
- **Dua Perangkat:** membuat atau bergabung ke ruang membawa pemain ke lobby yang tersinkron. Lobby punya status siap, progres real-time, hasil akhir yang sama di kedua perangkat, serta tahan putus dan sambung ulang.

**Architecture:**
- **Host sebagai wasit:**
  - Host memegang keputusan fase (`start`, `final`).
  - Setiap perangkat mengirim **snapshot kumulatif** (bukan delta) dengan `seq` naik, sehingga pesan yang hilang atau ganda tidak merusak state.
- **Sesi ruang:**
  - Disimpan di `sessionStorage`, berisi kode, peran, `sessionId`, config pertandingan, dan snapshot lokal.
  - Dengan itu reload atau putus jaringan bisa melanjutkan permainan dalam masa tenggang 30 detik.
- **Logika:**
  - Semua logika ada di reducer pure `roomReducer`.
  - UI hanya membaca state lewat `useRoomSession`.

**Tech Stack:**
- Aplikasi: React 19, TS 6, Motion 14.
- Realtime: Supabase Realtime (Broadcast + Presence, sudah ada).
- Tes: BroadcastChannel (transport lokal untuk tes), Vitest 5, Playwright 1.65.

**Spec:** permintaan user tanggal 2026-11-26 (bagian 1–2 di bawah).
- **Basis kode:** hasil eksekusi `docs/plan/2026-11-26-multiplayer-profiles-plan.md` (Task 1–12 selesai).
- **File yang sudah ada:** `src/lib/room/*`, `src/pages/Room/*`, `OnlinePlay.tsx`, `IntroPage.tsx`.

---

## 1. Rekomendasi UX entry flow

**Rekomendasi:** dua pilihan eksplisit **"Main di mana?"**: `📱 1 Layar` (terpilih default) dan `📱📱 2 Perangkat`. Room ID **tidak** dibuat sebagai kolom input opsional.

Alasannya:

| Alternatif | Masalah |
|---|---|
| Kolom input Room ID opsional di intro | Kolom kosong membingungkan anak ("harus diisi?"). Keyboard teks muncul di tablet. Satu layar memuat dua niat sekaligus (main sendiri vs. bergabung). |
| Mode dipilih implisit dari jumlah profil (kondisi sekarang) | Mode tidak kelihatan, dan guru tidak tahu cara memunculkan opsi 2 perangkat. |
| **Toggle 1 Layar / 2 Perangkat** ✅ | Satu keputusan, satu ketukan, dengan default yang benar (zero-friction). Kode baru muncul setelah guru memilih 2 Perangkat secara sengaja. |

**Alur (setiap baris = satu layar):**

```
Home ── kartu game ──► Intro
                         ├─ [1 Layar] (default)
                         │    Jumlah anak: [1] [2]   ← slot pemain, profil opsional (kosong = Tamu)
                         │    Level → [Mulai]
                         │      1 anak → solo
                         │      2 anak → LAYAR DIBAGI langsung
                         │               (otomatis "giliran" bila game/layar tak mendukung, + catatan kecil)
                         └─ [2 Perangkat]  (hanya bila transport ada & game mendukung)
                              Profilku (1 slot) → [Buat Ruang] | [Gabung Ruang]
                                 Buat  → Level → Lobby host (kode 4 digit besar + tautan)
                                 Gabung → Keypad 4 digit → Lobby guest
Home ── tombol "Gabung Ruang" ──► Keypad   (jalur cepat guest: game ditentukan host)
Tautan /gabung/1234 ──► langsung lobby guest (dibagikan host lewat tombol Salin)
```

**Keputusan UX:**

| # | Keputusan |
|---|---|
| E1 | **Pilihan "giliran" disembunyikan dari pengguna.** Ia hanya menjadi fallback otomatis `resolveLocalMode`. Mode yang tampil hanya "1 Layar" dan "2 Perangkat", karena dua konsep lebih sedikit daripada empat. |
| E2 | **Slot pemain:** memilih "2 anak" langsung membuat dua slot. Ketuk slot untuk memilih profil; slot yang dibiarkan kosong menjadi "Tamu 1/2". Tombol Mulai selalu aktif, jadi permainan bisa dimulai tanpa profil. |
| E3 | **Kode ruang 4 digit angka:** cukup dengan keypad angka besar, tanpa keyboard huruf. Tabrakan kode dicek lewat presence (coba ulang maksimal 3 kali). Ruangnya bersifat ephemeral. |
| E4 | **Level ditentukan host.** Halaman Gabung tidak menampilkan level atau game; guest melihat "Ana mengajak main *Ayo Berhitung*" di lobby. |
| E5 | **Bahasa mengikuti host.** Ronde harus identik, jadi locale host dipakai di kedua perangkat. |
| E6 | **"Main lagi" di hasil online tetap di ruang yang sama:** pertandingan ulang dengan seed baru, kembali ke cek siap, tanpa memasukkan kode lagi. |

## 2. Spesifikasi sinkron (Dua Perangkat)

**Fase (`roomReducer`, sama di host dan guest):**

```
connecting → waiting(peer?) → ready-check → countdown(3s) → playing → finalizing → final
     │            ▲   │              │                         │            │
     └─ error     │   └─ peer pergi ─┘(ready direset)          │            └─ rematch → ready-check
  (no-host/full/  └──────── peer kembali (≤30 s) ──────────────┘
   offline/content-mismatch/closed)
```

**Pesan `v:2`.** Setiap pesan dibungkus envelope `{v:2, seq, sid, t, …}`. `sid` adalah `sessionId` perangkat pengirim; penerima membuang `seq` yang lebih kecil atau sama dengan `seq` terakhir dari `sid` yang sama.

| `t` | Arah | Isi | Kapan |
|---|---|---|---|
| `hello` | ⇄ | `role, player, content, resume?: Snapshot` | Saat terhubung atau tersambung ulang |
| `ready` | ⇄ | `ready: boolean` | Tombol "Siap!" ditekan |
| `start` | H→G | `matchId, gameId, difficulty, seed, locale, totalRounds, countdownMs:3000` | Host mengirim begitu kedua pihak siap |
| `snap` | ⇄ | `matchId, roundsDone, score, finished, elapsedMs` | Setiap ronde selesai, plus **heartbeat 2 detik** selama `playing` |
| `final` | H→G | `matchId, scores:{host,guest}, maxScore, winner:'host'\|'guest'\|'seri'\|null, reason:'all-done'\|'last-call'\|'peer-gone'` | Kedua pihak tamat, waktu 45 detik habis, atau peer melewati masa tenggang |
| `sync` | H→G | `start` + snapshot host | Membalas `hello{resume}` dari guest |
| `rematch` | H→G | `matchId` baru | "Main lagi" |
| `bye` | ⇄ | — | Keluar dengan sengaja (tidak ada masa tenggang) |

**Aturan:**
- **R1 – Waktu:** pakai `elapsedMs` (jam monotonik lokal sejak countdown selesai), bukan jam dinding. Tie-break dihitung dari skor, lalu `elapsedMs`.
- **R2 – Hasil akhir bersamaan:** hasil hanya dihitung oleh host (`decideFinal`), lalu kedua perangkat pindah ke Result saat menerima atau mengirim `final`, sehingga isinya identik.
  - Bila host hilang lebih dari 30 detik, guest menghitung sendiri dengan `reason:'peer-gone'` dan `winner:null` (tanpa mahkota).
- **R3 – Putus koneksi:** dideteksi dari presence leave atau dari heartbeat yang tidak masuk lebih dari 6 detik. Permainan lokal **tidak dijeda**.
  - Avatar lawan diberi lencana "menyambung…" dan cincin 30 detik.
  - Bila tersambung lagi sebelum batas: `hello{resume}`, lalu host membalas `sync` dan lawan kembali normal.
  - Bila melewati batas: peer dianggap pergi, dan aturan R2 berlaku.
- **R4 – Reload atau tab ditutup sementara:** `PlayPage` membaca `msz:room:active` (sessionStorage), memulihkan config dan snapshot lokal (`roundIndex` + `results`), bergabung ulang dengan `sid` yang sama, lalu melanjutkan dari ronde berikutnya.
  - Sesi di sessionStorage dihapus saat `final`, saat `bye`, atau bila umurnya lebih dari 10 menit.
- **R5 – Lobby:**
  - Guest pergi → host kembali ke `waiting` dan status siap direset.
  - Host pergi dari lobby → guest melihat "Ruang ditutup".
  - Perangkat ketiga ditolak dengan `full`.
  - `sid` yang sama (tab ganda) menggantikan tab lama, dan tab lama menampilkan "Dibuka di tab lain".
- **R6 – Offline:** `navigator.onLine=false` atau channel `CLOSED`/`TIMED_OUT` memunculkan banner "Koneksi terputus, mencoba lagi…". Transport mencoba ulang dengan backoff 1, 2, 4, 8 detik selama masa tenggang.
- **R7 – Tab di latar belakang:** `visibilitychange: hidden` diperlakukan sebagai putus koneksi biasa; perangkat lawan memberi masa tenggang.

---

## Global Constraints

- Tidak ada dependensi baru dan tidak ada migrasi Supabase. Jangan menyentuh project Supabase sungguhan tanpa izin.
- Data anak yang lewat jaringan hanya `name` (≤ 12), `avatar`, dan `color`, sama seperti D8 di plan sebelumnya.
- Kunci i18n baru wajib ada di `id.ts` dan `en.ts`.
- Konstanta:
  - `RECONNECT_GRACE_MS = 30_000`
  - `HEARTBEAT_MS = 2_000`
  - `PEER_STALE_MS = 6_000`
  - `COUNTDOWN_MS = 3_000`
  - `LAST_CALL_MS = 45_000` (sudah ada)
  - `JOIN_TIMEOUT_MS = 5_000` (sudah ada)
  - `ROOM_SESSION_MAX_AGE_MS = 600_000`
- Perilaku "1 Layar" dan solo tidak boleh berubah selain di Intro. E2E `split.spec`, `flows`, dan `leaderboard` tetap hijau.
- Commit hanya bila user mengizinkan.

## Review Focus

1. **Kedua perangkat menekan "Siap!" bersamaan:** hanya satu `start` (dari host) yang terkirim, dan countdown di kedua perangkat berselisih ≤ 300 ms. Diuji di Task 1 (reducer) dan Task 5 (e2e).
2. **Guest reload di ronde ke-2:** kembali ke ronde ke-3 dengan skor yang sama, dan avatarnya di perangkat host tidak mundur. Diuji di Task 3 dan Task 6.
3. **Pesan `done`/`final` hilang atau ganda:** heartbeat `snap` tetap membawa status `finished`, sehingga host tetap mengirim `final`. `final` ganda diabaikan. Diuji di Task 1.
4. **Perangkat ketiga memasukkan kode yang sama, atau ruang yang sama dibuka di tab kedua:** muncul `full` / "Dibuka di tab lain", bukan state yang rusak. Diuji di Task 2.
5. **Tablet kecil memilih 2 anak di game tanpa layar dibagi (G04/G06/G08):** mode otomatis menjadi `giliran` disertai catatan. Mulai tidak pernah gagal. Diuji di Task 4.

---

## File map

```
src/lib/room/protocol.ts        MODIFY  v2 envelope + pesan baru, parseRoomMsg v2
src/lib/room/roomReducer.ts     CREATE  menggantikan lobbyReducer.ts (DELETE) + decideFinal
src/lib/room/transport.ts       MODIFY  interface v2 (sid, status, reconnect)
src/lib/room/supabaseTransport.ts, localTransport.ts   MODIFY  presence key = sid
src/lib/room/roomSession.ts     CREATE  menggantikan activeRoom.ts (DELETE): store + sessionStorage
src/lib/room/useRoomSession.ts  CREATE  hook: transport ↔ reducer ↔ timer
src/games/catalog.ts            MODIFY  resolveLocalMode
src/components/Roster/PlaceChooser.tsx, PlayerSlots.tsx   CREATE  (ModePicker.tsx DELETE)
src/pages/Room/RoomLobby.tsx    CREATE  satu lobby untuk host & guest
src/pages/Room/HostRoomPage.tsx, JoinRoomPage.tsx          MODIFY  tipis, pakai RoomLobby
src/pages/Play/OnlinePlay.tsx   MODIFY  snapshot, badge sambung ulang, final dari host
src/pages/Result/ResultPage.tsx MODIFY  hasil online dari `final`, tombol Main lagi (rematch)
src/app/routes.tsx              MODIFY  /gabung/:code
```

---

### Task 1: Protokol v2 + `roomReducer` (pure)

**Files:**
- Modify: `src/lib/room/protocol.ts`, `protocol.test.ts`
- Create: `src/lib/room/roomReducer.ts`, `roomReducer.test.ts`
- Delete: `lobbyReducer.ts`, `lobbyReducer.test.ts` (setelah Task 5 tidak dipakai lagi; hapus di Task 5)

**Interfaces:**
- Produces:
  ```ts
  interface Snapshot { matchId: string; roundsDone: number; score: number; finished: boolean; elapsedMs: number }
  type RoomMsgBody = Hello | Ready | Start | Snap | Final | Sync | Rematch | Bye   // sesuai tabel §2
  type RoomMsg = { v: 2; seq: number; sid: string } & RoomMsgBody
  parseRoomMsg(raw): RoomMsg | null                 // v≠2 → null
  type RoomPhase = 'connecting'|'waiting'|'ready-check'|'countdown'|'playing'|'finalizing'|'final'|'closed'|'error'
  interface PeerView { sid: string; player: RoomPlayerInfo; connected: boolean; lostAt: number|null; ready: boolean; snap: Snapshot|null; lastSeenAt: number }
  interface RoomState { role; code; sid; phase; error: RoomError|null; match: Start|null; meReady: boolean; me: Snapshot|null; peer: PeerView|null; final: Final|null; lastSeq: Record<string, number> }
  type RoomError = 'no-host'|'full'|'offline'|'content-mismatch'|'closed'|'replaced'
  roomReducer(state, action:
    | {type:'JOINED'} | {type:'JOIN_FAILED'; reason}
    | {type:'MSG'; msg: RoomMsg; now} | {type:'PEER_PRESENCE'; sid; present: boolean; now}
    | {type:'SET_READY'; ready: boolean} | {type:'COUNTDOWN_DONE'}
    | {type:'LOCAL_SNAP'; snap: Snapshot} | {type:'TICK'; now} | {type:'LEAVE'}): RoomState
  effectsFor(prev: RoomState, next: RoomState): RoomMsgBody[]   // pesan yang wajib dikirim akibat transisi (host: start/final/sync)
  decideFinal(host: Snapshot, guest: Snapshot|null, reason): Final  // skor ↓, lalu elapsedMs ↑, sama → 'seri'; guest null → winner null
  ```

- [x] **Step 1:** Tes `roomReducer.test.ts`:
  - Host `waiting`, lalu peer `hello` → `ready-check`. Kedua `ready:true` → `effectsFor` menghasilkan **satu** `start` dan fase `countdown`. `SET_READY` ulang tidak menghasilkan `start` kedua.
  - Guest tidak pernah menghasilkan `start` atau `final`.
  - `MSG` dengan `seq` ≤ `lastSeq[sid]` diabaikan.
  - Host `playing`: `me.finished && peer.snap.finished` → `finalizing`, lalu `effectsFor` → `final{reason:'all-done'}`. `final` kedua diabaikan.
  - Hanya satu pihak yang tamat, lalu `TICK` lewat 45 detik → `final{reason:'last-call'}`.
  - `PEER_PRESENCE false` saat `playing` → `peer.connected=false`, `lostAt=now`, dan fase tetap `playing`.
  - `TICK` lewat `lostAt+30000` → host menghasilkan `final{reason:'peer-gone', winner:null}`, sedangkan guest menghasilkan `final` lokal dengan pemicu yang sama.
  - Heartbeat basi: `TICK` lewat `lastSeenAt+6000` → `connected=false`.
  - `hello{resume}` dari `sid` yang sama saat `playing` → `connected=true`, `lostAt=null`, dan `effectsFor` host → `sync`.
  - Di `ready-check`, peer pergi → `waiting` dan `meReady=false`.
  - `hello` dengan `content` berbeda → `error:'content-mismatch'`.
  - `decideFinal({score:9,elapsedMs:50000},{score:9,elapsedMs:40000})` → winner `'guest'`; skor dan `elapsedMs` yang sama → `'seri'`.
- [x] **Step 2:** Tes `protocol.test.ts`: `v:1` → null, `seq` negatif atau bukan integer → null, `snap.roundsDone > 50` → null, `final.winner` di luar enum → null.
- [x] **Step 3:** `npx vitest run src/lib/room` → FAIL.
- [x] **Step 4:** Implementasi. `matchId = seed.toString(36)`, dan `snap` dengan `matchId` lain diabaikan (sisa pertandingan sebelumnya).
- [x] **Step 5:** PASS → Commit `feat(room): protocol v2 and host-authoritative room reducer`. _(bagian commit dilewati: belum ada izin)_

### Task 2: Transport v2 (sid, status koneksi, sambung ulang)

**Files:**
- Modify: `src/lib/room/transport.ts`, `supabaseTransport.ts`, `localTransport.ts`, `localTransport.test.ts`

**Interfaces:**
- Consumes: `RoomMsg` (Task 1).
- Produces:
  ```ts
  type ConnStatus = 'connecting'|'connected'|'reconnecting'|'closed'
  interface RoomTransport {
    join(code, role, sid): Promise<JoinResult>          // JoinResult.reason + 'replaced'
    send(body: RoomMsgBody): void                       // transport menambah v/seq/sid; seq disimpan & lanjut setelah reconnect
    onMessage(cb: (msg: RoomMsg) => void): () => void
    onPresence(cb: (sid: string, role: RoomRole, present: boolean) => void): () => void
    onStatus(cb: (s: ConnStatus) => void): () => void
    leave(sendBye: boolean): void
  }
  ```
- **Presence:**
  - Key = `sid`, meta = `{role, joinedAt}`.
  - `full` bila sudah ada `sid` lain dengan peran yang sama, atau total `sid` unik ≥ 2 tanpa `sid` saya.
  - Bila `sid` saya sudah ada dengan `joinedAt` yang lebih baru, tab lama menerima `onStatus('closed')` dan `reason:'replaced'`.
- **Sambung ulang:**
  - Channel `CLOSED`/`TIMED_OUT`/`CHANNEL_ERROR` setelah berhasil join → status `reconnecting`, lalu subscribe ulang dengan backoff `[1000,2000,4000,8000]` ms. Berhenti setelah `RECONNECT_GRACE_MS` dan memancarkan `closed`.
  - Listener `online`/`offline` di `window` mempercepat atau menandai upaya ini.
- **Local (BroadcastChannel):** emulasi presence dengan ping/pong per `sid`, plus `simulateDrop(ms)` (khusus tes, diekspor dari `localTransport.ts`).

- [x] **Step 1:** Tes (`createLoopbackPair` diperbarui):
  - `seq` naik monoton dan berlanjut setelah `simulateDrop(500)`.
  - Peer melihat `present:false`, lalu `true` dengan `sid` yang sama.
  - Join ketiga → `full`.
  - Join dengan `sid` yang sama dari instance lain → instance lama mendapat status `closed`.
  - `leave(true)` mengirim `bye` sebelum menutup.
- [x] **Step 2:** FAIL → implementasi → PASS. Uji sambung ulang Supabase tidak diotomasi (lihat Task 7, langkah manual).
- [ ] **Step 3:** Commit `feat(room): transport v2 with session ids and reconnect`. ⏸ _menunggu izin commit_

### Task 3: `roomSession` (persisten) + hook `useRoomSession`

**Files:**
- Create: `src/lib/room/roomSession.ts` (+test), `src/lib/room/useRoomSession.ts`
- Delete: `src/lib/room/activeRoom.ts`, setelah semua pemakai pindah (OnlinePlay, Host/JoinRoomPage) di Task 5/6.

**Interfaces:**
- Produces:
  ```ts
  interface StoredRoom { schemaVersion: 1; code; role; sid; savedAt: number; match: Start|null; local: { roundIndex: number; results: RoundResult[]; elapsedMs: number } | null }
  loadStoredRoom(now: number): StoredRoom | null    // umur > ROOM_SESSION_MAX_AGE_MS → null + hapus
  saveStoredRoom(r: StoredRoom): void;  clearStoredRoom(): void   // key 'msz:room:active', area 'session'
  getOrCreateSid(): string                          // sessionStorage 'msz:room:sid', crypto.randomUUID
  useRoomSession(opts: { code: string; role: RoomRole; me: RoomPlayerInfo; content: string }):
    { state: RoomState; setReady(b): void; reportLocal(snap: Snapshot, local: StoredRoom['local']): void; leave(): void; rematch(): void }
  ```
- **Hook:**
  - Membuat satu transport per `code`+`role`, lalu menyambungkan `onMessage`/`onPresence`/`onStatus` ke `dispatch`.
  - Menjalankan `TICK` setiap 500 ms, mengirim `effectsFor(prev,next)`, dan mengirim heartbeat `snap` setiap `HEARTBEAT_MS` saat `playing`.
  - Menyimpan `StoredRoom` pada setiap `LOCAL_SNAP` dan perubahan `match`.
  - State hidup di **modul singleton**, bukan komponen, agar tetap ada saat navigasi lobby → play → result. Unmount tidak menutup transport; hanya `leave()` atau `final`+keluar yang menutupnya.

- [x] **Step 1:** Tes `roomSession.test.ts`:
  - Round-trip simpan dan muat.
  - Umur 11 menit → null dan key terhapus.
  - JSON rusak → null.
  - `getOrCreateSid` stabil dalam satu sesi.
- [x] **Step 2:** FAIL → implementasi → PASS → Commit `feat(room): persistent room session and hook`. _(bagian commit dilewati: belum ada izin)_

### Task 4: Entry flow Intro — "Main di mana?"

**Files:**
- Create: `src/components/Roster/PlaceChooser.tsx` (+css), `src/components/Roster/PlayerSlots.tsx` (+css)
- Modify:
  - `src/games/catalog.ts` (+test)
  - `src/pages/Intro/IntroPage.tsx` (+css)
  - `src/pages/Home/HomePage.tsx`: label tombol menjadi "Gabung Ruang"
  - i18n
- Delete: `src/components/Roster/ModePicker.tsx` (+css)
- Test: `catalog.test.ts`, `e2e/flows.spec.ts`

**Interfaces:**
- Consumes: `availableModes` (sudah ada), `RosterPicker`/`PlayerChip`/`ProfileEditor` (sudah ada).
- Produces:
  - `resolveLocalMode(entry, players: 1|2, viewportWidth): { mode: 'solo'|'layar'|'giliran'; fallback: boolean }`: 2 pemain → `layar` bila tersedia, selain itu `giliran` dengan `fallback: true`.
  - `canPlayOnline(entry, onlineConfigured): boolean`.
  - `<PlaceChooser value: 'satu'|'dua' onChange online: boolean />`:
    - Dua kartu besar (`aria-pressed`).
    - Bila `!online`, kartu "2 Perangkat" disembunyikan dan judul langkah ikut disembunyikan.
  - `<PlayerSlots count: 1|2 onCount ids: (string|null)[] onPick(slot, id|null) profiles onAdd />`:
    - Setiap slot menampilkan chip profil atau "Tamu N".
    - Ketuk slot untuk membuka sheet roster yang memuat opsi "Tamu".
- **Intro:**
  - Langkah 1: `PlaceChooser`.
  - Langkah 2 untuk **satu**: `PlayerSlots` dan Level. Bila `fallback`, tampilkan catatan `intro.turnsFallback` ("Bergantian, karena game ini paling seru dimainkan bergiliran").
  - Langkah 2 untuk **dua**: satu slot "Profilku", lalu dua tombol `Buat Ruang` (memunculkan Level, lalu → `/game/:id/ruang?level&p1`) dan `Gabung Ruang` (→ `/gabung`).
  - Label Mulai: "Mulai" untuk 1 anak, "Mulai berdua" untuk 2 anak.
  - `msz:intro:last` disimpan dalam bentuk `{schemaVersion:2, place, count, ids}`. Versi 1 dibaca sebagai `place:'satu'`.

- [x] **Step 1:** Tes `catalog.test`:
  - `resolveLocalMode(G01,2,1366)` → `{mode:'layar',fallback:false}`.
  - `(G01,2,800)` → `{mode:'giliran',fallback:true}`.
  - `(G08,2,1366)` → `{mode:'giliran',fallback:true}`.
  - `(G01,1,…)` → `solo`.
- [x] **Step 2:** E2E `flows`:
  - Tanpa profil di desktop: Intro G01 → default "1 Layar" → klik "2 anak" → Mulai → URL memuat `mode=layar`, dan ada dua `[data-pane]` (zero-friction: 3 ketukan).
  - Di `chromium-phone` → `mode=giliran` dan catatan fallback tampil.
  - Pilih "2 Perangkat" → tombol Buat/Gabung terlihat, sedangkan `PlayerSlots` 2 anak tidak.
  - Build tanpa transport → kartu "2 Perangkat" tidak ada.
- [x] **Step 3:** FAIL → implementasi → PASS, dan axe Intro bersih → Commit `feat(intro): explicit one-screen vs two-device entry`. _(bagian commit dilewati: belum ada izin)_

### Task 5: Lobby terpadu (menunggu → siap → hitung mundur)

**Files:**
- Create: `src/pages/Room/RoomLobby.tsx` (+css)
- Modify:
  - `HostRoomPage.tsx`, `JoinRoomPage.tsx`: tipis; keypad tetap di Join, lalu render `RoomLobby`.
  - `routes.tsx`: `/gabung/:code`, yang langsung bergabung bila kode valid.
  - i18n
- Delete: `lobbyReducer.ts` (+test)
- Test: `e2e/online.spec.ts`

**Interfaces:**
- Consumes: `useRoomSession` (Task 3).
- **UI `RoomLobby` per fase:**

  | Fase | Tampilan |
  |---|---|
  | `connecting` | Spinner + "Menyambung…". Tombol Batal selalu ada. |
  | `waiting` (host) | Kode 4 digit, angka 72 px dengan jarak antarangka, serta tombol 🔊 (`audio.speak num` per digit). Tombol "Salin tautan" untuk `/gabung/<kode>`. Status "Menunggu teman…" dengan animasi titik, plus kartu game dan level. |
  | `waiting` (guest) | "Menunggu host…". Bila host tidak ada → `error`. |
  | `ready-check` | Dua kartu pemain berdampingan. Masing-masing menampilkan avatar, nama, status `Belum siap` atau `Siap ✓`. Tombol besar "Siap!" bisa dibatalkan. Guest juga melihat "*Ana* mengajak main *Ayo Berhitung · Mudah*". |
  | `countdown` | 3-2-1 penuh layar, lalu navigasi `/game/:id/play?mode=online&room=<kode>&seed…` (`replace`). |
  | `error` | Kartu ramah per `RoomError` + tombol "Coba lagi" / "Kembali". Teks: `room.err.noHost` "Ruang tidak ditemukan. Cek lagi angkanya ya", `full` "Ruang sudah penuh", `offline` "Internet terputus", `content-mismatch` "Muat ulang aplikasi dulu ya", `closed` "Ruang ditutup", `replaced` "Ruang dibuka di tab lain". |

- [x] **Step 1:** E2E dengan dua page dalam satu context, memakai `VITE_ROOM_TRANSPORT=local`. `playwright.config.ts` mendapat project `chromium-online` dengan `webServer` build terpisah di port 4174, **tidak lagi `test.skip`** bila transport tidak ada.
  - Host membuat ruang, guest membuka `/gabung/<kode>` → keduanya `ready-check`.
  - Hanya host yang Siap → tidak ada navigasi.
  - Keduanya Siap → keduanya di `/play` dengan `seed` yang sama.
  - Guest pergi saat `ready-check` → host kembali `waiting` dengan "Siap" tereset.
  - Kode salah → alert `noHost` dalam ≤ 6 detik.
  - Tab ketiga dengan kode yang sama → `full`.
- [x] **Step 2:** FAIL → implementasi → PASS → Commit `feat(room): unified lobby with ready check`. _(bagian commit dilewati: belum ada izin)_

### Task 6: OnlinePlay v2 (progres real-time, putus/sambung, hasil serentak, rematch)

**Files:**
- Modify:
  - `src/pages/Play/OnlinePlay.tsx` (+css)
  - `src/pages/Play/PlayPage.tsx`: pulihkan dari `loadStoredRoom` bila `mode=online`.
  - `src/pages/Result/ResultPage.tsx`
  - `src/lib/race/raceReducer.ts`: hapus `REMOTE_PROGRESS`/`REMOTE_DONE`; online sekarang memakai `RoomState`, dan race reducer hanya dipakai untuk layar dibagi.
  - i18n
- Test: `e2e/online.spec.ts`, `raceReducer.test.ts` (hapus kasus remote)

**Perilaku:**
- **Progres:** ronde selesai → hitung skor dengan `roundPoints` (bukan rumus lokal yang diduplikasi seperti sekarang), lalu `reportLocal(snap, local)`.
- **`RaceBar` atas:**
  - Membaca `state.me`/`state.peer.snap`.
  - Bila `peer.connected=false`, avatar lawan memudar, diberi lencana "menyambung…", dan cincin menghitung sisa `RECONNECT_GRACE_MS`.
  - Banner koneksi sendiri (`onStatus reconnecting`) ditampilkan di atas.
- **Selesai lokal:** layar "Hebat! Tunggu temanmu" + skor lawan live. Saat last-call, banner 45 detik dihitung dari `state` (host memegang batas waktu; guest hanya menampilkan).
- **Hasil:**
  - Saat `phase==='final'`, tulis `SessionOutcome` dengan `final` (skor kedua pemain, `winner`, `reason`), panggil `appendRecord` untuk profil lokal, lalu navigasi ke Result. Kedua perangkat melakukannya saat menerima atau mengirim `final` yang sama.
  - Result online menampilkan podium identik di kedua perangkat. Bila `reason:'peer-gone'`, tampilkan "Temanmu keluar, kamu tetap hebat!" tanpa mahkota.
  - "Main lagi": host → `rematch` → kedua perangkat ke lobby `ready-check`. Guest melihat tombol "Main lagi" berubah menjadi "Menunggu host…".
  - "Keluar" → `leave(true)` (bye) lalu `clearStoredRoom`.
- **Pulih setelah reload:** `PlayPage` mode online tanpa sesi di memori → `loadStoredRoom`. Bila `match.seed` cocok dengan URL, sesi dipulihkan dan ronde dilanjutkan di `local.roundIndex`. Bila tidak ada atau tidak cocok → layar "Sesi berakhir" + Home.

- [x] **Step 1:** E2E (`chromium-online`):
  - **Progres:** host `solveRound` ×1 → di guest `[data-peer-progress="1"]` dalam ≤ 2 detik.
  - **Reload:** guest `solveRound` ×1 lalu `page.reload()` → guest kembali ke `roundIndex 1` dengan skor yang sama, dan di host `[data-peer-connected]` kembali `"true"` dalam ≤ 6 detik.
  - **Putus singkat:** `simulateDrop(3000)` di guest → host melihat lencana "menyambung…", lalu hilang tanpa `final`.
  - **Hasil serentak:** keduanya menyelesaikan semua ronde → kedua page di `/result`, dengan teks pemenang dan dua skor yang **identik** (bandingkan `innerText` dari `[data-final]`).
  - **Peer pergi:** guest menutup page, waktu dipercepat lewat `page.clock.fastForward(31_000)` → host ke Result dengan `reason peer-gone` dan tanpa mahkota.
  - **Rematch:** host "Main lagi" → kedua page di `ready-check` dengan kode yang sama.
- [x] **Step 2:** FAIL → implementasi → PASS. `split.spec` tetap hijau.
- [x] **Step 3:** Hapus `activeRoom.ts`. `npm run lint && npm test` hijau → Commit `feat(play): realtime sync, reconnect and simultaneous results`. _(bagian commit dilewati: belum ada izin)_

### Task 7: Sinkron dokumen + QA

- [x] Perbarui:
  - `docs/design.md`: entry flow §1, lobby, status koneksi.
  - `docs/architecture.md`: protokol v2, fase, R1–R7, konstanta.
  - `docs/prd.md`: "1 Layar" default, "2 Perangkat" opsional.
  - Log di plan multiplayer sebelumnya: tandai lobbyReducer/ModePicker digantikan.
- [x] `npm run lint && npm test && npm run build && npx playwright test` (semua project, termasuk `chromium-online`) → laporkan hasilnya apa adanya.
- [ ] Manual, **dengan izin user** (menyentuh Supabase sungguhan), pada 2 perangkat fisik: ⏸ _manual/perangkat fisik, belum ada bukti_
  - Buat dan gabung ruang.
  - Matikan Wi-Fi guest selama 10 detik → tersambung kembali.
  - Matikan Wi-Fi guest selama 40 detik → host selesai dengan `peer-gone`.
  - Rematch.
- [ ] Commit `docs: dual-mode entry and realtime sync`. ⏸ _menunggu izin commit_

---

## Log
- 2026-11-26: Plan dibuat. Menunggu konfirmasi E1–E6, R1–R7, dan metode eksekusi.
- 2026-11-26: Tasks 1–7 selesai diimplementasikan & dokumen (`docs/PRD.md`, `docs/design.md`, `docs/architecture.md`, `docs/plan/2026-11-26-multiplayer-profiles-plan.md`) disinkronkan. Verifikasi QA terverifikasi:
  - `npm run lint`: 0 errors.
  - `npm test` (`vitest run src`): 44 test files passed, 143 tests passed.
  - `npm run build` (`tsc -b && vite build`): exited 0 (`built in 609ms`).
  - `npx playwright test` (semua 5 project: `chromium-tablet`, `webkit-ipad`, `chromium-desktop`, `chromium-phone`, `chromium-online`): 141 passed, 19 skipped (test desktop-only pada device non-desktop & split-screen pada tablet/phone), 0 failed (`58.9s`), termasuk keempat skenario `e2e/online.spec.ts` (`chromium-online`).
  - Manual test 2 perangkat fisik via Supabase Realtime belum dijalankan (menunggu izin user) dan `git commit` belum dilakukan (menunggu izin user).
- 2026-11-26 (audit checklist): centang disinkronkan dengan kode; `lobbyReducer.ts`, `activeRoom.ts`, `ModePicker.tsx` terbukti sudah terhapus. Tersisa: commit (izin) dan uji 2 perangkat Supabase (izin).
