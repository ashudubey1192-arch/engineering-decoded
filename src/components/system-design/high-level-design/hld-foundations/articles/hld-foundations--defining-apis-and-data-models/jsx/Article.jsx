import "../css/Article.css";

export default function HldFoundationsDefiningApisAndDataModelsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Once requirements and scale are clear, the next step is writing down a small set of
          APIs and a first-draft data model &mdash; the contract every component in the design
          will be built against.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          APIs at this stage should be <b>coarse-grained and resource-oriented</b> &mdash; a
          handful of endpoints matching the functional requirements, not a method for every
          internal operation. The data model is a first draft of the entities involved and their
          relationships &mdash; enough to reason about reads and writes, not a fully normalized
          schema with every index decided. Both get refined later; their job here is to make the
          rest of the design concrete enough to reason about.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start from the functional requirements.</b> A URL shortener needs to create a
            short URL and resolve one back to its original.</li>
          <li><b>Write the APIs.</b> <code>POST /urls {"{"} longUrl {"}"}</code> &rarr; returns a
            code; <code>GET /{"{"}code{"}"}</code> &rarr; redirects to the original URL.</li>
          <li><b>Draft the data model.</b> A single <code>ShortUrl</code> entity: code, longUrl,
            createdAt, and a click count.</li>
          <li><b>Check it against requirements.</b> Every functional requirement maps to exactly
            one API call and touches exactly this one entity &mdash; nothing is missing, nothing
            extra was added.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a client calling two coarse-grained APIs, POST /urls and GET /code, both operating on a single ShortUrl data model." >
          <rect className="box" x="20" y="35" width="90" height="34" rx="6" /><text x="65" y="57" className="boxText">Client</text>
          <line className="flow" x1="110" y1="45" x2="180" y2="45" /><text x="145" y="35" className="figHint" style={{fontSize:"8px"}}>POST /urls</text>
          <line className="flow" x1="110" y1="60" x2="180" y2="60" /><text x="145" y="80" className="figHint" style={{fontSize:"8px"}}>GET /code</text>
          <rect className="boxAccent" x="190" y="30" width="120" height="44" rx="6" /><text x="250" y="56" className="boxText">API service</text>
          <line className="flow" x1="310" y1="52" x2="360" y2="52" />
          <rect className="box" x="365" y="30" width="45" height="44" rx="6" /><text x="387" y="56" className="boxText" style={{fontSize:"8px"}}>ShortUrl</text>
        </svg>
        <figcaption>Two coarse APIs and one entity are enough to satisfy the stated requirements.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Designing APIs around internal implementation details (a separate endpoint for every
          database column update) creates a leaky, brittle contract. Skipping the data model and
          jumping straight to &ldquo;which database should we use&rdquo; is equally common &mdash;
          that choice only makes sense once the shape of the data is known.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why should APIs at the HLD stage be coarse-grained and resource-oriented rather than matching internal operations one-to-one?</p>
        </div>
      </section>
      <p className="takeaway">
        A small, resource-oriented API surface and a first-draft data model turn requirements into
        a concrete contract &mdash; the thing every later component in the design gets built against.
      </p>
    </div>
  );
}
