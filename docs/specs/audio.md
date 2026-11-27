# Spesifikasi Audio

- Versi: 1.1 — 2026-11-27
- Keputusan pengguna (diperbarui 2026-11-27):
  1. **Narasi dibatasi pada frasa pendek tetap (≤ 4 kata)** lewat kind `phrase` (mis. "Ayo hitung bersama!", "Giliranmu!", "Waktu habis!"). Nama anak tidak diucapkan karena dinamis dan tidak bisa di-generate saat build; giliran diumumkan dengan frasa "Giliranmu!" + SFX `turn`.
  2. Klip bicara pendek dipakai untuk angka, nama huruf, kata, frasa pendek (`phrase`), dan bunyi hijaiyyah. Klip non-hijaiyyah dapat dibuat saat build via pipeline `scripts/tts/` (`edge-tts` default, `piper` fallback offline) lalu di-commit sebagai mp3 statis.
  3. Musik dan SFX diambil dari **library bebas royalti** (Pixabay, Freesound CC0/CC-BY). AI pelaksana menyiapkan manifest, slot file, dan placeholder. Pemilihan file final dilakukan manusia.
  4. **Semua file audio dapat diunggah, diganti, atau (untuk klip bicara) direkam lewat CMS** tanpa mengubah kode ([cms](cms.md)). File di `public/audio/` hanyalah konten bawaan/offline. URL runtime selalu di-resolve lewat `ResolvedContent` (CMS → cache → bawaan).
