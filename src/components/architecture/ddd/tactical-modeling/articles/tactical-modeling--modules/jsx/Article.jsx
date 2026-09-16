export default function TacticalModelingModulesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A module (a Java package, in practice) groups domain concepts that belong together
          conceptually &mdash; the smallest-scale organizational tool in tactical DDD, one level
          below a bounded context. Cargoflow's Booking context has separate modules for shipment
          lifecycle and pricing input, even though both live in the same deployable.
        </p>
        <p>
          Modules are about low coupling and high cohesion applied to package structure, using the
          same ubiquitous language that names everything else in the model.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Naming and organizing modules from the language, not the layer</h2>
        <ol className="stepList">
          <li>
            <b>Name packages after domain concepts, not technical roles.</b>{" "}
            <code>com.cargoflow.booking.shipment</code>, not{" "}
            <code>com.cargoflow.entities</code> or <code>com.cargoflow.services</code>.
          </li>
          <li>
            <b>Keep a module's classes highly interdependent, and dependencies between modules
            deliberately sparse.</b> If two modules constantly reach into each other, they were
            probably one module drawn as two.
          </li>
          <li>
            <b>Let module boundaries mirror ubiquitous language clusters.</b> The same clustering
            technique from the Splitting Contexts article, applied one level down.
          </li>
        </ol>
        <div className="twoCol">
          <div>
            <h3>Package by domain concept</h3>
            <p>
              <code>booking/shipment</code>, <code>booking/pricing</code> &mdash; opening either
              package shows you everything about that concept in one place.
            </p>
          </div>
          <div>
            <h3>Package by technical layer</h3>
            <p>
              <code>controllers</code>, <code>services</code>, <code>repositories</code> &mdash;
              understanding one concept means jumping across three unrelated packages.
            </p>
          </div>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="30" width="220" height="110" rx="10" />
            <text className="figLabel" x="140" y="55">booking.shipment</text>
            <text className="boxText" x="140" y="85">Shipment, Leg, ShipmentId</text>
            <text className="boxText" x="140" y="107">ShipmentRepository</text>
            <rect className="boxAccent" x="320" y="30" width="220" height="110" rx="10" />
            <text className="figLabel" x="430" y="55">booking.pricing</text>
            <text className="boxText" x="430" y="85">Quote, RateCard</text>
            <text className="boxText" x="430" y="107">QuoteRepository</text>
          </svg>
          <figcaption>Each module is dense internally and loosely connected to its neighbor &mdash; the goal of good module design.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A module boundary expressed as package-private visibility</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`package com.cargoflow.booking.shipment;

public final class Shipment { /* public: this is the module's public API */ }

final class ShipmentValidation { /* package-private: internal to this module only */
    static void checkRouteIsContiguous(Route route) { /* ... */ }
}`}</pre>
        </div>
        <p>
          <code>ShipmentValidation</code> has no public modifier, so code in
          <code> booking.pricing</code> physically cannot reference it &mdash; the module
          boundary is enforced by the Java compiler itself, at zero extra cost.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Organizing packages by technical layer instead of domain concept.</b> This is the
            most common structural mistake in Java codebases and the one modules specifically
            exist to correct.
          </li>
          <li>
            <b>Marking everything public "to avoid friction."</b> That throws away the compiler's
            free enforcement of the module boundary shown above.
          </li>
          <li>
            <b>Letting modules grow without limit instead of splitting them.</b> The same
            divergence signals from the Splitting Contexts article apply at module scale too.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>ShipmentValidation</code> have no access modifier instead of being <code>public</code>?</p>
          <p>
            <b>Answer:</b> It is an internal detail of the <code>booking.shipment</code> module.
            Package-private visibility lets the Java compiler enforce the module boundary directly
            &mdash; other modules simply cannot reference it, with no discipline required.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Organize packages around domain concepts, keep each module's classes tightly related, and
        use visibility modifiers to make the boundary enforceable, not just documented.
      </p>
    </div>
  );
}
