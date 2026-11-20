import {recommend} from './launch-playbook.js?v=20261027-connected';
const form=document.querySelector('#launch-test');
let mapped=[];
const prep={light:'Light: contextual guidance',learn:'Learning: education and enablement',setup:'High: configuration and access',workflow:'High: workflow and responsibilities'};
function syncName(){document.querySelectorAll('.lc-name').forEach(el=>el.textContent=document.querySelector('#decision-name').value||'Name your release in Decide.');}
document.addEventListener('launch:handoff',e=>{
 mapped=e.detail.features;
 document.querySelector('#decision-name').value=mapped.map(f=>f.name).join(' + ');
 document.querySelector('#decision-evidence').value=mapped.map(f=>`${f.name}: ${f.evidence||'Evidence to establish'} (${f.position})`).join('\n');
 document.querySelector('#decision-outcome').value=e.detail.outcome;
 document.querySelector('#decision-context').textContent='Carried from your map. Your other answers are preserved; review them for this selection.';
 form.closest('details').open=true;syncName();document.querySelector('#recommendation').hidden=true;
 document.querySelector('#decision-name').focus();
});
form.addEventListener('input',()=>{syncName();document.querySelector('#recommendation').hidden=true;});
form.addEventListener('submit',()=>{
 const a=Object.fromEntries(new FormData(form)),r=recommend(a),out=document.querySelector('#recommendation');
 const grid=document.createElement('div');grid.className='lc-result-grid';
 for(const [label,title,body] of [['Promotional investment',r.tier,r.why],['Customer preparation',prep[a.effort],r.customer]]){
 const card=document.createElement('article');for(const [tag,text] of [['span',label],['h4',title],['p',body]]){const el=document.createElement(tag);el.textContent=text;card.append(el);}grid.append(card);
 }
 out.querySelector('h3').textContent='Your decision summary';out.querySelector('h3').after(grid);
 const intro=grid.nextElementSibling;if(intro?.tagName==='P')intro.remove();
 const select=document.querySelector('#journey-tier');select.value=r.tier.slice(0,2);select.dispatchEvent(new Event('change',{bubbles:true}));
 const next=document.createElement('a');next.href='#phase-sequence';next.className='button primary';next.textContent='Set dates and owners →';out.append(next);
});
form.addEventListener('reset',()=>{mapped=[];setTimeout(syncName,0);});
document.querySelector('#decision-export').addEventListener('click',()=>{
 const a=Object.fromEntries(new FormData(form));
 if(!['value','audience','group','timing','effort','proof'].every(k=>a[k])||!a.decision_name?.trim()){
 form.closest('details').open=true;document.querySelector('#export-status').textContent='Complete the six decisions and name your release before downloading.';form.reportValidity();return;
 }
 const r=recommend(a),lines=['# Launch decision record','','## Release or collection',a.decision_name,'','## Selected map entries',...mapped.map(f=>`- ${f.name}: ${f.position}. Evidence: ${f.evidence||'To establish'}`),'','## Decisions',`Promotional investment: ${r.tier}`,r.why,`Customer preparation: ${prep[a.effort]}`,r.customer,`Grouping: ${r.path}. ${r.group}`,`Timing: ${r.timing}`,'','## Open questions',...(r.flags.length?r.flags:['No automatic flags. Validate the evidence with Product.'])];
 const fields={decision_audience:'Audience',decision_outcome:'Customer outcome',decision_evidence:'Evidence',preparation_date:'Customer preparation date',availability_date:'Availability date',market_date:'Market communication date',decision_owner:'Decision owner',customer_owner:'Customer preparation owner',market_owner:'Market communication owner',customer_measure:'Customer success measure',commercial_measure:'Commercial goal and measure',review_date:'Review date',review_owner:'Review owner',review_notes:'Results and next decision'};
 for(const [key,label] of Object.entries(fields))lines.push('',`## ${label}`,a[key]?.trim()||'To agree');
 lines.push('','## Six answers');form.querySelectorAll('input[type=radio]:checked').forEach(el=>lines.push('- '+el.closest('label').textContent.trim()));
 const url=URL.createObjectURL(new Blob([lines.join('\n')],{type:'text/markdown;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='launch-decision-record.md';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);document.querySelector('#export-status').textContent='Decision record downloaded. Review open fields with Product.';
});
