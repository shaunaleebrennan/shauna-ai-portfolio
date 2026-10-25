#!/usr/bin/env python3
"""Build the complete guide and its accessible HTML companion from one source."""
from pathlib import Path
import re, html
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from pypdf import PdfReader, PdfWriter
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets/playbooks'
OUT.mkdir(parents=True,exist_ok=True)
PAGES=[]
def page(title,deck,*blocks): PAGES.append((title,deck,blocks))
def h(t): return ('h',t)
def p(t): return ('p',t)
def b(t): return ('b',t)
def note(t): return ('note',t)

page('Narrative design.\nChange the frame.', 'A practical playbook and workbook for turning market insight into a story people can understand, believe, and use.',
 h('Shauna Azevedo-Brennan'),
 p('Strategy that ships. Stories that stick.'),
 note('When competitors tell the same story, they reinforce the same buying criteria. Narrative design should challenge those criteria - with a market insight customers recognize and an approach your business can credibly lead.'),
 p('Build the argument. Connect it to the product. Test it with people. Then put it to work.'),
 p('Based on Marcus Andrews\u2019 five-stage Narrative Design method, with independent practical guidance on research, positioning, evidence, AI, and GTM execution.'),
 p('Visual edition 1.1 | 25 October 2026'))
page('How to use this guide', 'Start with the decision you need to influence. Use the method at the depth the work needs.',
 h('Three ways in'),
 b('<b>Build a narrative:</b> work through the brief, research, five stages, and evidence mapping. Use the workbook at the end to capture your decisions.'),
 b('<b>Improve a draft:</b> identify its central claim, run the pressure tests, and repair the earliest weak assumption. Edit the prose after the argument holds together.'),
 b('<b>Run a workshop:</b> bring the evidence, use the facilitation plan, and record decisions and open questions. Agreement on wording is only part of the work.'),
 h('What is inside'),
 p('03 Positioning and the brief<br/>04 Find the insight<br/>05 Choose the story structure<br/>06-10 The five narrative stages<br/>11 The complete worked example<br/>12 Connect claims to evidence<br/>13-14 Pressure-test the argument<br/>15 Write for people and explain AI<br/>16 Put the story to work<br/>17 Test and maintain it<br/>18 Run a workshop or use the AI skill<br/>19 Method credits and sources<br/>20-23 Printable workbook'),
 note('The five stages describe the story your audience hears. Research, drafting, testing, and activation describe how you develop and use it. Keep those two ideas separate.'),
 p('The onboarding example is fictional. Its scenario and capabilities illustrate the method; they are not customer findings or product-performance claims.'))
page('Start with positioning', 'A compelling narrative needs a clear reason for the right buyer to choose you.',
 h('Make three connected decisions'),
 b('<b>Positioning:</b> who should choose the product, over which alternatives, and for what value?'),
 b('<b>Narrative:</b> what should this audience understand differently, and how should they respond?'),
 b('<b>Messaging:</b> which claims, explanations, and proof will help each audience use that argument?'),
 h('Write a short brief'),
 b('<b>Audience and decision.</b> Name the person, buying situation, and action you want to influence.'),
 b('<b>Current approach.</b> What would they actually use or do without you? Include existing tools, manual work, internal development, and doing nothing.'),
 b('<b>Relevant advantage.</b> Identify a capability that matters against those alternatives. Explain how it changes the work and which customers value that difference most.'),
 b('<b>Product reality and proof.</b> Record what works today, dependencies, evidence, and unresolved questions.'),
 b('<b>Ownership.</b> For substantial work, agree who contributes, who owns the narrative, and who decides.'),
 note('If the problem is an unclear audience, an undifferentiated offer, or a missing capability, address that choice first. Better prose cannot supply the missing value.'),
 p('A useful brief ends with a decision: this is the audience, this is the situation, and this is why our difference should matter. Keep unsettled choices provisional.'))
page('Find the insight', 'Look for a pattern that changes how a buyer understands a problem or makes a decision.',
 h('Use three kinds of signal'),
 b('<b>Customer:</b> recent decisions, objections, workarounds, implementation friction, and moments when expectations were missed. Preserve the context behind their words.'),
 b('<b>Competitive:</b> repeated promises, buying criteria, proof, and product explanations. Include the customer\u2019s actual alternatives, not just other vendors.'),
 b('<b>Market and analyst:</b> changes in work, expectations, economics, and technology use. Check whether a broad trend appears in your audience\u2019s experience.'),
 h('Separate the steps in your reasoning'),
 p('<b>Observation:</b> what did you see, and where?<br/><b>Interpretation:</b> what might explain it?<br/><b>Implication:</b> what should the audience prioritize or do differently?'),
 p('For each source, keep its date, audience, situation, and limitations. Compare plausible explanations. One interview can reveal a useful hypothesis; it does not establish how common the problem is.'),
 h('Choose a foundation worth developing'),
 b('Can a defined audience recognize the situation?'),
 b('Does it affect an important decision or outcome?'),
 b('Can your business credibly help with the response?'),
 note('Ask what would disprove your interpretation. Look for contrary cases before the most attractive explanation becomes the story.'))
