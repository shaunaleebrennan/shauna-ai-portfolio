import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import {
  evidenceToDocument,
  normalizeEvidence,
  normalizeQuery,
  rerankEvidence,
  SearchError
} from '../search.mjs';

const evidence = [
  {
    id: 'hq-agent-insight',
    slug: 'hq-agent',
    title: 'HQ Agent',
    eyebrow: 'Agentic AI positioning',
    excerpt: 'The commercial progression was search to answer to action.',
    href: './case-study.html?case=hq-agent',
    keywords: ['agentic AI', 'enterprise search'],
    source: 'Portfolio case study'
  },
  {
    id: 'hq-agent-trust',
    slug: 'hq-agent',
    title: 'HQ Agent',
    eyebrow: 'Trust messaging',
    excerpt: 'Grounded, cited, and permission-aware made the buyer value concrete.',
    href: './case-study.html?case=hq-agent',
    keywords: ['RAG', 'trust'],
    source: 'Portfolio case study'
  },
  {
    id: 'market-leadership',
    slug: 'market-leadership',
    title: 'Market leadership',
    eyebrow: 'Analyst relations',
    excerpt: 'The analyst narrative and evidence base reinforced one another.',
    href: './case-study.html?case=market-leadership',
    keywords: ['Gartner', 'Forrester'],
    source: 'Portfolio case study'
  },
  {
    id: 'ai-strategy',
    slug: 'ai-product-strategy',
    title: 'AI Product Strategy',
    eyebrow: 'Technical expertise',
    excerpt: 'The workflow design keeps consequential judgment with people.',
    href: './case-study.html?case=ai-product-strategy',
    keywords: ['agents', 'MCP'],
    source: 'Portfolio case study'
  }
];

test('normalizes whitespace in valid questions', () => {
  assert.equal(normalizeQuery('  agentic   AI\nlaunches '), 'agentic AI launches');
});

test('rejects invalid questions and unsafe evidence links', () => {
  assert.throws(() => normalizeQuery(' '), SearchError);
  assert.throws(() => normalizeQuery('x'.repeat(241)), SearchError);
  assert.throws(() => normalizeEvidence([{ ...evidence[0], href: 'https://example.com' }]), SearchError);
});

test('builds a structured reranking document', () => {
  const document = evidenceToDocument(evidence[0]);
  assert.match(document, /Case study: HQ Agent/);
  assert.match(document, /Topics: agentic AI, enterprise search/);
});

test('validates every record in the production evidence index', async () => {
  const file = new URL('../../content/search-evidence.json', import.meta.url);
  const productionEvidence = JSON.parse(await readFile(file, 'utf8'));
  assert.equal(normalizeEvidence(productionEvidence).length, 24);
});

test('calls MongoDB Voyage rerank and returns three distinct case studies', async () => {
  let request;
  const fetchImpl = async (url, options) => {
    request = { url, options };
    return new Response(JSON.stringify({
      data: [
        { index: 0, relevance_score: 0.96 },
        { index: 1, relevance_score: 0.91 },
        { index: 2, relevance_score: 0.87 },
        { index: 3, relevance_score: 0.81 }
      ]
    }), { status: 200 });
  };

  const results = await rerankEvidence({
    query: 'How has Shauna positioned agentic AI?',
    evidence,
    apiKey: 'test-key',
    fetchImpl
  });

  assert.equal(request.url, 'https://ai.mongodb.com/v1/rerank');
  assert.equal(request.options.headers.Authorization, 'Bearer test-key');
  const body = JSON.parse(request.options.body);
  assert.equal(body.model, 'rerank-3-lite');
  assert.equal(body.return_documents, false);
  assert.equal(body.truncation, false);
  assert.equal(results.length, 3);
  assert.deepEqual(results.map(result => result.title), [
    'HQ Agent',
    'Market leadership',
    'AI Product Strategy'
  ]);
  assert.equal('relevance_score' in results[0], false);
});

test('maps upstream throttling to a safe error', async () => {
  await assert.rejects(
    rerankEvidence({
      query: 'technical GTM',
      evidence,
      apiKey: 'test-key',
      fetchImpl: async () => new Response('{"detail":"slow down"}', { status: 429 })
    }),
    error => error instanceof SearchError && error.status === 429
  );
});
