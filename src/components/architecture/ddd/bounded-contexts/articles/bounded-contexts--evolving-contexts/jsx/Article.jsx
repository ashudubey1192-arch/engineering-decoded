export default function BoundedContextsEvolvingContextsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Splitting (previous article) is one way contexts evolve. Contexts also merge, change
          relationship type on the context map, or quietly shift which subdomain they support.
          This article covers the full range of evolution and how to manage it without breaking
          the neighbors that depend on a context's model.
        </p>
        <p>
          The core discipline is the same across every kind of change: never let a context's
          internal evolution become a surprise to the teams downstream of it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Four ways a context evolves</h2>
        <div className="twoCol">
          <div>
            <h3>Splits</h3>
            <p>Covered in the previous article &mdash; one context becomes two as internal divergence grows.</p>
          </div>
          <div>
            <h3>Merges</h3>
            <p>
              Two contexts that never actually diverged in practice get folded back into one,
              reducing coordination overhead that was not buying anything.
            </p>
          </div>
          <div>
            <h3>Relationship changes</h3>
            <p>
              Booking and Fleet &amp; Routing moved from Partnership to Customer/Supplier once
              their joint design phase ended &mdash; the contexts themselves did not change shape,
              only how they relate.
            </p>
          </div>
          <div>
            <h3>Reclassification</h3>
            <p>
              If Billing ever became a genuine competitive differentiator (say, Cargoflow builds
              uniquely flexible financing terms), its subdomain classification and investment
              level would need to rise with it.
            </p>
          </div>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 600 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="55" width="150" height="50" rx="8" />
            <text className="boxText" x="105" y="85">Split</text>
            <rect className="boxAccent" x="200" y="55" width="150" height="50" rx="8" />
            <text className="boxText" x="275" y="85">Merge</text>
            <rect className="boxAccent" x="370" y="55" width="150" height="50" rx="8" />
            <text className="boxText" x="445" y="85">Relationship change</text>
            <rect className="boxAccent" x="530" y="55" width="60" height="50" rx="8" />
            <text className="boxText" x="560" y="85">&hellip;</text>
            <text className="figHint" x="300" y="135">all require updating the context map before, not after</text>
          </svg>
          <figcaption>Every evolution path shares one rule: the context map changes on purpose, in advance, not as an afterthought.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Announcing an evolution as a versioned contract change</h2>
        <span className="codeLabel">JAVA &mdash; SIGNALING A RELATIONSHIP CHANGE IN THE API ITSELF</span>
        <div className="codeBlock">
          <pre>{`/**
 * v2: Booking -> Fleet & Routing relationship changed from Partnership to
 * Customer/Supplier as of 2026-06. Breaking changes now go through the
 * negotiated release process documented in context-map.md, not joint
 * same-sprint releases.
 */
public interface CapacityLookupV2 {
    List<CarrierCapacity> availableCapacity(Route route, CargoType cargoType);
}`}</pre>
        </div>
        <p>
          Recording the relationship change directly next to the interface it governs keeps the
          context map's claims verifiable against the actual code, not just a diagram someone
          might forget to update.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting a relationship change happen silently.</b> If Booking notices, after the
            fact, that Fleet &amp; Routing stopped joint-planning, trust between the teams erodes
            even if the new relationship pattern is objectively fine.
          </li>
          <li>
            <b>Merging contexts to reduce short-term friction without confirming they never
            diverged.</b> A premature merge just recreates the tangled model the split was meant
            to prevent.
          </li>
          <li>
            <b>Treating the context map as historical record instead of current truth.</b> An
            out-of-date map actively misleads the next engineer who trusts it.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Booking and Fleet &amp; Routing moved from Partnership to Customer/Supplier. Did either context's internal model need to change for this?</p>
          <p>
            <b>Answer:</b> Not necessarily &mdash; a relationship-type change affects how the two
            contexts coordinate and who has planning influence, not each context's internal shape.
            The two kinds of evolution are independent.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Contexts evolve in more ways than splitting &mdash; whatever the change, update the
        context map on purpose and in advance, so no downstream team is ever surprised by it.
      </p>
    </div>
  );
}
