# SKILL.md — Aturan Kode Bersih & Struktur Komponen (Play with Ms Ziya)

> Aturan wajib untuk semua kode di proyek ini: Vite + React (SPA statis) + TypeScript + Phaser 3, hosting Vercel, backend Supabase.
> Sumber kebenaran: `tech.md` (stack & struktur), `design.md` (visual & interaksi), `features.md` (halaman, fitur, komponen).
> Tujuan: kode rapi, komponen kecil dan mudah ditemukan, folder konsisten antar semua halaman dan game.

---

## 1. Struktur Folder

Mengikuti struktur usulan di `tech.md` §9:

```
play-with-ms-zia/
├─ public/                # manifest, ikon PWA, audio sprite & atlas yang disajikan langsung
├─ src/
│  ├─ main.tsx            # titik masuk Vite
│  ├─ App.tsx             # rute React Router
│  ├─ pages/              # Satu folder per halaman React: Landing, Play, Parent, Privacy
│  │  └─ Parent/
│  │     ├─ Parent.tsx    # Komponen halaman (hanya komposisi, logika minimal)
│  │     └─ index.ts
│  ├─ game/               # SEMUA kode Phaser — dilarang import dari React
│  │  ├─ core/            # GameBase, Storage, Analytics, VoiceGuide
│  │  ├─ modules/         # TracingEngine, ChoiceRound, DuelSplitScreen (dipakai lintas game)
│  │  ├─ scenes/          # Boot, Preload, LanguageSelect, Menu, ModeSelect, LevelSelect, Ready, Result
│  │  └─ games/           # Satu subfolder per kelompok keterampilan, satu file per game:
│  │     ├─ hijaiyyah/    #   listen-find, trace
│  │     ├─ angka/        #   count, trace
│  │     ├─ huruf/        #   spell, first-sound, trace
│  │     └─ memori/       #   memory-cards, maze
│  ├─ components/         # Komponen React reusable lintas halaman: ParentGate, Settings, LoginForm, dll.
│  ├─ lib/supabase/       # Klien browser Supabase + tipe tabel
│  ├─ i18n/               # id.json, en.json, t.ts
│  ├─ content/            # Data per game, per level, per bahasa (kata, jalur tulis, labirin, milestones.json)
│  └─ types/              # Tipe & interface bersama
├─ supabase/              # Migrasi SQL, kebijakan RLS, seed, functions/ (Edge Functions)
├─ vercel.json            # Rewrite SPA + header keamanan (CSP)
├─ assets/                # Sumber: art/ (SVG), audio/{id,en}/, fonts/
├─ scripts/               # Build atlas, build audio sprite, ekspor jalur tulis dari SVG
└─ tests/
```

Aturan folder:

1. **Satu halaman React = satu folder di `src/pages/`.** Komponen yang hanya dipakai halaman itu diletakkan di folder halaman itu, bukan di `components/` global.
2. **Komponen masuk `components/` hanya jika dipakai ≥ 2 tempat.** Jangan "cumplungkan" semua komponen ke global. Komponen bersama yang sudah terdaftar di `features.md` §"Komponen Bersama" (ParentGate, VoiceGuide, StarDisplay, dll.) WAJIB direuse, tidak boleh dibuat ulang.
3. **Batas React ↔ Phaser tegas:** `src/game/` tidak pernah mengimpor React; React tidak pernah mengimpor scene Phaser (hanya memuat kanvas lewat komponen lazy-load di `/play`). Perpindahan antar layar dalam game terjadi di scene Phaser, bukan React Router.
4. **Satu file = satu komponen/hook/scene/modul.** PascalCase untuk komponen, camelCase untuk helper/hook, kebab-case untuk file JSON/data.
5. **Konten game adalah data, bukan kode.** Menambah kata/soal/level/capaian = edit JSON di `src/content/`, jangan sentuh kode scene.
6. **Jangan bikin folder "utils", "common", "misc", "helpers" sebagai tempat sampah.** Helper murni di `lib/` dengan nama spesifik.
7. **Aset besar** (audio sprite, atlas tekstur) di `public/`, di-cache service worker. Sumber mentah di `assets/`, diproses lewat `scripts/` — jangan commit hasil build manual.

---

## 2. Aturan Komponen

