export default function RoadmapTrace({ states, step }) {
  return <figure className="roadmapTrace">
    <figcaption>Scenario flow · highlighted stage {step + 1} of {states.length}</figcaption>
    <svg viewBox={`0 0 ${states.length * 160} 76`} role="img" aria-label={`Scenario stage ${step + 1}: ${states[step][1]}. ${states[step][2]}`}>
      {states.map((state, i) => <g key={state[0]}>
        {i < states.length - 1 && <path d={`M${i * 160 + 143} 30h24l-6-5m6 5-6 5`} fill="none" stroke="currentColor" opacity=".5" />}
        <rect x={i * 160 + 8} y="8" width="132" height="44" rx="9" fill={i === step ? "var(--lab-accent)" : "transparent"} stroke="currentColor" opacity={i === step ? 1 : .55} />
        <text x={i * 160 + 74} y="35" textAnchor="middle" fontSize="12" fill={i === step ? "#07131c" : "currentColor"}>{i + 1}. {state[1].length > 17 ? `${state[1].slice(0, 16)}…` : state[1]}</text>
      </g>)}
      <circle className="roadmapTraceMarker" cx={step * 160 + 74} cy="66" r="4" fill="var(--lab-accent)" />
    </svg>
  </figure>;
}
