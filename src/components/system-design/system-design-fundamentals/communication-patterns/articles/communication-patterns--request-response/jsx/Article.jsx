import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsRequestResponseArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Request-response is the most basic communication pattern of all: one side sends exactly
          one request, the other side sends back exactly one response, and the exchange is over.
        </p>
        <p>
          Every HTTP call follows this shape. It is the pattern underneath synchronous communication,
          and the starting point every other pattern in this section (polling, streaming, events)
          modifies or replaces.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Your browser asks <code>GET /product/42</code>. The server sends back the product&apos;s
            JSON. Done. No connection is kept open, no follow-up is expected &mdash; if you want the
            product again, you ask again. That clean, self-contained exchange is request-response.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The shape of the exchange</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 110" role="img" aria-labelledby="rrTitle">
            <title id="rrTitle">
              A client sends one request, the server sends back one response, and the interaction is
              complete.
            </title>
            <rect className="box" x="20" y="35" width="100" height="40" />
            <text className="boxText" x="70" y="59">
              client
            </text>
            <line className="flow" x1="120" y1="45" x2="520" y2="45" />
            <text className="figHint" x="320" y="35">
              1 request
            </text>
            <line className="flow" x1="520" y1="65" x2="120" y2="65" />
            <text className="figHint" x="320" y="90">
              1 response &mdash; then the exchange is over
            </text>
            <rect className="boxAccent" x="520" y="35" width="100" height="40" />
            <text className="boxText" x="570" y="59">
              server
            </text>
          </svg>
          <figcaption>
            No memory of the exchange is kept by default (stateless) &mdash; each request stands on
            its own.
          </figcaption>
        </figure>

        <h2>2. Why it dominates the web</h2>
        <ul>
          <li>
            <b>Stateless:</b> the server does not need to remember past requests, so any server can
            answer any request &mdash; great for load balancing and scaling.
          </li>
          <li>
            <b>Cacheable:</b> a response to <code>GET /product/42</code> can be cached and reused
            until it changes.
          </li>
          <li>
            <b>Simple to reason about:</b> one clear question, one clear answer.
          </li>
        </ul>

        <h2>3. What it is not built for</h2>
        <table className="miniTable">
          <caption>WHEN PLAIN REQUEST-RESPONSE FALLS SHORT</caption>
          <thead>
            <tr>
              <th>Need</th>
              <th>Why request-response alone struggles</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Server-initiated updates</td>
              <td>The server can only reply to a request &mdash; it cannot speak first</td>
            </tr>
            <tr>
              <td>Real-time updates</td>
              <td>You would have to keep asking (polling) to catch changes quickly</td>
            </tr>
            <tr>
              <td>Long-running work</td>
              <td>Holding one request open for minutes wastes a connection</td>
            </tr>
          </tbody>
        </table>
        <p>
          That is exactly why polling, long polling, SSE, WebSockets, and event-driven patterns
          exist &mdash; each one bends the basic request-response shape to solve one of these gaps.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: a request-response call end to end</h2>
        <ol className="stepList">
          <li>
            <b>Client builds a request:</b> method, URL, headers, optional body &mdash;{" "}
            <code>GET /product/42</code>.
          </li>
          <li>
            <b>Client opens a connection</b> to the server (or reuses one via keep-alive).
          </li>
          <li>
            <b>Server reads the request,</b> does the work (a database lookup), and builds a
            response: status code, headers, body.
          </li>
          <li>
            <b>Server sends the response</b> and considers this exchange finished &mdash; it keeps no
            record that this particular request happened.
          </li>
          <li>
            <b>Client reads the response</b> and uses it. If it wants fresher data later, it simply
            repeats the whole exchange.
          </li>
        </ol>
        <div className="takeaway">
          Request-response is the foundation. Every other pattern in this section answers the same
          question &mdash; &quot;what if one request and one response is not enough?&quot;
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Forcing real-time needs into plain requests</h3>
            <p>
              Calling an endpoint every 200ms to feel &quot;live&quot; wastes resources compared to a
              pattern built for pushing updates.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Assuming statelessness for free</h3>
            <p>
              If your server quietly keeps request-scoped state in memory, you lose the
              &quot;any server can answer&quot; property that makes this pattern scale so well.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>One giant request instead of pagination</h3>
            <p>
              Fetching 100,000 rows in a single response ties up memory and bandwidth. Split large
              results across several request-response calls.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            Why can a plain request-response API not tell a client &quot;your order just shipped&quot;
            the moment it happens, without the client asking first? Name two patterns that solve this.
          </p>
        </div>
      </section>
    </div>
  );
}
