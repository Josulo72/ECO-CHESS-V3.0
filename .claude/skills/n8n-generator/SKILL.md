# /n8n-generator - n8n Agentic Workflow Generator

Generate production-ready n8n agentic workflow JSONs from natural language descriptions.

## Trigger
When the user asks to create, generate, or build an n8n workflow or agentic flow.

## Instructions

1. **Read the generator guide**: Load `/n8n/n8n-generator.md` for constraints and patterns
2. **Read the base template**: Load `/n8n/templates/agentic-workflow-template.json`
3. **Gather requirements** from the user:
   - What does the agent do? (domain, role)
   - What tools does it need? (APIs, DB, code, etc.)
   - Trigger type (webhook, schedule, chat, manual)
   - Model preference (sonnet default, opus for complex, haiku for fast)
   - Memory needed? (stateless, window buffer, persistent)
4. **Generate the workflow JSON** following all rules in the generator guide
5. **Save** to `/n8n/examples/[workflow-name].json`
6. **Validate** by running: `node n8n/validate-workflow.js n8n/examples/[workflow-name].json`
7. **Generate AGENTS.md** for the workflow with:
   - Agent roles and responsibilities
   - Tools and their purposes
   - System prompts used
   - Setup instructions (credentials needed, env vars)
8. **Fix any validation errors** and re-validate until 0 failures

## Output Format
For each workflow, deliver:
- `n8n/examples/[name].json` - The workflow (importable in n8n)
- `n8n/examples/[name]-AGENTS.md` - Agent documentation
- Validation results (must pass)
