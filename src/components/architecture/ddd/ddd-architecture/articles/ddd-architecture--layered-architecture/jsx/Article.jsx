export default function DddArchitectureLayeredArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Layered architecture separates a system into presentation, application, domain, and
          infrastructure layers, each depending only on the layer directly beneath it. This
          article looks at layered architecture specifically through the lens this whole course
          has built: does it protect a DDD domain model, or let it leak?
        </p>
        <p>
          The classic version allows the domain layer to depend downward on infrastructure. A
          DDD-friendly version inverts that one dependency, which is the seed of the next
          article's hexagonal architecture.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The four layers, and what each is allowed to know</h2>
        <ol className="stepList">
          <li>
            <b>Presentation.</b> Cargoflow's REST controllers. Knows about HTTP, JSON, and the
            application layer. Knows nothing about domain internals.
          </li>
          <li>
            <b>Application.</b> Orchestrates use cases &mdash; the <code>deliverShipment()</code>{" "}
            method from the Publishing Events article lives here. Knows the domain layer, manages
            transactions, has no business rules of its own.
          </li>
          <li>
            <b>Domain.</b> <code>Shipment</code>, <code>Leg</code>, <code>RouteOptimizer</code>{" "}
            &mdash; everything this course has built. Should know nothing about the other three
            layers at all.
          </li>
          <li>
            <b>Infrastructure.</b> <code>JpaShipmentRepository</code> from the Repositories
            article. Implements domain-layer interfaces; the domain never references it directly.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 300 220" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="60" y="20" width="180" height="45" rx="6" />
            <text className="boxText" x="150" y="47">Presentation</text>
            <rect className="box" x="60" y="75" width="180" height="45" rx="6" />
            <text className="boxText" x="150" y="102">Application</text>
            <rect className="boxWarn" x="60" y="130" width="180" height="45" rx="6" />
            <text className="boxText" x="150" y="157">Domain</text>
            <rect className="box" x="60" y="185" width="180" height="20" rx="6" />
            <text className="figHint" x="150" y="199">Infrastructure (implements domain interfaces)</text>
            <line className="flow" x1="150" y1="65" x2="150" y2="75" />
            <line className="flow" x1="150" y1="120" x2="150" y2="130" />
            <line className="flowMuted" x1="150" y1="175" x2="150" y2="185" />
          </svg>
          <figcaption>Dependencies point straight down, except at the domain/infrastructure line, where the arrow reverses (the next article's subject).</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Keeping the domain layer's dependencies clean</h2>
        <span className="codeLabel">JAVA &mdash; DOMAIN LAYER: ZERO INFRASTRUCTURE IMPORTS</span>
        <div className="codeBlock">
          <pre>{`package com.cargoflow.domain.booking;
// no javax.persistence, no org.springframework, no java.sql anywhere in this file
public final class Shipment {
    public void markDelivered(ProofOfDelivery pod) { /* pure domain logic */ }
}`}</pre>
        </div>
        <p>
          A useful test: run <code>grep</code> for framework imports inside the domain package.
          Cargoflow's build fails a dedicated architecture test the moment
          <code> com.cargoflow.domain</code> imports anything from <code>javax.persistence</code>{" "}
          or <code>org.springframework</code>.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting the domain layer depend on infrastructure "just this once," for
            convenience.</b> Each exception erodes the guarantee that the domain model can be
            tested and reasoned about without a database or framework running.
          </li>
          <li>
            <b>Putting business rules in the application layer instead of the domain layer.</b> If
            <code> deliverShipment()</code> in the application layer starts checking status
            transitions itself instead of calling <code>shipment.markDelivered()</code>, the rule
            has leaked out of the domain model.
          </li>
          <li>
            <b>Treating layered architecture as a folder structure with no enforcement.</b>{" "}
            Without an architecture test like Cargoflow's, layering is a convention that erodes
            under deadline pressure.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does Cargoflow enforce "no framework imports in the domain package" with an automated test rather than a code review guideline?</p>
          <p>
            <b>Answer:</b> A guideline can be missed or ignored under deadline pressure; an
            automated architecture test fails the build immediately, making the domain layer's
            independence from infrastructure a structural guarantee rather than a hoped-for norm.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Layered architecture protects a DDD domain model only when the domain layer stays
        genuinely ignorant of infrastructure &mdash; enforce that with a test, not just convention.
      </p>
    </div>
  );
}
