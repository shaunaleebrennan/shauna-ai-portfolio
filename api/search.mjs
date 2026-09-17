const DEFAULT_ENDPOINT = 'https://ai.mongodb.com/v1/rerank';
const DEFAULT_MODEL = 'rerank-3-lite';
const MAX_QUERY_LENGTH = 240;

export class SearchError extends Error {
  constructor(message, { code = 'SEARCH_FAILED', status = 502 } = {}) {
    super(message);
    this.name = 'SearchError';
    this.code = code;
    this.status = status;
  }
}

export const normalizeQuery = value => {
  if (typeof value !== 'string') {
    throw new SearchError('Enter a question to search the evidence.', {
      code: 'INVALID_QUERY',
      status: 400
    });
  }

  const query = value.replace(/\s+/g, ' ').trim();
  if (query.length < 2 || query.length > MAX_QUERY_LENGTH) {
    throw new SearchError(`Questions must be between 2 and ${MAX_QUERY_LENGTH} characters.`, {
      code: 'INVALID_QUERY',
      status: 400
    });
  }

  return query;
};

const safeHref = value => {
  if (typeof value !== 'string') return null;
  const caseStudy = /^\.\/case-study\.html\?case=[a-z0-9-]+$/;
  const portfolioSection = /^\.\/index\.html#(?:scan|essentials|ask)$/;
  return caseStudy.test(value) || portfolioSection.test(value) ? value : null;
};

export const normalizeEvidence = evidence => {
  if (!Array.isArray(evidence) || evidence.length === 0) {
    throw new SearchError('The evidence index is unavailable.', {
      code: 'INVALID_EVIDENCE',
      status: 500
    });
  }

  return evidence.map((item, index) => {
    const href = safeHref(item?.href);
    const excerpt = typeof item?.excerpt === 'string' ? item.excerpt.trim() : '';
    const title = typeof item?.title === 'string' ? item.title.trim() : '';
    if (!href || !excerpt || !title) {
      throw new SearchError(`Evidence record ${index + 1} is incomplete.`, {
        code: 'INVALID_EVIDENCE',
        status: 500
      });
    }

    return {
      id: typeof item.id === 'string' ? item.id : `evidence-${index + 1}`,
      slug: typeof item.slug === 'string' ? item.slug : (href.split('case=')[1] || href),
      title,
      eyebrow: typeof item.eyebrow === 'string' ? item.eyebrow.trim() : 'Case study',
      excerpt,
      href,
      keywords: Array.isArray(item.keywords) ? item.keywords.filter(value => typeof value === 'string') : [],
      source: typeof item.source === 'string' ? item.source.trim() : 'Portfolio case study'
    };
  });
};

export const evidenceToDocument = item => [
  `Case study: ${item.title}`,
  `Evidence type: ${item.eyebrow}`,
  `Evidence: ${item.excerpt}`,
  item.keywords.length ? `Topics: ${item.keywords.join(', ')}` : '',
  `Source: ${item.source}`
].filter(Boolean).join('\n');

const parseJson = async response => {
  const body = await response.text();
  if (!body) return {};

  try {
    return JSON.parse(body);
  } catch {
    throw new SearchError('The search provider returned an unreadable response.', {
      code: 'UPSTREAM_RESPONSE',
      status: 502
    });
  }
};

const publicResult = item => ({
  id: item.id,
  title: item.title,
  eyebrow: item.eyebrow,
  excerpt: item.excerpt,
  href: item.href
});

export const rerankEvidence = async ({
  query: rawQuery,
  evidence: rawEvidence,
  apiKey,
  model = DEFAULT_MODEL,
  endpoint = DEFAULT_ENDPOINT,
  fetchImpl = globalThis.fetch,
  signal
}) => {
  const query = normalizeQuery(rawQuery);
  const evidence = normalizeEvidence(rawEvidence);

  if (!apiKey) {
    throw new SearchError('Search is not configured.', {
      code: 'MISSING_API_KEY',
      status: 503
    });
  }
  if (typeof fetchImpl !== 'function') {
    throw new SearchError('Search is unavailable in this runtime.', {
      code: 'MISSING_FETCH',
      status: 500
    });
  }

  let response;
  try {
    response = await fetchImpl(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: `Find the strongest direct evidence for this portfolio question: ${query}`,
        documents: evidence.map(evidenceToDocument),
        model,
        top_k: Math.min(evidence.length, 12),
        return_documents: false,
        truncation: false
      }),
      signal
    });
  } catch (error) {
    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      throw new SearchError('The evidence search timed out. Please try again.', {
        code: 'UPSTREAM_TIMEOUT',
        status: 504
      });
    }
    throw new SearchError('The evidence search could not reach its provider.', {
      code: 'UPSTREAM_UNAVAILABLE',
      status: 502
    });
  }

  const payload = await parseJson(response);
  if (!response.ok) {
    const status = response.status === 429 ? 429 : 502;
    throw new SearchError(
      response.status === 429
        ? 'The evidence search is busy. Please wait a moment and try again.'
        : 'The search provider could not complete this request.',
      { code: 'UPSTREAM_ERROR', status }
    );
  }

  if (!Array.isArray(payload.data)) {
    throw new SearchError('The search provider returned an unexpected response.', {
      code: 'UPSTREAM_RESPONSE',
      status: 502
    });
  }

  const seenSlugs = new Set();
  const results = [];

  for (const match of payload.data) {
    const index = Number(match?.index);
    if (!Number.isInteger(index) || index < 0 || index >= evidence.length) continue;

    const item = evidence[index];
    if (seenSlugs.has(item.slug)) continue;
    seenSlugs.add(item.slug);
    results.push(publicResult(item));
    if (results.length === 3) break;
  }

  return results;
};

export const SEARCH_LIMITS = Object.freeze({ maxQueryLength: MAX_QUERY_LENGTH });
