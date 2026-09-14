import "../css/Article.css";

export default function ContractsAndDocsMockServersArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A mock server generated straight from an OpenAPI spec lets a consumer start integrating
          before the real implementation is finished, and lets your own tests exercise realistic
          responses without touching a live backend, database, or third-party carrier.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Generated, not hand-built</b> &mdash; a mock server built directly from the OpenAPI spec stays exactly as accurate as the spec itself, with no separate implementation to maintain.</li>
          <li><b>Powered by the spec's own examples</b> &mdash; the realistic examples from the earlier lesson are exactly what a good mock returns, so investing in good examples pays off twice.</li>
          <li><b>Two audiences</b> &mdash; external consumers integrating early, and your own team's tests that need a fast, deterministic stand-in for something slow or flaky.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          When Parcelly designed return-shipment support API-first, reviewing the contract before
          any backend code existed, a mock server generated straight from that reviewed spec let
          two partners start integrating three weeks before the real implementation shipped. Both
          partners built and tested their integration against realistic, spec-accurate responses,
          and needed only to point at the real URL once Parcelly's backend went live &mdash;
          nothing about their integration code had to change.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a partner integrating against a mock server generated from the OpenAPI spec while the real backend is still being built, then switching to the real backend once it ships, with no change to their integration code.">
          <rect className="box" x="20" y="45" width="90" height="30" rx="5" />
          <text x="65" y="64" className="boxText" style={{fontSize:"6.5px"}}>Partner</text>
          <rect className="boxAccent" x="160" y="15" width="110" height="30" rx="5" />
          <text x="215" y="34" className="boxText" style={{fontSize:"6px"}}>Mock server</text>
          <rect className="box" x="160" y="75" width="110" height="30" rx="5" />
          <text x="215" y="94" className="boxText" style={{fontSize:"6px"}}>Real backend</text>
          <line className="flow" x1="110" y1="55" x2="158" y2="35" />
          <text x="130" y="30" className="figHint" style={{fontSize:"5px"}}>today</text>
          <line className="flowMuted" x1="110" y1="65" x2="158" y2="85" />
          <text x="130" y="95" className="figHint" style={{fontSize:"5px"}}>after launch</text>
          <text x="345" y="60" className="figHint" style={{fontSize:"6px"}}>same spec, same shape &mdash; nothing else changes</text>
        </svg>
        <figcaption>The partner's integration code never has to change &mdash; only which server it points at.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Hand-maintaining a mock separately from the real spec is the most damaging mistake
          &mdash; a hand-built mock that drifts out of sync teaches integrators wrong expectations,
          which is worse than having no mock at all. Relying on the mock indefinitely, with no
          integration testing against the real implementation before launch, is the other common
          one: a mock reflects what the spec says should happen, not what the actual backend
          happens to do with real data and real edge cases.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a mock server generated directly from the OpenAPI spec stay trustworthy in a way a hand-built mock, maintained separately, usually doesn't?</p>
        </div>
      </section>
      <p className="takeaway">
        A generated mock turns "wait for the backend" into "start building today," at essentially
        no extra maintenance cost &mdash; the spec that produces it is work you needed to do
        anyway.
      </p>
    </div>
  );
}
