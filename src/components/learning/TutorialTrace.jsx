import { useEffect, useState } from "react";
import "./InterviewLab.css";

export default function TutorialTrace({ mechanism }) {
  const lines=mechanism.example.split("\n").filter(line=>line.trim());
  const [step,setStep]=useState(0),[playing,setPlaying]=useState(false);
  useEffect(()=>{if(!playing)return;const timer=setTimeout(()=>{if(step>=lines.length-1)setPlaying(false);else setStep(s=>s+1);},1800);return()=>clearTimeout(timer);},[playing,step,lines.length]);
  if(lines.length<2)return null;
  return <div className="interviewLab tutorialTrace">
    <h3>Read the example step by step</h3><p>This guided reading highlights the authored example in order. It is not an execution trace or a simulation.</p>
    <pre aria-label="Guided example">{lines.map((line,i)=><span className={i===step?"traceActive":""} key={i} aria-current={i===step?"step":undefined}><b>{i+1}</b> {line}{"\n"}</span>)}</pre>
    <div className="labControls"><button onClick={()=>{setStep(0);setPlaying(false);}}>Restart reading</button><button disabled={step===0} onClick={()=>{setStep(step-1);setPlaying(false);}}>Previous line</button><button aria-pressed={playing} onClick={()=>{if(step===lines.length-1)setStep(0);setPlaying(!playing);}}>{playing?"Pause reading":"Play reading"}</button><button disabled={step===lines.length-1} onClick={()=>{setStep(step+1);setPlaying(false);}}>Next line</button></div>
    <p aria-live={playing?"off":"polite"}>Line {step+1} of {lines.length}: {lines[step]}</p>
  </div>;
}
