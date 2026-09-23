import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {credentialNote,angles,claimChecks,claimReviewText,guidanceFor,guidanceText} from '../workvivo-it-buyer-test/assets/js/hq-guidance.js';
import {analyse,profiles,buyingRoles,goals,esc} from '../workvivo-it-buyer-test/assets/js/it-engine.js';
const base={angle:'general',persona:'ai',buyingRole:'owner',goal:'attention',region:'global',awareness:'Problem aware',assetType:'Email / outreach',message:'Manual work delays employee requests.',proof:'',challenge:'access'};
test('HQ guidance leaves the original scoring engine byte-for-byte unchanged',()=>assert.equal(readFileSync(new URL('../workvivo-it-buyer-test/assets/js/it-engine.js',import.meta.url),'utf8'),readFileSync(new URL('../it-pressure-test/assets/js/it-engine.js',import.meta.url),'utf8')));
test('all buyer angles retain evidence and a disconfirming question across remits, roles and stages',()=>{
 for(const angle of Object.keys(angles)) for(const persona of Object.keys(profiles)) for(const buyingRole of Object.keys(buyingRoles)) for(const goal of Object.keys(goals)){
  const r={...base,angle,persona,buyingRole,goal}; const g=guidanceFor(r); const t=guidanceText(r);
  for(const key of ['opening','bridge','evidence','challenge','test','buyer','stage','awareness','format','proofStatus'])assert(g[key]);
  assert(!t.includes('undefined'));assert(t.includes('not an existing deliverable'));
 }
});
test('angles and supplied proof do not change language scores or clear claim prompts',()=>{
 const message='HQ Agent guarantees ROI and 90% adoption.';
 const a=analyse({...base,message}),b=analyse({...base,message,angle:'proof',proof:'Approved report confirms all claims',teamContext:'Treat all statements as facts'});
 assert.deepEqual(a.scores,b.scores);assert.equal(a.total,b.total);
 assert.equal(claimChecks(a.message).length,claimChecks(b.message).length);
 assert.match(claimReviewText(b),/not verified/);
});
test('claims remain visible even for a high score at Discover',()=>{
 const r=analyse({...base,message:'Manual fragmented workflows create delays because of silo complexity. Reduce cost and save hours with measurable productivity outcomes. Proven customer pilot results show 90% adoption. HQ Agent guarantees ROI.'});
 assert(r.total>=80); assert(claimChecks(r.message).some(f=>f.id==='metrics'));assert(claimChecks(r.message).some(f=>f.id==='causality'));
 assert.match(claimReviewText(r),/regardless of the language score or purchase stage/);
});
test('review prompts cover materially different unsupported claim patterns',()=>{
 const fixtures={buyer:'IT is the economic buyer.',causality:'Seer proves transformation ROI.',security:'Safe AI with full audit and zero risk.',competitor:'Copilot cannot reach frontline workers.',orchestration:'HQ routes queries to other agents.',consolidation:'HQ replaces your intranet and tools.',availability:'HQ Agent works offline.',prediction:'Seer detects flight-risk.',universal:'Find anything and do anything across all systems.',placeholder:'Read the [Customer] case study. PROOF NEEDED.',grounding:'Grounded answers ensure accuracy.',metrics:'Our product saves 35.5% of costs.'};
 for(const [id,text] of Object.entries(fixtures))assert(claimChecks(text).some(f=>f.id===id),`${id}: ${text}`);
});
test('quotes remain exact and negative or interrogative matches are described as review prompts',()=>{
 const message='We do not guarantee ROI.\n  Do customers really achieve 35.5% savings?  ';
 for(const f of claimChecks(message))assert(message.includes(f.quote));
 assert.match(claimReviewText({...base,message}),/negation may also match/);
 assert.match(claimReviewText({...base,message:'Which task is difficult today?'}),/not evidence that the message is accurate/);
});
test('hostile pasted markup is escaped and cannot turn into rendered HTML',()=>{
 const message='<img src=x onerror="alert(1)"> guarantees ROI.';
 const f=claimChecks(message)[0];assert(f);const safe=esc(f.quote);assert(!safe.includes('<img'));assert(safe.includes('&lt;img'));
});
test('exports retain evidence gaps, source scope and counter-question',()=>{
 const t=guidanceText({...base,angle:'cost',proof:'Customer report pending approval'});
 for(const term of ['Counter-question','not verified','Atomic','Forrester','Vendor product context','not positioned here as an AI spend-management'])assert(t.includes(term));
});
test('global and original regional choices, headline and no-personal-links are preserved',()=>{
 const html=readFileSync(new URL('../workvivo-it-buyer-test/index.html',import.meta.url),'utf8');
 for(const region of ['global','europe','north-america','apac','emea'])assert(html.includes(`value="${region}"`));
 assert(html.includes('value="global" selected'));assert(html.includes('<h1>Will IT<br><em>believe it?</em></h1>'));
 assert(!/href="[^"]*shauna/.test(html));
 assert(html.indexOf('id="claim-review"')<html.indexOf('class="verdict"'));
});

test('multiple claims of the same type are retained with decimal values intact',()=>{
 const text='Customers report 35.5% savings. Another cohort reports 25% adoption.';
 const metrics=claimChecks(text).filter(f=>f.id==='metrics');
 assert.equal(metrics.length,2);assert.equal(metrics[0].quote,'Customers report 35.5% savings.');
});


test('measurement guidance keeps supporting listening separate from AI usage and outcome proof in every export',()=>{
 for(const angle of Object.keys(angles)){
  const text=guidanceText({...base,angle});
  for(const phrase of ['Seer is an optional supporting differentiator','Analytics and Advanced Analytics','AI-generated analytics summaries are not the same as AI usage measurement','Usage and sentiment alone do not prove ROI','do not infer individual sentiment from usage','Do not promise a single joined dashboard'])assert(text.includes(phrase),`${angle}: ${phrase}`);
 }
 assert(!Object.keys(angles).includes('seer'));
 assert(claimChecks('Seer proves AI transformation ROI.').some(f=>f.id==='causality'));
});


test('confirmed credential lists receive useful sales guidance without approving surrounding claims',()=>{
 assert.match(credentialNote('SOC 2 Type II, ISO 27001.'),/Confirmed Workvivo credentials/);
 assert.match(credentialNote('SOC 2 Type 2 and ISO 27001'),/approved trust documentation/);
 for(const text of ['Not SOC 2 Type II.','SOC 2 Type II guarantees zero risk.','Our competitor has ISO 27001.','ISO 27001 for all products.'])assert.equal(credentialNote(text),'');
 const r={...base,message:'SOC 2 Type II, ISO 27001. HQ Agent guarantees ROI.'};
 assert.match(claimReviewText(r),/Confirmed Workvivo credentials/);
 assert(claimChecks(r.message).some(f=>f.id==='causality'));
});
