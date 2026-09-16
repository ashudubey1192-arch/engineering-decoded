export default function WelcomeHowToPracticeDomainModelingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Reading about DDD and doing DDD are different skills. This article gives you a concrete
          way to practice domain modeling against Cargoflow as you move through the course, so the
          patterns land as muscle memory instead of trivia.
        </p>
        <p>
          You do not need a real team or a real domain expert to practice. You need a habit: write
          down the vocabulary you hear (or invent, for Cargoflow), sketch the boundaries, and try
          to break your own model with an edge case.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A three-step practice loop</h2>
        <div className="twoCol">
          <div>
            <h3>1. Narrate a scenario</h3>
            <p>
              Write one paragraph of what happens in the business, in plain language, with no
              class names. "A shipper books a container from Rotterdam to Chicago. Cargoflow
              assigns a carrier and a route with two legs&hellip;"
            </p>
          </div>
          <div>
            <h3>2. Underline the nouns and verbs</h3>
            <p>
              Nouns become candidate entities or value objects (Shipment, Route, Leg, Carrier).
              Verbs become candidate behavior or domain events (book, assign, split into legs,
              deliver).
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>3. TRY TO BREAK IT</small>
          <p>
            Ask "what if the carrier cancels after pickup but before the second leg?" or "what if
            the shipper wants to split one booking into two shipments?" Every question that your
            current model cannot answer cleanly is telling you where a boundary or invariant is
            missing. That discomfort is the actual work of domain modeling.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 600 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="10" y="55" width="160" height="60" rx="8" />
            <text className="boxText" x="90" y="90">Narrate</text>
            <rect className="boxAccent" x="220" y="55" width="160" height="60" rx="8" />
            <text className="boxText" x="300" y="90">Underline</text>
            <rect className="boxAccent" x="430" y="55" width="160" height="60" rx="8" />
            <text className="boxText" x="510" y="90">Break it</text>
            <line className="flow" x1="170" y1="85" x2="220" y2="85" />
            <line className="flow" x1="380" y1="85" x2="430" y2="85" />
            <path className="flowMuted" d="M510,115 C510,150 90,150 90,115" />
            <text className="figHint" x="300" y="163">repeat with a harder scenario</text>
          </svg>
          <figcaption>The practice loop is cyclical: each broken edge case feeds a sharper narration next time.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Turning a narrated scenario into a Java sketch</h2>
        <p>
          You do not need production code to practice &mdash; a rough sketch that only compiles in
          spirit is enough to expose gaps:
        </p>
        <span className="codeLabel">JAVA &mdash; A ROUGH FIRST SKETCH</span>
        <div className="codeBlock">
          <pre>{`// Rough sketch after narrating: "shipper books a container, Cargoflow
// assigns a carrier and splits the trip into legs."
class ShipmentSketch {
    String id;
    String origin;
    String destination;
    List<String> legs = new ArrayList<>();
    String carrierId; // gap: what if no carrier is assigned yet?
    String status;    // gap: a plain String allows any typo as a status
}`}</pre>
        </div>
        <p>
          This sketch already surfaces two gaps worth carrying into the Tactical Modeling section:
          a <code>String status</code> field that cannot enforce valid transitions, and no
          representation for "booked but not yet assigned a carrier."
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes when practicing alone</h2>
        <ul>
          <li>
            <b>Modeling the database instead of the business.</b> If every "entity" you find maps
            one-to-one to a table you would create anyway, you are doing schema design, not domain
            modeling.
          </li>
          <li>
            <b>Never trying to break the model.</b> A model that has never faced an edge case has
            not been tested as a model, only admired.
          </li>
          <li>
            <b>Practicing only on Cargoflow.</b> Once the loop feels natural, run it on a system
            you actually work on &mdash; the patterns transfer immediately.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is "try to break it" a separate, explicit step instead of happening naturally?</p>
          <p>
            <b>Answer:</b> Left implicit, most people stop modeling as soon as the happy path
            reads cleanly. Making edge-case hunting a required step forces the invariants and
            missing states to surface before the code is written, not after a bug report.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Narrate, underline, then deliberately try to break your own model &mdash; that loop is
        what turns DDD from a set of definitions into a practiced skill.
      </p>
    </div>
  );
}
