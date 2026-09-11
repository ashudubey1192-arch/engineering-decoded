import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsSynchronousArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          In synchronous communication, the caller sends a request and <b>waits</b> &mdash; blocked
          &mdash; until the response comes back before doing anything else.
        </p>
        <p>
          It is the simplest way for two things to talk: ask, wait, get an answer, continue. Almost
          every API call you have made (a browser fetching a page, a mobile app calling a login
          endpoint) is synchronous by default.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You tap &quot;Log in.&quot; The app sends your credentials to the server and shows a
            spinner. Nothing else on that screen happens until the server replies &mdash; success or
            error. That waiting spinner <i>is</i> synchronous communication made visible.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. What &quot;blocking&quot; means</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="syncTitle">
            <title id="syncTitle">
              The client sends a request and sits idle until the server responds, then continues.
            </title>
            <rect className="box" x="20" y="45" width="100" height="40" />
            <text className="boxText" x="70" y="69">
              client
            </text>
            <line className="flow" x1="120" y1="55" x2="260" y2="55" />
            <text className="figHint" x="190" y="45">
              request
            </text>
            <rect className="boxWarn" x="260" y="35" width="140" height="60" />
            <text className="boxText" x="330" y="60">
              client waits
            </text>
            <text className="boxText" x="330" y="78">
              (blocked)
            </text>
            <line className="flow" x1="400" y1="80" x2="540" y2="80" />
            <text className="figHint" x="470" y="70">
              response
            </text>
            <rect className="boxAccent" x="540" y="45" width="80" height="40" />
            <text className="boxText" x="580" y="69">
              server
            </text>
          </svg>
          <figcaption>
            The client cannot do anything else useful for that flow until the response arrives
            &mdash; it is committed to waiting.
          </figcaption>
        </figure>

        <h2>2. Why it is the default</h2>
        <ul>
          <li>
            <b>Simple to reason about:</b> code reads top to bottom &mdash; call, then use the
            result.
          </li>
          <li>
            <b>Immediate feedback:</b> the caller knows success or failure right away.
          </li>
          <li>
            <b>Easy to debug:</b> one request, one response, one stack trace.
          </li>
        </ul>

        <h2>3. Where it struggles</h2>
        <table className="miniTable">
          <caption>THE COST OF WAITING</caption>
          <thead>
            <tr>
              <th>Problem</th>
              <th>Why it happens</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Slow chains</td>
              <td>A calls B calls C &mdash; total time is the sum of every hop</td>
            </tr>
            <tr>
              <td>Wasted resources</td>
              <td>A thread sits idle just holding the connection open</td>
            </tr>
            <tr>
              <td>Cascading failure</td>
              <td>If C is slow, B backs up, then A backs up too</td>
            </tr>
            <tr>
              <td>Tight coupling</td>
              <td>The caller cannot proceed until the callee is available</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="example">
        <h2>4. Step by step: a synchronous checkout call</h2>
        <ol className="stepList">
          <li>
            <b>Client calls</b> <code>POST /checkout</code> and stops &mdash; the UI shows a spinner.
          </li>
          <li>
            <b>The checkout service calls</b> the payment service synchronously and waits for it.
          </li>
          <li>
            <b>The payment service calls</b> the bank&apos;s API synchronously and waits.
          </li>
          <li>
            <b>The bank is slow today</b> (3 seconds). That delay now sits inside every layer above
            it &mdash; the user waits 3+ seconds, and the checkout service&apos;s thread was tied up
            the whole time.
          </li>
          <li>
            <b>The fix isn&apos;t &quot;never use sync&quot;</b> &mdash; it is choosing which calls
            truly need an immediate answer (charge the card: yes) versus which can be handed off
            (send a receipt email: no, that can be asynchronous).
          </li>
        </ol>
        <div className="takeaway">
          Synchronous calls are the right default for anything the user is actively waiting on.
          Chain too many of them together and their latencies simply add up.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Making everything synchronous</h3>
            <p>
              Sending a welcome email inline with signup ties the user&apos;s wait time to your email
              provider&apos;s uptime for no reason.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>No timeout</h3>
            <p>
              Without a timeout, one slow dependency can block a caller forever, tying up threads and
              spreading the slowdown upstream.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Deep synchronous chains</h3>
            <p>
              Five services calling each other synchronously in sequence means the user feels the sum
              of all five latencies, plus every failure.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            An order flow does: validate card (needs an answer now), charge card (needs an answer
            now), send confirmation email (does not). Which calls should stay synchronous, and which
            should not?
          </p>
        </div>
      </section>
    </div>
  );
}
