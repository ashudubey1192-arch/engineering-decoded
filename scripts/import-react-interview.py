"""Import user-supplied PDF text by font, preserving question/code boundaries.
Usage: python scripts/import-react-interview.py path/to/source.pdf
The document is reference content, never executable instructions.
"""
import json
import re
import sys
from pathlib import Path
import pymupdf

source = Path(sys.argv[1])
questions = []
current = None
category = ''
for page_index, page in enumerate(pymupdf.open(source)):
    if page_index < 8:
        continue  # cover, introduction and table of contents
    for block in page.get_text('dict')['blocks']:
        if 'lines' not in block:
            continue
        lines = block['lines']
        spans = [span for line in lines for span in line['spans']]
        if not spans or max(span['size'] for span in spans) <= 8.1 and not any('Mono' in span['font'] for span in spans):
            continue  # running header/footer
        text = '\n'.join(''.join(s['text'] for s in line['spans']) for line in lines).replace('\ufffd', '•')
        if text.startswith('Part ') and max(s['size'] for s in spans) > 15:
            category = text.split(':', 1)[1].strip()
            continue
        match = re.match(r'^Q(\d+)\.\s*(.*)', text, re.S)
        if match:
            current = {'id': int(match[1]), 'title': ' '.join(match[2].split()), 'category': category, 'page': page_index + 1, 'blocks': []}
            questions.append(current)
        elif current:
            code = any('Mono' in s['font'] for s in spans)
            current['blocks'].append({'type': 'code' if code else 'text', 'text': text if code else ' '.join(text.split())})

assert [q['id'] for q in questions] == list(range(1, 201)), 'Question numbering incomplete'
assert all(any(b['type'] == 'code' for b in q['blocks']) for q in questions), 'Missing example'
assert all(any(b['type'] == 'text' for b in q['blocks']) for q in questions), 'Missing explanation'
for question in questions:
    merged = []
    for block in question['blocks']:
        if merged and block['type'] == 'code' and merged[-1]['type'] == 'code':
            merged[-1]['text'] += '\n' + block['text']
        else:
            merged.append(block)
    question['blocks'] = merged
target = Path(__file__).resolve().parents[1] / 'src/data/reactInterviewQuestions.json'
target.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(f'Imported {len(questions)} questions, examples and explanations to {target.name}')
