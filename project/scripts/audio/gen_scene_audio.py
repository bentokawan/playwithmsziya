#!/usr/bin/env python3
"""Generate the background music + ambient loops (self-made, CC0) for every scene.

Usage (from project/):
  python scripts/audio/gen_scene_audio.py [--only home,meadow,...] [--force]

Everything is synthesised deterministically with numpy (fixed seeds), so the same
command always yields the same files. All layers are rendered *circularly* (note tails,
reverb and filters wrap around the buffer end), so every file loops seamlessly.

Output (docs/specs/audio.md §5):
  music/{id}.mp3    stereo 128 kbps 44.1 kHz, -20 LUFS, 60-150 s
  ambient/{id}.mp3  mono 64 kbps 44.1 kHz, -26 LUFS, 30-60 s, <= 500 kB
"""

from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from dataclasses import dataclass, field
from pathlib import Path

import numpy as np
from scipy.io import wavfile

SR = 44_100
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
OUT_DIR = PROJECT_ROOT / "public" / "audio"


# ----------------------------------------------------------------------------- helpers


def hz(midi: float) -> float:
    return 440.0 * 2 ** ((midi - 69) / 12)


def tvec(dur: float) -> np.ndarray:
    return np.arange(int(dur * SR)) / SR


def attack(sig: np.ndarray, ms: float = 4) -> np.ndarray:
    n = min(len(sig), int(SR * ms / 1000))
    if n > 0:
        sig[:n] *= np.linspace(0, 1, n)
    return sig


def release(sig: np.ndarray, ms: float = 30) -> np.ndarray:
    n = min(len(sig), int(SR * ms / 1000))
    if n > 0:
        sig[-n:] *= np.linspace(1, 0, n)
    return sig


def fft_filter(x: np.ndarray, lo: float | None = None, hi: float | None = None) -> np.ndarray:
    """Circular band-pass with soft (1-octave) roll-off; keeps loops seamless."""
    spec = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    gain = np.ones_like(f)
    if lo:
        gain *= np.clip(np.log2(np.maximum(f, 1) / lo) + 1, 0, 1)
    if hi:
        gain *= np.clip(1 - np.log2(np.maximum(f, 1) / hi), 0, 1)
    return np.fft.irfft(spec * gain, n=len(x))


def colored_noise(n: int, rng: np.random.Generator, slope: float) -> np.ndarray:
    """slope 0 = white, 0.5 = pink, 1 = brown. Periodic over n samples."""
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    out = np.fft.irfft(spec / f**slope, n=n)
    return out / (np.max(np.abs(out)) + 1e-9)


def circular_reverb(x: np.ndarray, seconds: float, rng: np.random.Generator) -> np.ndarray:
    n = int(seconds * SR)
    ir = rng.standard_normal(n) * np.exp(-np.arange(n) / (SR * seconds / 5))
    ir = fft_filter(np.concatenate([ir, np.zeros(len(x) - n)]), hi=6000)
    wet = np.fft.irfft(np.fft.rfft(x) * np.fft.rfft(ir), n=len(x))
    return wet / (np.max(np.abs(wet)) + 1e-9) * np.max(np.abs(x))


class Track:
    """Stereo circular buffer; notes that run past the end wrap to the start."""

    def __init__(self, seconds: float):
        self.n = int(round(seconds * SR))
        self.buf = np.zeros((self.n, 2))

    def add(self, at_s: float, sig: np.ndarray, gain: float = 1.0, pan: float = 0.0) -> None:
        start = int(round(at_s * SR)) % self.n
        sig = sig[: self.n] * gain
        left, right = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        idx = (start + np.arange(len(sig))) % self.n
        np.add.at(self.buf[:, 0], idx, sig * left)
        np.add.at(self.buf[:, 1], idx, sig * right)


# ----------------------------------------------------------------------------- instruments


def marimba(f: float, dur: float = 0.9) -> np.ndarray:
    t = tvec(dur)
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * 4 * f * t) * np.exp(-t * 25)
    return release(attack(s * np.exp(-t * 5.5)))


def xylophone(f: float, dur: float = 0.6) -> np.ndarray:
    t = tvec(dur)
    s = np.sin(2 * np.pi * f * t) + 0.4 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 18)
    return release(attack(s * np.exp(-t * 8), 2))


def glock(f: float, dur: float = 1.4) -> np.ndarray:
    t = tvec(dur)
    s = (
        np.sin(2 * np.pi * f * t)
        + 0.3 * np.sin(2 * np.pi * 2.76 * f * t) * np.exp(-t * 6)
        + 0.12 * np.sin(2 * np.pi * 5.4 * f * t) * np.exp(-t * 12)
    )
    return release(attack(s * np.exp(-t * 3.2), 2))


