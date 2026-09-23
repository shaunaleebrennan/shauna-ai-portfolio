import { awarenessIndicator } from "./awareness.js";
import { ITRubric } from "./it-rubric.js?v=3.2";

const profiles={general:{name:"Enterprise IT (general)",role:"enterprise IT stakeholder whose remit is not yet known",summary:"A broad IT review lens for early messaging when the exact reader is unknown.",cares:"the real work problem, the value of changing course, how the offer fits the current stack, manageable risks and evidence proportionate to the promise",voice:"pragmatic and open to a clearer case, without assuming a CIO, security or workplace remit",questions:{relevance:"Which IT or employee problem is this solving, and why now?",value:"What improves for the organisation, and how would we tell?",fit:"Where does this sit alongside the tools we already run?",trust:"What new risks, controls and responsibilities would this introduce?",proof:"What evidence supports the main claim for an organisation like ours?",clarity:"Could I explain what this does and why it matters to another stakeholder?"}},executive:{name:"CIO / Executive IT",role:"enterprise IT executive",summary:"Sets technology direction and carries accountability for enterprise value, resilience and long-term system health.",cares:"business outcomes, system-wide impact, investment priorities, vendor risk, cost predictability, stakeholder alignment and a credible path from purchase to value",voice:"strategic, commercially accountable and sceptical of isolated solutions or short-term promises",questions:{relevance:"What business pressure makes this a priority now, and what happens if we do nothing?",value:"Can I defend the investment to the CEO, CFO and business leaders?",fit:"How does this affect the wider technology ecosystem over the next three to five years?",trust:"What delivery, governance and vendor risks am I accepting?",proof:"What independent and peer evidence reduces the risk of this decision?",clarity:"Can I explain the decision and its consequences in one sentence?"}},ai:{name:"AI Transformation / Automation",role:"enterprise AI transformation leader",summary:"Turns AI ambition into governed use cases, measurable adoption and an operating model the organization can scale.",cares:"use-case value, governed access, trusted data, workflow integration, employee adoption, outcome measurement, model and vendor controls, and responsible expansion",voice:"ambitious about AI but disciplined about risk, adoption and demonstrable business impact",questions:{relevance:"Which recurring work problem is important enough for AI to solve?",value:"Are we measuring completed work and business impact, or merely AI activity?",fit:"How does this connect to approved data, systems, models and existing AI investments?",trust:"Who controls access, prompts, actions, data use and model behavior?",proof:"What pilot evidence shows trusted repeat use and measurable value?",clarity:"Is this a bounded enterprise use case or an open-ended AI promise?"}},workplace:{name:"Digital Workplace / Employee Technology",role:"digital workplace leader",summary:"Owns the employee technology experience across collaboration, communication, knowledge and everyday work.",cares:"employee adoption, intuitive access, fewer destinations, coexistence with existing productivity tools, frontline and desk-worker reach, change management, service demand and experience consistency",voice:"employee-centered but pragmatic about platform sprawl, administration and adoption burden",questions:{relevance:"Which employee journey is fragmented or failing today?",value:"Will this reduce friction, support demand or unused technology investment?",fit:"Does it simplify the employee experience while coexisting with our current stack?",trust:"Can IT manage the experience consistently across roles, locations and devices?",proof:"What adoption and workflow evidence exists for a workforce like ours?",clarity:"Will employees understand where this fits and why they should use it?"}},architecture:{name:"Enterprise Architecture / Platform Strategy",role:"enterprise architect or platform strategist",summary:"Protects architectural coherence and evaluates how a new capability changes dependencies, integration and technical debt.",cares:"interoperability, identity, data flows, system boundaries, extensibility, lifecycle risk, consolidation, implementation dependencies and future replacement",voice:"systemic, technically rigorous and resistant to point solutions presented in isolation",questions:{relevance:"Which architectural constraint or capability gap does this address?",value:"What complexity, duplication or technical debt does this remove?",fit:"What connects to what, through which standards, and with which dependencies?",trust:"How are permissions, failure modes, data boundaries and lifecycle risks handled?",proof:"Show me the architecture, integration depth, performance limits and implementation evidence.",clarity:"Can I place this precisely in the target architecture?"}},security:{name:"Security, Risk & Compliance",role:"security, risk or compliance leader",summary:"Defines acceptable risk and can stop a purchase that lacks credible controls, evidence or accountability.",cares:"identity, least-privilege access, privacy, data residency, retention, auditability, regulatory fit, third-party risk, incident response and AI governance",voice:"evidence-led, control-focused and unwilling to accept broad assurances without mechanisms",questions:{relevance:"Which current risk does this reduce, and which new risks does it introduce?",value:"Does the control improvement justify the residual risk and operational cost?",fit:"How does this integrate with identity, policy, monitoring and existing security controls?",trust:"Where does data go, who can access it, what is retained and what is auditable?",proof:"Which certifications, control evidence, test results and contractual commitments apply?",clarity:"Are capabilities, boundaries and exceptions stated precisely?"}},operations:{name:"IT Operations / Service Management",role:"IT operations or service management leader",summary:"Must deploy, operate and support the technology without creating fragile services or avoidable workload.",cares:"reliability, administration, implementation effort, support coverage, service performance, migration, training, incident handling, ticket demand and predictable cost",voice:"practical, service-oriented and alert to the operational burden hidden behind a polished demo",questions:{relevance:"Which recurring service or operational problem does this remove?",value:"Will it reduce support demand, resolution time or operating cost?",fit:"How does it work with service management, identity and operational workflows?",trust:"What are the SLA, support, recovery, escalation and administrative controls?",proof:"What happened during real deployments, including problems and recovery?",clarity:"What will my team have to implement, own and support?"}}};
const buyingRoles={unknown:{name:"Role not yet known",summary:"The reader's role in the decision is unclear, so keep the first argument useful across IT stakeholders."},owner:{name:"Decision owner",summary:"Must make the final recommendation and defend value, risk and strategic fit across the executive team."},champion:{name:"Driver / internal champion",summary:"Builds consensus, translates the solution for stakeholders and needs practical material for the internal business case."},influencer:{name:"Technical influencer / gatekeeper",summary:"Defines requirements, verifies claims and can remove an option that fails technical, security or operational scrutiny."}};
const buyerFocus={general:'fit',executive:'value',ai:'trust',workplace:'fit',architecture:'fit',security:'trust',operations:'trust'};

