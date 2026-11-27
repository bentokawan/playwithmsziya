#!/usr/bin/env bash
set -euo pipefail

if [ "$#" -lt 2 ]; then
  echo "Usage: normalize.sh <input-audio> <output-mp3>" >&2
  exit 1
fi

INPUT="$1"
OUTPUT="$2"
FFMPEG_BIN="${FFMPEG_BIN:-ffmpeg}"

mkdir -p "$(dirname "$OUTPUT")"

"$FFMPEG_BIN" -y -hide_banner -loglevel error \
  -i "$INPUT" \
  -af "silenceremove=start_periods=1:start_silence=0.02:start_threshold=-45dB:detection=peak,areverse,silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB:detection=peak,areverse,loudnorm=I=-16:TP=-1:LRA=11" \
  -ac 1 -ar 44100 -b:a 64k \
  "$OUTPUT"
