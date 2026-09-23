/* IT messaging rubric 3.2. Editorial rules, not a calibrated buyer prediction. */
export const ITRubric = (() => {
  const version = '3.2';
  const stages = {
    attention: {label: 'Discover: earn attention', weights: {relevance:30,value:20,fit:0,trust:0,proof:15,clarity:35}},
    shortlist: {label: 'Evaluate: compare approaches', weights: {relevance:20,value:20,fit:20,trust:10,proof:20,clarity:10}},
    evaluation: {label: 'Commit: justify the choice', weights: {relevance:10,value:20,fit:20,trust:20,proof:20,clarity:10}}
  };
  // Asset contracts change what can reasonably fit in the supplied copy. No buyer-specific score weights.
  const formats = {
    'Headline / paid ad': {name:'Headline / paid ad',kind:'headline',weights:{relevance:40,value:20,fit:0,trust:0,proof:0,clarity:40}},
    'Email / outreach': {name:'Email / outreach',kind:'outreach',weights:{relevance:35,value:25,fit:0,trust:0,proof:0,clarity:40}},
    'Campaign or thought-leadership copy': {name:'Campaign or thought-leadership copy',kind:'editorial',weights:{
      attention:{relevance:35,value:25,fit:0,trust:0,proof:0,clarity:40},
      shortlist:{relevance:30,value:25,fit:10,trust:0,proof:10,clarity:25},
      evaluation:{relevance:20,value:25,fit:15,trust:10,proof:10,clarity:20}}},
    'Homepage / landing page': {name:'Homepage / landing page',kind:'landing',weights:{
      attention:{relevance:30,value:25,fit:0,trust:0,proof:15,clarity:30},
      shortlist:{relevance:20,value:20,fit:20,trust:10,proof:15,clarity:15},
      evaluation:stages.evaluation.weights}},
    'IT-focused strategic narrative': {name:'IT-focused strategic narrative',kind:'narrative',weights:{
      attention:{relevance:35,value:25,fit:0,trust:0,proof:10,clarity:30},
      shortlist:{relevance:25,value:20,fit:15,trust:10,proof:20,clarity:10},
      evaluation:stages.evaluation.weights}},
    'Messaging and positioning framework': {name:'Messaging and positioning framework',kind:'framework',weights:{
      attention:{relevance:35,value:25,fit:0,trust:0,proof:10,clarity:30},
      shortlist:{relevance:25,value:20,fit:15,trust:10,proof:20,clarity:10},
      evaluation:stages.evaluation.weights}},
    'Sales pitch / deck': {name:'Sales pitch / deck',kind:'decision'},
    'Product or solution brief': {name:'Product or solution brief',kind:'decision'}
  };
  const anchors = {
    relevance: ['No usable buyer problem detected', 'A problem is named', 'Buyer and task are tied to the problem', 'The consequence is explained', 'An explicit reason to change the current approach'],
    value: ['No outcome detected', 'A benefit is mentioned', 'A specific workflow benefit', 'A mechanism connects the work to the benefit', 'A scoped measure or success test'],
    fit: ['No system role detected', 'An integration is mentioned', 'Named system and interaction', 'What stays or changes is explicit', 'A dependency or boundary is explicit'],
    trust: ['No relevant control detected', 'General assurance or credential', 'A specific control is stated', 'Who controls what is explained', 'A boundary or responsibility is stated'],
    proof: ['No attributable support detected', 'A source is referenced', 'The reference is identifiable', 'Its scope is stated', 'A relevant result or control is linked to that scope'],
    clarity: ['No usable proposition detected', 'Readable text', 'A clear action or idea', 'Readable, restrained wording', 'An explicit next step suited to this stage']
  };
  const needs = {
    relevance: ['Name the buyer’s current problem.', 'Connect the problem to an employee group or specific task.', 'Explain what that problem causes.', 'Show why the current approach needs to change.'],
    value: ['State the benefit for the buyer.', 'Name the task that improves.', 'Explain how the approach produces that improvement.', 'State a success measure, population and period; a proposed test is fine.'],
    fit: ['Explain the offer’s role in the existing stack.', 'Name a system and what the connection does.', 'Say what is retained, replaced or added.', 'State one implementation dependency or boundary.'],
    trust: ['Name the trust question relevant to the claim.', 'Describe a control instead of a broad assurance.', 'Explain who controls which data or action.', 'State the responsibility, boundary or exception.'],
    proof: ['Attribute the central claim to a source.', 'Identify or link the actual report, case study or control document.', 'State the source’s relevant population, workflow or product scope.', 'Link the scoped source to the result or control it actually supports.'],
    clarity: ['Write a coherent message rather than a list of labels.', 'Use a concrete action or proposition.', 'Shorten long sentences and stacked marketing language.', 'Give the buyer a useful next step at this stage.']
  };
  const P = {
    problem: /\b(struggl\w*|friction|risk|slow\w*|delay\w*|manual\w*|fragment\w*|silo\w*|sprawl|complex\w*|disconnected|shadow|inconsistent|challenge\w*|pressure|gap|wast\w*|fail\w*|unused|stuck|lack\w*|cannot|can’t|can't|underused|searching|switching|spend\w* .{0,30}(?:finding|looking))\b/i,
    buyer: /\b(IT|CIO|CISO|employees?|workers?|frontline|managers?|teams?|staff|administrators?|service desk|help desk|engineers?|workforce|you|your)\b/i,
    task: /\b(find\w*|search\w*|answer\w*|request\w*|ticket\w*|resol\w*|approv\w*|onboard\w*|provision\w*|migrat\w*|licen[cs]\w*|support|deploy\w*|access|renew\w*|rollout|report\w*|handoff\w*|workflow\w*)\b/i,
    consequence: /\b(because|caus\w*|means|leads? to|result\w* in|leaving|delaying|so that|which .{0,30}(?:delay|cost|increase|prevent)|costing|wasting|instead of)\b/i,
    reframe: /\b(rather than|instead of|not another|without replacing|already .{0,35}(?:have|use|invest)|current approach|status quo|renewal|deadline|board meeting|this quarter|why .{0,50}\?)\b/i,
    benefit: /\b(reduc\w*|sav\w*|fewer|lower|faster|less|improv\w*|avoid\w*|increase\w*|shorten\w*|cut\w*|free\w*|productivity|efficien\w*|ROI|TCO)\b/i,
    mechanism: /\b(by|through|using|so (?:that |they |employees |teams |IT )|so you can|enables?|lets?|allows?|helps?)\b/i,
    interaction: /\b(connect\w*|integrat\w*|coexist\w*|works? (?:with|alongside)|retriev\w*|sync\w*|take action (?:across|in)|read\w* from|writ\w* (?:to|back)|creates? .{0,30} in|uses? .{0,30}(?:identity|permissions))\b/i,
    system: /\b(SSO|SCIM|API|system of record|identity provider|(?:HR|payroll|CRM|ERP|ITSM|knowledge|ticketing|document|email|collaboration) (?:system|platform|tool|service))\b/i,
    role: /\b(retain\w*|keep\w*|remains?|alongside|coexist\w*|without replac\w*|replac\w*|retir\w*|add\w*|read.only|system of record)\b/i,
    dependency: /\b(requires?|depend\w*|subject to|supported|limited to|read.only|prerequisite|configured|only .{0,30}(?:approved|authori[sz]ed))\b/i,
    trust: /\b(secur\w*|govern\w*|compliance|privacy|SOC 2|ISO 27001|SLA|permissions?|audit|access control)\b/i,
    control: /\b(role.based|least.privilege|permission.aware|audit trail|audit log|SSO|SCIM|encrypted|encryption|human approval|requires? approval|data residency|retention (?:policy|period)|access control|approve\w*|restrict\w*|revoke\w*)\b/i,
    owner: /\b(IT|admin\w*|owner\w*|security team|reviewers?|humans?|user\w*)\b/i,
    object: /\b(data|access|actions?|permissions?|prompts?|records?|files?|content|accounts?|requests?|changes?|logs?)\b/i,
    scope: /\b(\d+ (?:employees|workers|users|teams|customers|participants)|over \d+|during|across|cohort|population|baseline|pilot|workflow|product scope|scope|for (?:the|our|a) .{0,30}(?:team|workforce|product))\b/i,
    population: /\b(\d+\s+(?:employees|workers|users|teams|customers|participants)|(?:for|across|with|among)\s+(?:(?:the|our|a|all)\s+)?(?:frontline|desk|support|IT|sales|service|pilot|engineering)?\s*(?:employees|workers|users|teams?|staff|workforce|cohort))\b/i,
    period: /\b(\d+\s*(?:days?|weeks?|months?|years?)|(?:during|over|within|after|before)\s+(?:(?:the|our|a|one)\s+)?(?:pilot|trial|quarter|month|week|year))\b/i,
    measure: /(?:\d+(?:\.\d+)?\s*%|\d+(?:\.\d+)?\s*(?:hours?|minutes?|days?|weeks?|months?|seconds?|tickets?|users?|employees?)\b|\b(?:measure|track|compare|baseline|success criterion)\w*\b)/i,
    source: /(?:https?:\/\/[^\s]+|\bsource:|\b(?:according to|case study|customer report|pilot report|research report|audit report|control document|study by|report by)\b)/i,
    attribution: /(?:https?:\/\/[^\s]+|\b(?:[A-Z][\w’'-]+\s+){1,5}(?:case study|pilot report|research report|audit report|control document)\b)/,
    metric: /(?:\d+(?:\.\d+)?\s*%|[$€£]\s*\d|\b\d[\d,.]*[kmb]?\+?\s*(?:hours?|minutes?|days?|weeks?|months?|seconds?|employees|workers|users|tools|integrations|connectors|organisations|organizations|million|billion)\b)/i,
    action: /\b(find|finds|search|searches|answer|answers|reduce|reduces|check|checks|review|reviews|compare|compares|help|helps|connect|connects|integrate|integrates|retrieve|retrieves|sync|syncs|take|takes|give|gives|use|uses|show|shows|keep|keeps|read|see|learn|download|explore|ask|test|measure|decide|resolve|resolves|approve|approves|restrict|restricts|control|controls|save|saves|cut|cuts|stop|stops|why|how|what)\b/i,
    lowCTA: /\b(read|see|learn|download|explore|compare|check|watch|discover|ask|review)\b/i,
    CTA: /\b(read|see|learn|download|explore|compare|check|watch|discover|ask|review|book|schedule|pilot|test|agree|request|contact|map)\b/i
  };
  const words = s => s.match(/[\p{L}\p{N}’'-]+/gu) || [];
  function passages(text) {
    // Keep URLs, decimals, line breaks and percentages intact for traceable quotes.
    return [...new Set(String(text).split(/\n+|(?<=[.!?])\s+(?=[A-Z0-9“"[])/u).map(s=>s.trim()).filter(Boolean))];
  }
  const matches = (s,...patterns) => patterns.every(p=>p.test(s));
  const sentence = (s,min=6) => words(s).length >= min && P.action.test(s) && !/^\s*(?:\w+[ ,/·]*){1,3}$/.test(s);
  const hollow = s => /\[(?:proof|source|customer|insert|missing|metric|number|company)[^\]]*\]|\b(?:TBD|proof needed|source needed)\b/i.test(s);
  const denied = s => /\b(?:do(?:es)? not|cannot|can’t|can't|will not|won’t|won't|doesn’t|doesn't|don’t|don't|never|not)\s+(?:yet\s+)?(?:reduc\w*|sav\w*|improv\w*|increase\w*|prove|support\w*|integrat\w*|connect\w*|retriev\w*|restrict\w*|encrypt\w*|approv\w*)\b|\b(?:no|without)\s+(?:integration|connection|encryption|access controls?)\b/i.test(s);
  const identifiableSource = s => P.source.test(s) && !hollow(s) && (/https?:\/\/\S+/.test(s) || (P.attribution.test(s) && /\b20\d{2}\b|[“"][^”"]{8,}[”"]/.test(s)));
  const hasBenefit = s => P.benefit.test(s) && !denied(s) && !/\b(?:lack\w*|no|without|unproven)\s+(?:measurable\s+)?(?:ROI|TCO savings|productivity gains|efficiency gains)\b/i.test(s);
  const marketing = /\b(revolutionary|game.changing|next.gen|seamless|effortless|unprecedented|best.in.class|world.class|future.proof|supercharge|reimagine)\b/ig;

  function claims(text) {
    const out=[];
    for(const quote of passages(text)) {
      const isQuestion=quote.endsWith('?');
      const negated=/\b(?:not|never|no) (?:a |any )?(?:guarantee|claim|promise)|cannot guarantee|can’t guarantee|can't guarantee|do not (?:claim|guarantee)|does not (?:prove|guarantee)/i.test(quote);
      const tentative=/\b(?:target|aim|estimate|forecast|hypothesis|proposed|would|could|might|whether|test if|measure whether)\b|\b(?:will|plan to|intend to|propose to)\s+(?:test|measure|compare|track|evaluate|pilot)\b|\b(?:test|measure|compare|track)\s+(?:the\s+)?(?:baseline|during|over)\b/i.test(quote);
      const add=(type,need,risk='normal')=>out.push({quote,type,need,risk,attributed:P.source.test(quote)&&!hollow(quote),context:isQuestion?'Question':negated?'Qualification':tentative?'Estimate or hypothesis':'Assertion'});
      if(!isQuestion&&!negated&&/\b(?:zero risk|zero data retention|100% secure|guaranteed (?:security|compliance)|fully compliant|eliminates? all risk)\b/i.test(quote)) {
        add('Absolute assurance','Show current product and contractual scope, exceptions, data flows and responsibility.','high');
      } else if(!isQuestion&&!negated&&/\b(?:(?:the |world.?s? )?(?:first|only) (?:AI[ -](?:native|powered) |enterprise |digital )?(?:platform|solution|headquarters|product|vendor|provider)|best.in.class|\d+x cheaper|cheaper than|faster than)\b/i.test(quote)) {
        add('Comparative or category claim','Define the category or like-for-like comparison, date, scope and source.','high');
      } else if(P.metric.test(quote)) {
        if(/\b(investment|invested|funding|R&D)\b/i.test(quote)&&/[$€£]|billion|million/i.test(quote)) add('Vendor investment figure','Cite the amount, date and scope; investment is not customer outcome evidence.');
        else if(/\b(adoption|usage|active|engagement)\b/i.test(quote)) add('Adoption or usage figure','State the population, denominator, period, product and definition of use.');
        else if(/\b(price|pricing|per user|per seat|\/user|\/month)\b/i.test(quote)) add('Pricing claim','Confirm the current package, currency, unit, term and commercial conditions.');
        else add('Quantified statement','Identify the source, baseline, population, period and calculation.');
      } else if(!isQuestion&&!negated&&!tentative&&/\b(?:lower cost|fewer tools|reduce[sd]? (?:TCO|costs?)|saves? money|proven ROI)\b/i.test(quote)) add('Outcome promise','Show the mechanism and net calculation, including deployment and operating costs.');
    }
    return out;
  }

  function assess(input) {
    const message=String(input.message||'').trim(), ps=passages(message);
    const stage=stages[input.goal]||stages.shortlist;
    const format=formats[input.assetType]||formats['Sales pitch / deck'];
    const shortAsset=format.kind==='headline';
    const compact=shortAsset||format.kind==='outreach';
    const editorial=format.kind==='editorial';
    const noCTA=shortAsset||editorial||format.kind==='framework'||format.kind==='narrative';
    const weights={...(format.weights?.[input.goal]||format.weights||stage.weights)};
    const activeAnchors=Object.fromEntries(Object.entries(anchors).map(([id,list])=>[id,[...list]]));
    if(compact||editorial)activeAnchors.value[4]='A specific beneficiary and workflow outcome';
    if(noCTA)activeAnchors.clarity[4]=shortAsset?'A clear, restrained headline; no CTA required':'A clear, restrained takeaway; no CTA required';
    if(input.goal!=='attention'&&!compact&&!editorial)activeAnchors.relevance[4]='A concrete reason to choose this approach over the current option';
    const allClaims=claims(message);
    const systemNames=[...message.matchAll(/\b(?:with|to|from|across|alongside|keep|keeps|retain|retains|replace|replaces|requires?(?: configured)?)\s+([A-Z][A-Za-z0-9_-]*(?:\s+(?:[A-Z][A-Za-z0-9_-]*|365))?)/g)].map(m=>m[1]);
    for(const s of ps){const m=s.match(/^([A-Z][A-Za-z0-9_-]*)\s+(?:connects?|integrates?|retrieves?|syncs?|works?)\b/);if(m&&!/^(?:We|It|Our|IT|They)$/.test(m[1]))systemNames.push(m[1]);}
    const hasSystem=s=>P.system.test(s)||systemNames.some(name=>new RegExp('\\b'+name+'\\b').test(s));
    function row(id, tests) {
      let level=0,quote='', checks=[];
      for(const [label,find] of tests) {
        const found=Boolean(find);
        checks.push({label,found,quote:typeof find==='string'?find:''});
        if(level===checks.length-1 && found){level++;if(typeof find==='string')quote=find;}
      }
      return {id,level,quote,checks,reason:anchors[id][level],next:needs[id][Math.min(3,level)],cap:''};
    }
    const first=(...p)=>ps.find(s=>matches(s,...p))||'';
    const problem=first(P.problem), problemPassages=ps.filter(s=>sentence(s,compact?4:6)&&matches(s,P.problem,P.buyer,P.task));
    const specificProblem=problemPassages[0]||'', consequence=problemPassages.find(s=>P.consequence.test(s))||'';
    const benefit=ps.find(hasBenefit)||'', benefitPassages=ps.filter(s=>sentence(s,compact?4:6)&&hasBenefit(s)&&P.task.test(s));
    const specificBenefit=benefitPassages[0]||'', mechanism=benefitPassages.find(s=>P.mechanism.test(s))||'';
    const fit=ps.find(s=>P.interaction.test(s)&&!denied(s))||'', concreteFit=ps.find(s=>sentence(s)&&P.interaction.test(s)&&hasSystem(s)&&!denied(s))||'';
    const trust=first(P.trust,P.object)||first(P.control)||first(/\b(?:SOC 2|ISO 27001)\b/i);
    const controlPassages=ps.filter(s=>sentence(s)&&matches(s,P.control,P.object)&&!denied(s));
    const concreteControl=controlPassages[0]||'';
    const source=ps.find(s=>P.source.test(s)&&!hollow(s))||'';
    const traceable=ps.find(identifiableSource)||'';
    const scoped=ps.find(s=>identifiableSource(s)&&P.scope.test(s))||'';
    const usable=ps.filter(s=>sentence(s,compact?4:6));
    const length=words(message).length, average=length/Math.max(1,ps.length);
    const clear=usable.length>0 && average<=28 && (message.match(marketing)||[]).length<=1;
    const cta=ps.find(s=>(input.goal==='attention'?P.lowCTA:P.CTA).test(s)&&/\b(?:guide|report|case study|checklist|session|workflow|demo|pilot|plan|assessment|questions?|example|replay|approach|with|how|why|what)\b/i.test(s))||'';
    const rows={
      relevance:row('relevance', [['Buyer pressure',problem],['Specific buyer and task',specificProblem],['Consequence',consequence],[input.goal==='attention'||compact||editorial?'Reason to reconsider':'Concrete contrast with current option',consequence&&ps.find(s=>P.reframe.test(s)&&(input.goal==='attention'||compact||editorial||P.mechanism.test(s)))]]),
      value:row('value', [['Benefit',benefit],['Workflow outcome',specificBenefit],['Mechanism',mechanism],[compact||editorial?'Beneficiary and workflow':'Measure, population and period',mechanism&&benefitPassages.find(s=>P.mechanism.test(s)&&(compact||editorial?P.buyer.test(s):matches(s,P.measure,P.population,P.period)))]]),
      fit:row('fit', [['System interaction',fit],['Named system and action',concreteFit],['Role in the stack',concreteFit&&ps.find(s=>P.role.test(s)&&hasSystem(s)&&!denied(s))],['Dependency or boundary',concreteFit&&ps.find(s=>P.dependency.test(s)&&hasSystem(s)&&!denied(s))]]),
      trust:row('trust', [['Trust signal',trust],['Control and object',concreteControl],['Control owner',controlPassages.find(s=>P.owner.test(s))||''],['Boundary or responsibility',concreteControl&&ps.find(s=>!denied(s)&&matches(s,/\b(?:only|limited|requires?|except|retain|responsib|until|before|after)\w*\b/i,P.object))]]),
      proof:row('proof', [['Source reference',source],['Traceable attribution',traceable],['Relevant scope',scoped],['Result or control with scope',scoped&&((P.measure.test(scoped)&&P.task.test(scoped))||P.control.test(scoped))?scoped:'']]),
      clarity:row('clarity', [['Usable text',length>=3&&(ps[0]||'')],['Concrete proposition',usable[0]||''],['Readable, restrained wording',clear&&usable[0]],['Stage-appropriate next step',noCTA?clear&&usable.find(s=>hasBenefit(s)&&P.task.test(s)):cta]])
    };
    const numberWithoutSource=allClaims.some(c=>c.context==='Assertion'&&!c.attributed);
    if(numberWithoutSource&&rows.proof.level>1) {
      rows.proof.level=1;rows.proof.cap='An asserted claim has no attribution in its passage. Support elsewhere is not automatically linked to it.';
      rows.proof.quote=allClaims.find(c=>c.context==='Assertion'&&!c.attributed).quote;
    }
    if(allClaims.some(c=>c.type==='Absolute assurance'&&c.context==='Assertion')) {
      rows.trust.level=Math.min(1,rows.trust.level);rows.trust.cap='An absolute assurance needs a scope review before controls earn stronger credit.';
      rows.trust.quote=allClaims.find(c=>c.type==='Absolute assurance'&&c.context==='Assertion').quote;
    }
    if((shortAsset&&length>45)||(format.kind==='outreach'&&length>200)) {
      rows.clarity.level=Math.min(2,rows.clarity.level);
      rows.clarity.cap=`At ${length} words this exceeds the ${shortAsset?'45-word headline/ad':'200-word outreach'} review limit; check the actual unit the buyer will see.`;
    }
    for(const [id,r] of Object.entries(rows)) {
      r.weight=weights[id];r.points=r.level/4*r.weight;r.available=r.weight-r.points;
      r.reason=r.cap||activeAnchors[id][r.level];r.next=needs[id][Math.min(3,r.level)];r.anchors=activeAnchors[id];
      if((compact||editorial)&&id==='value'&&r.level===3)r.next='Name the people who benefit from the workflow improvement.';
      if(noCTA&&id==='clarity'&&r.level===3)r.next='State a clear takeaway that a buyer can repeat; an explicit CTA is optional here.';
      if(input.goal!=='attention'&&!compact&&!editorial&&id==='relevance'&&r.level===3)r.next='Contrast the approach with a real alternative and name the mechanism that makes it different.';
      if(r.cap)r.next=id==='trust'?'Narrow the absolute assurance and state its scope, exceptions and responsibility.':id==='proof'?'Attribute each material asserted claim, or narrow the promise until it can be supported.':'Test the actual shorter headline or outreach copy as a separate asset.';
    }
    const raw=Object.values(rows).reduce((n,r)=>n+r.points,0),total=Math.round(raw);
    const ranked=Object.keys(rows).filter(id=>weights[id]>0&&rows[id].level<4).sort((a,b)=>rows[b].available-rows[a].available||a.localeCompare(b));
    // Address comprehension first when the basic proposition is still missing.
    const gate=['clarity','relevance','value'].find(id=>weights[id]>0&&rows[id].level<2);
    if(gate)ranked.unshift(...ranked.splice(ranked.indexOf(gate),1));
    const proofText=String(input.proof||'').trim();
    const hasContext=proofText.length>0&&!/^(?:none|not supplied|no (?:approved |supporting )?proof.*|n\/a)$/i.test(proofText);
    const status=hasContext?'Supplied · unverified':numberWithoutSource?'Claims need sources':traceable?'Referenced · unverified':source?'Source mentioned · not identifiable':'No source supplied';
    const criticalClaims=allClaims.filter(c=>c.risk==='high'&&c.context==='Assertion');
    return {version,rows,weights,raw,total,ranked,claims:allClaims,criticalClaims,status,shortAsset,format:format.name,
      label:criticalClaims.length?'Claim review required':total>=80?'Strong structure':total>=60?'Promising':total>=40?'Needs work':'Reframe the message',
      method:`${format.name} at ${stage.label}: ${compact?'a specific beneficiary and workflow replace a full success metric; technical detail and inline proof carry no points. ':editorial?'a specific beneficiary and workflow replace a full success metric. ':''}${noCTA?'A CTA is optional for this format. ':''}Each scored criterion earns 0–4; contribution = level ÷ 4 × the displayed format-and-stage weight. The six contributions total 100 possible points. Claims still need checking.`};
  }
  return {version,stages,formats,anchors,needs,passages,claims,assess};
})();
