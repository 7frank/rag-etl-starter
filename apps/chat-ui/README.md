# Chat UI - LibreChat with Wiki MCP Integration

This app provides a complete chat interface using LibreChat with integrated Wikipedia knowledge graph search via your custom MCP server.

## Quick Start

**Prerequisites**: Start your existing services first:
```bash
# From repo root - start Neo4j, MCP server, etc.
bun dev --filter=neo4j
bun dev --filter=my-wiki-mcp
```

**Then start LibreChat**:
```bash
# From repo root
bun dev --filter=chat-ui

# Or from this directory
cd apps/chat-ui
bun dev
```

Access LibreChat at: http://localhost:3081

## What's Included

- **LibreChat**: Modern AI chat interface (Dockerized)
- **MongoDB**: LibreChat's database (Dockerized)
- **Redis**: Caching for LibreChat (Dockerized)

**Connects to your existing services**:
- **Wiki MCP Server**: http://localhost:8080/mcp
- **Neo4j Database**: Your existing Neo4j instance

## MCP Tools Available

1. **search_knowledge**: Search Wikipedia by text content
2. **get_page**: Get specific Wikipedia page by ID or title  
3. **search_by_topic**: Search by topic categories
4. **get_stats**: Get knowledge graph statistics

## Commands

- `bun dev` - Start all services with LibreChat UI
- `bun stop` - Stop all services
- `bun clean` - Stop and remove all data volumes
- `bun logs` - View service logs

## LLM Provider Options

The chat UI comes configured with two default LLM providers:

### 1. Ollama (Local Models)

**Default Configuration**: Uses dockerized Ollama instance 

**Available Models**:
- `qwen2.5:7b` - Qwen 2.5 7B model
- `llama3.1:8b` - Llama 3.1 8B model  
- `deepseek-r1:14b` - DeepSeek R1 14B model
- `llama3.2:latest` - Latest Llama 3.2 model
- `smollm2:latest` - SmolLM2 latest
- `llama3.2:3b-instruct-q8_0` - Llama 3.2 3B instruct (quantized)
- Additional HuggingFace models

### 2. OpenRouter (Free Tier)

**Configuration**: Uses OpenRouter's free tier models

**Available Models**:
- `deepseek/deepseek-r1:free` - DeepSeek R1 (Free)
- `deepseek/deepseek-v3-base:free` - DeepSeek V3 Base (Free)
- `tngtech/deepseek-r1t-chimera:free` - DeepSeek R1T Chimera (Free)
- `google/gemma-2-9b-it:free` - Google Gemma 2 9B (Free)
- `meta-llama/llama-3-8b-instruct:free` - Llama 3 8B (Free)
- `microsoft/phi-3-mini-128k-instruct:free` - Phi-3 Mini (Free)

**Setup**:
1. Sign up at https://openrouter.ai
2. Get your API key from the dashboard
3. Set `OPENROUTER_KEY` in `.env` file
4. Restart the chat UI

## Configuration Files

- **LibreChat config**: `librechat.yaml` - Defines endpoints and models
- **Environment variables**: `.env` - API keys and settings
- **Docker services**: `docker-compose.yml` - Service definitions

The MCP server is pre-configured and will be available automatically when you start the chat interface.