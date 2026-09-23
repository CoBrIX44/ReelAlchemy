import sys
import json
import subprocess
import os
import re
project_root = os.path.dirname(
    os.path.dirname(os.path.abspath(__file__))
)

# Force UTF-8 output on Windows so Tamil lyrics can be printed safely.
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")


# ---------------------------------------------------------
# INPUT
# ---------------------------------------------------------

if len(sys.argv) < 3:
    print(json.dumps({
        "success": False,
        "error": "Usage: fetch_lyrics.py <artist> <title>"
    }, ensure_ascii=False))
    sys.exit(1)

artist = sys.argv[1]
title = sys.argv[2]

print(f"Finding lyrics for: {title}")


# ---------------------------------------------------------
# STEP 1 — FIND THE LYRIC PAGE
# Uses the existing working find-lyrics.js
# ---------------------------------------------------------

finder_path = os.path.join(
    project_root,
    "browser",
    "find-lyrics.js"
)

try:
    finder = subprocess.run(
        [
            "node",
            finder_path,
            artist,
            title
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        timeout=120
    )

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": f"Could not run find-lyrics.js: {str(e)}"
    }, ensure_ascii=False))
    sys.exit(1)


finder_output = finder.stdout.strip()

# Find the final JSON object printed by find-lyrics.js
finder_result = None

for line in reversed(finder_output.splitlines()):
    line = line.strip()

    if not line.startswith("{") or not line.endswith("}"):
        continue

    try:
        parsed = json.loads(line)

        if isinstance(parsed, dict) and "success" in parsed:
            finder_result = parsed
            break

    except json.JSONDecodeError:
        continue


if not finder_result:
    print(json.dumps({
        "success": False,
        "error": "Could not parse result from find-lyrics.js.",
        "finder_output": finder_output[-2000:]
    }, ensure_ascii=False))
    sys.exit(1)


if not finder_result.get("success"):
    print(json.dumps({
        "success": False,
        "error": finder_result.get(
            "error",
            "Could not find lyric page."
        )
    }, ensure_ascii=False))
    sys.exit(1)


lyric_url = finder_result.get("url")

if not lyric_url:
    print(json.dumps({
        "success": False,
        "error": "find-lyrics.js did not return a lyric URL."
    }, ensure_ascii=False))
    sys.exit(1)


# ---------------------------------------------------------
# STEP 2 — OPEN THE PAGE AND SWITCH TO TAMIL
# ---------------------------------------------------------

node_script = r"""
const { chromium } = require('playwright');

(async () => {
    const url = process.env.LYRIC_URL;

    if (!url) {
        throw new Error('LYRIC_URL environment variable is missing.');
    }

    const browser = await chromium.launch({
        headless: true
    });

    try {
        const page = await browser.newPage();

        await page.goto(url, {
            waitUntil: 'domcontentloaded',
            timeout: 30000
        });

        // Give the page time to finish rendering.
        await page.waitForTimeout(1000);

        // Tamil2Lyrics has a button labelled "தமிழ்".
        const tamilButton = page
            .locator('button')
            .filter({ hasText: 'தமிழ்' })
            .first();

        const tamilButtonCount = await tamilButton.count();

        if (tamilButtonCount === 0) {
            throw new Error('Tamil language button was not found.');
        }

        // Switch the lyrics from English to Tamil.
        await tamilButton.click();

        // Wait for the dynamic content to update.
        await page.waitForTimeout(1000);

        const bodyText = await page.locator('body').innerText();

        console.log(JSON.stringify({
            success: true,
            url: page.url(),
            body: bodyText
        }, null, 0));

    } finally {
        await browser.close();
    }

})().catch(error => {
    console.error(error.message);
    process.exit(1);
});
"""


env = os.environ.copy()
env["LYRIC_URL"] = lyric_url


try:
    browser_result = subprocess.run(
        [
            "node",
            "-e",
            node_script
        ],
        capture_output=True,
        text=True,
        encoding="utf-8",
        errors="replace",
        env=env,
        timeout=60
    )

except Exception as e:
    print(json.dumps({
        "success": False,
        "error": f"Could not open lyric page: {str(e)}",
        "url": lyric_url
    }, ensure_ascii=False))
    sys.exit(1)


browser_output = browser_result.stdout.strip()


# ---------------------------------------------------------
# STEP 3 — PARSE PLAYWRIGHT RESULT
# ---------------------------------------------------------

page_result = None

for line in reversed(browser_output.splitlines()):
    line = line.strip()

    if not line.startswith("{") or not line.endswith("}"):
        continue

    try:
        parsed = json.loads(line)

        if isinstance(parsed, dict) and parsed.get("success") is True:
            page_result = parsed
            break

    except json.JSONDecodeError:
        continue


