import { useEffect, useState } from "react";
import "./PatternLessonArticle.css";

const format = (value) => value === null ? "null" : typeof value === "object" ? JSON.stringify(value) : String(value);
function StateValue({ value }) {
  if (Array.isArray(value)) return <div className="patternCells">{value.map((item,index)=><div className="patternCell" key={index}><small>{index}</small>{Array.isArray(item)?<StateValue value={item}/>:<b>{format(item)}</b>}</div>)}</div>;
  if (value && typeof value === "object") return <div className="patternCells">{Object.entries(value).map(([key,item])=><div className="patternCell" key={key}><small>key {key}</small><b>{format(item)}</b></div>)}</div>;
  return <code className="patternScalar">{format(value)}</code>;
}

function Player({ run }) {
  const [step,setStep]=useState(0);
  const [playing,setPlaying]=useState(false);
  const [delay,setDelay]=useState(1000);
  const last=run.frames.length-1;
  useEffect(()=>{
    if(!playing || step>=last)return;
    const timer=window.setTimeout(()=>setStep(value=>Math.min(last,value+1)),delay);
    return ()=>window.clearTimeout(timer);
  },[playing,step,last,delay]);
  const frame=run.frames[step];
  const seek=(value)=>{setPlaying(false);setStep(value);};
  return <div className="patternPlayer">
    <div className="patternControls">
      <button onClick={()=>seek(0)} disabled={step===0&&!playing}>Reset</button>
      <button onClick={()=>seek(Math.max(0,step-1))} disabled={step===0}>Previous</button>
      <button onClick={()=>{if(step===last)setStep(0);setPlaying(!playing||step===last);}}>{playing&&step<last?"Pause":"Play"}</button>
      <button onClick={()=>seek(Math.min(last,step+1))} disabled={step===last}>Next</button>
      <button onClick={()=>seek(last)} disabled={step===last}>Last</button>
      <label>Speed <select value={delay} onChange={e=>setDelay(Number(e.target.value))}><option value={1800}>Slow</option><option value={1000}>Normal</option><option value={400}>Fast</option></select></label>
    </div>
    <label className="patternScrubber">Step {step+1} of {run.frames.length}<input aria-label="Animation step" type="range" min="0" max={last} value={step} onChange={e=>seek(Number(e.target.value))}/></label>
    <p className="patternStep" aria-live={playing?"off":"polite"}>{frame.note}</p>
    <div className="patternState" key={step}>{Object.entries(frame.state).map(([name,value])=><div className="patternStateRow" key={name}><h4>{name}</h4><StateValue value={value}/></div>)}</div>
    <details><summary>Read the full walkthrough as text</summary><ol>{run.frames.map((item,i)=><li key={i}><b>{item.note}</b><pre>{JSON.stringify(item.state,null,2)}</pre></li>)}</ol></details>
  </div>;
}

export default function PatternLessonArticle({lesson}) {
  const [mode,setMode]=useState("optimal");
  const [sample,setSample]=useState(0);
  const [copied,setCopied]=useState("");
  const test=lesson.tests[sample];
  const run=lesson.runs[mode][sample];
  const source=lesson.source[mode];
  async function copy(){try{await window.navigator.clipboard.writeText(source);setCopied("Copied complete Java program.");}catch{setCopied("Copy unavailable here. Select the complete program below or download it.");}}
  return <div className="patternArticle">
    <section id="overview"><p className="patternEyebrow">JAVA PROBLEM LAB</p><p className="lead">{lesson.contract}</p><div className="patternContract"><strong>Example input</strong><pre>{test.args}</pre><strong>Expected output</strong><pre>{test.expected}</pre></div></section>
    <section id="concepts"><h2>From brute force to an optimized approach</h2><ol className="patternReasoning">{lesson.reasoning.map((text,i)=><li key={i}>{text}</li>)}</ol><div className="patternComparison"><div><small>BRUTE FORCE / BASELINE</small><p>{lesson.complexity[0]}</p></div><div><small>OPTIMIZED APPROACH</small><p>{lesson.complexity[1]}</p></div></div><p>Complexities describe the algorithm without teaching trace output. “Optimized” means the explained improvement or trade-off under this problem's constraints.</p></section>
    <section id="example"><h2>Step through the solution</h2><div className="patternSelectors"><div role="group" aria-label="Solution approach"><button aria-pressed={mode==="brute"} onClick={()=>{setMode("brute");setCopied("");}}>Brute force / baseline</button><button aria-pressed={mode==="optimal"} onClick={()=>{setMode("optimal");setCopied("");}}>Optimal / optimized</button></div><label>Example <select value={sample} onChange={e=>setSample(Number(e.target.value))}>{lesson.tests.map((item,i)=><option key={i} value={i}>{item.label}</option>)}</select></label></div>
      <p>Play a recorded execution of the Java program, or move one step at a time. Arrays show indices; maps show keys and counts. Change approach to compare the work performed on the same input.</p>
      <Player key={`${lesson.id}/${mode}/${sample}`} run={run}/>
      <h3>{mode==="brute"?"Brute-force / baseline":"Optimized"} Java solution</h3><pre><code>{`static ${lesson.signature} {\n${lesson[mode]}\n}`}</code></pre>
      <p>Open the complete program for imports, helper methods, trace support, and the runnable example. Save it as <code>Solution.java</code>, then run <code>javac Solution.java</code> and <code>java Solution</code>. The program includes the first example; replace the arguments in <code>main</code> to try another case.</p>
      <div className="patternControls"><button onClick={copy}>Copy complete Java</button><a download="Solution.java" href={`data:text/plain;charset=utf-8,${encodeURIComponent(source)}`}>Download Solution.java</a><span role="status">{copied}</span></div>
      <details><summary>Complete runnable Java program and helper methods</summary><pre><code>{source}</code></pre></details>
      <h3>Verified examples</h3><div className="patternTable"><table><thead><tr><th>Case</th><th>Input</th><th>Both approaches return</th></tr></thead><tbody>{lesson.tests.map((item,i)=><tr key={i}><td>{item.label}</td><td><code>{item.args}</code></td><td><code>{item.expected}</code></td></tr>)}</tbody></table></div>
    </section>
    <section id="mistakes"><h2>Check the assumptions before reusing this pattern</h2><p>{lesson.reasoning[2]}</p><p>Test a smallest valid input, a boundary case, and a case that challenges the invariant. If you change the domain, mutation rules, or arithmetic range, revisit the proof and complexity rather than reusing the code unchanged.</p></section>
    <section id="check"><h2>Explain it without the code</h2><p>What repeated work does the baseline perform? What does the optimized state represent after each step, and why is the next update safe?</p><details><summary>Reveal the reasoning</summary><p>{lesson.reasoning[0]}</p><p>{lesson.reasoning[1]}</p><p>Now predict the next animation frame before clicking Next and compare both approaches on the boundary example.</p></details></section>
    <footer className="patternReferences">Original lesson code and examples. Study reference: <a href="https://algomaster.io/learn/dsa/frequency-counting-introduction" target="_blank" rel="noreferrer">AlgoMaster — Frequency Counting</a>. Java API references: <a href="https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/package-summary.html" target="_blank" rel="noreferrer">Collections</a> and <a href="https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html" target="_blank" rel="noreferrer">Concurrency</a>.</footer>
  </div>;
}
