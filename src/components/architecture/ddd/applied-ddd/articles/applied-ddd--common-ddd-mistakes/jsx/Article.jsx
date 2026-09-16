export default function AppliedDddCommonDddMistakesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Every article in this course has flagged mistakes local to its own pattern. This one
          steps back to the mistakes that show up across the whole adoption of DDD &mdash; the
          ones that undo strategic and tactical design even when every individual pattern was
          applied correctly in isolation.
        </p>
        <p>
          Cargoflow's own history includes each of these; they are drawn from what actually went
          wrong before the model this course has described was reached.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The recurring failure modes, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Applying DDD uniformly across a whole system.</b> The Core Domain and Generic
            Subdomains articles were explicit: heavy tactical modeling belongs on the core domain.
            Cargoflow initially over-modeled its generic notification subdomain with full
            aggregates and specifications it never needed.
          </li>
          <li>
            <b>Treating the ubiquitous language as a one-time deliverable instead of a living
            practice.</b> Cargoflow's glossary from the original discovery workshop went stale
            within three months because no one owned keeping it current against the evolving
            language article's guidance.
          </li>
          <li>
            <b>Drawing bounded context boundaries around teams instead of the domain.</b> An
            early attempt split Booking into two contexts purely because two teams wanted separate
            codebases &mdash; the contexts didn't correspond to any real domain distinction and
            were merged back within a quarter.
          </li>
          <li>
            <b>Letting anemic domain models survive under a DDD label.</b> Entities with only
            getters and setters, and all logic still living in service classes, are not tactical
            DDD just because the classes are named <code>Entity</code> and <code>Repository</code>.
          </li>
          <li>
            <b>Skipping domain experts after the initial workshop.</b> Treating the discovery
            workshop as a one-time event rather than an ongoing relationship, so the model drifts
            from reality as the business evolves.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 560 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="20" width="240" height="40" rx="6" />
            <text className="boxText" x="140" y="45" fontSize="11">Anemic model, DDD-labeled classes</text>
            <rect className="boxWarn" x="300" y="20" width="240" height="40" rx="6" />
            <text className="boxText" x="420" y="45" fontSize="11">Stale glossary</text>
            <rect className="boxWarn" x="20" y="80" width="240" height="40" rx="6" />
            <text className="boxText" x="140" y="105" fontSize="11">Contexts drawn around teams</text>
            <rect className="boxWarn" x="300" y="80" width="240" height="40" rx="6" />
            <text className="boxText" x="420" y="105" fontSize="11">DDD applied everywhere uniformly</text>
          </svg>
          <figcaption>Four independent failure modes, each capable of undoing correct pattern application elsewhere in the same system.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Spotting an anemic model wearing DDD's names</h2>
        <span className="codeLabel">JAVA &mdash; LOOKS LIKE DDD, ISN'T</span>
        <div className="codeBlock">
          <pre>{`public class Shipment { // "entity" in name only
    private ShipmentStatus status;
    public ShipmentStatus getStatus() { return status; }
    public void setStatus(ShipmentStatus status) { this.status = status; } // no rule enforced
}

// all business logic lives outside, in a service -- the actual tell
public class ShipmentService {
    public void deliver(Shipment s) {
        if (s.getStatus() != ShipmentStatus.IN_TRANSIT) throw new IllegalStateException();
        s.setStatus(ShipmentStatus.DELIVERED); // invariant enforced here, not in the entity
    }
}`}</pre>
        </div>
        <p>
          Compare this to <code>Shipment.markDelivered()</code> used throughout this course, which
          enforces its own transition rule internally &mdash; the difference is not naming, it is
          where the rule actually lives.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. How to catch these before they compound</h2>
        <ul>
          <li>
            <b>Audit tactical modeling effort against the Core Domain map periodically.</b> If a
            generic subdomain has more aggregate classes than the core domain, that ratio itself
            is the warning sign.
          </li>
          <li>
            <b>Assign explicit ownership of the ubiquitous language glossary, the way a codebase
            has a code owner.</b> A glossary with no owner reliably goes stale.
          </li>
          <li>
            <b>Ask "does this boundary correspond to a real domain distinction?" before splitting
            any context.</b> If the honest answer is "no, it's a team preference," that's a team
            topology decision, not a DDD one.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What is the actual difference between the anemic <code>Shipment</code> above and the <code>Shipment.markDelivered()</code> used throughout this course, given both have a class named <code>Shipment</code> with a status field?</p>
          <p>
            <b>Answer:</b> The rich model enforces its state-transition invariant inside the
            entity itself, so it is impossible to construct an invalid transition without going
            through <code>markDelivered()</code>. The anemic model exposes a public setter and
            enforces the same rule externally in a service, which means any other code path could
            bypass the check entirely &mdash; the naming is identical, the actual protection is not.
          </p>
        </div>
      </section>
      <p className="takeaway">
        The mistakes that undo DDD are rarely inside any single pattern &mdash; they are systemic:
        uniform effort across domains, a language no one maintains, boundaries drawn around teams
        instead of the domain, and models that borrow DDD's names without its discipline.
      </p>
    </div>
  );
}
