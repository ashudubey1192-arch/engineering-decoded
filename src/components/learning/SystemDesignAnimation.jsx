import { useEffect, useRef, useState } from 'react';
import './SystemDesignAnimation.css';

function Node({ x, y, label, active = false, width = 58 }) {
  return <g><rect x={x} y={y} width={width} height="25" rx="5" className={active ? 'sdNode active' : 'sdNode'} /><text x={x + width / 2} y={y + 16} textAnchor="middle">{label}</text></g>;
}

export default function SystemDesignAnimation() {
  const [paused, setPaused] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [tick, setTick] = useState(0);
  const dialog = useRef(null);
  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setTick(value => (value + 1) % 6), 1200);
    return () => window.clearInterval(timer);
  }, [paused]);
  const server = tick % 3;
  const hit = tick % 2 === 1;
  const limited = tick >= 3;
  const panels = <div className="sdAnimationGrid">
    <div className="sdAnimationCard cyan"><h3>● Load balancer</h3><svg viewBox="0 0 240 145" role="img" aria-label="Round robin routes each request to the next server">
      {[0, 1, 2].map((item) => <path key={item} d={`M 78 72 L 161 ${25 + item * 47}`} className={server === item ? 'activePath' : ''} />)}
      <path d="M 8 72 H 30" className="activePath" /><Node x={25} y={59} label="LB" active width={53} />
      {[0, 1, 2].map(item => <Node key={item} x={161} y={12 + item * 47} label={`S${item + 1}`} active={server === item} />)}
    </svg><p>Round robin → server {server + 1}</p></div>
    <div className="sdAnimationCard green"><h3>● Cache</h3><svg viewBox="0 0 240 145" role="img" aria-label="A cache miss reads from the database; subsequent requests hit the cache">
      <path d="M 120 35 V 65 M 120 90 V 117" className={!hit ? 'activePath' : ''} /><Node x={91} y={10} label="GET A" active />
      <rect x="48" y="57" width="144" height="34" rx="8" className="sdNode" />{[0,1,2].map(item => <Node key={item} x={55 + item * 44} y={62} width={40} label={item === 0 && hit ? 'A' : '·'} active={hit && item === 0} />)}
      <Node x={91} y={115} label="DB" active={!hit} />
    </svg><p>{hit ? 'Cache hit → return A' : 'Cache miss → read the database'}</p></div>
    <div className="sdAnimationCard amber"><h3>● Message queue</h3><svg viewBox="0 0 240 145" role="img" aria-label="A producer adds messages and a consumer drains the queue">
      <path d="M 40 72 H 202" className="activePath" /><Node x={6} y={59} width={33} label="P" active /><Node x={201} y={59} width={33} label="C" active={tick >= 3} />
      <rect x="52" y="51" width="136" height="42" rx="7" className="sdNode" />{[0,1,2,3].map(item => <rect key={item} x={61 + item * 30} y="62" width="23" height="20" rx="4" className={item < (tick < 3 ? tick + 1 : 6 - tick) ? 'sdNode active' : 'sdNode'} />)}
    </svg><p>{tick < 3 ? 'Enqueue' : 'Consume'} · queue depth {tick < 3 ? tick + 1 : 6 - tick}</p></div>
    <div className="sdAnimationCard green"><h3>● Database replication</h3><svg viewBox="0 0 240 145" role="img" aria-label="Updates propagate from the primary to replicas with a delay">
      <path d="M 120 47 L 52 104 M 120 47 L 184 104" className={hit ? 'activePath' : ''} /><Node x={77} y={20} width={86} label={`primary v${Math.floor(tick / 2) + 2}`} active />
      <Node x={10} y={103} width={86} label={`replica v${Math.floor(tick / 2) + (hit ? 2 : 1)}`} active={hit} /><Node x={144} y={103} width={86} label={`replica v${Math.floor(tick / 2) + (hit ? 2 : 1)}`} active={hit} />
    </svg><p>{hit ? 'Replicas caught up' : 'Replication lag → stale reads possible'}</p></div>
    <div className="sdAnimationCard amber"><h3>● Rate limiting</h3><svg viewBox="0 0 240 145" role="img" aria-label="Three requests are allowed per window; excess requests receive HTTP 429">
      <path d="M 120 32 V 115" className={!limited ? 'activePath' : ''} /><Node x={91} y={5} label="client" /><Node x={82} y={58} width={76} label="limiter" active /><Node x={91} y={115} label="server" active={!limited} />
      <text x="180" y="75">{limited ? '429' : '200'}</text>{[0,1,2].map(item => <rect key={item} x={17 + item * 18} y="65" width="12" height="12" rx="3" className={item <= tick ? 'sdNode active' : 'sdNode'} />)}
    </svg><p>{limited ? 'Limit exceeded → 429' : `Request ${tick + 1} of 3 → allowed`}</p></div>
    <div className="sdAnimationCard cyan"><h3>● WebSockets</h3><svg viewBox="0 0 240 145" role="img" aria-label="After an HTTP upgrade, messages flow in both directions over one connection">
      <Node x={10} y={5} label="client" active /><Node x={172} y={5} label="server" active /><path d="M 39 32 V 139 M 201 32 V 139" />
      {[0,1,2,3].map(item => <path key={item} d={item % 2 === 0 ? `M 42 ${51 + item * 25} H 196 l -5 -4 m 5 4 l -5 4` : `M 198 ${51 + item * 25} H 44 l 5 -4 m -5 4 l 5 4`} className={tick % 4 === item ? 'activePath' : ''} />)}
      <text x="120" y="45" textAnchor="middle">{tick < 2 ? 'HTTP upgrade / 101' : 'messages ↔'}</text>
    </svg><p>One connection · both directions</p></div>
  </div>;
  const controls = <button onClick={() => setPaused(value => !value)}>{paused ? '▶ Play animation' : 'Ⅱ Pause animation'}</button>;
  return <section className="sdAnimation" aria-label="Animated system design fundamentals">
    <div className="sdAnimationHeading"><div><small>SEE THE SYSTEM IN MOTION</small><h2>System design fundamentals</h2></div>{controls}</div>
    {panels}
    <div className="sdAnimationFooter"><span>Six building blocks. One connected system.</span><button onClick={() => dialog.current?.showModal()}>⛶ Expand</button></div>
    <dialog ref={dialog} className="sdAnimationDialog"><div className="sdAnimationHeading"><h2>System design fundamentals</h2><div>{controls}<button onClick={() => dialog.current?.close()}>Close ✕</button></div></div>{panels}</dialog>
  </section>;
}
