# Portfolio Voice Agent — system overview

Portfolio Voice Agent is the live voice and text agent embedded in this portfolio. It is designed to help recruiters, hiring managers, and technical stakeholders explore Shauna Brennan's work through focused questions rather than a fixed résumé journey.

## Voice persona and conversation design

Shauna created a custom voice persona from recordings of her own voice, then defined the agent's personality, tone, conversational style, and answer behaviour. The aim was to make the experience feel recognisably hers while keeping a clear boundary: the agent speaks about Shauna and does not pretend to be her.

This required more than selecting a voice. Shauna engineered prompts for how the agent should introduce evidence, handle uncertainty, stay concise in spoken answers, and adapt to different visitor intents. She tested multiple model outputs and refined the personality and prompt structure based on how each configuration handled tone, grounding, nuance, and claim boundaries.

## System design

- **Runtime and interface:** ElevenLabs Conversational AI provides the voice and text runtime. Its web component is integrated into the static portfolio.
- **Voice and personality:** A custom voice persona, personality prompt, and conversation rules create a consistent spoken experience.
- **Intent-routing workflow:** Different question types are routed to focused answer modes covering career history, technical experience, case-study depth, working style, and role-fit pressure tests.
- **Knowledge architecture:** Compact identity and claim rules stay in persistent context. Longer career and case-study documents are retrieved only when relevant.
- **Evidence layer:** Answers can link back to public portfolio case studies, repositories, and external sources.
- **Source workflow:** Knowledge is maintained as versioned Markdown and converted into upload-ready HTML through a small Node.js build script.
- **Documented procedures:** Repeatable procedures define how the agent handles common intents, evidence, uncertainty, and boundaries, alongside knowledge maintenance, test execution, and release review.

## Reliability and claim controls

The agent is designed to advocate with evidence rather than declare Shauna perfect for every role.

- It speaks about Shauna in the third person rather than impersonating her.
- It distinguishes products she marketed, systems she built, tools she used, and concepts she studied.
- It separates externally verified facts, public artifacts, self-reported experience, company context, and work still in progress.
- It does not invent metrics or attribute company growth, analyst recognition, customer outcomes, or production engineering solely to Shauna.
- It keeps voice answers concise and links visitors to inspectable evidence where possible.
- Prompt-level behavioural rules, workflow routing, retrieval boundaries, and a canonical claim ledger work together as guardrails rather than relying on one generic safety instruction.

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

Evaluation was iterative rather than a one-off checklist. Shauna ran repeated voice and text tests, analysed recurring issues, and compared multiple model outputs against comparable prompts. The results informed changes to model selection, prompt structure, personality, routing conditions, knowledge sources, answer length, and guardrails.

## Tools and skills demonstrated

ElevenLabs Conversational AI · custom voice persona · conversation design · personality design · prompt engineering · agent workflow design · intent routing · modular RAG · context engineering · knowledge architecture · guardrails · model evaluation · test analysis · operating procedures · HTML · CSS · JavaScript · Node.js · Git · GitHub Pages

## Ownership boundary

Shauna created the voice persona, defined the personality, engineered the prompts and guardrails, built the intent-routing workflow, structured the knowledge, compared model outputs, analysed tests, documented the procedures, and integrated the portfolio-agent experience. ElevenLabs provides the underlying models, speech technology, orchestration platform, and runtime.
