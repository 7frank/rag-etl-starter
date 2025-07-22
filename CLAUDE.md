# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development
- `bun dev` - Start development servers for all apps (web on :3000, docs on :3001)
- `bun dev --filter=web` - Start only the web app
- `bun dev --filter=docs` - Start only the docs app

### Build & Testing  
- `bun build` - Build all apps and packages
- `bun build --filter=web` - Build only the web app
- `bun lint` - Run ESLint across all workspaces (with --max-warnings 0)
- `bun check-types` - Run TypeScript type checking across all workspaces
- `bun format` - Format code using Prettier

### Package Management
- Uses Bun as the package manager (bun@1.2.9)
- Run `bun install` to install dependencies

## Architecture

This is a Turborepo monorepo with the following structure:

### Apps
- `apps/web` - Main Next.js application (port 3000)
- `apps/docs` - Documentation Next.js application (port 3001)

### Packages
- `@repo/ui` - Shared React component library (exports components from src/*.tsx)
- `@repo/eslint-config` - Shared ESLint configurations
- `@repo/typescript-config` - Shared TypeScript configurations

### Key Patterns
- All packages are private and use workspace dependencies (`*`)
- Next.js apps use --turbopack for development
- Components in @repo/ui use "use client" directive and require appName prop
- TypeScript throughout with strict type checking
- ESLint configured with zero warnings tolerance
- Turborepo handles task orchestration and caching

### Turborepo Configuration
- `build` task has dependency chain (^build) with Next.js outputs cached
- `dev` task runs persistently without caching
- `lint` and `check-types` have dependency chains
- Uses Turbo UI (TUI) interface