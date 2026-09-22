# ReelAlchemy Setup Guide

This guide explains how to set up ReelAlchemy on a Windows development machine.

ReelAlchemy is designed to run locally using n8n, Node.js, Python, Playwright, FFmpeg, ShazamIO, Tamil2Lyrics, and Ollama.

---

## 1. Prerequisites

Install the following before setting up the project:

- Node.js
- Python 3.12
- FFmpeg
- Ollama
- n8n
- Git

Verify the main tools from PowerShell:

```powershell
node --version
npm --version
python --version
ffmpeg -version
git --version
```

Also verify Ollama:

```powershell
ollama --version
```

---

## 2. Clone the Repository

Clone the repository:

```powershell
git clone https://github.com/CoBrIX44/ReelAlchemy.git
```

Enter the project directory:

```powershell
cd ReelAlchemy
```

---

## 3. Python Environment

ReelAlchemy uses a local Python virtual environment.

Create it:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

If PowerShell blocks script execution, use the Python executable directly instead of activating the environment:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Install the project dependencies:

```powershell
python -m pip install -r requirements.txt
```

The direct Python dependencies are pinned in:

```text
requirements.txt
```

---

## 4. Node.js Dependencies

Install the Node.js packages:

```powershell
npm install
```

Install the Playwright Chromium browser:

```powershell
npx playwright install chromium
```

---

## 5. FFmpeg

FFmpeg is required to process the captured Reel and extract audio.

Verify the installation:

```powershell
ffmpeg -version
```

If PowerShell reports that `ffmpeg` is not recognized, install FFmpeg and add its `bin` directory to the system `PATH`.

---

## 6. Ollama

Ollama is used for local caption generation.

Start the Ollama server:

```powershell
ollama serve
```

In another terminal, check the installed models:

```powershell
ollama list
```

The current workflow uses:

```text
gemma3
```

Make sure the model is available before running the n8n workflow.

The local API endpoint used by the workflow is:

```text
http://127.0.0.1:11434/api/chat
```

---

## 7. Environment Configuration

The repository includes:

```text
.env.example
```

It provides example local configuration such as:

```text
OLLAMA_BASE_URL=http://127.0.0.1:11434
OLLAMA_MODEL=gemma3
```

If you need local environment variables, create a `.env` file from the example.

Do not commit `.env`.

Do not store your Instagram password in `.env`.

Instagram authentication is handled through the persistent Playwright browser profile.

---

## 8. Instagram Login

ReelAlchemy uses a persistent Chromium profile for Instagram authentication.

Run:

```powershell
node .\browser\instagram-login.js
```

Log into the Instagram account in the browser window.

After successful login, the local browser profile is stored under:

```text
browser/instagram-profile/
```

This directory is intentionally ignored by Git.

### Security

Never commit:

```text
browser/instagram-profile/
```

The profile may contain cookies, local storage, session information, and other private browser data.

---

## 9. Test the Browser Session

After logging in, the browser automation can be tested using the existing browser scripts.

For example:

```powershell
node .\browser\test-login.js
```

You can also test Reel discovery:

```powershell
node .\browser\discover-my-reels.js
```

The exact browser script to use depends on which part of the pipeline you want to test.

---

## 10. Test Python Song Identification

The song identification script requires an audio file.

The script is:

```text
scripts/identify_song.py
```

Run it using the project's virtual environment:

```powershell
.\.venv\Scripts\python.exe .\scripts\identify_song.py "path\to\audio.wav"
```

The script uses ShazamIO to identify the song.

---

## 11. Test Lyrics Retrieval

Lyrics retrieval is handled by:

```text
scripts/fetch_lyrics.py
```

It expects the artist and song title.

Example:

```powershell
.\.venv\Scripts\python.exe .\scripts\fetch_lyrics.py "Artist Name" "Song Title"
```

The script searches for matching lyrics and returns structured information used by the n8n workflow.

---

## 12. n8n Workflow

The workflow is stored at:

```text
n8n/workflow.json
```

Start your local n8n installation.

Open the ReelAlchemy workflow in n8n.

