export default function RoadmapTrace({ states, step }) {
  const vertical = states.length > 4;
  return <figure className="roadmapTrace">
    <figcaption>Scenario flow · highlighted stage {step + 1} of {states.length}</figcaption>
    <svg viewBox={vertical ? `0 0 400 ${states.length * 72}` : `0 0 ${states.length * 160} 76`} role="img" aria-label={`Scenario stage ${step + 1}: ${states[step][1]}. ${states[step][2]}`}>
      {states.map((state, i) => <g key={state[0]}>
        {i < states.length - 1 && <path d={vertical ? `M200 ${i * 72 + 54}v18m-5-5 5 5 5-5` : `M${i * 160 + 143} 30h24l-6-5m6 5-6 5`} fill="none" stroke="currentColor" opacity=".5" />}
        <rect x={vertical ? 10 : i * 160 + 8} y={vertical ? i * 72 + 8 : 8} width={vertical ? 380 : 132} height="44" rx="9" fill={i === step ? "var(--lab-accent)" : "transparent"} stroke="currentColor" opacity={i === step ? 1 : .55} />
        <text x={vertical ? 200 : i * 160 + 74} y={vertical ? i * 72 + 36 : 35} textAnchor="middle" fontSize={vertical ? 16 : 12} fill={i === step ? "#07131c" : "currentColor"}>{i + 1}. {vertical ? state[1] : state[1].length > 17 ? `${state[1].slice(0, 16)}…` : state[1]}</text>
      </g>)}
      {!vertical && <circle className="roadmapTraceMarker" cx={step * 160 + 74} cy="66" r="4" fill="var(--lab-accent)" />}
    </svg>
  </figure>;
}
