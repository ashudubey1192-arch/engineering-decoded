import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function LoadBalancingHealthChecksAndFailoverArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A health check is a small request the load balancer sends to each backend on a schedule to
          ask &quot;are you OK?&quot;. Failover is what happens next: traffic moves off the servers
          that say no.
        </p>
        <p>
          Redundancy only helps if something <i>detects</i> the failure and <i>reacts</i>
          automatically. Health checks are the detection; failover is the reaction.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            One of your four servers loses its connection to the database. It still accepts HTTP
            connections and returns <code>200 OK</code> for the homepage &mdash; but every real
            request errors. A naive &quot;is port 80 open?&quot; check says it is healthy, so a
            quarter of your users get errors. A check that hits <code>/health</code>, which itself
            pings the database, would have caught it and the load balancer would have pulled the
            server in ~15 seconds.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Levels of health check</h2>
        <table className="miniTable">
          <caption>WHAT ARE YOU ACTUALLY CHECKING?</caption>
          <thead>
            <tr>
              <th>Type</th>
              <th>Checks</th>
              <th>Misses</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>TCP connect</td>
              <td>The port accepts a connection</td>
              <td>App crashed but process alive; broken dependencies</td>
            </tr>
            <tr>
              <td>HTTP 200 on <code>/</code></td>
              <td>The web server responds</td>
              <td>DB down, cache down, disk full</td>
            </tr>
            <tr>
              <td>
                Deep check <code>/health</code>
              </td>
              <td>App can reach its critical dependencies</td>
              <td>Slow-but-working states (needs latency thresholds)</td>
            </tr>
            <tr>
              <td>Synthetic transaction</td>
              <td>A real user flow end to end</td>
              <td>Costly; usually run less often, from outside</td>
            </tr>
          </tbody>
        </table>

        <h2>2. The tuning knobs</h2>
        <ul>
          <li>
            <b>Interval</b> &mdash; how often to check (e.g. every 5s).
          </li>
          <li>
            <b>Timeout</b> &mdash; how long to wait for a reply before it counts as a fail.
          </li>
          <li>
            <b>Unhealthy threshold</b> &mdash; how many fails in a row before removing the server
            (e.g. 3) &mdash; avoids reacting to one blip.
          </li>
          <li>
            <b>Healthy threshold</b> &mdash; how many passes before adding it back &mdash; avoids
            flapping.
          </li>
        </ul>
        <figure className="fig">
          <svg viewBox="0 0 640 170" role="img" aria-labelledby="hcTitle">
            <title id="hcTitle">
              The load balancer probes each backend; after 3 consecutive failures it removes that
              server and sends its share of traffic to the healthy ones.
            </title>
            <rect className="boxAccent" x="40" y="65" width="110" height="44" />
            <text className="boxText" x="95" y="85">
              Load
            </text>
            <text className="boxText" x="95" y="101">
              balancer
            </text>
            <line className="flowMuted" x1="150" y1="75" x2="260" y2="45" />
            <text className="figHint" x="205" y="35">
              GET /health
            </text>
            <line className="flowMuted" x1="150" y1="90" x2="260" y2="90" />
            <line className="flowMuted" x1="150" y1="105" x2="260" y2="135" />
            <rect className="box" x="260" y="28" width="120" height="34" />
            <text className="boxText" x="320" y="50">
              200 &mdash; healthy
            </text>
            <rect className="box" x="260" y="73" width="120" height="34" />
            <text className="boxText" x="320" y="95">
              200 &mdash; healthy
            </text>
            <rect className="boxWarn" x="260" y="118" width="120" height="34" />
            <text className="boxText" x="320" y="140">
              timeout x3 &mdash; out
            </text>
            <text className="figHint" x="500" y="95">
              traffic &rarr; the 2 healthy
            </text>
          </svg>
          <figcaption>
            Thresholds trade speed against stability: react in 3 checks, not 1, so a single dropped
            packet does not evict a good server.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>3. Step by step: a graceful failover and recovery</h2>
        <ol className="stepList">
          <li>
            <b>Steady state:</b> 3 servers, each passing <code>/health</code> every 5s. Traffic split
            evenly.
          </li>
          <li>
            <b>Server 2&apos;s disk fills.</b> <code>/health</code> starts returning{" "}
            <code>503</code>.
          </li>
          <li>
            <b>3 fails in a row (~15s):</b> the LB marks server 2 unhealthy and stops routing to it.
            Existing requests are allowed to finish (connection draining).
          </li>
          <li>
            <b>Servers 1 and 3 absorb the load.</b> This is why you size for <code>N+1</code> &mdash;
            two servers must handle 100% while one is out.
          </li>
          <li>
            <b>Ops clears the disk.</b> <code>/health</code> returns <code>200</code> again.
          </li>
          <li>
            <b>2 passes in a row:</b> the LB slowly ramps traffic back to server 2 (slow start) so it
            is not hit with a full third of load on a cold cache.
          </li>
        </ol>
        <div className="takeaway">
          Failover is only safe if the remaining servers have the spare capacity to carry the load.
          Health checks that pass during overload just spread the outage.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Shallow health checks</h3>
            <p>
              &quot;Port open&quot; or &quot;homepage 200&quot; passes while the database is
              unreachable. Check the dependencies that requests actually need.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Thresholds too aggressive</h3>
            <p>
              Evicting a server on a single failed probe means one lost packet halves your capacity
              for no reason. Require a few consecutive fails.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Health check that is too expensive</h3>
            <p>
              A <code>/health</code> that runs heavy queries every 5s from every LB node adds real
              load &mdash; and can itself cause the failure it is meant to detect.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            A server returns <code>200 OK</code> on <code>/</code> but every API call fails because
            its cache node is down. What kind of health check would catch this, and why does an
            aggressive 1-failure threshold make outages worse?
          </p>
        </div>
      </section>
    </div>
  );
}
