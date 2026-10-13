# ReelAlchemy Launch Video Plan (`brag-plan.md`)

## 1. Overview
- **Product:** ReelAlchemy
- **Tagline:** Turn Reels into Stories.
- **Duration:** 20.0s (600 frames @ 30fps)
- **Format:** Landscape (1920×1080, 30fps)
- **Tone:** `cinematic` / `polished` tech launch — dark glassmorphism, Instagram gradient accents (`#E1306C`, `#FD1D1D`, `#F56040`), terminal neon amber & cyan, glowing interactive pipeline nodes, and authentic project media.
- **One-line Share Caption:** "Post a Reel with no caption. ReelAlchemy listens to the song, finds the lyrics, prompts a local Ollama LLM, and stealthily updates the live Instagram caption while you sleep."

---

## 2. Creative Angle & Hook
- **The Angle:** Creators hate writing captions, but automated cloud bots require expensive SaaS APIs and compromise account passwords. ReelAlchemy runs 100% locally on your own machine—listening to the music, pulling poetic Tamil lyrics, generating context-aware captions via local Ollama, and modifying the existing live Reel via headless Playwright.
- **The Hook:** A dramatic split: a creator posts a stunning Reel with an empty, naked caption (`...`). Suddenly, ReelAlchemy detects the upload and the autonomous alchemy starts.

---

## 3. Key Highlights
1. **Zero-Touch Discovery & Audio Rip:** Autonomous Playwright session finds the newest Reel and FFmpeg extracts pure PCM audio (`44.1kHz`).
2. **Music & Lyric Alchemy:** ShazamIO fallback + Tamil2Lyrics extracts authentic poetry (`சொல்கிறாய்`).
3. **Local AI Captioning:** Local Ollama model synthesizes evocative captions without a single byte leaving your machine.
4. **Live In-Place Edit:** Playwright opens the live Instagram interface and silently updates the existing Reel's caption.

---

## 4. Visual Identity
- **Background:** Deep obsidian slate (`#0B0F19`, `#111827`) with soft radial ambient gradients and glowing grid lines.
- **Palette:**
  - Instagram Gradient: `#833AB4` → `#FD1D1D` → `#FCB045`
  - Neon Cyan (Playwright/Node): `#06B6D4`
  - Neon Amber/Gold (Alchemy): `#F59E0B`
  - Terminal Green/Success: `#10B981`
- **Typography:** Inter, JetBrains Mono, Outfit.
- **Hero Assets:**
  - Real vertical Reel video from `media/` embedded in sleek floating smartphone frame.
  - Real waveform visualizer generated from `audio/reel.wav`.
  - Real n8n pipeline node architecture.
  - Real terminal logs & Tamil lyrics (`சொல்கிறாய்`).

---

## 5. Scene-by-Scene Storyboard (Total: 20.0s / 600 Frames)

| Scene | Time | Frames | Visuals & Action | Audio & FX |
|---|---|---|---|---|
| **Scene 1: The Hook** | 0.0s – 3.5s | 0 – 105 | Floating iPhone mockup with real video playing. Caption shows empty: `caption: ""`. Headline: *"You just posted a Reel. But you have zero caption ideas."* Warning badge pulses. | Deep ambient synth sub-bass swell, subtle mechanical click. |
| **Scene 2: Autonomous Detection & Audio Rip** | 3.5s – 7.5s | 105 – 225 | Pipeline activates! Node 1 triggers: `Playwright >> Profile Scan`. Node 2: `FFmpeg >> Audio Extracted [44.1kHz]`. Glowing audio waveform dances in sync with track. Shazam radar lock: `Ilaiyaraaja • SPB`. | Synth arpeggio kicks in, punchy hi-hats, radar lock chime. Authentic music stem joins the mix. |
| **Scene 3: The Lyric & Ollama Alchemy** | 7.5s – 12.0s | 225 – 360 | Terminal split: Node 3 pulls Tamil poetry (`Tamil2Lyrics >> சொல்கிறாய்`). Node 4 activates: `Ollama >> mistral`. Text streams in real time: *"Some moments don't need an explanation — the music says everything. ✨"*. Badge: `100% Local • Zero Cloud APIs`. | Driving 808 percussion, warm analog chord progression, subtle typing foley. |
| **Scene 4: Stealth Live Caption Update** | 12.0s – 16.5s | 360 – 495 | Back to the Instagram phone modal. Playwright automates the edit dialog. The caption field types out in real-time, hashtags populate, and a vibrant green `✓ Saved & Published` badge ripples across the frame! | Riser sweep, satisfying confirmation bass drop and glass chime. |
| **Scene 5: Outro & Branding** | 16.5s – 20.0s | 495 – 600 | Dramatic zoom-out to hero title card: **ReelAlchemy** in glowing chromatic gradient. Tagline: *"Turn Reels into Stories."* Badges: `n8n • Playwright • Ollama • FFmpeg`. Call to action: `Local. Autonomous. Open Source.` | Final triumphant chord reverberating into soft vinyl crackle tail. |

---

## 6. Deliverables
- `brag-output/brag.mp4`: 1920×1080 @ 30fps, 20.0 seconds, high-bitrate H.264 with stereo AAC.
- `brag-output/brag.jpg`: Settled, crystal-clear poster frame baked as frame 0.
- `brag-output/share-copy.txt`: Punchy, copy-paste ready launch post.
- `brag-output/work/`: Intermediate render scripts, stems, frames, audio synthesis assets.
