import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsAsynchronousArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          In asynchronous communication, the caller sends a request and moves on immediately. The
          work happens in the background, and the result arrives later &mdash; or never needs to
          come back at all.
        </p>
        <p>
          Nobody is blocked waiting. This decouples <i>when</i> work is requested from <i>when</i> it
          is done, which is exactly what you want for anything that does not need an instant answer.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You upload a 2-minute video. The app instantly says &quot;processing&quot; and lets you
            keep browsing &mdash; it does not freeze for the 90 seconds it takes to transcode. A
            background worker picks up the video, processes it, and a notification appears when it
            is ready. You were never blocked.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Fire, forget (or check back later)</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="asyncTitle">
            <title id="asyncTitle">
              The client sends a request, gets an immediate acknowledgement, and continues; the real
              work finishes later in the background.
            </title>
            <rect className="box" x="20" y="55" width="100" height="40" />
            <text className="boxText" x="70" y="79">
              client
            </text>
            <line className="flow" x1="120" y1="65" x2="240" y2="65" />
            <text className="figHint" x="180" y="55">
              submit job
            </text>
            <rect className="boxAccent" x="240" y="45" width="120" height="40" />
            <text className="boxText" x="300" y="69">
              202 accepted
            </text>
            <line className="flow" x1="120" y1="80" x2="640" y2="80" />
            <text className="figHint" x="380" y="100">
              client keeps working immediately, no waiting
            </text>
            <rect className="box" x="360" y="45" width="140" height="40" />
            <text className="boxText" x="430" y="69">
              worker processes
            </text>
            <line className="flowMuted" x1="240" y1="55" x2="360" y2="55" />
          </svg>
          <figcaption>
            The client gets a fast &quot;got it&quot;, not the final result &mdash; the result shows
            up later through polling, a callback, or a notification.
          </figcaption>
        </figure>

        <h2>2. How the result gets back to you</h2>
        <table className="miniTable">
          <caption>THREE WAYS TO LEARN THE OUTCOME</caption>
          <thead>
            <tr>
              <th>Method</th>
              <th>How it works</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Polling</td>
              <td>Client periodically asks &quot;is it done yet?&quot;</td>
            </tr>
            <tr>
              <td>Webhook / callback</td>
              <td>Server calls a URL you registered when it is done</td>
            </tr>
            <tr>
              <td>Push notification / event</td>
              <td>Server publishes an event or pushes to a connected client</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Sync vs async, side by side</h2>
        <ul>
          <li>
            <b>Synchronous:</b> simple, immediate answer, but the caller is blocked and coupled to the
            callee&apos;s speed.
          </li>
          <li>
            <b>Asynchronous:</b> caller stays responsive, work can be retried and scaled
            independently, but the system is more complex &mdash; you need a way to track and deliver
            results.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: async video processing</h2>
        <ol className="stepList">
          <li>
            <b>Client uploads</b> the video file to <code>POST /videos</code>.
          </li>
          <li>
            <b>Server stores the raw file,</b> creates a job record{" "}
            <code>{`{status: "queued"}`}</code>, and immediately returns{" "}
            <code>202 Accepted</code> with a job ID.
          </li>
          <li>
            <b>The request pushes a message</b> onto a queue: &quot;transcode video 501.&quot; The
            HTTP request is now done.
          </li>
          <li>
            <b>A worker picks up the job</b> whenever it has capacity, transcodes the video, and
            updates the job to <code>{`{status: "done", url: "..."}`}</code>.
          </li>
          <li>
            <b>The client finds out</b> by polling <code>GET /videos/501</code>, or the server sends
            a push notification / websocket event when it flips to done.
          </li>
        </ol>
        <div className="takeaway">
          Asynchronous work needs a place to track status (a job record) and a way to notify
          completion &mdash; the extra plumbing is the price of not blocking the user.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>No way to check status</h3>
            <p>
              &quot;Fire and forget&quot; with no job ID or status endpoint leaves users staring at a
              spinner with no idea if it worked.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Using async for things that need an instant answer</h3>
            <p>
              &quot;Is this password correct?&quot; cannot be async &mdash; the user needs to know
              now, not in a notification five minutes later.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Forgetting failure handling</h3>
            <p>
              Background jobs fail too. Without retries and a dead-letter path, a failed job just
              vanishes silently.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A user submits a large report export. Design the flow: what does the API return
            immediately, and how does the user eventually get the finished file?
          </p>
        </div>
      </section>
    </div>
  );
}