def celesta(f: float, dur: float = 1.2) -> np.ndarray:
    t = tvec(dur)
    s = np.sin(2 * np.pi * f * t) + 0.25 * np.sin(2 * np.pi * 2 * f * t) * np.exp(-t * 5)
    return release(attack(s * np.exp(-t * 3.8), 3))


def music_box(f: float, dur: float = 2.2) -> np.ndarray:
    t = tvec(dur)
    s = (
        np.sin(2 * np.pi * f * t)
        + 0.35 * np.sin(2 * np.pi * 3 * f * t) * np.exp(-t * 10)
        + 0.08 * np.sin(2 * np.pi * 5.2 * f * t) * np.exp(-t * 16)
    )
    return release(attack(s * np.exp(-t * 2.0), 2), 80)


def steel_drum(f: float, dur: float = 1.0) -> np.ndarray:
    t = tvec(dur)
    s = (
        np.sin(2 * np.pi * f * t)
        + 0.5 * np.sin(2 * np.pi * 2.0 * f * t) * np.exp(-t * 4)
        + 0.25 * np.sin(2 * np.pi * 3.01 * f * t) * np.exp(-t * 7)
    )
    return release(attack(s * np.exp(-t * 3.4), 6))


def pluck(f: float, dur: float, rng: np.random.Generator, damp: float = 0.996) -> np.ndarray:
    """Karplus-Strong string (ukulele / pizzicato), vectorised per period."""
    period = max(2, int(SR / f))
    total = int(dur * SR)
    out = np.zeros(total + period + 1)
    out[: period + 1] = fft_filter(rng.uniform(-1, 1, period + 1), hi=5000) if period > 64 else rng.uniform(-1, 1, period + 1)
    i = period + 1
    while i < len(out):
        j = min(i + period, len(out))
        prev = out[i - period - 1 : j - period - 1]
        cur = out[i - period : j - period]
        out[i:j] = damp * 0.5 * (prev + cur)
        i = j
    sig = out[:total]
    return release(attack(sig / (np.max(np.abs(sig)) + 1e-9), 2), 40)


def soft_bass(f: float, dur: float) -> np.ndarray:
    t = tvec(dur)
    s = np.sin(2 * np.pi * f * t) + 0.15 * np.sin(2 * np.pi * 2 * f * t)
    return release(attack(s * np.exp(-t * 1.2), 20), 120)


def pad(freqs: list[float], dur: float) -> np.ndarray:
    t = tvec(dur)
    s = np.zeros_like(t)
    for f in freqs:
        for det in (-0.12, 0.0, 0.12):
            ff = f * 2 ** (det / 12)
            s += np.sin(2 * np.pi * ff * t) + 0.12 * np.sin(2 * np.pi * 2 * ff * t)
    env = np.minimum(1, t / 0.9) * np.minimum(1, (dur - t) / 0.9)
    return s * np.clip(env, 0, 1) / (3 * len(freqs))


def clap(rng: np.random.Generator) -> np.ndarray:
    t = tvec(0.18)
    noise = fft_filter(np.concatenate([rng.standard_normal(len(t)), np.zeros(SR)]), lo=900, hi=3500)[: len(t)]
    return noise * np.exp(-t * 32)


def shaker(rng: np.random.Generator) -> np.ndarray:
    t = tvec(0.09)
    noise = fft_filter(np.concatenate([rng.standard_normal(len(t)), np.zeros(SR)]), lo=5000)[: len(t)]
    return attack(noise * np.exp(-t * 45), 6)


# ----------------------------------------------------------------------------- composition

MAJOR_PENTA = [0, 2, 4, 7, 9]
CHORDS = {  # semitone offsets from key root: I, IV, V, vi, ii
    "I": [0, 4, 7],
    "IV": [5, 9, 12],
    "V": [7, 11, 14],
    "vi": [9, 12, 16],
    "ii": [2, 5, 9],
}
RHYTHMS = [  # (beat offset, length in beats) inside one 4/4 bar
    [(0, 1), (1, 1), (2, 1), (3, 1)],
    [(0, 0.5), (0.5, 0.5), (1, 1), (2, 0.5), (2.5, 0.5), (3, 1)],
    [(0, 1.5), (1.5, 0.5), (2, 2)],
    [(0, 0.5), (0.5, 0.5), (1, 0.5), (1.5, 0.5), (2, 2)],
    [(0, 1), (1, 0.5), (1.5, 0.5), (2, 1), (3, 1)],
]
CALM_RHYTHMS = [RHYTHMS[0], RHYTHMS[2], [(0, 2), (2, 2)], [(0, 1), (1, 1), (2, 2)]]