const goals=Object.fromEntries(Object.entries(ITRubric.stages).map(([id,stage])=>[id,{...stage,required:Object.keys(stage.weights).filter(k=>stage.weights[k]>0)}]));
const dims = {
  "relevance": {
    "name": "Recognisable pressure"
  },
  "value": {
    "name": "Business value"
  },
  "fit": {
    "name": "Stack fit"
  },
  "trust": {
    "name": "Trust and governance"
  },
  "proof": {
    "name": "Credibility and proof"
  },
  "clarity": {
    "name": "Clarity and repeatability"
  }
};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

function analyse(d) {
  const audit=ITRubric.assess(d),base=ITRubric.stages[d.goal];
  return {...d,audit,total:audit.total,scores:Object.fromEntries(Object.entries(audit.rows).map(([k,v])=>[k,v.level])),
    ranked:audit.ranked,rule:{label:base.label,weights:audit.weights,required:Object.keys(audit.weights).filter(k=>audit.weights[k]>0)},
    ai:/\b(ai|agent|copilot|llm)\b/i.test(d.message),profile:profiles[d.persona]};
}
function splitSentences(t){return ITRubric.passages(t);}
function evidenceFor(r,id){return r.audit.rows[id].quote;}
function evidenceStatus(r){return r.audit.status;}
function verdict(r){return [r.audit.label,'An automated estimate of message structure for this stage. It does not establish buyer response or verify claims.'];}
function react(r) {
  const gaps=r.ranked.filter(id=>r.scores[id]<3);
  const role={unknown:'I need to see why this belongs in an IT evaluation.',owner:'I need to defend this decision.',champion:'I need to make the case internally.',influencer:'I need to check the practical requirements.'}[r.buyingRole]||'I need to assess this.';
  const focus=buyerFocus[r.persona]||'value';
  if(!gaps.length) return `${role} The structure gives me a starting point. My additional check: ${r.profile.questions[focus]}`;
  const followup=gaps[1]===focus?gaps[1]:focus;
  return `${role} My first question: ${r.profile.questions[gaps[0]]}${followup!==gaps[0]?` I would also ask: ${r.profile.questions[followup]}`:''}`;
}

