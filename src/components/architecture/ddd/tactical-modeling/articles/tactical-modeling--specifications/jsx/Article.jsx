export default function TacticalModelingSpecificationsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A specification packages a business rule that decides whether an object satisfies some
          condition, as its own named, reusable object &mdash; instead of scattering the same
          boolean expression across query filters, validation code, and in-memory checks.
          Cargoflow's <code>RefrigerationCapableSpecification</code> is used identically whether
          it is filtering a database query or checking a single carrier in memory.
        </p>
        <p>
          It is a narrower tool than a domain service: a specification answers one yes/no
          question about one object, nothing more.
        </p>
      </section>
      <section id="concepts">
        <h2>1. When a rule deserves to become a specification</h2>
        <ol className="stepList">
          <li>
            <b>The same yes/no rule is checked in more than one place.</b> "Is this carrier
            refrigeration-capable and within its weekly capacity?" is checked both when
            filtering candidates and when validating a manual override.
          </li>
          <li>
            <b>The rule is complex enough that inlining it twice risks the two copies drifting
            apart.</b> A single change to the eligibility rule should not require finding every
            copy.
          </li>
          <li>
            <b>The rule needs to run both in application code and, ideally, as a database
            query.</b> A specification that can translate into both keeps the two representations
            provably consistent.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 580 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="220" y="20" width="200" height="50" rx="8" />
            <text className="boxText" x="320" y="50">RefrigerationCapableSpecification</text>
            <line className="flow" x1="270" y1="70" x2="130" y2="110" />
            <line className="flow" x1="370" y1="70" x2="470" y2="110" />
            <rect className="box" x="40" y="110" width="180" height="45" rx="8" />
            <text className="boxText" x="130" y="137">In-memory check</text>
            <rect className="box" x="380" y="110" width="180" height="45" rx="8" />
            <text className="boxText" x="470" y="137">Database query filter</text>
          </svg>
          <figcaption>One specification object, two usage sites &mdash; the rule cannot drift because there is only one definition of it.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A specification used both in memory and as a query</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`public interface Specification<T> {
    boolean isSatisfiedBy(T candidate);
}

public final class RefrigerationCapableSpecification implements Specification<Carrier> {
    private final CargoType cargoType;

    public boolean isSatisfiedBy(Carrier carrier) {
        return !cargoType.requiresRefrigeration() || carrier.supportsRefrigeration();
    }
}

// Usage 1: filtering an in-memory list
List<Carrier> eligible = allCarriers.stream()
    .filter(spec::isSatisfiedBy)
    .toList();

// Usage 2: the same rule, expressed for the repository's query layer
List<Carrier> eligibleFromDb = carrierRepository.matching(spec);`}</pre>
        </div>
        <p>
          The rule &mdash; refrigeration capability required when the cargo type demands it
          &mdash; exists in exactly one place, referenced by both the in-memory filter and the
          repository query.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Introducing a specification for a rule checked in exactly one place.</b> A
            single-use boolean expression is simpler left inline; specifications pay off through
            reuse.
          </li>
          <li>
            <b>Letting the in-memory and query versions of the same rule drift apart.</b> If the
            specification only translates to a query "close enough," the two representations can
            silently disagree on edge cases.
          </li>
          <li>
            <b>Overusing specifications for logic that should be a domain service.</b> A
            specification answers a yes/no question about one object; anything that needs to
            coordinate multiple objects or produce a result belongs elsewhere.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What problem does packaging the refrigeration rule as a specification solve that inlining it twice would not?</p>
          <p>
            <b>Answer:</b> It guarantees the in-memory check and the database query filter can
            never silently drift apart, since both reference the same single definition of the
            rule instead of two hand-written copies.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for a specification when a yes/no business rule is checked in more than one place
        &mdash; it keeps every usage provably consistent with a single definition.
      </p>
    </div>
  );
}
