#!/usr/bin/env node

/**
 * n8n Workflow Validator
 * Validates agentic workflow JSON files before importing to n8n.
 * Usage: node validate-workflow.js <workflow.json>
 */

const fs = require('fs');
const path = require('path');

const COLORS = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(type, msg) {
  const icons = { pass: `${COLORS.green}  PASS${COLORS.reset}`, fail: `${COLORS.red}  FAIL${COLORS.reset}`, warn: `${COLORS.yellow}  WARN${COLORS.reset}`, info: `${COLORS.cyan}  INFO${COLORS.reset}` };
  console.log(`${icons[type]} ${msg}`);
}

function validate(filePath) {
  const results = { pass: 0, fail: 0, warn: 0 };

  console.log(`\n${COLORS.bold}n8n Workflow Validator${COLORS.reset}`);
  console.log(`${'─'.repeat(50)}`);
  console.log(`File: ${filePath}\n`);

  // 1. File exists and is valid JSON
  let workflow;
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    workflow = JSON.parse(raw);
    log('pass', 'Valid JSON');
    results.pass++;
  } catch (e) {
    log('fail', `Invalid JSON: ${e.message}`);
    results.fail++;
    return printSummary(results);
  }

  // 2. Has name
  if (workflow.name && workflow.name.trim()) {
    log('pass', `Workflow name: "${workflow.name}"`);
    results.pass++;
  } else {
    log('fail', 'Missing workflow name');
    results.fail++;
  }

  // 3. Has nodes array
  if (!Array.isArray(workflow.nodes) || workflow.nodes.length === 0) {
    log('fail', 'No nodes defined');
    results.fail++;
    return printSummary(results);
  }
  log('pass', `${workflow.nodes.length} nodes found`);
  results.pass++;

  // 4. All nodes have required fields
  const nodeIds = new Set();
  const nodeNames = new Set();
  let nodeFieldsOk = true;
  for (const node of workflow.nodes) {
    const missing = ['id', 'name', 'type', 'position'].filter(f => !node[f]);
    if (missing.length > 0) {
      log('fail', `Node "${node.name || node.id || '?'}" missing: ${missing.join(', ')}`);
      results.fail++;
      nodeFieldsOk = false;
    }
    if (node.id) {
      if (nodeIds.has(node.id)) {
        log('fail', `Duplicate node ID: ${node.id}`);
        results.fail++;
        nodeFieldsOk = false;
      }
      nodeIds.add(node.id);
    }
    if (node.name) {
      if (nodeNames.has(node.name)) {
        log('fail', `Duplicate node name: "${node.name}"`);
        results.fail++;
        nodeFieldsOk = false;
      }
      nodeNames.add(node.name);
    }
  }
  if (nodeFieldsOk) {
    log('pass', 'All nodes have required fields and unique IDs/names');
    results.pass++;
  }

  // 5. Has trigger node
  const triggerTypes = ['webhook', 'schedule', 'manualTrigger', 'emailTrigger', 'chatTrigger'];
  const hasTrigger = workflow.nodes.some(n =>
    triggerTypes.some(t => (n.type || '').toLowerCase().includes(t.toLowerCase()))
  );
  if (hasTrigger) {
    log('pass', 'Trigger node found');
    results.pass++;
  } else {
    log('fail', 'No trigger node (webhook, schedule, manual, etc.)');
    results.fail++;
  }

  // 6. Has agent node
  const agentNodes = workflow.nodes.filter(n => (n.type || '').includes('agent'));
  if (agentNodes.length > 0) {
    log('pass', `${agentNodes.length} agent node(s) found`);
    results.pass++;
  } else {
    log('warn', 'No agent nodes found (not agentic?)');
    results.warn++;
  }

  // 7. Connections validation
  if (workflow.connections && typeof workflow.connections === 'object') {
    let connectionsOk = true;
    const connNodeNames = new Set([
      ...Object.keys(workflow.connections),
      ...Object.values(workflow.connections).flatMap(conns =>
        Object.values(conns).flatMap(arr =>
          (Array.isArray(arr) ? arr : []).flatMap(targets =>
            (Array.isArray(targets) ? targets : []).map(t => t.node)
          )
        )
      )
    ]);

    for (const name of connNodeNames) {
      if (!nodeNames.has(name)) {
        log('fail', `Connection references non-existent node: "${name}"`);
        results.fail++;
        connectionsOk = false;
      }
    }

    if (connectionsOk) {
      log('pass', 'All connections reference existing nodes');
      results.pass++;
    }

    // 8. Agent has LLM connected
    if (agentNodes.length > 0) {
      const hasLlmConnection = Object.values(workflow.connections).some(conns =>
        conns.ai_languageModel && conns.ai_languageModel.length > 0
      );
      if (hasLlmConnection) {
        log('pass', 'Agent has LLM model connected (ai_languageModel)');
        results.pass++;
      } else {
        log('fail', 'Agent missing LLM connection (ai_languageModel)');
        results.fail++;
      }

      // 9. Agent has tools
      const hasToolConnection = Object.values(workflow.connections).some(conns =>
        conns.ai_tool && conns.ai_tool.length > 0
      );
      if (hasToolConnection) {
        log('pass', 'Agent has tool(s) connected (ai_tool)');
        results.pass++;
      } else {
        log('warn', 'Agent has no tools connected (ai_tool)');
        results.warn++;
      }
    }
  } else {
    log('fail', 'No connections defined');
    results.fail++;
  }

  // 10. No hardcoded secrets
  const raw = JSON.stringify(workflow);
  const secretPatterns = [
    /sk-[a-zA-Z0-9]{20,}/,
    /Bearer [a-zA-Z0-9\-._~+\/]+=*/,
    /password["']?\s*[:=]\s*["'][^"']+["']/i
  ];
  let hasSecrets = false;
  for (const pattern of secretPatterns) {
    if (pattern.test(raw)) {
      log('fail', `Possible hardcoded secret detected (${pattern.source.slice(0, 30)}...)`);
      results.fail++;
      hasSecrets = true;
    }
  }
  if (!hasSecrets) {
    log('pass', 'No hardcoded secrets detected');
    results.pass++;
  }

  // 11. Node positions don't overlap
  const positions = workflow.nodes.map(n => ({ name: n.name, x: n.position?.[0], y: n.position?.[1] }));
  let positionOverlap = false;
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = Math.abs((positions[i].x || 0) - (positions[j].x || 0));
      const dy = Math.abs((positions[i].y || 0) - (positions[j].y || 0));
      if (dx < 100 && dy < 100) {
        log('warn', `Nodes "${positions[i].name}" and "${positions[j].name}" overlap (${dx}px, ${dy}px apart)`);
        results.warn++;
        positionOverlap = true;
      }
    }
  }
  if (!positionOverlap) {
    log('pass', 'Node positions are well-spaced');
    results.pass++;
  }

  // 12. Has error handling
  const hasErrorHandler = workflow.nodes.some(n =>
    (n.name || '').toLowerCase().includes('error') ||
    (n.type || '').includes('errorTrigger')
  );
  if (hasErrorHandler) {
    log('pass', 'Error handling node found');
    results.pass++;
  } else {
    log('warn', 'No error handling node detected');
    results.warn++;
  }

  // 13. Placeholders check
  const placeholderPattern = /\[([A-Z_ ]+)\]/g;
  const placeholders = raw.match(placeholderPattern);
  if (placeholders) {
    const unique = [...new Set(placeholders)];
    log('warn', `Unresolved placeholders: ${unique.join(', ')}`);
    results.warn++;
  } else {
    log('pass', 'No unresolved placeholders');
    results.pass++;
  }

  printSummary(results);
}

function printSummary(results) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`${COLORS.bold}Summary:${COLORS.reset} ${COLORS.green}${results.pass} passed${COLORS.reset}, ${COLORS.red}${results.fail} failed${COLORS.reset}, ${COLORS.yellow}${results.warn} warnings${COLORS.reset}`);

  if (results.fail === 0) {
    console.log(`\n${COLORS.green}${COLORS.bold}  READY to import to n8n${COLORS.reset}\n`);
    process.exit(0);
  } else {
    console.log(`\n${COLORS.red}${COLORS.bold}  FIX ${results.fail} error(s) before importing${COLORS.reset}\n`);
    process.exit(1);
  }
}

// CLI
const file = process.argv[2];
if (!file) {
  console.log(`\nUsage: node validate-workflow.js <workflow.json>\n`);
  process.exit(1);
}

const filePath = path.resolve(file);
if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

validate(filePath);
