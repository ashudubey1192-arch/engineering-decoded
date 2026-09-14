import "../css/Article.css";

export default function ReliabilityIdempotencyArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          From a partner's side of the connection, "did my request actually go through" is a
          constant question whenever a network call might have failed silently &mdash;
          idempotency is what makes "just retry it" a safe default answer instead of a risky guess.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Idempotency key</b> &mdash; a unique value the client generates per logical operation and sends in a header on every attempt, including retries.</li>
          <li><b>Server remembers the outcome</b> &mdash; the first request with a given key executes normally; any repeat of that same key returns the original result without re-executing.</li>
          <li><b>Distinct from method idempotency</b> &mdash; PUT and DELETE are idempotent by the HTTP spec itself; POST isn't, which is exactly why creating something needs this explicit mechanism to gain that property.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A partner's <code>POST /v1/shipments</code> call succeeds on Parcelly's servers, but the
          response is lost to a network blip before it reaches the partner. The partner's client,
          having no idea whether the request landed, retries &mdash; sending an identical body with
          the same <code>Idempotency-Key</code> header as the first attempt. Parcelly recognizes
          the key, skips creating a second shipment entirely, and returns the exact same response
          the first (successful, but lost) attempt would have returned.
        </p>
        <span className="codeLabel">SAME KEY, SAFE RETRY</span>
        <div className="codeBlock">
          <pre>{`POST /v1/shipments
Idempotency-Key: 7b1e2c9a-shp-create-1

# network blip loses the response; client retries the identical request
POST /v1/shipments
Idempotency-Key: 7b1e2c9a-shp-create-1
# -> same shp_9f8a returned, no duplicate shipment created`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of an idempotent retry: the first request creates a shipment but its response is lost, the client retries with the same idempotency key, and the server returns the original result instead of creating a duplicate.">
          <rect className="box" x="10" y="55" width="80" height="30" rx="5" />
          <text x="50" y="74" className="boxText" style={{fontSize:"6px"}}>Client</text>
          <rect className="boxAccent" x="330" y="55" width="80" height="30" rx="5" />
          <text x="370" y="74" className="boxText" style={{fontSize:"6px"}}>Parcelly</text>
          <line className="flow" x1="90" y1="65" x2="328" y2="65" />
          <text x="210" y="58" className="figHint" style={{fontSize:"5px"}}>1st request, key=abc &mdash; succeeds</text>
          <line className="flowMuted" x1="328" y1="80" x2="90" y2="90" />
          <text x="210" y="98" className="figHint" style={{fontSize:"5px"}}>response lost in transit</text>
          <line className="flow" x1="90" y1="110" x2="328" y2="110" />
          <text x="210" y="123" className="figHint" style={{fontSize:"5px"}}>retry, same key=abc &mdash; returns original result, no duplicate</text>
        </svg>
        <figcaption>The key, not the network's behavior, decides whether the operation runs once &mdash; even when the client genuinely can't tell if the first attempt landed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Generating a new idempotency key on every retry, instead of reusing the same one for the
          same logical operation, defeats the mechanism entirely &mdash; it's equivalent to having
          no idempotency key at all. Storing only "this key was used" without storing enough of the
          original response to actually replay it is the other common mistake: a retry gets
          confirmation that something happened, but not necessarily the same data &mdash; like a
          different shipment ID than the one actually created the first time.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does generating a fresh idempotency key on every retry attempt make the whole mechanism pointless?</p>
        </div>
      </section>
      <p className="takeaway">
        Idempotency keys move the responsibility for "don't duplicate this" from a chain of
        assumptions about network reliability onto one explicit, testable contract &mdash; one key
        per logical operation, reused on every retry, no exceptions.
      </p>
    </div>
  );
}
