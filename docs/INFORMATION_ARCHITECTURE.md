# Portfolio structure

The portfolio supports three visitor journeys: a quick career overview, direct inspection of the work, and a focused conversation with the portfolio agent.

## Start with the overview

The [homepage](../index.html) introduces Shauna’s positioning, career, capabilities, recognition, and learning. The CV provides a downloadable résumé.

## Explore the work

The [case-study and knowledge library](../library.html) lists all seven case studies together. Each case study separates context, challenge, strategic insight, contribution, decisions, outcome, learning, and supporting evidence. Technical sections appear where relevant.

Every case study has section navigation, direct supporting links, a route back to the library, and a next case study. Sources distinguish public product context, professional self-report, public builds, campaign artifacts, and external company recognition.

## Read supporting documents

Public knowledge notes explain career context and the HQ and Listening Gap narratives. Technical notes cover the Voice Agent and the evidence-search implementation. The evidence register and artifact inventory explain what each source supports. The evidence backlog records gaps without turning them into claims.

Readable HTML pages are generated from an explicit allowlist in `content/library.json`. Markdown remains the editable source. Private prompts, operational knowledge, routing configuration, and detailed tests are excluded from the public library.

## Ask a focused question

The [portfolio agent](../index.html#ask) provides an additional route into the evidence through voice or text. Case studies and documents remain accessible without using the agent.

## Maintaining the library

Edit the public Markdown source or `content/portfolio.json`, then run `npm ci`, `npm run build`, and `npm run check`. Commit the generated `library.html` and `documents/` pages alongside their source changes. GitHub Pages serves these static files without requiring a runtime Markdown renderer.

Do not add private source directories to the document allowlist. Adding a new document does not authorise publication of private material referenced inside it.
