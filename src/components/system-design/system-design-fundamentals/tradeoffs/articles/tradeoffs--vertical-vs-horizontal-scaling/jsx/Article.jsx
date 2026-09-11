import "../css/Article.css";

export default function TradeoffsVerticalVsHorizontalScalingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Vertical scaling makes one machine bigger (more CPU, RAM, disk); horizontal scaling adds
          more machines. Both grow capacity, but they fail differently and hit different limits.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Vertical (scale up)</h3>
            <p>Simple — no code changes, no distributed coordination. But there's a hard ceiling
              (the biggest machine money can buy), it's a single point of failure, and upgrades
              usually mean downtime.</p>
          </div>
          <div>
            <h3>Horizontal (scale out)</h3>
            <p>Near-unlimited growth by adding commodity machines, and natural fault tolerance
              (one machine dying doesn't take everything down). But it requires the application to
              handle distributed state, load balancing, and coordination.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start small, scale vertically.</b> A new product's database runs on a modest
            server; traffic grows, so the team upgrades to a bigger instance — quick, no code
            changes.</li>
          <li><b>Hit the ceiling.</b> Eventually no bigger single machine is available, or the cost
            curve gets steep.</li>
          <li><b>Switch strategy.</b> The team adds read replicas and, later, shards the database
            across multiple machines — horizontal scaling.</li>
          <li><b>Pay the complexity cost.</b> Now the application must route queries to the right
            shard and handle a replica occasionally lagging behind.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram contrasting vertical scaling as one machine growing larger versus horizontal scaling as more machines added side by side.">
          <text x="100" y="18" className="figLabel" textAnchor="middle">VERTICAL</text>
          <rect className="box" x="70" y="70" width="30" height="30" rx="4" />
          <rect className="boxAccent" x="55" y="40" width="60" height="60" rx="5" />
          <text x="180" y="60" className="figHint">bigger machine</text>
          <line className="divider" x1="220" y1="10" x2="220" y2="130" />
          <text x="330" y="18" className="figLabel" textAnchor="middle">HORIZONTAL</text>
          {[0, 1, 2, 3].map((i) => (<rect key={i} className="boxAccent" x={260 + i * 40} y="75" width="30" height="30" rx="4" />))}
          <text x="330" y="120" className="figHint" textAnchor="middle">more machines, same size</text>
        </svg>
        <figcaption>Vertical grows one machine; horizontal grows the count of machines.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Jumping straight to a complex horizontal architecture before it's needed adds
          distributed-systems complexity for no real benefit at small scale. The opposite mistake —
          scaling vertically far past the point of diminishing returns, ignoring the single point
          of failure — leaves a system one hardware failure away from an outage.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does horizontal scaling generally offer better fault tolerance than vertical scaling, even before considering capacity limits?</p>
        </div>
      </section>
      <p className="takeaway">
        Scale vertically for simplicity while it still fits; switch to horizontal when you need
        capacity or fault tolerance that one machine can't give you — and expect real complexity
        in return.
      </p>
    </div>
  );
}
