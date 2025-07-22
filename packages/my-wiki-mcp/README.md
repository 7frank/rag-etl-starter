# My Wiki MCP Server

A Model Context Protocol (MCP) server for searching Wikipedia knowledge graph data stored in Neo4j.

## Features

- **Fast Validation**: Uses Typia for compile-time generated validators (20,000x faster than traditional runtime validation)
- **Neo4j Integration**: Direct connection to your Wikipedia knowledge graph
- **Multiple Search Methods**: Text search, topic search, specific page retrieval
- **Type Safety**: Full TypeScript support with compile-time type checking

## Tools Available

### `search_knowledge`
Search Wikipedia pages by text content in titles and summaries.

**Parameters:**
- `query` (string, required): Search query text (1-200 characters)
- `limit` (number, optional): Max results to return (1-50, default: 5)

### `get_page`
Get a specific Wikipedia page by ID or title.

**Parameters:**
- `identifier` (string, required): Page ID or title
- `type` (string, optional): "id" or "title" (default: "title")

### `search_by_topic`
Search Wikipedia pages by topic category.

**Parameters:**
- `topic` (string, required): Topic to search for (1-100 characters)  
- `limit` (number, optional): Max results to return (1-50, default: 5)

### `get_stats`
Get statistics about the knowledge graph database.

**Parameters:** None

## Environment Configuration

Copy `.env.example` to `.env` and configure:

```bash
NEO4J_URI=bolt://localhost:7687
NEO4J_USER=neo4j
NEO4J_PASSWORD=password
```

## Usage

### Development (with MCP Inspector)
```bash
# Start server with HTTP transport + MCP Inspector
bun run dev

# Start server with stdio transport only  
bun run dev:stdio

# Start just the MCP Inspector (if server is running)
bun run inspector
```

The development mode starts:
1. **MCP Server** on `http://localhost:3000/mcp` (Streamable HTTP transport)  
2. **MCP Inspector** on `http://localhost:6274` (for testing tools)

### Production

#### Stdio Transport (for Claude Desktop)
```bash
bun run build
bun run start
```

#### HTTP Transport (for web services)
```bash
bun run build  
bun run start:http
```

### Integration

#### Claude Desktop Configuration
Add to your Claude Desktop MCP settings:

```json
{
  "mcpServers": {
    "my-wiki-mcp": {
      "command": "node",
      "args": ["/path/to/dist/server.js", "--transport", "stdio"],
      "env": {
        "NEO4J_URI": "bolt://localhost:7687",
        "NEO4J_USER": "neo4j", 
        "NEO4J_PASSWORD": "password"
      }
    }
  }
}
```

#### Web Services / Remote MCP
For HTTP-based integrations, use:
```
http://localhost:3000/mcp
```

## Requirements

- Node.js 18+
- Neo4j database with WikipediaPage nodes
- Typia transformer configured in TypeScript