page('Choose the right structure', 'The evidence should determine the opening. Do not manufacture a market change to fit a template.',
 h('When a meaningful change is established'),
 p('Use Marcus Andrews\u2019 five-stage structure: <b>The Change → The Impact → The New Game → Why It\u2019s Hard → The Solution.</b> Establish what changed, for whom, compared with when, and why the audience needs to respond.'),
 h('When a persistent problem is misunderstood'),
 p('Use this companion\u2019s reframe-led alternative: <b>situation → contradiction → new interpretation → practical approach → barriers → product contribution → next action.</b> This is an extension used here, not an additional Andrews framework.'),
 p('For example, an onboarding checklist can be complete while the customer still cannot get value. That contradiction can support a reframe even if you have no evidence that onboarding conditions have changed over time.'),
 h('When a larger story is unnecessary'),
 p('Use a direct explanation of the audience, problem, value, difference, and proof. A feature announcement or short conversion page may need only part of the larger narrative.'),
 h('Keep category strategy a separate choice'),
 p('You can change buying criteria within a familiar category. Advocating a new category also requires buyer understanding, clear boundaries, sustained education, resources, and leadership commitment.'),
 note('In the fictional example that follows, the audience has moved from single-team customers to enterprise rollouts. This explicit scenario lets us demonstrate a change-led story. In real work, establish that change before claiming it.'))

EXAMPLES=[
('The Change','What has changed for your audience?',
 'Identify a change in how customers work, what they expect, or what they need. Specify who it affects, what is different, and what evidence supports it.',
 'Your customers used to get started within one team. Now an enterprise rollout needs security approval, a data integration, and several teams to be ready together.',
 ['Define the audience, situation, and comparison over time.','Separate a technology becoming possible from people adopting it and changing their work.','Use observed behavior and relevant research. Investigate cases where your interpretation does not fit.'],
 'Has onboarding actually become more interdependent for these buyers? Compare recent journeys with earlier ones.',
 'A specific change statement with evidence and clear limits.'),
('The Impact','Why does that change matter?',
 'Explain how the change affects a result your audience cares about. Show the connection before introducing the product.',
 'Each team can finish its checklist while the customer still cannot use what they bought. Until those pieces come together, the value they signed up for stays out of reach.',
 ['Trace the consequence: what becomes harder, more expensive, newly possible, or expected?','Name who owns the affected outcome. Keep the stakes proportionate.','Include the opportunity from responding, alongside the cost of continuing as they are.'],
 'Where does a finished internal task still leave the customer blocked? Find a real handoff and its consequence.',
 'A clear consequence that gives the audience a reason to reconsider.'),
('The New Game','What should people do differently?',
 'Teach a practical approach that helps the audience respond. Explain its substance before choosing a name.',
 'Plan onboarding around the customer\u2019s first valuable outcome. Agree what that outcome is, work back to the milestones that enable it, and measure progress against them.',
 ['Define what people should start, stop, and measure differently.','Compare fairly with the current approach. Explain effort, costs, and trade-offs.','Make the method useful with tools they already have. Then decide whether a simple name makes it easier to teach.'],
 'Can a team define the outcome, identify its dependencies, and tell whether the customer has reached it without buying your software?',
 'A method someone can explain, try, and judge.'),
('Why It\u2019s Hard','What gets in the way of that approach?',
 'Identify the real barriers to adopting the method. Include constraints your product cannot solve.',
 'That takes a shared view of work spread across customer success, IT, and the customer\u2019s own team. When a requirement is missing, someone needs to see the gap and know who can resolve it.',
 ['Investigate ownership, incentives, skills, budget, data, integration, permissions, and behavior where relevant.','Explain obstacles to the proposed approach, including new costs or risks it introduces.','Acknowledge capable people working within real constraints. Avoid selecting only barriers your product happens to solve.'],
 'Is the obstacle visibility, unclear responsibility, or both? Software can expose a gap without settling who owns it.',
 'The important adoption barriers and a realistic account of responsibility.'),
('The Solution','How does your product help?',
 'Connect delivered capabilities to the barriers already established. Explain how the work changes and provide proof for the result you claim.',
 'Our onboarding software brings requirements, owners, and milestone progress into one shared view. AI flags missing information so the responsible person can investigate what is holding the customer back.',
 ['Map obstacle → capability → how it works → outcome → evidence.','Compare with the buyer\u2019s actual alternatives. Acceptance of your approach does not establish a reason to buy your product.','Distinguish live capabilities, required configuration, pilots, and roadmap plans. Include the human and process contribution.'],
 'Can the product identify the relevant gap and help the right person act? Demonstrate that workflow before claiming faster onboarding.',
 'A credible product contribution, a reason to choose, supporting proof, and a next action.')]
