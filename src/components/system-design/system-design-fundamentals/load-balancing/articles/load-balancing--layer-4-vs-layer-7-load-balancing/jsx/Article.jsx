import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function LoadBalancingLayer4VsLayer7Article() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A <b>Layer 4</b> load balancer routes using only the IP address and port. A <b>Layer 7</b>{" "}
          load balancer opens the request and routes using the URL, headers, and cookies.
        </p>
        <p>
          The numbers come from the OSI model: layer 4 is the transport layer (TCP/UDP), layer 7 is
          the application layer (HTTP). Seeing more of the request costs more work but unlocks smarter
          routing.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You run one domain but two services: <code>/api/*</code> goes to a Node backend and
            everything else to a static site. A <b>Layer 4</b> LB cannot tell them apart &mdash; it
            only sees &quot;TCP to port 443&quot;. A <b>Layer 7</b> LB reads{" "}
            <code>GET /api/orders</code>, matches the path, and sends it to the right pool. Same box,
            but one understands HTTP and the other does not.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Side by side</h2>
        <table className="miniTable">
          <caption>LAYER 4 VS LAYER 7</caption>
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Layer 4</th>
              <th>Layer 7</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Sees</td>
              <td>IP, port, TCP/UDP</td>
              <td>Full HTTP: method, path, headers, cookies, body</td>
            </tr>
            <tr>
              <td>Routing by</td>
              <td>Source/destination IP + port</td>
              <td>URL path, host, header, cookie, geo</td>
            </tr>
            <tr>
              <td>TLS</td>
              <td>Passes encrypted bytes through</td>
              <td>Usually terminates TLS (decrypts)</td>
            </tr>
            <tr>
              <td>Speed / cost</td>
              <td>Very fast, low CPU, millions of conns</td>
              <td>Slower, more CPU (parsing + TLS)</td>
            </tr>
            <tr>
              <td>Features</td>
              <td>Basic distribution + health checks</td>
              <td>Path routing, rewrites, caching, WAF, retries, canary</td>
            </tr>
            <tr>
              <td>Examples</td>
              <td>AWS NLB, HAProxy (tcp mode), IPVS</td>
              <td>AWS ALB, Nginx, Envoy, Cloudflare</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 190" role="img" aria-labelledby="l4l7Title">
            <title id="l4l7Title">
              A Layer 4 balancer forwards by port only; a Layer 7 balancer reads the URL path and
              routes /api and /static to different pools.
            </title>
            <text className="figLabel" x="150" y="18">
              LAYER 4
            </text>
            <rect className="box" x="40" y="70" width="70" height="34" />
            <text className="boxText" x="75" y="91">
              client
            </text>
            <line className="flow" x1="110" y1="87" x2="160" y2="87" />
            <rect className="boxAccent" x="160" y="66" width="70" height="42" />
            <text className="boxText" x="195" y="83">
              L4 LB
            </text>
            <text className="boxText" x="195" y="99">
              :443
            </text>
            <line className="flow" x1="230" y1="87" x2="280" y2="87" />
            <rect className="box" x="280" y="66" width="70" height="42" />
            <text className="boxText" x="315" y="91">
              any server
            </text>

            <line className="divider" x1="380" y1="20" x2="380" y2="170" />
            <text className="figLabel" x="510" y="18">
              LAYER 7
            </text>
            <rect className="box" x="400" y="70" width="60" height="32" />
            <text className="boxText" x="430" y="90">
              client
            </text>
            <line className="flow" x1="460" y1="86" x2="500" y2="86" />
            <rect className="boxAccent" x="500" y="66" width="60" height="42" />
            <text className="boxText" x="530" y="90">
              L7 LB
            </text>
            <line className="flow" x1="560" y1="78" x2="600" y2="55" />
            <line className="flow" x1="560" y1="96" x2="600" y2="125" />
            <rect className="box" x="595" y="40" width="45" height="26" />
            <text className="boxText" x="617" y="57">
              /api
            </text>
            <rect className="box" x="595" y="118" width="45" height="26" />
            <text className="boxText" x="617" y="135">
              /static
            </text>
          </svg>
          <figcaption>
            Layer 4 is a fast pipe. Layer 7 is a smart router that understands what is flowing through
            it.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>2. Step by step: which layer for the job</h2>
        <ol className="stepList">
          <li>
            <b>Just spreading raw TCP traffic</b> (a database proxy, a game server, gRPC streams
            where you do not need routing) &rarr; <b>Layer 4</b>. Lowest latency, handles any
            protocol.
          </li>
          <li>
            <b>Routing HTTP by path or host</b> (<code>api.</code> vs <code>www.</code>,{" "}
            <code>/v1</code> vs <code>/v2</code>) &rarr; <b>Layer 7</b>.
          </li>
          <li>
            <b>Want TLS certificates managed in one place</b> &rarr; <b>Layer 7</b> terminates TLS at
            the edge.
          </li>
          <li>
            <b>Need retries, canary releases, header-based A/B, or a WAF</b> &rarr; <b>Layer 7</b>.
          </li>
          <li>
            <b>Both?</b> Common pattern: an L4 balancer spreads traffic across several L7 balancers,
            which then do the smart routing.
          </li>
        </ol>
        <div className="takeaway">
          If you never need to look inside the request, Layer 4 is faster and simpler. The moment you
          say &quot;route based on the URL&quot;, you need Layer 7.
        </div>
      </section>

      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Using L7 for pure TCP throughput</h3>
            <p>
              Parsing and TLS on a firehose of traffic that needs no routing just adds latency and
              cost. Use L4.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Expecting path routing from an L4 LB</h3>
            <p>
              An L4 balancer literally cannot see <code>/api</code> &mdash; it is inside the
              encrypted TCP stream. You need L7 (or TLS passthrough plus routing at the backend).
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Forgetting the client IP after TLS termination</h3>
            <p>
              Once the L7 LB decrypts and re-originates the request, backends see the LB&apos;s IP
              unless it sets <code>X-Forwarded-For</code>.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>
            You want <code>example.com/blog</code> served by WordPress and{" "}
            <code>example.com/shop</code> served by a separate service. Which layer of load balancer
            do you need, and what one feature makes it possible?
          </p>
        </div>
      </section>
    </div>
  );
}
