import "../css/Article.css";

export default function DiscoveryAndRoutingClientSideDiscoveryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Client-side and server-side discovery answer the same question &mdash; which instance
          should handle this call &mdash; but they put the decision in different hands: the caller
          itself, or a router sitting in front of it that the caller doesn't even know exists.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          In <b>client-side discovery</b>, the caller queries the registry directly and picks an
          instance itself (often applying its own load-balancing logic) before making the call. In
          <b>server-side discovery</b>, the caller just sends its request to one stable address
          &mdash; a load balancer or router &mdash; which queries the registry and forwards the
          request on the caller's behalf. The caller never sees individual instance addresses at
          all.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          With client-side discovery, <code>CheckoutService</code>'s own code calls the registry,
          gets back three <code>InventoryService</code> addresses, and picks one itself &mdash;
          every caller needs this registry-aware logic built in. With server-side discovery,
          <code>CheckoutService</code> just calls <code>http://inventory-service/</code>; a load
          balancer in front of <code>InventoryService</code> handles the registry lookup and
          forwarding, and <code>CheckoutService</code>'s code is identical whether there are 3
          instances or 30.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 160" role="img" aria-label="Side-by-side comparison: in client-side discovery, the caller itself queries the registry and picks an instance; in server-side discovery, the caller sends its request to a load balancer, which queries the registry and forwards it on the caller's behalf.">
          <text x="105" y="20" className="figLabel">CLIENT-SIDE</text>
          <rect className="boxAccent" x="20" y="35" width="110" height="28" rx="6" />
          <text x="75" y="53" className="boxText" style={{fontSize:"6.5px"}}>Caller</text>
          <rect className="box" x="20" y="100" width="110" height="26" rx="5" />
          <text x="75" y="117" className="boxText" style={{fontSize:"6px"}}>Registry</text>
          <rect className="box" x="150" y="100" width="70" height="26" rx="5" />
          <text x="185" y="117" className="boxText" style={{fontSize:"5.5px"}}>Instance</text>
          <line className="flow" x1="75" y1="63" x2="75" y2="98" />
          <text x="75" y="80" className="figHint" style={{fontSize:"5px"}}>query + pick</text>
          <line className="flow" x1="130" y1="113" x2="148" y2="113" />

          <line className="divider" x1="245" y1="10" x2="245" y2="150" />

          <text x="345" y="20" className="figLabel">SERVER-SIDE</text>
          <rect className="boxAccent" x="270" y="35" width="90" height="28" rx="6" />
          <text x="315" y="53" className="boxText" style={{fontSize:"6.5px"}}>Caller</text>
          <rect className="box" x="270" y="90" width="90" height="26" rx="5" />
          <text x="315" y="107" className="boxText" style={{fontSize:"6px"}}>Load balancer</text>
          <rect className="box" x="270" y="130" width="90" height="24" rx="5" />
          <text x="315" y="146" className="figHint" style={{fontSize:"5.5px"}}>queries registry</text>
          <rect className="box" x="390" y="90" width="60" height="26" rx="5" />
          <text x="420" y="107" className="boxText" style={{fontSize:"5.5px"}}>Instance</text>
          <line className="flow" x1="315" y1="63" x2="315" y2="88" />
          <line className="flow" x1="360" y1="103" x2="388" y2="103" />
        </svg>
        <figcaption>Client-side: the caller queries the registry and picks. Server-side: the caller only ever talks to a load balancer, which does that work invisibly.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Client-side discovery quietly requires every caller, in every language used across the
          organization, to implement (or share) the same registry-aware logic &mdash; skipping this
          in a new service written in an unfamiliar language is an easy way to end up with one
          service silently not participating in load balancing at all. Server-side discovery avoids
          that, but adds an extra network hop through the load balancer for every call, and makes the
          load balancer itself a piece of infrastructure that now needs to be highly available.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A new service is written in a language with no client library for the company's service registry. Which discovery style avoids this being a problem, and why?</p>
        </div>
      </section>
      <p className="takeaway">
        Server-side discovery centralizes the registry-aware logic in one place at the cost of an
        extra hop; client-side discovery skips that hop but pushes the same logic into every caller,
        in every language.
      </p>
    </div>
  );
}
