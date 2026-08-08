# Shauna Brennan — AI-native PMM portfolio

An evidence-led portfolio for an AI-first Head of Product Marketing. The product experience is organized around three recruiter modes:

1. **SCAN ME** — a 30-second executive view.
2. **EXPLORE ME** — selected work and inspectable evidence.
3. **ASK ME** — a grounded text-agent prototype, structured for a future ElevenLabs voice agent.

## Why this is a dedicated repository

`shaunaleebrennan/ai-positioning-qa` is a focused PMM experiment and should remain one. This repository makes that project one proof point inside a broader portfolio narrative, while allowing the portfolio itself to demonstrate information architecture, content design, AI grounding, and product craft.

## Run locally

No build step or dependencies are required.

```bash
python3 -m http.server 4173
```

Open `http://localhost:4173`.

## Repository structure

```text
.
├── index.html                 # Three-layer product experience
├── styles.css                # Responsive visual system
├── app.js                    # Filters and grounded agent preview
├── content/portfolio.json    # UI content model
├── knowledge/portfolio.md    # RAG-ready canonical knowledge
└── docs/
    ├── INFORMATION_ARCHITECTURE.md
    └── EVIDENCE_REGISTER.md
```

## Evidence standard

This first version avoids invented metrics. Every proof point is labeled as one of:

- **Verified public artifact** — linked public evidence exists.
- **Named experience** — supplied by Shauna but supporting artifacts are pending.
- **Capability statement** — describes an approach, not a quantified outcome.

Before launch, replace placeholder contact details and complete the evidence register. Do not add performance metrics without a source.

## ElevenLabs integration path

The current dialog is a deterministic prototype that demonstrates grounded answer behavior and transparent abstention. A production integration can:

1. Ingest `knowledge/portfolio.md` plus approved case-study documents into an ElevenLabs knowledge base.
2. Configure the agent to cite evidence and abstain when sources do not support an answer.
3. Replace the local response function in `app.js` with the ElevenLabs client/voice widget.
4. Add consent, transcript retention, accessibility, and text fallback controls.

## Publishing

Suggested repository name: `shauna-ai-portfolio`  
Suggested description: `An AI-native, evidence-led portfolio for a Head of Product Marketing.`

Deploy as a static site on GitHub Pages, Vercel, Netlify, or Cloudflare Pages.
