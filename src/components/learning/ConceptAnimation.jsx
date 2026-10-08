import { useEffect, useId, useRef, useState } from 'react';
import visuals from '../../data/systemDesignVisuals.json';
import './ConceptAnimation.css';

// All markup comes from the repository's rendered lesson diagrams. Prefix SVG
// references so the walkthrough and the original article can coexist safely.
function Diagram({ diagram }) {
  const prefix = useId().replaceAll(':', '');
  const svg = diagram.svg.replace(/\bid="([^"]+)"/g, (_, id) => `id="${prefix}-${id}"`)
    .replace(/url\(#([^)]*)\)/g, (_, id) => `url(#${prefix}-${id})`)
    .replace(/(href|xlink:href)="#([^"]+)"/g, (_, attribute, id) => `${attribute}="#${prefix}-${id}"`)
    .replace(/aria-labelledby="([^"]+)"/g, (_, ids) => `aria-labelledby="${ids.split(' ').map(id => `${prefix}-${id}`).join(' ')}"`);
  return <figure className="conceptMotionFigure"><div className="conceptMotionSvg" dangerouslySetInnerHTML={{ __html: svg }} /><figcaption>{diagram.caption}</figcaption></figure>;
}

export default function ConceptAnimation({ lessonKey }) {
  const visual = visuals[lessonKey];
  const [paused, setPaused] = useState(() => typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [step, setStep] = useState(0);
  const [diagramIndex, setDiagramIndex] = useState(0);
  const [visible, setVisible] = useState(true);
  const container = useRef(null);
  const dialog = useRef(null);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const change = event => { if (event.matches) setPaused(true); };
    preference.addEventListener('change', change);
    const observer = new window.IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (container.current) observer.observe(container.current);
    return () => { preference.removeEventListener('change', change); observer.disconnect(); };
  }, []);
  useEffect(() => {
    if (paused || !visible || !visual) return;
    // Leave enough time to read the current explanation before advancing.
    const duration = Math.max(7000, visual.frames[step].text.split(' ').length * 260);
    const timer = window.setInterval(() => {
      if (!document.hidden) setStep(value => (value + 1) % visual.frames.length);
    }, duration);
    return () => window.clearInterval(timer);
  }, [paused, visible, step, visual]);
  if (!visual) return null;
  const selectStep = index => { setStep(index); setPaused(true); };
  const controls = <div className="conceptMotionControls">
    <button onClick={() => setPaused(value => !value)} aria-pressed={!paused}>{paused ? '▶ Play' : 'Ⅱ Pause'}</button>
    <button onClick={() => selectStep((step + visual.frames.length - 1) % visual.frames.length)} aria-label="Previous animation step">‹</button>
    <button onClick={() => selectStep((step + 1) % visual.frames.length)} aria-label="Next animation step">›</button>
    <button onClick={() => { setStep(0); setDiagramIndex(0); setPaused(true); }}>↺ Restart</button>
  </div>;
  const content = <>
    {visual.diagrams.length > 1 && <div className="conceptDiagramTabs" role="group" aria-label="Choose a diagram">{visual.diagrams.map((_, index) => <button key={index} aria-pressed={index === diagramIndex} onClick={() => setDiagramIndex(index)}>Diagram {index + 1}</button>)}</div>}
    {visual.diagrams[diagramIndex] && <Diagram diagram={visual.diagrams[diagramIndex]} />}
    <div className="conceptFrameTabs" role="group" aria-label="Walkthrough steps">{visual.frames.map((frame, index) => <button key={index} aria-pressed={step === index} onClick={() => selectStep(index)}><span>{String(index + 1).padStart(2, '0')}</span>{frame.title}</button>)}</div>
    <div className="conceptFrame" aria-live={paused ? 'polite' : 'off'}><small>STEP {step + 1} / {visual.frames.length}</small><h3>{visual.frames[step].title}</h3><p>{visual.frames[step].text}</p></div>
  </>;
  return <section id="concept-animation" ref={container} className={`conceptMotion ${paused || !visible ? 'isPaused' : ''}`} aria-label={`${visual.title} animated visualization`}>
    <header><div><small>VISUAL WALKTHROUGH</small><h2>{visual.title} in motion</h2></div>{controls}</header>
    {content}
    <footer><span>Follow the connections, then step through the explanation.</span><button onClick={() => dialog.current?.showModal()}>⛶ Expand</button></footer>
    <dialog ref={dialog} className="conceptMotionDialog" aria-label={`${visual.title} expanded visualization`}><header><h2>{visual.title}</h2><div>{controls}<button onClick={() => dialog.current?.close()}>Close ✕</button></div></header>{content}</dialog>
  </section>;
}
