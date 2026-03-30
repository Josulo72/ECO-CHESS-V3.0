# /preview - Verify ECO-CHESS state

## Description
Checks the current state of the chess app: what's committed, what's changed, and what's deployed.

## Instructions
When the user invokes `/preview`:

1. Show current branch: `git branch --show-current`
2. Show uncommitted changes: `git status --short`
3. Show diff between current branch and `main`: `git diff main..HEAD --stat`
4. Show last 3 commits: `git log --oneline -3`
5. Check if main is up to date with remote: `git log origin/main..main --oneline`
6. Report the live URL: `https://josulo72.github.io/ECO-CHESS-V3.0/`

## Key info
- App is a single file: `index.html` (~420 lines)
- GitHub Pages deploys from `main` branch
- Site URL: `https://josulo72.github.io/ECO-CHESS-V3.0/`
