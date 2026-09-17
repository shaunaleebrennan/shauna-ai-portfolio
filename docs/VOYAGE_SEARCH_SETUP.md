# Voyage evidence search setup

The portfolio’s **Find the proof** module uses MongoDB Voyage AI to rerank a fixed, public evidence corpus. It returns sourced excerpts and links only; it does not generate new claims.

## Architecture

- GitHub Pages serves the static portfolio and `evidence-search.js`.
- Render runs the small Node service in `api/`.
- The Node service sends the visitor’s query and the fixed records in `content/search-evidence.json` to `rerank-3-lite`.
- `VOYAGE_API_KEY` stays in Render. It must never be added to the repository or browser code.

## Deploy

1. Create a MongoDB Voyage model API key in the MongoDB Atlas console. Choose the `any` geography for the default `https://ai.mongodb.com` endpoint. If you create an EU- or US-scoped key, change `VOYAGE_ENDPOINT` in Render to the geography-specific endpoint Atlas provides.
2. In Render, create a Blueprint from this GitHub repository. Render reads `render.yaml` from the repository root.
3. When prompted, enter the key as the secret `VOYAGE_API_KEY` environment variable.
4. Wait for `/health` to return `{ "ok": true }` on the Render service URL.
5. Set `data-search-endpoint` on `[data-proof-finder]` in `index.html` to the public Render endpoint, including `/api/search`.
6. Test one suggested query, then commit and push the endpoint change.

Example endpoint:

```html
data-search-endpoint="https://YOUR-RENDER-SERVICE.onrender.com/api/search"
```

## Local verification

From `api/`:

```bash
npm test
VOYAGE_API_KEY="your-local-key" npm start
```

From the repository root, serve the static site on an allowed local origin:

```bash
python3 -m http.server 8000
```

Open `http://127.0.0.1:8000/`. On localhost, the frontend automatically uses `http://127.0.0.1:3000/api/search` when no deployed endpoint is configured.

## Operating controls

- `ALLOWED_ORIGINS` is restricted to the GitHub Pages origin in production.
- `REQUESTS_PER_MINUTE` defaults to `3`, matching the MongoDB Voyage free-trial request limit. Increase it only when the account’s current rate limit supports that traffic.
- The free Render plan can take about a minute to wake after inactivity. The interface keeps the request alive and explains the delay; upgrade the service if first-search latency becomes important.
- Visitor queries are not written to application logs or analytics by this implementation.
- The UI warns visitors not to submit confidential information because queries are sent to the model provider for ranking.
- Change `VOYAGE_MODEL` in Render if moving from the preview `rerank-3-lite` model to another supported reranker.
