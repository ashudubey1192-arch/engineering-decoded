export default function AggregatesBusinessInvariantsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A business invariant is a rule that must be true at the end of every operation on an
          aggregate, no exceptions. "A shipment's legs must always be contiguous &mdash; leg two
          must start where leg one ends" is a Cargoflow invariant. Protecting invariants like this
          is the entire reason aggregates exist as a pattern.
        </p>
        <p>
          This article is the practical technique: how to find real invariants, and how to code
          them so they cannot be silently violated.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Finding real invariants versus incidental validation</h2>
        <ol className="stepList">
          <li>
            <b>Ask "what would break the business if this were false?"</b> If legs were not
            contiguous, the shipment's tracked route would be physically nonsensical &mdash; a
            real invariant.
          </li>
          <li>
            <b>Ask whether it must hold at every moment, or just at submission.</b> "A field must
            not be blank" is often just input validation; "the total refunded can never exceed
            the amount originally paid" must hold forever, across every future operation.
          </li>
          <li>
            <b>Confirm it can be checked using only data inside one aggregate.</b> If checking it
            needs data from a second aggregate, it cannot be a hard, atomic invariant &mdash; see
            the Referencing Aggregates and Eventual Consistency articles for how cross-aggregate
            rules are handled instead.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>TWO INVARIANTS ON THE SAME AGGREGATE</small>
          <p>
            Cargoflow's <code>Shipment</code> enforces both "legs are contiguous" and "total leg
            distance does not exceed the contracted maximum." Every method that adds, removes, or
            reorders a leg re-checks both, every time &mdash; not just at creation.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="45" width="160" height="55" rx="8" />
            <text className="boxText" x="110" y="78">Any mutating method</text>
            <line className="flow" x1="190" y1="72" x2="260" y2="72" />
            <rect className="boxWarn" x="260" y="45" width="160" height="55" rx="8" />
            <text className="boxText" x="340" y="72">Re-check invariants</text>
            <line className="flow" x1="420" y1="72" x2="490" y2="72" />
            <rect className="boxAccent" x="490" y="45" width="80" height="55" rx="8" />
            <text className="boxText" x="530" y="78">Commit</text>
          </svg>
          <figcaption>Invariants are checked after every mutation, not just at construction &mdash; an aggregate must never be observable in an invalid state.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Enforcing both invariants on every mutation</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public final class Shipment {
    private final List<Leg> legs = new ArrayList<>();
    private final Distance contractedMaxDistance;

    void addLeg(Leg leg) {
        legs.add(leg);
        enforceInvariants();
    }

    private void enforceInvariants() {
        enforceContiguity();
        enforceMaxDistance();
    }

    private void enforceContiguity() {
        for (int i = 1; i < legs.size(); i++) {
            if (!legs.get(i - 1).endsWhere(legs.get(i).start())) {
                throw new IllegalStateException("Legs are not contiguous");
            }
        }
    }

    private void enforceMaxDistance() {
        Distance total = legs.stream().map(Leg::distance).reduce(Distance.ZERO, Distance::plus);
        if (total.exceeds(contractedMaxDistance)) {
            throw new IllegalStateException("Total leg distance exceeds contracted maximum");
        }
    }
}`}</pre>
        </div>
        <p>
          If either check fails, the exception propagates out of <code>addLeg</code> before the
          invalid state is ever committed &mdash; the aggregate cannot be persisted broken.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Checking an invariant only at creation, not on every later mutation.</b> A shipment
            valid at booking time can still become invalid if a later reroute is not checked too.
          </li>
          <li>
            <b>Enforcing invariants in a service class instead of the aggregate itself.</b> That
            makes the guarantee depend on every caller remembering to call the check &mdash; the
            aggregate should make violation structurally impossible, not just discouraged.
          </li>
          <li>
            <b>Treating every field-level validation as a business invariant.</b> Not everything
            worth checking rises to the level covered in this article; see step 2 of the process
            above.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>enforceInvariants()</code> run inside <code>addLeg()</code> itself, rather than being called separately by whoever calls <code>addLeg()</code>?</p>
          <p>
            <b>Answer:</b> If the check lived outside the aggregate, every caller would have to
            remember to call it, and a single forgotten call anywhere in the codebase could leave
            an invalid shipment persisted. Enforcing it inside the method makes violation
            structurally impossible.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A real invariant must hold after every operation, forever, checkable from data inside one
        aggregate &mdash; enforce it inside the aggregate itself, not in a caller.
      </p>
    </div>
  );
}
