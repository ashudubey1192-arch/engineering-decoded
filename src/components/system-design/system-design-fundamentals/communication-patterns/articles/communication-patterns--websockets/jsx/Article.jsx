import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsWebSocketsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          As a communication pattern, WebSockets give you a single connection where{" "}
          <b>either side can send a message at any moment</b> &mdash; the only pattern in this
          section that is truly two-way and always open.
        </p>
        <p>
          Every other pattern here is shaped like &quot;client asks&quot; (request-response,
          polling) or &quot;server tells&quot; (SSE, webhooks). WebSockets drop that one-way
          assumption entirely.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Two people co-edit the same document. Person A types a character &mdash; the client sends
            that keystroke over the socket. A moment later, person B&apos;s cursor moves and their
            client sends that. Both directions are firing constantly, on the same connection, with
            neither side &quot;asking permission&quot; to speak.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Where it fits among the patterns in this section</h2>
        <table className="miniTable">
          <caption>CHOOSING A COMMUNICATION PATTERN</caption>
          <thead>
            <tr>
              <th>Pattern</th>
              <th>Who can initiate</th>
              <th>Good fit</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Request-response / polling</td>
              <td>Client only</td>
              <td>Occasional reads, simple CRUD</td>
            </tr>
            <tr>
              <td>Long polling</td>
              <td>Client only (server delays the reply)</td>
              <td>Infrequent server-side updates</td>
            </tr>
            <tr>
              <td>Server-Sent Events</td>
              <td>Server only</td>
              <td>Live feeds, dashboards, one-way streams</td>
            </tr>
            <tr>
              <td>WebSockets</td>
              <td>Both, anytime</td>
              <td>Chat, games, live cursors, trading, collaboration</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 140" role="img" aria-labelledby="wsPatternTitle">
            <title id="wsPatternTitle">
              Over one open connection, the client and server both send messages whenever they have
              something to say, in no fixed order.
            </title>
            <rect className="box" x="20" y="52" width="100" height="36" />
            <text className="boxText" x="70" y="74">
              client
            </text>
            <rect className="boxAccent" x="520" y="52" width="100" height="36" />
            <text className="boxText" x="570" y="74">
              server
            </text>
            <line className="flow" x1="120" y1="45" x2="520" y2="35" />
            <text className="figHint" x="320" y="25">
              client &rarr; cursor moved
            </text>
            <line className="flow" x1="520" y1="60" x2="120" y2="60" />
            <text className="figHint" x="320" y="75">
              server &rarr; teammate typed
            </text>
            <line className="flow" x1="120" y1="95" x2="520" y2="105" />
            <text className="figHint" x="320" y="122">
              client &rarr; new keystroke
            </text>
          </svg>
          <figcaption>
            No request/response turn-taking &mdash; messages flow in whichever direction has
            something new, whenever it happens.
          </figcaption>
        </figure>

        <h2>2. The cost of always-open, two-way</h2>
        <p>
          That flexibility is not free: the server must hold one open connection per client (memory
          and file-descriptor cost at scale), and because messages can arrive from a client at any
          time, the server needs a real message-routing layer &mdash; not just request handlers.
        </p>
      </section>

      <section id="example">
        <h2>3. Step by step: a shared cursor feature</h2>
        <ol className="stepList">
          <li>
            <b>Both clients open a WebSocket</b> to <code>/doc/42</code> and join &quot;room
            42&quot; on the server.
          </li>
          <li>
            <b>Client A moves its cursor.</b> It sends{" "}
            <code>{`{"type": "cursor", "pos": 120}`}</code> &mdash; no request/response, just a
            message.
          </li>
          <li>
            <b>The server receives it</b> and immediately relays it to every other client in room 42,
            including client B &mdash; the server is now routing, not just answering.
          </li>
          <li>
            <b>Client B sends a keystroke</b> the very next instant, on the same connection, with no
            need to wait for anything from A.
          </li>
          <li>
            <b>If a client disconnects,</b> the server removes it from the room; reconnecting means
            rejoining and re-syncing state, since the socket itself carries no history.
          </li>
        </ol>
        <div className="takeaway">
          Choose WebSockets specifically when you need <i>both</i> directions to be able to speak
          first, unprompted. If only one side ever initiates, a simpler pattern (SSE, webhooks,
          request-response) is usually the better trade.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Using WebSockets for one-way data</h3>
            <p>
              If the client never sends anything meaningful back, you are paying for two-way
              infrastructure to deliver a one-way stream &mdash; SSE does the job more simply.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Treating the socket as reliable storage</h3>
            <p>
              Messages sent while a client is disconnected are gone unless you explicitly persist and
              replay them on reconnect.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No routing plan for multiple servers</h3>
            <p>
              Two clients connected to different server instances cannot reach each other without a
              shared pub/sub layer relaying messages between servers.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            A live auction app needs bidders to see new bids instantly, and to submit their own bids
            instantly too. Which pattern from this section fits, and what single property of it makes
            it the right choice over SSE?
          </p>
        </div>
      </section>
    </div>
  );
}
