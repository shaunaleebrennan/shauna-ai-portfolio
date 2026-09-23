const hurdles = {
  access: {
    title: 'Earn the AI / IT conversation',
    direction: 'Use the existing employee-experience relationship to identify a frontline or mobile employee group that the current AI programme is not serving well, then identify one recurring workflow problem. Ask your champion to introduce the person accountable for that workflow and the AI or IT owner. Give them a reason to join: a measurable problem, an affected employee group and a decision they own.',
    question: 'Which frontline employee requests still depend on a manager or service desk, where do delays occur, and who owns the workflow and AI programme?',
    next: 'A short workflow discovery session with the business champion and AI / IT owner. Agree the problem before proposing a product demo.'
  },
  fit: {
    title: 'Make the case alongside existing AI investments',
    direction: 'Ask what the current copilot, search tool or service portal already handles. Identify a specific gap in employee reach or workflow completion. Explain where HQ Agent could fit only after that gap is clear; validate the required connections rather than assuming replacement or compatibility. Do not equate coexistence with routing through or controlling another copilot.',
    question: 'Where does the current approach stop: finding information, answering the question, or completing the task? For which employees?',
    next: 'A joint workflow walkthrough with the platform owner and solution engineer. Compare the current path with the proposed path and document dependencies.'
  },
  pilot: {
    title: 'Define an evaluation the buyer can defend',
    direction: 'Bound the evaluation to one workflow and employee group. Agree baseline, success measure, owner, data access, supported actions, escalation and implementation effort. Confirm licensing and commercial scope. Measure completed work and quality, not just questions asked. Separate finding a document, retrieving a live record and executing an action; check permissions, end-user licensing, confirmation and failure handling for each step.',
    question: 'What result would justify expanding this use case, and what failure or control gap would stop it?',
    next: 'A technical and value workshop that produces a written pilot scope, named owners, success measures and a go / no-go decision date.'
  }
};
export function teamBrief(r) {
  const h=hurdles[r.challenge]||hurdles.access;
  const stage=r.goal==='attention'
    ? 'Discover: lead with one problem and one relevant question. Offer a working conversation; keep technical detail available for follow-up.'
    : r.goal==='shortlist'
      ? 'Evaluate: show the current and proposed workflow, where HQ Agent fits, what must connect and the evidence still needed.'
      : 'Commit: make ownership, implementation effort, controls, cost and acceptance criteria explicit.';
  return `${h.title}\n\nSELLER DIRECTION\n${h.direction}\n\nDISCOVERY QUESTION\n${h.question}\n\nNEXT CONVERSATION\n${h.next}\n\nSTAGE FIT\n${stage}\n\nREWRITE STARTER — COMPLETE AND VERIFY\nFor [employee group], [recurring workflow] creates [specific delay, cost or risk]. Your current approach leaves [validated gap]. Explore whether HQ Agent within Workvivo HQ can improve [bounded outcome]. Validate [systems, supported actions and controls] and measure [agreed baseline and success criterion].\n\nWORKFLOW TO SCOPE\n[Employee group] → [question or request] → [source or live system] → [supported action] → [confirmation or escalation]. For example, explore a leave-policy-to-request journey; validate every step before presenting it as available.\n\nPROOF TO BRING\nAn approved demonstration of the exact workflow; confirmed integration and action scope; permission and data-flow evidence; a relevant customer example or an agreed pilot measurement plan. Do not transfer general Workvivo adoption figures to HQ Agent outcomes.\n\nSUPPLIED TEAM CONTEXT — NOT VERIFIED OR AUTOMATICALLY ANALYSED\n${r.teamContext?.trim()||'None supplied.'}\n\nUse this context when completing the starter. Keep the original meaning, and mark unsupported claims as PROOF NEEDED. The language score uses only the message field.`;
}
