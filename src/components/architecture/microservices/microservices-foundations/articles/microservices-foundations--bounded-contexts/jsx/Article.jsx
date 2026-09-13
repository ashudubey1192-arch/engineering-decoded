import "../css/Article.css";

export default function MicroservicesFoundationsBoundedContextsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A bounded context is the boundary within which a business term has exactly one meaning
          &mdash; step outside it, and the same word can (and often should) mean something else
          entirely, modeled by a completely different service.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Domain-Driven Design calls the underlying idea a "ubiquitous language": inside one
          context, a term like <code>Product</code> has one precise, shared meaning used
          consistently in conversation and in code. The mistake bounded contexts prevent is forcing
          one canonical, do-everything <code>Product</code> class that every service imports and
          extends &mdash; that class accumulates fields for every context's needs and becomes
          something no single team actually understands end to end.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          In <code>CatalogService</code>, a <code>Product</code> means a page: title, description,
          images, price. In <code>ShippingService</code>, a <code>Product</code> means a
          physical parcel: weight, dimensions, fragility flag. Neither definition is more "correct"
          &mdash; they're both right, inside their own context. When <code>ShippingService</code>
          needs a product's catalog title for a packing slip, it doesn't import
          <code>CatalogService</code>'s model; it asks for exactly the field it needs and translates
          the answer into its own local shape.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram of two bounded contexts, Catalog and Shipping, each with its own local definition of Product, connected by a translation step rather than a single shared Product model.">
          <rect className="boxAccent" x="20" y="35" width="150" height="70" rx="8" />
          <text x="95" y="55" className="boxText" style={{fontSize:"7.5px"}}>Catalog context</text>
          <text x="95" y="72" className="figHint" style={{fontSize:"6px"}}>Product = title, images,</text>
          <text x="95" y="84" className="figHint" style={{fontSize:"6px"}}>description, price</text>

          <rect className="boxAccent" x="270" y="35" width="150" height="70" rx="8" />
          <text x="345" y="55" className="boxText" style={{fontSize:"7.5px"}}>Shipping context</text>
          <text x="345" y="72" className="figHint" style={{fontSize:"6px"}}>Product = weight, dims,</text>
          <text x="345" y="84" className="figHint" style={{fontSize:"6px"}}>fragility flag</text>

          <rect className="box" x="185" y="55" width="70" height="30" rx="6" />
          <text x="220" y="73" className="figHint" style={{fontSize:"6px"}}>translate</text>
          <line className="flow" x1="170" y1="70" x2="185" y2="70" />
          <line className="flow" x1="255" y1="70" x2="270" y2="70" />
        </svg>
        <figcaption>Each context keeps its own local model of "Product"; a translation step, not a shared class, connects them.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Building one shared "core" library with a single canonical <code>Product</code>,
          <code>Customer</code>, or <code>Order</code> class that every service depends on is the
          classic anti-pattern here &mdash; it reintroduces a shared-schema coupling that bounded
          contexts exist specifically to remove, and it means no one service can evolve its view of
          that concept without a coordinated change everywhere else. The second mistake is assuming
          a shared name always means a shared context; "Customer" in <code>SupportService</code>
          (someone with open tickets) and "Customer" in <code>BillingService</code> (someone with a
          payment method on file) are different concepts that happen to share an English word.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>CatalogService and ShippingService both have a "Product" concept with different fields. A new engineer proposes merging them into one shared Product class imported by both services. What problem does bounded-context thinking say this reintroduces?</p>
        </div>
      </section>
      <p className="takeaway">
        Let the same word mean different things in different contexts on purpose &mdash; translate
        at the boundary instead of forcing one shared model to serve every service's needs at once.
      </p>
    </div>
  );
}
