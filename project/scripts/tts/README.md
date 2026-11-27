# Build-Time Speech TTS Pipeline

Generates static speech MP3 clips into `public/audio/speech/{locale}/{kind}-{key}.mp3`.
This tooling is dev-only and adds **zero** runtime dependencies.

## Prerequisites

- Python 3.11+
- Default engine: `pip install edge-tts imageio-ffmpeg` (or system `ffmpeg` on `PATH`)
- Offline open-source fallback: `pip install piper-tts` and download `id_ID-news_tts-medium` (check the model card license before distribution)

## Usage

From `project/`:

```bash
# Generate all Indonesian & English speech clips (skips existing files)
npm run audio:tts

# Indonesian only
npm run audio:tts -- --locale id

# Only phrases, force overwrite
npm run audio:tts -- --only phrase --force

# Offline Piper fallback
npm run audio:tts -- --engine piper --locale id

# Update public/audio/bundled.json and verify speech completeness
npm run audio:check -- --write-index --strict --only speech
```

## Audio Spec

- Format: MP3 mono, 44.1 kHz, 64 kbps
- Loudness: integrated `-16 LUFS`, true peak `<= -1 dBTP` (`normalize.sh`)
- Hijaiyyah (`ar/hija-*.mp3`): Edge-TTS `ar-SA-ZariyahNeural`, rate -20%, iqro-style letter names with harakat (`npm run audio:tts -- --locale ar --only hija`). A reviewed human recording uploaded via CMS `/admin/hijaiyyah` overrides it.

## SFX

`python scripts/audio/import_sfx.py <kenney-dir>` converts CC0 Kenney packs (`interface-sounds`, `digital-audio`, `music-jingles` from https://kenney.nl/assets) into the 20 `sfx/*.mp3` slots + `music/result-jingle.mp3`. Mapping lives in the script; `kids-*` entries are placeholders until real children's voices are chosen.
