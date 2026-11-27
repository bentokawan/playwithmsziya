#!/usr/bin/env python3
"""Import CC0 Kenney sound packs into public/audio (sfx + result jingle).

Usage (from project/):
  python scripts/audio/import_sfx.py <kenney-dir> [--force]

<kenney-dir> must contain the unzipped packs as sub-folders:
  interface-sounds/, digital-audio/, music-jingles/   (https://kenney.nl/assets/<name>, CC0)
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent

# slot -> (pack, file stem). Entries marked PLACEHOLDER should be replaced with real
# children's voices (e.g. Pixabay "kids yay") once picked by a human.
MAPPING: dict[str, tuple[str, str]] = {
    "sfx/tap": ("interface-sounds", "click_002"),
    "sfx/select": ("interface-sounds", "pluck_001"),
    "sfx/whoosh": ("interface-sounds", "maximize_004"),
    "sfx/correct": ("interface-sounds", "confirmation_002"),
    "sfx/retry": ("interface-sounds", "minimize_005"),
    "sfx/kids-yay": ("music-jingles", "jingles_PIZZI03"),  # PLACEHOLDER
    "sfx/kids-giggle": ("interface-sounds", "pluck_002"),  # PLACEHOLDER
    "sfx/kids-cheer": ("music-jingles", "jingles_STEEL04"),  # PLACEHOLDER
    "sfx/count-pop": ("interface-sounds", "drop_001"),
    "sfx/flip": ("interface-sounds", "toggle_002"),
    "sfx/match": ("interface-sounds", "glass_003"),
    "sfx/step": ("interface-sounds", "drop_003"),
    "sfx/bump": ("interface-sounds", "bong_001"),
    "sfx/stroke-done": ("interface-sounds", "glass_001"),
    "sfx/turn": ("digital-audio", "twoTone1"),
    "sfx/door": ("digital-audio", "powerUp2"),
    "sfx/sticker": ("interface-sounds", "scratch_001"),
    "sfx/tick": ("interface-sounds", "tick_002"),
    "sfx/time-up": ("digital-audio", "lowDown"),
    "sfx/go": ("interface-sounds", "confirmation_004"),
    "music/result-jingle": ("music-jingles", "jingles_PIZZI01"),
}


def resolve_ffmpeg() -> str:
    which = shutil.which("ffmpeg")
    if which:
        return which
    import imageio_ffmpeg  # type: ignore

    return imageio_ffmpeg.get_ffmpeg_exe()


def find_source(root: Path, pack: str, stem: str) -> Path:
    hits = list((root / pack).rglob(f"{stem}.ogg"))
    if not hits:
        raise FileNotFoundError(f"{pack}/{stem}.ogg not found under {root}")
    return hits[0]


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("kenney_dir", type=Path)
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()

    ffmpeg = resolve_ffmpeg()
    done = 0
    for slot, (pack, stem) in MAPPING.items():
        out = PROJECT_ROOT / "public" / "audio" / f"{slot}.mp3"
        if out.exists() and not args.force:
            continue
        src = find_source(args.kenney_dir, pack, stem)
        out.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            [ffmpeg, "-y", "-hide_banner", "-loglevel", "error", "-i", str(src),
             "-ac", "1", "-ar", "44100", "-b:a", "96k", str(out)],
            check=True,
        )
        print(f"[ok] {slot}.mp3 <- {pack}/{stem}.ogg")
        done += 1
    print(f"Done: {done} written")
    return 0


if __name__ == "__main__":
    sys.exit(main())
