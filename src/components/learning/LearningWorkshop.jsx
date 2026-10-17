import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { simulationModels, runSimulation, simulationFor } from "../../data/learningSimulations.js";
import { interviewPractice, practiceFor } from "../../data/interviewPractice.js";
import "./InterviewLab.css";
import "../dsa/DsaLearningTools.css";
import SimulationDiagram from "./SimulationDiagram";
const Challenge = lazy(() => import("../dsa/DsaPracticeLab.jsx").then(m => ({default:m.Challenge})));

export function SimulationPlayer({ modelId }) {
  const model=simulationModels[modelId];
  const [inputs,setInputs]=useState(()=>Object.fromEntries(model.inputs.map(i=>[i.key,i.value])));
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false);
  const result=useMemo(()=>{try{return {frames:runSimulation(modelId,inputs),error:""};}catch(error){return {frames:[],error:error.message};}},[modelId,inputs]);
  const current=result.frames[Math.min(step,result.frames.length-1)];
  useEffect(()=>{if(!playing||result.error)return; const timer=setTimeout(()=>{if(step>=result.frames.length-1)setPlaying(false);else setStep(s=>s+1);},1000);return()=>clearTimeout(timer);},[playing,step,result.frames.length,result.error]);
  const move=n=>{setPlaying(false);setStep(n);};
  return <div className="simulationPlayer">
    <h3>{model.title}</h3><p>{model.description}</p>
    <div className="simulationInputs">{model.inputs.map(input=><label key={input.key}>{input.label}<input type={input.type} min={input.min} max={input.max} step={1} maxLength={160} value={inputs[input.key]} onChange={e=>{setInputs(old=>({...old,[input.key]:e.target.value}));move(0);}} /></label>)}</div>
    {result.error ? <p role="alert">{result.error}</p> : <>
      <div className="labPlayer"><div className="labPlayerHeading"><span>CALCULATED STEP {step+1} / {result.frames.length}</span><strong>{current.label}</strong></div>
        <SimulationDiagram modelId={modelId} frame={current} frames={result.frames} step={step}/>
        <div className="labStateGrid" aria-live={playing?"off":"polite"}>{current.values.map(({name,value})=><div className="labState changed" key={`${step}-${name}`}><span>{name}</span><strong>{value}</strong></div>)}</div>
        <p>{current.note}</p>
        <div className="labControls"><button onClick={()=>move(0)}>Reset simulation</button><button disabled={step===0} onClick={()=>move(step-1)}>Previous state</button><button aria-pressed={playing} onClick={()=>{if(step===result.frames.length-1)setStep(0);setPlaying(!playing);}}>{playing?"Pause simulation":"Play simulation"}</button><button disabled={step>=result.frames.length-1} onClick={()=>move(step+1)}>Next state</button></div>
      </div>
      <details><summary>Inspect the calculated trace</summary><div className="simulationTable"><table><thead><tr><th>Step</th><th>State</th><th>Explanation</th></tr></thead><tbody>{result.frames.map((f,i)=><tr key={i}><th>{f.label}</th><td>{f.values.map(v=>`${v.name}: ${v.value}`).join("; ")}</td><td>{f.note}</td></tr>)}</tbody></table></div></details>
    </>}
  </div>;
}

export default function LearningWorkshop({module,track,article}) {
  const key=`${module.id}/${track.slug}`;
  const [mode,setMode]=useState(simulationFor(key,article.slug));
  const [problem,setProblem]=useState(practiceFor(key,article.slug));
  const technical=["core-cs","architecture","dsa","coding-patterns","ai","frontend","backend","databases","messaging","cloud","devops","backend-tooling","frontend-tooling","mobile","desktop","developer-tools"].includes(module.id) || (module.id==="interviews" && /java|react|python|system-design|concurrency/.test(track.slug));
  if(!technical)return <section id="learning-workshop" className="interviewLab learningWorkshop"><h2>Apply this lesson to a real situation</h2><p>Use a concrete example from your own experience for {article.title}. This worksheet supports practice and self-review; it does not grade personal experiences or replace professional guidance.</p>{["What situation or goal are you working on?","What constraints and other people's needs matter?","Which options did you consider, and why choose this one?","What action will you take, and what evidence will show the result?","What would make you change your approach?"].map(prompt=><label className="labAnswer" key={prompt}>{prompt}<textarea rows={3} placeholder="Write your own example here. Notes are temporary for this page."/></label>)}<details><summary>Review your explanation</summary><p>Check that your example is specific, your contribution is clear, assumptions are labeled, and the outcome is supported by evidence. For an interview, practice explaining it aloud and answering a follow-up about trade-offs.</p></details></section>;
  return <section id="learning-workshop" className="interviewLab learningWorkshop">
    <div className="labEyebrow">PRACTICE STUDIO <span>Change inputs · Test code · Explain results</span></div>
    <h2>Experiment and build</h2>
    <p>This companion studio explores reusable engineering mechanisms. Choose a related model or exercise; these activities supplement the lesson and do not execute its language-specific code samples.</p>
    <label>Interactive model <select value={mode} onChange={e=>setMode(e.target.value)}>{Object.entries(simulationModels).map(([id,m])=><option key={id} value={id}>{m.title}</option>)}</select></label>
    <SimulationPlayer key={mode} modelId={mode}/>
    <h3>Executable practice and scored knowledge check</h3><p>The exercises use JavaScript so they run locally in the browser. Tests cover the stated examples and boundaries; passing them does not prove correctness for every input or validate real concurrency.</p>
    <label>Exercise <select value={problem} onChange={e=>setProblem(e.target.value)}>{Object.entries(interviewPractice).map(([id,p])=><option key={id} value={id}>{p.title}</option>)}</select></label>
    <Suspense fallback={<p>Loading code practice…</p>}><Challenge key={problem} problem={interviewPractice[problem]} draftKey={`workshop/${key}/${article.slug}/${problem}`}/></Suspense>
  </section>;
}
