import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function NetworkingWebSocketsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A WebSocket is a single long-lived, two-way connection between browser and server. Either
          side can send a message at any time, with almost no per-message overhead.
        </p>
        <p>
          Plain HTTP is one-way per exchange: the client asks, the server answers, done. WebSockets
          keep the pipe open so the server can push without being asked.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A chat app needs a new message to appear the instant someone sends it. With HTTP you
            would have to ask &quot;anything new?&quot; every second (polling) &mdash; wasteful and
            still up to a second late. With a WebSocket, the server pushes the message down the open
            connection the moment it arrives, in a few milliseconds.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. How it starts: the upgrade</h2>
        <p>
          A WebSocket begins life as a normal HTTP request with an{" "}
          <code>Upgrade: websocket</code> header. If the server agrees, it replies{" "}
          <code>101 Switching Protocols</code> and the same TCP connection stops speaking HTTP and
          starts speaking the WebSocket frame protocol.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 640 160" role="img" aria-labelledby="wsTitle">
            <title id="wsTitle">
              An HTTP upgrade request becomes a persistent two-way WebSocket connection.
            </title>
            <rect className="box" x="20" y="60" width="90" height="44" />
            <text className="boxText" x="65" y="86">
              Browser
            </text>
            <line className="flow" x1="110" y1="70" x2="520" y2="70" />
            <text className="figHint" x="315" y="60">
              GET /chat  Upgrade: websocket
            </text>
            <line className="flow" x1="520" y1="90" x2="110" y2="90" />
            <text className="figHint" x="315" y="105">
              101 Switching Protocols
            </text>
            <line className="flow" x1="110" y1="125" x2="520" y2="125" />
            <line className="flow" x1="520" y1="132" x2="110" y2="132" />
            <text className="figHint" x="315" y="150">
              messages flow both ways, anytime
            </text>
            <rect className="boxAccent" x="520" y="60" width="90" height="44" />
            <text className="boxText" x="565" y="86">
              Server
            </text>
          </svg>
          <figcaption>
            One TCP + TLS setup, then the connection stays open for minutes or hours. Each message is
            a tiny frame (2&ndash;14 bytes of header) instead of a full HTTP request.
          </figcaption>
        </figure>

        <h2>2. WebSockets vs the alternatives</h2>
        <table className="miniTable">
          <caption>PUSHING DATA TO A BROWSER</caption>
          <thead>
            <tr>
              <th>Technique</th>
              <th>Direction</th>
              <th>Latency</th>
              <th>Best for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Short polling</td>
              <td>Client asks repeatedly</td>
              <td>Up to the interval</td>
              <td>Rare updates, simple setup</td>
            </tr>
            <tr>
              <td>Long polling</td>
              <td>Client asks, server holds</td>
              <td>Low-ish</td>
              <td>Occasional updates, HTTP-only infra</td>
            </tr>
            <tr>
              <td>Server-Sent Events</td>
              <td>Server &rarr; client only</td>
              <td>Low</td>
              <td>Feeds, notifications, one-way streams</td>
            </tr>
            <tr>
              <td>WebSocket</td>
              <td>Full duplex</td>
              <td>Lowest</td>
              <td>Chat, games, collaborative editing, trading</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="example">
        <h2>3. Step by step: a live document cursor</h2>
        <ol className="stepList">
          <li>
            <b>Connect:</b> browser opens{" "}
            <code>new WebSocket(&quot;wss://app.example.com/doc/42&quot;)</code>. Handshake completes,
            connection is open.
          </li>
          <li>
            <b>Join:</b> client sends{" "}
            <code>{`{"type":"join","user":"amy"}`}</code>. Server adds this socket to the room for
            doc 42.
          </li>
          <li>
            <b>Move:</b> as Amy moves her cursor, the client sends{" "}
            <code>{`{"type":"cursor","pos":128}`}</code> a few times a second.
          </li>
          <li>
            <b>Fan out:</b> the server forwards each message to every other socket in room 42 &mdash;
            no polling, sub-50 ms.
          </li>
          <li>
            <b>Heartbeat:</b> every 30s each side sends a ping/pong frame so dead connections are
            detected and cleaned up.
          </li>
          <li>
            <b>Reconnect:</b> on network drop the client retries with backoff and re-sends{" "}
            <code>join</code> to restore state.
          </li>
        </ol>
        <div className="takeaway">
          The server now holds <b>state</b> (which socket is in which room), so scaling WebSockets
          means a shared pub/sub layer (like Redis) so any server can reach any client.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>No heartbeat or reconnect</h3>
            <p>
              Proxies and phones silently drop idle connections. Without ping/pong and auto-reconnect
              the app just quietly stops updating.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Using WebSockets for one-way data</h3>
            <p>
              If only the server pushes, Server-Sent Events are simpler, auto-reconnect for free, and
              plain HTTP.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Sticky-session assumptions</h3>
            <p>
              A client connected to server B will not get a message published on server A unless the
              servers share a pub/sub bus.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            You have 3 chat servers behind a load balancer. User X is connected to server 1, user Y
            to server 3. What extra component do you need so X&apos;s message reaches Y, and why?
          </p>
        </div>
      </section>
    </div>
  );
}
