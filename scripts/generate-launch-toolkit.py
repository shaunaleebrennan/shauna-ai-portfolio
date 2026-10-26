#!/usr/bin/env python3
"""Build the launch planning leave-behinds using portfolio typography and palette."""
from pathlib import Path
import json,html,shutil
from zipfile import ZipFile,ZIP_DEFLATED
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from pypdf import PdfReader
ROOT=Path(__file__).resolve().parents[1]; OUT=ROOT/'assets/playbooks'; W,H=A4;M=45;CW=W-2*M
for name,file in [('Body','DMSans-Regular.ttf'),('Bold','DMSans-SemiBold.ttf'),('Display','Manrope-Medium.ttf')]:pdfmetrics.registerFont(TTFont(name,str(ROOT/'assets/fonts'/file)))
pdfmetrics.registerFontFamily('Body',normal='Body',bold='Bold',italic='Body',boldItalic='Bold')
INK='#171e18';MUTED='#5f675d';CREAM='#f8f6f0';LAV='#f0eaf6';GREEN='#edf3e5';ACID='#c9ff63';PINK='#f7e3e9'
c=None
def rect(x,t,w,h,colour):
 c.setFillColor(HexColor(colour));c.roundRect(x,H-t-h,w,h,7,fill=1,stroke=0)
def text(t,x,top,w,size=11,lead=16,font='Body',colour=INK):
 st=ParagraphStyle('p',fontName=font,fontSize=size,leading=lead,textColor=HexColor(colour));o=Paragraph(t,st);_,h=o.wrap(w,1500)
 assert top+h<785 or top>=800,(top,h,t[:80]);o.drawOn(c,x,H-top-h);return h

def para(t,y,size=11):return y+text(t,M,y,CW,size,size*1.48)+15

def sub(t,y):return y+text(t,M,y,CW,15,20,'Display')+12

def callout(t,y,colour=GREEN):
 st=ParagraphStyle('note',fontName='Body',fontSize=11,leading=16,textColor=HexColor(INK));o=Paragraph(t,st);_,h=o.wrap(CW-32,900);rect(M,y,CW,h+30,colour);o.drawOn(c,M+16,H-y-15-h);return y+h+48

def top(n,title,deck,total=10,workbook=False):
 c.setFillColor(HexColor(CREAM));c.rect(0,0,W,H,fill=1,stroke=0);rect(M,27,24,4,ACID)
 text('PRODUCT LAUNCHES / '+('WORKBOOK' if workbook else 'PLAYBOOK'),M+35,24,CW-35,8,11,'Bold',MUTED)
 text(title,M,66,CW,30,36,'Display');y=66+Paragraph(title,ParagraphStyle('t',fontName='Display',fontSize=30,leading=36)).wrap(CW,500)[1]+18
 y+=text(deck,M,y,CW,12,18,colour=MUTED)+28
 c.setStrokeColor(HexColor('#dcded3'));c.line(M,46,W-M,46)
 text('Shauna Azevedo-Brennan · Make the moment matter.',M,803,CW-40,7.5,10,colour=MUTED)
 text(f'{n:02} / {total:02}',W-M-35,803,35,7.5,10,'Bold',MUTED)
 return y

def finish():c.showPage()
def source(t,y):return para('<font color="#5f675d">'+t+'</font>',y,9)

