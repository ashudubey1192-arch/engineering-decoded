import "../css/Article.css";

export default function ContractsAndDocsExamplesAndDescriptionsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A schema says what shape a field has; it says nothing about what the field means or what
          a realistic value looks like. Skipping descriptions and examples is the single most
          common reason a technically complete spec is still useless to someone integrating against
          it for the first time.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Write descriptions for zero context</b> &mdash; assume the reader has never seen this API before, not that they already know your domain's conventions.</li>
          <li><b>Use concrete, realistic examples</b> &mdash; a real-looking ID and value, not a placeholder like <code>"string"</code> or <code>"foo"</code>.</li>
          <li><b>Examples must actually validate</b> &mdash; an example that doesn't match its own schema is a bug, and it silently breaks any mock server or test generated from it.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <table className="miniTable">
          <caption>BEFORE AND AFTER</caption>
          <thead><tr><th>Before</th><th>After</th></tr></thead>
          <tbody>
            <tr><td><code>status: string</code></td><td><code>status: string, enum: [created, in_transit, delivered, customs_hold, cancelled], example: "in_transit"</code></td></tr>
            <tr><td><i>no description</i></td><td>"The shipment's current position in its delivery lifecycle. See the Shipment Status Lifecycle guide for the full state diagram."</td></tr>
          </tbody>
        </table>
        <p>
          The "before" version is technically valid OpenAPI and tells an integrator almost nothing
          &mdash; not which values are actually possible, not what a typical one looks like, and
          not where to learn more. The "after" version answers all three in the spec itself,
          exactly where a generated reference page or a code-completion tool will surface it.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of three inputs combining into one complete field definition: the schema gives its shape, the description gives its meaning, and the example gives a realistic value.">
          {[
            {l1:"Schema:", l2:"type + enum", x:20},
            {l1:"Description:", l2:"what it means", x:160},
            {l1:"Example:", l2:"\"in_transit\"", x:300},
          ].map((n) => (
            <g key={n.x}>
              <rect className="box" x={n.x} y="15" width="120" height="40" rx="6" />
              <text x={n.x+60} y="33" className="figHint" style={{fontSize:"5.5px"}}>{n.l1}</text>
              <text x={n.x+60} y="46" className="figHint" style={{fontSize:"5.5px"}}>{n.l2}</text>
              <line className="flow" x1={n.x+60} y1="55" x2="210" y2="85" />
            </g>
          ))}
          <rect className="boxAccent" x="150" y="88" width="120" height="24" rx="5" />
          <text x="210" y="104" className="boxText" style={{fontSize:"6px"}}>complete field</text>
        </svg>
        <figcaption>A field isn't really documented until all three are present &mdash; shape alone leaves meaning and realism to guesswork.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Writing a description that just restates the field name &mdash; "carrier: the carrier"
          &mdash; passes a spec-completeness checklist while adding zero real information. The more
          damaging mistake is an example that doesn't actually validate against its own schema,
          often from editing the schema later without updating the example beside it; it's an
          embarrassing, easy-to-miss bug that silently breaks any mock server or contract test
          generated from that example.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a description that just restates the field's name provide essentially no value to someone integrating for the first time?</p>
        </div>
      </section>
      <p className="takeaway">
        A schema alone tells a machine what's valid; descriptions and examples are what tell a
        human what's true and what's normal &mdash; a spec needs both to actually be usable.
      </p>
    </div>
  );
}
