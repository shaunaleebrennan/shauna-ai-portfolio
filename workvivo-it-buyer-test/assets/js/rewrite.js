import {claimChecks, credentialNote} from './hq-guidance.js?v=3';
const copy = {
 general:['Where does AI help employees finish the task?','HQ Agent gives employees a way to find information and take supported actions within Workvivo HQ. The useful test is a specific workflow: where an employee gets stuck today, which systems are involved, and whether the proposed route helps them complete the task.'],
 proof:['See how AI is changing everyday work.','Bring platform engagement, supported HQ Agent usage insights and operational results into the same conversation. Where employee feedback would help explain the experience of change, Seer can support listening and follow-up with your People team.'],
 adoption:['Turn AI access into useful everyday work.','Workvivo HQ brings communication, guidance and community into the employee experience, with HQ Agent for relevant knowledge and supported actions. Analytics can help you explore uptake; Seer can add employee feedback to help your People team understand where support is needed.'],
 cost:['Make the next AI investment easier to justify.','Start with the work you want to improve. Evaluate the role of Workvivo HQ and HQ Agent against the current approach, including the effort to implement, run and support the change.'],
 frontline:['Bring the AI conversation closer to frontline work.','Workvivo HQ brings communication and knowledge into the employee experience. Evaluate HQ Agent around a specific task, with access, devices and supported actions shaped around the people who need to use it.'],
 architecture:['Find the right role for HQ in your existing stack.','Workvivo HQ provides a shared employee experience for communication, knowledge and services. Evaluate HQ Agent at the retrieval and supported action steps where it can address a gap, with clear responsibilities for the systems behind the experience.'],
 selfservice:['Move from another answer to a useful next step.','HQ Agent supports knowledge retrieval and supported actions within the Workvivo HQ experience. Start with a recurring employee request and examine the route from question to answer, action and resolution.'],
 knowledge:['Give better answers a stronger knowledge foundation.','Workvivo HQ brings knowledge into the employee experience, with HQ Agent for retrieval and supported actions. Source ownership, freshness and access remain part of making that experience useful.'],
 governance:['Make the approved AI route useful for employees.','Evaluate Workvivo HQ and HQ Agent around a defined task, with clear requirements for who can access information, take action and handle exceptions. Bring the employee experience and the control requirements into the same decision.']
};
const next = {
 attention:'Would it be useful to compare one priority workflow with the way it works today—before deciding whether another AI capability is needed?',
 shortlist:'Let’s walk through one journey together and compare the current approach with HQ, including system fit, supported actions and the evidence you need.',
 evaluation:'Let’s agree a scoped evaluation with named owners, success measures and a review of implementation effort, costs and controls before an investment decision.'
};
export function draftFor(r) {
 const [headline,body]=copy[r.angle]||copy.general;
 const sentences=typeof Intl.Segmenter==='function'?[...new Intl.Segmenter('en',{granularity:'sentence'}).segment(r.message||'')].map(x=>x.segment.trim()):(r.message||'').split(/\n/);
 // Retain a supplied problem sentence verbatim; do not pretend to semantically rewrite arbitrary context.
 const problem=sentences.find(s=>s.length<400 && /\b(?:struggl\w*|delay\w*|fragment\w*|manual|difficult|friction|stuck|stall\w*)\b/i.test(s) && !claimChecks(s).length && !/\b(?:guarantee\w*|always|never)\b/i.test(s));
 const cta=sentences.find(s=>s.length<240 && /^(?:let[’']s|could we|would you|shall we)\b/i.test(s) && !claimChecks(s).length) || next[r.goal] || next.attention;
 const proof=(r.proof||'').trim();
 const credentials=(r.persona==='security'||r.angle==='governance')&&sentences.some(s=>credentialNote(s))?'Workvivo has SOC 2 Type II and ISO 27001 credentials.':'';
 const short=/Headline/.test(r.assetType||'');
 const email=/Email/.test(r.assetType||'');
 const greeting=(r.message||'').match(/(?:^|\n)\s*(?:Hi|Hello|Dear)\s+([^,\n!]+)[,!]?/i)?.[1] || '[First name]';
 const opening=problem || 'When [employee group] need to [recurring task], can they complete it through the tools you already provide—or do they still need to chase someone for help?';
 const evidence=proof || (r.goal==='evaluation'?'[Add the relevant customer or evaluation result, including what was measured and over what period.]':'');
 const draft=short?`${headline}\n\n${cta}`:[email?`Subject: ${headline}`:headline,email?`Hi ${greeting},`:'',opening,body,credentials,evidence,cta,email?`Best,\n${(r.message||'').match(/(?:^|\n)(?:Best|Thanks|Regards|Best regards),?\s*\n([^\n]+)/i)?.[1] || '[Your name]'}`:''].filter(Boolean).join('\n\n');
 const gaps=[];
 if(!short && r.goal==='evaluation' && !proof)gaps.push('For the investment decision: add the relevant evaluation or customer evidence when available. The draft currently proposes an evaluation rather than claiming a proven return.');
 return {draft,gaps,guidance:[
   'Lead with one employee task and its impact; keep the opening relevant to this buyer.',
   'Explain the role of HQ and HQ Agent without promising unconfirmed integrations, controls or savings.',
   proof?'Your supplied proof is retained. Keep its wording and scope aligned with the source.':'Keep the invitation exploratory; no invented customer results or ROI claims.',
   'Complete the square brackets with account-specific details before sending. Keep the next step small and concrete.'
 ],notes:[
   'A template-based starting draft assembled locally from the selected angle and stage, with a matching problem or next step retained from your message where recognised. It is not a free-form AI rewrite.',
   ...(proof&&!short?['Your supplied proof is included as written. It has not been independently verified or matched to each claim.']:[]),
   ...(r.teamContext?.trim()?['Your additional context remains below for reference; the local drafting rules do not interpret free-form background notes.']:[])
 ]};
}
