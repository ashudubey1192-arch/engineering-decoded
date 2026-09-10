import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function LoadBalancingDnsLoadBalancingArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          DNS load balancing spreads traffic by giving different users different answers to the same
          name lookup. The balancing happens <i>before</i> any connection is made.
        </p>
        <p>
          Instead of one load balancer forwarding packets, the DNS server itself hands out a rotating
          or location-aware list of IP addresses for <code>example.com</code>.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Your service runs in three regions: Virginia, Frankfurt, Mumbai &mdash; each with its own
            load balancer IP. A user in Berlin looks up <code>example.com</code>. The DNS provider
            sees the query came from Europe and returns the <b>Frankfurt</b> IP. A user in Delhi
            asks the same question a second later and gets the <b>Mumbai</b> IP. No single machine
            ever saw both requests &mdash; the split happened at name resolution.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. How it works</h2>
        <p>
          A domain can have several <b>A / AAAA records</b>. The DNS server decides which one(s) to
          return and in what order, using one of these strategies:
        </p>
        <table className="miniTable">
          <caption>DNS BALANCING STRATEGIES</caption>
          <thead>
            <tr>
              <th>Strategy</th>
              <th>How it decides</th>
              <th>Use</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Round robin DNS</td>
              <td>Rotate the order of IPs on each response</td>
              <td>Cheap, rough spreading across servers</td>
            </tr>
            <tr>
              <td>Geo / latency routing</td>
              <td>Return the IP closest to the resolver</td>
              <td>Multi-region apps, lower latency</td>
            </tr>
            <tr>
              <td>Weighted records</td>
              <td>Send X% of lookups to one IP, rest to another</td>
              <td>Gradual migrations, canary by region</td>
            </tr>
            <tr>
              <td>Health-checked (failover)</td>
              <td>Stop returning an IP whose endpoint is down</td>
              <td>Active-passive disaster recovery</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 180" role="img" aria-labelledby="dnslbTitle">
            <title id="dnslbTitle">
              The DNS resolver returns a region-appropriate IP: EU users get the Frankfurt load
              balancer, Asia users get the Mumbai one.
            </title>
            <rect className="box" x="20" y="35" width="90" height="34" />
            <text className="boxText" x="65" y="57">
              EU user
            </text>
            <rect className="box" x="20" y="110" width="90" height="34" />
            <text className="boxText" x="65" y="132">
              Asia user
            </text>
            <line className="flow" x1="110" y1="52" x2="170" y2="80" />
            <line className="flow" x1="110" y1="127" x2="170" y2="100" />
            <rect className="boxAccent" x="170" y="70" width="110" height="40" />
            <text className="boxText" x="225" y="94">
              Geo DNS
            </text>
            <line className="flow" x1="280" y1="82" x2="360" y2="52" />
            <line className="flow" x1="280" y1="100" x2="360" y2="130" />
            <rect className="box" x="360" y="35" width="120" height="34" />
            <text className="boxText" x="420" y="57">
              Frankfurt LB
            </text>
            <rect className="box" x="360" y="115" width="120" height="34" />
            <text className="boxText" x="420" y="137">
              Mumbai LB
            </text>
            <text className="figHint" x="420" y="95">
              answer depends on where you ask from
            </text>
          </svg>
          <figcaption>
            DNS load balancing is coarse (per-lookup, then cached) but it is the only way to steer
            traffic <i>between</i> data centres.
          </figcaption>
        </figure>

        <h2>2. The TTL and caching catch</h2>
        <p>
          DNS answers are cached everywhere &mdash; the OS, the resolver, the browser &mdash; for the
          record&apos;s <b>TTL</b>. A low TTL (30&ndash;60s) means fast rebalancing and failover but
          many more lookups. A high TTL is efficient but a dead region keeps getting traffic until
          caches expire. You also cannot pull traffic off <i>one specific</i> overloaded server this
          way &mdash; it is region-level, not request-level.
        </p>
      </section>

      <section id="example">
        <h2>3. Step by step: a regional failover</h2>
        <ol className="stepList">
          <li>
            <b>Setup:</b> <code>example.com</code> has two A records &mdash; <code>1.1.1.1</code>{" "}
            (US, primary) and <code>2.2.2.2</code> (EU, standby) &mdash; with a health-checked
            failover policy and a 60s TTL.
          </li>
          <li>
            <b>Normal:</b> the DNS provider health-checks <code>1.1.1.1</code> every 30s and returns
            it to everyone.
          </li>
          <li>
            <b>The US region goes down.</b> Two checks fail; the provider marks{" "}
            <code>1.1.1.1</code> unhealthy.
          </li>
          <li>
            <b>New lookups get <code>2.2.2.2</code>.</b> Within one TTL (&le; 60s) most clients have
            switched to the EU region.
          </li>
          <li>
            <b>Recovery:</b> when <code>1.1.1.1</code> passes checks again, the provider resumes
            returning it and traffic drifts back.
          </li>
        </ol>
        <div className="takeaway">
          Use DNS load balancing for <b>global</b> traffic steering and disaster failover. Use a real
          load balancer inside each region for <b>per-request</b> distribution.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>High TTL on records you need to fail over</h3>
            <p>
              A 1-hour TTL means a dead region keeps taking traffic for up to an hour. Keep failover
              records at 30&ndash;60s.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Expecting even distribution</h3>
            <p>
              One busy corporate resolver caches an answer and sends thousands of users to the same
              IP. DNS balancing is approximate.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No health checks on the records</h3>
            <p>
              Plain round-robin DNS happily keeps handing out the IP of a server that is on fire.
              Use a provider that health-checks endpoints.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Why can DNS load balancing move traffic between two data centres but not rescue a single
            overloaded server inside one of them? What setting controls how fast a failover takes
            effect?
          </p>
        </div>
      </section>
    </div>
  );
}