if not page_result:
    error_message = (
        browser_result.stderr.strip()
        or browser_result.stdout.strip()
        or "Unknown browser error."
    )

    print(json.dumps({
        "success": False,
        "error": f"Could not retrieve Tamil lyrics: {error_message[-2000:]}",
        "url": lyric_url
    }, ensure_ascii=False))

    sys.exit(1)


body = page_result.get("body", "")


# ---------------------------------------------------------
# STEP 4 — EXTRACT THE TAMIL LYRIC SECTION
# ---------------------------------------------------------

# Tamil Unicode block:
# U+0B80 - U+0BFF
tamil_pattern = re.compile(r"[\u0B80-\u0BFF]")


# Tamil2Lyrics places the actual lyrics after speaker labels
# such as:
#
# ஆண் :
# பெண் :
# குழு :
#
# Find the first such lyric marker.
speaker_pattern = re.compile(
    r"(?m)^(?:ஆண்|பெண்|குழு)\s*:"
)

speaker_match = speaker_pattern.search(body)


if not speaker_match:
    print(json.dumps({
        "success": False,
        "error": "Could not locate Tamil lyric section on the page.",
        "artist": artist,
        "title": title,
        "url": lyric_url
    }, ensure_ascii=False))
    sys.exit(1)


# Start immediately around the first singer section.
lyrics_section = body[speaker_match.start():]


# ---------------------------------------------------------
# STEP 5 — REMOVE EVERYTHING AFTER THE LYRICS
# ---------------------------------------------------------

end_markers = [
    "SHARE THIS SONG",
    "Share this song",
    "RELATED SONGS",
    "Related Songs",
    "YOU MAY ALSO LIKE",
    "You May Also Like"
]

end_position = len(lyrics_section)

for marker in end_markers:
    position = lyrics_section.find(marker)

    if position != -1 and position < end_position:
        end_position = position


lyrics_section = lyrics_section[:end_position]


# ---------------------------------------------------------
# STEP 6 — CLEAN THE LYRICS
# ---------------------------------------------------------

raw_lines = lyrics_section.splitlines()

lyric_lines = []


for line in raw_lines:

    line = line.strip()

    if not line:
        continue

    # Remove speaker labels.
    line = re.sub(
        r"^(?:ஆண்|பெண்|குழு)\s*:\s*",
        "",
        line
    ).strip()

    if not line:
        continue

    # Ignore lines without Tamil characters.
    if not tamil_pattern.search(line):
        continue

    # Remove excessive whitespace.
    line = re.sub(r"\s+", " ", line).strip()

    if line:
        lyric_lines.append(line)


# Remove consecutive duplicates.
clean_lines = []

for line in lyric_lines:
    if not clean_lines or line != clean_lines[-1]:
        clean_lines.append(line)


lyric_lines = clean_lines


# ---------------------------------------------------------
# STEP 7 — VALIDATE
# ---------------------------------------------------------

if not lyric_lines:
    print(json.dumps({
        "success": False,
        "error": "Tamil page was opened, but no Tamil lyric lines were extracted.",
        "artist": artist,
        "title": title,
        "url": lyric_url
    }, ensure_ascii=False))
    sys.exit(1)


# ---------------------------------------------------------
# STEP 8 — CREATE FULL LYRICS TEXT
# ---------------------------------------------------------

lyrics_text = "\n".join(lyric_lines)


# ---------------------------------------------------------
# STEP 9 — SELECT A MEANINGFUL RANDOM LYRIC SNIPPET
# ---------------------------------------------------------

# Ignore vocal sounds / musical filler.
filler_patterns = [
    r"^[ஹஹா]+[\.\sஆஅஓஒஊஉஈஇஎஏேைொோ்]+$",
    r"^[ஹஹூஊஉ]+[\.\sஆஅஓஒஊஉஈஇஎஏேைொோ்]+$",
    r"^[அஆஹஹூஉஓஒ]+[\.\s]+$",
]

meaningful_lines = []

for line in lyric_lines:

    # Must contain Tamil.
    if not tamil_pattern.search(line):
        continue

    # Ignore obvious vocal/filler lines.
    is_filler = any(
        re.fullmatch(pattern, line)
        for pattern in filler_patterns
    )

    if is_filler:
        continue

    # Ignore very short fragments.
    if len(line) < 8:
        continue

    # Keep reasonably short lines for Instagram.
    if len(line) <= 100:
        meaningful_lines.append(line)


if not meaningful_lines:
    meaningful_lines = [
        line for line in lyric_lines
        if len(line) >= 8
    ]


# Use Python's secure random generator.
import secrets

random_snippet = secrets.choice(meaningful_lines)


# ---------------------------------------------------------
# STEP 10 — FINAL JSON
# ---------------------------------------------------------

result = {
    "success": True,
    "artist": artist,
    "title": title,
    "source": "Tamil2Lyrics",
    "url": lyric_url,
    "lyrics": lyrics_text,
    "lyric_lines": lyric_lines,
    "random_snippet": random_snippet
}


print(json.dumps(result, ensure_ascii=False))