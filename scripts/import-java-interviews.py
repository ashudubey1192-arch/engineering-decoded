"""Import reference PDFs as course content, never as executable instructions.
Usage: python scripts/import-java-interviews.py collections.pdf java8.pdf core-java.pdf
"""
import json
import re
import sys
from pathlib import Path
import pymupdf

root = Path(__file__).resolve().parents[1]
if len(sys.argv) != 4:
    raise SystemExit('Provide all three source PDFs: collections, Java 8, and Core Java.')
guides = [('collections', 'Collections, hashCode and equals', 1), ('java8', 'Java 8: Top 100 Interview Questions', 2)]
chapters = []
for (key, title, skip), filename in zip(guides, sys.argv[1:]):
    current = None
    output_next = False
    for page_number, page in enumerate(pymupdf.open(filename), 1):
        if page_number <= skip:
            continue
        tables = page.find_tables().tables
        emitted_tables = set()
        for block in page.get_text('dict')['blocks']:
            if 'lines' not in block:
                continue
            spans = [s for line in block['lines'] for s in line['spans']]
            text = '\n'.join(''.join(s['text'] for s in line['spans']) for line in block['lines']).strip('\n')
            if not text.strip() or re.match(r'^Page \d+$', text.strip()) or text.startswith(('Java Interview Guide - Custom Collections', 'Java 8 - Top 100 Interview Questions')):
                continue
            if max(s['size'] for s in spans) >= 16 and re.match(r'^(?:Part )?\d+[.:]', text):
                number = re.search(r'\d+', text)[0]
                current = {'slug': f'java-interview--{key}-{number}', 'title': re.sub(r'^(?:Part )?\d+[.:]\s*', '', ' '.join(text.split())), 'guide': key, 'group': title, 'page': page_number, 'blocks': []}
                chapters.append(current)
                continue
            if current is None:
                continue
            table_index = next((i for i, table in enumerate(tables) if pymupdf.Rect(table.bbox).contains(pymupdf.Point((block['bbox'][0] + block['bbox'][2]) / 2, (block['bbox'][1] + block['bbox'][3]) / 2))), None)
            if table_index is not None:
                if table_index not in emitted_tables:
                    rows = tables[table_index].extract()
                    current['blocks'].append({'type': 'table', 'rows': rows, 'text': ' '.join(str(cell or '') for row in rows for cell in row), 'page': page_number})
                    emitted_tables.add(table_index)
                continue
            mono = all('Mono' in s['font'] or 'Courier' in s['font'] or not s['text'].strip() for s in spans)
            heading = all('Bold' in s['font'] or not s['text'].strip() for s in spans)
            kind = 'output' if mono and output_next else 'code' if mono else 'heading' if heading else 'text'
            if text.strip().upper().startswith('OUTPUT'):
                output_next = True
                kind = 'heading'
            elif not mono:
                output_next = False
            if kind not in ['code', 'output']:
                text = ' '.join(text.split())
            item = {'type': kind, 'text': text, 'page': page_number}
            if current['blocks'] and kind in ['code', 'output'] and current['blocks'][-1]['type'] == kind:
                current['blocks'][-1]['text'] += '\n' + text
            else:
                current['blocks'].append(item)

