export default function UbiquitousLanguageLanguageInCodeArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The ubiquitous language earns its name only if it shows up in the code, not just in
          meetings. This article is about the specific places code tends to quietly drift from the
          glossary &mdash; class names, method names, and especially the words used for technical
          plumbing.
        </p>
        <p>
          Cargoflow's rule of thumb: if a domain expert reads a method signature aloud, it should
          sound like a sentence they would say themselves.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Where drift hides in code</h2>
        <div className="twoCol">
          <div>
            <h3>Class and field names</h3>
            <p>
              <code>Shipment.eta</code> versus <code>Shipment.deadline</code> &mdash; the glossary
              distinguishes these sharply; the code must too, in every field, parameter, and
              variable name, not just the primary class.
            </p>
          </div>
          <div>
            <h3>Method names</h3>
            <p>
              <code>Shipment.markDelivered(pod)</code> reads as a sentence; <code>Shipment.
              update(status, "DELIVERED")</code> does not, even though both might do the same
              thing internally.
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>THE SNEAKIEST DRIFT: TECHNICAL LAYERS</small>
          <p>
            A database table named <code>shipment_tbl</code> with a column <code>ship_stat</code>{" "}
            is a common way drift creeps in unnoticed &mdash; nobody reads a glossary aloud when
            naming a column. Cargoflow's convention: table and column names mirror the domain
            language exactly (<code>shipment</code>, <code>status</code>), abbreviations banned.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="30" width="150" height="90" rx="8" />
            <text className="figLabel" x="105" y="50">DOMAIN CLASS</text>
            <text className="boxText" x="105" y="75">Shipment</text>
            <text className="boxText" x="105" y="95">markDelivered()</text>
            <line className="flow" x1="180" y1="75" x2="230" y2="75" />
            <rect className="boxAccent" x="230" y="30" width="150" height="90" rx="8" />
            <text className="figLabel" x="305" y="50">DATABASE</text>
            <text className="boxText" x="305" y="75">shipment</text>
            <text className="boxText" x="305" y="95">status</text>
            <line className="flowMuted" x1="380" y1="75" x2="430" y2="75" />
            <rect className="boxWarn" x="430" y="30" width="130" height="90" rx="8" />
            <text className="figLabel" x="495" y="50">API RESPONSE</text>
            <text className="boxText" x="495" y="75">shipment.status</text>
            <text className="figHint" x="495" y="95">same word, everywhere</text>
          </svg>
          <figcaption>The same word should survive unchanged from domain class through database schema to API response.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The language surviving three layers intact</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private ShipmentStatus status; // same word throughout
    public void markDelivered(ProofOfDelivery pod) { /* ... */ }
}`}</pre>
        </div>
        <span className="codeLabel">SQL</span>
        <div className="codeBlock">
          <pre>{`CREATE TABLE shipment (
    id UUID PRIMARY KEY,
    status VARCHAR(20) NOT NULL  -- matches ShipmentStatus exactly, no abbreviation
);`}</pre>
        </div>
        <p>
          No translation table is needed anywhere in the stack to explain that
          <code> ship_stat</code> means <code>status</code> &mdash; the word is simply the same
          word, top to bottom.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Abbreviating in the database "to save characters."</b> Modern databases have no
            meaningful length constraint that justifies this; the readability cost is permanent.
          </li>
          <li>
            <b>Using generic CRUD verbs (<code>update</code>, <code>set</code>) for named
            business actions.</b> Every generic setter is a place the domain language failed to
            reach.
          </li>
          <li>
            <b>Letting API response field names diverge from the domain model "for the frontend's
            convenience."</b> A translation layer at the API boundary is fine if explicit; silent
            renaming just adds another place drift can hide.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does the database column get named <code>status</code> instead of the more traditional <code>ship_stat</code>?</p>
          <p>
            <b>Answer:</b> The ubiquitous language is supposed to survive unchanged across every
            layer. An abbreviated column name introduces a translation gap between the database
            and the domain model that the glossary does not account for.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Ubiquitous language has to reach every layer &mdash; class names, method names, database
        columns, API fields &mdash; or the "shared" language stops being shared at the boundaries.
      </p>
    </div>
  );
}
