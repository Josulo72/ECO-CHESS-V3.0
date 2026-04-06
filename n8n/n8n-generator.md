# n8n Agentic Workflow Generator

## Objetivo
Generar workflows n8n agenticos **válidos y listos para importar** usando Claude Code.

---

## Workflow de Generacion

```
Input (descripcion caso de uso)
  → Seleccionar template base
  → Configurar agente (model, system prompt, tools)
  → Agregar nodos especificos del dominio
  → Validar JSON
  → Output: workflow.json + AGENTS.md + SETUP-GUIDE.md
```

---

## Reglas de Generacion (Constraints)

### Estructura Obligatoria
1. Todo workflow DEBE tener un nodo trigger (webhook, schedule, o manual)
2. Todo agente DEBE conectar a un modelo LLM via `ai_languageModel`
3. Todo agente DEBE tener al menos 1 tool conectado via `ai_tool`
4. Todo workflow DEBE tener manejo de errores
5. Los IDs de nodos DEBEN ser unicos dentro del workflow

### Conexiones Validas n8n
```
Trigger → Agent → Response          (flujo principal)
Model → Agent                       (via ai_languageModel)
Tool  → Agent                       (via ai_tool)
Memory → Agent                      (via ai_memory, opcional)
OutputParser → Agent                (via ai_outputParser, opcional)
```

### Modelos Disponibles (Claude)
| Modelo | Uso Recomendado | Max Tokens |
|--------|----------------|------------|
| claude-sonnet-4-20250514 | General, balance costo/calidad | 8192 |
| claude-opus-4-20250514 | Tareas complejas, razonamiento | 8192 |
| claude-haiku-4-5-20251001 | Rapido, clasificacion, routing | 4096 |

### Temperature Guidelines
| Tarea | Temperature |
|-------|------------|
| Clasificacion, extraccion | 0.0 - 0.1 |
| Procesamiento general | 0.2 - 0.4 |
| Creativo, brainstorming | 0.7 - 1.0 |

---

## Tool Patterns

### 1. HTTP Request Tool
```json
{
  "type": "@n8n/n8n-nodes-langchain.toolHttpRequest",
  "typeVersion": 1.1,
  "parameters": {
    "toolDescription": "Describe what this API does for the agent",
    "method": "POST",
    "url": "https://api.example.com/endpoint",
    "sendHeaders": true,
    "headerParameters": {
      "parameters": [
        { "name": "Authorization", "value": "Bearer {{$credentials.apiKey}}" }
      ]
    }
  }
}
```

### 2. Code Tool (JavaScript)
```json
{
  "type": "@n8n/n8n-nodes-langchain.toolCode",
  "typeVersion": 1.1,
  "parameters": {
    "name": "tool_name",
    "description": "What this tool does",
    "language": "javaScript",
    "jsCode": "// Tool logic here\nreturn { result: 'value' };"
  }
}
```

### 3. Database Tool (Postgres)
```json
{
  "type": "@n8n/n8n-nodes-langchain.toolPostgres",
  "typeVersion": 1,
  "parameters": {
    "toolDescription": "Query the database"
  }
}
```

### 4. Vector Store Tool (RAG)
```json
{
  "type": "@n8n/n8n-nodes-langchain.toolVectorStore",
  "typeVersion": 1,
  "parameters": {
    "toolDescription": "Search knowledge base"
  }
}
```

### 5. Workflow Tool (Sub-agent)
```json
{
  "type": "@n8n/n8n-nodes-langchain.toolWorkflow",
  "typeVersion": 1.2,
  "parameters": {
    "name": "sub_task_name",
    "description": "Delegates [task] to specialized sub-workflow",
    "workflowId": "={{ $workflow.id }}"
  }
}
```

---

## Memory Patterns

### Window Buffer Memory (conversaciones cortas)
```json
{
  "type": "@n8n/n8n-nodes-langchain.memoryBufferWindow",
  "typeVersion": 1.3,
  "parameters": {
    "sessionIdType": "customKey",
    "sessionKey": "={{ $json.sessionId }}",
    "contextWindowLength": 10
  }
}
```

### Postgres Chat Memory (persistente)
```json
{
  "type": "@n8n/n8n-nodes-langchain.memoryPostgresChat",
  "typeVersion": 1.3,
  "parameters": {
    "sessionIdType": "customKey",
    "sessionKey": "={{ $json.sessionId }}"
  }
}
```

---

## Multi-Agent Patterns

### Pattern: Router + Specialists
```
Trigger → Router Agent → [Specialist A, Specialist B, Specialist C] → Merge → Response
```
- Router usa temperature 0.0, clasifica intent
- Cada specialist tiene su propio system prompt y tools
- Merge combina resultados

### Pattern: Sequential Pipeline
```
Trigger → Agent 1 (extract) → Agent 2 (transform) → Agent 3 (validate) → Response
```
- Cada agente hace una tarea especifica
- Output de uno es input del siguiente

### Pattern: Supervisor
```
Trigger → Supervisor Agent → [Worker A, Worker B] → Supervisor (review) → Response
```
- Supervisor delega y revisa
- Workers ejecutan tareas especificas

---

## Checklist de Validacion

Antes de exportar, verificar:

- [ ] JSON valido (parseable)
- [ ] Todos los nodos tienen `id`, `name`, `type`, `position` unicos
- [ ] Todas las conexiones referencian nodos existentes
- [ ] Agente tiene LLM conectado via `ai_languageModel`
- [ ] Agente tiene al menos 1 tool via `ai_tool`
- [ ] Trigger node existe y esta conectado
- [ ] Error handling configurado
- [ ] System prompt definido (no placeholder)
- [ ] Credenciales usan `{{$credentials.X}}` (no hardcoded)
- [ ] Positions no se solapan (min 200px entre nodos)
- [ ] Tags incluyen "agentic"

---

## Ejemplo de Uso con Claude Code

```bash
# Generar un workflow:
# 1. Describe tu caso de uso
# 2. Claude Code usa este generator para crear el JSON
# 3. Valida con validate-workflow.js
# 4. Importa en n8n

# Prompt pattern:
"Genera un workflow n8n agentico para [CASO DE USO].
El agente debe poder [CAPABILITIES].
Usa [MODEL] con temperature [TEMP].
Tools necesarios: [TOOLS LIST].
Trigger: [TRIGGER TYPE]."
```
