import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function LoadBalancingAlgorithmsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A load balancing algorithm is the rule the load balancer uses to pick <i>which</i> server
          gets the next request. The right choice depends on whether your requests are all similar or
          wildly uneven.
        </p>
        <p>
          They split into two families: <b>static</b> (fixed rule, ignores current load) and{" "}
          <b>dynamic</b> (looks at how busy each server is right now).
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Round robin works great for a simple API where every call takes ~10 ms. Then you add a
            &quot;generate PDF report&quot; endpoint that takes 8 seconds. Now round robin keeps
            handing new fast requests to a server already stuck on a slow PDF, while an idle server
            sits next to it. Switching to <b>least connections</b> fixes it &mdash; the busy server
            simply stops receiving new work until it catches up.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The common algorithms</h2>
        <table className="miniTable">
          <caption>PICKING THE NEXT SERVER</caption>
          <thead>
            <tr>
              <th>Algorithm</th>
              <th>Rule</th>
              <th>Best when</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Round robin</td>
              <td>Next server in a loop: 1, 2, 3, 1, 2, 3&hellip;</td>
              <td>Requests are uniform, servers identical</td>
            </tr>
            <tr>
              <td>Weighted round robin</td>
              <td>Bigger servers get proportionally more turns</td>
              <td>Mixed server sizes</td>
            </tr>
            <tr>
              <td>Least connections</td>
              <td>Send to the server with the fewest open requests</td>
              <td>Request durations vary a lot</td>
            </tr>
            <tr>
              <td>Least response time</td>
              <td>Fewest connections <i>and</i> lowest latency</td>
              <td>You want the snappiest server</td>
            </tr>
            <tr>
              <td>IP hash</td>
              <td>hash(client IP) decides the server</td>
              <td>You need the same user on the same server</td>
            </tr>
            <tr>
              <td>Random (with two choices)</td>
              <td>Pick 2 at random, send to the less busy one</td>
              <td>Huge fleets &mdash; cheap and near-optimal</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 170" role="img" aria-labelledby="algoTitle">
            <title id="algoTitle">
              Round robin cycles through servers in order; least connections sends to whichever
              server currently has the fewest active requests.
            </title>
            <text className="figLabel" x="150" y="20">
              ROUND ROBIN
            </text>
            <rect className="boxAccent" x="60" y="40" width="60" height="30" />
            <text className="boxText" x="90" y="60">
              S1
            </text>
            <rect className="box" x="130" y="40" width="60" height="30" />
            <text className="boxText" x="160" y="60">
              S2
            </text>
            <rect className="box" x="200" y="40" width="60" height="30" />
            <text className="boxText" x="230" y="60">
              S3
            </text>
            <text className="figHint" x="160" y="95">
              1 &rarr; 2 &rarr; 3 &rarr; 1 (ignores load)
            </text>

            <line className="divider" x1="330" y1="15" x2="330" y2="150" />

            <text className="figLabel" x="480" y="20">
              LEAST CONNECTIONS
            </text>
            <rect className="box" x="390" y="40" width="60" height="30" />
            <text className="boxText" x="420" y="60">
              S1: 5
            </text>
            <rect className="boxAccent" x="460" y="40" width="60" height="30" />
            <text className="boxText" x="490" y="60">
              S2: 1
            </text>
            <rect className="box" x="530" y="40" width="60" height="30" />
            <text className="boxText" x="560" y="60">
              S3: 4
            </text>
            <text className="figHint" x="480" y="95">
              next request &rarr; S2 (fewest active)
            </text>
          </svg>
          <figcaption>
            Static algorithms are simple and predictable; dynamic algorithms adapt but need the LB to
            track per-server state.
          </figcaption>
        </figure>

        <h2>2. Sticky sessions (session affinity)</h2>
        <p>
          Sometimes you <i>want</i> a user pinned to one server &mdash; e.g. an in-memory shopping
          cart. IP hash or a cookie set by the LB does this. The cost: if that server dies, those
          users lose their session, and load can become uneven. Prefer a shared session store and
          keep the LB stateless where you can.
        </p>
      </section>

      <section id="example">
        <h2>3. Step by step: choosing an algorithm</h2>
        <ol className="stepList">
          <li>
            <b>Are all requests roughly equal in cost?</b> Yes &rarr; <b>round robin</b> is fine and
            cheapest.
          </li>
          <li>
            <b>Are servers different sizes?</b> Yes &rarr; add <b>weights</b> (a 2&times; server gets
            weight 2).
          </li>
          <li>
            <b>Do some requests take much longer than others?</b> Yes &rarr; <b>least connections</b>{" "}
            or <b>least response time</b>.
          </li>
          <li>
            <b>Do you have thousands of backends?</b> Use <b>power of two choices</b> &mdash; global
            &quot;least&quot; tracking gets expensive at that scale.
          </li>
          <li>
            <b>Must a user keep hitting the same server?</b> Only if you truly cannot share state
            &rarr; <b>IP hash</b> or cookie affinity, and accept the trade-offs.
          </li>
        </ol>
        <div className="takeaway">
          Default to least connections for HTTP services &mdash; it self-corrects when a server slows
          down, which round robin cannot.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Round robin with uneven requests</h3>
            <p>
              A few slow endpoints turn a &quot;fair&quot; rotation into an unfair one &mdash; new
              work lands on servers already stuck.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Sticky sessions as a crutch</h3>
            <p>
              Using affinity to avoid building a shared session store means every deploy or server
              failure logs users out.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>IP hash behind a proxy or NAT</h3>
            <p>
              If thousands of users share one corporate IP, they all hash to one server. Hash on a
              cookie or user ID instead.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Your API has a fast <code>/search</code> (20 ms) and a slow <code>/export</code> (6 s) on
            the same servers. Which algorithm keeps latency low for search users, and why does round
            robin fail here?
          </p>
        </div>
      </section>
    </div>
  );
}
