#!/usr/bin/env node

import { FastMCP } from "fastmcp";
import typia from "typia";
import { Neo4jClient } from "./neo4j-client.js";
import { 
  SearchKnowledgeParams, 
  GetPageParams, 
  SearchByTopicParams,
  WikipediaPage 
} from "./types.js";

// Parse command line arguments
const args = process.argv.slice(2);
const transportArg = args.find(arg => arg.startsWith('--transport='))?.split('=')[1];
const transport = transportArg || (args.includes('--transport') && args[args.indexOf('--transport') + 1]) || 'http';

// Environment configuration
const NEO4J_URI = process.env.NEO4J_URI || "bolt://localhost:7687";
const NEO4J_USER = process.env.NEO4J_USER || "neo4j";
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || "password";
const HTTP_PORT = parseInt(process.env.MCP_HTTP_PORT || "3000");
const HTTP_PATH = process.env.MCP_HTTP_PATH || "/mcp";

// Create FastMCP server
const server = new FastMCP({
  name: "my-wiki-mcp",
  version: "1.0.0"
});

// Create Neo4j client
const neo4jClient = new Neo4jClient(NEO4J_URI, NEO4J_USER, NEO4J_PASSWORD);

// Create Typia validators
const validateSearchKnowledge = typia.createValidate<SearchKnowledgeParams>();
const validateGetPage = typia.createValidate<GetPageParams>();
const validateSearchByTopic = typia.createValidate<SearchByTopicParams>();

// Search knowledge tool
server.addTool({
  name: "search_knowledge",
  description: "Search the Wikipedia knowledge graph by text content in titles and summaries",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query text (1-200 characters)",
        minLength: 1,
        maxLength: 200
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (1-50, default: 5)",
        minimum: 1,
        maximum: 50,
        default: 5
      }
    },
    required: ["query"]
  },
  execute: async (args: unknown) => {
    const validation = validateSearchKnowledge(args);
    if (!validation.success) {
      throw new Error(`Invalid parameters: ${validation.errors.map(e => e.path + ": " + e.expected).join(", ")}`);
    }

    const { query, limit = 5 } = validation.data;
    
    try {
      const pages = await neo4jClient.searchKnowledge(query, limit);
      return {
        success: true,
        results: pages,
        total: pages.length,
        query
      };
    } catch (error) {
      return {
        success: false,
        error: `Search failed: ${error}`,
        query
      };
    }
  }
});

// Get specific page tool
server.addTool({
  name: "get_page",
  description: "Get a specific Wikipedia page by ID or title",
  parameters: {
    type: "object",
    properties: {
      identifier: {
        type: "string",
        description: "Page ID or title to search for",
        minLength: 1
      },
      type: {
        type: "string",
        description: "Type of identifier: 'id' for page ID or 'title' for page title",
        enum: ["id", "title"],
        default: "title"
      }
    },
    required: ["identifier"]
  },
  execute: async (args: unknown) => {
    const validation = validateGetPage(args);
    if (!validation.success) {
      throw new Error(`Invalid parameters: ${validation.errors.map(e => e.path + ": " + e.expected).join(", ")}`);
    }

    const { identifier, type = "title" } = validation.data;
    
    try {
      let page: WikipediaPage | null;
      
      if (type === "id") {
        page = await neo4jClient.getPageById(identifier);
      } else {
        page = await neo4jClient.getPageByTitle(identifier);
      }

      if (!page) {
        return {
          success: false,
          error: `Page not found: ${identifier}`,
          identifier,
          type
        };
      }

      return {
        success: true,
        page,
        identifier,
        type
      };
    } catch (error) {
      return {
        success: false,
        error: `Get page failed: ${error}`,
        identifier,
        type
      };
    }
  }
});

// Search by topic tool
server.addTool({
  name: "search_by_topic",
  description: "Search Wikipedia pages by topic category",
  parameters: {
    type: "object",
    properties: {
      topic: {
        type: "string",
        description: "Topic to search for (1-100 characters)",
        minLength: 1,
        maxLength: 100
      },
      limit: {
        type: "number",
        description: "Maximum number of results to return (1-50, default: 5)",
        minimum: 1,
        maximum: 50,
        default: 5
      }
    },
    required: ["topic"]
  },
  execute: async (args: unknown) => {
    const validation = validateSearchByTopic(args);
    if (!validation.success) {
      throw new Error(`Invalid parameters: ${validation.errors.map(e => e.path + ": " + e.expected).join(", ")}`);
    }

    const { topic, limit = 5 } = validation.data;
    
    try {
      const pages = await neo4jClient.searchByTopic(topic, limit);
      return {
        success: true,
        results: pages,
        total: pages.length,
        topic
      };
    } catch (error) {
      return {
        success: false,
        error: `Topic search failed: ${error}`,
        topic
      };
    }
  }
});

// Get database stats tool
server.addTool({
  name: "get_stats",
  description: "Get statistics about the knowledge graph database",
  parameters: {
    type: "object",
    properties: {},
    required: []
  },
  execute: async () => {
    try {
      const stats = await neo4jClient.getStats();
      return {
        success: true,
        stats
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to get stats: ${error}`
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
console.log(`Starting My Wiki MCP server with ${transport} transport...`);

if (transport === "http") {
  console.log(`HTTP server will be available at: http://localhost:${HTTP_PORT}${HTTP_PATH}`);
  console.log(`Use MCP Inspector: npx @modelcontextprotocol/inspector http://localhost:${HTTP_PORT}${HTTP_PATH}`);
  
  server.start({
    transportType: "httpStream",
    httpStream: {
      port: HTTP_PORT,
      endpoint:HTTP_PATH
    }
  });
} else {
  console.log("Starting with stdio transport...");
  server.start({
    transportType: "stdio"
  });
}