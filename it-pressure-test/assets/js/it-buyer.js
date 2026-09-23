import { awarenessIndicator } from "./awareness.js";
import {profiles,buyingRoles,buyerFocus,goals,dims,esc,analyse,react,verdict,evidenceStatus,rewriteBrief,summary} from "./it-engine.js?v=3.2.1";
const $=s=>document.querySelector(s);let current=null;
function data(){return{persona:$("#persona").value,buyingRole:$("#buying-role").value,goal:$("#goal").value,region:$("#region").value,assetType:$("#asset-type").value,solution:$("#solution").value.trim(),alternatives:$("#alternatives").value.trim(),proof:$("#proof").value.trim(),awareness:$("#awareness").value,message:$("#message").value}}function persona(){const p=profiles[$("#persona").value],b=buyingRoles[$("#buying-role").value];$("#persona-preview").innerHTML=`<strong>${p.name} · ${b.name}</strong>${p.summary} In this purchase, this reader ${b.summary.charAt(0).toLowerCase()+b.summary.slice(1)} Looks for ${p.cares}.`;[...$(".lens-card ul").children].forEach((x,i)=>x.textContent=Object.values(p.questions)[i])}
const points=n=>Number(n.toFixed(2)).toString();
function breakdown(r){
  return `<p class="help">Rubric ${esc(r.audit.version)} · ${esc(r.rule.label)} · ${esc(r.audit.format)}. Editorial weights and thresholds; not calibrated against buyer outcomes. Audience and buying role shape the questions, not hidden score bonuses.</p><p>${esc(r.audit.method)}</p><div class="score-table-wrap"><table class="claim-table"><thead><tr><th>Criterion</th><th>Level</th><th>Points</th></tr></thead><tbody>${Object.entries(r.audit.rows).map(([id,x])=>`<tr><td>${esc(dims[id].name)}</td><td>${x.weight?`${x.level}/4`:'Not required'}</td><td>${points(x.points)} / ${x.weight}</td></tr>`).join('')}</tbody><tfoot><tr><th>Total</th><td>Rounded once</td><th>${r.total} / 100</th></tr></tfoot></table></div><p class="help">Only the pasted message earns points. Optional proof and background context cannot inflate the score. Repeated wording earns no additional credit. A short asset can link to supporting material elsewhere.</p>${Object.entries(r.audit.rows).filter(([,x])=>x.weight).map(([id,x])=>`<details class="criterion"><summary>${esc(dims[id].name)} · ${points(x.points)} / ${x.weight}</summary><p>${esc(x.reason)}</p>${x.quote?`<blockquote>“${esc(x.quote)}”</blockquote>`:'<p>No matching passage detected.</p>'}<ol start="0" class="anchors">${x.anchors.map((a,i)=>`<li${i===x.level?' class="selected-anchor"':''}>${esc(a)}${i===x.level?' ← current estimate':''}</li>`).join('')}</ol><p class="help">${x.level<4?`To strengthen this: ${esc(x.next)}`:'The text meets these structural checks. Meaning and truth still need human review.'}</p></details>`).join('')}<p class="help">The local rules can miss nuance and whether passages belong together. The tool checks contrast in the supplied text, not competitor pages. Compare drafts only within this rubric, stage and format; small point differences have no validated significance. No score is a purchase prediction or a verified fact check.</p>`;
}
function render(r){
  current=r;
  $('#results').hidden=false;
  $('#score').textContent=r.total;
  $('#score-ring').style.setProperty('--score',r.total);
  $('#score-ring').setAttribute('aria-label',`Messaging score ${r.total} out of 100. Automated estimate.`);
  $('#evidence-status').textContent=evidenceStatus(r);
  $('#verdict-title').textContent=r.audit.label;
  $('#verdict-tag').textContent=`${r.rule.label} · ${r.audit.format}`;
  $('#verdict-copy').textContent=r.audit.criticalClaims.length?`Critical claim to check: “${r.audit.criticalClaims[0].quote}” The numeric score does not clear this claim.`:`Scored against this ${r.audit.format} alone. A short asset cannot stand in for a full purchase case. Check the reasoning and sources.`;
  $('#reaction-label').textContent='Gut Reaction';
  $('#reaction').textContent=react(r);
  $('#priorities').innerHTML=r.ranked.length?r.ranked.slice(0,3).map(id=>{const x=r.audit.rows[id];return `<li><b>${esc(dims[id].name)}</b><span>${esc(x.next)}</span><small class="points-note">${esc(x.reason)}</small></li>`}).join(''):'<li>All structural checks are met. Have a reviewer confirm the evidence and audience fit.</li>';
  const ids=[...r.ranked,...Object.keys(dims)].filter((id,i,a)=>a.indexOf(id)===i).slice(0,3);
  const focus=buyerFocus[r.persona]||'value';
  const buyerQuestions=[...new Set([ids[0],focus,...ids])].slice(0,r.alternatives?2:3);
  $('#questions').innerHTML=buyerQuestions.map(id=>`<li>${esc(r.profile.questions[id])}</li>`).join('')+(r.alternatives?`<li>Compared with ${esc(r.alternatives)}, what can you substantiate as different?</li>`:'');
  $('#score-explanation').innerHTML=breakdown(r);
  $('#score-details').open=false;
  $('#deep-results')?.remove();
  $('#deep-review').textContent='Run deep review';
  $('#results').scrollIntoView({behavior:'smooth'});
}
function runDeep(r){
  if(!r)return;
  let box=$('#deep-results');
  if(!box){box=document.createElement('section');box.id='deep-results';box.className='deep-review';$('#results .actions').before(box);}
  const stage={attention:'Make a current roadblock recognisable, offer a useful new way to approach it and earn the next step. A headline does not need the full evaluation case.',shortlist:'Compare the approach with the existing option. Explain the system role, mechanism and relevant evidence.',evaluation:'Make the business case, controls, implementation dependencies and commercial implications defensible.'}[r.goal];
  box.innerHTML=`<span class="step">Deep review</span><h2>Evidence and rewrite direction</h2><p>${esc(stage)}</p><p class="help">Awareness: ${esc(r.awareness)} — ${esc(awarenessIndicator(r.awareness))}</p><p class="help">${esc(buyingRoles[r.buyingRole].summary)}</p><p><strong>Proof status:</strong> ${esc(r.audit.status)}. ${r.proof?'Supplied material is context; it has not been verified or automatically matched to the claims.':'No supporting material supplied separately.'}</p>${r.proof?`<details class="criterion"><summary>Supplied proof</summary><p>${esc(r.proof)}</p></details>`:''}<h3>Claims to check</h3>${r.audit.claims.length?r.audit.claims.map(c=>`<details class="criterion"><summary>${esc(c.type)} · ${esc(c.context)}</summary><blockquote>“${esc(c.quote)}”</blockquote><p>${esc(c.need)}</p><p class="help">${c.attributed?'A source reference appears in this passage; whether it supports the statement still needs checking.':'No source attribution was detected in this passage. This is a review prompt, not a finding that it is false.'}</p></details>`).join(''):'<p>No targeted claim pattern detected. That does not establish accuracy.</p>'}<details class="criterion"><summary>Buyer lens and rewrite brief</summary><p>${esc(r.profile.summary)} Looks for ${esc(r.profile.cares)}.</p><label for="rewrite-brief">Editable rewrite brief</label><textarea id="rewrite-brief" class="rewrite-brief">${esc(rewriteBrief(r))}</textarea><button id="copy-rewrite" class="button secondary" type="button">Copy rewrite brief</button></details>`;
  box.hidden=false;
  $('#deep-review').textContent='Refresh deep review';
  $('#copy-rewrite').addEventListener('click',()=>copy($('#rewrite-brief').value,'Rewrite brief copied'));
  box.scrollIntoView({behavior:'smooth',block:'start'});
}

