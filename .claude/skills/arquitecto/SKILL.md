# /arquitecto - Software Architect

## Description
Plans the architecture of changes, ensures no regressions, and designs the fix strategy.

## Instructions
When invoked:

1. Analyze the full application structure in `index.html`:
   - CSS section (lines 10-131)
   - HTML structure (lines 132-203)
   - JavaScript engine (lines 204-424)
2. For any proposed change, verify:
   - It doesn't break existing features (login, chat, love modal, learn modal, timers)
   - It maintains the single-file architecture
   - It's compatible with ALL mobile browsers (no webkit-only features)
   - CSS changes use standard properties with good fallbacks
3. Design the minimal change set:
   - Identify exact lines to modify
   - Ensure changes are isolated (no side effects)
   - Prefer editing existing lines over adding new code
4. Output a change manifest:
   - File: index.html
   - Line X: OLD → NEW (with explanation)
