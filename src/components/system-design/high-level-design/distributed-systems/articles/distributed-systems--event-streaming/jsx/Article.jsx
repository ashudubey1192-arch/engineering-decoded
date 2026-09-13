import "../css/Article.css";

export default function DistributedSystemsEventStreamingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Event streaming extends the message queue idea from &ldquo;deliver this once and forget
          it&rdquo; to &ldquo;keep an ordered, replayable log that many independent consumers can
          each read at their own pace.&rdquo;
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A traditional queue typically removes a message once it&rsquo;s consumed. A stream
          (Kafka being the common example) instead retains events in an ordered log for a
          configured period, and multiple independent consumer groups can each read the same
          stream from their own position. This makes it a natural fit when the same events need to
          feed several different systems &mdash; analytics, search indexing, notifications &mdash;
          each reading independently, and when new consumers need to be able to replay history.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Every &ldquo;order placed&rdquo; event</b> is written to an orders stream, in the
            order it happened.</li>
          <li><b>The analytics service</b> reads the stream from the beginning to build historical
            reports, independent of any other consumer.</li>
          <li><b>The recommendation service</b> reads the same stream, live, to update a user&rsquo;s
            suggestions in near real time.</li>
          <li><b>A brand-new fraud-detection service is added months later.</b> It can replay the
            entire retained history of the stream to build its initial model, something a
            traditional queue &mdash; which already discarded consumed messages &mdash; couldn&rsquo;t offer.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Diagram of an ordered event log being read independently by three consumer groups, each at its own position, including one reading from the beginning of retained history." >
          <rect className="box" x="30" y="50" width="380" height="24" rx="4" />
          {[0,1,2,3,4,5].map(i => (<line key={i} className="divider" x1={30+i*63.3} y1="50" x2={30+i*63.3} y2="74" />))}
          <text x="220" y="40" className="figHint" textAnchor="middle" style={{fontSize:"8px"}}>ordered, retained event log</text>
          <line className="flow" x1="60" y1="74" x2="60" y2="100" /><text x="60" y="112" className="figHint" style={{fontSize:"7px"}}>analytics (replay)</text>
          <line className="flow" x1="220" y1="74" x2="220" y2="100" /><text x="220" y="112" className="figHint" style={{fontSize:"7px"}}>recommendations (live)</text>
          <line className="flow" x1="380" y1="74" x2="380" y2="100" /><text x="380" y="112" className="figHint" style={{fontSize:"7px"}}>fraud (new, replays all)</text>
        </svg>
        <figcaption>Each consumer group reads the retained log independently, from whatever position it needs.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for a stream when a simple queue would do (one producer, one consumer, no need
          for replay or fan-out) adds operational complexity without a real benefit. Forgetting
          that ordering is typically only guaranteed within one partition of the stream, not
          across the whole stream, can also produce subtle ordering bugs at scale.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What can an event stream offer a brand-new consumer that a traditional message queue generally can't?</p>
        </div>
      </section>
      <p className="takeaway">
        Reach for a stream over a plain queue specifically when several independent consumers need
        the same events, or when replaying history is a real requirement &mdash; not by default.
      </p>
    </div>
  );
}