async function copy(t,m){try{await navigator.clipboard.writeText(t)}catch{let x=document.createElement("textarea");x.value=t;document.body.append(x);x.select();document.execCommand("copy");x.remove()}toast(m)}function toast(m){let t=$("#toast");t.textContent=m;t.hidden=false;setTimeout(()=>t.hidden=true,1800)}function words(){let n=($("#message").value.match(/\b[\w’'-]+\b/g)||[]).length;$("#word-count").textContent=`${n} word${n===1?"":"s"}`}


function invalidate(){current=null;$("#results").hidden=true;$("#deep-results")?.remove();$("#deep-review").textContent="Run deep review";}
function awareness(){ $("#awareness-indicator").textContent=awarenessIndicator($("#awareness").value); }
$("#review-form").addEventListener("submit",e=>{e.preventDefault();const d=data();if(!d.message.trim())return $("#message").focus();invalidate();render(analyse(d));});
for(const event of ["input","change"]) $("#review-form").addEventListener(event,()=>{invalidate();persona();awareness();words();});
$("#load-example").addEventListener("click",()=>{invalidate();$("#review-form").reset();$("#persona").value="ai";$("#solution").value="enterprise AI assistant";$("#alternatives").value="Existing suite, point solutions, internal build, doing nothing";$("#message").value="Our next-generation platform transforms IT operations with seamless automation, intelligent insights and effortless integration. Unlock productivity and reduce costs across your entire business.";persona();awareness();words();});
$("#clear").addEventListener("click",()=>{invalidate();$("#review-form").reset();persona();awareness();words();});
$("#deep-review").addEventListener("click",()=>runDeep(current));
function exportText(){return summary(current)+( $("#rewrite-brief") ? "\n## Edited rewrite brief\n\n"+$("#rewrite-brief").value : "");}
$("#copy-summary").addEventListener("click",()=>{if(current)copy(exportText(),"Summary copied");});
$("#export").addEventListener("click",()=>{if(!current)return;const a=document.createElement("a"),url=URL.createObjectURL(new Blob([exportText()],{type:"text/markdown"}));a.href=url;a.download="it-positioning-pressure-test.md";a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
persona();awareness();words();
