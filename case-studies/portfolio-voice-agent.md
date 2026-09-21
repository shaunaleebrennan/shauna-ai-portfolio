# Portfolio Voice Agent

[← All case studies and documents](../LIBRARY.md) · [View on the portfolio website](https://shaunaleebrennan.github.io/shauna-ai-portfolio/case-study.html?case=portfolio-voice-agent)

**Turning a résumé into an evidence-grounded conversation**

Designing a live voice and text portfolio agent with a custom voice persona, intent-routing workflow, evidence retrieval, guardrails, and systematic model and response testing.

**What this demonstrates:** Conversational AI, voice-persona design, prompt engineering, agent workflow design, intent routing, modular RAG, guardrails, model evaluation, test analysis, and web integration.

## Context

A static portfolio can show the work, but it cannot adapt to the question a recruiter, hiring manager, or technical stakeholder actually wants answered. Shauna designed a live ElevenLabs experience that lets visitors explore her career, case studies, technical builds, and working principles through voice or text. She also created a voice persona from her own voice and gave the agent a defined personality so the experience feels recognisably hers without pretending to be her.

## The challenge

The agent needed to be persuasive without becoming a hype machine. It had to answer broad career questions quickly, go deep on named projects, distinguish work Shauna built from products she marketed, link back to public evidence, and avoid turning company outcomes or technical fluency into unsupported personal claims.

## Strategic insight

A credible portfolio agent is a voice, context, workflow, and evaluation problem—not simply a prompt. Better answers came from defining the persona, separating durable rules from retrievable evidence, routing different intents to specialist answer modes, comparing model outputs, and analysing failures where attribution, role fit, or technical ownership could drift.

## My contribution

- Created a custom voice persona from her own recorded voice and defined its personality, tone, conversational style, and answer behaviour
- Engineered the system prompts, answer contract, evidence standard, and guardrails
- Designed a modular knowledge base around career, technical builds, case studies, learning, recognition, and a canonical claim ledger
- Built the workflow and intent-routing conditions for technical questions, case-study deep dives, career history, working style, and role-fit pressure tests
- Compared outputs from multiple models and analysed response quality, grounding, tone, and failure patterns
- Ran iterative manual and structured tests, then refined prompts, routes, knowledge, and response behaviour
- Documented procedures for how the agent handles common intents, evidence, uncertainty, testing, updates, and release review
- Integrated the ElevenLabs conversational widget into a responsive GitHub Pages portfolio
- Built a Node-based source pipeline that converts maintained Markdown into upload-ready HTML knowledge documents

## Key decisions

- Use voice and text as the interface, while keeping public case-study links as the evidence layer
- Keep compact identity and claim rules in always-on prompt context; retrieve longer case-study material only when relevant
- Route by visitor intent rather than forcing one general prompt to handle every conversation style
- Answer technical questions decisively with concrete build evidence, then add ownership boundaries only where they prevent a false inference
- Keep knowledge sources versioned privately, with a public system overview and integration code for visitors to inspect
- Treat live platform configuration and repository evidence as separate states; published files document the design but do not prove every console setting is active

## System architecture

- ElevenLabs Conversational AI provides the live voice and text runtime embedded through its web component
- A custom voice persona created from Shauna's own voice provides a consistent spoken identity, supported by defined personality and conversation rules
- A main-agent workflow coordinates specialist intent routes for career, technical evidence, case-study depth, working style, and fit assessment
- Two compact prompt documents hold identity, personality, answer policy, and claim controls in persistent context
- Nine focused knowledge documents are configured for RAG so the agent retrieves only the evidence relevant to the question
- A canonical claim ledger separates externally verified facts, public artifacts, self-reported experience, company context, and work still in progress
- Absolute portfolio and repository links let answers point visitors back to inspectable evidence

## Tools & implementation

- ElevenLabs Conversational AI for the agent runtime, custom voice persona, speech interface, workflow, model configuration, and knowledge retrieval
- Prompt engineering and conversation design for personality, response structure, routing, and behavioural boundaries
- Structured evaluation and qualitative analysis for comparing model outputs and finding recurring failure patterns
- HTML, CSS, and vanilla JavaScript for the portfolio and widget integration
- Markdown and structured front matter as the editable knowledge source
- Node.js for deterministic Markdown-to-HTML knowledge builds
- Git and GitHub for versioning, public evidence, and GitHub Pages deployment
- Codex and other AI development tools for implementation support, with Shauna retaining the product, content, and claim decisions

## Reliability & safeguards

- Third-person identity prevents the agent from impersonating Shauna
- Attribution rules distinguish products marketed, systems built, tools used, and concepts studied
- Hard claim rules block invented metrics, sole credit for company outcomes, and unsupported production-engineering claims
- Specialist routing reduces context collisions between technical proof, career history, project narratives, and role-fit assessment
- Public links and evidence labels make provenance visible instead of asking visitors to trust generated prose
- A bounded answer pattern keeps voice responses concise and avoids turning narrow questions into résumé recitations

## Evaluation

- Fifteen acceptance questions cover the most common recruiter and technical-review journeys
- A 13-question evaluation set tests positioning, technical evidence, ownership boundaries, unsupported claims, role-fit nuance, leadership, and concise voice responses
- Multiple model outputs were tested against comparable prompts to evaluate answer quality and trade-offs
- Repeated live voice and text tests exposed issues in tone, grounding, routing, concision, and claim boundaries
- Test analysis informed successive changes to prompts, model choices, workflow routes, knowledge sources, and guardrails
- Explicit pass criteria and documented procedures make review repeatable rather than purely subjective
- Knowledge documents carry version and review dates so content drift can be traced
- Repository checks can validate source completeness and regenerated HTML before the knowledge pack is uploaded
- Live conversational quality still requires manual testing in ElevenLabs after knowledge or workflow configuration changes

## Outcome

The result is a live, inspectable portfolio interface that demonstrates more than familiarity with AI tools. It shows Shauna's ability to shape a voice persona, engineer prompts, build an intent-routing workflow, configure retrieval and guardrails, compare model behaviour, analyse tests, and translate the technical decisions into a clear professional story. The agent runs on ElevenLabs; Shauna designed, configured, tested, documented, and integrated the experience rather than engineering the underlying voice models or platform runtime.

## What I learned

The quality of an agent is shaped less by the cleverness of one prompt than by the discipline of its context, routing, evidence, evaluation, and boundaries.

## Evidence and supporting documents

Role and contribution statements are professional self-report unless a source independently confirms them. Company outcomes are shared results.

- **[Read the system overview](../docs/PORTFOLIO_VOICE_AGENT_CASE_STUDY.md)** — Technical document. Voice persona, workflow, knowledge design, guardrails, and evaluation framework.
- **[Try the portfolio agent](https://shaunaleebrennan.github.io/shauna-ai-portfolio/index.html#ask)** — Live interface. Ask a career or technical question through the embedded ElevenLabs agent.
- **[Inspect the portfolio source](https://github.com/shaunaleebrennan/shauna-ai-portfolio)** — Source repository. Public integration code; private prompts, routing configuration, and detailed test records are excluded.

[Claims and sources](../docs/EVIDENCE_REGISTER.md) · [All supporting documents](../LIBRARY.md#supporting-documents)
