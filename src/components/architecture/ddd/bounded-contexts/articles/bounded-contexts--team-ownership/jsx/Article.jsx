export default function BoundedContextsTeamOwnershipArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Conway's Law says a system's structure mirrors the communication structure of the
          organization that built it. DDD's practical response is to embrace this deliberately:
          align one team with one bounded context, instead of fighting the law and losing.
        </p>
        <p>
          At Cargoflow, each of the four bounded contexts &mdash; Booking, Fleet &amp; Routing,
          Billing, Support &mdash; has exactly one team that owns its model end to end.
        </p>
      </section>
      <section id="concepts">
        <h2>1. What "one team owns one context" actually means</h2>
        <div className="twoCol">
          <div>
            <h3>In scope for the owning team</h3>
            <p>
              The team decides the model's shape, reviews all changes to it, sets its own release
              cadence, and is the required approver on the shared-kernel or context-map changes
              that touch it.
            </p>
          </div>
          <div>
            <h3>Out of scope, even for the owning team</h3>
            <p>
              Reaching directly into another context's database or internal classes &mdash; even
              the Fleet &amp; Routing team cannot bypass Booking's public interface, despite being
              upstream.
            </p>
          </div>
        </div>
        <div className="scenarioBox">
          <small>A REAL CONWAY'S LAW FAILURE AT CARGOFLOW</small>
          <p>
            Before this alignment, one shared "platform team" owned both Booking's and Billing's
            database schemas. Every schema change required cross-team sign-off regardless of which
            context it actually affected, and the <code>Shipment</code> table slowly accumulated
            billing-only columns nobody wanted to own. Splitting ownership by context fixed both
            problems at once.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 600 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="20" y="30" width="130" height="60" rx="8" />
            <text className="boxText" x="85" y="65">Booking team</text>
            <rect className="boxAccent" x="180" y="30" width="130" height="60" rx="8" />
            <text className="boxText" x="245" y="65">Routing team</text>
            <rect className="boxAccent" x="340" y="30" width="130" height="60" rx="8" />
            <text className="boxText" x="405" y="65">Billing team</text>
            <rect className="boxAccent" x="470" y="30" width="110" height="60" rx="8" />
            <text className="boxText" x="525" y="65">Support team</text>
            <line className="divider" x1="20" y1="105" x2="580" y2="105" />
            <text className="boxText" x="85" y="130">Booking</text>
            <text className="boxText" x="245" y="130">Fleet &amp; Routing</text>
            <text className="boxText" x="405" y="130">Billing</text>
            <text className="boxText" x="525" y="130">Support</text>
            <text className="figHint" x="300" y="155">one team per context, aligned one-to-one</text>
          </svg>
          <figcaption>Team structure and bounded-context structure are drawn as the same lines, deliberately.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Ownership, expressed as a code-review rule</h2>
        <span className="codeLabel">YAML &mdash; CODEOWNERS (enforces the team boundary in the PR workflow)</span>
        <div className="codeBlock">
          <pre>{`/src/main/java/com/cargoflow/booking/   @cargoflow/booking-team
/src/main/java/com/cargoflow/routing/   @cargoflow/routing-team
/src/main/java/com/cargoflow/billing/   @cargoflow/billing-team
/src/main/java/com/cargoflow/support/   @cargoflow/support-team
/src/main/java/com/cargoflow/shared/    @cargoflow/booking-team @cargoflow/billing-team`}</pre>
        </div>
        <p>
          The shared kernel row requires both teams as reviewers, matching the joint-governance
          rule from the Shared Kernel article &mdash; ownership rules and strategic-design
          patterns reinforce each other.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>One team owning multiple unrelated contexts "for efficiency."</b> It reintroduces
            exactly the tangled, jointly-owned model the split was meant to avoid.
          </li>
          <li>
            <b>Multiple teams owning one context.</b> Without a single accountable team, the model
            drifts toward whoever touched it last, not toward a coherent design.
          </li>
          <li>
            <b>Ignoring team structure when drawing new context boundaries.</b> A boundary that
            requires two teams to jointly edit the same package every sprint is fighting Conway's
            Law instead of using it.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Can the Fleet &amp; Routing team, being upstream of Booking, edit Booking's internal classes directly to add a feature faster?</p>
          <p>
            <b>Answer:</b> No. Even an upstream team must go through Booking's public interface;
            direct edits to another context's internals break the ownership boundary regardless of
            which direction the context map's arrows point.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Align one team with one bounded context and enforce it in your review process &mdash;
        fighting Conway's Law costs more than designing with it.
      </p>
    </div>
  );
}