c=canvas.Canvas(str(OUT/'launch-with-intent-playbook.pdf'),pagesize=A4);c.setTitle('Product launches. Make the moment matter.');c.setAuthor('Shauna Azevedo-Brennan')
y=top(1,'Product launches.<br/>Make the moment matter.','A practical framework for PMMs and Product Managers to tier launches, group releases, and plan who hears what, when.')
c.drawImage(str(OUT/'illustrations/make-the-moment-matter.jpg'),M,H-y-274,CW,274,mask='auto');y+=300
y=callout('Ship at the pace the product needs. Communicate at the pace customers can use. <b>Launch when you have a story worth their attention.</b>',y)
y=para('Read the method. Work through the six questions with your PM. Use the workbook to record the evidence and agree the decision.',y)
y=source('Independent practical synthesis. Tiering foundations are credited to Intercom, Appcues, and Ready for Launch. Edition 2 · October 2026.',y);finish()
y=top(2,'Make the choice<br/>before the plan.','Start with the customer’s job and the commercial opportunity. Leave the asset list for later.')
for title,body in [('01 / Tier it','How much does it matter? Name who values the change, what they can do, and how that could affect acquisition, expansion, retention, or adoption.'),('02 / Group it','Is it stronger together? Look for releases that let the same audience complete a more valuable job. A shared date is not enough.'),('03 / Sequence it','Who needs what, when? Separate product availability, customer preparation, and the market moment.')]:y=sub(title,y);y=para(body,y)
y=callout('A launch tier is a resource decision. Customer preparation is an impact decision. A quiet release can still need serious preparation.',y,LAV)
y=sub('Bring two perspectives to the decision',y);y=para('<b>Product:</b> customer job, capability, dependencies, quality, and availability.<br/><b>PMM:</b> buying reason, evidence, alternatives, narrative, and audience timing.<br/><b>Together:</b> agree the tier, path, owner, and open questions.',y);finish()
y=top(3,'Give the right change<br/>the right attention.','Use these tiers as starting points. Record why your launch belongs there.')
for title,body,motion,col in [('P0 / Scream','A new product, market, or buying case changes the GTM.','Dedicated strategy and a coordinated market moment.',LAV),('P1 / Shout','A strong reason to choose, expand, or reconsider for a defined audience.','Focused story, proof, field enablement, and adoption support.',PINK),('P2 / Cheer','An existing job gets meaningfully easier.','Targeted education, documentation, and relevant field updates.',GREEN),('P3 / Whisper','A small improvement or fix matters to affected users.','Release notes and contextual guidance, with preparation scaled to impact.',CREAM)]:
 rect(M,y,CW,107,col);text(title,M+18,y+14,120,16,21,'Display');text(body,M+153,y+13,CW-172,11,16);text(motion,M+153,y+59,CW-172,9.5,14,colour=MUTED);y+=119
 y=min(y,730)
