#!/usr/bin/env python3
"""Build-time speech audio generator for Play with Ms Ziya.

Default engine: edge-tts (id-ID-GadisNeural / en-US-AnaNeural).
Offline fallback: piper-tts (--engine piper).
All outputs are normalized to mono 44.1 kHz 64 kbps MP3 at -16 LUFS.
"""

from __future__ import annotations

import argparse
import asyncio
import json
import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

SCRIPT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPT_DIR.parent.parent
JOBS_PATH = SCRIPT_DIR / "tts-jobs.json"
NORMALIZE_SH = SCRIPT_DIR / "normalize.sh"

EDGE_VOICES = {
    "id": {"voice": "id-ID-GadisNeural", "rate": "-10%", "pitch": "+8Hz"},
    "en": {"voice": "en-US-AnaNeural", "rate": "-10%", "pitch": "+0Hz"},
}

PIPER_MODELS = {
    "id": "id_ID-news_tts-medium",
    "en": "en_US-lessac-medium",
}

LOUDNORM_FILTER = (
    "silenceremove=start_periods=1:start_silence=0.02:start_threshold=-45dB:detection=peak,"
    "areverse,"
    "silenceremove=start_periods=1:start_silence=0.05:start_threshold=-45dB:detection=peak,"
    "areverse,"
    "loudnorm=I=-16:TP=-1:LRA=11"
)


def resolve_ffmpeg() -> str:
    env_bin = os.environ.get("FFMPEG_BIN")
    if env_bin and Path(env_bin).exists():
        return env_bin
    which = shutil.which("ffmpeg")
    if which:
        return which
    try:
        import imageio_ffmpeg  # type: ignore

        return imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError as exc:
        raise RuntimeError(
            "ffmpeg not found on PATH and imageio-ffmpeg is not installed. "
            "Install ffmpeg or run: pip install imageio-ffmpeg"
        ) from exc


def normalize_audio(raw_path: Path, out_path: Path, ffmpeg_bin: str) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    bash_bin = shutil.which("bash")
    if os.name != "nt" and bash_bin and NORMALIZE_SH.exists():
        env = os.environ.copy()
        env["FFMPEG_BIN"] = ffmpeg_bin
        subprocess.run(
            [bash_bin, str(NORMALIZE_SH), str(raw_path), str(out_path)],
            check=True,
            env=env,
        )
        return

    subprocess.run(
        [
            ffmpeg_bin,
            "-y",
            "-hide_banner",
            "-loglevel",
            "error",
            "-i",
            str(raw_path),
            "-af",
            LOUDNORM_FILTER,
            "-ac",
            "1",
            "-ar",
            "44100",
            "-b:a",
            "64k",
            str(out_path),
        ],
        check=True,
    )


async def synth_edge(text: str, locale: str, raw_path: Path) -> None:
    import edge_tts  # type: ignore

    cfg = EDGE_VOICES[locale]
    communicate = edge_tts.Communicate(
        text,
        voice=cfg["voice"],
        rate=cfg["rate"],
        pitch=cfg["pitch"],
    )
    await communicate.save(str(raw_path))


def synth_piper(text: str, locale: str, raw_path: Path, piper_model: str | None) -> None:
    piper_bin = shutil.which("piper")
    if not piper_bin:
        raise RuntimeError("piper binary not found on PATH. Install piper-tts first.")
    model = piper_model or PIPER_MODELS[locale]
    subprocess.run(
        [piper_bin, "--model", model, "--output_file", str(raw_path)],
        input=text.encode("utf-8"),
        check=True,
    )


async def run_jobs(args: argparse.Namespace) -> int:
    if not JOBS_PATH.exists():
        print(f"Missing {JOBS_PATH}. Run node scripts/tts/build-manifest.mjs first.", file=sys.stderr)
        return 1

    jobs = json.loads(JOBS_PATH.read_text(encoding="utf-8"))
    if args.locale != "all":
        jobs = [j for j in jobs if j["locale"] == args.locale]
    if args.only:
        jobs = [j for j in jobs if j["kind"] == args.only]

    if not jobs:
        print("No matching TTS jobs.")
        return 0

    ffmpeg_bin = resolve_ffmpeg()
    generated = 0
    skipped = 0
    sem = asyncio.Semaphore(args.concurrency)

    async def process_one(job: dict[str, str]) -> None:
        nonlocal generated, skipped
        out_path = PROJECT_ROOT / job["out"]
        if out_path.exists() and not args.force:
            skipped += 1
            return

        async with sem:
            suffix = ".mp3" if args.engine == "edge" else ".wav"
            with tempfile.NamedTemporaryFile(suffix=suffix, delete=False) as tmp:
                raw_path = Path(tmp.name)
            try:
                if args.engine == "edge":
                    await synth_edge(job["text"], job["locale"], raw_path)
                else:
                    await asyncio.to_thread(
                        synth_piper, job["text"], job["locale"], raw_path, args.piper_model
                    )
                await asyncio.to_thread(normalize_audio, raw_path, out_path, ffmpeg_bin)
                generated += 1
                print(f"[ok] {job['out']} ({job['text']})")
            finally:
                raw_path.unlink(missing_ok=True)

    await asyncio.gather(*(process_one(job) for job in jobs))
    print(f"Done: {generated} generated, {skipped} skipped (total {len(jobs)} jobs).")
    return 0


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate static speech MP3 files.")
    parser.add_argument("--engine", choices=["edge", "piper"], default="edge")
    parser.add_argument("--locale", choices=["id", "en", "all"], default="all")
    parser.add_argument("--only", choices=["num", "letter", "word", "phrase"], default=None)
    parser.add_argument("--force", action="store_true", help="Regenerate existing files")
    parser.add_argument("--piper-model", default=None, help="Override Piper voice model path/name")
    parser.add_argument("--concurrency", type=int, default=4, help="Parallel TTS workers")
    return parser.parse_args()


if __name__ == "__main__":
    raise SystemExit(asyncio.run(run_jobs(parse_args())))
