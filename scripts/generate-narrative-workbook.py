#!/usr/bin/env python3
"""Build the four-page workbook with the portfolio's embedded fonts and colours."""
from pathlib import Path
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph

PROJECT = Path(__file__).resolve().parents[1]
OUT = PROJECT / 'assets/playbooks/narrative-design-workbook.pdf'
FONT_DIR = PROJECT / 'assets/fonts'
for name, file in [('Body', 'DMSans-Regular.ttf'), ('BodyBold', 'DMSans-SemiBold.ttf'),
                   ('Heading', 'Manrope-Medium.ttf'), ('HeadingBold', 'Manrope-SemiBold.ttf')]:
    pdfmetrics.registerFont(TTFont(name, str(FONT_DIR / file)))
pdfmetrics.registerFontFamily('Body', normal='Body', bold='BodyBold', italic='Body', boldItalic='BodyBold')

W, H = A4
M = 46
CW = W - M * 2
GAP = 28
COL = (CW - GAP) / 2
INK = HexColor('#171e18')
MUTED = HexColor('#5f675d')
RULE = HexColor('#cbd2c4')
CREAM = HexColor('#f8f6f0')
STAGES = ['#eee8f5', '#f7e3e9', '#e4f1d0', '#f3e7d7', '#e0eae1']
TINTS = [STAGES[0], STAGES[2], STAGES[1], STAGES[3]]
GUIDE = 'https://shaunaleebrennan.github.io/shauna-ai-portfolio/playbook.html'
c = canvas.Canvas(str(OUT), pagesize=A4, pageCompression=1)
c.setTitle('Narrative Design Workbook | Shauna Brennan')
c.setAuthor('Shauna Azevedo-Brennan')
c.setSubject('Four practical worksheets: brief, argument, proof, and review')

def para(text, x, top, width, size=10.5, leading=14.5, color=INK, font='Body'):
    style = ParagraphStyle('text', fontName=font, fontSize=size, leading=leading, textColor=color)
    p = Paragraph(text, style)
    _, height = p.wrap(width, 2000)
    assert top + height < H - 26, (text, top, height)
    p.drawOn(c, x, H - top - height)
    return height

def rule(x, top, width, color=RULE, weight=.55):
    c.setStrokeColor(color)
    c.setLineWidth(weight)
    c.line(x, H - top, x + width, H - top)

def rect(x, top, width, height, fill, radius=4):
    c.setFillColor(HexColor(fill) if isinstance(fill, str) else fill)
    c.roundRect(x, H - top - height, width, height, radius, fill=1, stroke=0)

def section(text, top):
    para(text, M, top, CW, 11, 15, MUTED, 'BodyBold')

def field(title, prompt, x, top, width, height=100):
    para(title, x, top, width, 12.5, 17, INK, 'HeadingBold')
    ph = para(prompt, x, top + 23, width, 10.2, 14, MUTED)
    first = top + height - 38
    assert top + 23 + ph <= first - 9, (title, ph, height)
    rule(x, first, width)
    rule(x, first + 24, width)

def checkbox(text, x, top, width, size=10):
    c.setStrokeColor(MUTED)
    c.setLineWidth(.65)
    c.roundRect(x, H - top - 9, 9, 9, 1.5, fill=0, stroke=1)
    para(text, x + 17, top - 3, width - 17, size, 14, INK)

def header(number, title, subtitle):
    rect(M, 29, 23, 4, '#c9ff63', 0)
    para('NARRATIVE DESIGN / WORKBOOK', M + 33, 25, 300, 7.8, 11, MUTED, 'BodyBold')
    para('SHAUNA BRENNAN', W - M - 104, 25, 104, 7.8, 11, MUTED, 'BodyBold')
    para(title, M, 56, CW, 30, 38, INK, 'Heading')
    para(subtitle, M, 104, CW, 11.3, 16, MUTED)
    tabs = ['01  Brief', '02  Story', '03  Proof', '04  Review']
    tab_w = (CW - 18) / 4
    for i, tab in enumerate(tabs):
        x = M + i * (tab_w + 6)
        rect(x, 140, tab_w, 28, TINTS[number - 1] if i == number - 1 else CREAM)
        para(tab, x + 12, 147, tab_w - 20, 9.4, 13, INK if i == number - 1 else MUTED,
             'BodyBold' if i == number - 1 else 'Body')

def end_page(number):
    rule(M, 790, CW)
    para('Five-stage method: Marcus Andrews. Practical companion: Shauna Brennan.', M, 799, CW - 35, 7.1, 9.5, MUTED)
    para(f'{number} / 4', W - M - 25, 799, 25, 7.8, 10, MUTED, 'BodyBold')
    c.linkURL(GUIDE, (M, H - 813, W - M - 35, H - 796), thickness=0)
    c.showPage()

