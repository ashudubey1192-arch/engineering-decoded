import "../css/Article.css";

export default function ReliabilityCachingArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          HTTP gives an API a caching mechanism for free &mdash; the actual design work is telling
          clients and intermediaries, explicitly and correctly, what's safe to cache and for how
          long, instead of leaving them to guess or refuse to cache at all.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Cache-Control</b> &mdash; states how long a response can be cached, and by whom (<code>public</code>, <code>private</code>, <code>no-store</code>).</li>
          <li><b>ETag</b> &mdash; an opaque fingerprint of a resource's current state, allowing a conditional request that costs almost nothing when the data hasn't changed.</li>
          <li><b>Conditional requests</b> &mdash; a client sends <code>If-None-Match</code> with its cached ETag; the server replies <code>304 Not Modified</code> if it still matches, with no body at all.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's largely static <code>/v1/carriers</code> list ships a straightforward
          long <code>max-age</code>, since carrier data rarely changes. Its fast-moving
          <code>/v1/shipments/shp_9f8a</code>, which a partner might poll every few seconds for
          status updates, uses an ETag instead &mdash; freshness on every request, at almost no
          cost when nothing's actually changed:
        </p>
        <span className="codeLabel">FIRST REQUEST</span>
        <div className="codeBlock">
          <pre>{`HTTP/1.1 200 OK
ETag: "a1b2c3"

{ "id": "shp_9f8a", "status": "in_transit" }`}</pre>
        </div>
        <span className="codeLabel">NEXT POLL, NOTHING CHANGED</span>
        <div className="codeBlock">
          <pre>{`GET /v1/shipments/shp_9f8a
If-None-Match: "a1b2c3"

HTTP/1.1 304 Not Modified`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a conditional request: first request returns 200 with an ETag, a later request sends If-None-Match with that ETag, and the server replies 304 Not Modified with no body if the resource is unchanged.">
          <rect className="box" x="10" y="20" width="90" height="30" rx="5" />
          <text x="55" y="39" className="boxText" style={{fontSize:"6px"}}>Client</text>
          <rect className="boxAccent" x="320" y="20" width="90" height="30" rx="5" />
          <text x="365" y="39" className="boxText" style={{fontSize:"6px"}}>Parcelly</text>
          <line className="flow" x1="100" y1="35" x2="318" y2="35" />
          <text x="210" y="28" className="figHint" style={{fontSize:"5px"}}>GET /shipments/shp_9f8a</text>
          <line className="flowMuted" x1="318" y1="50" x2="100" y2="55" />
          <text x="210" y="65" className="figHint" style={{fontSize:"5px"}}>200 OK + ETag: "a1b2c3"</text>
          <line className="flow" x1="100" y1="85" x2="318" y2="85" />
          <text x="210" y="78" className="figHint" style={{fontSize:"5px"}}>GET, If-None-Match: "a1b2c3"</text>
          <line className="flowMuted" x1="318" y1="100" x2="100" y2="105" />
          <text x="210" y="115" className="figHint" style={{fontSize:"5px"}}>304 Not Modified &mdash; no body</text>
        </svg>
        <figcaption>Freshness on every poll, at the cost of a tiny header exchange instead of a full payload, whenever nothing's actually changed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Marking genuinely per-caller, dynamic data as publicly cacheable is the most dangerous
          mistake &mdash; a shared cache could end up serving one partner's shipment data to
          another entirely different partner. Never setting any caching headers at all is the more
          common, less dangerous mistake: it forces every client to either refuse to cache anything
          (wasting bandwidth and latency) or invent its own unreliable caching heuristic, neither of
          which the API had any say in.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a 304 Not Modified response save meaningfully more than just "a smaller response," compared to sending the full shipment body every time nothing has changed?</p>
        </div>
      </section>
      <p className="takeaway">
        Explicit caching headers turn "should I cache this" from a guess every client makes
        independently into an answer the API states once &mdash; ETags in particular buy freshness
        and efficiency at the same time, which a blunt max-age alone can't.
      </p>
    </div>
  );
}