for title,q,instruction,example,steps,test,output in EXAMPLES:
 page(title,q,p(instruction),h('Work through it'),*[b(x) for x in steps],h('Worked example'),note(example),h('Pressure test'),p(test),h('Capture the decision'),p(output))
page('Read the complete narrative', 'The same fictional onboarding example, assembled into one argument.',
 *[p('<b>'+x[0]+'.</b> '+x[3]) for x in EXAMPLES],
 p('<b>Next action.</b> Start with one customer journey. Can you trace every onboarding activity to the outcome the customer is waiting for?'),
 note('The starting message was “An AI-powered platform for smarter customer onboarding.” The new story makes a choice: judge progress by the customer\u2019s first valuable outcome. The product has a specific supporting role.'),
 p('Before using a similar story publicly, verify the audience\u2019s changed conditions, the relevance of the approach, the delivered capabilities, and the product\u2019s advantage over existing tools.'))
page('Connect claims to evidence', 'Different claims need different kinds of support.',
 h('Keep four questions separate'),
 b('<b>Has the audience\u2019s world changed?</b> Use relevant observations over time, customer behavior, or research. Define the population and scope.'),
 b('<b>Is the approach useful?</b> Investigate whether it addresses the problem in the target context. Positive reactions can show interest; they do not establish effectiveness.'),
 b('<b>Can the product do the work?</b> Demonstrate the specific workflow, access, dependencies, and resulting state. A recommendation is different from an executed action.'),
 b('<b>Does it produce the claimed outcome?</b> Measure the relevant result against a suitable baseline. Include adoption, review effort, exceptions, costs, and other changes.'),
 h('Build a compact claim record'),
 p('For each material claim, record: wording; source and date; audience or use case; result; limitations; and status. Mark whether it is supported, partially supported, a hypothesis, or contradicted.'),
 h('Example proof chain'),
 p('<b>Obstacle:</b> a missing requirement blocks onboarding.<br/><b>Capability:</b> the software flags missing information.<br/><b>How it works:</b> the owner investigates and resolves the gap.<br/><b>Outcome:</b> the customer can reach the next milestone.<br/><b>Proof:</b> verify the gap, the flag, the response, and the resulting progress in that workflow.'),
 note('A demo can establish a behavior under demonstrated conditions. It cannot, by itself, substantiate reliable deployment at scale or a revenue claim.'))
