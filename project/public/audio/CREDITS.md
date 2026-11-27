# Kredit Audio Bawaan

| file | judul asli | pembuat | URL sumber | lisensi | tanggal unduh | diedit (loudnorm/potong) |
| --- | --- | --- | --- | --- | --- | --- |
| `speech/id/num-0..20.mp3`, `speech/id/letter-a..z.mp3`, `speech/id/word-*.mp3`, `speech/id/phrase-*.mp3` | Build-time TTS (`id-ID-GadisNeural`, rate -10%, pitch +8Hz) | Microsoft Edge TTS via `rany2/edge-tts` | https://github.com/rany2/edge-tts | Generated build-time via Edge-TTS (dapat ditimpa lewat CMS / Piper fallback) | 2026-11-27 | ya (trim silence + loudnorm -16 LUFS, mono 44.1 kHz 64 kbps) |
| `speech/en/num-0..20.mp3`, `speech/en/letter-a..z.mp3`, `speech/en/word-*.mp3`, `speech/en/phrase-*.mp3` | Build-time TTS (`en-US-AnaNeural`, rate -10%, pitch +0Hz) | Microsoft Edge TTS via `rany2/edge-tts` | https://github.com/rany2/edge-tts | Generated build-time via Edge-TTS (dapat ditimpa lewat CMS / Piper fallback) | 2026-11-27 | ya (trim silence + loudnorm -16 LUFS, mono 44.1 kHz 64 kbps) |
