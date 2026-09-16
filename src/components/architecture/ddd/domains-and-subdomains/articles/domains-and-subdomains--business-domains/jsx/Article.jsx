export default function DomainsAndSubdomainsBusinessDomainsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A domain, in DDD, is the sphere of knowledge and activity the software is built to
          support &mdash; not a folder in the codebase. Cargoflow's domain is "freight logistics":
          booking cargo space, routing shipments, billing customers, and supporting the humans
          involved when something goes wrong.
        </p>
        <p>
          Before drawing any bounded context, it helps to describe the whole domain at this level
          &mdash; wide and shallow &mdash; so later, narrower decisions have a map to sit inside.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The domain is bigger than the software</h2>
        <p>
          Cargoflow's domain includes things no Java class will ever represent directly: customs
          regulations, carrier relationships built over years, the physical reality of trucks and
          ships. The software models a useful slice of that domain, never the whole thing.
        </p>
        <div className="scenarioBox">
          <small>DESCRIBING CARGOFLOW'S DOMAIN</small>
          <p>
            "Freight logistics: matching shippers who need cargo moved with carriers who have
            capacity, tracking that cargo from pickup to delivery, handling the money and the
            exceptions along the way." One sentence, no class names &mdash; and already broad
            enough to contain everything the next few articles will subdivide.
          </p>
        </div>
        <p>
          The next section breaks this single domain into subdomains &mdash; core, supporting, and
          generic &mdash; because not every part of "freight logistics" deserves the same
          engineering investment.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 560 190" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="40" y="30" width="480" height="130" rx="12" />
            <text className="figLabel" x="280" y="55">CARGOFLOW'S DOMAIN: FREIGHT LOGISTICS</text>
            <circle className="ringNode" cx="140" cy="105" r="6" />
            <text className="boxText" x="140" y="130">Booking</text>
            <circle className="ringNode" cx="260" cy="105" r="6" />
            <text className="boxText" x="260" y="130">Routing</text>
            <circle className="ringNode" cx="380" cy="105" r="6" />
            <text className="boxText" x="380" y="130">Billing</text>
            <circle className="ringNode" cx="470" cy="105" r="6" />
            <text className="boxText" x="470" y="130">Support</text>
          </svg>
          <figcaption>The domain is the whole sphere; subdomains (next article) are how it gets divided for modeling.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A domain description, made concrete</h2>
        <p>
          It helps to write the domain description as a comment at the top of a package, kept
          intentionally free of implementation detail:
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`/**
 * Domain: Freight Logistics.
 *
 * Matches shippers who need cargo moved with carriers who have capacity,
 * tracks cargo from pickup to delivery across one or more legs, and
 * handles pricing, billing, and customer support for exceptions along
 * the way. This package tree implements a useful slice of that domain,
 * not the domain itself -- see docs/context-map.md for how the slice
 * is divided into bounded contexts.
 */
package com.cargoflow.domain;`}</pre>
        </div>
        <p>
          Keeping this description at the root, and revisiting it when the business changes, keeps
          later subdomain and bounded-context decisions traceable back to one shared understanding
          of what Cargoflow actually does.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Describing the domain in terms of the software.</b> "The domain is our shipment
            microservices" gets the direction backwards &mdash; the domain exists independent of
            any particular software decomposition.
          </li>
          <li>
            <b>Skipping this step and jumping to bounded contexts.</b> Without a shared, whole-
            domain description first, teams draw context boundaries based on team structure or
            existing code rather than the business itself.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Is "our three microservices: booking-svc, billing-svc, and routing-svc" a description of Cargoflow's domain?</p>
          <p>
            <b>Answer:</b> No &mdash; that describes the current software decomposition. The
            domain is the underlying business (freight logistics) that would still exist even if
            it were split into different services tomorrow.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Describe the domain in plain business language before touching software boundaries
        &mdash; the domain is the territory; bounded contexts are how you choose to map it.
      </p>
    </div>
  );
}
