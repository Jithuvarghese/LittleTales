"""Local Kokoro speech helper (runs offline after the one-time model download).

Batch mode (used by npm run audio:generate):
    python scripts/tts/kokoro_say.py --batch jobs.json
  jobs.json: [{"text": "...", "voice": "af_heart" or "af_sky,af_heart", "speed": 0.9, "out": "x.wav"}]
  Writes each WAV and prints one JSON line per job: {"out": ..., "timings": [...]}

Single mode:
    python scripts/tts/kokoro_say.py --voice af_heart --speed 0.85 --out out.wav < text.txt
    python scripts/tts/kokoro_say.py --check
"""
import argparse
import json
import os
import sys
import warnings

warnings.filterwarnings("ignore")
os.environ.setdefault("HF_HOME", os.path.join("tools", "models", "hf"))

SAMPLE_RATE = 24000


def synth(pipeline, text, voice, speed):
    import numpy as np

    audio, timings, offset = [], [], 0.0
    for result in pipeline(text, voice=voice, speed=speed):
        chunk = result.audio.numpy() if hasattr(result.audio, "numpy") else result.audio
        for tok in getattr(result, "tokens", None) or []:
            if getattr(tok, "start_ts", None) is not None and tok.text.strip() and any(c.isalnum() for c in tok.text):
                timings.append({
                    "word": tok.text,
                    "startMs": round((offset + tok.start_ts) * 1000),
                    "endMs": round((offset + (tok.end_ts or tok.start_ts)) * 1000),
                })
        audio.append(chunk)
        offset += len(chunk) / SAMPLE_RATE
    return (np.concatenate(audio) if audio else np.zeros(1)), timings


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--voice", default="af_heart")
    ap.add_argument("--speed", type=float, default=0.85)
    ap.add_argument("--out")
    ap.add_argument("--batch")
    ap.add_argument("--check", action="store_true")
    args = ap.parse_args()

    from kokoro import KPipeline
    import soundfile as sf

    if args.check:
        print("ok")
        return

    pipelines = {}

    def pipeline_for(voice):
        lang = voice.split(",")[0][0]  # a = American, b = British
        if lang not in pipelines:
            pipelines[lang] = KPipeline(lang_code=lang, repo_id="hexgrad/Kokoro-82M")
        return pipelines[lang]

    if args.batch:
        with open(args.batch, encoding="utf-8") as f:
            jobs = json.load(f)
        for job in jobs:
            if os.path.exists(job["out"]) and os.path.getsize(job["out"]) > 0 and job.get("skipExisting"):
                print(json.dumps({"out": job["out"], "timings": None}), flush=True)
                continue
            audio, timings = synth(pipeline_for(job["voice"]), job["text"], job["voice"], job["speed"])
            sf.write(job["out"], audio, SAMPLE_RATE)
            print(json.dumps({"out": job["out"], "timings": timings}), flush=True)
        return

    text = sys.stdin.read().strip()
    audio, timings = synth(pipeline_for(args.voice), text, args.voice, args.speed)
    sf.write(args.out, audio, SAMPLE_RATE)
    print(json.dumps(timings))


if __name__ == "__main__":
    main()
