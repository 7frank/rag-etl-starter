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

## Configuration

- LibreChat config: `librechat.yaml`
- MCP server config: `mcp-config.json` 
- Docker services: `docker-compose.yml`

The MCP server is pre-configured and will be available automatically when you start the chat interface.