The workflow coordinates:

```text
Reel Discovery
      ↓
Video Capture
      ↓
Audio Extraction
      ↓
Song Identification
      ↓
Lyrics Retrieval
      ↓
Ollama Caption Generation
      ↓
Caption Preparation
      ↓
Existing Reel Caption Editing
```

---

## 13. Running the Complete Pipeline

Before executing the complete workflow, make sure:

1. Instagram is logged in through the persistent Playwright profile.
2. FFmpeg is available.
3. Ollama is running.
4. The `gemma3` model is available.
5. Python dependencies are installed.
6. Node.js dependencies are installed.
7. Playwright Chromium is installed.
8. n8n is running.

Then execute the ReelAlchemy workflow from n8n.

The workflow discovers the latest Reel from the configured Instagram profile and processes it through the complete pipeline.

---

## 14. Runtime Directories

ReelAlchemy creates local runtime data.

These directories should remain local:

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

They are excluded from Git through `.gitignore`.

---

## 15. Generated Files

During execution, the project may generate:

### Media

```text
media/
```

Contains captured Reel video files.

### Audio

```text
audio/
```

Contains extracted audio files.

### Lyrics

```text
lyrics/
```

Contains lyrics-related runtime data.

### Output

```text
output/
```

Contains generated caption output.

### Logs

```text
logs/
```

Contains local execution/debug information.

These files are runtime artifacts and should not be committed.

---

## 16. Troubleshooting

### Python command is not working

Use the virtual environment's Python executable directly:

```powershell
.\.venv\Scripts\python.exe --version
```

Then:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### Playwright Chromium is missing

Run:

```powershell
npx playwright install chromium
```

### FFmpeg is missing

Run:

```powershell
ffmpeg -version
```

If it fails, install FFmpeg and configure the system `PATH`.

### Ollama is not responding

Start:

```powershell
ollama serve
```

Then verify:

```powershell
ollama list
```

### Instagram login is missing

Run:

```powershell
node .\browser\instagram-login.js
```

### Instagram session was lost

The persistent browser profile may need to be logged in again.

Run the login script and complete the Instagram login flow.

### Song identification fails

The workflow can use Instagram music metadata when available and ShazamIO as a fallback.

If both sources fail, check that:

- The extracted audio contains enough of the song.
- The audio is clear enough for recognition.
- ShazamIO dependencies are installed correctly.

### Lyrics cannot be found

Check the artist and title returned by the song identification stage.

Lyrics matching depends on the availability and naming of the source lyrics.

---

## 17. Privacy Checklist

Before committing changes, verify that you are not committing:

- Instagram passwords
- Browser session data
- Cookies
- Authentication tokens
- `.env`
- Downloaded videos
- Audio files
- Lyrics files
- Generated captions
- Logs
- Other private runtime data

Run:

```powershell
git status
```

Review the files before staging anything.

---

## 18. Updating the Project

Pull the latest repository changes:

```powershell
git pull
```

Update Python dependencies when required:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Update Node.js dependencies when required:

```powershell
npm install
```

---

## 19. Development Workflow

A typical development cycle is:

```text
Make Change
    ↓
Test Locally
    ↓
Check Git Status
    ↓
Review Git Diff
    ↓
Commit
    ↓
Push
```

Useful commands:

```powershell
git status
git diff
git log --oneline
```

---

## 20. Final Setup Checklist

Before running ReelAlchemy for the first time:

- [ ] Repository cloned
- [ ] Python 3.12 installed
- [ ] Virtual environment created
- [ ] Python dependencies installed
- [ ] Node.js installed
- [ ] Node.js dependencies installed
- [ ] Playwright Chromium installed
- [ ] FFmpeg installed
- [ ] Ollama installed
- [ ] `gemma3` available
- [ ] n8n installed and running
- [ ] Instagram login completed
- [ ] Persistent browser profile created
- [ ] `.env` kept private
- [ ] Runtime directories excluded by `.gitignore`

Once these checks are complete, the ReelAlchemy n8n workflow can be executed locally.
