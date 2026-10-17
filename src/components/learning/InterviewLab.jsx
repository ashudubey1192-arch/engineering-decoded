import { useEffect, useState } from "react";
import "./InterviewLab.css";
import RoadmapTrace from "./RoadmapTrace.jsx";

function QueueExperiment() {
  const [arrival, setArrival] = useState(100);
  const [service, setService] = useState(60);
  const [seconds, setSeconds] = useState(2);
  const backlog = Math.max(0, (arrival - service) * seconds);
  const queued = Math.min(80, backlog);
  return <div className="queueExperiment">
    <h3>Experiment: change the traffic</h3>
    <p>Constant-rate model, empty initial queue, capacity 80. Excess work is rejected once the buffer fills; arrivals below service capacity complete without backlog in this fluid approximation.</p>
    {[["Arrivals per second", arrival, setArrival, 160], ["Completions per second", service, setService, 160], ["Elapsed seconds", seconds, setSeconds, 10]].map(([label, value, setter, max]) =>
      <label key={label}>{label}: <strong>{value}</strong><input type="range" min="0" max={max} value={value} onChange={(e) => setter(Number(e.target.value))} /></label>)}
    <meter min="0" max="80" value={queued} aria-label="Queued jobs" />
    <output aria-live="polite">{queued} queued · {Math.max(0, backlog - 80)} rejected · {arrival > service ? `${(80 / (arrival - service)).toFixed(1)} seconds to fill from empty` : "No accumulating backlog"}</output>
  </div>;
}

export default function InterviewLab({ article }) {
  const { lab } = article;
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [delay, setDelay] = useState(1600);
  const [response, setResponse] = useState("");
  const [review, setReview] = useState(false);
  const last = lab.states.length - 1;
  useEffect(() => {
    if (!playing) return undefined;
    const timer = setTimeout(() => {
      if (step >= last) setPlaying(false);
      else setStep(step + 1);
    }, delay);
    return () => clearTimeout(timer);
  }, [playing, step, last, delay]);
  const move = (value) => { setPlaying(false); setStep(value); };
  return <div className="interviewLab tutorialLesson">
    <section id="overview">
      <div className="labEyebrow">INTERVIEW WORKSHOP <span>Explain · Trace · Apply</span></div>
      <p className="lead">{lab.scenario}</p>
      <div className="tutorialGoal"><strong>Your objective</strong><p>Explain the mechanism, predict each state transition, and defend the design when the interviewer changes a constraint. These are original practice scenarios, not claims about questions asked by a particular company.</p></div>
    </section>
    <section id="concepts"><h2>Understand the mechanism</h2><p>{lab.concept}</p>
      {lab.links && <nav aria-label="Related course resources"><ul>{lab.links.map(link => <li key={link.href}><a href={link.href}>{link.title}</a></li>)}</ul></nav>}
    </section>
    <section id="example">
      <h2>Visual walkthrough</h2>
      <p>Predict the next state before stepping forward. The walkthrough models the stated scenario; it does not execute the sample code.</p>
      <div className="labPlayer" aria-label="Interactive scenario walkthrough">
        <div className="labPlayerHeading"><span>STATE {step + 1} / {lab.states.length}</span><strong>{lab.states[step][0]}</strong></div>
        {lab.visual && <RoadmapTrace states={lab.states} step={step} />}
        <div className="labStateGrid" aria-live={playing ? "off" : "polite"} aria-atomic="true">
          {lab.states[step].slice(1).map((value, index) => <div className={`labState ${step && value !== lab.states[step - 1][index + 1] ? "changed" : ""}`} key={`${step}-${index}`}>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{value}</strong>
          </div>)}
        </div>
        <ol className="labTimeline" aria-label="Walkthrough steps">{lab.states.map((state, index) => <li key={state[0]}><button aria-label={`Step ${index + 1}: ${state[0]}`} aria-current={index === step ? "step" : undefined} className={index <= step ? "visited" : ""} onClick={() => move(index)}>{index + 1}</button><span>{state[0]}</span></li>)}</ol>
        <div className="labControls">
          <button onClick={() => move(0)}>Reset</button>
          <button disabled={step === 0} onClick={() => move(step - 1)}>← Previous</button>
          <button className="labPlay" aria-pressed={playing} onClick={() => { if (!playing && step === last) setStep(0); setPlaying(!playing); }}>{playing ? "Pause" : step === last ? "Replay" : "Play"}</button>
          <button disabled={step === last} onClick={() => move(step + 1)}>Next →</button>
          <label>Speed <select value={delay} onChange={(e) => setDelay(Number(e.target.value))}><option value="2600">Slow</option><option value="1600">Normal</option><option value="800">Fast</option></select></label>
        </div>
      </div>
      {article.slug === "interview-lab--bounded-queue" && <QueueExperiment />}
      <details><summary>Read the complete walkthrough</summary><ol>{lab.states.map(([title, ...values]) => <li key={title}><strong>{title}:</strong> {values.join(" · ")}</li>)}</ol></details>
      <h3>{lab.codeLabel || "Worked example"}</h3><pre><code>{lab.code}</code></pre>
      <div className="tutorialExpected"><strong>Expected result</strong><p>{lab.states[last].slice(1).join(". ")}. Check this against the walkthrough and the assumptions above.</p></div>
    </section>
    <section id="mistakes"><h2>Trade-offs and failure cases</h2><p>{lab.mistake}</p></section>
    <section id="check">
      <h2>Practice the interview follow-up</h2><p><strong>{lab.question}</strong></p>
      <label className="labAnswer">Your explanation<textarea rows="4" value={response} onChange={(e) => setResponse(e.target.value)} placeholder="State your answer, explain why, then give an example or counterexample." /></label>
      <button onClick={() => setReview(!review)} aria-expanded={review}>{review ? "Hide explanation" : "Compare with an explained answer"}</button>
      {review && <div className="labReview"><h3>Model answer</h3><p>{lab.answer}</p><p>This is a self-review, not an automated score. Compare your reasoning, assumptions, and failure handling with the explanation.</p></div>}
      <details><summary>Interview evaluation checklist</summary><ul><li>Clarify inputs, constraints, and the required result.</li><li>Explain the invariant or responsibility that makes the approach work.</li><li>Trace a concrete example and an edge case.</li><li>Discuss costs, alternatives, and how to verify the outcome.</li></ul></details>
      <h3>Hands-on extension</h3><p>{lab.challenge}</p>
      {lab.questions && <div className="roadmapQuestions"><h3>Section interview question bank</h3><p>Answer each question aloud before expanding the model answer.</p>{lab.questions.map(item => <details key={item.href}><summary>{item.question}</summary><p>{item.answer}</p><a href={item.href}>Review: {item.topic}</a></details>)}</div>}
      {article.roadmap && <p className="roadmapAttribution">Topic inventory: <a href={article.roadmap.source} target="_blank" rel="noreferrer">AlgoMaster · {article.roadmap.section}</a>. Explanations, scenarios, and visual traces here are original teaching material.</p>}
      {lab.reference && <p>Course reference: <a href={lab.reference[1]} target="_blank" rel="noreferrer">{lab.reference[0]}</a>. Check platform-specific guarantees when implementing the examples.</p>}
    </section>
  </div>;
}
