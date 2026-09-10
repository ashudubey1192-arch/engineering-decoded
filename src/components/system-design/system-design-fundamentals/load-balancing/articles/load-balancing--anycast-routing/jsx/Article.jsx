import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function LoadBalancingAnycastRoutingArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Anycast routing lets many servers in different cities share the <b>same IP address</b>. The
          internet&apos;s own routing then delivers each user to the nearest one.
        </p>
        <p>
          The balancing is done by the network itself (BGP), not by a load balancer or a DNS trick.
          Users do not choose &mdash; the routers along the way pick the shortest path to that IP.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Cloudflare&apos;s DNS is <code>1.1.1.1</code>. There is not one server at that
            address &mdash; there are hundreds, in cities worldwide, all announcing{" "}
            <code>1.1.1.1</code>. When you query it from Delhi, your packets reach the Delhi
            location; from Paris, the Paris one. Same IP, automatically nearest copy, and if one
            location fails its routes withdraw and you seamlessly hit the next-closest.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Unicast vs anycast</h2>
        <table className="miniTable">
          <caption>ONE IP, HOW MANY MACHINES?</caption>
          <thead>
            <tr>
              <th></th>
              <th>Unicast (normal)</th>
              <th>Anycast</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>IP &rarr; machine</td>
              <td>One IP, one location</td>
              <td>One IP, many locations</td>
            </tr>
            <tr>
              <td>Who routes</td>
              <td>DNS / load balancer picks</td>
              <td>Internet routing (BGP) picks nearest</td>
            </tr>
            <tr>
              <td>Failover</td>
              <td>Update DNS, wait for TTL</td>
              <td>Withdraw the route &mdash; reroutes in seconds</td>
            </tr>
            <tr>
              <td>Granularity</td>
              <td>Per request (LB) or per lookup (DNS)</td>
              <td>Per network path &mdash; coarse, location-level</td>
            </tr>
            <tr>
              <td>Typical use</td>
              <td>App servers, regional LBs</td>
              <td>DNS, CDNs, DDoS absorption</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 190" role="img" aria-labelledby="anycastTitle">
            <title id="anycastTitle">
              Three locations all announce the same IP; each user is routed to the closest one by
              internet routing.
            </title>
            <rect className="box" x="20" y="30" width="90" height="30" />
            <text className="boxText" x="65" y="50">
              user US
            </text>
            <rect className="box" x="20" y="80" width="90" height="30" />
            <text className="boxText" x="65" y="100">
              user EU
            </text>
            <rect className="box" x="20" y="130" width="90" height="30" />
            <text className="boxText" x="65" y="150">
              user Asia
            </text>
            <line className="flow" x1="110" y1="45" x2="300" y2="45" />
            <line className="flow" x1="110" y1="95" x2="300" y2="95" />
            <line className="flow" x1="110" y1="145" x2="300" y2="145" />
            <rect className="boxAccent" x="300" y="28" width="150" height="34" />
            <text className="boxText" x="375" y="49">
              203.0.113.5 (US)
            </text>
            <rect className="boxAccent" x="300" y="78" width="150" height="34" />
            <text className="boxText" x="375" y="99">
              203.0.113.5 (EU)
            </text>
            <rect className="boxAccent" x="300" y="128" width="150" height="34" />
            <text className="boxText" x="375" y="149">
              203.0.113.5 (Asia)
            </text>
            <text className="figHint" x="530" y="98">
              same IP everywhere
            </text>
          </svg>
          <figcaption>
            Because every location announces the identical prefix, routers just forward toward
            &quot;the closest 203.0.113.5&quot; &mdash; the user and their app never negotiate a
            region.
          </figcaption>
        </figure>

        <h2>2. Why CDNs and DNS love anycast</h2>
        <ul>
          <li>
            <b>Automatic nearest routing</b> with zero client logic and no DNS TTL to wait on.
          </li>
          <li>
            <b>Fast failover:</b> a site withdraws its BGP announcement and traffic reroutes in
            seconds.
          </li>
          <li>
            <b>DDoS absorption:</b> an attack from one region hits only that region&apos;s
            location, not the whole service.
          </li>
        </ul>

        <h2>3. The catch: connection stability</h2>
        <p>
          If the internet re-routes mid-connection (a path change), your packets can suddenly arrive
          at a <i>different</i> location that knows nothing about your TCP session &mdash; the
          connection breaks. This is why anycast is perfect for <b>short</b> exchanges (a DNS query,
          one HTTP request) and why long-lived TCP over anycast needs care (or you terminate at the
          edge and use a stable backhaul).
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: a DNS query over anycast</h2>
        <ol className="stepList">
          <li>
            <b>Every resolver site</b> announces the prefix containing <code>1.1.1.1</code> to its
            local internet providers via BGP.
          </li>
          <li>
            <b>Your router</b> has learned many paths to that prefix and keeps the one with the
            lowest cost &mdash; usually the geographically nearest site.
          </li>
          <li>
            <b>You send</b> a UDP DNS query to <code>1.1.1.1</code>. It follows that path to, say,
            the Mumbai site.
          </li>
          <li>
            <b>Mumbai answers</b> in ~5 ms. Because DNS over UDP is a single request/response, path
            stability does not matter.
          </li>
          <li>
            <b>Mumbai has an outage.</b> It stops announcing the route; within seconds your router
            switches to the next-best site (say Singapore) with no config change on your side.
          </li>
        </ol>
        <div className="takeaway">
          Anycast = &quot;let the internet do the load balancing.&quot; Great for global reach and
          resilience on short requests; combine it with regional load balancers for the actual app
          servers.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Long-lived connections straight over anycast</h3>
            <p>
              A route flap moves your packets to a location with no session state and the TCP
              connection resets. Keep anycast for short exchanges.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Expecting even load</h3>
            <p>
              &quot;Nearest&quot; is by network topology, not population. One well-connected site can
              attract far more traffic than expected.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Thinking you need anycast for one region</h3>
            <p>
              Anycast requires your own IP space and BGP relationships. For a single-region app a
              normal load balancer is simpler and enough.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            Why is anycast a natural fit for a public DNS resolver but risky for a 30-minute video
            upload over a single TCP connection?
          </p>
        </div>
      </section>
    </div>
  );
}