def scale_notes(key: int, lo: int, hi: int) -> list[int]:
    return [m for m in range(lo, hi + 1) if (m - key) % 12 in MAJOR_PENTA]


def make_phrase(rng, key, prog, rhythms, lo=72, hi=86, end_long=True):
    """4-bar melody: pentatonic random walk, strong beats snap to chord tones."""
    scale = scale_notes(key, lo, hi)
    pos = len(scale) // 2
    notes = []
    for bar, chord in enumerate(prog):
        pattern = rhythms[rng.integers(len(rhythms))]
        if end_long and bar == len(prog) - 1:
            pattern = [(0, 1), (1, 1), (2, 2)]
        chord_pcs = {(key + c) % 12 for c in CHORDS[chord]}
        for k, (beat, length) in enumerate(pattern):
            pos = int(np.clip(pos + rng.choice([-2, -1, -1, 1, 1, 2, 0]), 0, len(scale) - 1))
            if beat in (0, 2):
                cands = [i for i, m in enumerate(scale) if m % 12 in chord_pcs]
                pos = min(cands, key=lambda i: abs(i - pos))
            if end_long and bar == len(prog) - 1 and k == len(pattern) - 1:
                roots = [i for i, m in enumerate(scale) if (m - key) % 12 == 0]
                pos = min(roots, key=lambda i: abs(i - pos))
            notes.append((bar * 4 + beat, length, scale[pos]))
    return notes


@dataclass
class Song:
    name: str
    bpm: float
    key: int  # midi of tonic in octave 4 area (e.g. 60 = C)
    prog_a: list[str]
    prog_b: list[str]
    seed: int
    lead: str
    calm: bool = False
    parts: set[str] = field(default_factory=set)


SONGS = {
    # Splash/Home/Stickers: ukulele + glockenspiel + light claps, ~108 BPM, bright.
    "home": Song("home", 108, 60, ["I", "V", "vi", "IV"], ["IV", "I", "ii", "V"], 11, "glock",
                 parts={"uke", "claps", "bass"}),
    # Angka: marimba + pizzicato, bouncy.
    "world-angka": Song("world-angka", 102, 62, ["I", "IV", "V", "I"], ["vi", "IV", "ii", "V"], 22, "marimba",
                        parts={"marimba-arp", "pizz", "shaker"}),
    # Huruf: xylophone + celesta, sweet.
    "world-huruf": Song("world-huruf", 96, 65, ["I", "vi", "IV", "V"], ["IV", "V", "I", "vi"], 33, "xylophone",
                        parts={"celesta-arp", "pizz"}),
    # Hijaiyyah: no beat/drums, music box + soft pad, 68 BPM.
    "world-hijaiyyah": Song("world-hijaiyyah", 68, 57, ["I", "IV", "vi", "V"], ["IV", "I", "ii", "V"], 44, "music_box",
                            calm=True, parts={"pad", "soft-bass"}),
    # Memori: beach ukulele + soft steel drum.
    "world-memori": Song("world-memori", 94, 64, ["I", "IV", "I", "V"], ["vi", "IV", "V", "I"], 55, "steel_drum",
                         parts={"uke", "bass", "shaker"}),
}

LEADS = {
    "glock": (glock, 0.32),
    "marimba": (marimba, 0.45),
    "xylophone": (xylophone, 0.42),
    "music_box": (music_box, 0.34),
    "steel_drum": (steel_drum, 0.40),
}


