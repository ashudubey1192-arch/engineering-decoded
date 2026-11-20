import { useMemo, useState } from 'react';
import chapters from '../../../../data/javaInterviewContent.json';
import JavaCode from './JavaCode';
import '../css/CoreJavaLesson.css';
import '../css/JavaInterview.css';

export function questionGroups(blocks) {
  const groups = [];
  for (const block of blocks) {
    if (!groups.length || /^(?:Q\d+\.|P\d+\.|Problem\s+\d+)/.test(block.text)) groups.push([]);
    groups.at(-1).push(block);
  }
  return groups;
}

export default function JavaInterview({ slug }) {
  const chapter = chapters.find(item => item.slug === slug);
  const [query, setQuery] = useState('');
  const groups = useMemo(() => questionGroups(chapter.blocks), [chapter]);
  const matching = groups.filter(group => group.some(block => block.text.toLowerCase().includes(query.trim().toLowerCase())));
  const pdf = chapter.guide === 'java8' ? 'java8-top100.pdf' : 'java-collections-equality.pdf';
  return <div className="dedicatedStructuredArticle coreJavaLesson javaInterview">
    <section id="overview">
      <p className="lead">{chapter.group} · {chapter.title}</p>
      <p>Interview questions, explanations, code examples and recorded outputs from the supplied guide. Source page references are preserved for comparison.</p>
      <p>{chapter.guide === 'java8' ? 'This guide targets Java 8. Its full interview collection includes Q1–Q100 and stream coding problems P1–P34.' : 'This guide includes 43 questions and 10 coding problems about custom collections and equality contracts. Its examples target Java 17 or later.'} Code blocks may be excerpts that belong inside a class or method. Outputs below are reported by the source guide.</p>
      <a href={`/java-interview/${pdf}#page=${chapter.page}`} target="_blank" rel="noreferrer">Open the attached guide at page {chapter.page}</a>
    </section>
    <section id="concepts" className="javaInterviewSearch">
      <label htmlFor={`search-${slug}`}>Search this interview chapter</label>
      <input id={`search-${slug}`} type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search a question, concept, or code example" />
      <p role="status">{matching.length} of {groups.length} question groups shown</p>
    </section>
    <section id="example" aria-label="Interview questions and answers">
      {matching.map(group => <article className="javaInterviewQuestion" key={chapter.blocks.indexOf(group[0])}>
        <small>Source: page {group[0].page}</small>
        {group.map((block, index) => block.type === 'code' || block.type === 'output'
          ? <pre key={index} tabIndex={0} aria-label={block.type === 'output' ? 'Recorded output' : 'Java code example'}><JavaCode output={block.type === 'output'}>{block.text}</JavaCode></pre>
          : block.type === 'table' ? <div className="javaInterviewTable" key={index} tabIndex={0} role="region" aria-label={`Comparison table from page ${block.page}`}><table><thead><tr>{block.rows[0].map((cell, i) => <th scope="col" key={i}>{cell || 'Feature'}</th>)}</tr></thead><tbody>{block.rows.slice(1).map((row, r) => <tr key={r}>{row.map((cell, c) => <td key={c}>{cell}</td>)}</tr>)}</tbody></table></div>
          : block.type === 'heading' ? <h3 key={index}>{block.text}</h3> : <p key={index}>{block.text}</p>)}
      </article>)}
      {!matching.length && <p>No matching questions. Clear the search to see the full chapter.</p>}
    </section>
    <section id="check"><h2>Practice this chapter</h2><ol><li>Explain the question aloud before reading its answer.</li><li>Trace the example and predict its output.</li><li>Run the example in the matching Java version, then test an edge case.</li></ol></section>
  </div>;
}
