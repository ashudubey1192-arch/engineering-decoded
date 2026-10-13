import { useEffect, useRef, useState } from 'react';
import { getTutorialLesson } from '../../data/tutorialLessons';
import { getAiConceptQuestions } from '../../data/aiConceptExercises';
import ConceptQuiz from './ConceptQuiz';
import AiExampleVisual from './AiExampleVisual';
import { getAiTrace } from '../../data/aiConceptTraces';
import './AiConceptLearning.css';


function TraceAnimation({ article, mechanism }) {
  const frames = getAiTrace(mechanism);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(5000);
  const [visible, setVisible] = useState(true);
  const region = useRef(null);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const reduce = event => { if (event.matches) setPlaying(false); };
    preference.addEventListener('change', reduce);
    const observer = new window.IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (region.current) observer.observe(region.current);
    return () => { preference.removeEventListener('change', reduce); observer.disconnect(); };
  }, []);
  useEffect(() => {
    if (!playing || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setStep(value => (value + 1) % frames.length);
    }, speed);
    return () => window.clearInterval(timer);
  }, [playing, visible, speed, frames.length]);
  const select = value => { setStep(value); setPlaying(false); };
  return <section id="ai-animation" ref={region} className={`aiTrace ${playing && visible ? 'isPlaying' : ''}`} aria-label={`${article.title} animated walkthrough`}>
    <header><small>ANIMATED WORKED EXAMPLE</small><h2>{mechanism.title}</h2><p>Follow the example one step or case at a time. Select any card to inspect it.</p></header>
    <div className="aiTraceNodes" role="group" aria-label="Example steps">
      {frames.map((frame, index) => <button key={index} className={index === step ? 'isCurrent' : index < step ? 'isVisited' : ''} aria-pressed={index === step} onClick={() => select(index)}>
        <span className="aiTraceNumber">{String(index + 1).padStart(2, '0')}</span><strong>{frame.title}</strong><span className="aiTraceSignal" aria-hidden="true" />
      </button>)}
    </div>
    {mechanism.title === 'Separate probabilities from a decoding policy' && <div className="aiProbability" aria-label="Example candidate probabilities before renormalization">
      {[60, 25, 10, 5].map((value, index) => <div key={value} className={(step === 1 && index > 1) || (step === 2 && index > 2) ? 'isExcluded' : ''}><span>{'ABCD'[index]}</span><div><i style={{ width: `${value}%` }} /></div><span>{value}%</span></div>)}
      <small>Original probabilities; dimmed candidates are excluded by the selected filter. Top-k and top-p are separate examples.</small>
    </div>}
    <AiExampleVisual title={mechanism.title} step={step} />
    <div className="aiTraceCurrent" aria-live={playing ? 'off' : 'polite'}><small>STEP / CASE {step + 1} OF {frames.length}</small><h3>{frames[step].title}</h3><p>{frames[step].text}</p></div>
    <div className="aiTraceControls" role="group" aria-label="Animation controls">
      <button onClick={() => setPlaying(value => !value)} aria-pressed={playing}>{playing ? 'Pause' : 'Play'}</button>
      <button disabled={step === 0} onClick={() => select(step - 1)}>Previous</button>
      <button disabled={step === frames.length - 1} onClick={() => select(step + 1)}>Next</button>
      <button onClick={() => select(0)}>Restart</button>
      <label>Speed <select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value={8000}>Slow</option><option value={5000}>Normal</option><option value={2500}>Fast</option></select></label>
      <span>Playback loops · starts paused</span>
    </div>
    <details><summary>Read the complete trace</summary><ol>{frames.map((frame, index) => <li key={index}>{frame.text}</li>)}</ol></details>
  </section>;
}

export default function AiConceptLearning({ module, track, article, mode }) {
  const { mechanism } = getTutorialLesson(module, track, article);
  return mode === 'quiz'
    ? <ConceptQuiz title={article.title} questions={getAiConceptQuestions(mechanism, article)} />
    : <TraceAnimation article={article} mechanism={mechanism} />;
}