function rewriteBrief(r){const evidence=Object.fromEntries(Object.keys(dims).map(id=>[id,evidenceFor(r,id)||"[MISSING]" ])),later=r.goal==="attention"?"Save detailed architecture, controls, implementation and commercial terms for evaluation content.":r.goal==="shortlist"?"Prepare implementation, pricing, contractual and support detail for the commit stage.":"No major decision criterion should remain implicit at commit stage.";return`REWRITE BRIEF

Audience: ${r.profile.name}
Buying role: ${buyingRoles[r.buyingRole].name}
Awareness stage: ${r.awareness} — ${awarenessIndicator(r.awareness)}
Purchase stage: ${r.rule.label}
Asset: ${r.assetType}
Scoring scope: ${r.audit.method}
Buyer focus for follow-up: ${r.profile.questions[buyerFocus[r.persona]||'value']}

1. OPEN IN THE BUYER'S WORLD
Name the pressure, failed workflow or system consequence that makes action necessary.
Detected passage (review meaning): ${evidence.relevance}

2. MAKE THE VALUE INTERNALLY DEFENSIBLE
Connect the outcome to cost, risk, productivity, adoption or service performance. Name who benefits and how IT will measure it.
Detected passage (review meaning): ${evidence.value}

3. DEFINE THE SYSTEM ROLE
State what the offer connects to, replaces, consolidates or leaves in place. Make dependencies visible.
Detected passage (review meaning): ${evidence.fit}

4. MAKE TRUST A MECHANISM
Use specific controls, boundaries, implementation realities and ownership. Avoid unsupported adjectives.
Detected passage (review meaning): ${evidence.trust}

5. ADD PROOF PROPORTIONATE TO THE PROMISE
Use approved customer, pilot, performance, independent or implementation evidence. If proof is unavailable, narrow the claim.
Detected passage (review meaning): ${evidence.proof}

RECOMMENDED MESSAGE ORDER (use only the parts this format can carry)
[Recognisable problem and consequence]
[Point of view on why the current approach falls short]
[Outcome and distinctive mechanism]
[Role in the existing technology ecosystem]
[Trust or delivery mechanism relevant to this stage]
[Approved proof, or PROOF NEEDED]
[Low-risk next step]

STAGE BOUNDARY
${later}`}


const points=n=>Number(n.toFixed(2)).toString();
function summary(r){
  const criteria=Object.entries(r.audit.rows).map(([id,x])=>`- **${dims[id].name}:** ${x.weight?`${x.level}/4; ${points(x.points)}/${x.weight} points. ${x.reason}`:'Not required for this format and stage.'}${x.weight&&x.quote?`\n  Passage: “${x.quote}”`:''}`).join('\n');
  return `# IT buyer positioning pressure test

**Messaging score:** ${r.total}/100 — ${r.audit.label}
**Rubric:** ${r.audit.version}; automated structural estimate, not buyer validation.
**Proof status:** ${r.audit.status}
${r.audit.criticalClaims.length?'**Claim review required:** '+r.audit.criticalClaims.map(c=>c.quote).join(' | ')+'\n':''}
**IT audience:** ${r.profile.name}
**Buying role:** ${buyingRoles[r.buyingRole].name}
**Awareness stage:** ${r.awareness}
**Purchase stage:** ${r.rule.label}
**Asset:** ${r.assetType}
**Market focus:** ${r.region} (context only)
**Solution context:** ${r.solution||'Not supplied'}
**Alternatives:** ${r.alternatives||'Not supplied'}
**Supplied proof (unverified):** ${r.proof||'Not supplied'}

## Gut Reaction

Composite buyer prompt, not customer testimony.

> ${react(r)}

## Priority changes

${r.ranked.slice(0,3).map(id=>`- **${dims[id].name}:** ${r.audit.rows[id].next}`).join('\n')||'No structural gaps detected; verify meaning and evidence.'}

## Why this score?

${criteria}

Formula: sum(level / 4 × format-and-stage weight), rounded once. Weights and thresholds are editorial; scores are not calibrated against buyer outcomes. Supplied proof does not earn points. Compare drafts under the same rubric, stage and format. The buyer remit changes feedback, not points. A contrast in the text does not establish real-world differentiation; competitor content is not tested. Small point differences have no validated significance. Local rules can miss nuance, negation, unusual wording and relationships between passages.

## Source message

${r.message}

## Rewrite brief

${rewriteBrief(r)}
`;
}
export {profiles,buyingRoles,buyerFocus,goals,dims,esc,analyse,react,verdict,evidenceFor,evidenceStatus,rewriteBrief,summary,splitSentences};
