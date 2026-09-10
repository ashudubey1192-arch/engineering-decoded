import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsReliabilityArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Reliability is the system doing the <i>right</i> thing &mdash; correct results, no lost
          data &mdash; continuously over time, even when parts fail.
        </p>
        <p>
          Availability asks &quot;is it up?&quot;. Reliability asks &quot;is it behaving
          correctly?&quot;. A service can be 100% up and still unreliable if it sometimes double-charges
          a card or drops a message.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You withdraw &#8377;2,000 from an ATM. The network blips right as it dispenses cash. If
            the bank&apos;s system is reliable, you get exactly &#8377;2,000 and your balance drops by
            exactly &#8377;2,000 &mdash; once. An unreliable system might dispense nothing but still
            debit you, or debit you twice. Same uptime, very different trust.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Two numbers that define it</h2>
        <table className="miniTable">
          <caption>RELIABILITY METRICS</caption>
          <thead>
            <tr>
              <th>Term</th>
              <th>Meaning</th>
              <th>You improve it by&hellip;</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>MTBF</td>
              <td>Mean Time Between Failures &mdash; how long it runs before breaking</td>
              <td>Better components, testing, redundancy</td>
            </tr>
            <tr>
              <td>MTTR</td>
              <td>Mean Time To Recovery &mdash; how long to get back to correct after a failure</td>
              <td>Alerts, automation, good runbooks, backups</td>
            </tr>
          </tbody>
        </table>
        <p>
          Failures come from three places: <b>hardware</b> (disks, memory, power), <b>software</b>
          (bugs, bad deploys, memory leaks), and <b>humans</b> (wrong config, fat-fingered command).
          At scale, software and human errors cause most outages.
        </p>

        <h2>2. Patterns that make a system reliable</h2>
        <ol className="stepList">
          <li>
            <b>Redundancy.</b> Keep spare copies of data and compute so one failure is survivable.
          </li>
          <li>
            <b>Retries with idempotency.</b> Safe to retry a failed call only if doing it twice has
            the same effect as once (use a unique request ID for payments, orders, etc.).
          </li>
          <li>
            <b>Timeouts and circuit breakers.</b> Stop waiting on a stuck dependency and fail fast
            instead of piling up.
          </li>
          <li>
            <b>Graceful degradation.</b> If recommendations are down, still show the product page
            &mdash; drop the feature, not the request.
          </li>
          <li>
            <b>Backups and tested restores.</b> A backup you have never restored is a guess, not a
            safety net.
          </li>
          <li>
            <b>Chaos testing.</b> Inject failures on purpose so you learn how the system breaks
            before customers do.
          </li>
        </ol>

        <figure className="fig">
          <svg viewBox="0 0 640 190" role="img" aria-labelledby="relTitle">
            <title id="relTitle">
              A request tries the primary path, retries once on failure, then falls back to a
              degraded response instead of erroring.
            </title>
            <rect className="box" x="30" y="72" width="90" height="46" />
            <text className="boxText" x="75" y="99">
              Request
            </text>
            <line className="flow" x1="120" y1="95" x2="180" y2="95" />
            <rect className="boxAccent" x="180" y="70" width="120" height="50" />
            <text className="boxText" x="240" y="100">
              Call service
            </text>
            <path className="flowMuted" d="M240 120 C 240 160, 300 160, 300 122" />
            <text className="figHint" x="270" y="178">
              retry once
            </text>
            <line className="flow" x1="300" y1="95" x2="360" y2="95" />
            <rect className="boxWarn" x="360" y="70" width="110" height="50" />
            <text className="boxText" x="415" y="100">
              still failing?
            </text>
            <line className="flow" x1="470" y1="95" x2="520" y2="95" />
            <rect className="box" x="520" y="70" width="100" height="50" />
            <text className="boxText" x="570" y="93">
              cached /
            </text>
            <text className="boxText" x="570" y="109">
              default
            </text>
          </svg>
          <figcaption>
            Reliable systems have a plan for &quot;what if this call fails?&quot; at every hop, not
            just a try/catch that returns 500.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>3. Worked example: reliability &rarr; availability</h2>
        <p>
          The two ideas connect through a simple formula. If a service fails on average every 30 days
          and takes 1 hour to fully recover:
        </p>
        <pre>
          <code>{`MTBF = 30 days   = 720 hours
MTTR = 1 hour

availability = MTBF / (MTBF + MTTR)
             = 720 / (720 + 1)
             = 0.9986        -> ~99.86%

Cut MTTR to 5 minutes (better alerting + auto-restart):
availability = 720 / (720 + 0.083) = 0.99988  -> ~99.99%`}</code>
        </pre>
        <div className="takeaway">
          You do not always need fewer failures &mdash; recovering faster (lower MTTR) is often the
          cheaper path to more nines.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Retrying non-idempotent calls</h3>
            <p>
              Blindly retrying &quot;charge card&quot; on a timeout can bill the customer twice.
              Attach an idempotency key so the server ignores the duplicate.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Backups that are never restored</h3>
            <p>
              Corrupt backups, missing tables, and 12-hour restore times are all discovered at the
              worst possible moment unless you rehearse.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>One failure cascading</h3>
            <p>
              No timeouts means a slow dependency ties up every thread, and a small problem becomes a
              full outage. Fail fast and isolate.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            A payment API times out but you are not sure if the charge went through. What must be
            true about the API before your client can safely retry the request?
          </p>
        </div>
      </section>
    </div>
  );
}
