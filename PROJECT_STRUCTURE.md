# ReelAlchemy Project Structure

Generated from the workspace contents on 2026-09-22.

## Complete Project Map

```text
ReelAlchemy/
|
|-- .github/
|   `-- workflows/
|
|-- .gitignore
|-- Instagram Reel Caption Automation.json
|-- package.json
|-- package-lock.json
|
|-- .venv/                                      # Python virtual environment
|   |-- Include/
|   |-- Lib/
|   |   `-- site-packages/
|   |       |-- aiofiles/
|   |       |-- aiohttp/
|   |       |-- aiohttp_retry/
|   |       |-- aiosignal/
|   |       |-- annotated_types/
|   |       |-- anyio/
|   |       |-- attr/
|   |       |-- attrs/
|   |       |-- dataclass_factory/
|   |       |-- frozenlist/
|   |       |-- idna/
|   |       |-- multidict/
|   |       |-- numpy/
|   |       |-- pip/
|   |       |-- propcache/
|   |       |-- pydantic/
|   |       |-- pydantic_core/
|   |       |-- pydub/
|   |       |-- shazamio/
|   |       |-- shazamio_core/
|   |       |-- typing_inspection/
|   |       |-- typing_extensions.py
|   |       |-- yarl/
|   |       `-- *.dist-info/ and package support files
|   |-- Scripts/
|   |   |-- activate
|   |   |-- activate.bat
|   |   |-- Activate.ps1
|   |   |-- deactivate.bat
|   |   |-- f2py.exe
|   |   |-- idna.exe
|   |   |-- numpy-config.exe
|   |   |-- pip.exe
|   |   |-- pip3.exe
|   |   |-- pip3.12.exe
|   |   |-- python.exe
|   |   `-- pythonw.exe
|   `-- pyvenv.cfg
|
|-- audio/
|   |-- reel.wav
|   |-- sample1.wav
|   |-- sample2.wav
|   |-- sample3.wav
|   `-- shazam.wav
|
|-- browser/
|   |-- discover-my-reels.js
|   |-- download-latest-reel.js
|   |-- edit-reel-caption.js
|   |-- find-lyrics.js
|   |-- get-latest-reel.js
|   |-- inspect-reel.js
|   |-- instagram-login.js
|   |-- open-my-latest-reel.js
|   |-- open-my-reels.js.js
|   |-- test-login.js.js
|   `-- instagram-profile/                       # Chromium profile data
|       |-- BrowserMetrics-spare.pma
|       |-- component_crx_cache/
|       |-- Crashpad/
|       |-- Default/
|       |-- extensions_crx_cache/
|       |-- first_party_sets.db
|       |-- first_party_sets.db-journal
|       |-- GPUPersistentCache/
|       |-- GrShaderCache/
|       |-- Last Browser
|       |-- Last Version
|       |-- Local State
|       |-- OptimizationGuideModelsManifest
|       |-- Safe Browsing/
|       |-- segmentation_platform/
|       |-- ShaderCache/
|       `-- Variations
|
|-- docs/
|   `-- images/
|
|-- examples/
|
|-- logs/
|   |-- caption-edit-error.png
|   |-- caption-edit-preview.png
|   |-- caption-save-page-check.png
|   |-- caption-save-verification-failed.png
|   |-- reel-options-debug.png
|   `-- reel-post-error.png
|
|-- lyrics/
|
|-- media/
|   |-- reel_1789469397128.mp4
|   |-- reel_1789469397128.webm
|   |-- reel_1789470223229.mp4
|   |-- reel_1789470223229.webm
|   |-- reel_1789470458653.mp4
|   |-- reel_1789470458653.webm
|   |-- reel_1789470949878.mp4
|   |-- reel_1789470949878.webm
|   |-- reel_1789471237819.mp4
|   |-- reel_1789471237819.webm
|   |-- reel_1789471609498.mp4
|   |-- reel_1789471609498.webm
|   |-- reel_1789471886929.mp4
|   |-- reel_1789471886929.webm
|   |-- reel_1789478974659.mp4
|   |-- reel_1789478974659.webm
|   |-- reel_1789529530807.mp4
|   |-- reel_1789529530807.webm
|   |-- reel_1789531201790.mp4
|   |-- reel_1789531201790.webm
|   |-- reel_1789537752441.mp4
|   |-- reel_1789537752441.webm
|   |-- reel_1789537903678.mp4
|   |-- reel_1789537903678.webm
|   |-- reel_1789538080721.mp4
|   `-- reel_1789538080721.webm
|
|-- n8n/
|
|-- node_modules/                                # Node.js dependencies
|   |-- .bin/
|   |   |-- playwright
|   |   |-- playwright.cmd
|   |   |-- playwright.ps1
|   |   |-- playwright-core
|   |   |-- playwright-core.cmd
|   |   `-- playwright-core.ps1
|   |-- .package-lock.json
|   |-- playwright/
|   `-- playwright-core/
|
|-- output/
|   `-- instagram-caption.txt
|
`-- scripts/
    |-- fetch_lyrics.py
    `-- identify_song.py
```

## Generated Directory Details

The following directories are present and intentionally represented at a useful level rather than expanding every third-party or cache file:

| Directory | Contents | Approximate size |
|---|---|---:|
| `.venv/` | Python runtime, installed packages, executables, and package metadata | 3,083 files, 385 directories |
| `node_modules/` | Playwright and Playwright Core packages plus command shims | 183 files, 40 directories |
| `browser/instagram-profile/` | Chromium cookies, history, local storage, cache, crash reports, GPU data, and profile settings | 1,464 files, 72 directories |

The browser profile may contain local session data and should be treated as private. The dependency and virtual-environment directories are generated artifacts and are normally excluded from version control.
