# Local project MCP

Read-only project context for a local MCP client. Uses stdio; no listener, hosted service, provider calls, environment files, or changes to the application. Six explicitly listed Markdown resources expose overview, handoff, evidence, methodology, decisions and deployment notes. Requires Node 20+.

Run `npm ci` in this directory. Add this entry to your MCP client's configuration, replacing the absolute path for your checkout:

```json
{
  "mcpServers": {
    "otaku-oracle-local": {
      "command": "node",
      "args": ["D:/Project/otaku-oracle/local-mcp/server.mjs"]
    }
  }
}
```

Restart the client and use its resources picker. `npm test` checks initialization, all document reads and rejected paths. This is a documentation server, not an anime answering tool; it does not use the production API. No global client settings are modified by this repository.
