import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsPollingArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Polling is repeatedly asking &quot;anything new?&quot; on a timer. It is the simplest way
          to bolt near-real-time updates onto plain request-response, at the cost of constant
          re-asking.
        </p>
        <p>
          The client is in control: it decides how often to check, and the server just answers each
          check honestly &mdash; usually &quot;no, nothing new&quot;.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            An old email client checks for new mail every 60 seconds. Most checks come back empty.
            That is fine for email, where a minute of delay is invisible &mdash; but the server is
            still answering thousands of &quot;nothing new&quot; requests a minute from idle users,
            just in case.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The shape of polling</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 140" role="img" aria-labelledby="pollTitle">
            <title id="pollTitle">
              The client repeatedly asks on a fixed interval; most checks return nothing new until
              one finally does.
            </title>
            <rect className="box" x="20" y="55" width="90" height="34" />
            <text className="boxText" x="65" y="76">
              client
            </text>
            <line className="flow" x1="110" y1="60" x2="240" y2="40" />
            <text className="figHint" x="175" y="30">
              t=0s: check &rarr; no
            </text>
            <line className="flow" x1="110" y1="70" x2="240" y2="70" />
            <text className="figHint" x="175" y="90">
              t=5s: check &rarr; no
            </text>
            <line className="flow" x1="110" y1="80" x2="240" y2="105" />
            <text className="figHint" x="175" y="120">
              t=10s: check &rarr; no
            </text>
            <rect className="boxAccent" x="240" y="50" width="140" height="34" />
            <text className="boxText" x="310" y="71">
              server
            </text>
            <line className="flow" x1="380" y1="55" x2="520" y2="40" />
            <text className="figHint" x="470" y="30">
              t=15s: yes!
            </text>
            <rect className="box" x="520" y="25" width="90" height="30" />
            <text className="boxText" x="565" y="45">
              new data
            </text>
          </svg>
          <figcaption>
            Most requests are wasted work &mdash; the trade-off you accept for simplicity and no
            special infrastructure.
          </figcaption>
        </figure>

        <h2>2. Picking an interval</h2>
        <table className="miniTable">
          <caption>THE INTERVAL IS A TRADE-OFF</caption>
          <thead>
            <tr>
              <th>Interval</th>
              <th>Effect</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Short (1&ndash;2s)</td>
              <td>Feels responsive, but heavy load &mdash; mostly wasted requests</td>
            </tr>
            <tr>
              <td>Long (30&ndash;60s)</td>
              <td>Cheap, but updates feel delayed</td>
            </tr>
            <tr>
              <td>Adaptive / backoff</td>
              <td>Poll fast right after an action, slow down if nothing changes</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Polling vs the alternatives</h2>
        <p>
          Polling trades efficiency for simplicity: no persistent connections, no special server
          support, works through any proxy or firewall. When updates are frequent or truly need to
          feel instant, long polling, SSE, or WebSockets do better &mdash; the later lessons in this
          section cover each one.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: polling for a job&apos;s status</h2>
        <ol className="stepList">
          <li>
            <b>Client submits</b> a video-processing job and gets back{" "}
            <code>{`{jobId: 501, status: "queued"}`}</code>.
          </li>
          <li>
            <b>Client starts polling</b> <code>GET /jobs/501</code> every 3 seconds.
          </li>
          <li>
            <b>Each response</b> returns the current status: <code>queued</code> &rarr;{" "}
            <code>processing</code> &rarr; eventually <code>done</code>.
          </li>
          <li>
            <b>Client stops polling</b> the moment it sees <code>done</code> (or{" "}
            <code>failed</code>), and shows the result.
          </li>
          <li>
            <b>To be kind to the server,</b> the client backs off the interval the longer it waits
            (3s, then 5s, then 10s) instead of hammering forever.
          </li>
        </ol>
        <div className="takeaway">
          Polling is the right first choice when updates are occasional and a few seconds of delay
          is fine &mdash; it needs no special infrastructure at all.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Polling too aggressively</h3>
            <p>
              Every open tab polling every second multiplies server load fast, mostly for
              &quot;nothing changed&quot; answers.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>No backoff or stop condition</h3>
            <p>
              A client that never stops polling &mdash; even after the tab is idle or the job is
              done &mdash; leaks requests forever.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Using polling where real-time really matters</h3>
            <p>
              A stock ticker or multiplayer game position feels broken with 5-second polling
              &mdash; that need calls for WebSockets, not polling.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            You poll <code>GET /notifications</code> every 5 seconds for 10,000 active users, and 99%
            of responses are empty. What is the cost of this design, and what pattern would reduce
            it while keeping updates almost as fast?
          </p>
        </div>
      </section>
    </div>
  );
}