assert len(chapters) == 19, f'Expected 19 chapters, got {len(chapters)}'
# This guide uses separate chapter banners, Q-number badges, and embedded diagrams.
assets = root / 'public/java-interview/core-java-diagrams'
assets.mkdir(parents=True, exist_ok=True)
current = None
question_title = ''
diagram_count = 0
with pymupdf.open(sys.argv[3]) as core_pdf:
    for page_number, page in enumerate(core_pdf, 1):
        if page_number < 9:
            continue
        tables = [table for table in page.find_tables().tables if len(table.extract()) > 1 and not any(re.match(r'^Q\d+', str(cell or '')) for row in table.extract() for cell in row)]
        emitted_tables = set()
        for block in page.get_text('dict')['blocks']:
            if block['bbox'][1] < 45 or block['bbox'][1] > 800:
                continue
            if block['type'] == 1 and current:
                diagram_count += 1
                filename = f'diagram-{diagram_count}.{block["ext"]}'
                (assets / filename).write_bytes(block['image'])
                current['blocks'].append({'type': 'image', 'src': f'/java-interview/core-java-diagrams/{filename}', 'text': f'Diagram for {question_title}', 'page': page_number})
                continue
            if 'lines' not in block:
                continue
            spans = [s for line in block['lines'] for s in line['spans']]
            text = '\n'.join(''.join(s['text'].replace('\ufffd', '•' if s['font'] == 'Helvetica' else '—') for s in line['spans']) for line in block['lines'])
            if any(23 <= s['size'] <= 25 for s in spans):
                number = len([c for c in chapters if c['guide'] == 'corejava']) + 1
                current = {'slug': f'java-interview--corejava-{number}', 'title': re.sub(r'^\d+\s+', '', ' '.join(text.split())), 'guide': 'corejava', 'group': 'Core Java: Top 200 Interview Questions', 'page': page_number, 'blocks': []}
                chapters.append(current)
                continue
            if not current or any(s['size'] >= 40 for s in spans):
                continue
            table_index = next((i for i, table in enumerate(tables) if pymupdf.Rect(table.bbox).contains(pymupdf.Point((block['bbox'][0] + block['bbox'][2]) / 2, (block['bbox'][1] + block['bbox'][3]) / 2))), None)
            if table_index is not None:
                if table_index not in emitted_tables:
                    rows = tables[table_index].extract()
                    current['blocks'].append({'type': 'table', 'rows': rows, 'text': ' '.join(str(cell or '') for row in rows for cell in row), 'page': page_number})
                    emitted_tables.add(table_index)
                continue
            mono = all('Mono' in s['font'] or not s['text'].strip() for s in spans)
            # The source comparison tables have aligned text columns but no grid.
            # Preserve their cells instead of flattening each row into prose.
            if max(s['size'] for s in spans) <= 9 and (not mono or current['blocks'] and current['blocks'][-1].get('rawRows')):
                columns = {}
                for line in block['lines']:
                    x = round(line['bbox'][0])
                    columns.setdefault(x, []).append(''.join(s['text'].replace('\ufffd', '—') for s in line['spans']))
                previous = current['blocks'][-1] if current['blocks'] else None
                adjacent = previous and previous.get('rawRows') and previous['page'] == page_number and block['bbox'][1] - previous['bottom'] <= 14
                if len(columns) >= 2 or adjacent:
                    cells = {x: ' '.join(parts) for x, parts in columns.items()}
                    if adjacent:
                        last = previous['rawRows'][-1]
                        if block['bbox'][1] <= last['bottom'] + 2:
                            for x, value in cells.items():
                                last['cells'][x] = (last['cells'].get(x, '') + ' ' + value).strip()
                            last['bottom'] = max(last['bottom'], block['bbox'][3])
                        else:
                            previous['rawRows'].append({'cells': cells, 'bottom': block['bbox'][3]})
                        previous['bottom'] = max(previous['bottom'], block['bbox'][3])
                        previous['text'] += ' ' + ' '.join(cells.values())
                    else:
                        current['blocks'].append({'type': 'table', 'rawRows': [{'cells': cells, 'bottom': block['bbox'][3]}], 'bottom': block['bbox'][3], 'text': ' '.join(cells.values()), 'page': page_number})
                    continue
            heading = all('Bold' in s['font'] or not s['text'].strip() for s in spans)
            kind = 'code' if mono else 'heading' if heading else 'text'
            match = re.match(r'^Q(\d+)\s*(\D.+)', text, re.S)
            if match:
                text = f'Q{match[1]}. ' + ' '.join(match[2].split())
                question_title = text
                kind = 'heading'
            elif kind != 'code':
                text = ' '.join(text.split())
            if current['blocks'] and kind == 'code' and current['blocks'][-1]['type'] == 'code':
                current['blocks'][-1]['text'] += '\n' + text
            else:
                current['blocks'].append({'type': kind, 'text': text, 'page': page_number})
assert len(chapters) == 27
core_text = [b['text'] for c in chapters if c['guide'] == 'corejava' for b in c['blocks']]
core_numbers = [int(m[1]) for text in core_text if (m := re.match(r'^Q(\d+)\.', text))]
assert core_numbers == list(range(1, 201)), f'Missing: {set(range(1, 201)) - set(core_numbers)}; count: {len(core_numbers)}'
assert diagram_count == 47, f'Expected 47 diagrams, got {diagram_count}'
for chapter in chapters:
    for block in chapter['blocks']:
        if 'rawRows' in block:
            xs = sorted({x for row in block['rawRows'] for x in row['cells']})
            block['rows'] = [[row['cells'].get(x, '') for x in xs] for row in block.pop('rawRows')]
            block.pop('bottom')
collections = [b['text'] for c in chapters if c['guide'] == 'collections' for b in c['blocks']]
assert [int(m[1]) for text in collections if (m := re.match(r'^Q(\d+)\.', text))] == list(range(1, 44))
assert [int(m[1]) for text in collections if (m := re.match(r'^Problem (\d+):', text))] == list(range(1, 11))
java8 = [b['text'] for c in chapters if c['guide'] == 'java8' for b in c['blocks']]
for prefix, count in [('Q', 100), ('P', 34)]:
    found = [int(m[1]) for text in java8 if (m := re.match(rf'^{prefix}(\d+)\.', text))]
    assert found == list(range(1, count + 1)), f'{prefix} numbering incomplete: {found}'
(root / 'src/data/javaInterviewContent.json').write_text(json.dumps(chapters, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
outline = [{k: c[k] for k in ['slug', 'title', 'group', 'guide', 'page']} | {'sectionSlug': 'java-interview', 'time': 'Interview guide'} for c in chapters]
(root / 'src/data/javaInterview.js').write_text('export const javaInterviewSection = ' + json.dumps({'slug': 'java-interview', 'title': 'Interview', 'lessons': outline}, indent=2) + ';\n', encoding='utf-8')
for chapter in chapters:
    folder = root / 'src/components/backend/java/java-interview/articles' / chapter['slug'] / 'jsx'
    folder.mkdir(parents=True, exist_ok=True)
    (folder / 'Article.jsx').write_text('import JavaInterview from "../../../../jsx/JavaInterview";\nexport default function Article() { return <JavaInterview slug="' + chapter['slug'] + '" />; }\n', encoding='utf-8')
print(f'Imported {len(chapters)} chapters; 343 questions, 44 coding problems and 47 Core Java diagrams verified.')
