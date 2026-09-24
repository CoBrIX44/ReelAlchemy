# ReelAlchemy

> **Turn Reels into Stories.**

ReelAlchemy is a local automation pipeline for analyzing Instagram Reels, identifying the music used, finding lyrics, generating a caption with a local AI model, and updating the caption of the **existing Reel**.

The project combines browser automation, media processing, song recognition, lyrics retrieval, and local LLM generation into a single n8n workflow.

---

## ✨ Features

- Automatically discovers Reels from your own Instagram profile
- Finds the latest Reel without manually entering a Reel URL
- Captures the Reel video locally using Playwright
- Extracts audio using FFmpeg
- Uses Instagram music metadata when available
- Falls back to Shazam when Instagram music information is unavailable
- Finds lyrics using Tamil2Lyrics
- Selects a random lyric snippet
- Generates captions and hashtags using a local Ollama model
- Updates the caption of the **existing Instagram Reel**
- Uses a persistent Playwright browser session
- Keeps downloaded media, authentication data, and generated files local
- Designed to run locally with n8n

---

## 🧩 How It Works

```text
Instagram Profile
       ↓
Find Latest Reel
       ↓
Capture Reel Video
       ↓
Extract Audio (FFmpeg)
       ↓
Determine Song Source
       ↓
┌───────────────────────┐
│ Instagram Music?      │
└───────────┬───────────┘
            │
       ┌────┴────┐
       ↓         ↓
   Instagram   Shazam
     Music     Fallback
       └────┬────┘
            ↓
      Fetch Lyrics
            ↓
   Select Lyric Snippet
            ↓
 Generate Caption + Tags
         (Ollama)
            ↓
   Prepare Final Caption
            ↓
 Edit Existing Reel Caption
```


## Workflow Image
<img width="1917" height="968" alt="image" src="https://github.com/user-attachments/assets/e8b2127d-16f8-453b-8ed4-65598d3e4d9c" />


---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **n8n** | Workflow orchestration |
| **Node.js** | Browser automation scripts |
| **Playwright** | Instagram browser automation |
| **Chromium** | Persistent browser session |
| **Python 3.12** | Song and lyrics processing |
| **ShazamIO** | Song identification fallback |
| **FFmpeg** | Video/audio processing |
| **Ollama** | Local AI caption generation |
| **Tamil2Lyrics** | Lyrics retrieval |

---

## 📁 Project Structure

```text
ReelAlchemy/
│
├── .github/
│   └── workflows/
│       └── python-check.yml
│
├── browser/
│   ├── discover-my-reels.js
│   ├── download-latest-reel.js
│   ├── edit-reel-caption.js
│   ├── find-lyrics.js
│   ├── get-latest-reel.js
│   ├── inspect-reel.js
│   ├── instagram-login.js
│   ├── open-my-latest-reel.js
│   ├── open-my-reels.js
│   └── test-login.js
│
├── scripts/
│   ├── fetch_lyrics.py
│   └── identify_song.py
│
├── n8n/
│   └── workflow.json
│
├── docs/
│   ├── images/
│   ├── architecture.md
│   ├── setup.md
│   └── troubleshooting.md
│
├── examples/
│   └── caption-example.txt
│
├── .env.example
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── package.json
├── package-lock.json
└── requirements.txt
```

### Local-only directories

These directories are intentionally excluded from Git:

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

They contain dependencies, generated media, authentication/session data, or other local runtime information.

---

## 📋 Requirements

Before running ReelAlchemy, install:

- **Node.js**
- **Python 3.12**
- **FFmpeg**
- **Ollama**
- **n8n**

You will also need an Instagram account that can access and edit the Reels being processed.

---

## 🐍 Python Setup

Create the virtual environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install the project's Python dependencies:

```powershell
python -m pip install -r requirements.txt
```

The direct Python dependencies are pinned in `requirements.txt`.

---

## 📦 Node.js Setup

Install the Node.js dependencies:

```powershell
npm install
```

Install the Playwright Chromium browser:

```powershell
npx playwright install chromium
```

---

## 🎬 FFmpeg

FFmpeg is required for media processing and audio extraction.

Verify that FFmpeg is available:

