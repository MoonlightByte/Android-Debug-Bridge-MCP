#!/usr/bin/env node

// Handle invalid CWD early (common in WSL when paths become inaccessible)
// This must run before any imports that might use process.cwd()
try {
  process.cwd();
} catch (e) {
  // CWD is invalid, change to home directory or /tmp as fallback
  const safeDir = process.env.HOME || '/tmp';
  try {
    process.chdir(safeDir);
    console.error(`Warning: CWD was invalid, changed to ${safeDir}`);
  } catch {
    // If even that fails, continue anyway - some operations may still work
    console.error('Warning: Could not set valid working directory');
  }
}

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ErrorCode,
  ListToolsRequestSchema,
  McpError,
} from '@modelcontextprotocol/sdk/types.js';
import { toolDefinitions } from './tools/definitions.js';
import { toolHandlers } from './tools/handlers.js';

const server = new Server(
  {
    name: 'mcp-adb',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: toolDefinitions,
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    const handler = toolHandlers[name as keyof typeof toolHandlers];
    if (!handler) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }

    return await handler(args);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new McpError(ErrorCode.InternalError, `Tool execution failed: ${errorMessage}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  // Optional: Log server start
  console.error('MCP ADB Server started');
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});