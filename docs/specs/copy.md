# Spesifikasi Teks UI (i18n)

- Versi: 1.1 — 2026-11-27
- Implementasi: `project/src/i18n/id.ts` (sumber kunci) dan `project/src/i18n/en.ts` (bertipe `Messages` yang sama, sehingga TypeScript memaksa kelengkapan).
- Aturan: semua teks yang terlihat atau dibacakan pembaca layar wajib lewat `t('key')`. Teks anak maksimal 4 kata. Teks pendamping boleh berupa kalimat.
- Variabel ditulis `{name}`, dan `t(key, { name })` menggantinya secara literal (tanpa HTML).

## 1. Umum dan navigasi

| key | id | en |
| --- | --- | --- |
| `app.name` | Play with Ms Ziya | Play with Ms Ziya |
| `nav.back` | Kembali | Back |
| `nav.home` | Beranda | Home |
| `nav.soundOn` | Nyalakan suara | Turn sound on |
| `nav.soundOff` | Matikan suara | Turn sound off |
| `nav.fullscreenEnter` | Layar penuh | Full screen |
| `nav.fullscreenExit` | Keluar layar penuh | Exit full screen |
| `nav.settings` | Pengaturan pendamping (tahan) | Grown-up settings (hold) |
| `nav.stickers` | Buku stiker | Sticker book |
| `splash.start` | Ayo main! | Let's play! |
| `splash.loading` | Menyiapkan… | Getting ready… |
| `lang.title` | Pilih bahasa | Choose a language |
| `lang.id` | Bahasa Indonesia | Bahasa Indonesia |
| `lang.en` | English | English |

## 2. Dunia dan game

| key | id | en |
| --- | --- | --- |
| `world.angka` | Padang Hitung | Counting Meadow |
| `world.huruf` | Taman Permen | Candy Garden |
| `world.hijaiyyah` | Langit Lentera | Lantern Sky |
| `world.memori` | Pulau Pasir | Sandy Island |
| `home.greeting` | Mau main apa hari ini? | What shall we play today? |
| `game.soon` | Segera hadir | Coming soon |
| `game.ayo-berhitung.title` | Ayo Berhitung | Let's Count |
| `game.menulis-angka.title` | Menulis Angka | Write Numbers |
| `game.susun-kata.title` | Susun Kata | Build a Word |
| `game.bunyi-awal.title` | Bunyi Awal | First Sound |
| `game.menulis-huruf.title` | Menulis Huruf | Write Letters |
| `game.dengar-temukan.title` | Dengar & Temukan | Listen & Find |
| `game.tebalkan-hijaiyyah.title` | Menulis Hijaiyyah | Write Hijaiyah |
| `game.kartu-kembar.title` | Kartu Kembar | Memory Pairs |
| `game.petualangan-labirin.title` | Petualangan Labirin | Maze Adventure |
| `game.ayo-berhitung.tagline` | Hitung bendanya, pilih angkanya. | Count the things, pick the number. |
| `game.menulis-angka.tagline` | Tebalkan angka 0 sampai 9. | Trace the numbers 0 to 9. |
| `game.susun-kata.tagline` | Susun huruf jadi kata. | Put letters together into a word. |
| `game.bunyi-awal.tagline` | Dengar kata, cari huruf awalnya. | Listen, then find the first letter. |
| `game.menulis-huruf.tagline` | Tebalkan huruf A sampai Z. | Trace the letters A to Z. |
| `game.dengar-temukan.tagline` | Dengar bunyinya, temukan hurufnya. | Listen and find the letter. |
| `game.tebalkan-hijaiyyah.tagline` | Tebalkan huruf hijaiyyah. | Trace hijaiyyah letters. |
| `game.kartu-kembar.tagline` | Cari dua kartu yang sama. | Find the matching pairs. |
| `game.petualangan-labirin.tagline` | Bantu Kuku menemukan jalan. | Help Kuku find the way. |

**Panel pendamping** (`game.<id>.howTo` dan `game.<id>.skills`):

