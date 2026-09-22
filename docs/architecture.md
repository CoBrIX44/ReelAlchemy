# ReelAlchemy Architecture

## Overview

ReelAlchemy is a local automation pipeline that discovers a Reel from the user's own Instagram profile, captures the video, identifies the music, retrieves lyrics, generates a caption with a local Ollama model, and edits the caption of the existing Reel.

The system is orchestrated through n8n and uses Playwright, Python, FFmpeg, ShazamIO, Tamil2Lyrics, and Ollama.

## High-Level Architecture

```text
Instagram Profile
        ↓
Find Latest Reel
        ↓
Capture Reel Video
        ↓
Extract Audio with FFmpeg
        ↓
Determine Song Source
        ↓
   ┌────┴────┐
   ↓         ↓
Instagram   ShazamIO
Music       Fallback
   └────┬────┘
        ↓
Fetch Lyrics
        ↓
Select Random Lyric
        ↓
Ollama Caption Generation
        ↓
Prepare Final Caption
        ↓
Edit Existing Reel Caption
```

## Core Components

### 1. n8n

n8n is the main workflow orchestrator.

It coordinates the complete pipeline and passes structured data between the browser scripts, Python scripts, FFmpeg, and Ollama.

The workflow is stored at:

```text
n8n/workflow.json
```

### 2. Playwright Browser Layer

The `browser/` directory contains the Instagram browser automation scripts.

```text
browser/
├── discover-my-reels.js
├── download-latest-reel.js
├── edit-reel-caption.js
├── find-lyrics.js
├── get-latest-reel.js
├── inspect-reel.js
├── instagram-login.js
├── open-my-latest-reel.js
├── open-my-reels.js
└── test-login.js
```

Playwright uses a persistent Chromium profile so the Instagram login can be reused between runs.

The profile is stored locally at:

```text
browser/instagram-profile/
```

This directory is intentionally excluded from Git.

### 3. Reel Discovery

The browser layer opens the user's Instagram profile and identifies the user's Reels.

The latest Reel URL is passed into the next stage of the workflow.

The system is designed to work from the user's own profile rather than relying on a manually supplied Reel URL.

### 4. Reel Video Capture

Instagram may expose Reel video through a browser `blob:` URL rather than a directly downloadable media URL.

ReelAlchemy captures the video through Chromium's media APIs.

The captured WebM file is then converted to MP4 using FFmpeg.

Generated media is stored locally under:

```text
media/
```

This directory is ignored by Git.

### 5. Audio Extraction

FFmpeg extracts the Reel's audio into a WAV file.

The workflow uses the extracted audio for song identification when required.

Generated audio is stored under:

```text
audio/
```

This directory is ignored by Git.

### 6. Song Identification

ReelAlchemy uses two possible song sources.

#### Instagram Music Metadata

If Instagram provides usable music metadata, the workflow extracts the artist and title directly from the Reel.

#### Shazam Fallback

If Instagram only reports generic audio such as "Original audio", the workflow falls back to ShazamIO.

The Python song identification script is:

```text
scripts/identify_song.py
```

### 7. Lyrics Retrieval

Once the artist and song title are known, the lyrics stage searches for matching lyrics.

The main Python script is:

```text
scripts/fetch_lyrics.py
```

The workflow retrieves the lyrics and selects a random lyric snippet for caption generation.

Lyrics and generated lyric data remain local and are excluded from Git.

### 8. Ollama Caption Generation

Ollama provides the local language model used to generate the Instagram caption.

The workflow sends the song information and selected lyric snippet to the local Ollama API.

Default endpoint:

```text
http://127.0.0.1:11434/api/chat
```

Default model:

```text
gemma3
```

The generated response contains:

- Caption
- Hashtags

### 9. Caption Preparation

The workflow validates the generated caption and song/lyrics information.

It then prepares the final caption and encodes it as Base64 so Unicode lyrics and special characters can safely pass through the command execution layer.

The caption is written locally to:

```text
output/instagram-caption.txt
```

The output directory is ignored by Git.

### 10. Existing Reel Caption Editing

The final stage uses:

```text
browser/edit-reel-caption.js
```

The script opens the existing Reel, enters Instagram's caption editor, verifies the intended caption, and saves the change.

The downloaded Reel is not uploaded as a new Instagram post.

The goal is specifically to update the caption of the existing Reel.

## Data Flow

```text
Instagram Profile
        ↓
Reel URL
        ↓
Captured Video
        ↓
Audio WAV
        ↓
Song Artist + Title
        ↓
Lyrics
        ↓
Random Lyric Snippet
        ↓
Ollama Caption + Hashtags
        ↓
Final Caption
        ↓
Existing Reel Caption
```

## Runtime Data

The following directories are runtime or generated data and should remain local:

```text
.venv/
node_modules/
browser/instagram-profile/
media/
audio/
lyrics/
output/
logs/
```

They are excluded through `.gitignore`.

## Privacy Boundary

The persistent browser profile is the most sensitive runtime component because it may contain Instagram authentication and session information.

The profile must never be committed to the repository.

Credentials should not be stored directly in the source code.

The project uses a persistent browser session instead of storing an Instagram password in the automation scripts.

## Failure Handling

The workflow contains separate paths for Instagram music metadata and Shazam identification.

```text
                 Reel
                  │
                  ▼
        Instagram Music Data?
             /          \
           Yes           No
            │             │
            ▼             ▼
      Parse Song       ShazamIO
            │             │
            └──────┬──────┘
                   ▼
             Fetch Lyrics
                   │
                   ▼
            Generate Caption
                   │
                   ▼
             Edit Reel
```

This allows the workflow to continue when Instagram does not provide a usable music title.

## Design Principles

1. **Local-first** — media processing and AI caption generation run locally.
2. **Existing-post editing** — the goal is to modify the existing Reel rather than create a duplicate post.
3. **Fallback-based identification** — Instagram music metadata is preferred when available, with ShazamIO as a fallback.
4. **Persistent browser session** — Instagram authentication is maintained through the local Playwright profile.
5. **Generated-data isolation** — runtime media, logs, and authentication data are excluded from Git.
6. **Workflow orchestration** — n8n coordinates the individual components instead of putting the entire system into one script.

## Repository Boundaries

Source code and configuration belong in Git:

```text
browser/
scripts/
n8n/
docs/
examples/
.gitignore
.env.example
package.json
package-lock.json
requirements.txt
README.md
CONTRIBUTING.md
LICENSE
```

Private or generated runtime data does not belong in Git.

## Current Architecture Status

The core architecture has been tested across:

- Instagram Reel discovery
- Reel video capture
- FFmpeg audio extraction
- Instagram music metadata detection
- ShazamIO fallback
- Lyrics retrieval
- Local Ollama caption generation
- Existing Reel caption editing

The architecture is intended for local development and personal automation.
