// Editorial hypotheses are separate from evidence and from the original scoring engine.
export const sources = [
  {name:'Atomic — How IT Leaders Actually Buy Tech', url:'https://atomic.ie/how-it-leaders-actually-buy-tech/', scope:'Buyer-research basis: system fit, realistic delivery, internal consensus and post-purchase support. Interviews cover Europe and North America; this is not proof of HQ outcomes or a regional scoring model.'},
  {name:'Forrester — Understanding B2B Buyer Roles', url:'https://www.forrester.com/report/understanding-b2b-buyer-roles-is-the-key-to-navigating-buying-groups/RES173037', scope:'Public research summary: buying roles and their involvement vary across purchase scenarios. The full report is gated; no survey percentages are reproduced here.'},
  {name:'Workvivo — HQ product overview', url:'https://www.workvivo.com/hq/', scope:'Vendor product context for HQ, HQ Agent and Seer. Marketing descriptions do not independently establish customer outcomes, integration scope or comparative superiority.'},
  {name:'Workvivo — Seer', url:'https://www.workvivo.com/seer/', scope:'Vendor context for employee listening, manager insights, action planning and Advanced Analytics. Applying listening to AI change is a suggested use case, not a validated transformation result.'},
  {name:'Workvivo — AI overview', url:'https://support.workvivo.com/hc/en-gb/articles/25076159425309-Workvivo-AI-Overview', scope:'Explains AI-generated summaries of platform analytics and Seer feedback. These summaries are distinct from measurement of AI usage.'},
  {name:'Workvivo — Product packages', url:'https://www.workvivo.com/pricing/', scope:'Lists HQ Agent AI usage analytics. Confirm current entitlements, reporting fields and access for the proposed customer scenario. Public pages checked 23 September 2026.'}
];
export const measurement = {
  positioning:'Lead with the IT problem and the HQ / HQ Agent use case. Seer is an optional supporting differentiator: involve HR / People and managers to understand how change is landing and act on feedback.',
  layers:[
    {name:'Analytics and Advanced Analytics', signal:'Inspect platform activation, use and content engagement, with deeper analysis where available.', question:'Is the rollout reaching employees, and where does engagement drop?', limit:'Platform activity does not establish useful AI use or task success. Confirm the available reports and package.'},
    {name:'AI usage insights', signal:'Use supported HQ Agent AI usage analytics to examine uptake.', question:'What does the available usage reporting tell us about this AI rollout?', limit:'Confirm event definitions, reporting coverage and time period. Do not assume visibility into every AI tool, task completion or answer quality. AI-generated analytics summaries are not the same as AI usage measurement.'},
    {name:'Seer: sentiment and change insights', signal:'Use employee listening, comment themes and manager action planning to investigate confidence, friction and support needs.', question:'How are employees experiencing the change, and what should we improve?', limit:'This is a suggested application of listening, not a dedicated AI-transformation score or proof of causation. Agree suitable questions and confidentiality/access arrangements with HR / People; do not infer individual sentiment from usage.'},
    {name:'Operational and financial evidence', signal:'Combine relevant service, task-quality and cost data with the above signals.', question:'Did work improve enough to justify the investment?', limit:'Record a baseline, cohort, time period, comparison and full costs. Usage and sentiment alone do not prove ROI.'}
  ],
  next:'For one AI use case, agree an IT owner, a People partner and an operational outcome. Review uptake and employee feedback, choose an improvement, name its owner, communicate what changed and reassess. Check whether the operational outcome moved too.',
  boundary:'Use these as complementary evidence sources. Do not promise a single joined dashboard, automatic data correlation or included entitlements without confirming the implementation.'
};
export function measurementText() {
  return `### Measurement: use, experience and outcomes\n\n${measurement.positioning}\n\n${measurement.layers.map(l=>`- ${l.name}: ${l.signal}\n  Ask: ${l.question}\n  Boundary: ${l.limit}`).join('\n\n')}\n\nNext step: ${measurement.next}\n\n${measurement.boundary}\n`;
}
export const angles = {
  general: {label:'Employee experience across the existing stack',
    opening:'Where does the employee journey break across the systems you already own?',
    bridge:'Explore HQ as a shared employee experience for communication, knowledge and services. Introduce HQ Agent where a supported answer-to-action journey addresses a confirmed gap.',
    evidence:'Map the current journey, its failure point, the systems retained, implementation effort and a measurable outcome.',
    challenge:'Would improving navigation, content or an existing platform solve this with less cost and change?',
    offer:'A one-journey experience map',test:'Compare the current route with the proposed route using the same task and employee group.'},
  proof: {label:'Proof of progress',
    opening:'What changed in employees’ work after the AI rollout—and what can you demonstrate?',
    bridge:'Combine Analytics and Advanced Analytics for platform engagement, HQ Agent AI usage insights for uptake, and optional Seer listening for the experience of change. Test progress against operational and financial outcomes; none of these signals alone establishes AI ROI.',
    evidence:'Record baseline, cohort, time period, task outcome, costs, comparison and other changes that could explain the result.',
    challenge:'Could usage or sentiment improve while task quality, service outcomes or cost remain unchanged?',
    offer:'A progress-and-evidence worksheet',test:'Ask an IT sponsor and a business owner whether the evidence supports the same investment decision.'},
  adoption: {label:'Useful adoption and change',
    opening:'AI is available. Where does useful repeat use stall?',
    bridge:'Explore how HQ communication, guidance and community could support change, with HQ Agent for relevant tasks, analytics for engagement and AI uptake, and optional Seer listening for sentiment and change insights with HR / People. Use communicate → guide → act → listen → improve as a planning framework, not a proven causal model.',
    evidence:'Check access, task relevance, source quality, training, trust and support. Compare employee groups and record the intervention and outcome.',
    challenge:'Is the main barrier poor data, a weak use case or missing training rather than the place AI is accessed?',
    offer:'An adoption-barrier diagnostic',test:'Test the suspected barrier with employees before proposing another destination or rollout.'},
  cost: {label:'Cost and investment decisions',
    opening:'Which AI use cases merit more investment, which need changes, and which should stop?',
    bridge:'Connect a scoped HQ or HQ Agent use case to value and ownership. HQ is not positioned here as an AI spend-management system; any budget case needs operational and finance data.',
    evidence:'Use comparable licence, usage, integration, administration, training and support costs, with baseline outcomes and a named decision owner.',
    challenge:'Is extending what the organisation already owns cheaper and sufficient once all ongoing costs are included?',
    offer:'A fund, refine or stop decision worksheet',test:'Compare build, buy, extend and retain-current options on the same scope and time horizon.'},
  frontline: {label:'Frontline access and usefulness',
    opening:'Can employees away from desks complete this task on the devices and time they actually have?',
    bridge:'Explore HQ’s employee experience for a specific workforce group, then validate HQ Agent’s required knowledge and actions. Access must work before repeat use can be evaluated.',
    evidence:'Confirm devices, sign-in, third-party licences, connectivity, languages, shift conditions, permissions and the exact supported workflow.',
    challenge:'Can the existing mobile or service experience already meet these needs? Are access constraints unresolved regardless of vendor?',
    offer:'A frontline task-readiness checklist',test:'Observe representative employees attempt the task under their normal working conditions.'},
  architecture: {label:'Build, buy or extend',
    opening:'Should you extend your existing stack or add an employee experience layer?',
    bridge:'Place HQ at the employee entry point and HQ Agent only at validated retrieval or action steps. Keep systems of record and workflow ownership explicit.',
    evidence:'Provide a journey and data-flow diagram, identity boundaries, connector depth, failure recovery, implementation effort and ongoing maintenance ownership.',
    challenge:'Does adding HQ remove employee friction or introduce an unnecessary dependency? Where is the existing estate already enough?',
    offer:'A build, buy and extend comparison',test:'Have the architect compare the same journey across options, including a hybrid approach and doing nothing.'},
  selfservice: {label:'Question to resolution',
    opening:'Why does this recurring request still reach a person after employees try self-service?',
    bridge:'Explore the HQ Agent journey from finding information to an answer and a supported next action, within HQ. Diagnose the broken step first.',
    evidence:'Trace one request through source, answer, action and confirmation. Measure resolution quality, repeat contacts and escalation—not just ticket deflection.',
    challenge:'Would better content or a simpler existing form solve the problem without an agent?',
    offer:'A question-to-resolution map',test:'Compare successful resolution and failure handling with the existing service route.'},
  knowledge: {label:'Knowledge quality and ownership',
    opening:'Who owns the information behind the answer, and what happens when it changes?',
    bridge:'Connect HQ knowledge access and HQ Agent retrieval to the source owner’s review process. Grounding and citations help inspection; they do not guarantee correctness.',
    evidence:'Identify source owners, freshness checks, conflicting policies, permission changes, citation quality and an escalation route.',
    challenge:'Is the underlying source incomplete or stale? Would an AI answer make that problem harder to notice?',
    offer:'A knowledge ownership and freshness checklist',test:'Evaluate current, stale, conflicting and inaccessible sources with expected answers and human review.'},
  governance: {label:'Useful AI with clear controls',
    opening:'Can employees complete useful work through the approved route while IT controls data access and actions?',
    bridge:'Explore the employee experience and the control requirements together. Confirm the exact HQ and HQ Agent controls for the proposed scenario.',
    evidence:'Request source permissions, action authorisation, data processing, audit evidence, oversight, failure handling and operational ownership.',
    challenge:'Would employees still bypass the approved route because it does not solve their task? Which residual risks remain?',
    offer:'A workflow control-and-usability checklist',test:'Demonstrate permitted and denied access, action confirmation and failure recovery for the same employee journey.'}
};
const rolePrompts = {
  owner:'Confirm budget authority and success measures for this account; the IT title alone does not establish who signs. Include the operational and financial trade-offs.',
  champion:'Give the champion a concise problem, evidence and stakeholder map they can use internally. Identify who funds, validates and operates the change.',
  influencer:'Provide architecture, source permissions, supported actions and implementation dependencies. Make open technical questions visible before seeking approval.'
};
const remitPrompts = {
  executive:'Connect the use case to investment priorities, enterprise risk and an outcome the leadership team can defend.',
  ai:'Separate rollout activity from useful repeat use, task quality and measurable outcomes. Name the AI programme owner.',
  workplace:'Show the employee journey across devices and existing destinations, including adoption support and administration.',
  architecture:'Show what remains in each system, data movement, dependencies and the long-term maintenance burden.',
  security:'Specify who can read and act, where data goes, what evidence is available and what remains outside the control boundary.',
  operations:'Show support ownership, failed requests, escalation and service quality as well as possible demand reduction.'
};
export function guidanceFor(r) {
  const angle = angles[r.angle] || angles.general;
  const stage = r.goal==='attention'
    ? 'Discover: earn attention with one recognisable problem and a useful question. A diagnostic or guide is only a suggested offer; confirm it exists before advertising it.'
    : r.goal==='shortlist'
      ? 'Evaluate: compare approaches fairly, show system fit and provide relevant product and customer evidence. Use a scoped journey walkthrough.'
      : 'Commit: provide a scoped implementation and value plan with costs, owners, control evidence, support, success measures and open issues.';
  const awareness = r.awareness==='Unaware'
    ? 'Start with an observable work problem; do not assume an AI programme or familiarity with HQ.'
    : r.awareness==='Problem aware'
      ? 'Explain the problem and alternative causes before asking the reader to accept HQ as the answer.'
      : r.awareness==='Solution aware'
        ? 'Compare build, buy and extend routes before making product-specific claims.'
        : 'Use current product scope and relevant evidence; answer remaining fit and decision questions.';
  const format = /Headline|Email/.test(r.assetType||'')
    ? 'Keep the opening short: one question, one relevant consequence, one next step. Put detailed evidence in the follow-up.'
    : 'Develop the problem → consequence → approach → system fit → evidence → next step. Make the limits and implementation work visible.';
  return { ...angle, stage, awareness, format,
    buyer: `${remitPrompts[r.persona]||remitPrompts.ai} ${rolePrompts[r.buyingRole]||rolePrompts.owner}`,
    region:'Use the selected region to ask about local requirements; do not infer an individual buyer’s preferences from regional averages. No regional score adjustment.',
    proofStatus:r.proof?.trim()?'Supporting material supplied, but not verified or automatically matched to claims. Check scope, date, cohort, method and relevance.':'No supporting proof supplied. Keep outcome claims as questions or hypotheses until relevant evidence is available.'
  };
}

