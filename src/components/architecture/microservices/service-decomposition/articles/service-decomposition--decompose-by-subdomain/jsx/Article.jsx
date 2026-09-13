import "../css/Article.css";

export default function ServiceDecompositionDecomposeBySubdomainArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Decomposing by subdomain starts from the domain model itself &mdash; the core problem the
          software solves &mdash; and asks which parts of that model are so distinct they deserve
          their own service, rather than starting from an org chart of business functions.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>Domain-Driven Design splits a domain into three kinds of subdomain:</p>
        <ul className="stepList">
          <li><b>Core subdomain</b> &mdash; the thing that actually differentiates the business; deserves the most investment and its own dedicated service.</li>
          <li><b>Supporting subdomain</b> &mdash; necessary, but not a differentiator; still usually worth its own service for isolation.</li>
          <li><b>Generic subdomain</b> &mdash; a solved problem (authentication, email delivery); often best bought or borrowed rather than built as a bespoke service.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          For a specialty coffee subscription business, <code>SubscriptionCurationService</code>
          (matching a customer's taste profile to a roast) is the core subdomain &mdash; it's the
          actual product. <code>SubscriptionBillingService</code> is supporting: necessary, not the
          differentiator. <code>AuthenticationService</code> is generic: nearly every company needs
          it, and it says nothing about coffee curation at all, so it's a strong candidate to run on
          a bought identity platform instead of custom code.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of three subdomain tiers for a coffee subscription business: core (curation), supporting (billing), and generic (authentication), each shown with a different visual weight matching how much custom investment it deserves.">
          <rect className="boxAccent" x="30" y="30" width="130" height="60" rx="8" />
          <text x="95" y="55" className="boxText" style={{fontSize:"7px"}}>Curation</text>
          <text x="95" y="70" className="figHint" style={{fontSize:"6px"}}>CORE &mdash; build deeply</text>
          <rect className="box" x="175" y="38" width="110" height="44" rx="7" />
          <text x="230" y="58" className="boxText" style={{fontSize:"6.5px"}}>Billing</text>
          <text x="230" y="71" className="figHint" style={{fontSize:"5.5px"}}>SUPPORTING</text>
          <rect className="box" x="300" y="45" width="100" height="32" rx="6" />
          <text x="350" y="62" className="boxText" style={{fontSize:"6px"}}>Auth</text>
          <text x="350" y="73" className="figHint" style={{fontSize:"5.5px"}}>GENERIC &mdash; buy it</text>
        </svg>
        <figcaption>Visual weight matches investment: core gets deep custom investment, supporting gets a normal service, generic is often better bought than built.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Spending as much design and engineering effort on a generic subdomain as on the core one is
          a classic waste &mdash; hand-rolling authentication rarely differentiates a coffee curation
          business, and every hour spent there is an hour not spent on the actual product. The
          opposite mistake is under-investing in the core subdomain's boundary because it feels
          "obvious" &mdash; the core subdomain is exactly where a wrong boundary is most expensive to
          fix later, since it's the part of the system that changes most often.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A team spends three months building a custom authentication service with the same care as their core recommendation engine. Using the core/supporting/generic framing, what's the likely mistake?</p>
        </div>
      </section>
      <p className="takeaway">
        Not every subdomain deserves equal investment &mdash; spend your best engineering time on
        the core subdomain, and don't be afraid to buy your way out of the generic ones.
      </p>
    </div>
  );
}
