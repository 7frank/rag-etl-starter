# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `bun dev` - Start development servers for all apps (web on :3000, docs on :3001, Neo4j database, Prefect UI on :4200)
- `bun dev --filter=web` - Start only the web app
- `bun dev --filter=docs` - Start only the docs app
- `bun dev --filter=neo4j` - Start only Neo4j database container
- `bun dev --filter=prefect-etl` - Start only Prefect UI server

### Build & Testing  
- `bun build` - Build all apps and packages
- `bun build --filter=web` - Build only the web app
- `bun lint` - Run ESLint across all workspaces (with --max-warnings 0)
- `bun check-types` - Run TypeScript type checking across all workspaces
- `bun format` - Format code using Prettier


### Database Management
- `bun stop` - Stop all running services (including Neo4j and Prefect)
- `bun stop --filter=neo4j` - Stop only Neo4j container
- `bun clean --filter=neo4j` - Stop Neo4j and remove container + data volume
- `bun clean --filter=prefect-etl` - Clean Prefect environment and cache

### MCP Server
- `bun build --filter=my-wiki-mcp` - Build the MCP server
- `bun dev --filter=my-wiki-mcp` - Start MCP server with HTTP transport + MCP Inspector (port 3000 + 6274)
- `bun dev:stdio --filter=my-wiki-mcp` - Start MCP server with stdio transport only
- `bun inspector --filter=my-wiki-mcp` - Launch MCP Inspector for testing tools
- MCP server provides Wikipedia knowledge graph search with dual transport support

### Package Management
- Uses Bun as the package manager (bun@1.2.9) for Node.js dependencies
- Uses UV for Python environment management in prefect-etl app
- Uses Typia for super-fast TypeScript validation (20,000x faster than traditional validators)
- Run `bun install` to install Node.js dependencies
- Run `bun install --filter=prefect-etl` to install Python dependencies via UV

## Architecture

This is a Turborepo monorepo with the following structure:

### Apps
- `apps/web` - Main Next.js application (port 3000)
- `apps/docs` - Documentation Next.js application (port 3001)  
- `apps/neo4j` - Neo4j database container (ports 7474:7474, 7687:7687, auth: neo4j/password)
- `apps/prefect-etl` - Python ETL workflows using Prefect and UV (UI on port 4200)

### Packages
- `@repo/ui` - Shared React component library (exports components from src/*.tsx)
- `@repo/eslint-config` - Shared ESLint configurations
- `@repo/typescript-config` - Shared TypeScript configurations
- `@repo/my-wiki-mcp` - MCP server for Wikipedia knowledge graph search using FastMCP and Typia

### Key Patterns
- All packages are private and use workspace dependencies (`*`)
- Next.js apps use --turbopack for development
- Components in @repo/ui use "use client" directive and require appName prop
- TypeScript throughout with strict type checking
- ESLint configured with zero warnings tolerance
- Python ETL app uses UV for environment management and Makefile for task orchestration
- Prefect flows extract data from Wikipedia API and load into Neo4j
- MCP server uses Typia for compile-time validation generation and FastMCP for protocol handling
- Turborepo handles task orchestration and caching across all apps

### Turborepo Configuration
- `build` task has dependency chain (^build) with Next.js outputs cached
- `dev` task runs persistently without caching (includes Prefect UI)
- `lint` and `check-types` have dependency chains
- `flow` and `ui` tasks for ETL workflow execution
- `stop` and `clean` tasks for service management
- Uses Turbo UI (TUI) interface

### ETL Workflow Details
- Wikipedia ETL flow extracts data from Wikipedia API
- Transforms data and loads into Neo4j graph database
- Uses Prefect for workflow orchestration and monitoring
- Configurable via environment variables (.env file)
- Includes retry logic and comprehensive logging

### MCP Server Details
- Provides 4 tools: search_knowledge, get_page, search_by_topic, get_stats
- Uses Typia for 20,000x faster parameter validation vs traditional runtime validation
- Direct Neo4j integration for knowledge graph queries
- **Dual Transport Support**:
  - **Stdio transport** for Claude Desktop integration
  - **Streamable HTTP transport** for web services and development
- **Development Tools**:
  - Built-in MCP Inspector integration for testing tools visually
  - HTTP server runs on port 3000/mcp for easy debugging
  - TypeScript development with Bun (no compilation needed)
- Environment-configurable connection settings