| id | howTo (id) | skills (id) | howTo (en) | skills (en) |
| --- | --- | --- | --- | --- |
| ayo-berhitung | Lihat bendanya, hitung, lalu ketuk angka yang benar. | Berhitung 1–20, korespondensi satu-satu | Look, count, then tap the right number. | Counting 1–20, one-to-one matching |
| menulis-angka | Mulai dari titik hijau, lalu ikuti jalurnya dengan jari atau mouse. | Menulis angka, motorik halus | Start at the green dot and follow the path with a finger or mouse. | Writing numbers, fine motor skills |
| susun-kata | Ketuk huruf sesuai urutan untuk menyusun kata dari gambar. | Mengeja, urutan huruf | Tap the letters in order to spell the picture. | Spelling, letter order |
| bunyi-awal | Dengarkan kata, lalu pilih huruf pertamanya. | Kesadaran fonologis, huruf awal | Listen to the word, then pick its first letter. | Phonological awareness, first sounds |
| menulis-huruf | Mulai dari titik hijau, lalu ikuti jalurnya dengan jari atau mouse. | Menulis huruf, motorik halus | Start at the green dot and follow the path with a finger or mouse. | Writing letters, fine motor skills |
| dengar-temukan | Dengarkan bunyi huruf hijaiyyah, lalu temukan hurufnya. | Mengenal huruf hijaiyyah | Listen to the hijaiyah letter, then find it. | Recognising hijaiyah letters |
| tebalkan-hijaiyyah | Tebalkan huruf hijaiyyah dari kanan ke kiri mulai dari titik hijau. | Menulis hijaiyyah, arah kanan-kiri | Trace the hijaiyah letter right to left from the green dot. | Writing hijaiyah, right-to-left |
| kartu-kembar | Ketuk dua kartu untuk membaliknya. Temukan pasangan yang sama. | Daya ingat, konsentrasi | Tap two cards to flip them. Find matching pairs. | Memory, focus |
| petualangan-labirin | Geser Kuku melewati jalan sampai ke makanan enak. | Pemecahan masalah, orientasi ruang | Slide Kuku along the path to the yummy food. | Problem solving, spatial sense |

**Keterbatasan aksesibilitas** (`game.tracing.a11yNote`):
- id: "Permainan menulis membutuhkan sentuhan atau mouse dan belum bisa dimainkan dengan keyboard."
- en: "Writing games need touch or a mouse and can't be played with a keyboard yet."

## 3. Intro, arena, dan hasil

