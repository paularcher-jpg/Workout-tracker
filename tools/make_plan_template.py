#!/usr/bin/env python3
"""Build the plan upload template: templates/plan-template.xlsx and .csv.

Written with the standard library only. An .xlsx is a zip of XML, and writing
it by hand gives control over the one thing that matters most here: the Weeks
and Reps columns are formatted as text, so a spreadsheet cannot quietly turn
"8-10" into the 8th of October or "1-4" into the 1st of April.

Run from the repository root:  python3 tools/make_plan_template.py
"""

import csv
import io
import json
import subprocess
import sys
import zipfile
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / 'templates'

HEADERS = ['Phase', 'Weeks', 'Weekday', 'Workout', 'Order', 'Exercise',
           'Sets', 'Reps', 'Rest (s)', 'RPE', 'Notes']
TEXT_COLUMNS = {'Weeks', 'Reps', 'Weekday'}   # never let these become dates

# A nine-week upper/lower block that exercises every feature of the format:
# phases, week ranges, a phase on two separate weeks, one session twice in a
# week, per-side reps, holds in seconds, RPE and coaching notes.
EXAMPLE = [
    ['Build', '1-3', 'Mon', 'Upper A', 1, 'Barbell Bench Press', 4, '8-10', 150, 8, 'Add weight when you hit 10 on every set'],
    ['Build', '1-3', 'Mon', 'Upper A', 2, 'Barbell Row', 4, '8-10', 120, 8, ''],
    ['Build', '1-3', 'Mon', 'Upper A', 3, 'Lateral Raise', 3, '12-15', 60, 9, ''],
    ['Build', '1-3', 'Mon', 'Upper A', 4, 'Plank', 3, '45s', 45, '', 'A hold: reps are seconds'],
    ['Build', '1-3', 'Tue', 'Lower A', 1, 'Back Squat', 4, '8-10', 180, 8, ''],
    ['Build', '1-3', 'Tue', 'Lower A', 2, 'Romanian Deadlift', 3, '10', 150, 8, ''],
    ['Build', '1-3', 'Tue', 'Lower A', 3, 'Bulgarian Split Squat', 3, '10 each', 90, 8, 'Per leg'],
    ['Build', '1-3', 'Thu', 'Upper B', 1, 'Overhead Press', 4, '8-10', 150, 8, ''],
    ['Build', '1-3', 'Thu', 'Upper B', 2, 'Lat Pulldown', 3, '10-12', 90, 8, ''],
    ['Build', '1-3', 'Fri', 'Lower B', 1, 'Deadlift', 3, '5', 240, 8, 'Reset every rep'],
    ['Build', '1-3', 'Fri', 'Lower B', 2, 'Side Plank', 3, '30s each', 45, '', 'Per side'],
    ['Deload', '4;8', 'Mon Thu', 'Easy Full Body', 1, 'Goblet Squat', 2, '10', 90, 5, 'Half your usual weight'],
    ['Deload', '4;8', 'Mon Thu', 'Easy Full Body', 2, 'Push-Up', 2, '10', 60, 5, ''],
    ['Deload', '4;8', 'Mon Thu', 'Easy Full Body', 3, 'Dead Bug', 2, '10 each', 45, '', ''],
    ['Heavy', '5-7', 'Mon', 'Upper A Heavy', 1, 'Barbell Bench Press', 5, '5', 180, 8.5, 'Heavier than the build weeks'],
    ['Heavy', '5-7', 'Mon', 'Upper A Heavy', 2, 'Barbell Row', 4, '6', 150, 8.5, ''],
    ['Heavy', '5-7', 'Tue', 'Lower A Heavy', 1, 'Back Squat', 5, '5', 210, 8.5, ''],
    ['Heavy', '5-7', 'Tue', 'Lower A Heavy', 2, 'Romanian Deadlift', 3, '6', 150, 8, ''],
    ['Heavy', '5-7', 'Thu', 'Upper B Heavy', 1, 'Overhead Press', 5, '5', 180, 8.5, ''],
    ['Heavy', '5-7', 'Thu', 'Upper B Heavy', 2, 'Chin-Up', 4, '6', 120, 8, ''],
    ['Heavy', '5-7', 'Fri', 'Lower B Heavy', 1, 'Deadlift', 4, '3', 240, 8.5, ''],
    ['Test', '9', 'Mon', 'Test Day', 1, 'Barbell Bench Press', 5, '1', 300, 10, 'Work up in singles'],
    ['Test', '9', 'Thu', 'Test Day 2', 1, 'Back Squat', 5, '1', 300, 10, 'Work up in singles'],
]