def render_song(song: Song) -> np.ndarray:
    rng = np.random.default_rng(song.seed)
    spb = 60 / song.bpm
    phrase_a = make_phrase(rng, song.key, song.prog_a, CALM_RHYTHMS if song.calm else RHYTHMS)
    phrase_b = make_phrase(rng, song.key, song.prog_b, CALM_RHYTHMS if song.calm else RHYTHMS)
    # A A B A, twice (second pass adds a counter-voice) -> 32 bars.
    sections = [("A", song.prog_a, phrase_a), ("A", song.prog_a, phrase_a),
                ("B", song.prog_b, phrase_b), ("A", song.prog_a, phrase_a)] * 2
    if song.calm:
        sections = sections[:5]  # 20 bars at 68 BPM ~= 70 s
    bars = 4 * len(sections)
    track = Track(bars * 4 * spb)
    lead_fn, lead_gain = LEADS[song.lead]

    for s_idx, (_, prog, phrase) in enumerate(sections):
        base = s_idx * 16 * spb
        second_pass = s_idx >= 4
        for beat, length, midi in phrase:
            at = base + beat * spb
            dur = max(0.6, length * spb + 0.5)
            track.add(at, lead_fn(hz(midi), dur), lead_gain, 0.0)
            if second_pass and not song.calm and length >= 1:
                track.add(at, celesta(hz(midi - 12 + 7 if midi - 12 + 7 < 84 else midi - 12), 0.9), 0.10, -0.35)
        for bar, chord in enumerate(prog):
            bar_t = base + bar * 4 * spb
            tones = [song.key + c for c in CHORDS[chord]]
            root = song.key + CHORDS[chord][0]
            if "uke" in song.parts:  # D - D U - U D U strum on eighths
                for beat in (0, 1, 1.5, 2.5, 3, 3.5):
                    up = beat % 1 == 0.5
                    order = tones[::-1] if up else tones
                    for k, m in enumerate(order):
                        track.add(bar_t + beat * spb + k * 0.012, pluck(hz(m), 0.7, rng), 0.10 if up else 0.14, -0.3)
            if "marimba-arp" in song.parts:
                arp = tones + [tones[1] + 12, tones[2], tones[1], tones[0] + 12, tones[1]]
                for k in range(8):
                    track.add(bar_t + k * 0.5 * spb, marimba(hz(arp[k % len(arp)] - 12), 0.5), 0.16, -0.3)
            if "celesta-arp" in song.parts:
                for k, m in enumerate([tones[0], tones[2], tones[1] + 12, tones[2]]):
                    track.add(bar_t + k * spb, celesta(hz(m), 1.0), 0.14, -0.3)
            if "pizz" in song.parts:
                for beat, m in ((0, root - 12), (2, root - 5)):
                    track.add(bar_t + beat * spb, pluck(hz(m), 0.5, rng, 0.990), 0.30, 0.15)
            if "bass" in song.parts:
                for beat, m in ((0, root - 12), (2, root - 12), (3.5, root - 5)):
                    track.add(bar_t + beat * spb, pluck(hz(m), 0.6, rng, 0.993), 0.26, 0.1)
            if "claps" in song.parts:
                for beat in (1, 3):
                    track.add(bar_t + beat * spb, clap(rng), 0.10, 0.35)
            if "shaker" in song.parts:
                for k in range(8):
                    track.add(bar_t + k * 0.5 * spb, shaker(rng), 0.05 if k % 2 else 0.08, 0.45)
            if "pad" in song.parts:
                track.add(bar_t, pad([hz(m) for m in tones], 4 * spb + 0.9), 0.22, 0.0)
            if "soft-bass" in song.parts:
                track.add(bar_t, soft_bass(hz(root - 12), 4 * spb), 0.20, 0.0)

    rv_rng = np.random.default_rng(song.seed + 1)
    wet = 0.30 if song.calm else 0.16
    for ch in range(2):
        dry = track.buf[:, ch]
        track.buf[:, ch] = dry + wet * circular_reverb(dry, 2.2 if song.calm else 1.3, rv_rng)
    return track.buf


# ----------------------------------------------------------------------------- ambient


def place(buf: np.ndarray, at: int, sig: np.ndarray, gain: float) -> None:
    idx = (at + np.arange(len(sig))) % len(buf)
    np.add.at(buf, idx, sig * gain)


def lfo(n: int, cycles: int, phase: float = 0.0) -> np.ndarray:
    return 0.5 - 0.5 * np.cos(2 * np.pi * cycles * np.arange(n) / n + phase)


def bird_call(rng: np.random.Generator) -> np.ndarray:
    parts = []
    base = rng.uniform(2600, 3800)
    for _ in range(rng.integers(2, 6)):
        d = rng.uniform(0.05, 0.12)
        t = tvec(d)
        f0, f1 = base * rng.uniform(0.9, 1.1), base * rng.uniform(1.1, 1.45)
        sweep = f0 + (f1 - f0) * (t / d)
        phase = 2 * np.cos(2 * np.pi * 28 * t) + 2 * np.pi * np.cumsum(sweep) / SR
        env = np.sin(np.pi * t / d) ** 2
        parts += [np.sin(phase) * env, np.zeros(int(rng.uniform(0.03, 0.09) * SR))]
    return np.concatenate(parts)


def cricket_chirp(f: float) -> np.ndarray:
    pulses = []
    for _ in range(3):
        t = tvec(0.016)
        pulses += [np.sin(2 * np.pi * f * t) * np.sin(np.pi * t / 0.016), np.zeros(int(0.014 * SR))]
    return np.concatenate(pulses)


