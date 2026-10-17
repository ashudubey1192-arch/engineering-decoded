export default function SimulationDiagram({modelId,frame,frames,step}) {
  const state=Object.fromEntries(frame.values.map(v=>[v.name,v.value]));
  if(modelId==="paging")return <figure className="modelDiagram"><figcaption>Frames from least to most recently used</figcaption><div className="memoryFrames">{state["LRU → MRU"].split(" → ").map((page,i)=><div key={`${i}-${page}`}><small>Frame position {i+1}</small><strong>{page}</strong></div>)}</div></figure>;
  if(modelId==="scheduler") {
    const schedule=frames.slice(0,step+1).map(f=>{const match=f.label.match(/Job (\d+): (\d+)–(\d+)/);return {id:Number(match[1]),start:Number(match[2]),end:Number(match[3])};});
    const total=Number(frames.at(-1).values.find(v=>v.name==="Clock").value.split(" ")[0]);
    const colors=["#22c55e","#38bdf8","#fbbf24","#c084fc","#fb7185","#2dd4bf","#a3e635","#f97316"];
    return <figure className="modelDiagram"><figcaption>CPU execution timeline — each block is one turn</figcaption><svg viewBox="0 0 600 90" role="img" aria-label={schedule.map(s=>`Job ${s.id}, ${s.start} to ${s.end} milliseconds`).join("; ")}>{schedule.map((s,i)=><g key={i}><rect x={10+s.start/total*580} y="12" width={(s.end-s.start)/total*580} height="36" fill={colors[(s.id-1)%colors.length]} stroke="black"/><title>{`Job ${s.id}: ${s.start}–${s.end} ms`}</title>{(s.end-s.start)/total>.045&&<text x={10+(s.start+s.end)/2/total*580} y="35" textAnchor="middle" fill="#07131c" fontSize="13">J{s.id}</text>}</g>)}<text x="10" y="73" fill="currentColor" fontSize="13">0 ms</text><text x="590" y="73" textAnchor="end" fill="currentColor" fontSize="13">{total} ms</text></svg></figure>;
  }
  if(modelId==="twoSum")return <figure className="modelDiagram"><figcaption>Complement lookup</figcaption><div className="memoryFrames">{frame.values.map(({name,value})=><div key={name}><small>{name}</small><strong>{value}</strong></div>)}</div></figure>;
  const bars=frame.values.filter(v=>/^\d+(\.\d+)?%?$/.test(v.value)).map(v=>({...v,n:Number(v.value.replace("%",""))}));
  if(!bars.length)return null;
  // Compare only quantities with the same unit. Fraud percentages have their own scale.
  const max=Math.max(1,...bars.filter(b=>!b.value.endsWith("%")).map(b=>b.n));
  return <figure className="modelDiagram"><figcaption>Calculated state — bars update with your inputs</figcaption><svg viewBox={`0 0 600 ${bars.length*58+10}`} role="img" aria-label={bars.map(b=>`${b.name}: ${b.value}`).join("; ")}>{bars.map((b,i)=><g key={b.name}><text x="0" y={i*58+16} fontSize="13" fill="currentColor">{b.name}: {b.value}</text><rect x="0" y={i*58+24} width="590" height="17" rx="4" fill="currentColor" opacity=".12"/><rect x="0" y={i*58+24} width={Math.max(0,b.n/(b.value.endsWith("%")?100:max)*590)} height="17" rx="4" fill="var(--lab-accent)"/></g>)}</svg></figure>;
}
