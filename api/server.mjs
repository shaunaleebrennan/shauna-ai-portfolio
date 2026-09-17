import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { rerankEvidence, SearchError } from './search.mjs';

const DEFAULT_ALLOWED_ORIGINS = [
  'https://shaunaleebrennan.github.io',
  'http://localhost:8000',
  'http://127.0.0.1:8000'
];
const MAX_BODY_BYTES = 4096;
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 3;
const UPSTREAM_TIMEOUT_MS = 10_000;
const MAX_RATE_LIMIT_CLIENTS = 1000;
const envRateLimit = Number(process.env.REQUESTS_PER_MINUTE);
const configuredRateLimit = Number.isInteger(envRateLimit) && envRateLimit > 0 && envRateLimit <= 2000
  ? envRateLimit
  : RATE_LIMIT;

const evidenceUrl = new URL('../content/search-evidence.json', import.meta.url);

export const parseAllowedOrigins = value => new Set(
  (value ? value.split(',') : DEFAULT_ALLOWED_ORIGINS)
    .map(origin => origin.trim())
    .filter(Boolean)
);

export const createRateLimiter = ({ limit = RATE_LIMIT, windowMs = RATE_WINDOW_MS } = {}) => {
  const clients = new Map();

  return key => {
    const now = Date.now();

    if (clients.size >= MAX_RATE_LIMIT_CLIENTS && !clients.has(key)) {
      for (const [client, entry] of clients) {
        if (now >= entry.resetAt) clients.delete(client);
      }
      if (clients.size >= MAX_RATE_LIMIT_CLIENTS) {
        return { allowed: false, remaining: 0, resetAt: now + windowMs };
      }
    }

    const current = clients.get(key);
    if (!current || now >= current.resetAt) {
      const next = { count: 1, resetAt: now + windowMs };
      clients.set(key, next);
      return { allowed: true, remaining: limit - 1, resetAt: next.resetAt };
    }

    current.count += 1;
    return {
      allowed: current.count <= limit,
      remaining: Math.max(0, limit - current.count),
      resetAt: current.resetAt
    };
  };
};

const readJsonBody = request => new Promise((resolve, reject) => {
  let body = '';
  let size = 0;
  let settled = false;

  request.setEncoding('utf8');
  request.on('data', chunk => {
    if (settled) return;
    size += Buffer.byteLength(chunk);
    if (size > MAX_BODY_BYTES) {
      settled = true;
      reject(new SearchError('The request is too large.', { code: 'BODY_TOO_LARGE', status: 413 }));
      return;
    }
    body += chunk;
  });
  request.on('end', () => {
    if (settled) return;
    try {
      settled = true;
      resolve(body ? JSON.parse(body) : {});
    } catch {
      settled = true;
      reject(new SearchError('Send a valid JSON request.', { code: 'INVALID_JSON', status: 400 }));
    }
  });
  request.on('error', error => {
    if (settled) return;
    settled = true;
    reject(error);
  });
});

const json = (response, status, body, headers = {}) => {
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
    ...headers
  });
  response.end(JSON.stringify(body));
};

const requestIp = request => {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded) return forwarded.split(',')[0].trim();
  return request.socket.remoteAddress || 'unknown';
};

const corsHeaders = origin => origin ? {
  'Access-Control-Allow-Origin': origin,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400',
  Vary: 'Origin'
} : {};

export const createHandler = ({
  evidence,
  apiKey = process.env.VOYAGE_API_KEY,
  model = process.env.VOYAGE_MODEL || 'rerank-3-lite',
  endpoint = process.env.VOYAGE_ENDPOINT || 'https://ai.mongodb.com/v1/rerank',
  allowedOrigins = parseAllowedOrigins(process.env.ALLOWED_ORIGINS),
  search = rerankEvidence,
  rateLimit = createRateLimiter({
    limit: configuredRateLimit
  }),
  globalRateLimit = createRateLimiter({
    limit: configuredRateLimit
  })
}) => async (request, response) => {
  const url = new URL(request.url, 'http://localhost');
  const origin = request.headers.origin;
  const originAllowed = !origin || allowedOrigins.has(origin);

  if (url.pathname === '/health' && request.method === 'GET') {
    json(response, 200, { ok: true });
    return;
  }

  if (url.pathname !== '/api/search') {
    json(response, 404, { error: 'Not found.', code: 'NOT_FOUND' });
    return;
  }

  if (!originAllowed) {
    json(response, 403, { error: 'Origin not allowed.', code: 'ORIGIN_NOT_ALLOWED' });
    return;
  }

  const headers = corsHeaders(origin);
  if (request.method === 'OPTIONS') {
    response.writeHead(204, headers);
    response.end();
    return;
  }

  if (request.method !== 'POST') {
    json(response, 405, { error: 'Method not allowed.', code: 'METHOD_NOT_ALLOWED' }, {
      ...headers,
      Allow: 'POST, OPTIONS'
    });
    return;
  }

  const rate = rateLimit(requestIp(request));
  const globalRate = globalRateLimit('all-visitors');
  if (!rate.allowed || !globalRate.allowed) {
    const resetAt = Math.max(rate.resetAt, globalRate.resetAt);
    json(response, 429, {
      error: 'The evidence search is busy. Please wait a moment and try again.',
      code: 'RATE_LIMITED'
    }, {
      ...headers,
      'Retry-After': String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)))
    });
    return;
  }

  try {
    const body = await readJsonBody(request);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

    try {
      const results = await search({
        query: body.query,
        evidence,
        apiKey,
        model,
        endpoint,
        signal: controller.signal
      });
      json(response, 200, { results }, headers);
    } finally {
      clearTimeout(timeout);
    }
  } catch (error) {
    const known = error instanceof SearchError;
    const status = known ? error.status : 500;
    json(response, status, {
      error: known ? error.message : 'Evidence search is temporarily unavailable.',
      code: known ? error.code : 'INTERNAL_ERROR'
    }, headers);
  }
};

export const loadEvidence = async () => JSON.parse(await readFile(evidenceUrl, 'utf8'));

export const startServer = async () => {
  const evidence = await loadEvidence();
  const port = Number(process.env.PORT) || 3000;
  const server = createServer(createHandler({ evidence }));

  server.listen(port, '0.0.0.0', () => {
    console.log(`Portfolio evidence search listening on port ${port}.`);
  });
  return server;
};

const isEntryPoint = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isEntryPoint) {
  startServer().catch(error => {
    console.error('Portfolio evidence search failed to start.', error);
    process.exitCode = 1;
  });
}
