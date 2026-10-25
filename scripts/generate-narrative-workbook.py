#!/usr/bin/env python3
"""Editable ReportLab source for the four-page Narrative Design workbook.

Run: python3 scripts/generate-narrative-workbook.py (requires ReportLab and DejaVu Sans)
No private company context or proprietary research is included.
"""
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

ROOT = Path(__file__).resolve().parents[1] / "assets" / "playbooks"
OUT = ROOT / "narrative-design-workbook.pdf"
ROOT.mkdir(parents=True, exist_ok=True)

# DM Sans and Manrope are preferred by the portfolio; use embedded, freely
# redistributable DejaVu Sans when those fonts are not available locally.
FONT_DIR = Path('/usr/share/fonts/truetype/dejavu')
for name, filename in [('Body', 'DejaVuSans.ttf'), ('Bold', 'DejaVuSans-Bold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / filename)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='Bold', italic='Body', boldItalic='Bold')

W, H = A4
M = 43
CW = W - 2 * M
INK = HexColor('#0b0d0c')
MUTED = HexColor('#4b524b')
RULE = HexColor('#bdc5b8')
PALE = HexColor('#eef1e8')
GREEN = HexColor('#c9ff63')
LAVENDER = HexColor('#8b7dff')
PINK = HexColor('#f6c8d8')
WHITE = HexColor('#ffffff')

c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
c.setTitle('Narrative Design Workbook | Shauna Azevedo-Brennan')
c.setAuthor('Shauna Azevedo-Brennan')
c.setSubject("Practical companion to Marcus Andrews' five-stage Narrative Design method")

STYLES = {}
def para(text, x, top, width, size=10.2, leading=14.1, color=INK, font='Body'):
    key = (size, leading, color.hexval(), font)
    if key not in STYLES:
        STYLES[key] = ParagraphStyle(str(key), fontName=font, fontSize=size,
            leading=leading, textColor=color, spaceAfter=0, spaceBefore=0)
    p = Paragraph(text, STYLES[key])
    _, height = p.wrap(width, 1000)
    p.drawOn(c, x, H-top-height)
    return height

def line(x, top, width, color=RULE, weight=.55):
    c.setStrokeColor(color)
    c.setLineWidth(weight)
    c.line(x, H-top, x+width, H-top)

def rect(x, top, width, height, fill, stroke=None, radius=0):
    c.setFillColor(fill)
    c.setStrokeColor(stroke or fill)
    if radius:
        c.roundRect(x, H-top-height, width, height, radius, fill=1, stroke=int(bool(stroke)))
    else:
        c.rect(x, H-top-height, width, height, fill=1, stroke=int(bool(stroke)))

def label(text, x, top, width=CW, color=MUTED):
    return para(text.upper(), x, top, width, 8.1, 10.8, color, 'Bold')

def write_lines(x, top, width, count=1, gap=20):
    for i in range(count):
        line(x, top+i*gap, width)

def field(title, prompt, x, top, width, lines=1):
    label(title, x, top, width, INK)
    used = para(prompt, x, top+15, width, 10.5, 15, MUTED)
    write_lines(x, top+15+used+18, width, lines)

def header(number, title, subtitle):
    page_tints = [HexColor('#eee7f8'), HexColor('#edf4df'), HexColor('#f8e7eb'), HexColor('#f4ebdf')]
    rect(M-12, 46, CW+24, 88, page_tints[number-1], radius=8)
    rect(M, 27, 24, 5, GREEN)
    label('Shauna Azevedo-Brennan / Narrative Design', M+34, 23, CW-34, INK)
    label(f'Workbook {number:02d} / 04', M, 54, CW)
    title_h = para(title, M, 75, CW, 28, 32, INK, 'Bold')
    return 75 + title_h + 13 + para(subtitle, M, 75+title_h+13, CW, 11, 15.5, MUTED)

def footer(number):
    line(M, H-42, CW)
    para("Five-stage method: Marcus Andrews. Practical companion: Shauna Azevedo-Brennan.", M, H-32, CW-25, 7.2, 9.2, MUTED)
    para(f'{number:02d}', W-M-18, H-33, 18, 8.5, 10, INK, 'Bold')

def end_page(number):
    footer(number)
    c.showPage()

# PAGE 1 ---------------------------------------------------------------------
header(1, 'Start with the strategic choice',
       'Use evidence to change a buying decision. Draft, then test with people.')

rect(M, 143, CW, 109, PALE, radius=4)
rect(M, 143, 4, 109, LAVENDER)
label('The point of view', M+16, 155, CW-32, INK)
POV = 'When competitors tell the same story, they reinforce the same buying criteria. Narrative design should challenge those criteria—with a market insight customers recognize and an approach your business can credibly lead.'
para(escape(POV), M+16, 174, CW-32, 11.1, 16, INK)

label('01 / Establish the brief', M, 273, CW, INK)
GAP = 24
COL = (CW-GAP)/2
field('Audience + situation', 'Who is deciding, in which real situation?', M, 295, COL)
field('Objective + action', 'What should they understand or do differently?', M+COL+GAP, 295, COL)
field('Actual alternatives', 'What would they use or do without your product?', M, 373, COL)
field('Delivered advantage', 'Which relevant difference can you substantiate?', M+COL+GAP, 373, COL)

label('02 / Turn evidence into an insight', M, 454, CW, INK)
field('Observation', 'What recurring tension do customers recognize? Record source, date and scope.', M, 477, CW)
field('Interpretation', 'Which accepted assumption does it challenge? Keep inference separate from fact.', M, 551, CW)
field('Belief shift', 'From which current belief to which useful belief? Which buying criterion changes?', M, 625, CW)

rect(M, 706, CW, 67, PALE, radius=4)
label('Choose the arc before writing', M+12, 716, CW-24, INK)
para('<b>Change-led:</b> a meaningful external shift is established. Use page 2. '
     '<b>Reframe-led:</b> a persistent situation is misunderstood, with no established shift. Use the alternative on page 2. '
     'If neither is supported, clarify the value proposition or investigate further.',
     M+12, 733, CW-24, 9, 12.3)
end_page(1)

# PAGE 2 ---------------------------------------------------------------------
header(2, 'Build the change-led argument',
       "Marcus Andrews' five-stage method. Write the causal connection, not just a headline.")

stages = [
    ('1', 'The Change', 'What changed, compared with when, and for whom? What evidence supports the shift, its significance and its limits?'),
    ('2', 'The Impact', 'Which audience decision or outcome changes, and how? Make the stakes specific before introducing the product.'),
    ('3', 'The New Game', 'What should people do differently? Define practical actions, success criteria and trade-offs. Is the method useful without your product?'),
    ('4', "Why It's Hard", 'Which real barriers block this approach? Include organizational, technical, economic or behavioral constraints the product cannot solve.'),
    ('5', 'The Solution', 'Which delivered capability addresses each barrier? Explain how it changes the work, for whom, and with what evidence.'),
]
top = 151
for num, title, prompt in stages:
    rect(M, top, 25, 25, GREEN if num=='3' else PALE, radius=3)
    para(num, M+9, top+5, 12, 11, 14, INK, 'Bold')
    para(title, M+38, top+1, CW-38, 13.2, 18, INK, 'Bold')
    ph = para(prompt, M+38, top+23, CW-38, 10.5, 15, MUTED)
    write_lines(M+38, top+23+ph+17, CW-38)
    top += 98

rect(M, 652, CW, 121, PALE, radius=4)
rect(M, 652, 4, 121, PINK)
label('Reframe-led alternative / practical companion extension', M+14, 665, CW-28, INK)
para('Use this arc when the evidence supports a persistent problem or contradiction, rather than a meaningful external change:', M+14, 684, CW-28, 9.5, 13)
para('<b>Recognizable situation → consequential contradiction → new interpretation → practical approach → barriers → credible product contribution → next action.</b>',
     M+14, 719, CW-28, 10, 14)
para("This alternative is not Andrews' five-stage method. Do not invent a trend to complete the template.",
     M+14, 755, CW-28, 8.5, 11.4, MUTED)
end_page(2)

# PAGE 3 ---------------------------------------------------------------------
header(3, 'Connect product to proof',
       'Map one barrier to a capability, an outcome, and the evidence.')

chain = [
    ('Customer obstacle', 'A barrier to the proposed approach, grounded in the audience’s work.'),
    ('Delivered capability', 'What works today? Note configuration, access and dependencies.'),
    ('Practical mechanism', 'How does it change the work? Include the human or process contribution.'),
    ('Customer outcome', 'For whom, under which conditions? Include adoption effort and trade-offs.'),
    ('Evidence + limits', 'Source, date, population or use case, result and what it does not establish.'),
]
top=153
for i,(title,prompt) in enumerate(chain):
    label(title, M, top, 128, INK)
    para(prompt, M+144, top-1, CW-144, 10.5, 15, MUTED)
    write_lines(M+144, top+43, CW-144)
    if i < 4:
        line(M, top+58, CW, PALE, 1)
    top += 70

rect(M, 513, CW, 70, PALE, radius=4)
label('Keep four kinds of support separate', M+12, 523, CW-24, INK)
para('Evidence for the market change, the recommended approach, product behavior and business impact answer different questions. A demo does not prove reliable deployment; positive reactions do not prove purchase or revenue.',
     M+12, 541, CW-24, 9.1, 12.5)

label('Pressure-test the argument', M, 597, CW, INK)
para('1. <b>Logic:</b> Where is the earliest unsupported link? For a reframe-led arc, test the contradiction and its interpretation.', M, 620, CW, 9.5, 13.2)
para('2. <b>Alternatives:</b> Could a competitor use this unchanged? Why would a capable buyer rationally keep the current approach?', M, 653, CW, 9.5, 13.2)
para('3. <b>Comprehension:</b> Can an unfamiliar prospect retell the approach, product contribution and next action without coaching?', M, 686, CW, 9.5, 13.2)
label('Weakest link + repair / evidence needed', M, 724, CW, INK)
write_lines(M, 756, CW)
para('<b>Decide:</b> advance to a defined test, refine a specific gap, or rebuild the premise. Coherence is not proof of effectiveness.',
     M, 765, CW, 8.8, 12, MUTED)
end_page(3)

# PAGE 4 ---------------------------------------------------------------------
header(4, 'Make it clear and credible',
       'Review clarity, credibility, and AI claims before using the story.')

label('AI language / use when AI is material', M, 151, COL, INK)
label('Read-aloud review / use every time', M+COL+GAP, 151, COL, INK)
para('Temporarily remove AI labels. Are the customer, value, mechanism and reason to choose still clear? Restore terms that add necessary precision.', M, 174, COL, 10.5, 15.3)
para('Read the draft aloud. Mark places where you lose breath, stumble, reread or cannot explain the connection between ideas.', M+COL+GAP, 174, COL, 10.5, 15.3)
para('For each material claim, explain:<br/>• the task, inputs and delivered behavior;<br/>• human judgment, permissions and exceptions;<br/>• what is possible, live, measured or forecast;<br/>• proof suited to the promise.', M, 252, COL, 10.5, 15)
para('Check for:<br/>• one understandable idea at a time;<br/>• concrete work, credible stakes and empathy;<br/>• natural rhythm and useful transitions;<br/>• a specific idea worth remembering.', M+COL+GAP, 252, COL, 10.5, 15)
para('For agents, verify the resulting task or system state. A convincing response does not establish that the work was completed.', M, 344, COL, 9.2, 12.8, MUTED)
para('Ask a listener to retell the argument and the next action. Treat their response as evidence within that context, not a revenue forecast.', M+COL+GAP, 344, COL, 9.2, 12.8, MUTED)

label('Revision to make now', M, 406, CW, INK)
write_lines(M, 439, CW)

label('Useful starter prompts', M, 465, CW, INK)
prompts = [
    ('Build from facts', 'Help me build a narrative for [audience / decision] using [product facts and research]. Separate supported claims from hypotheses and choose the appropriate arc.'),
    ('Find the weak link', 'Pressure-test this draft. Identify the earliest unsupported assumption, the strongest credible objection and the smallest repair that addresses both.'),
    ('Check an AI promise', 'Review this AI claim against the available evidence. Explain the delivered behavior, human role and product limits; flag any leap from demonstration to outcome.'),
    ('Review spoken flow', 'Review this script for first-hearing clarity, breath, rhythm and credibility. Preserve concrete detail and qualifications that affect the truth.'),
]
top=489
for name, prompt in prompts:
    rect(M, top+2, 3, 15, LAVENDER if name=='Check an AI promise' else GREEN)
    para(name, M+12, top, 118, 10.2, 14.5, INK, 'Bold')
    para(escape(prompt), M+137, top, CW-137, 10.2, 14.5)
    top += 55

line(M, 719, CW)
para('<b>Method credit:</b> Marcus Andrews, <i>Narrative Design for Business</i>.<br/>m3ka.com/frameworks/narrative-design', M, 730, CW, 8.3, 11.4, MUTED)
c.linkURL('https://www.m3ka.com/frameworks/narrative-design', (M,H-754,M+CW,H-730), relative=0, thickness=0)
para('Independent practical companion by Shauna Azevedo-Brennan. The reframe-led alternative, proof mapping, pressure tests and editorial checks are companion extensions, not official Andrews methodology.',
     M, 758, CW, 7.8, 10.8, MUTED)
end_page(4)

c.save()
print(OUT)
