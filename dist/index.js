#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Handle invalid CWD early (common in WSL when paths become inaccessible)
// This must run before any imports that might use process.cwd()
try {
    process.cwd();
}
catch (e) {
    // CWD is invalid, change to home directory or /tmp as fallback
    const safeDir = process.env.HOME || '/tmp';
    try {
        process.chdir(safeDir);
        console.error(`Warning: CWD was invalid, changed to ${safeDir}`);
    }
    catch {
        // If even that fails, continue anyway - some operations may still work
        console.error('Warning: Could not set valid working directory');
    }
}
const index_js_1 = require("@modelcontextprotocol/sdk/server/index.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const types_js_1 = require("@modelcontextprotocol/sdk/types.js");
const definitions_js_1 = require("./tools/definitions.js");
const handlers_js_1 = require("./tools/handlers.js");
const server = new index_js_1.Server({
    name: 'mcp-adb',
    version: '0.1.0',
}, {
    capabilities: {
        tools: {},
    },
});
server.setRequestHandler(types_js_1.ListToolsRequestSchema, async () => {
    return {
        tools: definitions_js_1.toolDefinitions,
    };
});
server.setRequestHandler(types_js_1.CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
        const handler = handlers_js_1.toolHandlers[name];
        if (!handler) {
            throw new types_js_1.McpError(types_js_1.ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
        }
        return await handler(args);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        throw new types_js_1.McpError(types_js_1.ErrorCode.InternalError, `Tool execution failed: ${errorMessage}`);
    }
});
async function main() {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    // Optional: Log server start
    console.error('MCP ADB Server started');
}
main().catch((error) => {
    console.error('Server failed to start:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map