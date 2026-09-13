import "../css/Article.css";

export default function ServiceCommunicationSynchronousCommunicationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Synchronous communication means the caller blocks, waiting on the line, until the callee
          answers &mdash; simple to reason about, but it makes the caller's own availability
          dependent on the callee's, for as long as the call takes.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A synchronous call &mdash; a REST request, a gRPC call &mdash; ties up a thread or
          connection on the caller's side until a response (or a timeout) arrives. That gives you an
          immediate answer and a straightforward mental model: call, wait, get a result, continue.
          The cost is coupling in time: if the callee is slow, the caller is slow; if the callee is
          down, the caller's request fails too, unless it has a fallback.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>CheckoutService</code> calls <code>PricingService</code> synchronously to get a
          final price before showing the order summary &mdash; that's the right call here, because
          the checkout page genuinely cannot render without a real-time price.
        </p>
        <span className="codeLabel">HTTP REQUEST / RESPONSE</span>
        <div className="codeBlock">
          <pre>{`POST /pricing/quote HTTP/1.1
Content-Type: application/json
{ "itemIds": ["sku_1842"], "customerId": "c_991" }

HTTP/1.1 200 OK
{ "total": 42.50, "currency": "USD" }`}</pre>
        </div>
        <p>
          The request thread in <code>CheckoutService</code> is blocked for the full round trip
          &mdash; typically tens of milliseconds, but every millisecond <code>PricingService</code>
          takes is a millisecond added directly to the customer's checkout page load.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 120" role="img" aria-label="Sequence diagram of a synchronous call: CheckoutService sends a request and blocks, waiting, until PricingService responds before continuing.">
          <rect className="box" x="30" y="20" width="100" height="24" rx="5" />
          <text x="80" y="36" className="boxText" style={{fontSize:"6.5px"}}>CheckoutService</text>
          <rect className="box" x="270" y="20" width="100" height="24" rx="5" />
          <text x="320" y="36" className="boxText" style={{fontSize:"6.5px"}}>PricingService</text>
          <line className="flow" x1="130" y1="50" x2="270" y2="50" />
          <text x="200" y="46" className="figHint" style={{fontSize:"6px"}}>quote request</text>
          <rect className="boxWarn" x="75" y="55" width="10" height="40" />
          <text x="80" y="105" className="figHint" style={{fontSize:"6px"}}>blocked, waiting</text>
          <line className="flowMuted" x1="270" y1="80" x2="130" y2="80" />
          <text x="200" y="76" className="figHint" style={{fontSize:"6px"}}>price response</text>
        </svg>
        <figcaption>CheckoutService's thread sits blocked for the entire round trip &mdash; it can't proceed until PricingService answers.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using a synchronous call for work that doesn't need an immediate answer &mdash; like
          sending a confirmation email during checkout &mdash; needlessly ties the checkout page's
          latency and availability to the email service's. The other common mistake is a
          synchronous call with no timeout at all, which means a hung callee can block the caller's
          thread indefinitely instead of failing after a bounded, predictable wait.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>CheckoutService makes a synchronous call to send a receipt email before it will confirm the order to the customer. What does that decision couple checkout's availability to, that it probably shouldn't be coupled to?</p>
        </div>
      </section>
      <p className="takeaway">
        Reach for a synchronous call only when the caller genuinely cannot proceed without the
        answer right now &mdash; everything else is a candidate for the asynchronous alternative in
        the next lesson.
      </p>
    </div>
  );
}