y=source('P0–P3 follow my original template. Other frameworks use different labels. A parity feature can deserve P1 when it removes a major blocker; novelty alone does not set the tier.',y);finish()
y=top(4,'Group the outcome.<br/>Then test the promise.','A collection earns more investment when its combined value changes the buying case.')
for title,body in [('Same audience','Are the releases valuable to the same people in the same situation?'),('Connected job','Do the capabilities work together to make a meaningful job possible or easier?'),('Stronger buying reason','Does the collection change the reason to buy, expand, renew, or adopt?'),('Credible availability','Can customers access the parts required for the stated outcome?'),('A clear headline','Can you explain the outcome in one sentence without listing features?')]:y=sub(title,y);y=para(body,y)
y=callout('If removing a feature leaves the story clearer, it may belong in a release note rather than the headline.',y,LAV)
y=source('Intercom’s 2019 guidance already described grouping, impact, and targeting. This playbook applies those principles through a shared PMM–PM decision and audience plan.',y);finish()
y=top(5,'One plan.<br/>Different moments.','What customers need next and what the market needs to understand are different jobs.')
for title,body,col in [('Product / What can people access?','Confirm cohorts, dates, packaging, dependencies, and support. Separate available capability from planned additions.',LAV),('Customers / What do they need to do?','Prepare admins before setup or permission changes. Help users when they have access. Explain expansion value to the relevant buyers.',PINK),('Market / Why should they reconsider?','Connect the capabilities to an important outcome and credible difference. Launch when availability and proof support the story.',GREEN)]:y=sub(title,y);y=para(body,y)
y=callout('<b>Batch the market story. Keep customer guidance timely.</b><br/>Never hold back material change information or useful guidance while waiting for a campaign date.',y)
y=sub('When something slips',y);y=para('Narrow the promise, change the audience, or move the moment. If you show a future direction, say what is available now, what comes later, and what the outcome depends on.',y);finish()
y=top(6,'AI changes the pace.<br/>Keep the buying reason clear.','More output makes deliberate choices and accurate product promises more valuable.')
y=sub('The pressure is visible',y);y=para('In a September 2026 Appcues × Navattic survey, 75% reported faster shipping and 7% said their launch process kept up. The sample was 60 marketers through vendor networks: a directional signal, not a universal benchmark or proof that AI caused the acceleration.',y)
for title,body in [('Make AI earn its place','Explain the task, the change in how work gets done, and why the audience values it. The technology label does not raise the tier.'),('Connect tomorrow to today','Give buyers a credible direction and value they can access now. Check the alternatives they actually consider, including tools they already own.'),('Keep the promise current','Use AI to flag affected messaging and assets when product facts change. Product verifies the capability; PMM owns the interpretation. For AI actions, check outcomes, limits, and human input.')]:y=sub(title,y);y=para(body,y)
y=source('April Dunford’s May 2026 positioning guidance informs the actual-alternatives and future-to-present lens. Anthropic’s agent evaluation guidance informs outcome checks. These launch applications are my interpretation.',y);finish()
y=top(7,'Pressure-test<br/>the awkward cases.','Use these fictional situations to calibrate the team’s judgment.')
for title,body in [('A collection','A connector, mobile access, and an approved action ship separately. Customers receive guidance at each stage. The wider market hears the complete workflow story once it is available and proven. Tier the combined outcome.'),('A buying blocker','An identity integration is familiar in the category but essential to a valuable segment. Deal evidence supports a targeted P1 investment. A capability can change the buying case without being new to the market.'),('An AI behaviour change','An assistant can now take an action after confirmation. Promotion may stay quiet, while administrators and users need clear preparation on permissions, responsibility, and recovery.')]:y=sub(title,y);y=para(body,y)
y=callout('Ask your PM: would we make the same investment if this feature had a less exciting name?',y,PINK)
y=source('Public observation: Fin 4 presents several developments through a broader customer-experience direction. That illustrates a connected market story; it does not establish internal planning, rollout timing, or results.',y);finish()
y=top(8,'Make the decision<br/>easy to use again.','Use the workbook in a 25-minute release review. Bring evidence, not a finished campaign.')
for title,body in [('Before / Bring the inputs','A short list of releases, the customer problem, availability and dependencies, customer or deal signals, and the actual alternatives.'),('Minutes 0–8 / Establish the value','Work through the six diagnostic questions. Separate what you know from what you assume. Agree the provisional tier.'),('Minutes 8–16 / Test the collection','Map related releases to one audience and outcome. Keep unrelated changes separate. Confirm what a slipped dependency would change.'),('Minutes 16–25 / Agree the audience plan','Decide what admins, users, buyers, the field, and the market need. Assign an owner, open questions, and a review trigger.')]:y=sub(title,y);y=para(body,y)
y=callout('End with a decision you can explain: tier, collection or individual path, audience timing, preparation, owner, and unresolved evidence.',y)
y=para('After launch, check eligible reach, first value, repeat use, and the relevant commercial goal. Choose a review window that fits the usage and buying cycle. Use what you learn to improve the next decision.',y);finish()
y=top(9,'Sources and influences.','Credit the foundations. Be clear about the extensions and the limits of the evidence.')
sources=json.loads((OUT/'launch-sources.json').read_text())
for a,b,u,d in sources:
 title=html.escape(a+' · '+b);desc=html.escape(d)
 y+=text('<link href="'+u+'" color="#435735"><b>'+title+'</b></link>',M,y,CW,9.2,13)+5
 y+=text(desc,M,y,CW,8.7,12,colour=MUTED)+12
finish()
y=top(10,'Your decision guide.','One page to keep beside the roadmap. Use with your PM before committing GTM effort.')
for title,body in [('01 / What changes?','Name the customer outcome and commercial consequence. Choose a provisional tier: P0 changed GTM; P1 buying reason or blocker; P2 an easier existing job; P3 small improvement.'),('02 / Who values it?','Identify the audience and evidence. Unknown value makes the choice provisional. A focused segment can justify meaningful investment.'),('03 / Is it stronger together?','Same audience, connected job, stronger outcome. Group when those hold; keep coincidental releases separate.'),('04 / Does timing support the story?','Guide customers as parts ship. Announce the complete outcome when the essential parts are available. Keep uncertain dates provisional.'),('05 / What must customers do?','Scale preparation to learning, setup, permissions, or workflow change. This does not automatically change promotional intensity.'),('06 / Can we support the promise?','Check scope, availability, price, limits, demonstration, and evidence. Narrow claims or resolve gaps before promotion.')]:y=sub(title,y);y=para(body,y,10.5)
y=source('Agree: tier · grouping · audience timing · preparation · owner · review trigger. Override the diagnostic when evidence supports it, and write down why. The tier is a judgment, not an approval or prediction.',y);finish();c.save()
assert len(PdfReader(OUT/'launch-with-intent-playbook.pdf').pages)==10

