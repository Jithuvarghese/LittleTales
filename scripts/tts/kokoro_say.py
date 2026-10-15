"""Local Kokoro speech helper. Reads text on stdin, writes a WAV file.

Usage: python scripts/tts/kokoro_say.py --voice af_heart --speed 0.85 --out out.wav < text.txt
       python scripts/tts/kokoro_say.py --check

Prints a JSON list of word timings on the last line when the engine provides them.
Runs fully offline after the one-time model download (cached under tools/models).
"""
import argparse
import json
import os
import sys

os.environ.setdefault("HF_HOME", os.path.join("tools", "models", "hf"))


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="af_heart")
    ap.add_argument("--speed", type=float, default=0.85)
    ap.add_argument("--out")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    from kokoro import KPipeline  # noqa: imported late so --help works without it
    import numpy as np
    import soundfile as sf

    if args.check:
        print("ok")
        return

    text = sys.stdin.read().strip()
    pipeline = KPipeline(lang_code=args.voice[0])
    audio, timings, offset = [], [], 0.0
    for result in pipeline(text, voice=args.voice, speed=args.speed):
        chunk = result.audio.numpy() if hasattr(result.audio, "numpy") else result.audio
        for tok in getattr(result, "tokens", None) or []:
            if tok.start_ts is not None and tok.text.strip():
                timings.append({
                    "word": tok.text,
                    "startMs": round((offset + tok.start_ts) * 1000),
                    "endMs": round((offset + (tok.end_ts or tok.start_ts)) * 1000),
                })
        audio.append(chunk)
        offset += len(chunk) / 24000
    sf.write(args.out, np.concatenate(audio), 24000)
    print(json.dumps(timings))


if __name__ == "__main__":
    main()
