import { useMemo, useState } from 'react';
import { reactInterviewQuestions, interviewCategories } from '../../../data/reactInterview';
import { interviewVisual, interviewClarifications } from '../../../data/reactInterviewVisuals';
import ReactMotion from './ReactMotion';
import { reactInterviewDeep } from '../../../data/reactInterviewDeep';
import './css/ReactLesson.css';
import './css/ReactPractice.css';
import './css/ReactInterview.css';

// Renders `code` spans inside short explanation strings.
function Code({ text }) {
  return text.split(/(`[^`]+`)/).map((part, i) => (part.startsWith('`') && part.endsWith('`') ? <code key={i}>{part.slice(1, -1)}</code> : part));
}

export function InterviewQuestion({ question, defaultRevealed = false }) {
  const [revealed, setRevealed] = useState(defaultRevealed);
  const clarification = interviewClarifications[question.id];
  const deep = reactInterviewDeep[question.id];
  return <article className="reactInterviewCard" id={`question-${question.id}`}>
    <header><span>QUESTION {question.id} / 200</span><small>{question.category} · PDF page {question.page}</small></header>
    <h3>{question.title}</h3>
    <button type="button" aria-expanded={revealed} aria-controls={`answer-${question.id}`} onClick={() => setRevealed(!revealed)}>
      {revealed ? 'Hide answer' : 'Study answer and example'}
    </button>
    {revealed && <div id={`answer-${question.id}`}>
      <h4>Detailed answer and example</h4>
      <p className="reactInterviewExcerpt">Code is a reference excerpt, not an embedded runnable application. Some questions compare separate alternatives or show CSS, terminal commands, and file layouts.</p>
      {question.blocks.map((block, i) => block.type === 'code'
        ? <pre key={i} tabIndex={0} aria-label={`Question ${question.id} code example`}><code>{block.text}</code></pre>
        : <p key={i}>{block.text}</p>)}
      {deep && <figure className="reactStepFlow" aria-label={`Question ${question.id} explained step by step`}>
        <figcaption>Explained step by step</figcaption>
        <ol>{deep.steps.map((step, i) => <li key={i} style={{ '--i': i }}><b>{i + 1}</b><span><Code text={step} /></span></li>)}</ol>
      </figure>}
      {deep && <aside className="reactTakeaway reactPitfall"><strong>Common pitfall</strong><p><Code text={deep.pitfall} /></p></aside>}
      {clarification && <aside className="reactTakeaway"><strong>Technical clarification</strong><p>{clarification.text}</p><a href={clarification.url} target="_blank" rel="noreferrer">Check the official reference</a></aside>}
      <h4>Follow the mechanism step by step</h4>
      <ReactMotion animation={interviewVisual(question)} />
      {deep && <details className="reactFollowUp"><summary>Follow-up the interviewer may ask: <Code text={deep.follow[0]} /></summary><p><Code text={deep.follow[1]} /></p></details>}
      <details><summary>Practice explaining this answer</summary>
        <p>Explain “{question.title}” in your own words. Trace the example with one concrete input, predict the visible result, then change one input and explain why the result changes. Use the diagram’s step buttons to check your reasoning.</p>
      </details>
    </div>}
  </article>;
}

export default function ReactInterview({ category: initialCategory = '' }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState(initialCategory);
  const [page, setPage] = useState(0);
  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase().replace(/^q(?=\d)/, '');
    return reactInterviewQuestions.filter(q => (!category || category === q.category) &&
      (!term || String(q.id) === term || `${q.title} ${q.blocks.map(b => b.text).join(' ')}`.toLowerCase().includes(term)));
  }, [query, category]);
  const pages = Math.ceil(filtered.length / 10);
  const shown = filtered.slice(page * 10, (page + 1) * 10);
  return <div className="dedicatedStructuredArticle reactLesson reactInterview">
    <section id="overview">
      <p className="lead">200 React interview questions, from first components to production architecture. Read the explanation, trace the code, and replay the visual model.</p>
      <p>Questions and examples are adapted from your supplied <cite>Top 200 React.js Interview Questions</cite> PDF. Original numbering and page references are retained. Examples are learning excerpts: add imports and the named library or framework before running them in a practice project.</p>
      <p>React 19 APIs are included. React Compiler requires compiler setup; it is not automatically enabled by installing React. Server Components and Server Functions require a supporting framework.</p>
    </section>
    <section id="concepts" className="reactInterviewToolbar" aria-label="Question filters">
      <label>Search questions, answers, or a number<input value={query} type="search" placeholder="Try stale closure, Suspense, or Q197" onChange={e => { setQuery(e.target.value); setPage(0); }} /></label>
      <label>Topic<select value={category} onChange={e => { setCategory(e.target.value); setPage(0); }}><option value="">All topics</option>{interviewCategories.map(c => <option key={c}>{c}</option>)}</select></label>
      <p role="status">{filtered.length} questions found. {shown.length > 0 && `Showing ${page * 10 + 1}–${page * 10 + shown.length}.`}</p>
    </section>
    <section id="example" aria-label="Interview answers">
      {shown.map(q => <InterviewQuestion key={q.id} question={q} />)}
      {!shown.length && <p>No matching questions. Try a shorter search or choose all topics.</p>}
    </section>
    <nav className="reactInterviewPagination" aria-label="Question pages">
      <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous questions</button>
      <span>Page {pages ? page + 1 : 0} of {pages}</span>
      <button disabled={page + 1 >= pages} onClick={() => setPage(p => p + 1)}>Next questions</button>
    </nav>
    <section id="mistakes"><h2>Read examples critically</h2><p>The PDF includes abbreviated and legacy examples. React reconciliation does not promise a mathematically minimal DOM diff. Suspense does not automatically detect ordinary Effect-based fetching. Client route guards do not replace server authorization. A modal also needs focus management, focus restoration and an accessible name.</p></section>
    <section id="check"><h2>Interview practice routine</h2><ol><li>Choose a question and explain it before revealing the answer.</li><li>Read the example and follow the animation one step at a time.</li><li>Rebuild the example, test its edge cases, and explain a tradeoff.</li></ol><p>Verify API details in the <a href="https://react.dev/reference/react" target="_blank" rel="noreferrer">official React reference</a>.</p></section>
  </div>;
}
