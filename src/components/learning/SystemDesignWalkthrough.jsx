import { useEffect, useId, useRef, useState } from 'react';
import { getSystemDesignWalkthrough } from '../../data/systemDesignWalkthroughs';
import './SystemDesignWalkthrough.css';

const positions = [[24, 24], [376, 24], [376, 218], [24, 218]];

// The trace depicts the selected interaction, not every connection in the architecture.
export function WalkthroughDiagram({ study, stepIndex, moving = false }) {
  const markerId = `sd-arrow-${useId().replaceAll(':', '')}`;
  const frame = study.steps[stepIndex];
  const [from, to] = frame.path;
  const [fx, fy] = positions[from];
  const [tx, ty] = positions[to];
  const dx = tx - fx;
  const dy = ty - fy;
  const fraction = Math.min(dx ? 120 / Math.abs(dx) : Infinity, dy ? 42 / Math.abs(dy) : Infinity);
  const x1 = fx + 120 + dx * fraction;
  const y1 = fy + 42 + dy * fraction;
  const x2 = tx + 120 - dx * fraction;
  const y2 = ty + 42 - dy * fraction;
  return <svg className={`sdTraceDiagram ${moving ? 'isMoving' : ''}`} viewBox="0 0 640 326" role="img" aria-label={`${frame.title}. Active interaction: ${study.actors[from]} to ${study.actors[to]}. ${frame.states.join('; ')}.`}>
    <defs><marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
    <path className="sdTraceConnection" d={`M ${x1} ${y1} L ${x2} ${y2}`} markerEnd={`url(#${markerId})`} />
    {study.actors.map((actor, index) => <g key={actor} className={frame.path.includes(index) ? 'sdTraceActor active' : 'sdTraceActor'} data-actor={actor}>
      <rect x={positions[index][0]} y={positions[index][1]} width="240" height="84" rx="12" />
      <text x={positions[index][0] + 120} y={positions[index][1] + 29} textAnchor="middle" className="sdTraceActorName">{actor}</text>
      <text x={positions[index][0] + 120} y={positions[index][1] + 58} textAnchor="middle" className="sdTraceActorState">{frame.states[index]}</text>
    </g>)}
    <text x="320" y="164" textAnchor="middle" className="sdTraceStepLabel">STEP {stepIndex + 1} OF {study.steps.length}</text>
  </svg>;
}

