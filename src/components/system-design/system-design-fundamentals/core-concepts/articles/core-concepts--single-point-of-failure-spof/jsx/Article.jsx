import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsSpofArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A single point of failure (SPOF) is any one component whose failure takes down the entire
          system. Find them, then remove them &mdash; that is most of availability engineering.
        </p>
        <p>
          If there is exactly one of something on the request path &mdash; one database, one load
          balancer, one server, one network link, one region &mdash; it is a SPOF until proven
          otherwise.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A startup runs five app servers behind a load balancer &mdash; looks redundant. But all
            five talk to <b>one</b> database, and the load balancer itself is a <b>single</b>
            instance. The night the database disk fills up, or the load balancer VM reboots, all five
            healthy app servers are useless. The redundancy stopped one layer too early.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Where SPOFs hide</h2>
        <table className="miniTable">
          <caption>COMMON SINGLE POINTS OF FAILURE</caption>
          <thead>
            <tr>
              <th>Layer</th>
              <th>The SPOF</th>
              <th>Fix</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Compute</td>
              <td>One server / one container</td>
              <td>Run &ge; 2 behind a load balancer</td>
            </tr>
            <tr>
              <td>Entry point</td>
              <td>One load balancer</td>
              <td>Redundant LBs + DNS failover / floating IP</td>
            </tr>
            <tr>
              <td>Data</td>
              <td>One database instance</td>
              <td>Primary + replicas, automated failover</td>
            </tr>
            <tr>
              <td>Network</td>
              <td>One link, one switch, one NAT</td>
              <td>Multiple paths / availability zones</td>
            </tr>
            <tr>
              <td>Location</td>
              <td>One data centre or region</td>
              <td>Multi-AZ, then multi-region</td>
            </tr>
            <tr>
              <td>People / process</td>
              <td>One person who knows the deploy</td>
              <td>Runbooks, automation, shared on-call</td>
            </tr>
            <tr>
              <td>External</td>
              <td>One payment / email / DNS provider</td>
              <td>Fallback provider or graceful degradation</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 200" role="img" aria-labelledby="spofTitle">
            <title id="spofTitle">
              Redundant app servers still funnel through one load balancer and one database, each a
              single point of failure.
            </title>
            <rect className="box" x="20" y="85" width="70" height="40" />
            <text className="boxText" x="55" y="110">
              Users
            </text>
            <line className="flow" x1="90" y1="105" x2="130" y2="105" />
            <rect className="boxWarn" x="130" y="82" width="90" height="46" />
            <text className="boxText" x="175" y="103">
              1 load
            </text>
            <text className="boxText" x="175" y="119">
              balancer
            </text>
            <line className="flow" x1="220" y1="90" x2="280" y2="55" />
            <line className="flow" x1="220" y1="105" x2="280" y2="105" />
            <line className="flow" x1="220" y1="120" x2="280" y2="155" />
            <rect className="box" x="280" y="38" width="90" height="34" />
            <text className="boxText" x="325" y="60">
              app
            </text>
            <rect className="box" x="280" y="88" width="90" height="34" />
            <text className="boxText" x="325" y="110">
              app
            </text>
            <rect className="box" x="280" y="138" width="90" height="34" />
            <text className="boxText" x="325" y="160">
              app
            </text>
            <line className="flow" x1="370" y1="55" x2="430" y2="100" />
            <line className="flow" x1="370" y1="105" x2="430" y2="105" />
            <line className="flow" x1="370" y1="155" x2="430" y2="110" />
            <rect className="boxWarn" x="430" y="82" width="100" height="46" />
            <text className="boxText" x="480" y="103">
              1 database
            </text>
            <text className="figHint" x="480" y="150">
              two SPOFs remain
            </text>
          </svg>
          <figcaption>
            The red boxes are single points of failure. The app tier is fine; the funnels on either
            side are not.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>2. Step by step: hunting SPOFs</h2>
        <ol className="stepList">
          <li>
            <b>Draw the request path</b> end to end, including DNS, CDN, load balancer, app, cache,
            database, and any third-party call.
          </li>
          <li>
            <b>Circle everything there is only one of.</b> Each circle is a candidate SPOF.
          </li>
          <li>
            <b>Ask &quot;what happens if this dies right now?&quot;</b> If the answer is &quot;total
            outage&quot;, it is confirmed.
          </li>
          <li>
            <b>Add redundancy from the weakest link inward.</b> Two of the component, in different
            failure domains (racks / availability zones).
          </li>
          <li>
            <b>Add detection + automatic failover.</b> Redundancy without fast, automated failover
            just means a human has to notice and react.
          </li>
          <li>
            <b>Test it.</b> Kill the primary on purpose in staging (or production game days) and
            confirm traffic moves with no outage.
          </li>
        </ol>
        <div className="takeaway">
          Redundancy only counts if the two copies fail independently. Two database replicas on the
          same power strip are still one power-strip failure away from a full outage.
        </div>
      </section>

      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Redundancy that stops early</h3>
            <p>
              Many app servers, one database or one load balancer. The chain is only as available as
              its weakest single link.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Correlated failure</h3>
            <p>
              Both replicas in the same rack, zone, or region fail together in a power or network
              event. Spread copies across failure domains.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Ignoring the control plane</h3>
            <p>
              Config service, secrets store, DNS, CI/CD, and deploy tooling are SPOFs too &mdash; you
              cannot recover if you cannot deploy.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>
            Your architecture has 3 web servers, 3 app servers, 1 Redis cache, and a primary +
            replica database. Name every SPOF and the smallest change that removes each one.
          </p>
        </div>
      </section>
    </div>
  );
}
