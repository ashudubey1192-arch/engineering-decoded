import "../css/Article.css";

export default function ArchitecturalPatternsCqrsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          CQRS (Command Query Responsibility Segregation) splits the models used for writing data
          (commands) from the models used for reading it (queries) — instead of one model trying
          to serve both well.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          In a typical CRUD app, one model and one schema handle both reads and writes, which is a
          compromise — the shape that's easiest to write correctly isn't always the shape that's
          fastest to read. CQRS uses a write model optimized for validating and persisting changes
          correctly, and a separate, often denormalized, read model optimized for the exact queries
          the UI needs. The two are kept in sync — often asynchronously — which means the read side
          can lag slightly behind the write side.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>An order system needs strict validation on writes but a dashboard needs to show complex, fast-loading aggregate views.</p>
        </div>
        <ol className="stepList">
          <li><b>Command side.</b> Placing an order goes through a normalized write model with
            strict validation — checking inventory, pricing rules, etc.</li>
          <li><b>Write triggers an update.</b> The change is published as an event after the
            command succeeds.</li>
          <li><b>Read model updates.</b> A separate process consumes that event and updates a
            denormalized "orders dashboard" table, pre-joined and pre-aggregated for fast reads.</li>
          <li><b>Dashboard reads the read model.</b> Loading the dashboard is a single fast query
            against data shaped exactly for that screen — no joins at read time.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a command going through a write model, publishing an event that updates a separate denormalized read model used to serve fast queries.">
          <rect className="boxAccent" x="20" y="20" width="100" height="30" rx="5" /><text x="70" y="40" className="boxText">command</text>
          <line className="flow" x1="120" y1="35" x2="170" y2="35" />
          <rect className="box" x="180" y="20" width="100" height="30" rx="5" /><text x="230" y="40" className="boxText">write model</text>
          <line className="flow" x1="230" y1="50" x2="230" y2="80" />
          <rect className="box" x="180" y="85" width="100" height="26" rx="4" /><text x="230" y="102" className="boxText">event</text>
          <line className="flow" x1="280" y1="98" x2="330" y2="98" />
          <rect className="boxAccent" x="340" y="85" width="90" height="26" rx="4" /><text x="385" y="102" className="boxText">read model</text>
          <line className="flow" x1="385" y1="85" x2="385" y2="50" />
          <text x="385" y="35" className="boxText">query</text>
        </svg>
        <figcaption>Writes go through a validated write model; reads are served from a separately-updated, query-optimized model.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Applying CQRS everywhere adds real complexity (two models, a sync mechanism, eventual
          consistency between them) that most simple CRUD screens don't need. It earns its cost
          specifically where read and write needs genuinely diverge — complex reporting reads
          against a write-optimized transactional model, for example.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why might the read model in a CQRS system be temporarily out of sync with the write model, and when is that an acceptable trade-off?</p>
        </div>
      </section>
      <p className="takeaway">
        CQRS lets writes and reads each use the model shape best suited to them — worth the
        added complexity when a single shared model is genuinely compromising one side or the other.
      </p>
    </div>
  );
}
