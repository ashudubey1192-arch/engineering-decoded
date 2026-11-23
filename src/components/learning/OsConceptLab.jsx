import { useState } from "react";
import { pageReplacement, roundRobin, translateAddress } from "../../data/osExperiments.js";
import "./OsConceptLab.css";

const references = [1, 2, 3, 1, 4, 1, 2, 5, 1, 2, 3, 4, 5];
const hex = value => `0x${value.toString(16).toUpperCase()}`;

function Scheduling() {
  const [quantum, setQuantum] = useState(2);
  const [step, setStep] = useState(0);
  const result = roundRobin([5, 3, 1], quantum);
  const current = result.timeline[Math.min(step, result.timeline.length - 1)];
  return <>
    <h3>Experiment: change the CPU quantum</h3>
    <p>Three CPU-only jobs arrive at time zero: A needs 5 units, B needs 3, and C needs 1. The queue starts A, B, C. This model excludes I/O, priorities, and switching cost.</p>
    <label>Quantum: {quantum} time units<input type="range" min="1" max="5" value={quantum} onChange={e => { setQuantum(Number(e.target.value)); setStep(0); }} /></label>
    <div className="osSchedule" aria-label="CPU execution timeline">{result.timeline.map((slice, index) => <button key={slice.start} style={{ flex: slice.end - slice.start }} className={index === step ? "selected" : ""} onClick={() => setStep(index)} aria-pressed={index === step}> {"ABC"[slice.id]}<small>{slice.start}–{slice.end}</small></button>)}</div>
    <div className="osExperimentControls"><button disabled={step === 0} onClick={() => setStep(step - 1)}>Previous slice</button><button disabled={step === result.timeline.length - 1} onClick={() => setStep(step + 1)}>Next slice</button></div>
    <p role="status">Job {"ABC"[current.id]} runs from {current.start} to {current.end}. Each segment width represents its CPU time.</p>
    <table><caption>Derived results (arrival time = 0)</caption><thead><tr><th>Job</th><th>First response</th><th>Completion</th><th>Waiting</th></tr></thead><tbody>{[0, 1, 2].map(id => <tr key={id}><th>{"ABC"[id]}</th><td>{result.first[id]}</td><td>{result.completion[id]}</td><td>{result.waiting[id]}</td></tr>)}</tbody></table>
    <p>Waiting = completion − CPU burst here because there is no blocked time. Compare quantum 1 with quantum 5: which job responds sooner, and which finishes sooner?</p>
  </>;
}

function Replacement() {
  const [policy, setPolicy] = useState("FIFO");
  const [capacity, setCapacity] = useState(3);
  const [step, setStep] = useState(0);
  const trace = pageReplacement(references, capacity, policy);
  const current = trace[step];
  return <>
    <h3>Experiment: choose which page to evict</h3>
    <p>All frames start empty. Every reference is a read; pages are equally costly and no prefetching occurs. FIFO uses load order; LRU uses the most recent reference.</p>
    <label>Policy<select value={policy} onChange={e => { setPolicy(e.target.value); setStep(0); }}><option>FIFO</option><option>LRU</option></select></label>
    <label>Frames: {capacity}<input type="range" min="2" max="4" value={capacity} onChange={e => { setCapacity(Number(e.target.value)); setStep(0); }} /></label>
    <div className="osReferences" aria-label="Reference sequence">{references.map((value, index) => <button key={index} aria-label={`Reference ${index + 1}: page ${value}`} aria-pressed={index === step} className={index === step ? "selected" : ""} onClick={() => setStep(index)}>{value}</button>)}</div>
    <div className="osFrames">{Array.from({ length: capacity }, (_, index) => <div key={index}><small>Frame slot {index + 1}</small><strong>{current.frames[index] ?? "Empty"}</strong></div>)}</div>
    <p role="status">Reference {step + 1}: page {current.page} is a {current.hit ? "hit" : "fault"}.{current.evicted != null ? ` Page ${current.evicted} was evicted.` : ""} Faults so far: {current.faults}.</p>
    <div className="osExperimentControls"><button onClick={() => setStep(0)}>Reset</button><button disabled={step === 0} onClick={() => setStep(step - 1)}>Previous</button><button disabled={step === trace.length - 1} onClick={() => setStep(step + 1)}>Next reference</button></div>
    <p>At reference 5 with three frames, compare the victim under FIFO and LRU. Frame slots illustrate residency; they do not represent the real OS's physical allocation algorithm.</p>
  </>;
}

