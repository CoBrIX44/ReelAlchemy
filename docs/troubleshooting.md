# ReelAlchemy Troubleshooting Guide

This guide documents common setup, runtime, and workflow issues encountered while developing ReelAlchemy.

It is intended for local Windows development.

---

## 1. General Troubleshooting Order

When something fails, check the problem in this order:

1. Read the n8n node error.
2. Run the underlying command directly in PowerShell.
3. Check whether the required tool is installed.
4. Check the input/output file path.
5. Check the JSON printed by the script.
6. Only then change the n8n node.

Avoid changing multiple working parts of the workflow at the same time.

---

# 2. Python and Virtual Environment

## Python version

ReelAlchemy uses Python 3.12.

Check:

```powershell
python --version
```

Also check the project environment:

```powershell
.\.venv\Scripts\python.exe --version
```

The second command is the more important check because ReelAlchemy uses the local virtual environment.

## PowerShell activation is blocked

If this fails:

```powershell
.\.venv\Scripts\Activate.ps1
```

with an execution-policy error, you do not need to modify the system policy just to run ReelAlchemy.

Use the environment's Python executable directly:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Run scripts the same way:

```powershell
.\.venv\Scripts\python.exe .\scripts\identify_song.py "F:\ReelAlchemy\audio\reel.wav"
```

---

# 3. Python Dependency Problems

Check installed packages:

```powershell
.\.venv\Scripts\python.exe -m pip freeze
```

The project's direct dependencies are listed in:

```text
requirements.txt
```

Current direct dependencies:

```text
shazamio==0.8.1
pydub==0.25.1
```

Reinstall them with:

