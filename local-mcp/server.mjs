import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFile } from 'node:fs/promises';

const server = new McpServer({ name: 'otaku-oracle-local', version: '1.0.0' });
const documents = {
  overview: '../README.md',
  handoff: '../docs/PROJECT_REPORT.md',
  evidence: '../docs/EVIDENCE.md',
  methodology: '../docs/PREREGISTRATION.md',
  decisions: '../docs/WHY.md',
  deployment: '../docs/DEPLOY.md',
};
for (const [name, path] of Object.entries(documents)) {
  const uri = `otaku-oracle://docs/${name}`;
  server.registerResource(name, uri, { mimeType: 'text/markdown', description: `Local Otaku Oracle ${name} documentation` }, async () => ({
    contents: [{ uri, mimeType: 'text/markdown', text: await readFile(new URL(path, import.meta.url), 'utf8') }],
  }));
}
await server.connect(new StdioServerTransport());
