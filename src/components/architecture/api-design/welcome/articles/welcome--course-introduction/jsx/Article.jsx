import "../css/Article.css";

export default function WelcomeCourseIntroductionArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          This course is about the interface, not the implementation &mdash; the URLs, payloads,
          status codes, and rules that everyone calling your service has to agree on before a
          single request succeeds, and that stay expensive to change for as long as anyone depends
          on them.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Writing an endpoint that returns the right data is implementation. Deciding what that
          endpoint is called, what shape its response takes, how it reports an error, and whether
          that shape can survive years of new features without breaking anyone &mdash; that's
          design. This course is entirely about the second half. Across eleven sections, it covers
          the decisions that make an API predictable to a stranger reading it for the first time:
        </p>
        <ul className="stepList">
          <li><b>Resource shape</b> &mdash; what a "thing" in your API is called, and how it's structured.</li>
          <li><b>Request and response design</b> &mdash; what a caller sends, what they get back, and how errors are reported.</li>
          <li><b>Querying conventions</b> &mdash; filtering, sorting, searching, and paging through collections.</li>
          <li><b>Evolution</b> &mdash; changing an API that people already depend on, without breaking them.</li>
          <li><b>Security and reliability</b> &mdash; authentication, rate limits, retries, and idempotency.</li>
          <li><b>Contracts and platform</b> &mdash; documenting, testing, and operating an API as a product.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Throughout this course, most examples come from <code>Parcelly</code>, a fictional
          shipment-tracking API used by e-commerce platforms to create shipments, print labels,
          and check delivery status. Parcelly is a useful running example because it's ordinary: it
          has resources (shipments, packages, carriers), it's called by many different kinds of
          consumers (mobile apps, partner backends, internal tools), and every design decision it
          makes &mdash; like how it represents a shipment's status &mdash; ships to hundreds of
          integrated partners at once, which is exactly the constraint that makes API design a
          distinct discipline from writing ordinary application code.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 160" role="img" aria-label="Diagram of one Parcelly API in the center, called by four different kinds of consumers: a mobile app, a partner backend, an internal dashboard, and a webhook receiver, all depending on the same interface.">
          <rect className="boxAccent" x="170" y="65" width="100" height="40" rx="7" />
          <text x="220" y="89" className="boxText" style={{fontSize:"8px"}}>Parcelly API</text>
          {["Mobile app","Partner backend","Internal dashboard","Webhook receiver"].map((t,i) => (
            <g key={t}>
              <rect className="box" x={20 + i*105} y="10" width="90" height="30" rx="5" />
              <text x={65 + i*105} y="29" className="boxText" style={{fontSize:"6px"}}>{t}</text>
              <line className="flowMuted" x1={65 + i*105} y1="40" x2="220" y2="65" />
            </g>
          ))}
          <text x="220" y="135" className="figHint" style={{fontSize:"7px"}}>one interface, one contract &mdash; every consumer depends on the same shape</text>
        </svg>
        <figcaption>Four very different callers, one API &mdash; the design has to serve all of them without knowing which one is asking.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The most common mistake is treating design as something that happens implicitly while
          writing the handler &mdash; whatever shape falls out of the code becomes the API. That
          works until the first outside consumer integrates against it; after that, even an
          awkward field name is a breaking change for everyone who already depends on it. The fix
          isn't perfectionism before writing any code &mdash; it's making the interface decisions
          on purpose, before they've hardened into a contract you can't take back.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an awkward field name cost so much more to fix in a public API than in a private, internal function?</p>
        </div>
      </section>
      <p className="takeaway">
        Implementation can be rewritten overnight; a published interface is a promise to everyone
        who built against it. This course is about making that promise on purpose, and keeping it
        without freezing the API in place forever.
      </p>
    </div>
  );
}
