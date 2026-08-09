# Shauna Azevedo-Brennan — AI Product Marketing Portfolio

An evidence-led, AI-native portfolio for Shauna Brennan, an AI Product Marketing leader specialising in positioning, go-to-market strategy, product launches, analyst relations, competitive displacement, and AI-enabled PMM.

**Live site:** [shaunaleebrennan.github.io/shauna-ai-portfolio](https://shaunaleebrennan.github.io/shauna-ai-portfolio/)

## Current experience

The site is designed around four ways to understand Shauna's work:

1. **Scan me** — a concise executive overview of positioning, AI-native GTM, PMM leadership, and category strategy.
2. **Explore the work** — a filterable, horizontally scrolling collection of six visual case studies.
3. **The full picture** — interactive tabs covering core competencies, recognition, and continuous learning, with links to verified certificates.
4. **Ask me** — a live ElevenLabs voice and text portfolio agent grounded in approved portfolio knowledge.

The hero also includes a downloadable CV and a continuously scrolling AI toolkit featuring GitHub, ZoomMate, ChatGPT-Live, Claude, Figma, Codex, Claude Code, Lovable, ElevenLabs, My Notes by Zoom, Gemini, OpenAI, Replit, Clozd, HQ Agent, and hiresteve.ai.

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

## ElevenLabs portfolio agent

### What it is

The **Ask me** experience is a live ElevenLabs Conversational AI agent that lets visitors explore the portfolio through voice or text. It is intended to make the work easier to interrogate: visitors can ask about Shauna's experience, positioning approach, AI workflows, or the evidence behind a project instead of relying only on page navigation.

The agent is an additional way to explore the portfolio, not a replacement for the written case studies or downloadable CV.

### How it works

1. `index.html` includes the `<elevenlabs-convai>` web component and loads ElevenLabs' hosted widget script from `unpkg.com`.
2. The component connects the site to the configured ElevenLabs agent using its public agent ID.
3. The floating control in the bottom-right lets a visitor begin a text or voice conversation. Voice use requires the visitor to grant microphone permission; the rest of the portfolio does not.
4. ElevenLabs runs the conversation and generates responses using the agent instructions and knowledge configured in the ElevenLabs workspace.
5. The agent should answer from approved portfolio material and avoid inventing evidence, metrics, or responsibilities that the source material does not support.

The static site contains no ElevenLabs API key. The public agent identifier and widget presentation settings are declared in `index.html`.

### Grounding and source material

The `knowledge/` directory contains the approved portfolio material maintained alongside the site, including the central portfolio knowledge base and supporting case-study documents. These files provide a reviewable source for the agent's approved claims.

Repository files do **not** automatically sync to ElevenLabs. When the knowledge files change, the corresponding knowledge-base content and agent instructions must also be updated in the ElevenLabs workspace. The website and agent should be reviewed together so that neither experience contains stale or unsupported claims.

### Configuration and maintenance

- **Widget placement and copy:** edit the `<elevenlabs-convai>` attributes near the bottom of `index.html`.
- **Agent behaviour, voice, model, tools, and knowledge base:** manage these in the ElevenLabs workspace connected to the configured agent.
- **Approved portfolio knowledge:** maintain the source documents in `knowledge/`, then manually sync approved changes to ElevenLabs.
- **Visual styling:** the widget uses ElevenLabs' embedded interface; the surrounding Ask me section and handoff copy are styled by the site's CSS.
- **Testing:** verify both text and voice modes, grounding, microphone permission, mobile behaviour, and clear recovery when the agent cannot support an answer.

Because conversations are handled by an external service, transcript retention, consent, access, and deletion behaviour should be reviewed in the ElevenLabs workspace and kept aligned with the site's privacy expectations. Do not place secrets, private customer information, or unapproved evidence in the public repository or agent knowledge base.

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
├── knowledge/                  # Reviewable source material for the portfolio agent
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
- Update agent source material in `knowledge/`, then manually sync approved changes to the ElevenLabs knowledge base.
- Add visual refinements to `v3.css`; keep earlier stylesheets intact unless intentionally consolidating the CSS.

## Publishing

GitHub Pages publishes the repository root from the `main` branch. Changes made on a feature branch must be merged into `main` before they appear on the live site. After merging, allow GitHub Pages time to rebuild and hard-refresh the live page if an older version remains cached.

## Privacy and maintenance

The ElevenLabs experience should preserve clear user initiation, an accessible text alternative, appropriate transcript handling, and grounding against approved source material. Treat the website and remote agent configuration as two connected surfaces that must be maintained together.
