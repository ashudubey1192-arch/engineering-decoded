const number = (key, label, value, min, max) => ({ key, label, value, min, max, type: "number" });
const sequence = (key, label, value) => ({ key, label, value, type: "text" });
const frame = (label, values, note) => ({ label, values: values.map(([name, value]) => ({ name, value: String(value) })), note });
const list = value => String(value).split(/[ ,]+/).filter(Boolean).map(Number);
function finite(values) { if (values.some(v => !Number.isFinite(v))) throw new Error("Use finite numeric values separated by commas."); }
export const simulationModels = {
  queue: {
    title: "Bounded queue under load", description: "A discrete one-second model: arrivals are admitted up to capacity, then workers process queued jobs. Overflow is rejected. It deliberately differs from a continuous fluid approximation.",
    inputs: [number("arrival", "Arrivals each second", 10, 0, 30), number("service", "Jobs processed each second", 6, 0, 30), number("capacity", "Queue capacity", 20, 1, 60), number("seconds", "Seconds", 8, 1, 20)],
    run({arrival, service, capacity, seconds}) { let queued=0, rejected=0, completed=0; return Array.from({length:seconds}, (_, i) => { const admitted=Math.min(arrival, capacity-queued); rejected+=arrival-admitted; queued+=admitted; const done=Math.min(queued,service); queued-=done; completed+=done; return frame(`Second ${i+1}`, [["Queued",queued],["Completed",completed],["Rejected",rejected]], `${admitted} arrivals admitted; ${done} jobs completed. Conservation: admitted total = completed + queued.`); }); },
  },
  paging: {
    title: "LRU page replacement", description: "The rightmost page is most recently used. A hit refreshes recency; a full cache miss evicts the leftmost page. This models exact LRU, not a particular OS implementation.",
    inputs: [sequence("pages", "Page references", "1,2,3,1,4,2"), number("capacity", "Frames", 3, 1, 8)],
    run({pages,capacity}) { const refs=list(pages); finite(refs); if (!refs.length || refs.length>30) throw new Error("Enter 1–30 page references."); let cache=[], faults=0; return refs.map((page,i)=> { const hit=cache.includes(page); let evicted=null; if(hit) cache=cache.filter(p=>p!==page); else { faults++; if(cache.length===capacity) evicted=cache.shift(); } cache.push(page); return frame(`Reference ${i+1}: page ${page}`, [["LRU → MRU",cache.join(" → ")],["Faults",faults],["Hits",i+1-faults]], hit ? "Hit: move page to most recent." : `Miss: ${evicted===null ? "use free frame" : `evict page ${evicted}`}.`); }); },
  },
  scheduler: {
    title: "Round-robin scheduler", description: "All jobs arrive at time zero. No I/O and zero context-switch cost. Each number is a CPU burst in milliseconds; the queue rotates after one quantum.",
    inputs: [sequence("bursts", "CPU bursts (ms)", "5,3,1"), number("quantum", "Quantum (ms)", 2, 1, 10)],
    run({bursts,quantum}) { const durations=list(bursts); finite(durations); if(!durations.length || durations.length>8 || durations.some(n=>n<1||n>20||!Number.isInteger(n))) throw new Error("Enter 1–8 integer bursts, each 1–20 ms."); const jobs=durations.map((remaining,i)=>({id:i+1,remaining})); const frames=[]; let t=0; while(jobs.length) { const job=jobs.shift(); const run=Math.min(quantum,job.remaining); const start=t; t+=run; job.remaining-=run; if(job.remaining) jobs.push(job); frames.push(frame(`Job ${job.id}: ${start}–${t} ms`, [["Clock",`${t} ms`],["Remaining",job.remaining],["Ready queue",jobs.map(j=>`J${j.id}(${j.remaining})`).join(" → ")||"empty"]], job.remaining ? `Quantum expired; job ${job.id} returns to the queue.` : `Job ${job.id} completed; waiting time ${t-durations[job.id-1]} ms.`)); } return frames; },
  },
  network: {
    title: "Cold versus reused HTTPS connection", description: "Assumes TCP plus a full TLS 1.3 handshake, no loss, and one request/response RTT. Excludes response-body transfer. Reuse skips DNS and handshakes in this model.",
    inputs: [number("dns","DNS time (ms)",20,0,200),number("rtt","Round-trip time (ms)",40,1,300),number("server","Server work (ms)",30,0,500)],
    run({dns,rtt,server}) { return [frame("DNS",[["Elapsed",dns],["Phase", "Name resolution"],["Reused path", "Skipped"]],"Resolve the service name."),frame("TCP",[["Elapsed",dns+rtt],["Added",rtt],["Reused path","Skipped"]],"One assumed round trip establishes TCP."),frame("TLS",[["Elapsed",dns+2*rtt],["Added",rtt],["Reused path","Skipped"]],"Authenticate the server and establish protected transport."),frame("Response",[["Cold request (ms)",dns+3*rtt+server],["Reused request (ms)",rtt+server],["Setup saved (ms)",dns+2*rtt]],"The remaining RTT includes request travel and response return; server work is additional.")]; },
  },
  fraud: {
    title: "Threshold and review capacity", description: "Ten labeled synthetic examples with fixed scores. Scores are illustrative, not calibrated probabilities. Moving the threshold changes flags, precision, recall, and review load.",
    inputs:[number("threshold","Flag scores at or above (%)",60,0,100),number("capacity","Review slots",4,0,10)],
    run({threshold,capacity}) { const examples=[[95,1],[90,1],[80,0],[75,1],[65,0],[55,1],[45,0],[30,0],[20,0],[5,0]]; let tp=0,fp=0; return examples.map(([score,label],i)=>{ const flag=score>=threshold; if(flag&&label)tp++; if(flag&&!label)fp++; const seenPositive=examples.slice(0,i+1).filter(x=>x[1]).length; return frame(`Example ${i+1}: score ${score}`, [["Flagged",tp+fp],["Precision",tp+fp?`${(100*tp/(tp+fp)).toFixed(1)}%`:"undefined (no flags)"],["Recall so far",seenPositive?`${(100*tp/seenPositive).toFixed(1)}%`:"undefined (no positives)"]], `${flag?"Flagged":"Allowed"}; actual label ${label?"fraud":"legitimate"}. Review overflow so far: ${Math.max(0,tp+fp-capacity)}. ${i===9?`Final TP=${tp}, FP=${fp}, FN=${4-tp}, TN=${6-fp}.`:"Metrics use only examples processed so far."}`); }); },
  },
  tokenBucket: {
    title: "Token bucket rate limiter", description: "Start with a full bucket. Before each timestamp's batch, refill at a constant rate capped by capacity, then spend one token per accepted request. Equal timestamps form one batch.",
    inputs:[sequence("times","Request times (seconds)","0,0,0,1,1,2,3"),number("capacity","Bucket capacity",2,1,10),number("rate","Tokens per second",1,0,10)],
    run({times,capacity,rate}) { const arrivals=list(times); finite(arrivals); if(!arrivals.length||arrivals.length>30||arrivals.some(t=>t<0||t>60))throw new Error("Enter 1–30 timestamps from 0–60 seconds."); arrivals.sort((a,b)=>a-b); let tokens=capacity,last=0,accepted=0,rejected=0; return arrivals.map((t,i)=>{tokens=Math.min(capacity,tokens+(t-last)*rate);last=t;const ok=tokens>=1;if(ok){tokens--;accepted++;}else rejected++;return frame(`Request ${i+1} at ${t}s`,[["Tokens left",tokens.toFixed(2)],["Accepted",accepted],["Rejected",rejected]],ok?"A token was available; request accepted.":"No complete token available; request rejected.");}); },
  },
  twoSum: {
    title: "Two-sum map trace", description: "Look for the complement before inserting the current value. Indices are zero-based. The model returns the first pair found in scan order.",
    inputs:[sequence("values","Input values","3,2,4"),number("target","Target",6,-50,50)],
    run({values,target}) {const nums=list(values);finite(nums);if(!nums.length||nums.length>25)throw new Error("Enter 1–25 values.");const map=new Map(),frames=[];for(let i=0;i<nums.length;i++){const other=target-nums[i],found=map.has(other);frames.push(frame(`Index ${i}: ${nums[i]}`,[["Need",other],["Previously seen",[...map].map(([v,k])=>`${v}→${k}`).join(", ")||"empty"],["Result",found?`[${map.get(other)}, ${i}]`:"continue"]],found?"Complement comes from an earlier index; pair found.":"No complement yet; store current value for later indices."));if(found)return frames;map.set(nums[i],i);}frames.push(frame("Finished",[["Result","No pair"],["Scanned",nums.length],["Space entries",map.size]],"Every index was checked against earlier values."));return frames;},
  },
};

export function runSimulation(id, raw) {
  const model=simulationModels[id]; if(!model) throw new Error("Unknown simulation.");
  const values={};
  for(const input of model.inputs) { const value=raw[input.key] ?? input.value; if(input.type==="number") { const n=Number(value); if(!Number.isFinite(n)||!Number.isInteger(n)||n<input.min||n>input.max) throw new Error(`${input.label}: enter an integer from ${input.min} to ${input.max}.`); values[input.key]=n; } else values[input.key]=String(value); }
  return model.run(values);
}

export function simulationFor(courseKey, slug="") {
  if(/bounded-queue|semaphores|thread-pool|executor/.test(slug)) return "queue";
  if(/scheduling|scheduler/.test(slug)) return "scheduler";
  if(/paging|page-tables|copy-on-write|cpp-capstone/.test(slug)) return "paging";
  if(/two-sum/.test(slug)) return "twoSum";
  if(courseKey==="ai/ml-system-design") return "fraud";
  if(courseKey==="core-cs/computer-networks") return "network";
  if(courseKey==="core-cs/operating-systems") return "scheduler";
  if(courseKey==="interviews/concurrency-interview") return "queue";
  return "tokenBucket";
}