1. **Komponen kecil & satu tanggung jawab.** Jika satu komponen > ~100 baris atau menangani > 1 hal (mis. fetch + render + state game), pecah.
2. **Komponen halaman hanya komposisi.** `Home.tsx` menyusun `GameCard`, `SkillGroup`, `HeaderBar` — bukan tempat logika game.
3. **Props eksplisit dan bertipe.** Selalu interface `Props` + TypeScript. Tanpa `any`. Tanpa props boolean mode ganda (`<Button isBig isSmall />`) — pakai varian (`variant: "easy" | "medium" | "hard"`).
4. **State sesempit mungkin.** State global (bahasa, volume, level, profil) hanya lewat `game/core/Storage` atau `lib/` — tidak ada akses localStorage/IndexedDB manual tersebar di komponen.
5. **Data turun, event naik.** Parent kirim props, anak kirim callback. Anak tidak mengubah state parent langsung.
6. **Tidak ada logika bisnis di komponen.** Logika soal, skor, toleransi telusur, aturan capaian (3 putaran terakhir ≥ 80%) hidup di `game/modules/` atau `GameBase`; komponen hanya menampilkan dan meneruskan input.
7. **Semua teks lewat `t()`** dari `i18n/` (id.json, en.json). Tidak ada string UI hardcode.
8. **Tanpa magic number/warna.** Warna, radius, durasi animasi, dan skala font diambil dari token di `design.md` §3–4 (mis. `#1F2A5C` Deep Navy, radius 16 px kartu / 12 px tombol, wobble 300 ms, shimmer 400 ms). Definisikan sekali sebagai konstanta/tema bersama.
9. **Sentuh & aksesibilitas (pengguna usia 4–6) wajib:**
   - Target sentuh minimal 48×48 px; tombol aksi utama ≥ 64 px.
   - `touch-action: none`, tanpa zoom/gulir/menu konteks (lihat tech.md §2.5).
   - Umpan balik selalu menyemangati: tanpa warna merah penalti, tanpa suara negatif (design.md prinsip 5).
   - Dukung `prefers-reduced-motion` + opsi "Kurangi Gerakan" orang tua.
10. **Tidak menambah dependency** untuk hal yang bisa 5–20 baris dengan React/Phaser yang sudah ada. Paket baru wajib ditinjau (lihat bagian 4).
11. **Komentar hanya untuk "kenapa"**, bukan "apa".

---

## 3. Scene Phaser (aturan khusus)

1. Semua game mewarisi **`GameBase`** di `game/core/`. Game baru hanya mengisi aturan soal/level; HUD, giliran/skor, umpan balik, bantuan diam 30 detik, jeda 2 menit, dan layar hasil sudah disediakan.
2. **Kanvas desain 1280×720**, `Scale.FIT`, dipusatkan (tech.md §2.5).
3. Scene tidak mengakses React state; komunikasi lewat `Storage` atau event emitter yang jelas.
4. Semua aset dimuat di `Preload`; scene game tidak memuat aset sendiri.
5. Alur scene mengikuti tech.md §2.2: `Boot → Preload → LanguageSelect → Menu → ModeSelect → LevelSelect → Ready → <GameScene> → Result`.
6. Mode 2 pemain selalu lewat modul `DuelSplitScreen` (pemetaan `pointer.id` ke zona, sentuhan zona lawan diabaikan) — jangan tulis logika split-screen sendiri.
7. Logika dengan unit test wajib (Vitest): pembangkit labirin (recursive backtracker + seed), Fisher–Yates kartu, penilaian tracing, skor duel, `t()`.

---

## 4. Kualitas Umum & Keamanan

**Clean code:**
- **Naming:** nama bisa dibaca keras tanpa konteks. `const d = 30` ❌ → `const idleHelpDelayMs = 3000` ✅.
- **Fungsi kecil, satu tugas.** Fungsi > ~40 baris biasanya harus dipecah. Hindari conditional bertingkat — early return.
- **DRY, tapi jangan over-abstraksi.** Duplikasi 2× masih oke; abstrak saat pola ketiga muncul.
- **Error handling di batas kepercayaan:** parsing JSON konten, localStorage/IndexedDB, fetch Supabase — selalu ada fallback agar anak tidak pernah melihat layar error. Antrean data bermain (IndexedDB) tidak pernah membuat anak menunggu jaringan (tech.md §4.4b).

**Keamanan (dari tech.md §7 — wajib):**
- Tanpa `dangerouslySetInnerHTML`. Tanpa skrip pihak ketiga. Tanpa kolom isian teks bebas untuk anak.
- Hanya `anon key` Supabase di klien. **Tidak ada secret** di kode atau variabel `VITE_*` (semua variabel itu ikut ke peramban). `service_role` hanya di Edge Function.
- RLS aktif di semua tabel sejak awal; uji dengan dua akun orang tua berbeda.
- Dependency baru: lewat lockfile, dicek `npm audit`, tanpa paket yang tidak perlu.

**Privasi:**
- Tanpa cookie, tanpa data anak yang sensitif (hanya nama panggilan + avatar), tanpa data lokasi/perangkat.
- **Jangan pernah hapus/menimpa data anak** (profil, progress, rounds di Supabase) tanpa konfirmasi eksplisit. Hapus akun hanya lewat Edge Function.
- Analitik anonim saja, bisa dimatikan.

---

## 5. Definition of Done

Sebelum menyatakan selesai, cek:

- [ ] File berada di folder yang benar sesuai bagian 1; batas React↔Phaser tidak dilanggar.
- [ ] Tidak ada `any`; tidak ada string UI hardcode (sudah lewat `t()`).
- [ ] Warna/ukuran/durasi dari token `design.md`, bukan angka tersebar.
- [ ] Tidak ada file > ~200 baris tanpa alasan kuat.
- [ ] Logika baru non-trivial punya test Vitest yang gagal bila logikanya rusak.
- [ ] `npm run lint` dan `npm run test` lulus.
- [ ] Diuji di perangkat sentuh nyata untuk perubahan gameplay/UI anak (sentuhan, audio, fullscreen).
- [ ] Tidak ada dependency baru (atau ada alasan tertulis di PR + hasil `npm audit`).
- [ ] Tidak ada secret di kode atau variabel `VITE_*`.
