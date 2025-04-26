import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import express from "express";
import { z, type ZodRawShape } from "zod";

// Create an MCP server
const server = new McpServer({
  name: "Demo",
  version: "1.0.0",
});

const greetSchema: ZodRawShape = {
  name: z.string(),
};

server.tool(
  "greet",
  "Greet a person",
  greetSchema,
  async ({ name }) => {
    return {
      content: [{
        type: "text",
        text: `Hello, ${name}!`,
      }],
    };
  }
);

// Create Express app
const app = express();

// Store the transport instance
let transport: SSEServerTransport | undefined = undefined;

// SSE endpoint
app.get("/sse", async (req, res) => {
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

// Message handling endpoint
app.post("/messages", async (req, res) => {
  if (!transport) {
    res.status(400);
    res.json({ error: "No transport" });
    return;
  }
  await transport.handlePostMessage(req, res);
});

// Start the server
app.listen(8080, () => {
  console.log("Server is running on port 8080");
}); 