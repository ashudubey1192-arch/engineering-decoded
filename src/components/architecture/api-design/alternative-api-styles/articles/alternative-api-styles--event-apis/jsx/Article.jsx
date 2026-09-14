import "../css/Article.css";

export default function AlternativeApiStylesEventApisArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          An event API describes a system as a stream of things that happened, not a set of things
          that currently exist &mdash; a genuinely different mental model from a resource-oriented
          API, useful specifically when consumers care about history and sequence, not just current
          state.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>An event is an immutable fact</b> &mdash; "ShipmentDelivered at 14:32," timestamped, never edited or deleted after the fact.</li>
          <li><b>A stream, not a snapshot</b> &mdash; the API surface is an ordered log of events, which consumers can replay, not just a queryable current state.</li>
          <li><b>Relationship to webhooks</b> &mdash; a webhook is one delivery mechanism for individual events; an event API can also expose the full ordered stream for consumers who want to pull and replay it themselves.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's <code>GET /v1/shipments/shp_9f8a</code> shows only current status &mdash;
          structurally, it has no way to show "and here's everything that happened before that."
          Parcelly's separate shipment-events feed does:
        </p>
        <span className="codeLabel">EVENT STREAM VS. SNAPSHOT</span>
        <div className="codeBlock">
          <pre>{`GET /shipments/shp_9f8a
{ "status": "delivered" }   // current state only

GET /shipments/shp_9f8a/events
[ { "type": "created", "at": "..." },
  { "type": "picked_up", "at": "..." },
  { "type": "in_transit", "at": "..." },
  { "type": "delivered", "at": "..." } ]   // full ordered history`}</pre>
        </div>
        <p>
          A partner's data warehouse consumes that event stream to rebuild a complete history of
          every shipment's state over time &mdash; something the snapshot endpoint alone can never
          provide, no matter how often it's polled.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram contrasting a resource snapshot showing only current state against an event stream showing the full ordered sequence of events leading to that state.">
          <rect className="box" x="20" y="35" width="110" height="40" rx="6" />
          <text x="75" y="59" className="boxText" style={{fontSize:"6.5px"}}>current: delivered</text>
          <text x="105" y="20" className="figLabel" style={{fontSize:"6px"}}>SNAPSHOT</text>

          <text x="320" y="20" className="figLabel" style={{fontSize:"6px"}}>EVENT STREAM</text>
          {["created","picked up","in transit","delivered"].map((t,i) => (
            <g key={t}>
              <rect className={i===3 ? "boxAccent" : "box"} x={200 + i*55} y="35" width="45" height="28" rx="4" />
              <text x={222 + i*55} y="52" className="boxText" style={{fontSize:"4.8px"}}>{t}</text>
              {i < 3 && <line className="flow" x1={245 + i*55} y1="49" x2={255 + i*55} y2="49" />}
            </g>
          ))}
        </svg>
        <figcaption>A snapshot answers "what's true now"; an event stream answers "what happened, in what order" &mdash; only one of them can rebuild history.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Exposing only current-state resources when consumers actually need history or an audit
          trail forces them to poll frequently and diff snapshots themselves, reconstructing badly
          what a real event log would have handed them directly. Treating events as mutable or
          deletable after the fact is the deeper mistake: an event is a historical record of "this
          happened," and revising history undermines the entire premise a consumer is relying on
          when they treat the stream as an authoritative log.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can't a partner reconstruct a shipment's full history by polling the snapshot endpoint frequently, no matter how often they poll?</p>
        </div>
      </section>
      <p className="takeaway">
        Reach for an event API specifically when "what happened, and in what order" matters as much
        as "what's true right now" &mdash; and once something is published as an event, treat it as
        permanent history, not an editable record.
      </p>
    </div>
  );
}