TESTS=[
('Change validity','Is the change real, relevant, and supported? For a reframe-led story, test the contradiction instead.'),
('Audience relevance','Does it affect a specific audience\u2019s real decision? Are the stakes proportionate?'),
('Differentiation','Could a competitor tell the same story unchanged? Identify a meaningful difference in interpretation, approach, product, or proof.'),
('New-game strength','Can a practitioner apply the method without your product? Are actions, success, and trade-offs clear?'),
('Narrative logic','Does each stage justify the next? Identify any leap from trend to urgency, approach to obstacle, or capability to outcome.'),
('Customer empathy','Does the story reflect real constraints and rational reasons to keep the current approach?'),
('Solution credibility','Can delivered capabilities produce the result under stated conditions? Are future plans clearly separated?'),
('Persuasion','Does the story combine sound reasoning, credibility, and recognizable human stakes? Does the emotion follow from the situation?'),
('Commercial connection','Which buyer priority and business outcome matter? Does the value remain plausible after costs and adoption effort?'),
('Competitive response','What is the strongest case for an incumbent, internal build, competitor, or doing nothing?'),
('Executive challenge','Would leadership, finance, product, and sales accept the strategic choice and its implementation requirements?'),
('Customer comprehension','Can an unfamiliar prospect explain the approach, product role, and next action without coaching?')]
for part in range(2):
 page('Pressure-test the argument' if part==0 else 'Challenge the strongest version', 'Twelve practical tests. Apply them to the evidence you have; record what remains unknown.',
 *sum(([h(str(i+1)+'. '+title),p(desc)] for i,(title,desc) in enumerate(TESTS) if i//6==part),[]),
 note('Repair the earliest weak assumption first. Then revise the stages that depend on it.' if part==0 else 'Decide: advance to a named test or use, refine a specific gap, or rebuild the premise. Simulated buyer reactions are hypotheses; real interviews and evaluations supply evidence.'))
page('Write for people. Explain AI.', 'Clear language should make the reasoning easier to follow, with the important nuance intact.',
 h('Remove words that do no work'),
 p('Cut repeated explanations, generic openings, empty adjectives, and jargon that conceals the mechanism. Give each sentence a job: observation, implication, evidence, explanation, or useful human detail. Prefer concrete work over broad claims about transformation.'),
 h('Check the spoken flow'),
 b('Read aloud. Mark where you lose breath, stumble, or need to explain a connection.'),
 b('Vary sentence length naturally. Keep transitions clear on first hearing.'),
 b('Ask a listener to retell the argument. Look for the idea they remember and the action they would take.'),
 h('When AI matters to the story'),
 b('<b>Explain the task.</b> What does AI do, using which inputs, and how does that help?'),
 b('<b>Explain the human role.</b> Who sets the goal, approves actions, handles exceptions, and judges results?'),
 b('<b>Match the promise to reality.</b> Separate possible, delivered, measured, and planned behavior. Verify the final task or system state when claiming execution.'),
 b('<b>Find the change beneath the technology.</b> Investigate changing work and expectations; do not assume a new model feature creates an immediate market shift.'),
 note('Temporarily remove AI labels. Can someone still understand the customer value and reason to choose? Restore technical terms where they add necessary precision. Keep forecasts recognizable as forecasts.'))
page('Put the story to work', 'Agree the argument, then adapt its emphasis to the audience and channel.',
 h('Build the message hierarchy'),
 p('Start with the core thesis and promise. Add supporting messages, relevant product mechanisms, proof, common objections, and a useful next action. Adapt depth and examples while preserving the central argument.'),
 h('Choose the right application'),
 b('<b>Sales:</b> connect the buyer\u2019s situation to the approach, then show the relevant workflow and proof. Add discovery, economics, technical detail, and next steps.'),
 b('<b>Launches and campaigns:</b> show how a shipped capability advances the approach. A short asset can carry one part of the story.'),
 b('<b>Thought leadership:</b> explain an observation, offer an interpretation, address a serious counterargument, and recommend a decision. Distinguish a future view from current capabilities.'),
 b('<b>Product and analyst conversations:</b> use the narrative to examine buying criteria, unmet needs, market direction, and product priorities. Invite challenges to the premise.'),
 h('Make the commitments clear'),
 p('For company-level work, align leadership on the strategic choice. Ask Product to check feasibility, Sales and customer teams to check relevance, and an accountable owner to resolve decisions. Where scope is smaller, use the appropriate product or campaign team.'),
 note('Assign each priority asset an audience, owner, intended action, proof requirement, and learning measure. A five-stage story prototype is a starting point, not a complete sales deck or campaign plan.'))
page('Test it. Keep it useful.', 'Choose a test that answers the uncertainty holding the work back.',
 h('Ask specific questions'),
 b('<b>Recognition:</b> ask target buyers to describe a recent decision or workflow. Does the proposed tension appear without prompting?'),
 b('<b>Comprehension:</b> show the narrative and ask people to retell it. What changed, what should they do, and how does the product help?'),
 b('<b>Usefulness and difference:</b> compare with actual alternatives using comparable materials. Which decision changes, and why?'),
 b('<b>Delivery:</b> evaluate the relevant product workflow under realistic conditions. Check dependencies, exceptions, and the outcome.'),
 b('<b>Behavior:</b> use a suitable comparison or experiment. Record baseline, timing, exposure, and other changes before attributing impact.'),
 h('Keep decision states clear'),
 p('A draft can be coherent but untested. Internal approval does not establish buyer comprehension. Buyer comprehension does not establish purchase or revenue impact. Record what the test supports and what decision follows.'),
 h('Maintain a small shared foundation'),
 p('Keep audience, thesis, approach, product scope, terminology, evidence, owner, date, and approval status easy to find. Refresh examples when those change. Revisit the story when the audience, premise, alternatives, or differentiated value changes.'),
 note('Use comprehension and qualified engagement as early learning signals. Investigate downstream conversion, adoption, pipeline, and revenue with an appropriate comparison. Downloads alone do not establish business impact.'))
page('Work through it together', 'Use a workshop or the AI companion to surface the decisions. Keep evidence and ownership with people.',
 h('A suggested 90-minute workshop'),
 p('<b>Beforehand:</b> share the brief, relevant research, current story, alternatives, and product facts. Identify the owner and decision maker.'),
 b('<b>0-15 minutes:</b> agree the audience, buying situation, decision, and evidence gaps.'),
 b('<b>15-30 minutes:</b> compare insights and choose the supported story structure.'),
 b('<b>30-60 minutes:</b> draft the argument, practical approach, barriers, and product contribution.'),
 b('<b>60-80 minutes:</b> challenge the weakest link and strongest objection; repair the draft.'),
 b('<b>80-90 minutes:</b> record decisions, unresolved questions, evidence owners, and the next test. Adjust timing to the work.'),
 h('Use the downloadable AI skill'),
 p('Provide the audience, objective, product facts, research, alternatives, and constraints. Ask it to distinguish evidence from assumptions. Share only material you are authorized to use.'),
 note('“Use Question Mode to guide me one question at a time.”<br/><br/>“Pressure-test this draft. Find its earliest unsupported assumption and revise what depends on it.”<br/><br/>“Adapt this agreed narrative into a sales opening using only these product facts and proof.”'),
 p('The companion supports discovery, customer and competitive analysis, building, workshops, alternatives, pressure testing, audience simulation, experiments, refinement, optional voice calibration, spoken-flow review, and activation. Choose the task; you do not need to learn the mode names. AI simulation does not replace customer validation.'))
page('Method credits and sources', 'A reusable method, with clear attribution and practical extensions.',
 h('Methodological foundation'),
 p('Marcus Andrews developed the five-stage Narrative Design method. This independent companion is authored by Shauna Azevedo-Brennan. The research workflow, reframe-led alternative, evidence mapping, pressure tests, AI guidance, and workbook are practical extensions used here.'),
 p('Marcus Andrews, <i>Narrative design: How to create a story people can\u2019t ignore</i>, Wynter (2021).<br/><link href="https://wynter.com/post/narrative-design" color="#355900">wynter.com/post/narrative-design</link>'),
 p('Marcus Andrews, <i>Narrative Design for Business</i>.<br/><link href="https://www.m3ka.com/frameworks/narrative-design" color="#355900">m3ka.com/frameworks/narrative-design</link>'),
 h('Supporting perspectives'),
 p('Nancy Duarte, structure, contrast, and audience movement.<br/><link href="https://www.duarte.com/blog/move-presentation-audience-with-story-techniques-in-presentations/" color="#355900">duarte.com - structure and story</link>'),
 p('Donald Miller, the customer\u2019s role in the story.<br/><link href="https://storybrand.com/downloads/your-brand-is-not-the-hero.pdf" color="#355900">storybrand.com - Your Brand Is Not the Hero</link>'),
 h('Keep working'),
 p('The next four pages are printable worksheets. Download them separately, read the complete guide online, or get the AI companion from the portfolio.'),
 p('<link href="https://shaunaleebrennan.github.io/shauna-ai-portfolio/playbook.html" color="#355900">shaunaleebrennan.github.io/shauna-ai-portfolio/playbook.html</link>'),
 note('The examples are fictional and the practical tests are diagnostic tools. Neither an AI score nor a polished draft predicts commercial effectiveness. Visual edition 1.1 | 25 October 2026.'))
assert len(PAGES)==19,len(PAGES)

# Visual edition: generated editorial artwork is illustrative; process graphics
# are drawn deterministically so labels and relationships remain exact.
from reportlab.platypus import Flowable
from reportlab.lib.utils import ImageReader
from PIL import Image as PILImage
from io import BytesIO
for name,file in [('Guide','DejaVuSans.ttf'),('GuideBold','DejaVuSans-Bold.ttf')]: pdfmetrics.registerFont(TTFont(name,'/usr/share/fonts/truetype/dejavu/'+file))
pdfmetrics.registerFontFamily('Guide',normal='Guide',bold='GuideBold',italic='Guide',boldItalic='GuideBold')
W,H=A4
INK=colors.HexColor('#111812'); CREAM=colors.HexColor('#f8f6f0'); ACID=colors.HexColor('#c9ff63')
LAV=colors.HexColor('#e9e0f8'); PINK=colors.HexColor('#f7e3e9'); MINT=colors.HexColor('#edf3e5')
STAGE_COLOURS=[LAV,PINK,colors.HexColor('#e4f4c8'),colors.HexColor('#f6e8d8'),colors.HexColor('#dfeae5')]
styles={
 'title':ParagraphStyle('title',fontName='GuideBold',fontSize=29,leading=33,textColor=INK,spaceAfter=12),
 'deck':ParagraphStyle('deck',fontName='Guide',fontSize=12,leading=17,textColor=colors.HexColor('#50584e'),spaceAfter=18),
 'h':ParagraphStyle('h',fontName='GuideBold',fontSize=11.8,leading=16,spaceBefore=10,spaceAfter=6,textColor=INK,keepWithNext=True),
 'p':ParagraphStyle('p',fontName='Guide',fontSize=10.5,leading=15.3,spaceAfter=9,textColor=colors.HexColor('#263026')),
 'b':ParagraphStyle('b',fontName='Guide',fontSize=10.5,leading=15.3,spaceAfter=8,leftIndent=12,firstLineIndent=-12,textColor=colors.HexColor('#263026')),
 'note':ParagraphStyle('note',fontName='Guide',fontSize=10.5,leading=15.3,spaceBefore=13,spaceAfter=22,backColor=MINT,borderPadding=10,textColor=INK),
 'caption':ParagraphStyle('caption',fontName='Guide',fontSize=8.2,leading=11.5,spaceAfter=12,textColor=colors.HexColor('#535e52'))}
ART=OUT/'illustrations'
READERS={}
def art(c,name,x,y,w,h):
 path=ART/(name+'.jpg')
 if name not in READERS: READERS[name]=ImageReader(str(path))
 reader=READERS[name];iw,ih=reader.getSize();scale=max(w/iw,h/ih)
 c.saveState();clip=c.beginPath();clip.rect(x,y,w,h);c.clipPath(clip,stroke=0,fill=0)
 c.drawImage(reader,x+(w-iw*scale)/2,y+(h-ih*scale)/2,iw*scale,ih*scale,mask='auto');c.restoreState()
def para(c,t,x,y,w,sz=10,lead=14,font='Guide',colour=INK):
 st=ParagraphStyle('canvas',fontName=font,fontSize=sz,leading=lead,textColor=colour)
 pp=Paragraph(t,st);_,hh=pp.wrap(w,1000);pp.drawOn(c,x,y-hh);return hh

def box(c,x,y,w,h,t,fill,sz=9):
 c.setFillColor(fill);c.roundRect(x,y,w,h,7,fill=1,stroke=0)
 st=ParagraphStyle('box',fontName='GuideBold',fontSize=sz,leading=sz+3,textColor=INK,alignment=1)
 pp=Paragraph(t,st);_,ph=pp.wrap(w-18,h);pp.drawOn(c,x+9,y+(h-ph)/2)
def arrow(c,x1,y1,x2,y2,colour=INK):
 c.setStrokeColor(colour);c.setLineWidth(1);c.line(x1,y1,x2,y2)
 c.line(x2,y2,x2-4,y2+3);c.line(x2,y2,x2-4,y2-3)

class Diagram(Flowable):
 def __init__(self,kind): Flowable.__init__(self);self.kind=kind;self.height=90
 def wrap(self,aw,ah): self.width=aw;return aw,self.height
 def draw(self):
  c=self.canv;w=self.width;k=self.kind
  if k==0:
   box(c,0,18,w*.43,57,'BEFORE<br/>One team gets started',LAV)
   box(c,w*.57,18,w*.43,57,'NOW<br/>Several teams must be ready',PINK)
   arrow(c,w*.44,46,w*.55,46)
  elif k==1:
   box(c,0,17,w*.44,58,'INTERNAL CHECKLIST<br/>Tasks completed',LAV)
   box(c,w*.56,17,w*.44,58,'CUSTOMER OUTCOME<br/>Still unable to use the product',PINK)
   c.setFont('GuideBold',20);c.setFillColor(INK);c.drawCentredString(w*.5,38,'≠')
  elif k==2:
   labels=['Agree the first<br/>valuable outcome','Work back to<br/>enabling milestones','Measure progress<br/>toward that outcome']
   for i,t in enumerate(labels):
    x=i*(w/3+2);box(c,x,18,w/3-12,57,t,[LAV,ACID,PINK][i])
    if i<2:arrow(c,x+w/3-9,46,x+w/3-1,46)
  elif k==3:
   labels=['Requirements','Ownership','Visibility']
   for i,t in enumerate(labels):
    x=i*w/3;box(c,x,20,w/3-12,54,t,[LAV,PINK,colors.HexColor('#f3dfc9')][i])
    if i<2:
     c.setStrokeColor(colors.HexColor('#9ca396'));c.setDash(2,3);c.line(x+w/3-8,47,x+w/3,47);c.setDash()
  else:
   labels=['Obstacle','Capability','How it works','Outcome','Evidence']
   for i,t in enumerate(labels):
    x=i*w/5;box(c,x,20,w/5-8,54,t,[PINK,LAV,MINT,ACID,LAV][i],8)
    if i<4:arrow(c,x+w/5-5,47,x+w/5-1,47)

class Figure(Flowable):
 def __init__(self,name,height=164,caption=''): Flowable.__init__(self);self.name=name;self.height=height+24;self.imageHeight=height;self.caption=caption
 def wrap(self,aw,ah):self.width=aw;return aw,self.height
 def draw(self):
  art(self.canv,self.name,0,24,self.width,self.imageHeight)
  if self.caption:para(self.canv,self.caption,0,17,self.width,7.8,10.5,colour=colors.HexColor('#62685c'))

class SignalMap(Flowable):
 def __init__(self):Flowable.__init__(self);self.height=78
 def wrap(self,aw,ah):self.width=aw;return aw,self.height
 def draw(self):
  c=self.canv;w=self.width
  for i,(title,sub) in enumerate([('OBSERVE','What did you see?'),('INTERPRET','What might it mean?'),('DECIDE','What should change?')]):
   x=i*w/3;box(c,x,8,w/3-10,59,title+'<br/>'+sub,[LAV,PINK,ACID][i],8.7)
   if i<2:arrow(c,x+w/3-8,37,x+w/3-1,37)

counts=[]
def decorate(c,doc):
 n=doc.page
 bg=CREAM
 if 6<=n<=10:bg=[colors.HexColor('#f8f5fd'),colors.HexColor('#fcf5f7'),colors.HexColor('#f7faef'),colors.HexColor('#fcf7f0'),colors.HexColor('#f3f8f4')][n-6]
 if n in [2,14,18]:bg=colors.HexColor('#f6f1fb')
 c.setFillColor(bg);c.rect(0,0,W,H,fill=1,stroke=0)
 c.setFillColor(ACID);c.rect(43,H-32,27,5,fill=1,stroke=0)
 c.setFont('GuideBold',7.4);c.setFillColor(INK);c.drawString(80,H-31,'SHAUNA AZEVEDO-BRENNAN / NARRATIVE DESIGN')
 c.setStrokeColor(colors.HexColor('#cad0c2'));c.line(43,40,W-43,40)
 c.setFont('Guide',7);c.setFillColor(colors.HexColor('#596150'));c.drawString(43,26,'Practical companion | Five-stage method: Marcus Andrews')
 c.setFont('GuideBold',8);c.drawRightString(W-43,26,str(n).zfill(2));counts.append(n);c.bookmarkPage('page-'+str(n))
 if 6<=n<=10:
  c.setFillColor(STAGE_COLOURS[n-6]);c.roundRect(W-106,H-116,63,54,9,fill=1,stroke=0)
  c.setFont('GuideBold',29);c.setFillColor(INK);c.drawCentredString(W-74,H-100,str(n-5).zfill(2))
  labels=['CHANGE','IMPACT','NEW GAME','BARRIERS','SOLUTION']
  for i,label in enumerate(labels):
   x=48+i*101;c.setFillColor(ACID if i==n-6 else colors.HexColor('#e8ebdf'));c.roundRect(x,60,94,21,4,fill=1,stroke=0)
   c.setFillColor(INK);c.setFont('GuideBold',6.5);c.drawCentredString(x+47,68,label)
 if n==1:
  # Actual title remains live text; the image carries no copy.
  para(c,'Narrative design.<br/>Change the frame.',48,H-88,500,40,44,'GuideBold')
  para(c,'A practical playbook and workbook for turning market insight into a story people can understand, believe, and use.',50,H-204,480,12,18)
  para(c,'Shauna Azevedo-Brennan',50,H-275,480,11,15,'GuideBold')
  art(c,'change-the-frame',0,182,W,335)
  para(c,'MY POINT OF VIEW',48,159,480,8,11,'GuideBold')
  para(c,'When competitors tell the same story, they reinforce the same buying criteria. Narrative design should challenge those criteria - with a market insight customers recognize and an approach your business can credibly lead.',48,138,497,10,14)
  para(c,'Strategy that ships. Stories that stick.  |  Visual edition 1.1 · 25 October 2026',48,66,497,8,11,'GuideBold')

def safe(t):return t.replace('\u2019',"'").replace('\u2018',"'").replace('\n','<br/>')
flow=[]
for i,(title,deck,blocks) in enumerate(PAGES):
 if i:flow.append(PageBreak())
 if i==0:flow.append(Spacer(1,1));continue
 ts=styles['title']
 if 5<=i<=9:ts=ParagraphStyle('stageTitle',parent=styles['title'],rightIndent=80)
 flow += [Paragraph(safe(title),ts),Paragraph(safe(deck),styles['deck'])]
 if i==3:flow.append(Figure('examine-the-evidence',145,'Illustration: examine the same evidence from different perspectives.'))
 if i==10:flow.append(Figure('customer-progress',150,'Illustration: dependencies must come together before the customer can progress.'))
 if i==11:flow.append(Diagram(4))
 if i==12:flow.append(Figure('examine-the-evidence',120,'Look for the evidence that would challenge your preferred interpretation.'))
 for j,(kind,t) in enumerate(blocks):
  st=styles[kind]
  if kind=='note':
   tint=STAGE_COLOURS[i-5] if 5<=i<=9 else (PINK if i%3==0 else LAV if i%3==1 else MINT)
   st=ParagraphStyle('colourNote',parent=st,backColor=tint)
  flow.append(Paragraph(('• ' if kind=='b' else '')+safe(t),st))
  if 5<=i<=9 and j==0:flow.append(Diagram(i-5))
base=OUT/'narrative-design-guide-body.pdf'
doc=SimpleDocTemplate(str(base),pagesize=A4,rightMargin=48,leftMargin=48,topMargin=64,bottomMargin=89,title='Narrative Design: Change the Frame | Visual Playbook and Workbook',author='Shauna Azevedo-Brennan')
doc.build(flow,onFirstPage=decorate,onLaterPages=decorate)
assert len(PdfReader(base).pages)==19,('Unexpected overflow',len(PdfReader(base).pages))
writer=PdfWriter();writer.append(str(base));writer.append(str(OUT/'narrative-design-workbook.pdf'))
for i,(title,_,_) in enumerate(PAGES):writer.add_outline_item(title.replace('\n',' '),i)
for i,title in enumerate(['Workbook: strategic choice','Workbook: narrative draft','Workbook: product and proof','Workbook: writing and AI review']):writer.add_outline_item(title,19+i)
writer.add_metadata({'/Title':'Narrative Design: Change the Frame | Visual Playbook and Workbook','/Author':'Shauna Azevedo-Brennan','/Subject':'Illustrated practical guide with five-stage method, worked example, evidence tests, and printable workbook'})
writer.write(str(OUT/'narrative-design-guide.pdf'));base.unlink()
# HTML uses the same source so the complete method remains readable without a PDF.
sections=[]
for i,(title,deck,blocks) in enumerate(PAGES):
 if i==0: continue
 if i==1: blocks=tuple(x for x in blocks if x != ('h','What is inside') and not (x[0]=='p' and x[1].startswith('03 Positioning')))
 body=''.join(('<h3>'+t+'</h3>' if k=='h' else ('<ul><li>'+t+'</li></ul>' if k=='b' else '<p'+(' class="pb-callout"' if k=='note' else '')+'>'+t+'</p>')) for k,t in blocks)
 body=re.sub(r'<link href="([^"]+)" color="[^"]+">(.*?)</link>',r'<a href="\1">\2</a>',body)
 sections.append(f'<section id="chapter-{i+1}" class="pb-section shell"><div class="pb-section-label">{i+1:02d} / Complete guide</div><h2>{html.escape(title).replace(chr(10),"<br>")}</h2><p class="pb-intro">{deck}</p><div class="pb-prose">{body}</div></section>')
nav=''.join(f'<li><a href="#chapter-{i+1}">{html.escape(t.replace(chr(10)," "))}</a></li>' for i,(t,d,bk) in enumerate(PAGES) if i>0)
web='''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="description" content="The complete Narrative Design guide by Shauna Azevedo-Brennan: research, positioning, five stages, evidence, testing, and GTM activation."><title>Narrative Design - Complete Guide | Shauna Brennan</title><link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&amp;family=Manrope:wght@500;600;700&amp;display=swap" rel="stylesheet"><style>.pb-guide{font-family:"DM Sans",sans-serif}.pb-guide h1{font:500 clamp(42px,6vw,72px)/1.05 Manrope,sans-serif;letter-spacing:-.04em;max-width:850px;margin:24px 0}.pb-guide-contents{columns:2;column-gap:50px;padding-left:22px;max-width:950px}.pb-guide-contents li{break-inside:avoid;font-size:15px;padding:3px 0}.pb-guide .pb-actions{margin-bottom:35px}.pb-guide .pb-prose ul{padding-left:22px}.pb-guide .pb-prose li{margin-bottom:10px}@media(max-width:760px){.pb-guide-contents{columns:1}}</style><link rel="stylesheet" href="styles.css"><link rel="stylesheet" href="playbook.css?v=20261025-2"><link rel="icon" href="assets/favicon.svg"></head><body class="playbook-page pb-guide"><a class="pb-skip" href="#main">Skip to the guide</a><header class="nav shell"><a class="brand" href="index.html"><span>SB</span> Shauna Brennan</a><a href="playbook.html">← Interactive playbook</a></header><main id="main"><section class="pb-section shell"><div class="pb-eyebrow">Read the complete guide</div><h1>Narrative design.<br>Change the frame.</h1><p class="pb-intro">The full method, with practical guidance and a worked example. Read online or download the playbook and printable workbook.</p><div class="pb-actions"><a class="button primary" href="assets/playbooks/narrative-design-guide.pdf" download>Download guide &amp; workbook</a><a class="button secondary" href="assets/playbooks/narrative-design-workbook.pdf" download>Get worksheets only</a></div><h2>Contents</h2><ol class="pb-guide-contents">'''+nav+'''</ol></section>'''+''.join(sections)+'''<section class="pb-section shell"><h2>Apply the method</h2><p><a href="assets/playbooks/narrative-design-workbook.pdf" download>Download the four-page printable workbook</a> or <a href="playbook.html#brief">start your brief online</a>.</p><a href="playbook.html">← Back to the interactive playbook</a></section></main></body></html>'''
(ROOT/'narrative-design-guide.html').write_text(web)
print('Created 23-page guide (19 + 4 worksheets) and complete HTML companion.')
