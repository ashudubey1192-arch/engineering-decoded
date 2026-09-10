import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsAvailabilityArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Availability is the share of time a system is up and able to serve requests. It is usually
          written as a percentage, like 99.9%.
        </p>
        <p>
          If your service is meant to run 24/7 and it was unreachable for 43 minutes last month, that
          month&apos;s availability was about 99.9%.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            An online store makes &#8377;50,000 per hour. One afternoon the single database server
            reboots and the site is down for 30 minutes. That is &#8377;25,000 gone and thousands of
            frustrated customers &mdash; from one machine restarting. Availability engineering is
            about making sure no single restart can do that.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The &quot;nines&quot;</h2>
        <p>
          Each extra 9 cuts the allowed downtime by 10&times;. This is why people talk about
          &quot;three nines&quot; or &quot;four nines&quot; &mdash; it is a shorthand for a downtime
          budget.
        </p>
        <table className="miniTable">
          <caption>DOWNTIME PER YEAR</caption>
          <thead>
            <tr>
              <th>Availability</th>
              <th>Name</th>
              <th>Downtime / year</th>
              <th>Downtime / month</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>99%</td>
              <td>two nines</td>
              <td>3.65 days</td>
              <td>7.2 hours</td>
            </tr>
            <tr>
              <td>99.9%</td>
              <td>three nines</td>
              <td>8.77 hours</td>
              <td>43 minutes</td>
            </tr>
            <tr>
              <td>99.99%</td>
              <td>four nines</td>
              <td>52.6 minutes</td>
              <td>4.3 minutes</td>
            </tr>
            <tr>
              <td>99.999%</td>
              <td>five nines</td>
              <td>5.26 minutes</td>
              <td>26 seconds</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Where downtime comes from</h2>
        <p>
          The biggest enemy is the <b>single point of failure (SPOF)</b>: any one component that,
          when it dies, takes the whole system with it. A lone database, one load balancer, one
          network link, one data centre.
        </p>

        <figure className="fig">
          <svg viewBox="0 0 640 200" role="img" aria-labelledby="availTitle">
            <title id="availTitle">
              A single server is a point of failure; two servers with automatic failover keep serving
              when one dies.
            </title>
            <text className="figLabel" x="150" y="24">
              SINGLE POINT OF FAILURE
            </text>
            <rect className="box" x="40" y="80" width="80" height="45" />
            <text className="boxText" x="80" y="107">
              Users
            </text>
            <line className="flow" x1="120" y1="102" x2="180" y2="102" />
            <rect className="boxWarn" x="180" y="78" width="100" height="50" />
            <text className="boxText" x="230" y="108">
              1 server
            </text>
            <text className="figHint" x="230" y="150">
              dies &rarr; everyone down
            </text>

            <line className="divider" x1="330" y1="20" x2="330" y2="175" />

            <text className="figLabel" x="480" y="24">
              REDUNDANT + FAILOVER
            </text>
            <rect className="box" x="350" y="80" width="70" height="45" />
            <text className="boxText" x="385" y="107">
              Users
            </text>
            <line className="flow" x1="420" y1="95" x2="470" y2="70" />
            <line className="flowMuted" x1="420" y1="110" x2="470" y2="150" />
            <rect className="boxAccent" x="470" y="48" width="110" height="44" />
            <text className="boxText" x="525" y="75">
              server A (live)
            </text>
            <rect className="box" x="470" y="128" width="110" height="44" />
            <text className="boxText" x="525" y="155">
              server B (standby)
            </text>
          </svg>
          <figcaption>
            With redundancy, one machine failing drops capacity, not the whole service. Traffic
            shifts to the healthy node automatically.
          </figcaption>
        </figure>

        <h2>3. Step by step: raising availability</h2>
        <ol className="stepList">
          <li>
            <b>Find every SPOF.</b> Draw the request path and circle anything there is only one of.
          </li>
          <li>
            <b>Add redundancy.</b> Run at least two of each critical component, ideally in different
            racks / availability zones.
          </li>
          <li>
            <b>Add health checks.</b> Something must continuously ask &quot;are you OK?&quot; so a
            dead node can be detected in seconds.
          </li>
          <li>
            <b>Automate failover.</b> On a failed check, traffic must move to a healthy node without
            a human waking up.
          </li>
          <li>
            <b>Practise recovery.</b> Regularly kill a node on purpose in staging (or production) to
            prove failover actually works.
          </li>
        </ol>
      </section>

      <section id="example">
        <h2>4. Worked example: doing the math</h2>
        <p>
          Suppose one server is available 99% of the time (down ~3.65 days/year). What happens when
          we chain components versus duplicate them?
        </p>
        <pre>
          <code>{`Components IN SERIES (all must work):
  web (99.9%) -> app (99.9%) -> db (99%)
  total = 0.999 x 0.999 x 0.99 = 0.988  -> ~98.8%   (worse than any part!)

Same component in PARALLEL (any one is enough):
  two DBs, each 99%
  both down = 0.01 x 0.01 = 0.0001
  available = 1 - 0.0001 = 0.9999       -> 99.99%   (two nines -> four nines)`}</code>
        </pre>
        <div className="takeaway">
          Chaining components multiplies their weaknesses; duplicating a component multiplies its
          strength. Redundancy on the weakest link buys the most availability.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Redundant servers, one database</h3>
            <p>
              Five app servers behind a load balancer still go dark if they all point at a single
              database. Redundancy has to reach the weakest link.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Failover that was never tested</h3>
            <p>
              A standby node that has never actually taken traffic will often fail the one time you
              need it &mdash; stale config, cold cache, expired credentials.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Confusing available with correct</h3>
            <p>
              A service that responds instantly with wrong or empty data is &quot;up&quot; by a naive
              health check but useless. Check real behaviour, not just a ping.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            Your API needs 99.99% availability. Each app instance manages 99.9%. Roughly how would
            you get from three nines to four nines, and which component would you check <i>first</i>?
          </p>
        </div>
      </section>
    </div>
  );
}
