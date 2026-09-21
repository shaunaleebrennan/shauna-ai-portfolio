# IT Pressure Test

[← All case studies and documents](../LIBRARY.md) · [View on the portfolio website](https://shaunaleebrennan.github.io/shauna-ai-portfolio/case-study.html?case=it-pressure-test)

**From a manual QA rubric to a buyer-focused decision aid**

Turning IT-buyer positioning judgment into a working tool: six audience lenses, source-linked diagnostics, and a practical rewrite brief.

**What this demonstrates:** Buyer insight, positioning systems, product judgment, AI-assisted prototyping, evaluation, and accountable human review.

## Context

Positioning reviews often produce broad opinions rather than specific, actionable questions. The original AI Positioning QA made a rubric inspectable, but asking reviewers to complete eight dimensions created too much work before they received useful feedback.

## The challenge

Make the review immediately useful for enterprise IT messaging while retaining traceability. A CIO, an architecture lead and an internal champion can read the same asset with different responsibilities; an awareness asset should not be judged as a procurement brief.

## Strategic insight

Start with the buyer’s remit and the job of the message. Surface the questions that matter next, show the source passages behind the diagnosis, and leave the claim and publication decision with a human.

## My contribution

- Defined the IT-buyer scope, review experience and evidence standard
- Directed AI-assisted prototyping in ChatGPT and implementation in Codex
- Shaped six audience lenses, distinct buying roles and stage-aware review guidance
- Pressure-tested scoring, source traceability, export behavior and input changes
- Integrated the live tool, documentation and visual identity into this portfolio

## Key decisions

- Separate awareness stage from purchase stage: what the reader knows differs from what the buying group is deciding
- Replace the manual-first interface with Gut Reaction, priority changes and buyer questions
- Keep deep review inside the app with matching passages and an editable rewrite brief
- Call the score language-signal coverage: it is not buyer readiness, factual verification or market validation
- Retain the original eight-dimension evaluator as a separate workflow rather than equating its score with the new six-gate model

## System architecture

- Static HTML and CSS provide the interface; vanilla JavaScript runs locally in the browser
- A pure evaluation module contains six IT profiles, three buying roles, purchase-stage weights and language checks
- The UI module renders source excerpts, prioritised questions, stage guidance and the rewrite brief
- Markdown export preserves the source, context, supplied proof and edited rewrite; the app makes no model or network calls
- The portfolio hosts a versioned copy of the public runtime, with a source commit and file hashes recorded in its manifest

## Tools & implementation

- ChatGPT for prototype iteration and Codex for integration, refactoring and checks
- Node’s test runner for deterministic scoring and export tests
- GitHub for version control and GitHub Pages for static hosting
- Generated case-study artwork; interface styling follows the portfolio palette

## Reliability & safeguards

- Supplied proof is displayed as unverified context and cannot inflate the score of the source copy
- Edits invalidate displayed results and exports; source HTML is escaped rather than executed
- Quoted passages preserve the original source whitespace
- No automatic saving, tracking or external model calls in the tool
- Private research attachments are not published; unsupported research percentages were withheld

## Evaluation

- 44 automated checks passed at integration, retaining the original evaluator tests
- New checks cover proof isolation, exact excerpts, export context and all 54 combinations of remit, buying role and purchase stage
- Browser checks covered example review, deep review, edited-brief export, escaped HTML, stale-result invalidation and the 390px mobile layout
- Keyword stuffing, negation and irrelevant evidence remain known limitations; independent human calibration and external model benchmarking have not been completed

## Outcome

A live IT messaging review that gives immediate, inspectable guidance and a reusable rewrite brief. The build demonstrates how positioning judgment can become a practical workflow. It does not establish commercial lift, buyer agreement or production-grade approval governance.

## What I learned

A useful review system must make its limits as visible as its recommendations. Simplifying the interface only helps if the evidence and the human decision remain clear.

## Evidence and supporting documents

Role and contribution statements are professional self-report unless a source independently confirms them. Company outcomes are shared results.

- **[Try IT Pressure Test](https://shaunaleebrennan.github.io/shauna-ai-portfolio/it-pressure-test/)** — Live interactive build. Choose an IT audience, buying role and stage; inspect the copy and run a deeper review in the tool.
- **[Inspect the implementation](https://github.com/shaunaleebrennan/ai-positioning-qa)** — Source repository. The original repository retains the build and evaluation history under its existing URL.
- **[Read the integration evaluation](https://github.com/shaunaleebrennan/ai-positioning-qa/blob/main/evals/it-buyer-integration-2026-09-21.md)** — Evaluation evidence. What was checked, what changed, and what keyword-based scoring cannot establish.

[Claims and sources](../docs/EVIDENCE_REGISTER.md) · [All supporting documents](../LIBRARY.md#supporting-documents)
