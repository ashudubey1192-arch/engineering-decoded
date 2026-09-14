import "../css/Article.css";

export default function ApiEvolutionApiVersioningArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Versioning exists for exactly one reason: to make a breaking change without breaking
          every consumer who hasn't opted into it yet. Where you put the version number is a
          trade-off, not a right answer.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>URI versioning</h3>
            <p><code>/v1/shipments</code>, <code>/v2/shipments</code>. Simple, visible, easy to test in a browser or curl, cache-friendly. Philosophically odd: is v1 and v2's shipment "the same resource"?</p>
          </div>
          <div>
            <h3>Header versioning</h3>
            <p>One URI, version chosen via a header like <code>Accept: application/vnd.parcelly.v2+json</code>. Keeps one clean URI per resource, but harder to explore and easy for a client to forget to set.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly versions at the URI level, deliberately, because most of its partners are
          integration engineers who want to open a URL in a browser or paste a curl command from
          documentation and immediately see which version they're hitting. That's a real trade-off
          Parcelly accepted knowingly, not a default it fell into:
        </p>
        <span className="codeLabel">TWO VERSIONING STYLES</span>
        <div className="codeBlock">
          <pre>{`# URI versioning (what Parcelly uses)
GET /v2/shipments/shp_9f8a

# Header versioning (the alternative)
GET /shipments/shp_9f8a
Accept: application/vnd.parcelly.v2+json`}</pre>
        </div>
        <p>
          Parcelly versions only at the major level &mdash; <code>v1</code>, <code>v2</code> &mdash;
          reserved for actual breaking changes; purely additive changes ship into the current
          version without bumping it at all, following the backward-compatibility rules from the
          previous lesson.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram comparing URI versioning, where v1 and v2 are separate paths, against header versioning, where one path serves different versions chosen by an Accept header.">
          <text x="105" y="18" className="figLabel">URI VERSIONING</text>
          <rect className="box" x="30" y="35" width="150" height="26" rx="5" />
          <text x="105" y="52" className="boxText" style={{fontSize:"6px"}}>/v1/shipments</text>
          <rect className="boxAccent" x="30" y="70" width="150" height="26" rx="5" />
          <text x="105" y="87" className="boxText" style={{fontSize:"6px"}}>/v2/shipments</text>

          <line className="divider" x1="230" y1="10" x2="230" y2="120" />

          <text x="335" y="18" className="figLabel">HEADER VERSIONING</text>
          <rect className="box" x="290" y="50" width="110" height="30" rx="5" />
          <text x="345" y="69" className="boxText" style={{fontSize:"6px"}}>/shipments</text>
          <text x="345" y="100" className="figHint" style={{fontSize:"5.5px"}}>Accept header picks v1 or v2</text>
        </svg>
        <figcaption>URI versioning gives each version its own visible path; header versioning keeps one path and lets a header pick the version.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Bumping the version number for every change, including purely additive ones, is the most
          common mistake &mdash; it fragments consumers across versions unnecessarily and makes
          "which version has feature X" a constant support question. The opposite mistake is
          treating versioning as a substitute for backward compatibility discipline: shipping
          breaking changes into the current version "because we'll call it v2 eventually" leaves
          consumers on the not-yet-bumped version exposed to breakage anyway.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does Parcelly reserve version bumps for breaking changes only, rather than incrementing the version for every new optional field it adds?</p>
        </div>
      </section>
      <p className="takeaway">
        Pick a versioning location deliberately and explain the trade-off in your docs, then use it
        sparingly &mdash; versioning is the tool of last resort for changes that can't be made
        backward compatible, not a counter you increment for every release.
      </p>
    </div>
  );
}