```powershell
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

## ShazamIO / NumPy errors

If ShazamIO fails because of an incompatible NumPy installation, first verify the Python environment:

```powershell
.\.venv\Scripts\python.exe --version
```

Then inspect NumPy:

```powershell
.\.venv\Scripts\python.exe -c "import numpy; print(numpy.__version__)"
```

Do not randomly change package versions inside the working environment.

If the problem returns after reinstalling dependencies, compare the installed versions with the known working environment before making further changes.

---

# 4. FFmpeg Problems

FFmpeg is used to:

- Convert the captured WebM Reel into MP4.
- Extract audio from the Reel.
- Prepare audio for song identification.

Verify:

```powershell
ffmpeg -version
```

## FFmpeg is not recognized

If PowerShell says:

```text
ffmpeg is not recognized
```

FFmpeg is either not installed or its `bin` directory is not available through `PATH`.

After fixing the installation, open a new PowerShell window and test again.

## Audio extraction fails

The n8n workflow currently extracts audio with:

```cmd
ffmpeg -y -i "{{$json.media_path}}" -vn -ac 1 -ar 44100 "F:\ReelAlchemy\audio\reel.wav"
```

Check that the input file exists:

```powershell
Test-Path "F:\ReelAlchemy\media\..."
```

Also check that:

```text
F:\ReelAlchemyudio
```

exists.

---

# 5. Playwright Problems

ReelAlchemy uses Playwright with a persistent Chromium profile.

Install Chromium if necessary:

```powershell
npx playwright install chromium
```

Check Node.js:

```powershell
node --version
```

Check Playwright:

```powershell
npm list playwright
```

---

# 6. Instagram Login Problems

The Instagram session is stored in:

```text
browser/instagram-profile/
```

The login script is:

```text
browser/instagram-login.js
```

Run:

```powershell
node .\browser\instagram-login.js
```

Complete the login in the browser window.

## Important

Do not delete the persistent profile unless you intentionally want to create a fresh Instagram session.

The profile contains private browser/session information and is ignored by Git.

Never commit:

```text
browser/instagram-profile/
```

---

# 7. Instagram Session Keeps Logging Out

If the persistent session stops working:

1. Close any ReelAlchemy Playwright browser windows.
2. Run the login script again.
3. Log into Instagram.
4. Complete any Instagram verification required.
5. Run the browser test again.

Test:

```powershell
node .\browser\test-login.js
```

Do not store the Instagram password in the project files.

---

# 8. Reel Discovery Problems

The project uses browser automation to work with the user's own Instagram profile.

Relevant scripts include:

```text
browser/discover-my-reels.js
browser/get-latest-reel.js
browser/open-my-latest-reel.js
browser/open-my-reels.js
browser/inspect-reel.js
```

If Reel discovery fails:

1. Confirm Instagram login.
2. Confirm the profile can be opened manually.
3. Run the relevant browser script directly.
4. Check the URL returned by the script.
5. Check the n8n `Parse Reel Result` node.

The workflow expects a successful JSON result containing a Reel URL and media path.

---

# 9. Reel Download / Capture Problems

Reel video capture uses the browser's media stream rather than relying only on a direct media URL.

The main script is:

```text
browser/download-latest-reel.js
```

A successful run should report:

```text
VIDEO SAVED SUCCESSFULLY
```

If capture fails:

1. Confirm the Reel actually contains playable video.
2. Confirm the persistent Instagram session is valid.
3. Run the downloader directly.
4. Check whether a WebM file was produced.
5. Check FFmpeg conversion.

Do not assume that a failed direct media URL means the Reel cannot be captured. The current implementation uses browser media capture.

---

# 10. n8n Parse Reel Result Errors

The `Parse Reel Result` node extracts the final successful JSON object from the browser command output.

If it reports:

```text
Could not find successful Reel JSON in output.
```

inspect the previous node's complete `stdout`.

The expected result contains:

```text
success: true
media_path
```

The parser intentionally ignores non-JSON log lines.

---

# 11. Instagram Music Detection

ReelAlchemy checks Instagram's music metadata first.

If Instagram provides usable music information, the workflow uses that result.

If Instagram only reports generic audio such as:

```text
Original audio
```

the workflow falls back to Shazam.

This prevents generic Instagram audio labels from being incorrectly treated as a song title.

---

# 12. Shazam Problems

The Shazam command used by n8n is:

```cmd
cd /d F:\ReelAlchemy && .\.venv\Scripts\python.exe .\scripts\identify_song.py "F:\ReelAlchemy\audio\reel.wav"
```

If Shazam fails:

1. Check that the audio file exists.
2. Play the WAV file manually if necessary.
3. Confirm the audio actually contains music.
4. Run the Python script directly.
5. Inspect its JSON output.

The workflow expects a successful JSON result with artist and title information.

The n8n Shazam node is configured to continue when the command reports an error so that the following parser can handle the result consistently.

---

# 13. Shazam JSON Parsing

The `Parse Shazam Result` node searches the command output for the final JSON object.

If it reports:

```text
Could not find Shazam JSON result.
```

inspect the raw `stdout`.

If it reports:

```text
Song could not be identified by Shazam.
```

the problem is normally song recognition rather than JSON parsing.

If artist/title are missing, inspect the raw Shazam result before changing the parser.

---

# 14. Lyrics Retrieval Problems

Lyrics retrieval is handled by:

```text
scripts/fetch_lyrics.py
```

The workflow currently uses Tamil2Lyrics.

The browser selector for the Tamil option is:

```javascript
page.locator('button').filter({hasText:'தமிழ்'}).first()
```

If lyrics cannot be found:

1. Check the artist returned by Instagram/Shazam.
2. Check the song title.
3. Try the lyrics script directly.
4. Inspect the returned JSON.
5. Confirm that the lyrics source has a matching song.

Do not replace the lyrics implementation simply because one song cannot be found.

---

# 15. Parse Lyrics Errors

The `Parse Lyrics` node expects a successful JSON object containing:

```text
success
artist
title
random_snippet
```

It also uses:

```text
lyrics
lyric_lines
source
url
```

If the node reports that successful lyrics JSON cannot be found, inspect the raw output from `Fetch Lyrics`.

If `random_snippet` is missing, the problem is in the lyrics retrieval stage rather than Ollama.

---

# 16. Ollama Problems

ReelAlchemy generates captions locally using Ollama.

The current model is:

```text
gemma3
```

The local endpoint is:

```text
http://127.0.0.1:11434/api/chat
```

Check the Ollama installation:

```powershell
ollama --version
```

Check models:

```powershell
ollama list
```

Start the server if necessary:

```powershell
ollama serve
```

---

# 17. Ollama Returns Empty Content

If `Parse Ollama Response` reports:

```text
Ollama returned empty content.
```

check:

1. Ollama is running.
2. `gemma3` is installed.
3. The HTTP request is reaching the local endpoint.
4. The previous node contains the expected request body.

Do not change the caption parser until the raw Ollama response has been checked.

---

# 18. Ollama JSON Parsing Errors

The workflow expects Ollama to return JSON containing:

```json
{
  "caption": "...",
  "hashtags": ["#example"]
}
```

If the parser reports:

```text
Could not parse Ollama JSON
```

inspect the raw Ollama response.

The parser already removes common Markdown code fences such as:

```text
```json
...
```
```

If the model returns additional prose outside the JSON object, the response format should be checked before changing the parser.

---

# 19. Unicode and Encoding Problems

ReelAlchemy processes native-language lyrics and captions.

Windows command-line encoding can cause problems with characters outside the default console encoding.

For example, Tamil lyrics may trigger encoding errors if output is written using an incompatible code page.

The workflow uses UTF-8-safe handling when preparing the final caption.

The caption is encoded as Base64 before being written to disk.

This avoids passing complex Unicode directly through a Windows command line.

---

# 20. Caption Encoding Problems

The `Encode Caption` node converts the final caption to Base64.

The output property is:

```text
caption_base64
```

The next node writes it to:

```text
F:\ReelAlchemy\output\instagram-caption.txt
```

If the caption file is empty:

1. Check `Parse Ollama Response`.
2. Check `Prepare Instagram Post`.
3. Check `Encode Caption`.
4. Confirm `caption_base64` exists.
5. Open the generated text file.

Do not manually rewrite the caption during the workflow.

---

# 21. Instagram Caption Editing Problems

The final browser script is:

```text
browser/edit-reel-caption.js
```

The n8n command is:

```cmd
cd /d F:\ReelAlchemy && node .\browser\edit-reel-caption.js "F:\ReelAlchemy\output\instagram-caption.txt" save
```

The script edits the caption of the existing Reel.

It does not upload a new Reel.

A successful run reports:

```text
CAPTION SAVE COMPLETED
```

---

# 22. n8n Hangs After Caption Save

The caption editor was designed to close its browser session after saving.

If the Instagram caption has actually been updated but n8n appears to keep running, check whether the browser process is still open.

The intended final behavior is:

```text
Save Caption
    ↓
