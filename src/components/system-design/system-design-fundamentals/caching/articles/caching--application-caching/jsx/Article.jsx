import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingApplicationArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Application caching stores computed results or hot data inside or next to your app server
          &mdash; not in the browser, not at the CDN edge, but right where your business logic runs.
        </p>
        <p>
          It is the layer you have the most control over: you decide exactly what is cached, for how
          long, and when to clear it, because it is your own code reading and writing it.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A &quot;recommended for you&quot; section takes 300 ms to compute per user &mdash; it
            calls three internal services and does some scoring. That result cannot be cached at a
            CDN (it is personalised) and browsers will not share it across users. It belongs in an{" "}
            <b>application cache</b>: computed once, stored under the user&apos;s ID, reused for
            their next few page loads.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. In-process vs distributed</h2>
        <table className="miniTable">
          <caption>TWO PLACES TO PUT AN APPLICATION CACHE</caption>
          <thead>
            <tr>
              <th></th>
              <th>In-process (local)</th>
              <th>Distributed (Redis / Memcached)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Where it lives</td>
              <td>Inside the app server&apos;s own memory</td>
              <td>A separate service, reachable over the network</td>
            </tr>
            <tr>
              <td>Speed</td>
              <td>Fastest possible &mdash; no network hop</td>
              <td>Still fast, but one network round trip</td>
            </tr>
            <tr>
              <td>Shared across servers?</td>
              <td>No &mdash; each server has its own copy</td>
              <td>Yes &mdash; every server sees the same cache</td>
            </tr>
            <tr>
              <td>Survives a restart?</td>
              <td>No &mdash; wiped when the process restarts</td>
              <td>Usually yes &mdash; it is a separate process</td>
            </tr>
            <tr>
              <td>Good for</td>
              <td>Small, per-instance hot data</td>
              <td>Shared state across a fleet of servers</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Why distributed is the default at scale</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="appCacheTitle">
            <title id="appCacheTitle">
              With in-process caches, each app server has its own separate, inconsistent copy; a
              shared Redis cache gives every server the same view.
            </title>
            <text className="figLabel" x="150" y="18">
              IN-PROCESS: 3 different copies
            </text>
            <rect className="box" x="20" y="35" width="90" height="30" />
            <text className="boxText" x="65" y="54">
              server 1
            </text>
            <rect className="box" x="130" y="35" width="90" height="30" />
            <text className="boxText" x="175" y="54">
              server 2
            </text>
            <rect className="box" x="240" y="35" width="90" height="30" />
            <text className="boxText" x="285" y="54">
              server 3
            </text>
            <text className="figHint" x="175" y="80">
              each caches its own copy &mdash; can disagree
            </text>

            <line className="divider" x1="360" y1="10" x2="360" y2="140" />

            <text className="figLabel" x="500" y="18">
              DISTRIBUTED: one shared copy
            </text>
            <rect className="box" x="390" y="35" width="70" height="26" />
            <rect className="box" x="470" y="35" width="70" height="26" />
            <rect className="box" x="550" y="35" width="70" height="26" />
            <line className="flow" x1="425" y1="61" x2="480" y2="100" />
            <line className="flow" x1="505" y1="61" x2="480" y2="100" />
            <line className="flow" x1="585" y1="61" x2="480" y2="100" />
            <rect className="boxAccent" x="420" y="100" width="120" height="34" />
            <text className="boxText" x="480" y="122">
              Redis
            </text>
          </svg>
          <figcaption>
            An in-process cache can go stale differently on every server. A shared cache keeps one
            answer, everywhere.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>3. Step by step: caching a recommendation result</h2>
        <ol className="stepList">
          <li>
            <b>Request comes in</b> for user 42&apos;s recommendations.
          </li>
          <li>
            <b>App checks Redis</b> for key <code>recs:42</code>.
          </li>
          <li>
            <b>Miss:</b> run the expensive scoring logic (300 ms), then{" "}
            <code>SET recs:42 &lt;result&gt; EX 600</code> &mdash; cache it for 10 minutes.
          </li>
          <li>
            <b>Any app server</b> serving user 42&apos;s next request in that window gets a hit
            &mdash; even a different server than the one that computed it.
          </li>
          <li>
            <b>After 10 minutes,</b> the key expires automatically and the next request recomputes a
            fresh result.
          </li>
        </ol>
        <div className="takeaway">
          Application caching is where most of the actual latency wins in a typical web app come
          from &mdash; it sits closest to the expensive work.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>In-process cache behind a load balancer</h3>
            <p>
              Different servers can answer the same user differently until their local caches happen
              to agree &mdash; confusing, inconsistent behaviour.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>No memory limit</h3>
            <p>
              An unbounded cache can grow until the process runs out of memory. Always cap size and
              pick an eviction policy.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Caching mutable objects by reference (in-process)</h3>
            <p>
              If code elsewhere mutates the cached object directly, every reader sees the change
              instantly &mdash; even ones that expected a stable cached value.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Your app runs 10 instances behind a load balancer and caches session data in-process.
            What problem will users notice, and what one change fixes it?
          </p>
        </div>
      </section>
    </div>
  );
}
