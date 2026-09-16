export default function StrategicDesignContextMappingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A context map is a diagram and a set of named relationships describing how Cargoflow's
          bounded contexts depend on each other. Drawing boundaries (the previous article) answers
          "where do contexts start and stop." Context mapping answers "how do they talk, and who
          has the power in that relationship."
        </p>
        <p>
          The five relationship patterns covered later in this section &mdash; Partnership, Shared
          Kernel, Customer/Supplier, Conformist, and Anti-Corruption Layer &mdash; are the
          vocabulary a context map is built from.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Reading Cargoflow's context map</h2>
        <p>
          Each connection on the map names both the relationship type and the direction of
          influence &mdash; who upstream can change without asking, and who downstream must react.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 640 260" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="30" width="150" height="60" rx="8" />
            <text className="boxText" x="105" y="64">Booking</text>
            <rect className="boxWarn" x="250" y="30" width="150" height="60" rx="8" />
            <text className="boxText" x="325" y="64">Fleet &amp; Routing</text>
            <rect className="boxAccent" x="470" y="30" width="150" height="60" rx="8" />
            <text className="boxText" x="545" y="64">Billing</text>
            <rect className="boxAccent" x="250" y="180" width="150" height="60" rx="8" />
            <text className="boxText" x="325" y="214">Support</text>
            <line className="flow" x1="180" y1="60" x2="250" y2="60" />
            <text className="figHint" x="215" y="45">customer/supplier</text>
            <line className="flow" x1="400" y1="60" x2="470" y2="60" />
            <text className="figHint" x="435" y="45">published language</text>
            <line className="flowMuted" x1="325" y1="90" x2="325" y2="180" />
            <text className="figHint" x="360" y="140">ACL</text>
          </svg>
          <figcaption>Fleet &amp; Routing supplies Booking with capacity; Booking publishes a stable event language to Billing; Support consumes Fleet &amp; Routing data through an anti-corruption layer.</figcaption>
        </figure>
        <div className="scenarioBox">
          <small>WHY THE DIRECTION MATTERS</small>
          <p>
            Fleet &amp; Routing is upstream of Booking: when the routing team changes their
            capacity model, Booking has to adapt, not the reverse. Knowing this in advance &mdash;
            not discovering it during an incident &mdash; is the entire point of drawing the map.
          </p>
        </div>
      </section>
      <section id="example">
        <h2>2. Encoding the map as living documentation</h2>
        <span className="codeLabel">MARKDOWN &mdash; docs/context-map.md (kept next to the code, reviewed like code)</span>
        <div className="codeBlock">
          <pre>{`## Booking -> Fleet & Routing: Customer/Supplier
Booking depends on Fleet & Routing's capacity API. Fleet & Routing plans
breaking changes with Booking's team before shipping.

## Booking -> Billing: Published Language
Booking publishes ShipmentDelivered events with a versioned schema.
Billing never queries Booking's database directly.

## Support -> Fleet & Routing: Anti-Corruption Layer
Support reads routing data through a translation layer so routing's
internal model changes never ripple into Support's case objects.`}</pre>
        </div>
        <p>
          Keeping the map as reviewed markdown next to the code, rather than a diagram in a wiki
          nobody updates, is what keeps it trustworthy months later.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Drawing the map once and never updating it.</b> A context map that does not match
            reality is worse than no map &mdash; it actively misleads.
          </li>
          <li>
            <b>Omitting the relationship type, just drawing arrows.</b> "Booking talks to Billing"
            says nothing about who can break whom; the relationship pattern is the useful part.
          </li>
          <li>
            <b>Mapping only the happy-path dependencies.</b> The Support &rarr; Fleet &amp;
            Routing anti-corruption layer above exists because that dependency was originally
            unmapped and caused a production incident.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What does it mean that Fleet &amp; Routing is "upstream" of Booking on the context map?</p>
          <p>
            <b>Answer:</b> Fleet &amp; Routing can change its model with less obligation to
            coordinate, while Booking is expected to adapt to those changes &mdash; the influence
            flows from upstream to downstream, not the reverse.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A context map names both the connections between bounded contexts and the direction of
        influence &mdash; keep it as living documentation, not a one-time diagram.
      </p>
    </div>
  );
}