# Four-page printable session workbook; deliberately generous writing space.
c=canvas.Canvas(str(OUT/'launch-with-intent-workbook.pdf'),pagesize=A4);c.setTitle('Product launch planning workbook');c.setAuthor('Shauna Azevedo-Brennan')
def field(title,prompt,y,height=100):
 text(title,M,y,CW,12,17,'Bold');ph=text(prompt,M,y+24,CW,9,13,colour=MUTED);first=y+24+ph+19
 for t in range(int(first),int(y+height-4),23):
  c.setStrokeColor(HexColor('#cbd0c2'));c.line(M,H-t,W-M,H-t)
 return y+height+20

y=top(1,'What deserves<br/>the investment?','PMM + Product / Bring the customer problem, commercial evidence, and release context.',4,True)
y=field('The audience and their job','Who values this, and what are they trying to accomplish?',y,105)
y=field('The change and the buying reason','What becomes possible or easier? Why would they choose, expand, renew, or adopt?',y,115)
y=field('Evidence and actual alternatives','Customer, deal, usage, or market signals. What would they do without us?',y,115)
y=field('Provisional tier and the reason','P0 / Scream · P1 / Shout · P2 / Cheer · P3 / Whisper. What would change our mind?',y,110);finish()
y=top(2,'What belongs together?','Map one possible collection. Keep the connected customer outcome in view.',4,True)
y=field('One audience. One job. One stronger outcome.','Write the collection headline without listing features.',y,100)
cols=[M,M+CW*.42,M+CW*.68];widths=[CW*.42,CW*.26,CW*.32]
for x,w,t in zip(cols,widths,['Release / capability','Availability / cohort','Dependency / contribution']):rect(x,y,w-4,37,GREEN);text(t,x+8,y+8,w-20,8.5,12,'Bold')
y+=42
for _ in range(4):
 for x,w in zip(cols,widths):
  c.setStrokeColor(HexColor('#cbd0c2'));c.rect(x,H-y-54,w-4,54,fill=0,stroke=1)
 y+=59
y+=14;y=field('Group, separate, or investigate?','Does the combined outcome earn a higher tier? Which part can we remove? What if one part slips?',y,100);finish()
y=top(3,'Who needs what,<br/>and when?','Availability, customer understanding, and market attention can move on different dates.',4,True)
for title,prompt in [('Administrators and support','What must they prepare before access, setup, permissions, or responsibilities change?'),('Eligible users','When can they use it? What guidance gets them to the first valuable outcome?'),('Account buyers and the field','What changes the commercial conversation? What is included, paid, or still planned?'),('The wider market','What is the connected story? Which availability and proof conditions set the moment?')]:y=field(title,prompt,y,112)
finish()
y=top(4,'Agree the decision.<br/>Make it reviewable.','Leave with owners, evidence gaps, and a reason to revisit the plan.',4,True)
y=field('Our decision','Tier, collection or individual path, key dates, and any override of the diagnostic.',y,100)
y=field('Readiness and proof still to resolve','Capability, availability, pricing, claims, dependencies, and customer preparation.',y,100)
y=field('Owners and review trigger','Who decides? Who does what? Which change would reopen the decision?',y,100)
y=field('What will tell us the value landed?','First value, repeat use, commercial goal, baseline, and an appropriate review window.',y,100)
y=source('Close the loop: explain one thing you chose not to do, and where that time or budget will go instead. Use page 10 of the playbook as the quick decision guide.',y);finish();c.save()
assert len(PdfReader(OUT/'launch-with-intent-workbook.pdf').pages)==4

