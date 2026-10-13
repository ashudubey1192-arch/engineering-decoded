export default function AiExampleVisual({ title, step }) {
  if (title === 'Compare representations in the same space') return <figure className="aiMiniVisual">
    <svg viewBox="0 0 460 180" role="img" aria-label="Document A and the query point right at (1,0); document B points up at (0,1).">
      <path d="M80 150H390M80 150V20" stroke="#426653" fill="none" />
      <path d="M80 150L330 150" stroke="#4ade80" strokeWidth={step === 2 ? 7 : 3} />
      <path d="M80 150L80 40" stroke="#38bdf8" strokeWidth={step === 3 ? 7 : 3} />
      <circle cx="330" cy="150" r="7" fill="#4ade80" /><circle cx="80" cy="40" r="7" fill="#38bdf8" />
      <text x="100" y="40">B [0, 1] · cosine = 0</text><text x="185" y="130">A & query [1, 0] · cosine = 1</text>
      <text x="55" y="170">0</text>
    </svg><figcaption>Same direction: similarity 1. Perpendicular: similarity 0. This two-dimensional example illustrates the geometry.</figcaption>
  </figure>;
  if (title === 'Learn from data without evaluating on the answer key') return <figure className="aiMiniVisual">
    <div className="aiDataSplits">{['Train', 'Validation', 'Test'].map((label, index) => <div key={label} className={(step < 2 && index === 0) || (step === 2 && index < 2) || (step === 3 && index === 2) || step === 4 ? 'active' : ''}><strong>{label}</strong><span>{['Fit parameters & preprocessing', 'Select settings', 'Final independent evaluation'][index]}</span><div aria-hidden="true">{Array.from({ length: 8 }, (_, i) => <i key={i} />)}</div></div>)}</div>
    <figcaption>Separate roles, not prescribed split sizes. Keep test outcomes out of training and model selection.</figcaption>
  </figure>;
  if (title === 'Choose a metric that matches the error cost') return <figure className="aiMiniVisual">
    <div className="aiMetricTiles"><div><strong>95 / 100</strong><span>Correct negatives</span></div><div className={step > 0 ? 'error' : ''}><strong>5 / 100</strong><span>Missed positives</span></div></div>
    <div className="aiClassBalance" aria-label="95 negative cases, 5 positive cases"><span /><i /></div>
    <figcaption>Always predicting negative: 95% accuracy, but 0 of 5 positives detected (0% recall).</figcaption>
  </figure>;
  if (title === 'Define the unit of observation') return <figure className="aiMiniVisual">
    <div className="aiDataSplits"><div className={step === 1 ? 'active' : ''}><strong>Before prediction</strong><span>Recorded usage ✓</span></div><div><strong>Prediction boundary</strong><span>Predict cancellation</span></div><div className={step === 2 ? 'error' : ''}><strong>After the outcome</strong><span>Cancellation reason ✕</span></div></div>
    <figcaption>Only information already available at the prediction boundary is a valid input.</figcaption>
  </figure>;
  return null;
}