# 01 / BRIEF. Reserve space for decisions instead of repeating the guide.
header(1, 'Start with the decision.', 'Choose one audience, one buying situation, and one change in understanding.')
field('Audience and situation', 'Who is deciding, and what is happening?', M, 192, COL, 100)
field('Objective and next action', 'What should they understand or do?', M + COL + GAP, 192, COL, 100)
field('Actual alternatives', 'What would they use or do today?', M, 310, COL, 100)
field('Relevant product advantage', 'Which difference can you substantiate?', M + COL + GAP, 310, COL, 100)
section('Turn the evidence into an insight', 437)
field('Observation', 'What did you see? Include the source, date, and situation.', M, 463, CW, 94)
field('Interpretation', 'What could it mean? Identify the assumption to investigate.', M, 568, CW, 88)
field('From this belief...', 'What does the audience assume today?', M, 673, COL, 88)
field('...to this belief', 'What useful idea should replace it?', M + COL + GAP, 673, COL, 88)
end_page(1)

# 02 / STORY. Stage colours match the interactive playbook.
header(2, 'Build the argument.', 'Write one or two sentences per stage. Make each idea lead to the next.')
stages = [
    ('The Change', 'What changed for this audience? Name the shift and its evidence.'),
    ('The Impact', 'Why does it matter? Connect the shift to a specific decision or outcome.'),
    ('The New Game', 'What should people do differently? Give actions and success criteria.'),
    ("Why It's Hard", 'What blocks that approach? Include work the product cannot solve.'),
    ('The Solution', 'How does the product help? Connect the barrier, mechanism, and proof.'),
]
for i, (title, prompt) in enumerate(stages):
    top = 193 + i * 110
    rect(M, top, 26, 26, STAGES[i])
    para(str(i + 1), M + 9, top + 5, 14, 11, 16, INK, 'BodyBold')
    field(title, prompt, M + 40, top, CW - 40, 104)
para('Working from a persistent contradiction rather than a new market change? Use the reframe-led alternative in the complete guide.', M, 750, CW, 9.2, 13, MUTED)
end_page(2)

# 03 / PROOF. Map a single claim all the way to its evidence.
header(3, 'Connect product to proof.', 'Choose one obstacle. Trace how the product helps and what supports the promise.')
chain = [
    ('Customer obstacle', 'Which barrier to the new approach matters to this audience?'),
    ('Delivered capability', 'What works today? Note configuration, access, and dependencies.'),
    ('Practical mechanism', 'How does it change the work? Include people and process.'),
    ('Customer outcome', 'Who benefits, and under which conditions? Name the result to measure.'),
    ('Evidence and limits', 'Record the source, date, scope, result, and what remains unproven.'),
]
for i, (title, prompt) in enumerate(chain):
    field(title, prompt, M, 193 + i * 105, CW, 94)
rect(M, 737, CW, 35, CREAM)
para('Match proof to the promise: a demonstration shows behaviour; customer outcomes need evidence from the relevant work.', M + 12, 746, CW - 24, 9.2, 13, MUTED)
end_page(3)

# 04 / REVIEW. Short checks lead to a recorded next test.
header(4, 'Make the story hold up.', 'Test the argument with people, then refine the language.')
tests = [
    ('Do they recognise it?', 'Ask about a recent situation. Where does the tension appear?'),
    ('Can they explain it?', 'Ask them to retell the approach and the next action.'),
    ('Why choose your product?', 'Compare the argument with their actual alternatives.'),
    ('Can you prove the promise?', 'Check the relevant workflow and the claimed result.'),
]
for i, (title, prompt) in enumerate(tests):
    field(title, prompt, M + (i % 2) * (COL + GAP), 193 + (i // 2) * 126, COL, 112)
rule(M, 456, CW)
para('If AI is part of the promise', M, 478, COL, 12.5, 17, INK, 'HeadingBold')
para('Read it aloud', M + COL + GAP, 478, COL, 12.5, 17, INK, 'HeadingBold')
for i, text in enumerate(['The task and scope are clear.', 'Human judgment is visible.', 'Delivered and planned are distinct.', 'Evidence supports the outcome.']):
    checkbox(text, M, 512 + i * 20, COL, 9.7)
for i, text in enumerate(['One clear idea at a time.', 'Concrete work and human stakes.', 'Natural rhythm and transitions.', 'A specific idea worth remembering.']):
    checkbox(text, M + COL + GAP, 512 + i * 20, COL, 9.7)
field('The next revision and test', 'What needs to change? Record who will test it, how, and when.', M, 624, CW, 103)
para('Decision', M, 750, 65, 10, 14, MUTED, 'BodyBold')
checkbox('Advance to a defined test', M + 67, 753, 175, 9.2)
checkbox('Refine', M + 264, 753, 85, 9.2)
checkbox('Rebuild', M + 367, 753, 100, 9.2)
end_page(4)

c.save()
print(OUT)