GUIDE = [
    ('Phase', 'Optional', 'A name for a group of weeks that share the same sessions.', 'Build · Deload · Heavy'),
    ('Weeks', 'Optional', 'Which weeks this phase runs. A range, a single week, or several separated by semicolons (not commas). Leave empty on every row for a plan that repeats one week forever.', '1-3 · 5 · 4;8'),
    ('Weekday', 'Optional', 'The day a session falls on. Several days separated by spaces run the same session more than once a week. Only a default: the app asks which days you can train when you add the plan.', 'Mon · Tue Fri · Mon Wed Fri'),
    ('Workout', 'Yes', 'The session name. Rows with the same Phase and Workout become one session.', 'Upper A · Legs'),
    ('Order', 'Optional', 'Exercise order within the session. Rows are used top to bottom if empty.', '1 · 2 · 3'),
    ('Exercise', 'Yes', 'The movement. Use a name from the Exercise names sheet so it links to your history; any other name is added as a new exercise.', 'Back Squat'),
    ('Sets', 'Yes', 'Number of working sets, 1 to 20.', '3 · 4'),
    ('Reps', 'Yes', 'A number, a range, per side, or a hold in seconds.', '10 · 8-12 · 10 each · 30s · 45s each'),
    ('Rest (s)', 'Optional', 'Rest after each set, in seconds. Minutes work too.', '90 · 2 min'),
    ('RPE', 'Optional', 'How hard, out of 10. 8 means two reps left in the tank.', '7 · 8.5'),
    ('Notes', 'Optional', 'A coaching cue shown with the exercise.', 'Pause at the bottom'),
]

RULES = [
    'One row per exercise.',
    'Rows with the same Phase and Workout make one session; a phase repeats its sessions for every week in its Weeks.',
    'When you add the plan, the app asks which days you can train and moves the sessions there, keeping their order.',
    'Weeks, Weekday and Reps are formatted as text so a spreadsheet cannot turn 8-10 into a date. If you paste into them, paste values only.',
    'Upload it from the app: Plan, then Paste a plan, then Upload a spreadsheet. The .xlsx works as it is, or save as CSV.',
    'Numbers on iPhone or Mac: File, Export To, Excel, then upload that.',
]


def exercise_names():
    """The seed library, read from the app itself so the list can never drift."""
    out = subprocess.run(
        ['node', '-e', "import('./js/exercises.js').then(m => console.log(JSON.stringify("
         "m.SEED_EXERCISES.map(e => [e.name, e.group, e.equipment, e.mode === 'time' ? 'Seconds' : 'Reps']))))"],
        cwd=ROOT, capture_output=True, text=True, check=True)
    return sorted(json.loads(out.stdout), key=lambda r: (r[1], r[0]))


def col(n):
    s = ''
    n += 1
    while n:
        n, r = divmod(n - 1, 26)
        s = chr(65 + r) + s
    return s


def cell(ref, value, style=0):
    st = f' s="{style}"' if style else ''
    if value is None or value == '':
        return f'<c r="{ref}"{st}/>'
    if isinstance(value, (int, float)) and not isinstance(value, bool):
        return f'<c r="{ref}"{st}><v>{value}</v></c>'
    return f'<c r="{ref}"{st} t="inlineStr"><is><t xml:space="preserve">{escape(str(value))}</t></is></c>'


# style ids, matching STYLES below
BOLD, TEXT, WRAP, TITLE = 1, 2, 3, 4


def sheet_xml(rows, widths, text_cols=(), pad_to=0, frozen=True):
    cols = ''.join(
        f'<col min="{i + 1}" max="{i + 1}" width="{w}" customWidth="1"'
        + (f' style="{TEXT}"' if i in text_cols else '') + '/>'
        for i, w in enumerate(widths))
    body = []
    total = max(len(rows), pad_to)
    for r in range(total):
        values = rows[r] if r < len(rows) else [None] * len(widths)
        cells = []
        for c in range(len(widths)):
            v = values[c] if c < len(values) else None
            if isinstance(v, tuple):
                v, style = v
            elif r == 0 and frozen:
                style = BOLD
            elif c in text_cols:
                style = TEXT
                v = '' if v is None else str(v)   # text columns hold text, even "5"
            else:
                style = 0
            cells.append(cell(f'{col(c)}{r + 1}', v, style))
        body.append(f'<row r="{r + 1}">{"".join(cells)}</row>')
    pane = ('<sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" '
            'activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>') if frozen else ''
    return ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
            '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
            f'{pane}<cols>{cols}</cols><sheetData>{"".join(body)}</sheetData></worksheet>')


