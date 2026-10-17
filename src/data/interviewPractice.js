const test = (label,input,expected)=>({label,input,expected});
const P = (id,title,prompt,hint,solution,tests,question,choices,correct,explanation)=>({id:`workshop-${id}`,topic:"interview-workshop",difficulty:"Intermediate",title,prompt,hint,solution,tests,quiz:{question,choices,correct,explanation},starter:"function solve(input) {\n  // Return the specified result.\n  \n}"});
export const interviewPractice = {
  reservation: P("reservation","Reserve finite stock without overselling",
    "Given {stock, requests}, process positive integer quantities in order. Accept a request only if enough stock remains. Return {remaining, accepted}, where accepted is a boolean per request. Invalid quantities are rejected. This sequential model checks the reservation invariant; it does not test real thread synchronization.",
    "Check validity and availability before changing stock. Rejected requests must leave it unchanged.",
    "function solve({stock, requests}) {\n  const accepted = requests.map(q => {\n    if (!Number.isInteger(q) || q <= 0 || q > stock) return false;\n    stock -= q; return true;\n  });\n  return {remaining: stock, accepted};\n}",
    [test("Last item",{stock:1,requests:[1,1]},{remaining:0,accepted:[true,false]}),test("Rejection preserves stock",{stock:3,requests:[4,2,1]},{remaining:0,accepted:[false,true,true]}),test("Invalid quantities",{stock:2,requests:[0,-1,1.5,1]},{remaining:1,accepted:[false,false,false,true]}),test("No requests",{stock:0,requests:[]},{remaining:0,accepted:[]})],
    "What extra requirement does a concurrent implementation need?",["Sleep before every write","An atomic check-and-update boundary","A larger integer type"],1,"Sequential correctness is insufficient when workers overlap. The availability check and decrement must share an atomic coordination boundary."),
  lru: P("lru","Count exact LRU page faults",
    "Given {pages, capacity}, return the number of misses starting with an empty cache. A hit refreshes recency. Evict the least recently used page on a full miss. Capacity zero means every reference misses. Inputs are finite integer page IDs and nonnegative integer capacity.",
    "Maintain the cache from least to most recent. Remove a hit before appending it again.",
    "function solve({pages, capacity}) {\n  const cache=[]; let faults=0;\n  for (const page of pages) {\n    const i=cache.indexOf(page);\n    if(i>=0) cache.splice(i,1); else faults++;\n    if(capacity===0) continue;\n    if(cache.length===capacity) cache.shift();\n    cache.push(page);\n  }\n  return faults;\n}",
    [test("Worked trace",{pages:[1,2,3,1,4,2],capacity:3},5),test("Hits refresh",{pages:[1,2,1,3,1],capacity:2},3),test("Zero capacity",{pages:[1,1],capacity:0},2),test("Empty",{pages:[],capacity:3},0),test("One frame",{pages:[1,1,2,1],capacity:1},3)],
    "Why refresh recency on a hit?",["It resets the fault count","It sorts the page IDs","A recently read page should not remain the oldest"],2,"LRU is based on access time, including reads that hit. Insertion order alone implements a different replacement policy."),
  scheduling: P("scheduling","Round-robin completion times",
    "Given {bursts, quantum}, all jobs arrive at time zero. Return completion times in original job order. Bursts and quantum are positive integers; ignore switching overhead. Empty input returns an empty array.",
    "Rotate unfinished jobs, accumulate elapsed time, and record completion when remaining work reaches zero.",
    "function solve({bursts,quantum}) {\n  const queue=bursts.map((left,id)=>({left,id}));\n  const done=Array(bursts.length); let time=0;\n  while(queue.length){\n    const job=queue.shift(), used=Math.min(job.left,quantum);\n    time+=used; job.left-=used;\n    if(job.left) queue.push(job); else done[job.id]=time;\n  }\n  return done;\n}",
    [test("Quantum two",{bursts:[5,3,1],quantum:2},[9,8,5]),test("Large quantum",{bursts:[5,3,1],quantum:10},[5,8,9]),test("One job",{bursts:[5],quantum:2},[5]),test("Empty",{bursts:[],quantum:1},[])],
    "What is waiting time in this simplified model?",["Completion minus CPU burst","Completion plus quantum","CPU burst divided by quantum"],0,"With arrival time zero and no I/O, turnaround equals completion time, and waiting equals turnaround minus actual CPU service."),
  metrics: P("metrics","Compute a confusion matrix",
    "Given {scores, labels, threshold}, flag scores greater than or equal to threshold. Return {tp, fp, fn, tn}. Arrays have equal length, labels are 0 or 1, and scores are finite numbers. Empty arrays return zero counts.",
    "Classify each row using two booleans: predicted positive and actually positive.",
    "function solve({scores,labels,threshold}) {\n  const result={tp:0,fp:0,fn:0,tn:0};\n  scores.forEach((score,i)=>{\n    const predicted=score>=threshold;\n    result[predicted?(labels[i]?'tp':'fp'):(labels[i]?'fn':'tn')]++;\n  });\n  return result;\n}",
    [test("Mixed",{scores:[.9,.8,.4,.1],labels:[1,0,1,0],threshold:.5},{tp:1,fp:1,fn:1,tn:1}),test("Boundary included",{scores:[.5],labels:[1],threshold:.5},{tp:1,fp:0,fn:0,tn:0}),test("No predictions",{scores:[.1,.2],labels:[0,1],threshold:.9},{tp:0,fp:0,fn:1,tn:1}),test("Empty",{scores:[],labels:[],threshold:.5},{tp:0,fp:0,fn:0,tn:0})],
    "What is precision when no examples are flagged?",["Always 100%","Always equal to recall","Undefined unless a reporting convention is specified"],2,"Precision divides true positives by all predicted positives. A zero denominator requires an explicit reporting convention."),
  framing: P("framing","Reassemble length-prefixed messages",
    "Given an array of string chunks containing single-digit-length frames such as '3:cat', return all payloads. A header is one digit followed by ':'. Zero-length payloads are valid. Throw an Error for malformed or incomplete final input. This small ASCII teaching protocol is not a production binary parser.",
    "Join the chunks for this exercise, then consume a header and exactly the declared number of characters repeatedly.",
    "function solve(chunks) {\n  const text=chunks.join(''), result=[]; let i=0;\n  while(i<text.length){\n    if(!/^[0-9]:/.test(text.slice(i))) throw new Error('Invalid header');\n    const size=Number(text[i]); i+=2;\n    if(i+size>text.length) throw new Error('Incomplete payload');\n    result.push(text.slice(i,i+size)); i+=size;\n  }\n  return result;\n}",
    [test("Split reads",["3:c","at3:","dog"],["cat","dog"]),test("One read",["3:cat3:dog"],["cat","dog"]),test("Empty frame",["0:1:x"],["","x"]),test("No data",[],[]),{label:"Truncated payload",input:["3:ca"],expectedError:"Incomplete payload"},{label:"Malformed header",input:["x:cat"],expectedError:"Invalid header"}],
    "Which property must hold across different chunk boundaries?",["The same byte stream produces the same messages","Each chunk must produce exactly one message","Every read must begin with a header"],0,"TCP read boundaries do not define message boundaries. The parser's output follows the protocol framing, not chunk arrival shape."),
  dedup: P("dedup","Apply each event once in a replayed ledger",
    "Given events [{id, amount}], sum the amount for the first occurrence of each ID and return {total, processed}. processed is the list of first-seen IDs in order. Repeated IDs are ignored even if their amount differs; production systems should separately detect such conflicting payloads.",
    "A set records processed identities. Add the identity and amount together in the model; a real store needs an atomic transaction for that pair.",
    "function solve(events) {\n  const seen=new Set(); let total=0;\n  for(const event of events){\n    if(seen.has(event.id)) continue;\n    seen.add(event.id); total+=event.amount;\n  }\n  return {total,processed:[...seen]};\n}",
    [test("Replay",[{id:"A",amount:4},{id:"A",amount:4},{id:"B",amount:3}],{total:7,processed:["A","B"]}),test("Conflicting replay policy",[{id:"A",amount:4},{id:"A",amount:9}],{total:4,processed:["A"]}),test("Negative adjustment",[{id:"A",amount:5},{id:"B",amount:-2}],{total:3,processed:["A","B"]}),test("Empty",[],{total:0,processed:[]})],
    "Why must deduplication and the effect commit atomically?",["To make IDs shorter","To prevent a crash between recording the ID and applying the effect","To guarantee every event arrives in order"],1,"A crash between separate commits can either lose an effect or cause it to be repeated. The atomic boundary protects the invariant."),
  topK: P("top-k","Return the K largest values",
    "Given {values,k}, return the largest k observations sorted descending. Duplicates count separately. k is a nonnegative integer; k larger than the input returns all values. Do not mutate the input. Sorting is accepted here; compare with a bounded heap for streaming.",
    "Copy before sorting, supply a numeric comparator, and take at most k items.",
    "function solve({values,k}) {\n  return [...values].sort((a,b)=>b-a).slice(0,k);\n}",
    [test("Durations",{values:[20,80,40,100,30],k:3},[100,80,40]),test("Duplicates",{values:[4,4,2],k:2},[4,4]),test("Zero",{values:[1,2],k:0},[]),test("Oversized k",{values:[-3,-1],k:5},[-1,-3]),test("Empty",{values:[],k:2},[])],
    "Which approach uses O(k) retained data for a stream?",["Sort all observed values repeatedly","Keep only the most recent k values","Maintain a min-heap of the largest k values"],2,"The heap root is the smallest retained value, so a larger incoming value can replace it while retaining only k observations."),
  windows: P("window","Compute a trailing sum without future leakage",
    "Given {values,width}, return for each index the sum of up to width values ending at that index. width is a positive integer. Empty input returns []. Target O(n) time with a running sum; never include a future value.",
    "Add the current value and subtract the value that just left the window.",
    "function solve({values,width}) {\n  let sum=0; const result=[];\n  for(let i=0;i<values.length;i++){\n    sum+=values[i]; if(i>=width)sum-=values[i-width];\n    result.push(sum);\n  }\n  return result;\n}",
    [test("Width three",{values:[1,2,3,4],width:3},[1,3,6,9]),test("Width one",{values:[3,-2,5],width:1},[3,-2,5]),test("Large width",{values:[1,2],width:8},[1,3]),test("Empty",{values:[],width:3},[])],
    "Why is a centered window unsafe for an online feature?",["It can use observations that were not available at prediction time","It always has a larger sum","It cannot be computed with arrays"],0,"An online prediction cannot depend on future observations. Feature reconstruction must follow the actual availability boundary."),
};

export function practiceFor(courseKey,slug="") {
  if(/paging|cpp-capstone/.test(slug))return "lru";
  if(/scheduling/.test(slug))return "scheduling";
  if(/tcp-stream|framing/.test(slug))return "framing";
  if(/outbox|offsets|idempotency/.test(slug))return "dedup";
  if(/top-k/.test(slug))return "topK";
  if(/leakage|features/.test(slug))return "windows";
  return ({"core-cs/operating-systems":"scheduling","core-cs/computer-networks":"framing","ai/ml-system-design":"metrics","backend/cpp":"lru","backend/csharp":"reservation","interviews/concurrency-interview":"reservation"})[courseKey]||"dedup";
}
