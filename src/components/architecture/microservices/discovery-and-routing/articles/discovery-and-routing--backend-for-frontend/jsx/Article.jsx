import "../css/Article.css";

export default function DiscoveryAndRoutingBackendForFrontendArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A Backend for Frontend is a dedicated gateway per client type &mdash; one for mobile, one
          for web, one for a partner API &mdash; instead of one shared gateway trying to satisfy all
          of them with a single, compromised response shape.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Different clients genuinely need different things from the same underlying services: a
          mobile app wants a small, battery-and-bandwidth-friendly payload; a web dashboard wants a
          richer, more detailed one; a partner API needs a stable, versioned contract that can't
          change on the partner's terms. A single shared gateway either serves everyone a compromise
          shape, or grows client-specific branches that make it fragile to change. A BFF per client
          type removes that tension: each owns its own aggregation logic and response shape,
          independently.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>MobileBFF</code> calls <code>OrderService</code> and returns a trimmed summary
          &mdash; order status and total only. <code>WebBFF</code> calls the same
          <code>OrderService</code> but also fetches full line-item details and a shipment map for a
          richer dashboard view. Both sit in front of the same internal services; each shapes the
          response for its one specific client.
        </p>
        <span className="codeLabel">SAME SERVICE, TWO DIFFERENT RESPONSE SHAPES</span>
        <div className="codeBlock">
          <pre>{`// MobileBFF -> { status: "shipped", total: 42.50 }
// WebBFF    -> { status: "shipped", total: 42.50, lineItems: [...],
//                shipment: { carrier, trackingUrl, mapCoordinates } }`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of two separate Backend for Frontend gateways, MobileBFF and WebBFF, each calling the same underlying OrderService but shaping the response differently for their own client." >
          <rect className="box" x="20" y="20" width="90" height="26" rx="5" />
          <text x="65" y="37" className="boxText" style={{fontSize:"6px"}}>Mobile app</text>
          <rect className="boxAccent" x="20" y="65" width="90" height="26" rx="5" />
          <text x="65" y="82" className="boxText" style={{fontSize:"6px"}}>MobileBFF</text>
          <rect className="box" x="20" y="105" width="90" height="20" rx="5" />
          <text x="65" y="118" className="figHint" style={{fontSize:"5px"}}>trimmed summary</text>

          <rect className="box" x="310" y="20" width="90" height="26" rx="5" />
          <text x="355" y="37" className="boxText" style={{fontSize:"6px"}}>Web dashboard</text>
          <rect className="boxAccent" x="310" y="65" width="90" height="26" rx="5" />
          <text x="355" y="82" className="boxText" style={{fontSize:"6px"}}>WebBFF</text>
          <rect className="box" x="300" y="105" width="110" height="20" rx="5" />
          <text x="355" y="118" className="figHint" style={{fontSize:"5px"}}>full details + map</text>

          <rect className="box" x="150" y="65" width="120" height="26" rx="5" />
          <text x="210" y="82" className="boxText" style={{fontSize:"6.5px"}}>OrderService</text>
          <line className="flow" x1="65" y1="46" x2="65" y2="63" />
          <line className="flow" x1="355" y1="46" x2="355" y2="63" />
          <line className="flow" x1="110" y1="78" x2="148" y2="78" />
          <line className="flow" x1="270" y1="78" x2="308" y2="78" />
        </svg>
        <figcaption>Same underlying OrderService, two independent BFFs shaping two very different responses for two different clients.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Adding a BFF for every conceivable client "just in case" creates more gateways to operate
          than the org actually has distinct client needs for &mdash; it's worth the split when
          client needs genuinely diverge, not by default. The other mistake is letting business logic
          that belongs in a real service leak into a BFF because "it's easier to add here" &mdash; a
          BFF should aggregate and reshape, not own business rules that other clients might need too.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>WebBFF and MobileBFF both call the same OrderService but return very different response shapes. Why doesn't OrderService need to know or care which BFF is calling it?</p>
        </div>
      </section>
      <p className="takeaway">
        Split the gateway when client needs genuinely diverge &mdash; a BFF per client type removes
        the tug-of-war a single shared gateway has to referee between mobile, web, and partner needs.
      </p>
    </div>
  );
}