| key | id | en |
| --- | --- | --- |
| `intro.level` | Pilih level | Pick a level |
| `intro.level.mudah` | Mudah | Easy |
| `intro.level.sedang` | Sedang | Medium |
| `intro.level.tantang` | Menantang | Tricky |
| `intro.playersLabel` | Berapa anak? | How many players? |
| `intro.players.1` | 1 anak | 1 child |
| `intro.players.2` | 2 anak | 2 children |
| `intro.start` | Mulai | Start |
| `intro.forGrownUps` | Untuk pendamping | For grown-ups |
| `intro.skills` | Yang dilatih | What your child practises |
| `play.round` | Ronde {n} dari {total} | Round {n} of {total} |
| `play.turn` | Giliran {name}! | {name}'s turn! |
| `play.turnReady` | Aku siap! | I'm ready! |
| `timer.label` | Sisa waktu | Time left |
| `timer.timeUp` | Waktu habis! | Time's up! |
| `play.player1` | Kelinci | Bunny |
| `play.player2` | Kucing | Kitty |
| `play.exit.title` | Keluar? | Leave? |
| `play.exit.yes` | Ya, keluar | Yes, leave |
| `play.exit.no` | Lanjut main | Keep playing |
| `play.listen` | Dengar lagi | Listen again |
| `play.hint` | Petunjuk | Hint |
| `trace.again` | Ulangi | Again |
| `maze.up` | Ke atas | Up |
| `maze.down` | Ke bawah | Down |
| `maze.left` | Ke kiri | Left |
| `maze.right` | Ke kanan | Right |
| `result.great` | Hebat! | Great job! |
| `result.again` | Main lagi | Play again |
| `result.world` | Ke dunia | Back to world |
| `result.newSticker` | Stiker baru! | New sticker! |
| `result.repeatSticker` | Lagi! | Again! |
| `result.more` | Coba juga | Try these too |
| `result.empty.title` | Belum ada hasil | No results yet |
| `result.empty.cta` | Pilih permainan | Choose a game |
| `stickers.title` | Buku Stiker | Sticker Book |
| `stickers.count` | {n} dari {total} | {n} of {total} |
| `notFound.title` | Permainan tidak ditemukan | Game not found |
| `error.title` | Ups, ada yang salah | Oops, something went wrong |
| `error.retry` | Coba lagi | Try again |
| `leaderboard.noPlayers` | Belum ada peserta | No players yet |
| `leaderboard.addPlayer` | Tambah Peserta | Add Player |
| `leaderboard.viewDetail` | Lihat rincian poin {name} | View point breakdown for {name} |
| `detail.title` | Rincian Poin | Point Breakdown |
| `detail.close` | Tutup | Close |
| `detail.byModeTitle` | Poin per Cara Main | Points by Play Mode |
| `detail.byGameTitle` | Rincian per Permainan | Breakdown by Game |
| `detail.bucketLine` | {game} main {mode} ({level}) | {game} ({mode} · {level}) |
| `detail.sessionLine` | {game} · Main {mode} · {level} | {game} · {mode} · {level} |
| `detail.sessionsTitle` | Riwayat setiap sesi | Session history |
| `score.speedBonus` | Tercepat +{n} | Fastest +{n} |
| `detail.scoringNote` | Cara hitung poin: 3 poin sekali jadi, 2 poin 2× coba, 1 poin ≥3× coba, +2 poin selesai tercepat di mode balapan (Kartu Kembar: 2 poin per pasangan cocok). | How points work: 3 pts first try, 2 pts on 2nd try, 1 pt on 3+ tries, +2 bonus pts for finishing first in race modes (Memory Pairs: 2 pts per match). |

## 4. Pendamping

| key | id | en |
| --- | --- | --- |
| `gate.hold` | Tahan untuk pendamping | Hold for grown-ups |
| `gate.question` | Untuk orang dewasa: {a} + {b} = ? | For grown-ups: {a} + {b} = ? |
| `gate.wrong` | Belum tepat, coba lagi | Not quite, try again |
| `parents.title` | Pengaturan Pendamping | Grown-up Settings |
| `parents.language` | Bahasa | Language |
| `parents.music` | Musik & suara alam | Music & nature sounds |
| `parents.hijaiyyahNature` | Hanya suara alam di dunia Hijaiyyah | Nature sounds only in Hijaiyah world |
| `parents.calmMotion` | Gerak minimal | Calm motion |
| `parents.thickLines` | Garis tulis lebih tebal | Thicker tracing lines |
| `parents.timerOn` | Timer hitung mundur | Session countdown timer |
| `parents.resetStickers` | Hapus koleksi stiker | Reset sticker book |
| `parents.resetConfirm` | Hapus semua stiker? Tidak bisa dibatalkan. | Delete all stickers? This can't be undone. |
| `parents.about` | Tentang aplikasi | About |
| `parents.aboutBody` | Permainan belajar untuk anak 4–6 tahun. Tanpa iklan, tanpa akun, dan tanpa data pribadi. Progres hanya tersimpan di perangkat ini. | Learning games for children aged 4–6. No ads, no accounts, and no personal data. Progress is stored only on this device. |
| `parents.credits` | Kredit suara & gambar | Sound & image credits |
| `parents.close` | Selesai | Done |

## 5. Nama objek (aria-label)

Nama objek **tidak** disimpan di i18n. Nama diambil dari konten (`content.objects.get(id).name[locale]`). Nilai bawaannya adalah kolom ID/EN di [content §2](content.md#2-daftar-objek-ilustrasi-objectid), dan admin bisa mengubahnya lewat CMS ([cms §6.1](cms.md#61-form-objek)). Teks halaman admin berada di `src/admin/strings.ts` (Bahasa Indonesia saja) dan tidak termasuk file ini.