- Terkait: [design §10](../design.md#10-audio), [content](content.md), [plan v2](../plan/2026-11-25-paud-redesign-plan.md).

## 1. Lapisan suara

| Lapisan | Isi | Volume dasar (gain) | Kapan | Default |
| --- | --- | --- | --- | --- |
| `music` | Musik instrumental ceria khas anak per adegan | 0.35 | Selama adegan aktif, loop | **Nyala** |
| `ambient` | Suara latar dunia (burung, angin, ombak, jangkrik) | 0.25 | Di dunia dan arena, loop | Nyala (ikut toggle musik) |
| `sfx` | Respons tindakan + sorak/tawa anak-anak | 0.7 | Saat event | Nyala |
| `speech` | Klip angka/huruf/kata/hijaiyyah | 1.0 | Saat diminta game | Nyala |

**Aturan mixing:**
- **Ducking:** saat `speech` diputar, `music` dan `ambient` turun ke 40% dari gain-nya (fade 150 ms), lalu naik lagi 300 ms setelah klip selesai.
- **Mute global** (tombol 🔊 kanan atas) membisukan semua lapisan, dengan master gain 0 dan fade 100 ms.
- **Toggle "Musik"** di Pengaturan pendamping mematikan `music` + `ambient` saja. SFX dan speech tetap berjalan.
- Saat `document.hidden`: semua lapisan di-pause, lalu dilanjutkan ketika tab terlihat kembali.

## 2. Adegan musik (scene)

Setiap rute memanggil `audio.setScene({ music, ambient })`. Pergantian adegan memakai crossfade 800 ms. Jika `music` sama dengan adegan sebelumnya, musik tidak di-restart.

| Rute/adegan | `MusicId` | `AmbientId` | Karakter musik (brief pencarian) |
| --- | --- | --- | --- |
| Splash, Home, Stickers | `home` | `null` | Ukulele + glockenspiel + tepuk tangan ringan, 100–115 BPM, mayor, riang |
| Dunia/arena Angka | `world-angka` | `meadow` | Marimba + pizzicato, 95–110 BPM, bouncy |
| Dunia/arena Huruf | `world-huruf` | `breeze` | Xylophone + celesta, 90–105 BPM, manis |
| Dunia/arena Hijaiyyah | `world-hijaiyyah` | `night` | **Tanpa beat/drum**: kotak musik/piano lembut atau pad tenang, 60–75 BPM |
| Dunia/arena Memori | `world-memori` | `waves` | Ukulele pantai + steel drum lembut, 90–100 BPM |
| Result | `result-jingle` (sekali, tidak loop) | `null` | Jingle 3–5 detik, naik, ceria |
| Parents | `null` | `null` | Hening |

Catatan Hijaiyyah: sebagian keluarga Muslim menghindari musik berinstrumen saat belajar huruf Al-Qur'an. Karena itu:
- Dunia Hijaiyyah memakai musik tanpa perkusi dengan volume rendah.
- Pengaturan pendamping menyediakan toggle **"Hanya suara alam di Hijaiyyah"** (`hijaiyyahNatureOnly`, default **mati**). Bila aktif, hanya `ambient: night` yang diputar.

## 3. Suara pengantar anak-anak & SFX

| `SfxId` | Pemicu | Deskripsi | Durasi |
| --- | --- | --- | --- |
| `tap` | Tekan `BlockButton` apa pun | Klik kayu/bubble lembut | ≤ 120 ms |
| `select` | Tile/kartu/pilihan dipilih | Plop naik | ≤ 200 ms |
| `whoosh` | Tile terbang ke slot | Swish pendek | ≤ 300 ms |
| `correct` | Jawaban benar | Chime 2 nada naik | ≤ 600 ms |
| `retry` | Jawaban belum benar | Nada lembut "bwoop" turun, **tanpa** buzzer | ≤ 400 ms |
| `kids-yay` | Ronde terakhir benar, kartu terakhir cocok, labirin selesai | Sorak "yay!" sekelompok anak kecil | ≤ 1.5 s |
| `kids-giggle` | Anak mengetuk karakter (Ms Ziya/teman penjaga), maks 1× per 3 detik | Tawa kecil anak | ≤ 1.2 s |
| `kids-cheer` | Layar hasil (bersamaan dengan stiker terbuka) | Sorak + tepuk tangan anak-anak | ≤ 2.5 s |
| `count-pop` | G01: benda dihitung | Pop bulat (dimainkan bersama klip angka) | ≤ 150 ms |
| `flip` | G08: kartu dibalik | Flip kertas | ≤ 250 ms |
| `match` | G08: pasangan cocok | Ding ganda berkilau | ≤ 600 ms |
| `step` | G09: karakter pindah sel | Langkah kecil lucu | ≤ 150 ms |
| `bump` | G09: menabrak dinding | Boing lembut | ≤ 250 ms |
| `stroke-done` | Tracing: satu goresan selesai | Sparkle pendek | ≤ 400 ms |
| `turn` | Pergantian giliran 2 anak | Dua nada "ding-dong" | ≤ 600 ms |
| `door` | Pintu dunia dibuka | Bel/whoosh ajaib | ≤ 700 ms |
| `sticker` | Stiker membalik | Peel/stick | ≤ 500 ms |
| `tick` | 5 detik terakhir timer sesi | Tik lembut | ≤ 120 ms |
| `time-up` | Waktu sesi habis | Gong/chime turun lembut | ≤ 700 ms |
| `go` | Mulai setelah hitung mundur 3-2-1 | "Ding" mulai ceria | ≤ 400 ms |

**Aturan anti-bising:**
- Maksimal 3 SFX bersamaan.
- SFX dengan ID sama yang dipicu < 80 ms setelah pemicu sebelumnya diabaikan.
- `kids-*` tidak pernah tumpang tindih satu sama lain.

## 4. Klip bicara (`speech`)

**Path file:** `project/public/audio/speech/{locale}/{kind}-{key}.mp3`

| kind | locale | key | Jumlah | Contoh file | Dipakai |
| --- | --- | --- | --- | --- | --- |
| `num` | `id`, `en` | `0`–`20` | 21 × 2 | `speech/id/num-7.mp3` ("tujuh") | G01, G02 |
| `letter` | `id`, `en` | `a`–`z` | 26 × 2 | `speech/en/letter-b.mp3` ("bee") | G03, G04, G05 |
| `word` | `id` | kata lowercase dari content §4.2 + §4.3 | ±40 | `speech/id/word-rumah.mp3` | G03, G04 |
| `word` | `en` | kata lowercase dari content §4.2 + §4.3 | ±42 | `speech/en/word-apple.mp3` | G03, G04 |
| `phrase` | `id`, `en` | `PhraseId` (`count-together`, `try-again`, `great`, `your-turn`, `time-up`, `ready-go`) | 6 × 2 | `speech/id/phrase-your-turn.mp3` | G01, Play, Timer |
| `hija` | `ar` | HijaiyyahId | 28 | `speech/ar/hija-tsa.mp3` (Edge-TTS `ar-SA-ZariyahNeural`) | G06, G07 |

Bunyi hijaiyyah memakai nama huruf, sesuai konten "dengarkan bunyi dan temukan hurufnya" di brief.

**Produksi klip** (oleh manusia; disarankan langsung di CMS `/admin/kata`, `/admin/suara`, `/admin/hijaiyyah` dengan tombol **Rekam** atau **Unggah**, lalu **Terbitkan**):
- Opsi utama: rekaman suara pendamping/guru, atau suara anak dengan **izin tertulis orang tua**. Nada ramah dan jelas.
- Opsi sementara: TTS offline yang diekspor menjadi file (bukan runtime) dengan lisensi yang mengizinkan distribusi.
- **Hijaiyyah (keputusan pengguna 2026-11-27): TTS dulu, voice-over menyusul.** Klip bawaan `speech/ar/hija-*.mp3` dibuat dengan Edge-TTS `ar-SA-ZariyahNeural` (rate −20 %) dari nama huruf gaya iqro berharakat (`scripts/tts/build-manifest.mjs` → `HIJAIYYAH_AR`). Klip bawaan dianggap `audioReviewed` sehingga G06 terbuka di production. Rekaman ustadz/ustadzah lewat CMS `/admin/hijaiyyah` tetap disarankan; rekaman CMS menimpa klip bawaan dan memakai status review CMS sendiri. Bila entri CMS tidak punya file, status review mengikuti klip bawaan.

**Fallback runtime (hanya `import.meta.env.DEV`):** bila file 404, `speak()` memakai `speechSynthesis` dengan `lang` `id-ID` / `en-US` / `ar-SA` dan menulis `console.warn('[audio] missing', path)`. Di production, file yang hilang dilewati tanpa suara, dan elemen sumber cukup memberi pulse visual. Kesiapan game di production dihitung oleh `computeReadiness` ([cms §7](cms.md#7-aturan-kelengkapan-dipakai-cms-dan-app-anak)) atas konten CMS/bawaan. `npm run audio:check` hanya memeriksa file bawaan di `public/audio/`.

## 5. Spesifikasi file

| Lapisan | Format | Kanal / bitrate | Loudness (integrated) | Lain-lain |
| --- | --- | --- | --- | --- |
| music | `.mp3` | stereo 128 kbps, 44.1 kHz | −20 LUFS | 60–150 detik, titik loop bersih (fade in/out ≤ 20 ms), ≤ 2.5 MB |
| ambient | `.mp3` | mono 64 kbps | −26 LUFS | 30–60 detik, loop bersih, ≤ 500 kB |
| sfx | `.mp3` | mono 64 kbps | −16 LUFS (peak ≤ −1 dBTP) | Potong hening awal ≤ 10 ms |
| speech | `.mp3` | mono 64 kbps | −16 LUFS | Hening awal ≤ 30 ms, akhir ≤ 150 ms |

**Lokasi:**
- `project/public/audio/music/{MusicId}.mp3`
- `project/public/audio/ambient/{AmbientId}.mp3`
- `project/public/audio/sfx/{SfxId}.mp3`
- `project/public/audio/speech/...`

Normalisasi loudness memakai `ffmpeg -af loudnorm=I=-16:TP=-1:LRA=11` (sesuaikan nilai `I` per lapisan).

## 6. Sumber dan lisensi

| Sumber | Lisensi yang boleh | Catatan |
| --- | --- | --- |
| pixabay.com/music, pixabay.com/sound-effects | Pixabay Content License | Atribusi tidak wajib, tetapi tetap dicatat |
| freesound.org | **CC0** (utama) atau **CC-BY 4.0** (wajib kredit di halaman Pendamping → Kredit) | **Tolak** CC-BY-NC dan Sampling+ |
| Rekaman sendiri (termasuk perekam CMS) | `recorded-consent`; suara anak memerlukan izin tertulis orang tua | Simpan bukti izin di luar repo dan CMS |

Untuk file yang diunggah lewat CMS, lisensi/pembuat/sumber diisi di form upload (tabel `media`) dan ikut diterbitkan di `manifest.credits`. Untuk file bawaan, setiap file wajib punya baris di `project/public/audio/CREDITS.md`:

```md
| file | judul asli | pembuat | URL sumber | lisensi | tanggal unduh | diedit (loudnorm/potong) |
```

Kata kunci pencarian awal (dipakai manusia saat memilih):
- **music:** "kids ukulele happy", "children marimba playful", "cute xylophone", "music box lullaby", "kids beach ukulele", "happy jingle short"
- **ambient:** "meadow birds", "gentle breeze chimes", "night crickets calm", "soft ocean waves"
- **sfx:** "kids yay", "children cheering short", "kids giggle", "bubble pop", "cartoon boing", "magic chime", "card flip"

## 7. API `AudioManager`

Implementasi di `project/src/lib/audio/`. Rinciannya ada di plan T1.8.

```ts
export type MusicId = 'home' | 'world-angka' | 'world-huruf' | 'world-hijaiyyah' | 'world-memori' | 'result-jingle';
export type AmbientId = 'meadow' | 'breeze' | 'night' | 'waves';
export type SfxId = 'tap' | 'select' | 'whoosh' | 'correct' | 'retry' | 'kids-yay' | 'kids-giggle' | 'kids-cheer'
  | 'count-pop' | 'flip' | 'match' | 'step' | 'bump' | 'stroke-done' | 'turn' | 'door' | 'sticker'
  | 'tick' | 'time-up' | 'go';
export type PhraseId = 'count-together' | 'try-again' | 'great' | 'your-turn' | 'time-up' | 'ready-go';
export type SpeechClip =
  | { kind: 'num'; locale: 'id' | 'en'; key: number }
  | { kind: 'letter'; locale: 'id' | 'en'; key: string }   // 'a'..'z'
  | { kind: 'word'; locale: 'id' | 'en'; key: string }     // lowercase
  | { kind: 'phrase'; locale: 'id' | 'en'; key: PhraseId }
  | { kind: 'hija'; key: HijaiyyahId };

export interface AudioApi {
  /** Dipanggil pada gesture pertama (tombol ▶ di Splash). Membuat/resume AudioContext. */
  unlock(): Promise<void>;
  /** Ganti musik/ambient dengan crossfade 800 ms. null = hentikan lapisan itu. */
  setScene(scene: { music: MusicId | null; ambient: AmbientId | null; loop?: boolean }): void;
  sfx(id: SfxId): void;
  /** Hentikan klip sebelumnya, putar klip ini, resolve saat selesai/dibatalkan. */
  speak(clip: SpeechClip): Promise<void>;
  stopSpeech(): void;
  readonly unlocked: boolean;
}
```

**Teknis:**
- Satu `AudioContext` dengan graf `master → [musicGain, ambientGain, sfxGain, speechGain] → destination`.
- `music`/`ambient` memakai `HTMLAudioElement` (`loop`, `preload="auto"`) → `createMediaElementSource` → gain. Volume diatur lewat GainNode, karena `HTMLAudioElement.volume` tidak bisa diubah di iOS.
- `sfx`/`speech` memakai `fetch` → `decodeAudioData` → cache `Map<string, AudioBuffer>` → `AudioBufferSourceNode`.
- Preload: SFX inti (`tap, select, correct, retry, whoosh`) dimuat saat `unlock()`. Klip speech dimuat oleh game saat `createRounds` selesai, hanya untuk item ronde sesi itu.
- Semua sumber dihentikan saat `setScene` berganti dan saat unmount provider.