// Rule matches identify passages for inspection, not true/false conclusions.
const rules = [
  {id:'metrics', title:'Quantified or financial claim', re:/\d[\d,.]*\s*(?:%|percent|million|billion|[x×]\b)|[$£€]\s*\d|\bROI\b/i, why:'Give the reader enough context to understand what this figure means and whether it applies to their situation.', need:'Where the figure comes from, who or what it covers, when it was measured and how it was calculated.', direction:'If the evidence is available, add the context and source. Otherwise, frame the result as something to test rather than a promise.'},
  {id:'buyer', title:'Buyer authority assumption', re:/\b(?:IT|CIOs?|CHROs?)\b.{0,65}\b(?:always|controls? (?:the )?budget|owns? (?:the )?budget|is (?:the )?economic buyer|are (?:the )?economic buyers|signs)\b/i, why:'Titles do not establish decision authority in every account.', need:'An account-specific buying group, budget owner and decision process.', direction:'Ask who owns, funds and approves this purchase.'},
  {id:'causality', title:'Causal or guaranteed transformation claim', re:/\b(?:guarantee\w*|ensure\w*|automatically|alone)\b.{0,90}\b(?:adoption|ROI|transformation|success|value)\b|\b(?:where|location|front door|experience layer)\b.{0,100}\b(?:determines?|guarantees?|more than training)\b|\b(?:seer|adoption|usage)\b.{0,70}\b(?:proves?|guarantees?|delivers?)\b.{0,35}\b(?:ROI|transformation|value)\b/i, why:'Location, usage and sentiment do not establish the cause of business improvement.', need:'A baseline, outcome measures, comparison and consideration of alternative explanations.', direction:'Present the change mechanism as a hypothesis and test it alongside access, training, data quality and task relevance.'},
  {id:'security', title:'Broad security or governance assurance', re:/\b(?:fully secure|100% secure|zero risk|hallucination[- ]free|safe AI|full audit|full control|no customer (?:content|data).{0,30}(?:retained|train)|never.{0,30}train|zero[- ]data[- ]retention)\b/i, why:'Broad assurances can hide boundaries, exceptions and responsibilities.', need:'Current control and contractual evidence for the product, data flow and action being discussed.', direction:'Name the specific control and boundary; retain human oversight and residual risks.'},
  {id:'competitor', title:'Competitive or category superiority', re:/\b(?:only|first|best)\b.{0,55}\b(?:platform|AI|headquarters|solution)\b|\b(?:competitors?|copilot|glean|servicenow|workday|viva|gemini)\b.{0,100}\b(?:cannot|can’t|can't|does not|doesn’t|doesn't|cheaper|times|lack|just|only)\b|\bno(?:body| one)\b.{0,50}\b(?:solv|connect|platform)/i, why:'A category slogan or competitor limitation needs a defined scope and current evidence.', need:'Like-for-like, dated capability and commercial comparisons for the buyer’s actual use case.', direction:'Compare the employee journey and trade-offs; allow the existing option to be sufficient.'},
  {id:'orchestration', title:'Cross-agent orchestration', re:/\b(?:rout\w*|orchestrat\w*|control\w*|connect\w*|hub)\b.{0,70}\b(?:copilots?|other agents|all agents|AI assistants|gemini|zoommate)\b|\b(?:all agents|copilots?)\b.{0,60}\b(?:one (?:place|interface)|front door)\b/i, why:'Coexistence and connecting to systems do not prove control of other assistants.', need:'Current product documentation and a demonstrated, supported cross-agent workflow.', direction:'Describe the verified source or action connection without implying universal agent routing.'},
  {id:'consolidation', title:'Automatic consolidation or savings', re:/\b(?:replac\w*|consolidat\w*|retir\w*)\b.{0,70}\b(?:stack|tools|intranet|assistant|platforms)\b|\b(?:lower|reduce\w*|save\w*)\b.{0,50}\b(?:cost|TCO|tickets)\b/i, why:'A shared entry point does not automatically retire a system or reduce total cost.', need:'A retirement or coexistence plan, contract implications and full implementation and operating costs.', direction:'State which component might change and measure the net effect.'},
  {id:'availability', title:'Specific capability or package claim', re:/\b(?:offline|voice[- ]enabled|voice[- ]capable|persistent memory|BYO LLM|included at no (?:extra|additional) cost|free for every|all connectors|\d+\+? (?:connectors|integrations|languages))\b/i, why:'Availability can differ by product, package, device, language and release.', need:'A current capability matrix and confirmed entitlements for the exact scenario.', direction:'Qualify scope and avoid treating a roadmap or platform count as a working end-to-end use case.'},
  {id:'prediction', title:'People insight presented as prediction', re:/\b(?:flight[- ]risk|predict\w*.{0,40}(?:attrition|resign|retention)|seer.{0,40}(?:proves?|guarantees?))\b/i, why:'Listening signals alone do not establish predictive accuracy or causal business outcomes.', need:'Validated product scope, intended use, methodology, error rates and governance.', direction:'Describe employee listening as input to human-led investigation and improvement.'},
  {id:'universal', title:'Universal reach or action', re:/\b(?:find anything|do anything|every enterprise|every organisation|every organization|any system|all systems|every task|every worker|entire workforce)\b/i, why:'A whole-workforce ambition is not proof of access, action support or fit for every employee.', need:'Defined groups, access constraints, supported systems and explicit exceptions.', direction:'Name the group and task being evaluated; keep broader language as an ambition.'},
  {id:'placeholder', title:'Unfinished proof or offer', re:/\[(?:customer|company|IT leader|proof|source|\d)[^\]]*\]|\b(?:TBC|TBD|PROOF NEEDED)\b/i, why:'Production placeholders and proposed offers are not finished evidence or available assets.', need:'The completed asset and permission to use its evidence, or an explicit draft label.', direction:'Keep the draft internal until the reference or offer is ready.'},
  {id:'grounding', title:'Grounding presented as guaranteed accuracy', re:/\b(?:ground\w*|citations?|RAG|permission[- ]aware)\b.{0,75}\b(?:guarantee\w*|ensure\w*|always accurate|no hallucinations)\b/i, why:'Retrieval, citations and permissions do not by themselves establish answer correctness.', need:'Evaluation on relevant, stale, conflicting and inaccessible knowledge, plus recovery procedures.', direction:'Explain the mechanism and how answer quality is tested, without an accuracy guarantee.'}
];
function metricFeedback(quote) {
  if(/\bROI\b/i.test(quote))return {
    why:'If you’re making a return-on-investment case, help the buyer see the link between what changed at work and what the organisation gained. Usage can be part of that story; the costs and benefits complete it.',
    need:'The use case, results over a stated period, costs included and how the benefit was calculated. Make clear whether the evidence relates to HQ, HQ Agent or the wider programme.',
    direction:'For a measured result, explain the calculation and its limits. For an ROI question or ambition, say what you would measure together.'
  };
  if(/\b(?:saving\w*|save\w*|cost\w*|hours?|productivity)\b|[$£€]/i.test(quote))return {
    why:'A saving is more useful when the buyer can see what changed. Was this time freed up, lower spending or an estimate—and over what period?',
    need:'The starting point, people or tasks measured, time period and calculation. For a net saving, include the costs of putting the change in place and running it.',
    direction:'Name the type of saving and keep the claim within what was measured. Label forecasts as estimates and show the assumptions.'
  };
  if(/\b(?:adoption|usage|users?|active|engagement)\b/i.test(quote))return {
    why:'This could be a useful sign that people are engaging. Help the reader understand who is counted and what “using it” means, then connect it to the work you want to improve.',
    need:'The employee group, time period and definition of use or engagement. Distinguish platform activity from HQ Agent use; add task outcomes if you’re making a broader value claim.',
    direction:'Keep a supported adoption figure and explain its scope. If business impact hasn’t been measured yet, make that the next question to explore.'
  };
  return {};
}
export function claimChecks(message='') {
  // Preserve exact source text, including whitespace inside a passage and decimal points.
  const passages=typeof Intl.Segmenter === "function" ? [...new Intl.Segmenter("en",{granularity:"sentence"}).segment(message)].map(x=>x.segment.trim()).filter(Boolean) : (message.match(/[^\n]+/g)||[]);
  return rules.flatMap(rule=>{
    return passages.filter(p=>rule.re.test(p)).map(quote=>({id:rule.id,title:rule.title,quote,why:rule.why,need:rule.need,direction:rule.direction,...(rule.id==='metrics'?metricFeedback(quote):{})}));
  });
}
// Team-confirmed credentials; recognise only a bare list, never endorse surrounding claims.
export function credentialNote(passage='') {
  const credential=/\b(?:SOC\s*2\s*Type\s*(?:II|2)|ISO\s*27001)\b/gi;
  if(!credential.test(passage))return '';
  const remainder=passage.replace(credential,'').replace(/\band\b/gi,'').replace(/[\s,;:.&“”"'‘’()]+/g,'');
  return remainder ? '' : 'Confirmed Workvivo credentials: SOC 2 Type II and ISO 27001. Sales: use the approved trust documentation for the customer’s product and scope. These credentials do not establish every workflow control or guarantee zero risk.';
}
export function claimReviewText(r) {
  const flags=claimChecks(r.message);
  const credentials=(r.message.match(/[^.!?\n]+[.!?]?/g)||[]).map(credentialNote).find(Boolean);
  return `## Claims to inspect before using this message\n\n${credentials?credentials+'\n\n':''}${flags.length?`${flags.length} rule-based review prompt(s). These do not establish that a claim is false; questions, quotations and negation may also match.`:'No targeted claim patterns matched. This is not evidence that the message is accurate or complete.'}\n\n${flags.map(f=>`### ${f.title}\n\nSource passage: ${f.quote}\n\nWhy inspect: ${f.why}\nEvidence needed: ${f.need}\nRewrite direction: ${f.direction}`).join('\n\n')}\n\n${guidanceFor(r).proofStatus}\n\nThese checks remain visible regardless of the language score or purchase stage. Supplied proof does not automatically clear them.\n`;
}
export function guidanceText(r) {
  const g=guidanceFor(r);
  return `## HQ-aligned direction to test\n\nAngle: ${g.label}\nEditorial guidance informed by buyer research and HQ messaging; not a validated buyer reaction or automatic rewrite.\n\nSuggested opening question: ${g.opening}\n\nHQ connection: ${g.bridge}\n\nEvidence to earn the claim: ${g.evidence}\n\nCounter-question: ${g.challenge}\n\nSuggested next asset (not an existing deliverable): ${g.offer}\n\nNext test: ${g.test}\n\nBuyer and buying role: ${g.buyer}\n\nPurchase stage: ${g.stage}\n\nAwareness: ${g.awareness}\n\nAsset format: ${g.format}\n\nRegional scope: ${g.region}\n\nProof status: ${g.proofStatus}\n\n${measurementText()}\nResearch informs the questions, not the weights or an endorsement of HQ. Brand alignment adds no points.\n\n### Public source basis\n\n${sources.map(s=>`- ${s.name}: ${s.url}\n  ${s.scope}`).join('\n')}\n`;
}