CAPTION SAVE COMPLETED
    ↓
Browser closes
    ↓
n8n node finishes
```

Do not add arbitrary delays to the workflow unless a real timing problem has been identified.

---

# 23. n8n Workflow Branching

The workflow has two song-identification paths:

```text
Instagram Music Available?
       /        \
     TRUE      FALSE
      ↓          ↓
Instagram     Shazam
Song          Identification
      \        /
       ↓      ↓
       Fetch Lyrics
```

There is intentionally no Merge node between these paths.

Both branches connect directly to the lyrics stage.

If the wrong branch executes, inspect:

```text
Determine Song Source
```

and the value:

```text
instagram_music_available
```

---

# 24. File Path Problems

The project is currently located at:

```text
F:\ReelAlchemy
```

Important paths include:

```text
F:\ReelAlchemy\browser
F:\ReelAlchemy\scripts
F:\ReelAlchemy\audio
F:\ReelAlchemy\media
F:\ReelAlchemy\lyrics
F:\ReelAlchemy\output
```

If a command fails with a file-not-found error, verify the path first:

```powershell
Test-Path "F:\ReelAlchemy\..."
```

Do not assume that a relative path is being resolved from the project root.

---

# 25. Git Accidentally Shows Runtime Files

Run:

```powershell
git status
```

Runtime directories such as these should normally remain ignored:

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

If a private file was previously tracked, adding it to `.gitignore` does not automatically remove it from Git tracking.

Check the Git history before attempting cleanup.

Never commit Instagram session data.

---

# 26. Safe Debugging Procedure

When debugging a failure:

### Step 1 — Identify the failing node

Read the n8n error.

### Step 2 — Run the underlying command

Run the exact command directly in PowerShell.

### Step 3 — Inspect raw output

Look at:

```text
stdout
stderr
exit code
```

### Step 4 — Check files

Use:

```powershell
Test-Path
```

for expected files.

### Step 5 — Check JSON

Confirm the script is returning the fields expected by the parser.

### Step 6 — Change only the failing stage

Avoid modifying unrelated working nodes.

### Step 7 — Test again

Run the smallest possible test before executing the entire workflow.

---

# 27. Known Working Components

The following components have been tested during development:

- Python 3.12
- ShazamIO 0.8.1
- pydub 0.25.1
- FFmpeg
- Playwright persistent Chromium profile
- Instagram Reel browser capture
- Instagram music metadata detection
- Shazam fallback
- Tamil2Lyrics retrieval
- Ollama with `gemma3`
- Local caption generation
- Existing Reel caption editing

The exact success of song recognition and lyrics retrieval can still depend on the individual Reel and source availability.

---

# 28. Security Notes

Never commit or publicly share:

```text
browser/instagram-profile/
.env
cookies
session files
authentication tokens
private logs
downloaded private media
```

If credentials or session data are accidentally exposed, invalidate the affected session and recreate it.

---

# 29. Final Diagnostic Checklist

Before asking for help with an error, collect:

- The failing n8n node name.
- The complete error message.
- The command used by the node.
- The relevant `stdout`.
- The relevant `stderr`.
- Whether the same command works directly in PowerShell.
- Whether the expected input file exists.
- The versions of Python, Node.js, FFmpeg, and Ollama.
- Whether Instagram login currently works.

This makes debugging much faster and prevents unnecessary changes to working parts of ReelAlchemy.
