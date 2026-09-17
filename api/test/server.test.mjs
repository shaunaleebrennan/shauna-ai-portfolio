import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createServer } from 'node:http';
import test from 'node:test';
import { createHandler } from '../server.mjs';

const evidence = [{
  id: 'test',
  slug: 'hq-agent',
  title: 'HQ Agent',
  eyebrow: 'Positioning',
  excerpt: 'A sourced test excerpt.',
  href: './case-study.html?case=hq-agent',
  source: 'Portfolio case study'
}];

const withServer = async (handler, run) => {
  const server = createServer(handler);
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const { port } = server.address();
  try {
    await run(`http://127.0.0.1:${port}`);
  } finally {
    server.close();
    await once(server, 'close');
  }
};

test('health endpoint is available without a Voyage key', async () => {
  await withServer(createHandler({ evidence, apiKey: '' }), async baseUrl => {
    const response = await fetch(`${baseUrl}/health`);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { ok: true });
  });
});

test('search returns public result fields and approved CORS origin', async () => {
  const search = async () => [{
    id: 'test',
    title: 'HQ Agent',
    eyebrow: 'Positioning',
    excerpt: 'A sourced test excerpt.',
    href: './case-study.html?case=hq-agent'
  }];

  await withServer(createHandler({
    evidence,
    apiKey: 'test-key',
    search,
    allowedOrigins: new Set(['https://shaunaleebrennan.github.io'])
  }), async baseUrl => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: {
        Origin: 'https://shaunaleebrennan.github.io',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: 'agentic AI' })
    });

    assert.equal(response.status, 200);
    assert.equal(response.headers.get('access-control-allow-origin'), 'https://shaunaleebrennan.github.io');
    const payload = await response.json();
    assert.equal(payload.results[0].title, 'HQ Agent');
    assert.equal(Object.keys(payload.results[0]).includes('score'), false);
  });
});

test('search rejects unapproved origins before calling the provider', async () => {
  let called = false;
  await withServer(createHandler({
    evidence,
    apiKey: 'test-key',
    search: async () => {
      called = true;
      return [];
    },
    allowedOrigins: new Set(['https://shaunaleebrennan.github.io'])
  }), async baseUrl => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: {
        Origin: 'https://attacker.example',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query: 'agentic AI' })
    });
    assert.equal(response.status, 403);
  });
  assert.equal(called, false);
});

test('search rejects oversized request bodies before calling the provider', async () => {
  let called = false;
  await withServer(createHandler({
    evidence,
    apiKey: 'test-key',
    search: async () => {
      called = true;
      return [];
    }
  }), async baseUrl => {
    const response = await fetch(`${baseUrl}/api/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: 'x'.repeat(5000) })
    });
    assert.equal(response.status, 413);
  });
  assert.equal(called, false);
});
