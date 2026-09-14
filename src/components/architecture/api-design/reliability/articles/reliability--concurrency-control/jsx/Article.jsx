import "../css/Article.css";

export default function ReliabilityConcurrencyControlArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Two callers updating the same resource moments apart will eventually happen to any API
          with real traffic. Concurrency control decides whether the second update silently
          overwrites the first one's work, or gets a clear, immediate chance to notice and react.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>The lost update problem</b> &mdash; client A reads a resource, client B reads the same resource, B writes, A writes based on its now-stale read, silently erasing B's change.</li>
          <li><b>Optimistic concurrency</b> &mdash; a client sends the ETag it last read via <code>If-Match</code>; the server checks it still matches the current version before writing.</li>
          <li><b>412 Precondition Failed</b> &mdash; the server's response when the resource has changed since the client's <code>If-Match</code> value was current, instead of silently overwriting.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Two of Parcelly's own partner-facing tools both try to update the same shipment's
          delivery instructions within seconds of each other. The first update succeeds and the
          shipment's ETag advances. The second request still carries the now-stale ETag from
          before either update happened:
        </p>
        <span className="codeLabel">SECOND REQUEST, STALE ETAG</span>
        <div className="codeBlock">
          <pre>{`PATCH /v1/shipments/shp_9f8a
If-Match: "a1b2c3"   # this was the ETag before the FIRST update landed

HTTP/1.1 412 Precondition Failed`}</pre>
        </div>
        <p>
          Rather than silently overwriting the first tool's change, the second request fails
          explicitly. It re-fetches the current version, sees the first change, and either merges
          or asks its user to reconcile &mdash; instead of one change vanishing with nobody ever
          noticing.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of two clients reading the same version of a resource. The first client updates successfully and the version advances. The second client's update, still carrying the old version, is rejected with 412 instead of silently overwriting.">
          <rect className="box" x="10" y="10" width="120" height="26" rx="5" />
          <text x="70" y="27" className="boxText" style={{fontSize:"5.5px"}}>Shipment @ v1</text>
          <rect className="box" x="10" y="55" width="90" height="24" rx="4" />
          <text x="55" y="71" className="boxText" style={{fontSize:"5.5px"}}>Client A reads v1</text>
          <rect className="box" x="10" y="90" width="90" height="24" rx="4" />
          <text x="55" y="106" className="boxText" style={{fontSize:"5.5px"}}>Client B reads v1</text>
          <rect className="boxAccent" x="200" y="55" width="100" height="24" rx="4" />
          <text x="250" y="71" className="boxText" style={{fontSize:"5.5px"}}>A writes &mdash; v2 OK</text>
          <rect className="boxWarn" x="200" y="90" width="100" height="24" rx="4" />
          <text x="250" y="106" className="boxText" style={{fontSize:"5.5px"}}>B writes v1 &mdash; 412</text>
          <line className="flow" x1="100" y1="67" x2="198" y2="67" />
          <line className="flowMuted" x1="100" y1="102" x2="198" y2="102" />
        </svg>
        <figcaption>Both clients read the same starting version; only the one whose If-Match is still current is allowed to write.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Skipping concurrency control entirely and letting the last write silently win is a
          reasonable choice for genuinely low-contention resources, but risky for anything
          collaboratively edited, where a silently lost update might not be noticed for a long
          time. The more subtle mistake is implementing something that looks like optimistic
          locking &mdash; checking the ETag &mdash; but only logging a warning on mismatch instead
          of actually rejecting the write, which quietly defeats the entire protection while
          looking correct in code review.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does rejecting the second write with 412 protect data better than letting it succeed and just overwrite the first client's change?</p>
        </div>
      </section>
      <p className="takeaway">
        Optimistic concurrency control is cheap insurance for exactly the moment two updates
        collide &mdash; a stale If-Match should always be a hard rejection, never just a logged
        warning that lets the write through anyway.
      </p>
    </div>
  );
}
