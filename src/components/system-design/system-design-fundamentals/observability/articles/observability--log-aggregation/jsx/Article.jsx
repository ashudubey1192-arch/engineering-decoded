import "../css/Article.css";

export default function ObservabilityLogAggregationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Log aggregation collects logs from every instance of every service into one centralized,
          searchable system — essential once a system has more than a handful of servers, since
          SSH-ing into individual machines to grep local log files stops being remotely practical.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each service instance ships its logs (via a local agent or sidecar) to a central pipeline,
          which typically parses, enriches, and indexes them into a searchable store (like
          Elasticsearch, or a managed log platform). This gives a single place to search across
          every instance of every service at once — "show me all ERROR logs mentioning order
          o-4471, across any service" — instead of hunting through dozens of individual machines'
          local files. It also decouples log retention from the lifespan of the instance that
          produced them — logs remain searchable even after the server that wrote them has been
          terminated.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Each of 200 service instances</b> writes logs locally and ships them continuously
            via a lightweight agent.</li>
          <li><b>A central pipeline ingests, parses,</b> and indexes every log line from every
            instance into one searchable store.</li>
          <li><b>An engineer searches</b> "all ERROR logs for orderId=o-4471" — one query across
            all 200 instances at once, instead of 200 separate manual checks.</li>
          <li><b>An instance is later terminated</b> (autoscaled down, or crashed) — its logs
            remain fully searchable in the central store, unaffected by the instance's own
            lifecycle.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of many service instances each shipping their local logs to a central aggregation pipeline, which indexes them into one searchable store." >
          {[0, 1, 2, 3].map((i) => (<rect key={i} className="box" x={20 + i * 100} y="20" width="80" height="26" rx="4" />))}
          {[0, 1, 2, 3].map((i) => (<line key={i} className="flow" x1={60 + i * 100} y1="46" x2="210" y2="80" />))}
          <rect className="boxAccent" x="150" y="85" width="120" height="30" rx="5" /><text x="210" y="105" className="boxText">central store</text>
        </svg>
        <figcaption>Every instance ships logs to one central, searchable index — decoupled from any single instance's lifetime.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Underestimating log volume and its cost is a very common surprise — indexing and storing
          logs from a large fleet at high verbosity gets expensive fast, which is why log level
          discipline (previous article) directly affects aggregation cost. Not setting a retention
          policy can also let storage grow unbounded — most logs lose their debugging value after
          a defined window and can be archived to cheaper, colder storage or deleted.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does log aggregation become essential once a system runs on more than a handful of servers?</p>
        </div>
      </section>
      <p className="takeaway">
        Centralizing logs from every instance into one searchable system turns "grep 200 machines"
        into a single query — and decouples log retention from any individual instance's lifetime.
      </p>
    </div>
  );
}