function Translation() {
  const [address, setAddress] = useState(12579);
  const [present, setPresent] = useState(true);
  const table = [5, 2, 7, present ? 9 : null];
  const result = translateAddress(address, 4096, table);
  return <>
    <h3>Experiment: translate a virtual address</h3>
    <p>This model uses four virtual pages of 4,096 bytes. The page table maps pages 0, 1, 2, 3 to frames 5, 2, 7, 9. All present pages are readable; permissions, TLBs, and multilevel walks are omitted.</p>
    <label>Virtual address: {address} ({hex(address)})<input type="range" min="0" max="16383" value={address} onChange={e => setAddress(Number(e.target.value))} /></label>
    <label className="osCheckbox"><input type="checkbox" checked={present} onChange={e => setPresent(e.target.checked)} /> Virtual page 3 has a present translation</label>
    <div className="osFrames"><div><small>Virtual page</small><strong>{result.page}</strong></div><div><small>Offset</small><strong>{result.offset}</strong></div><div><small>Physical frame</small><strong>{result.frame ?? "Absent"}</strong></div></div>
    <p role="status">{result.physical == null ? "Translation cannot complete: enter the page-fault handler. The mapping's validity determines whether recovery is possible." : `${hex(address)} → frame ${result.frame} × 4096 + ${result.offset} = ${result.physical} (${hex(result.physical)}).`}</p>
    <button onClick={() => { setAddress(12579); setPresent(true); }}>Restore worked example</button>
    <p>The offset is preserved. Removing a translation is not proof of an invalid pointer: the kernel must distinguish a legitimate nonresident page from an illegal access.</p>
  </>;
}

function Deadlock() {
  const [ordered, setOrdered] = useState(false);
  const [step, setStep] = useState(0);
  const stages = ordered ? [
    ["A holds X", "B waits for X", "Both tasks acquire X before Y. B owns no lock while waiting."],
    ["A holds X and Y", "B waits for X", "A can finish because B does not hold the lock A needs."],
    ["A releases X and Y", "B acquires X, then Y", "The consistent order removes the circular wait in this example."],
  ] : [
    ["A holds X", "B holds Y", "Each task has acquired a different first lock."],
    ["A waits for Y", "B holds Y", "A retains X while requesting B's lock."],
    ["A waits for Y held by B", "B waits for X held by A", "A → B → A is a wait-for cycle. Neither reaches its unlock."],
  ];
  return <>
    <h3>Experiment: build or break a wait cycle</h3>
    <p>Two tasks need two exclusive locks. There are no timeouts, forced releases, or additional resources. Change the acquisition order and step through the dependency.</p>
    <label className="osCheckbox"><input type="checkbox" checked={ordered} onChange={e => { setOrdered(e.target.checked); setStep(0); }} /> Both tasks acquire X before Y</label>
    <div className="osFrames"><div><small>Task A</small><strong>{stages[step][0]}</strong></div><div><small>Task B</small><strong>{stages[step][1]}</strong></div></div>
    <p role="status">{stages[step][2]}</p>
    <div className="osExperimentControls"><button onClick={() => setStep(0)}>Reset</button><button disabled={step === 0} onClick={() => setStep(step - 1)}>Previous</button><button disabled={step === 2} onClick={() => setStep(step + 1)}>Next</button></div>
    <p>A lock order must be followed by every relevant path, including callbacks and cleanup. This model demonstrates one cycle; it is not a general deadlock detector.</p>
  </>;
}

const experiments = {
  "round-robin": Scheduling, "scheduling-metrics": Scheduling, "why-scheduling-exists": Scheduling,
  "page-replacement-algorithms": Replacement, "working-sets-and-thrashing": Replacement,
  "logical-and-physical-memory": Translation, "paging": Translation,
  "the-mmu-and-address-translation": Translation, "page-faults": Translation,
  deadlock: Deadlock, "mutexes-semaphores-and-condition-variables": Deadlock,
};

export default function OsConceptLab({ topic }) {
  const Experiment = experiments[topic];
  return Experiment ? <section className="osConceptLab" aria-label="Interactive operating systems experiment"><Experiment /></section> : null;
}
