#!/usr/bin/env node

import { FastMCP } from "fastmcp";
import { z } from "zod";
import { Neo4jClient } from "./neo4j-client.js";

import { WikipediaPage } from "./types.js";

// Environment configuration
const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "password";

// Create FastMCP server
const server = new FastMCP({
  name: "my-wiki-mcp",
  version: "1.0.0"
});

console.log(server.options)

// Create Neo4j client
const neo4jClient = new Neo4jClient(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD);

// Create Zod schemas for validation
const searchKnowledgeSchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.number().min(1).max(50).optional().default(5)
});

const getPageSchema = z.object({
  identifier: z.string().min(1),
  type: z.enum(["id", "title"]).optional().default("title")
});

const searchByTopicSchema = z.object({
  topic: z.string().min(1).max(100),
  limit: z.number().min(1).max(50).optional().default(5)
});

// Search knowledge tool
server.addTool({
  name: "search_knowledge",
  description: "Search the Wikipedia knowledge graph by text content in titles and summaries",
  parameters: z.object({
    query: z.string().min(1).max(200).describe("Search query text (1-200 characters)"),
    limit: z.number().min(1).max(50).default(5).describe("Maximum number of results to return (1-50, default: 5)")
  }),
  execute: async (args: unknown) => {
    const validation = searchKnowledgeSchema.safeParse(args);
    if (!validation.success) {
      throw new Error(`Invalid parameters: ${validation.error.issues.map(i => i.path.join('.') + ": " + i.message).join(", ")}`);
    }

    const { query, limit } = validation.data;
    
    try {
      const pages = await neo4jClient.searchKnowledge(query, limit);
      const result = {
        success: true,
        results: pages,
        total: pages.length,
        query
      };
      return {
        type: "text",
        text: JSON.stringify(result, null, 2)
      };
    } catch (error) {
      console.error(error)
      const result = {
        success: false,
        error: `Search failed: ${error}`,
        query
      };
      return {
        type: "text",
        text: JSON.stringify(result, null, 2)
      };
    }
  }
});

// Get specific page tool
server.addTool({
  name: "get_page",
  description: "Get a specific Wikipedia page by ID or title",
  parameters: z.object({
    identifier: z.string().min(1).describe("Page ID or title to search for"),
    type: z.enum(["id", "title"]).default("title").describe("Type of identifier: 'id' for page ID or 'title' for page title")
  }),
  execute: async (args: unknown) => {
    const validation = getPageSchema.safeParse(args);
    if (!validation.success) {
      throw new Error(`Invalid parameters: ${validation.error.issues.map(i => i.path.join('.') + ": " + i.message).join(", ")}`);
    }

    const { identifier, type } = validation.data;
    
    try {
      let page: WikipediaPage | null;
      
      if (type === "id") {
        page = await neo4jClient.getPageById(identifier);
      } else {
        page = await neo4jClient.getPageByTitle(identifier);
      }

      if (!page) {
        const result = {
          success: false,
          error: `Page not found: ${identifier}`,
          identifier,
          type
        };
        return {
          type: "text",
          text: JSON.stringify(result, null, 2)
        };
      }

      const result = {
        success: true,
        page,
        identifier,
        type
      };
      return {
        type: "text",
        text: JSON.stringify(result, null, 2)
      };
    } catch (error) {
      const result = {
        success: false,
        error: `Get page failed: ${error}`,
        identifier,
        type
      };
      return {
        type: "text",
        text: JSON.stringify(result, null, 2)
      };
    }
  }
});

// Search by topic tool
server.addTool({
  name: "search_by_topic",
  description: "Search Wikipedia pages by topic category",
  parameters: z.object({
    topic: z.string().min(1).max(100).describe("Topic to search for (1-100 characters)"),
    limit: z.number().min(1).max(50).default(5).describe("Maximum number of results to return (1-50, default: 5)")
  }),
  execute: async (args: unknown) => {
    const validation = searchByTopicSchema.safeParse(args);
    if (!validation.success) {
      throw new Error(`Invalid parameters: ${validation.error.issues.map(i => i.path.join('.') + ": " + i.message).join(", ")}`);
    }

    const { topic, limit } = validation.data;
    
    try {
      const pages = await neo4jClient.searchByTopic(topic, limit);
      const result = {
        success: true,
        results: pages,
        total: pages.length,
        topic
      };
      return {
        type: "text",
        text: JSON.stringify(result, null, 2)
      };
    } catch (error) {
      const result = {
        success: false,
        error: `Topic search failed: ${error}`,
        topic
      };
      return {
        type: "text",
        text: JSON.stringify(result, null, 2)
      };
    }
  }
});

// Get database stats tool
server.addTool({
  name: "get_stats",
  description: "Get statistics about the knowledge graph database",
  parameters: z.object({}),
  execute: async () => {
    try {
      const stats = await neo4jClient.getStats();
      const result = {
        success: true,
        stats
      };
      return {
        type: "text",
        text: JSON.stringify(result, null, 2)
      };
    } catch (error) {
      const result = {
        success: false,
        error: `Failed to get stats: ${error}`
      };
      return {
        type: "text",
        text: JSON.stringify(result, null, 2)
      };
    }
  }
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down MCP server...");
  await neo4jClient.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Shutting down MCP server...");
  await neo4jClient.disconnect();
  process.exit(0);
});

// Start the server
console.log("Starting My Wiki MCP server with HTTP transport...");
console.log("HTTP server will be available at: http://localhost:8080/mcp");
console.log("Use MCP Inspector: npx @modelcontextprotocol/inspector http://localhost:8080/mcp");

server.start({
  transportType: "httpStream",
    httpStream: {
    port: 8080,
  },
});