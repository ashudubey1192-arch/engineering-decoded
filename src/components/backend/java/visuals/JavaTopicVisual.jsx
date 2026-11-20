import { useEffect, useState } from "react";
import "./JavaTopicVisual.css";
// A reading map, not a simulated execution: each card is an actual statement from this topic.
export default function JavaTopicVisual({ title, text }) {
  const notes = text.split(/\n\n|(?<=[.!?])\s+(?=[A-Z`])/).filter(Boolean);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setStep(s => (s + 1) % notes.length), 4000);
    return () => clearInterval(timer);
  }, [playing, notes.length]);
  return <figure className="javaTopicMap">
    <figcaption><strong>{title}</strong><span>Concept map · {step + 1}/{notes.length}</span></figcaption>
    <div className="javaTopicTrack" role="group" aria-label={`${title} concept map`}>
      {notes.map((note, i) => <button key={i} aria-pressed={step === i} onClick={() => { setStep(i); setPlaying(false); }}>
        <svg viewBox="0 0 100 58" aria-hidden="true"><path d="M0 29H100"/><rect x="22" y="8" width="56" height="42" rx="10"/><text x="50" y="35" textAnchor="middle">{i + 1}</text></svg>
        <span>{(note.match(/`([^`]+)`/)?.[1] || note.replace(/^[-\d. ]+/, '').split(/\s+/).slice(0, 5).join(' '))}</span>
      </button>)}
    </div>
    <p key={step} className="javaTopicNote" aria-live={playing ? 'off' : 'polite'}>{notes[step].replace(/`|\*\*/g, '')}</p>
    <div className="javaTopicControls"><button onClick={() => setPlaying(!playing)}>{playing ? 'Pause' : 'Play'} explanation</button><button onClick={() => { setPlaying(false); setStep((step + 1) % notes.length); }}>Next idea</button><button onClick={() => { setPlaying(false); setStep(0); }}>Reset</button></div>
  </figure>;
}
