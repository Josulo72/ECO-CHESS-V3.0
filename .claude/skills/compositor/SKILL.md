# /compositor - Code Composer

## Description
Writes and applies the actual code changes based on the architect's plan.

## Instructions
When invoked:

1. Read the current `index.html`
2. Apply ONLY the changes specified in the plan - nothing more, nothing less
3. For each change:
   - Show the exact `old_string` → `new_string` replacement
   - Verify the old_string exists in the file before editing
   - Apply the edit
   - Confirm success
4. After all edits:
   - Read back the modified lines to verify correctness
   - Ensure no syntax errors (matching braces, quotes, semicolons)
   - Ensure the file is still valid HTML
5. Do NOT:
   - Add comments or documentation
   - Refactor unrelated code
   - Add features not in the plan
   - Change formatting or whitespace unnecessarily
