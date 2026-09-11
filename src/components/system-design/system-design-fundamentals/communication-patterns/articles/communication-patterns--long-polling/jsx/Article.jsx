import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsLongPollingArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Long polling is regular polling with one twist: instead of answering &quot;nothing
          new&quot; instantly, the server <b>holds the request open</b> and only responds once there
          is something to say &mdash; or a timeout is reached.
        </p>
        <p>
          It gets you most of the responsiveness of a real push mechanism, using only plain HTTP
          request-response &mdash; no special protocol needed.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Early web chat apps (before WebSockets were common) used long polling: the browser sent a
            request for &quot;new messages&quot; and the server just&hellip; did not reply until a
            message actually arrived, sometimes 30 seconds later, sometimes instantly. The moment it
            replied, the browser immediately opened a new request and waited again &mdash; so it
            always looked responsive.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Polling vs long polling</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 170" role="img" aria-labelledby="lpTitle">
            <title id="lpTitle">
              Short polling gets an instant empty reply repeatedly; long polling holds the request
              open until data is ready, then the client immediately reopens it.
            </title>
            <text className="figLabel" x="150" y="18">
              SHORT POLLING
            </text>
            <line className="flow" x1="30" y1="35" x2="230" y2="35" />
            <text className="figHint" x="130" y="28">
              ask &rarr; instant &quot;no&quot;
            </text>
            <line className="flow" x1="30" y1="55" x2="230" y2="55" />
            <text className="figHint" x="130" y="48">
              ask &rarr; instant &quot;no&quot;
            </text>
            <line className="flow" x1="30" y1="75" x2="230" y2="75" />
            <text className="figHint" x="130" y="68">
              ask &rarr; instant &quot;yes&quot;
            </text>

            <line className="divider" x1="290" y1="10" x2="290" y2="160" />

            <text className="figLabel" x="470" y="18">
              LONG POLLING
            </text>
            <rect className="boxAccent" x="330" y="35" width="280" height="34" />
            <text className="boxText" x="470" y="57">
              ask &rarr; server HOLDS the request&hellip;
            </text>
            <rect className="boxAccent" x="330" y="75" width="280" height="34" />
            <text className="boxText" x="470" y="97">
              &hellip;18s later, data ready &rarr; reply now
            </text>
            <line className="flow" x1="330" y1="120" x2="610" y2="120" />
            <text className="figHint" x="470" y="140">
              client immediately reopens the request
            </text>
          </svg>
          <figcaption>
            Long polling replaces many empty round trips with one held-open request that answers the
            moment something happens.
          </figcaption>
        </figure>

        <h2>2. Trade-offs vs a real push connection</h2>
        <table className="miniTable">
          <caption>LONG POLLING IN CONTEXT</caption>
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Long polling</th>
              <th>WebSockets</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Protocol</td>
              <td>Plain HTTP</td>
              <td>Needs an upgrade handshake</td>
            </tr>
            <tr>
              <td>Connections used</td>
              <td>One new request per message (or per timeout)</td>
              <td>One connection, reused for everything</td>
            </tr>
            <tr>
              <td>Firewall / proxy friendliness</td>
              <td>Excellent &mdash; it is just HTTP</td>
              <td>Usually fine, occasionally blocked</td>
            </tr>
            <tr>
              <td>Server cost per idle client</td>
              <td>One held request per client</td>
              <td>One open socket per client</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="example">
        <h2>3. Step by step: long polling for notifications</h2>
        <ol className="stepList">
          <li>
            <b>Client calls</b> <code>GET /notifications/poll?since=1000</code>.
          </li>
          <li>
            <b>Server checks</b> if anything is newer than <code>since=1000</code>. Nothing yet
            &mdash; instead of replying, it <b>holds the connection open</b> and waits.
          </li>
          <li>
            <b>A new notification arrives</b> 12 seconds later. The server immediately writes the
            response and closes this request.
          </li>
          <li>
            <b>Client receives it,</b> processes the notification, and <i>immediately</i> opens a new
            long-poll request with the updated <code>since</code> value.
          </li>
          <li>
            <b>Timeout safety net:</b> if nothing happens for, say, 30 seconds, the server responds
            with an empty result anyway so the connection does not hang forever &mdash; the client
            just reopens it.
          </li>
        </ol>
        <div className="takeaway">
          The server needs to hold many idle connections at once. That is fine for hundreds, but at
          huge scale it is exactly the problem WebSockets and SSE are built to handle more
          efficiently.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>No timeout on the held request</h3>
            <p>
              Without one, dead or forgotten connections accumulate on the server and eventually
              exhaust its connection limit.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Not reopening immediately</h3>
            <p>
              If the client waits before starting the next long poll, you reintroduce the delay long
              polling was meant to remove.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Using it for very high-frequency updates</h3>
            <p>
              A new HTTP request per message adds overhead. For a firehose of updates (live game
              state), a persistent WebSocket is far cheaper per message.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Compare short polling every 2s to long polling with a 30s timeout, for a feature that
            gets a new event roughly every 20 seconds. Which sends fewer requests, and why does
            neither one need a WebSocket here?
          </p>
        </div>
      </section>
    </div>
  );
}
