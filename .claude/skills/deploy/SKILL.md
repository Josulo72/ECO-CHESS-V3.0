# /deploy - Deploy ECO-CHESS to GitHub Pages

## Description
Commits all changes and pushes to `main` branch (GitHub Pages source).

## Instructions
When the user invokes `/deploy`:

1. Run `git status` to check for uncommitted changes
2. If there are changes:
   - Stage `index.html` (and `manifest.json` if modified)
   - Create a commit with a descriptive message
3. Push to `main` branch: `git push -u origin HEAD:main`
4. If push fails with non-fast-forward, merge main first: `git fetch origin main && git merge origin/main --no-edit` then retry
5. Report the deployed URL: `https://josulo72.github.io/ECO-CHESS-V3.0/`
6. Remind user that GitHub Pages takes 1-2 minutes to update

## Important
- NEVER force push
- Always push to `main` (that's where GitHub Pages deploys from)
- The entire app is a single file: `index.html`
