import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'node:url';

test('local stdio handshake, document discovery, read and access boundary', async () => {
  const client = new Client({ name: 'local-test', version: '1.0.0' });
  const transport = new StdioClientTransport({ command: process.execPath, args: [fileURLToPath(new URL('server.mjs', import.meta.url))] });
  try {
    await client.connect(transport);
    const { resources } = await client.listResources();
    assert.equal(resources.length, 6);
    for (const resource of resources) {
      const result = await client.readResource({ uri: resource.uri });
      assert.ok(result.contents[0].text.length > 100);
    }
    await assert.rejects(client.readResource({ uri: 'file:///etc/passwd' }));
    await assert.rejects(client.readResource({ uri: 'otaku-oracle://docs/../../.env' }));
  } finally { await client.close(); }
});
