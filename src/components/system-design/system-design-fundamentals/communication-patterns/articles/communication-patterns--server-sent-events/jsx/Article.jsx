import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsServerSentEventsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Server-Sent Events (SSE) is one HTTP connection the client opens once, that the server
          keeps open and uses to stream a sequence of text messages &mdash; one direction only,
          server to client.
        </p>
        <p>
          It sits between long polling and WebSockets: simpler than a WebSocket, but far more
          efficient than reopening a request for every update.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A live sports score page opens one connection and the score just keeps updating as goals
            happen &mdash; no reloading, no repeated requests. The browser never needs to send
            anything back after the initial connection; it only listens. That one-way stream is
            exactly what SSE is designed for.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. One connection, a stream of events</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 140" role="img" aria-labelledby="sseTitle">
            <title id="sseTitle">
              The client opens one connection; the server sends a sequence of events down it over
              time without the client asking again.
            </title>
            <rect className="box" x="20" y="50" width="90" height="40" />
            <text className="boxText" x="65" y="74">
              client
            </text>
            <line className="flow" x1="110" y1="60" x2="270" y2="60" />
            <text className="figHint" x="190" y="50">
              GET /events (opens once)
            </text>
            <rect className="boxAccent" x="270" y="45" width="120" height="34" />
            <text className="boxText" x="330" y="66">
              server keeps
            </text>
            <line className="flow" x1="390" y1="55" x2="600" y2="30" />
            <text className="figHint" x="520" y="20">
              event: score 1-0
            </text>
            <line className="flow" x1="390" y1="65" x2="600" y2="70" />
            <text className="figHint" x="520" y="82">
              event: score 1-1
            </text>
            <line className="flow" x1="390" y1="75" x2="600" y2="105" />
            <text className="figHint" x="520" y="118">
              event: score 2-1
            </text>
          </svg>
          <figcaption>
            The connection stays open indefinitely; the server just keeps writing new events onto it
            whenever it has something to say.
          </figcaption>
        </figure>

        <h2>2. What it looks like on the wire</h2>
        <pre>
          <code>{`Content-Type: text/event-stream

data: {"home": 1, "away": 0}

data: {"home": 1, "away": 1}

event: full-time
data: {"home": 2, "away": 1}`}</code>
        </pre>
        <p>
          Plain text, one field per line, a blank line ends each event. Browsers have this built in
          via <code>EventSource</code> &mdash; no library required.
        </p>

        <h2>3. SSE vs WebSockets</h2>
        <table className="miniTable">
          <caption>PICK BY DIRECTION</caption>
          <thead>
            <tr>
              <th>Aspect</th>
              <th>SSE</th>
              <th>WebSockets</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Direction</td>
              <td>Server &rarr; client only</td>
              <td>Both directions</td>
            </tr>
            <tr>
              <td>Protocol</td>
              <td>Plain HTTP</td>
              <td>Needs an upgrade to a different protocol</td>
            </tr>
            <tr>
              <td>Browser support</td>
              <td>Built-in <code>EventSource</code>, auto-reconnect</td>
              <td>Built-in <code>WebSocket</code>, no auto-reconnect</td>
            </tr>
            <tr>
              <td>Best for</td>
              <td>Live feeds, notifications, dashboards, AI streaming responses</td>
              <td>Chat, games, collaborative editing</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="example">
        <h2>4. Step by step: streaming a live dashboard</h2>
        <ol className="stepList">
          <li>
            <b>Browser creates</b> <code>new EventSource(&quot;/api/stats/stream&quot;)</code>.
          </li>
          <li>
            <b>Server responds</b> with <code>Content-Type: text/event-stream</code> and keeps the
            connection open instead of closing it.
          </li>
          <li>
            <b>Whenever a new stat is ready</b> (every few seconds), the server writes a{" "}
            <code>data: {`{...}`}</code> block and flushes it &mdash; the browser fires an{" "}
            <code>onmessage</code> event immediately.
          </li>
          <li>
            <b>If the connection drops</b> (network blip), <code>EventSource</code> automatically
            reconnects on its own &mdash; no code required.
          </li>
          <li>
            <b>The server can resume where it left off</b> using the <code>Last-Event-ID</code>{" "}
            header the browser sends on reconnect, so no updates are missed.
          </li>
        </ol>
        <div className="takeaway">
          If your data only ever flows one way &mdash; from server to client &mdash; SSE gives you
          real-time updates with far less complexity than a WebSocket.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Reaching for WebSockets by default</h3>
            <p>
              If the client never needs to send data back, SSE is simpler, auto-reconnects, and works
              through more proxies out of the box.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Not handling reconnect gaps</h3>
            <p>
              Without using <code>Last-Event-ID</code>, a reconnect after a drop silently skips
              whatever happened while disconnected.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Too many open connections per server</h3>
            <p>
              Each SSE client holds a connection open indefinitely &mdash; size your server fleet for
              concurrent connections, not just requests per second.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A stock-price ticker only ever needs to push updates to the browser; the browser never
            sends anything back. Would you reach for SSE or WebSockets, and why does the unused
            direction matter?
          </p>
        </div>
      </section>
    </div>
  );
}
