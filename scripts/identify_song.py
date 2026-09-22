import asyncio
import json
import os
import subprocess
import sys
import tempfile

from shazamio import Shazam


async def recognize(shazam, audio_path):
    try:
        result = await shazam.recognize(audio_path)
        track = result.get("track")

        if track:
            return track

    except Exception:
        pass

    return None


def make_sample(source, start, duration, output):
    command = [
        "ffmpeg",
        "-y",
        "-ss", str(start),
        "-i", source,
        "-t", str(duration),
        "-ac", "1",
        "-ar", "44100",
        "-c:a", "pcm_s16le",
        output
    ]

    subprocess.run(
        command,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        check=False
    )


async def main():

    if len(sys.argv) < 2:
        print(json.dumps({
            "success": False,
            "error": "Audio file path was not provided"
        }, ensure_ascii=False))
        return

    audio_path = sys.argv[1]

    if not os.path.exists(audio_path):
        print(json.dumps({
            "success": False,
            "error": f"Audio file does not exist: {audio_path}"
        }, ensure_ascii=False))
        return

    shazam = Shazam()

    # First try the complete audio
    print("Trying complete audio...", flush=True)

    track = await recognize(shazam, audio_path)

    if track:
        return print_result(track)

    # Then try multiple overlapping sections.
    # We intentionally don't assume anything about the song.
    samples = [
        (0, 20),
        (5, 20),
        (10, 20),
        (15, 20),
        (20, 20),
        (25, 20),
        (30, 20),
    ]

    with tempfile.TemporaryDirectory() as temp_dir:

        for index, (start, duration) in enumerate(samples, 1):

            sample_path = os.path.join(
                temp_dir,
                f"sample_{index}.wav"
            )

            print(
                f"Trying sample {index}: {start}-{start + duration}s...",
                flush=True
            )

            make_sample(
                audio_path,
                start,
                duration,
                sample_path
            )

            track = await recognize(
                shazam,
                sample_path
            )

            if track:
                return print_result(track)

    print(json.dumps({
        "success": False,
        "error": "Song not identified after trying multiple audio sections"
    }, ensure_ascii=False))


def print_result(track):

    genres = track.get("genres") or {}

    result = {
        "success": True,
        "title": track.get("title"),
        "artist": track.get("subtitle"),
        "genre": genres.get("primary"),
        "shazam_key": track.get("key"),
        "shazam_url": track.get("url")
    }

    print(json.dumps(result, ensure_ascii=False))


if __name__ == "__main__":
    asyncio.run(main())