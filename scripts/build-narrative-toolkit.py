#!/usr/bin/env python3
"""Bundle the published PDFs and the complete, unchanged AI skill."""
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / 'assets/playbooks'
README = '''NARRATIVE DESIGN / THE COMPLETE TOOLKIT
Shauna Azevedo-Brennan

1. READ — narrative-design-playbook.pdf
The complete method: positioning, research, five narrative stages, a worked
example, evidence, pressure tests, AI guidance, and activation. The four
workbook pages are also included at the end of this guide.

2. APPLY — narrative-design-workbook.pdf
Four printable worksheets for your brief, story, proof, and review.
Use them independently or alongside the playbook in a workshop.

3. WORK WITH AI — narrative-design-playbook/
The complete companion skill, including SKILL.md and its reference files.
Install the whole folder in an assistant that supports custom skills, or
add its files as project references. Unzipping or uploading the toolkit
alone does not activate the skill.
Try: "Use Question Mode to guide me one question at a time."
Or: "Pressure-test this draft and repair its weakest argument."

Start here: https://shaunaleebrennan.github.io/shauna-ai-portfolio/playbook.html
Five-stage method: Marcus Andrews. Independent practical companion:
Shauna Azevedo-Brennan. Examples are fictional; validate claims and evidence.
'''
with ZipFile(ASSETS / 'narrative-design-toolkit.zip', 'w', ZIP_DEFLATED) as bundle:
    bundle.writestr('START-HERE.txt', README)
    bundle.write(ASSETS / 'narrative-design-guide.pdf', 'narrative-design-playbook.pdf')
    bundle.write(ASSETS / 'narrative-design-workbook.pdf', 'narrative-design-workbook.pdf')
    with ZipFile(ASSETS / 'narrative-design-skill.zip') as skill:
        for entry in skill.infolist():
            if not entry.is_dir():
                bundle.writestr(entry.filename, skill.read(entry.filename))
print('Built narrative-design-toolkit.zip: playbook, workbook, and complete AI skill.')
