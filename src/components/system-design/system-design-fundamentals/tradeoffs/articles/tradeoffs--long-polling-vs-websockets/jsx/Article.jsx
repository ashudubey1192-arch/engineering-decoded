import "../css/Article.css";

export default function TradeoffsLongPollingVsWebsocketsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Long polling and WebSockets are both ways to get near-real-time updates over HTTP-based
          protocols, without the client repeatedly polling for nothing new. They differ in how much
          they still lean on the request/response model.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Long polling</h3>
            <p>The client sends a request; the server holds it open until there's new data (or a
              timeout), responds, and the client immediately opens a new request. Works over plain
              HTTP, easy to deploy behind existing infrastructure, but each update still costs a
              full request/response round trip.</p>
          </div>
          <div>
            <h3>WebSockets</h3>
            <p>A single connection is upgraded once and stays open in both directions — either
              side can send a message at any time with no new connection needed. Lower latency and
              overhead per message, but the connection is stateful and needs to be held open,
              which changes how load balancers and servers need to be built.</p>
          </div>
        </div>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start with long polling.</b> A chat app's client sends a request; the server
            holds it until a new message arrives, responds, and the client re-requests
            immediately.</li>
          <li><b>Traffic grows.</b> Each idle-but-open long-poll request still consumes a server
            thread/connection, and message-heavy chats mean constant round trips.</li>
          <li><b>Switch to WebSockets.</b> The client upgrades the HTTP connection once; the
            server can now push each new message down the same open socket instantly.</li>
          <li><b>Trade-off shows up in infra.</b> The load balancer now needs to keep each
            client pinned to the same server instance for the life of that connection.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram contrasting long polling as repeated request-response cycles versus WebSockets as one persistent bidirectional connection.">
          <text x="100" y="18" className="figLabel" textAnchor="middle">LONG POLLING</text>
          {[0, 1, 2].map((i) => (
            <g key={i}>
              <line className="flow" x1="40" y1={35 + i * 22} x2="160" y2={35 + i * 22} />
              <line className="flowMuted" x1="160" y1={35 + i * 22 + 8} x2="40" y2={35 + i * 22 + 8} />
            </g>
          ))}
          <text x="100" y="115" className="figHint" textAnchor="middle">request, hold, respond, repeat</text>
          <line className="divider" x1="210" y1="10" x2="210" y2="140" />
          <text x="330" y="18" className="figLabel" textAnchor="middle">WEBSOCKETS</text>
          <rect className="box" x="250" y="55" width="60" height="26" rx="4" /><text x="280" y="72" className="boxText">client</text>
          <line className="flow" x1="310" y1="60" x2="360" y2="60" /><line className="flow" x1="360" y1="76" x2="310" y2="76" />
          <rect className="boxAccent" x="360" y="55" width="60" height="26" rx="4" /><text x="390" y="72" className="boxText">server</text>
          <text x="335" y="105" className="figHint" textAnchor="middle">one open connection, both directions</text>
        </svg>
        <figcaption>Long polling repeats request/response cycles; WebSockets keep one connection open both ways.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for WebSockets by default adds real operational complexity (connection state,
          sticky routing, reconnect logic) that many use cases don't need — occasional updates are
          often fine with long polling or even simple periodic polling. The opposite mistake is
          sticking with long polling at a scale where the constant connection churn is the actual
          bottleneck.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a load balancer need to treat WebSocket connections differently from ordinary stateless HTTP requests?</p>
        </div>
      </section>
      <p className="takeaway">
        Long polling reuses plain HTTP for near-real-time updates with more per-message overhead;
        WebSockets cut that overhead by keeping one connection open, at the cost of managing
        persistent connection state.
      </p>
    </div>
  );
}
