import { useEffect, useState } from 'react';
import { Player } from './PatternLessonArticle.jsx';
const lessons = import.meta.glob('../../data/patterns/generated/*.json', { import: 'default' });

export default function PatternGuideAnimation({ problemId }) {
  const [lesson, setLesson] = useState(null);
  const [failed, setFailed] = useState(false);
  const [mode, setMode] = useState('optimal');
  useEffect(() => {
    let active = true;
    const load = lessons[`../../data/patterns/generated/${problemId}.json`];
    if (!load) { setFailed(true); return; }
    load().then(value => { if (active) setLesson(value); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [problemId]);
  if (failed) return <p>The animation could not load. Open a worked problem below or reload this page.</p>;
  if (!lesson) return <p role="status">Loading the worked-example animation…</p>;
  return <div className="patternGuideAnimation">
    <h3>{lesson.title}: watch the pattern in action</h3>
    <p>{lesson.contract}</p>
    <div className="patternControls" role="group" aria-label="Guide solution approach">
      <button aria-pressed={mode === 'brute'} onClick={() => setMode('brute')}>Brute force / baseline</button>
      <button aria-pressed={mode === 'optimal'} onClick={() => setMode('optimal')}>Optimal / optimized</button>
    </div>
    <p>{lesson.reasoning[mode === 'optimal' ? 1 : 0]}</p>
    <Player key={`${problemId}/${mode}`} run={lesson.runs[mode][0]} />
  </div>;
}