agenda='''# Start here: make the next release review useful

1. Read page 10 of the playbook for the one-page decision guide.
2. Bring a PM and PMM, a release list, and relevant customer or commercial evidence.
3. Use the six questions online or the four workbook pages.
4. Spend 8 minutes on value, 8 on grouping, and 9 on audience timing and ownership.
5. Record the decision in the editable canvas. Print it or export Markdown to your existing shared workspace.

## Filled example (fictional)
Audience: mobile employees handling routine workplace requests.
Outcome: complete a supported request on their phone.
Parts: connector, mobile access, confirmed action.
Tier: provisional P1; revisit for the combined buying reason.
Grouping: collection, because the parts complete one job.
Timing: customer guidance at each release; market story once the full workflow is available and demonstrated.
Preparation: admins configure access; users learn confirmation and exception handling.
Open decision: validate which cohorts and plans can access all required parts.
Review: named PM and PMM check access, claims, support, and first-value evidence before committing the market date.

The tools support judgment. They do not approve a launch or predict its result.
'''
(OUT/'launch-session-start-here.md').write_text(agenda)
# A reusable single-file canvas, rather than another intake brief.
fields=[('Customer and outcome','One audience, one job, and the outcome they value.'),('Tier and evidence','Provisional tier, commercial consequence, evidence, and any override.'),('Release collection','Each capability, contribution, availability, cohort, and dependency.'),('Audience timing','Admins / users / buyers and field / wider market: what each needs and when.'),('Owners and open decisions','Decision owner, action owners, proof gaps, and conditions that reopen the plan.'),('Success and review','First value, repeat use, commercial goal, baseline, and review date.')]
canvas_html='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Launch decision canvas</title><style>*{box-sizing:border-box}body{font:16px/1.5 Arial,sans-serif;background:#f8f6f0;color:#171e18;margin:0;padding:40px}main{max-width:1100px;margin:auto}h1{font-size:42px;letter-spacing:-2px;line-height:1.1}p{max-width:760px;color:#5f675d}.grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}label{display:block;font-weight:bold;background:#fffefa;border:1px solid #dcded3;border-radius:12px;padding:22px}small{display:block;font-weight:normal;color:#5f675d;margin:8px 0}textarea{display:block;width:100%;min-height:170px;font:16px/1.5 Arial;border:1px solid #dcded3;background:#f8f6f0;padding:12px;resize:vertical}button{border:1px solid #435735;border-radius:30px;background:#c9ff63;padding:12px 20px;margin:20px 10px 0 0;cursor:pointer;font:inherit}:focus-visible{outline:3px solid #66517e;outline-offset:4px}@media(max-width:650px){body{padding:20px}.grid{grid-template-columns:1fr}h1{font-size:34px}}@media print{body{padding:0;background:white;font-size:10pt}h1{font-size:27px}.grid{gap:12px}label{break-inside:avoid;padding:14px}textarea{border:0;min-height:140px;font-size:10pt}button,.privacy{display:none}}</style><main><p>THE PMM PLAYBOOKS / PRODUCT LAUNCHES</p><h1>One shared launch decision.</h1><p>Use this with your PM after the six-question diagnostic. Keep the evidence and the reasoning together.</p><p class="privacy">Notes stay in this page. Download Markdown before leaving, or print to PDF. This canvas does not autosave or send your notes to an AI service.</p><form id="canvas"><div class="grid">FIELDS</div><button type="button" id="print">Print / save as PDF</button><button type="submit">Download decisions as Markdown</button><p role="status" id="status"></p></form><p>Shauna Azevedo-Brennan · Make the moment matter.</p></main><script>document.querySelector('#print').onclick=()=>window.print();document.querySelector('#canvas').onsubmit=e=>{e.preventDefault();let t='# Launch decision canvas\\n\\n';for(const [k,v] of new FormData(e.currentTarget))t+='## '+k+'\\n'+(v.trim()||'[To decide]')+'\\n\\n';const u=URL.createObjectURL(new Blob([t],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=u;a.download='launch-decision.md';a.click();setTimeout(()=>URL.revokeObjectURL(u),1000);document.querySelector('#status').textContent='Downloaded. Add this record to your team’s shared workspace.';};</script></html>'''.replace('FIELDS',''.join('<label>'+a+'<small>'+b+'</small><textarea name="'+a+'"></textarea></label>' for a,b in fields))
(OUT/'launch-planning-canvas.html').write_text(canvas_html)
with ZipFile(OUT/'launch-planning-toolkit.zip','w',ZIP_DEFLATED) as z:
 for f in ['launch-with-intent-playbook.pdf','launch-with-intent-workbook.pdf','launch-planning-canvas.html','launch-session-start-here.md']:z.write(OUT/f,f)
print('Built 10-page playbook, 4-page workbook, editable canvas, and complete toolkit.')
