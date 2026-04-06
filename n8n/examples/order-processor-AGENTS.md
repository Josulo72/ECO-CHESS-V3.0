# Order Processor Agent - Documentation

## Overview
Agentic workflow that processes e-commerce orders using Claude AI. The agent validates orders, checks inventory, calculates totals with discounts, and routes orders by priority.

## Architecture
```
POST /process-order → Order Agent → Response
                        ├── Claude Sonnet (LLM)
                        ├── Check Inventory (HTTP Tool)
                        └── Calculate Total (Code Tool)
```

## Agent: Order Agent

### Role
Intelligent order processor that validates, classifies, and routes e-commerce orders.

### Model
- **Model**: Claude Sonnet 4 (`claude-sonnet-4-20250514`)
- **Temperature**: 0.1 (deterministic processing)
- **Max Tokens**: 4096

### System Prompt Summary
- Validates incoming orders (required fields, availability, pricing)
- Classifies priority: urgent, standard, bulk
- Applies bulk discount (10%) for 50+ items
- Flags orders over $10,000 for manual review
- Returns structured JSON responses

### Tools

| Tool | Type | Purpose |
|------|------|---------|
| Check Inventory | HTTP GET | Queries inventory API for product stock levels |
| Calculate Total | Code (JS) | Computes subtotal, discounts, tax, shipping, total |

## Setup Guide

### Prerequisites
- n8n instance (self-hosted or cloud)
- Anthropic API key (for Claude)
- Inventory API endpoint and key

### Credentials to Configure in n8n
1. **Anthropic API** - Add your Anthropic API key in n8n credentials
2. **inventoryApiUrl** - Base URL of your inventory service
3. **inventoryApiKey** - API key for inventory service

### Import Steps
1. Open n8n
2. Go to Workflows → Import from File
3. Select `order-processor-agent.json`
4. Configure credentials (Anthropic, Inventory API)
5. Activate the workflow
6. Test with: `curl -X POST https://your-n8n/webhook/process-order -H "Content-Type: application/json" -d '{"orderId": "TEST-001", "items": [{"productId": "SKU-100", "quantity": 2, "price": 29.99}], "customer": {"name": "Test User", "email": "test@example.com"}}'`

### Expected Response
```json
{
  "orderId": "TEST-001",
  "status": "processed",
  "priority": "standard",
  "total": "64.78",
  "actions": ["validated", "inventory_checked", "total_calculated"],
  "warnings": []
}
```
