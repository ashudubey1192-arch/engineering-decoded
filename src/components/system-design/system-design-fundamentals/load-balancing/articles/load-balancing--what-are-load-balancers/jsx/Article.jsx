import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function LoadBalancingWhatAreLoadBalancersArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A load balancer is a traffic cop that sits in front of a group of servers and hands each
          incoming request to one of them, so no single server gets overwhelmed.
        </p>
        <p>
          It gives you one stable address to point users at, while the pool of servers behind it can
          grow, shrink, or fail without users noticing.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Your app outgrows one server. You add three more &mdash; but users only know one web
            address. Who decides which server answers each click? A load balancer. It receives every
            request at <code>app.example.com</code>, checks which servers are healthy, and forwards
            the request to the least-busy one. Add a fifth server and the load balancer just starts
            including it.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. What a load balancer actually does</h2>
        <table className="miniTable">
          <caption>JOBS OF A LOAD BALANCER</caption>
          <thead>
            <tr>
              <th>Job</th>
              <th>Why it matters</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Distribute requests</td>
              <td>Spreads load so one server is not hot while others idle</td>
            </tr>
            <tr>
              <td>Health checking</td>
              <td>Stops sending traffic to a server that is down or slow</td>
            </tr>
            <tr>
              <td>One entry point</td>
              <td>Users and DNS point at the LB, not at individual servers</td>
            </tr>
            <tr>
              <td>Elasticity</td>
              <td>New servers join the pool; removed ones drain gracefully</td>
            </tr>
            <tr>
              <td>TLS termination</td>
              <td>Decrypts HTTPS once at the edge so backends do less work</td>
            </tr>
            <tr>
              <td>Session affinity</td>
              <td>Optionally pins a user to one server (&quot;sticky sessions&quot;)</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 200" role="img" aria-labelledby="lbTitle">
            <title id="lbTitle">
              Users send every request to the load balancer, which forwards each one to a healthy
              backend server.
            </title>
            <rect className="box" x="20" y="80" width="80" height="44" />
            <text className="boxText" x="60" y="106">
              Users
            </text>
            <line className="flow" x1="100" y1="102" x2="160" y2="102" />
            <rect className="boxAccent" x="160" y="78" width="110" height="48" />
            <text className="boxText" x="215" y="98">
              Load
            </text>
            <text className="boxText" x="215" y="114">
              balancer
            </text>
            <line className="flow" x1="270" y1="90" x2="340" y2="45" />
            <line className="flow" x1="270" y1="102" x2="340" y2="102" />
            <line className="flow" x1="270" y1="114" x2="340" y2="159" />
            <rect className="box" x="340" y="28" width="110" height="36" />
            <text className="boxText" x="395" y="50">
              server 1 (ok)
            </text>
            <rect className="boxWarn" x="340" y="84" width="110" height="36" />
            <text className="boxText" x="395" y="106">
              server 2 (down)
            </text>
            <rect className="box" x="340" y="140" width="110" height="36" />
            <text className="boxText" x="395" y="162">
              server 3 (ok)
            </text>
            <text className="figHint" x="520" y="106">
              server 2 skipped
            </text>
          </svg>
          <figcaption>
            The load balancer is the single stable front door. Behind it the set of servers is fluid.
          </figcaption>
        </figure>

        <h2>2. Where load balancers live</h2>
        <ul>
          <li>
            <b>Hardware / dedicated appliances</b> &mdash; older data centres (F5, Citrix).
          </li>
          <li>
            <b>Software</b> &mdash; Nginx, HAProxy, Envoy running on normal servers.
          </li>
          <li>
            <b>Cloud managed</b> &mdash; AWS ELB/ALB/NLB, GCP Load Balancing, Azure Load Balancer.
          </li>
          <li>
            <b>DNS-level and anycast</b> &mdash; spread traffic across regions (covered in later
            lessons).
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>3. Step by step: a request through the LB</h2>
        <ol className="stepList">
          <li>
            <b>DNS resolves</b> <code>app.example.com</code> to the load balancer&apos;s IP.
          </li>
          <li>
            <b>The LB accepts the connection</b> and (for HTTPS) terminates TLS.
          </li>
          <li>
            <b>It picks a backend</b> using its algorithm (round robin, least connections, &hellip;)
            from the pool of servers currently passing health checks.
          </li>
          <li>
            <b>It forwards the request</b>, adding <code>X-Forwarded-For</code> so the backend still
            sees the real client IP.
          </li>
          <li>
            <b>The backend responds</b>; the LB relays it to the user and may log latency / status
            for metrics.
          </li>
          <li>
            <b>If that backend fails a health check</b> moments later, the LB stops routing to it &mdash;
            the next user never notices.
          </li>
        </ol>
        <div className="takeaway">
          A single load balancer is itself a single point of failure &mdash; production setups run at
          least two, with a floating IP or DNS failover between them.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Backends storing local session state</h3>
            <p>
              If user data lives on one server, the LB sending the next request elsewhere logs the
              user out. Keep sessions in a shared store.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Only one load balancer</h3>
            <p>
              You removed the SPOF from the app tier and recreated it at the front door. Run the LB
              in a redundant pair.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Health checks that only check &quot;is the port open?&quot;</h3>
            <p>
              A server can accept connections while its database link is dead. Check a real endpoint
              that exercises dependencies.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            You add a load balancer in front of 4 identical servers and users start getting logged
            out randomly. What is the likely cause and what are two ways to fix it?
          </p>
        </div>
      </section>
    </div>
  );
}