export default function SystemDesignWalkthrough({ sectionSlug, sectionTitle }) {
  const study = getSystemDesignWalkthrough(sectionSlug);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [visible, setVisible] = useState(true);
  const [tabVisible, setTabVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const container = useRef(null);
  const answer = useRef(null);
  const headingId = useId();
  const speedId = useId();

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => { setReducedMotion(preference.matches); if (preference.matches) setPlaying(false); };
    const visibility = () => setTabVisible(!document.hidden);
    update();
    visibility();
    preference.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    const observer = typeof IntersectionObserver !== 'undefined'
      ? new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting)) : null;
    if (container.current) observer?.observe(container.current);
    return () => {
      preference.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!study || !playing || !visible || !tabVisible) return;
    const frame = study.steps[stepIndex];
    const duration = Math.max(7000, `${frame.explanation} ${frame.why}`.split(/\s+/).length * 250) / speed;
    const timer = window.setTimeout(() => {
      if (stepIndex === study.steps.length - 1) setPlaying(false);
      else setStepIndex(index => index + 1);
    }, duration);
    return () => window.clearTimeout(timer);
  }, [study, playing, stepIndex, speed, visible, tabVisible]);

  if (!study) return null;
  const frame = study.steps[stepIndex];
  const previous = study.steps[stepIndex - 1];
  const selectStep = index => { setPlaying(false); setStepIndex(index); };
  const restart = () => { selectStep(0); if (answer.current) answer.current.open = false; };

  return <section id="system-design-walkthrough" ref={container} className="sdWalkthrough" aria-labelledby={headingId}>
    <header className="sdWalkthroughHeading">
      <span className="sdWalkthroughEyebrow">LEARN BY FOLLOWING THE SYSTEM</span>
      <h2 id={headingId}>{study.title}</h2>
      <p className="sdWalkthroughContext">{sectionTitle} · shared section case study</p>
      <p>{study.concept}</p>
    </header>
    <div className="sdWalkthroughScenario"><h3>The example and its assumptions</h3><p>{study.scenario}</p></div>
    <p className="sdWalkthroughHint">Predict the next change, then advance one step. The highlighted connection shows the current interaction; the boxes show the system state.</p>
    <div className="sdWalkthroughControls" role="group" aria-label="Case study playback">
      <button type="button" className="sdWalkthroughPlay" aria-pressed={playing} onClick={() => {
        if (!playing && stepIndex === study.steps.length - 1) setStepIndex(0);
        setPlaying(value => !value);
      }}>{playing ? 'Pause' : stepIndex === study.steps.length - 1 ? 'Replay' : 'Play walkthrough'}</button>
      <button type="button" onClick={() => selectStep(stepIndex - 1)} disabled={stepIndex === 0}>Previous</button>
      <button type="button" onClick={() => selectStep(stepIndex + 1)} disabled={stepIndex === study.steps.length - 1}>Next step</button>
      <button type="button" onClick={restart}>Restart</button>
      <label htmlFor={speedId}>Pace <select id={speedId} value={speed} onChange={event => setSpeed(Number(event.target.value))}>
        <option value={0.5}>0.5×</option><option value={1}>1×</option><option value={2}>2×</option>
      </select></label>
    </div>
    {reducedMotion && <p className="sdWalkthroughHint">Reduced motion is on. Steps still update, without moving connections.</p>}
    <div className="sdWalkthroughVisual"><WalkthroughDiagram study={study} stepIndex={stepIndex} moving={playing && visible && tabVisible && !reducedMotion} /></div>
    <p className="sdWalkthroughMobileHint">Swipe across the diagram to inspect every component, or open the state table below.</p>
    <div className="sdWalkthroughSteps" role="group" aria-label="Choose a case study step">
      {study.steps.map((item, index) => <button type="button" key={item.title} aria-pressed={index === stepIndex} onClick={() => selectStep(index)}>
        <span>{index + 1}</span>{item.title}
      </button>)}
    </div>
    <div className="sdWalkthroughExplanation" aria-live={playing ? 'off' : 'polite'} aria-atomic="true">
      <span className="sdWalkthroughEyebrow">STEP {stepIndex + 1} / {study.steps.length}</span>
      <h3>{frame.title}</h3><p>{frame.explanation}</p>
      <h4>Why this matters</h4><p>{frame.why}</p>
      <p className="sdWalkthroughResult"><strong>Result:</strong> {frame.result}</p>
    </div>
    <details className="sdWalkthroughDetails"><summary>Inspect the state changes</summary>
      <div className="sdWalkthroughTable"><table><caption>State at step {stepIndex + 1}; values are illustrative.</caption><thead><tr><th scope="col">Component</th><th scope="col">Previous step</th><th scope="col">Current step</th></tr></thead>
        <tbody>{study.actors.map((actor, index) => <tr key={actor}><th scope="row">{actor}</th><td>{previous?.states[index] || 'Starting state'}</td><td>{frame.states[index]}</td></tr>)}</tbody>
      </table></div>
    </details>
    <div className="sdWalkthroughTradeoff"><h3>The trade-off to remember</h3><p>{study.tradeoff}</p></div>
    <div className="sdWalkthroughChallenge"><span className="sdWalkthroughEyebrow">TRY IT YOURSELF</span><h3>{study.question}</h3>
      <p>Pause here and explain your reasoning before revealing the answer.</p>
      <details ref={answer} className="sdWalkthroughDetails"><summary>Reveal the explanation</summary><p>{study.answer}</p></details>
    </div>
    <details className="sdWalkthroughDetails sdWalkthroughTranscript"><summary>Read all steps together</summary>
      <ol>{study.steps.map(item => <li key={item.title}><h3>{item.title}</h3><p>{item.explanation}</p><p><strong>Why:</strong> {item.why}</p><p><strong>Result:</strong> {item.result}</p></li>)}</ol>
    </details>
  </section>;
}