def render_ambient(name: str) -> np.ndarray:
    seconds = 48.0
    n = int(seconds * SR)
    rng = np.random.default_rng({"meadow": 1, "breeze": 2, "night": 3, "waves": 4}[name])
    out = np.zeros(n)
    if name == "meadow":  # birds in a soft breeze
        out += 0.10 * fft_filter(colored_noise(n, rng, 0.5), lo=150, hi=900) * (0.6 + 0.4 * lfo(n, 3))
        at = 0
        while at < n:
            place(out, at, bird_call(rng), rng.uniform(0.10, 0.22))
            at += int(rng.uniform(1.2, 4.0) * SR)
    elif name == "breeze":  # wind gusts + leaf rustle
        gust = 0.35 + 0.65 * (0.5 * lfo(n, 2) + 0.3 * lfo(n, 5, 1.3) + 0.2 * lfo(n, 9, 0.4))
        out += 0.30 * fft_filter(colored_noise(n, rng, 0.8), lo=180, hi=1400) * gust
        out += 0.05 * fft_filter(rng.standard_normal(n), lo=3000, hi=7000) * gust**3
    elif name == "night":  # crickets + very soft night air
        out += 0.05 * fft_filter(colored_noise(n, rng, 0.9), lo=80, hi=500)
        for f, gap, gain in ((4500, 0.42, 0.09), (5200, 0.61, 0.06)):
            at = int(rng.uniform(0, 0.5) * SR)
            while at < n:
                place(out, at, cricket_chirp(f * rng.uniform(0.995, 1.005)), gain)
                at += int(gap * rng.uniform(0.9, 1.15) * SR)
    elif name == "waves":  # 6 soft waves per loop
        waves = np.zeros(n)
        for k in range(6):
            env = lfo(n, 6, -2 * np.pi * k / 6) ** 3 * rng.uniform(0.7, 1.0)
            waves = np.maximum(waves, env)
        out += 0.35 * fft_filter(colored_noise(n, rng, 1.0), lo=60, hi=700) * (0.25 + 0.75 * waves)
        out += 0.12 * fft_filter(rng.standard_normal(n), lo=1500, hi=6000) * waves**2
    else:
        raise ValueError(name)
    return out


# ----------------------------------------------------------------------------- encode


def resolve_ffmpeg() -> str:
    which = shutil.which("ffmpeg")
    if which:
        return which
    import imageio_ffmpeg  # type: ignore

    return imageio_ffmpeg.get_ffmpeg_exe()


def encode(buf: np.ndarray, out: Path, *, stereo: bool, lufs: int, kbps: int) -> None:
    buf = buf / (np.max(np.abs(buf)) + 1e-9) * 0.9
    edge = int(0.015 * SR)  # tiny edge fade: hides the mp3 encoder gap at the loop point
    ramp = np.linspace(0, 1, edge)
    if buf.ndim == 2:
        buf[:edge] *= ramp[:, None]
        buf[-edge:] *= ramp[::-1, None]
    else:
        buf[:edge] *= ramp
        buf[-edge:] *= ramp[::-1]
    out.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as tmp:
        wav = Path(tmp) / "x.wav"
        wavfile.write(wav, SR, buf.astype(np.float32))
        subprocess.run(
            [resolve_ffmpeg(), "-y", "-hide_banner", "-loglevel", "error", "-i", str(wav),
             "-af", f"loudnorm=I={lufs}:TP=-1.5:LRA=11", "-ac", "2" if stereo else "1",
             "-ar", str(SR), "-b:a", f"{kbps}k", str(out)],
            check=True,
        )


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", default="", help="comma-separated ids")
    parser.add_argument("--force", action="store_true")
    args = parser.parse_args()
    only = {s for s in args.only.split(",") if s}

    jobs = [("music", k) for k in SONGS] + [("ambient", k) for k in ("meadow", "breeze", "night", "waves")]
    for layer, key in jobs:
        if only and key not in only:
            continue
        out = OUT_DIR / layer / f"{key}.mp3"
        if out.exists() and not args.force:
            print(f"[skip] {layer}/{key}.mp3")
            continue
        if layer == "music":
            encode(render_song(SONGS[key]), out, stereo=True, lufs=-20, kbps=128)
        else:
            encode(render_ambient(key), out, stereo=False, lufs=-26, kbps=64)
        print(f"[ok] {layer}/{key}.mp3 ({out.stat().st_size // 1024} kB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