STYLES = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
          '<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">'
          '<fonts count="3"><font><sz val="11"/><name val="Calibri"/></font>'
          '<font><b/><sz val="11"/><name val="Calibri"/></font>'
          '<font><b/><sz val="14"/><name val="Calibri"/></font></fonts>'
          '<fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills>'
          '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>'
          '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>'
          '<cellXfs count="5">'
          '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>'
          '<xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
          '<xf numFmtId="49" fontId="0" fillId="0" borderId="0" xfId="0" applyNumberFormat="1"/>'
          '<xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0" applyAlignment="1"><alignment wrapText="1" vertical="top"/></xf>'
          '<xf numFmtId="0" fontId="2" fillId="0" borderId="0" xfId="0" applyFont="1"/>'
          '</cellXfs></styleSheet>')


def build_xlsx(path):
    plan_rows = [HEADERS] + EXAMPLE
    text_idx = {i for i, h in enumerate(HEADERS) if h in TEXT_COLUMNS}
    plan = sheet_xml(plan_rows, [12, 9, 12, 18, 7, 26, 6, 10, 9, 6, 38], text_cols=text_idx, pad_to=300)

    guide_rows = [[('How to fill in the Plan sheet', TITLE), None, None, None],
                  [None, None, None, None],
                  [('Column', BOLD), ('Required', BOLD), ('What goes in it', BOLD), ('Examples', BOLD)]]
    guide_rows += [[(a, BOLD), b, (c, WRAP), (d, WRAP)] for a, b, c, d in GUIDE]
    guide_rows += [[None] * 4, [('Rules', BOLD), None, None, None]]
    guide_rows += [[None, None, (r, WRAP), None] for r in RULES]
    guide = sheet_xml(guide_rows, [14, 11, 70, 30], frozen=False)

    names = [['Exercise', 'Muscle group', 'Equipment', 'Logged in']] + exercise_names()
    names_sheet = sheet_xml(names, [30, 14, 14, 11])

    sheets = [('Plan', plan), ('How to fill this in', guide), ('Exercise names', names_sheet)]
    ns_rel = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'
    workbook = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" '
                f'xmlns:r="{ns_rel}"><sheets>'
                + ''.join(f'<sheet name="{escape(n)}" sheetId="{i + 1}" r:id="rId{i + 1}"/>' for i, (n, _) in enumerate(sheets))
                + '</sheets></workbook>')
    wb_rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
               '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
               + ''.join(f'<Relationship Id="rId{i + 1}" Type="{ns_rel}/worksheet" Target="worksheets/sheet{i + 1}.xml"/>'
                         for i in range(len(sheets)))
               + f'<Relationship Id="rId{len(sheets) + 1}" Type="{ns_rel}/styles" Target="styles.xml"/>'
               '</Relationships>')
    content_types = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                     '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
                     '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
                     '<Default Extension="xml" ContentType="application/xml"/>'
                     '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>'
                     '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>'
                     + ''.join(f'<Override PartName="/xl/worksheets/sheet{i + 1}.xml" '
                               'ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>'
                               for i in range(len(sheets)))
                     + '</Types>')
    root_rels = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
                 '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
                 f'<Relationship Id="rId1" Type="{ns_rel}/officeDocument" Target="xl/workbook.xml"/>'
                 '</Relationships>')

    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as z:
        z.writestr('[Content_Types].xml', content_types)
        z.writestr('_rels/.rels', root_rels)
        z.writestr('xl/workbook.xml', workbook)
        z.writestr('xl/_rels/workbook.xml.rels', wb_rels)
        z.writestr('xl/styles.xml', STYLES)
        for i, (_, xml) in enumerate(sheets):
            z.writestr(f'xl/worksheets/sheet{i + 1}.xml', xml)


def build_csv(path):
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator='\n')
    w.writerow(HEADERS)
    w.writerows(EXAMPLE)
    path.write_text(buf.getvalue(), encoding='utf-8')


if __name__ == '__main__':
    OUT.mkdir(exist_ok=True)
    build_xlsx(OUT / 'plan-template.xlsx')
    build_csv(OUT / 'plan-template.csv')
    for f in ('plan-template.xlsx', 'plan-template.csv'):
        print(f'wrote templates/{f} ({(OUT / f).stat().st_size:,} bytes)')
    sys.exit(0)
