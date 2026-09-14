import "../css/Article.css";

export default function ApiFoundationsApiFirstDesignArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          API-first design means writing down the contract &mdash; endpoints, payloads, errors
          &mdash; and getting it reviewed before any implementation code exists, instead of letting
          the API's shape fall out of whatever the backend happens to do first.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Code-first</h3>
            <p>Build the backend, then derive docs (or an OpenAPI file) from whatever it ended up doing. The API's shape is a side effect of implementation choices.</p>
          </div>
          <div>
            <h3>API-first</h3>
            <p>Design the contract &mdash; often as an OpenAPI spec &mdash; review it with consumers, then build backend and frontend against that agreed shape in parallel.</p>
          </div>
        </div>
        <p>
          API-first doesn't mean writing an OpenAPI document nobody reads before diving back into
          code-first habits. It means the contract is a real artifact, reviewed by the people who
          will build against it, before the first line of handler code is written &mdash; and
          changed through the same review process afterward.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          When Parcelly added return-shipment support, the API team wrote the
          <code>POST /v1/returns</code> contract first &mdash; request fields, response shape,
          error cases &mdash; and shared it with the two partner integrations most likely to adopt
          it early. One partner pointed out the draft had no way to specify a partial return (some
          items, not the whole shipment) before a single line of backend code existed. Fixing that
          in a design document took an afternoon; fixing it after three partners had integrated
          against the all-or-nothing version would have meant a breaking change and a migration.
        </p>
        <span className="codeLabel">CONTRACT REVIEWED BEFORE IMPLEMENTATION</span>
        <div className="codeBlock">
          <pre>{`POST /v1/returns
{
  "shipment_id": "shp_9f8a",
  "items": [
    { "sku": "TSHIRT-BLK-M", "quantity": 1 }
  ],
  "reason": "wrong_size"
}`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 160" role="img" aria-label="Diagram comparing code-first, where design is discovered late after backend and frontend are built sequentially, against API-first, where the contract is designed and reviewed first, then backend and frontend are built in parallel against it.">
          <text x="105" y="18" className="figLabel">CODE-FIRST</text>
          <rect className="box" x="20" y="35" width="80" height="24" rx="4" />
          <text x="60" y="51" className="boxText" style={{fontSize:"6px"}}>Build backend</text>
          <rect className="box" x="110" y="35" width="80" height="24" rx="4" />
          <text x="150" y="51" className="boxText" style={{fontSize:"6px"}}>Build frontend</text>
          <rect className="boxWarn" x="60" y="75" width="90" height="24" rx="4" />
          <text x="105" y="91" className="boxText" style={{fontSize:"6px"}}>Shape discovered late</text>
          <line className="flow" x1="100" y1="47" x2="108" y2="47" />
          <line className="flowMuted" x1="150" y1="59" x2="120" y2="75" />

          <line className="divider" x1="215" y1="10" x2="215" y2="150" />

          <text x="325" y="18" className="figLabel">API-FIRST</text>
          <rect className="boxAccent" x="280" y="35" width="90" height="24" rx="4" />
          <text x="325" y="51" className="boxText" style={{fontSize:"6px"}}>Design + review contract</text>
          <rect className="box" x="250" y="80" width="70" height="24" rx="4" />
          <text x="285" y="96" className="boxText" style={{fontSize:"6px"}}>Backend</text>
          <rect className="box" x="335" y="80" width="70" height="24" rx="4" />
          <text x="370" y="96" className="boxText" style={{fontSize:"6px"}}>Frontend</text>
          <line className="flow" x1="310" y1="59" x2="285" y2="78" />
          <line className="flow" x1="335" y1="59" x2="365" y2="78" />
          <text x="325" y="125" className="figHint" style={{fontSize:"6px"}}>built in parallel, against the same reviewed shape</text>
        </svg>
        <figcaption>Code-first discovers the API's real shape after something is already built; API-first settles the shape first, then builds both sides against it at once.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Writing an OpenAPI file after the implementation is done and calling that "API-first" is
          the most common mistake &mdash; it produces accurate documentation, which is valuable,
          but it skips the actual benefit, which is catching design problems while they're still
          cheap to fix. The opposite mistake is over-investing in the contract for a fast-moving,
          single-team internal API where nobody outside the team is blocked waiting on it &mdash;
          for that case, the review overhead can cost more than the design mistakes it prevents.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did catching the missing partial-return case cost Parcelly an afternoon before implementation, but would have cost a breaking change and a partner migration after?</p>
        </div>
      </section>
      <p className="takeaway">
        API-first isn't a documentation habit &mdash; it's moving the point where design mistakes
        get caught from "after partners have integrated" to "during review of a document," which is
        the cheapest possible place to catch them.
      </p>
    </div>
  );
}
