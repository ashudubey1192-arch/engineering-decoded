import "../css/CoreConcepts.css";
export default function SystemDesignCoreConcepts() {
  return (
    <div className="systemCore">
      <section id="overview">
        <p className="lead">
          Scale changes which constraints dominate, but the core vocabulary stays stable.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Essential dimensions</h2>
        <div className="dimensionGrid">
          <div>
            <b>LATENCY</b>
            <p>Time required to complete one operation.</p>
          </div>
          <div>
            <b>THROUGHPUT</b>
            <p>Operations completed per unit of time.</p>
          </div>
          <div>
            <b>AVAILABILITY</b>
            <p>Probability the system can serve a request.</p>
          </div>
          <div>
            <b>CONSISTENCY</b>
            <p>How quickly readers observe accepted writes.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Estimation before architecture</h2>
        <pre>
          <code>{`100M requests / day ≈ 1,160 requests / second\nPeak traffic (3x) ≈ 3,500 requests / second`}</code>
        </pre>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Quoting CAP theorem without a partition scenario, treating eventual consistency as stale
          forever, and confusing horizontal scale with automatic reliability.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Which metric changes first when a synchronous dependency becomes slow?</p>
        </div>
      </section>
    </div>
  );
}
