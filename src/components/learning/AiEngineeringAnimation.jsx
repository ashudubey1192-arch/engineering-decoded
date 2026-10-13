import { useEffect, useRef, useState } from 'react';
import { clean } from '../../data/aiEngineering/helpers';

const wrap = title => {
  const words = title.split(' '), lines = [''];
  for (const word of words) {
    if ((lines[lines.length - 1] + word).length > 18) lines.push(word);
    else lines[lines.length - 1] += `${lines[lines.length - 1] ? ' ' : ''}${word}`;
  }
  return lines;
};

function FlowDiagram({ lesson, step, columns }) {
  return <svg className={`aeFlow ${columns === 2 ? 'aeFlowMobile' : 'aeFlowDesktop'}`} viewBox={`0 0 ${columns * 195} ${columns === 2 ? 330 : 165}`} role="img" aria-label={`Walkthrough: ${lesson.steps.map(item => item.title).join(' → ')}. Active stage: ${lesson.steps[step].title}.`}>
    {lesson.steps.map((item, index) => {
      const row = Math.floor(index / columns);
      const column = row % 2 ? columns - 1 - index % columns : index % columns;
      const x = column * 195, y = row * 165;
      const endOfRow = index % columns === columns - 1;
      const connector = endOfRow ? `M${x + 98} ${y + 145}v40` : row % 2 ? `M${x + 10} ${y + 82}h-25` : `M${x + 185} ${y + 82}h25`;
      const arrow = endOfRow ? `M${x + 93} ${y + 178}l5 7 5-7` : row % 2 ? `M${x - 8} ${y + 77}l-7 5 7 5` : `M${x + 203} ${y + 77}l7 5-7 5`;
      return <g key={item.title} className={index === step ? 'active' : index < step ? 'visited' : ''}>
        {index < lesson.steps.length - 1 && <><path className="aeConnector" d={connector} /><path className="aeArrow" d={arrow} /></>}
        <rect x={10 + x} y={20 + y} width="175" height="125" rx="12" />
        <text className="aeNodeNumber" x={27 + x} y={47 + y}>0{index + 1}</text>
        {wrap(item.title).map((line, lineIndex) => <text key={lineIndex} x={27 + x} y={78 + y + lineIndex * 20}>{line}</text>)}
        <circle className="aePulse" cx={164 + x} cy={44 + y} r="5" />
      </g>;
    })}
  </svg>;
}

export default function AiEngineeringAnimation({ lesson }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(6000);
  const [visible, setVisible] = useState(true);
  const container = useRef(null);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stop = event => { if (event.matches) setPlaying(false); };
    preference.addEventListener('change', stop);
    const observer = new window.IntersectionObserver(([entry]) => setVisible(entry.isIntersecting));
    if (container.current) observer.observe(container.current);
    return () => { preference.removeEventListener('change', stop); observer.disconnect(); };
  }, []);
  useEffect(() => {
    if (!playing || !visible) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setStep(previous => (previous + 1) % lesson.steps.length);
    }, speed);
    return () => window.clearInterval(timer);
  }, [playing, visible, speed, lesson.steps.length]);
  const select = value => { setStep(value); setPlaying(false); };
  const current = lesson.steps[step];
  return <section id="ai-animation" ref={container} className={`aeAnimation ${playing && visible ? 'playing' : ''}`} aria-label={`${lesson.title} animated walkthrough`}>
    <header><small>WORKED EXAMPLE · INTERACTIVE TRACE</small><h2>See the workflow in motion</h2><p>Explore the normal steps and recovery cases. The explanations describe when each action applies.</p></header>
    <FlowDiagram lesson={lesson} step={step} columns={4} />
    <FlowDiagram lesson={lesson} step={step} columns={2} />
    <div className="aeStepSelectors" role="group" aria-label="Walkthrough steps">{lesson.steps.map((item, index) => <button key={item.title} aria-pressed={index === step} onClick={() => select(index)}>{index + 1}. {item.title}</button>)}</div>
    <div className="aeFrame" aria-live={playing ? 'off' : 'polite'}><small>STEP {step + 1} / {lesson.steps.length}</small><h3>{current.title}</h3><p>{clean(current.detail)}</p><div className="aeState"><span>EXAMPLE STATE</span><code>{current.state}</code></div></div>
    <div className="aePlayback" role="group" aria-label="Animation controls">
      <button aria-pressed={playing} onClick={() => setPlaying(value => !value)}>{playing ? 'Pause' : 'Play'}</button>
      <button disabled={step === 0} onClick={() => select(step - 1)}>Previous</button>
      <button disabled={step === lesson.steps.length - 1} onClick={() => select(step + 1)}>Next</button>
      <button onClick={() => select(0)}>Restart</button>
      <label>Speed <select value={speed} onChange={event => setSpeed(Number(event.target.value))}><option value={9000}>Slow</option><option value={6000}>Normal</option><option value={3000}>Fast</option></select></label>
      <small>Loops while playing · starts paused</small>
    </div>
    <details><summary>Read all stages</summary><ol>{lesson.steps.map(item => <li key={item.title}><strong>{item.title}:</strong> {clean(item.detail)} <code>{item.state}</code></li>)}</ol></details>
  </section>;
}
