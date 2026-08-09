# Shauna Brennan — AI Product Marketing Portfolio

An evidence-led, AI-native portfolio for Shauna Brennan, an AI Product Marketing leader specialising in positioning, go-to-market strategy, product launches, analyst relations, competitive displacement, and AI-enabled PMM.

**Live site:** [shaunaleebrennan.github.io/shauna-ai-portfolio](https://shaunaleebrennan.github.io/shauna-ai-portfolio/)

## Current experience

The site is designed around four ways to understand Shauna's work:

1. **Scan me** — a concise executive overview of positioning, AI-native GTM, PMM leadership, and category strategy.
2. **Explore the work** — a filterable, horizontally scrolling collection of six visual case studies.
3. **The full picture** — interactive tabs covering core competencies, recognition, and continuous learning, with links to verified certificates.
4. **Ask me** — a live ElevenLabs voice and text portfolio agent grounded in approved portfolio knowledge.

The hero also includes a downloadable CV and a continuously scrolling AI toolkit featuring GitHub, ZoomMate, Claude, Figma, Codex, Claude Code, Lovable, ElevenLabs, My Notes by Zoom, Gemini, ChatGPT, Replit, Clozd, HQ Agent, and hiresteve.ai.

## Selected work

Each project card links to a dedicated case-study page with context, challenge, strategic insight, Shauna's contribution, key decisions, outcome, and learning.

- **Workvivo HQ** — AI GTM and platform positioning
- **HQ Agent** — agent product launch and commercialisation
- **Seer** — people-intelligence GTM
- **Market leadership** — analyst relations and external validation
- **AI Product Strategy** — technical fluency and AI-enabled PMM workflows
- **The Meta Migration** — competitive displacement and migration GTM

Case-study content is driven from `content/portfolio.json`, so the homepage cards and expanded pages remain consistent.

## Evidence standard

The portfolio separates Shauna's contribution from company-level outcomes and avoids presenting unverified metrics as personal impact.

- Public artifacts are linked where available.
- Company outcomes are identified as company outcomes.
- Capability statements describe Shauna's approach without inventing results.
- Claims and supporting materials are tracked in `docs/EVIDENCE_REGISTER.md` and related evidence documents.

## Technology

This is a lightweight static site with no build step or package installation.

- Semantic HTML
- Responsive CSS with reduced-motion support
- Vanilla JavaScript modules
- JSON-driven portfolio and case-study content
- ElevenLabs Conversational AI widget
- Google Fonts: Manrope and DM Sans
- GitHub Pages hosting

## Run locally

The site loads JSON through JavaScript modules, so run it through a local web server rather than opening `index.html` directly:

```bash
python3 -m http.server 4173
```

Then open [http://localhost:4173](http://localhost:4173).

## Repository structure

```text
.
├── index.html                  # Main portfolio experience and live agent embed
├── case-study.html             # Reusable expanded case-study page
├── app.js                      # Homepage content, filters, carousel, and profile tabs
├── case-study.js               # Case-study routing and rendering
├── styles.css                  # Foundation styles
├── v2.css                      # Earlier visual refinements retained by the page
├── v3.css                      # Current design, carousel, toolkit, and tab refinements
├── case-study.css              # Expanded case-study styling
├── content/
│   └── portfolio.json          # Capabilities, projects, and case-study copy
├── knowledge/                  # Approved knowledge used to ground the portfolio agent
├── assets/
│   ├── evidence/               # Selected-work artwork
│   ├── toolkit/                # AI toolkit logos
│   ├── favicon.svg             # Portfolio orb favicon
│   └── Shauna-Azevedo-Brennan-CV.pdf
└── docs/                       # IA, evidence, inventory, and resume-discovery notes
```

## Content updates

- Edit homepage capabilities, project labels, summaries, and case studies in `content/portfolio.json`.
- Edit page-level headings, CTAs, profile tabs, certificates, toolkit order, and the ElevenLabs embed in `index.html`.
- Update the downloadable CV at `assets/Shauna-Azevedo-Brennan-CV.pdf` without changing the filename.
- Update agent source material in `knowledge/` and keep it aligned with approved public claims.
- Add visual refinements to `v3.css`; keep earlier stylesheets intact unless intentionally consolidating the CSS.

## Publishing

GitHub Pages publishes the repository root from the `main` branch. Changes made on a feature branch must be merged into `main` before they appear on the live site. After merging, allow GitHub Pages time to rebuild and hard-refresh the live page if an older version remains cached.

## Privacy and maintenance

The ElevenLabs experience is an external voice and text service. Any future changes to its configuration should preserve clear user initiation, accessible text interaction, appropriate transcript handling, and grounding against approved source material.
