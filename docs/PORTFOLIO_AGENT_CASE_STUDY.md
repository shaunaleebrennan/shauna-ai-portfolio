# Shauna, Decoded — portfolio agent system

Shauna, Decoded is the live voice and text agent embedded in this portfolio. It is designed to help recruiters, hiring managers, and technical stakeholders explore Shauna Brennan's work through focused questions rather than a fixed résumé journey.

## System design

- **Runtime and interface:** ElevenLabs Conversational AI provides the voice and text runtime. Its web component is integrated into the static portfolio.
- **Intent routing:** Different question types are routed to focused answer modes covering career history, technical experience, case-study depth, working style, and role-fit pressure tests.
- **Knowledge architecture:** Compact identity and claim rules stay in persistent context. Longer career and case-study documents are retrieved only when relevant.
- **Evidence layer:** Answers can link back to public portfolio case studies, repositories, and external sources.
- **Source workflow:** Knowledge is maintained as versioned Markdown and converted into upload-ready HTML through a small Node.js build script.

## Reliability and claim controls

The agent is designed to advocate with evidence rather than declare Shauna perfect for every role.

- It speaks about Shauna in the third person rather than impersonating her.
- It distinguishes products she marketed, systems she built, tools she used, and concepts she studied.
- It separates externally verified facts, public artifacts, self-reported experience, company context, and work still in progress.
- It does not invent metrics or attribute company growth, analyst recognition, customer outcomes, or production engineering solely to Shauna.
- It keeps voice answers concise and links visitors to inspectable evidence where possible.

## Evaluation framework

The maintained evaluation set contains 13 questions with explicit pass criteria. Together they test:

1. General orientation without target-role leakage.
2. Evidence of positioning and category strategy.
3. Technical depth and hands-on AI building.
4. Applied AI-tool knowledge rather than a logo list.
5. Transfer and gaps for a developer-focused product role.
6. Regional and enterprise Product Marketing evidence.
7. New-category AI product judgment.
8. Seller-enablement evidence.
9. Strategy and people leadership.
10. Honest discussion of experience gaps.
11. Attribution of company growth.
12. Resistance to unsupported technical claims.
13. Natural, concise spoken delivery.

Fifteen acceptance questions provide an additional release checklist across career history, technical products, hands-on builds, retrieval architecture, case-study ownership, externally verified outcomes, and project status.

## Tools and skills demonstrated

ElevenLabs Conversational AI · voice UX · agent workflow design · intent routing · modular RAG · context engineering · knowledge architecture · prompt design · claim governance · evaluation design · HTML · CSS · JavaScript · Node.js · Git · GitHub Pages

## Ownership boundary

Shauna designed, configured, tested, documented, and integrated the portfolio-agent experience. ElevenLabs provides the underlying models, speech technology, orchestration platform, and runtime.
