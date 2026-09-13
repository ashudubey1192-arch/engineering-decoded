import "../css/Article.css";

export default function ResilienceGracefulDegradationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Graceful degradation means deciding, ahead of time, which parts of a response are
          essential and which are merely nice-to-have &mdash; so that a non-critical dependency
          being down costs you that one feature, not the whole page.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Every response is built from pieces of varying importance. The essential pieces must
          succeed or the whole response should fail; the optional pieces get a sensible fallback
          &mdash; a cached value, a default, or simply being omitted &mdash; if their dependency is
          unavailable. The discipline is deciding this classification in advance, per piece, rather
          than treating every dependency as equally critical by default.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A product page needs the product's price and description (essential &mdash;
          <code>PricingService</code> and <code>CatalogService</code>) but only wants
          personalized recommendations if <code>RecommendationsService</code> happens to be
          available. When <code>RecommendationsService</code> is down, the page still renders fully,
          just without a recommendations section, instead of showing an error page for a completely
          unrelated missing feature.
        </p>
        <span className="codeLabel">FALLBACK FOR A NON-ESSENTIAL DEPENDENCY</span>
        <div className="codeBlock">
          <pre>{`const [price, description] = await Promise.all([
  pricingService.getPrice(id),      // essential: let this throw
  catalogService.getDescription(id) // essential: let this throw
])
const recommendations = await recommendationsService.get(id)
  .catch(() => [])   // optional: fall back to an empty list, don't fail the page`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a product page built from essential pricing and description sections that must succeed, and an optional recommendations section that falls back to being empty when its dependency is unavailable, without failing the rest of the page.">
          <rect className="boxAccent" x="20" y="20" width="380" height="26" rx="6" />
          <text x="210" y="37" className="boxText" style={{fontSize:"7px"}}>Product page</text>
          <rect className="box" x="30" y="60" width="120" height="30" rx="6" />
          <text x="90" y="79" className="boxText" style={{fontSize:"6.5px"}}>Price (essential)</text>
          <rect className="box" x="165" y="60" width="140" height="30" rx="6" />
          <text x="235" y="79" className="boxText" style={{fontSize:"6.5px"}}>Description (essential)</text>
          <rect className="boxWarn" x="320" y="60" width="80" height="30" rx="6" />
          <text x="360" y="75" className="boxText" style={{fontSize:"5.5px"}}>Recs</text>
          <text x="360" y="87" className="figHint" style={{fontSize:"5px"}}>(optional)</text>
          <line className="flow" x1="210" y1="46" x2="210" y2="58" />
          <text x="210" y="110" className="figHint" style={{fontSize:"6px"}}>page still renders fully if only Recs is down</text>
        </svg>
        <figcaption>Essential sections must succeed for the page to render at all; the optional section degrades to empty on its own, without taking the page down with it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Not deciding essential-vs-optional in advance means the classification effectively happens
          by accident, during an incident, under pressure &mdash; usually the worst possible time to
          make that call correctly. The other common mistake is a "graceful" fallback that's
          actually silently wrong (showing a stale cached price instead of omitting the price
          section) &mdash; degrading gracefully means being honest about what's missing, not hiding
          it behind data that might no longer be accurate.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is deciding which page sections are "essential" versus "optional" ahead of time better than making that call during a live incident?</p>
        </div>
      </section>
      <p className="takeaway">
        Decide in advance what's essential and what's optional for every response &mdash; that's
        what turns "a dependency is down" into a smaller, contained problem instead of a full outage.
      </p>
    </div>
  );
}
