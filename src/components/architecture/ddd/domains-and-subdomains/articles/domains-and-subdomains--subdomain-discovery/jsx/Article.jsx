export default function DomainsAndSubdomainsSubdomainDiscoveryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Subdomain discovery is the practical exercise of taking the whole business domain and
          splitting it into named pieces, each of which can then be classified as core, supporting,
          or generic. This is where the previous three articles turn into an actual map of
          Cargoflow.
        </p>
        <p>
          The output is not a permanent org chart &mdash; it is a working list, revisited whenever
          the business shifts or a subdomain turns out more complex than expected.
        </p>
      </section>
      <section id="concepts">
        <h2>1. A discovery technique: follow the nouns and the money</h2>
        <ol className="stepList">
          <li>
            <b>List the major business capabilities.</b> Not features &mdash; capabilities.
            "Match shipments to carriers," "calculate pricing," "invoice customers," "resolve
            customer issues," "authenticate users."
          </li>
          <li>
            <b>Group capabilities that share vocabulary and change together.</b> "Calculate
            pricing" and "match shipments to carriers" both live inside routing/pricing logic and
            evolve together; group them.
          </li>
          <li>
            <b>Classify each group using the core/supporting/generic tests from the last three
            articles.</b>
          </li>
        </ol>
        <table className="miniTable">
          <caption>CARGOFLOW'S SUBDOMAIN MAP</caption>
          <thead><tr><th>Subdomain</th><th>Classification</th></tr></thead>
          <tbody>
            <tr><td>Route &amp; carrier optimization</td><td>Core</td></tr>
            <tr><td>Billing &amp; invoicing</td><td>Supporting</td></tr>
            <tr><td>Customer support case management</td><td>Supporting</td></tr>
            <tr><td>Authentication</td><td>Generic</td></tr>
            <tr><td>Transactional email</td><td>Generic</td></tr>
          </tbody>
        </table>
        <figure className="fig">
          <svg viewBox="0 0 600 190" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="560" height="60" rx="8" />
            <text className="figHint" x="300" y="45">Capabilities: match, price, invoice, resolve issues, authenticate, notify</text>
            <line className="flow" x1="300" y1="80" x2="300" y2="110" />
            <text className="figLabel" x="300" y="105">group by shared vocabulary + change rate</text>
            <rect className="boxWarn" x="20" y="120" width="150" height="50" rx="8" />
            <text className="boxText" x="95" y="150">Core: routing</text>
            <rect className="boxAccent" x="200" y="120" width="200" height="50" rx="8" />
            <text className="boxText" x="300" y="150">Supporting: billing, support</text>
            <rect className="box" x="430" y="120" width="150" height="50" rx="8" />
            <text className="boxText" x="505" y="150">Generic: auth, email</text>
          </svg>
          <figcaption>Discovery flows from capabilities, to grouped subdomains, to classification &mdash; not the reverse.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Encoding the map so it stays visible</h2>
        <p>
          Some teams keep the subdomain map as a comment near the top-level package structure, so
          it is impossible to miss while navigating the code:
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`/**
 * Subdomain map (revisit quarterly):
 *   core        -> routing        (com.cargoflow.routing)
 *   supporting  -> billing        (com.cargoflow.billing)
 *   supporting  -> support        (com.cargoflow.support)
 *   generic     -> auth, email    (external: Auth0, SendGrid)
 */
package com.cargoflow;`}</pre>
        </div>
        <p>
          Encoding the classification next to the package layout keeps a new engineer from
          accidentally over-investing in the support-case package or under-investing in routing.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Discovering subdomains from the existing codebase instead of the business.</b>{" "}
            Existing service boundaries often reflect old team structure, not the actual shape of
            the domain.
          </li>
          <li>
            <b>Treating the map as a one-time exercise.</b> A supporting subdomain can grow
            complex enough to warrant reclassification &mdash; revisit periodically.
          </li>
          <li>
            <b>Confusing "subdomain" with "bounded context."</b> Subdomains are a business-side
            classification; bounded contexts, covered next, are the software-side boundaries you
            choose &mdash; they often but not always align one-to-one.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Should subdomain discovery start from Cargoflow's existing microservice boundaries?</p>
          <p>
            <b>Answer:</b> No &mdash; it should start from business capabilities. Existing service
            boundaries may already be misaligned with the real domain, and starting there just
            preserves whatever mistakes are already in place.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Discover subdomains from business capabilities, not existing code, and keep the resulting
        map visible &mdash; it is the reference point every later strategic decision builds on.
      </p>
    </div>
  );
}