```powershell
ffmpeg -version
```

If the command is not recognized, install FFmpeg and add its `bin` directory to your system `PATH`.

---

## 🤖 Ollama

ReelAlchemy uses Ollama to generate the final caption locally.

Start the Ollama server:

```powershell
ollama serve
```

Check installed models:

```powershell
ollama list
```

The workflow currently uses:

```text
gemma3
```

Make sure the model is available before executing the n8n workflow.

---

## 🔐 Instagram Login

ReelAlchemy uses a persistent Playwright browser profile rather than storing an Instagram password in the project.

Run:

```powershell
node .\browser\instagram-login.js
```

After logging in, the browser session is stored locally in:

```text
browser/instagram-profile/
```

This directory is intentionally ignored by Git.

> **Important:** Never commit the Instagram browser profile. It may contain cookies, authentication/session information, local storage, and other private browser data.

---

## ⚙️ n8n Workflow

The main workflow is stored in:

```text
n8n/workflow.json
```

The workflow performs the following operations:

1. Find the latest Reel from the configured Instagram profile.
2. Capture the Reel video.
3. Extract the audio track.
4. Check whether Instagram provides usable music metadata.
5. Use Instagram music metadata when available.
6. Use Shazam as a fallback when necessary.
7. Search for lyrics.
8. Select a random lyric snippet.
9. Send the song and lyric information to Ollama.
10. Generate a caption and hashtags.
11. Prepare the final Instagram caption.
12. Edit the caption of the existing Reel.

The workflow does **not** intentionally upload the downloaded Reel as a new post.

---

## ▶️ Running ReelAlchemy

### 1. Start Ollama

```powershell
ollama serve
```

### 2. Start n8n

Start your local n8n installation.

### 3. Open the ReelAlchemy workflow

Import or open:

```text
n8n/workflow.json
```

### 4. Execute the workflow

The workflow starts from your own Instagram profile and processes the latest Reel.

---

## 🔒 Privacy & Security

ReelAlchemy is designed to keep its runtime data local.

Do **not** commit:

- Instagram browser sessions
- Cookies
- Authentication data
- Instagram passwords
- Downloaded Reels
- Extracted audio
- Lyrics files
- Generated output
- Logs
- Environment secrets
- `.env` files

The project's `.gitignore` is configured to exclude these local files and directories.

If you accidentally expose credentials or session data, revoke or rotate the affected credentials/session immediately.

---

## 🌱 Environment Variables

An example environment file is provided:

```text
.env.example
```

It contains configuration examples such as:

```text
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma3
```

Do not put your Instagram password into `.env`.

The Instagram login is handled through the persistent Playwright browser profile.

---

## 🧪 Project Status

The core pipeline has been tested with:

- Instagram profile Reel discovery
- Latest Reel detection
- Reel video capture
- FFmpeg audio extraction
- Instagram music metadata detection
- Shazam song identification fallback
- Lyrics retrieval
- Random lyric selection
- Local Ollama caption generation
- Existing Reel caption editing

The project is currently intended for local development, experimentation, and personal automation.

---

## 🐛 Troubleshooting

### Playwright cannot open Chromium

Run:

```powershell
npx playwright install chromium
```

### Python dependencies are missing

Run:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### FFmpeg is not recognized

Check:

```powershell
ffmpeg -version
```

If it fails, install FFmpeg and add it to `PATH`.

### Ollama is unavailable

Start:

```powershell
ollama serve
```

Then verify:

```powershell
ollama list
```

### Instagram asks for login again

Run:

```powershell
node .\browser\instagram-login.js
```

The persistent browser profile is stored under:

```text
browser/instagram-profile/
```

---

## 🤝 Contributing

Contributions, fixes, ideas, and improvements are welcome.

Before submitting changes:

1. Keep credentials and private browser data out of Git.
2. Do not commit generated media.
3. Test changes locally.
4. Keep the workflow and browser automation behavior documented.

See `CONTRIBUTING.md` for additional project guidelines.

---

## 📄 License

This project is intended for personal automation and experimentation.

See `LICENSE` for the project's license information.

---

## 👨‍💻 Project

**ReelAlchemy**

> Turn Reels into Stories.
