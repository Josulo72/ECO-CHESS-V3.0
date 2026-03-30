# /validador - Code Validator & Bug Hunter

## Description
Validates the chess app code for bugs, logic errors, and inconsistencies.

## Instructions
When invoked:

1. Read `index.html` completely
2. Check for these specific bug patterns:
   - Any place where `S.isJ` should be checked but isn't (Josulo leak)
   - Any place where Josulo arrays (JT, JA, JC, JX, JH) are used without `S.isJ` guard
   - Any CSS that lacks mobile media queries
   - Any inline styles that override CSS classes
3. For each bug found, report:
   - Line number
   - Current code (broken)
   - Proposed fix
   - Why it's broken
4. Validate the chess engine logic:
   - `schedAI()` should only show Josulo messages when `S.isJ === true`
   - `handleClick()` should work identically in Josulo and non-Josulo modes
   - `restart` handler should properly handle `S.isJ` state
5. Output a PASS/FAIL report
