# Contributing to ReelAlchemy

Thanks for your interest in ReelAlchemy.

ReelAlchemy is primarily a local automation project, but improvements, bug fixes, documentation updates, and useful ideas are welcome.

## Before Contributing

Please make sure you:

- Understand the existing project structure.
- Test your changes locally before submitting them.
- Do not commit passwords, cookies, browser sessions, API keys, or other secrets.
- Do not commit generated media or local runtime files.
- Keep changes focused on the problem being solved.

## Project Structure

The main areas of the project are:

- `browser/` — Playwright and Instagram browser automation
- `scripts/` — Python utilities for song identification and lyrics
- `n8n/` — n8n workflow
- `docs/` — Project documentation
- `examples/` — Example files and outputs

## Development Setup

Clone the repository and enter the project directory:

```powershell
git clone https://github.com/CoBrIX44/ReelAlchemy.git
cd ReelAlchemy
```

Create the Python environment:

```powershell
python -m venv .venv
```

Activate it:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install Python dependencies:

```powershell
python -m pip install -r requirements.txt
```

Install Node.js dependencies:

```powershell
npm install
```

Install Playwright Chromium:

```powershell
npx playwright install chromium
```

## Making Changes

Before making a change:

1. Understand the existing behavior.
2. Make the smallest reasonable change.
3. Test the affected component.
4. Check that no private or generated files were added.
5. Review the Git diff before committing.

Check the repository:

```powershell
git status
```

Review changes:

```powershell
git diff
```

## Commit Messages

Use clear commit messages that describe the change.

Examples:

```text
feat: add improved Reel discovery
fix: handle missing Instagram music metadata
fix: improve lyrics parsing
docs: update setup instructions
refactor: simplify caption preparation
chore: update dependencies
```

## Pull Requests

A pull request should explain:

- What was changed
- Why it was changed
- How it was tested
- Any known limitations

Keep pull requests focused and avoid unrelated changes.

## Security

Never commit:

- Instagram credentials
- Browser session data
- Cookies
- API keys
- `.env` files
- Downloaded Reels
- Audio files
- Generated media
- Local logs

The project's `.gitignore` is configured to exclude local runtime data.

If sensitive information is accidentally committed, remove it from the repository and rotate the affected credentials or sessions.

## Testing

Before submitting changes, test the affected functionality locally.

For Python changes, make sure the scripts execute successfully.

For browser automation changes, verify that the Playwright workflow still works with the persistent Instagram profile.

For n8n changes, verify the affected workflow nodes and test the complete workflow when appropriate.

## Questions and Suggestions

For major changes, open an issue first so the approach can be discussed before implementation.

Thanks for contributing to ReelAlchemy.
