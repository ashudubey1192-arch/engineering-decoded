import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsWebhooksArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A webhook is a URL you register with another service, saying &quot;when this happens, send
          me an HTTP request here.&quot; It flips the usual client-server direction: the{" "}
          <i>other</i> system calls <i>you</i>.
        </p>
        <p>
          It is how two completely separate companies&apos; systems stay in sync without either one
          polling the other &mdash; the event-driven pattern, stretched across the open internet
          instead of one internal event bus.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Your app accepts payments through Stripe. A customer&apos;s card is charged three days
            later after a delayed bank confirmation &mdash; not at the moment they checked out. You
            cannot poll Stripe every second forever waiting for that. Instead, you registered{" "}
            <code>https://yourapp.com/webhooks/stripe</code>, and the instant that payment finally
            clears, Stripe sends a POST request straight to your server.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Who calls whom</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 140" role="img" aria-labelledby="whTitle">
            <title id="whTitle">
              You register a callback URL once; later, when an event happens on the other system, it
              calls that URL instead of you having to ask.
            </title>
            <rect className="box" x="20" y="20" width="120" height="34" />
            <text className="boxText" x="80" y="42">
              your server
            </text>
            <line className="flow" x1="140" y1="37" x2="330" y2="37" />
            <text className="figHint" x="235" y="27">
              1. register callback URL
            </text>
            <rect className="boxAccent" x="330" y="20" width="130" height="34" />
            <text className="boxText" x="395" y="42">
              Stripe
            </text>
            <text className="figHint" x="395" y="70">
              &hellip;time passes, payment clears&hellip;
            </text>
            <line className="flow" x1="330" y1="95" x2="140" y2="95" />
            <text className="figHint" x="235" y="115">
              2. POST /webhooks/stripe {`{event}`}
            </text>
            <rect className="box" x="20" y="80" width="120" height="34" />
            <text className="boxText" x="80" y="102">
              your server
            </text>
          </svg>
          <figcaption>
            You are now the server for this exchange &mdash; Stripe is the client calling you.
          </figcaption>
        </figure>

        <h2>2. Webhooks vs polling their API</h2>
        <table className="miniTable">
          <caption>WHY WEBHOOKS INSTEAD OF ASKING REPEATEDLY</caption>
          <thead>
            <tr>
              <th>Aspect</th>
              <th>Polling their API</th>
              <th>Webhook</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Latency</td>
              <td>Up to your poll interval</td>
              <td>Near-instant</td>
            </tr>
            <tr>
              <td>Load</td>
              <td>Many wasted &quot;nothing new&quot; calls</td>
              <td>One call, only when something happens</td>
            </tr>
            <tr>
              <td>Who needs to be reachable</td>
              <td>Just you, calling out</td>
              <td>You must expose a public, reachable endpoint</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Making webhooks trustworthy</h2>
        <ul>
          <li>
            <b>Verify the signature.</b> The sender includes a signature (e.g.{" "}
            <code>Stripe-Signature</code>) computed with a shared secret &mdash; check it before
            trusting the payload.
          </li>
          <li>
            <b>Respond fast, process later.</b> Acknowledge with <code>200</code> quickly, then hand
            the real work to a queue &mdash; senders will retry if you are slow, causing duplicates.
          </li>
          <li>
            <b>Be idempotent.</b> The same event can arrive more than once; use its event ID to avoid
            double-processing.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: receiving a payment webhook</h2>
        <ol className="stepList">
          <li>
            <b>Earlier, in your dashboard,</b> you registered{" "}
            <code>https://yourapp.com/webhooks/stripe</code> as your payments callback URL.
          </li>
          <li>
            <b>A payment clears.</b> Stripe sends{" "}
            <code>POST /webhooks/stripe</code> with a JSON event body and a{" "}
            <code>Stripe-Signature</code> header.
          </li>
          <li>
            <b>Your endpoint verifies the signature</b> using your webhook secret &mdash; reject
            anything that does not match, since the URL is public and anyone could try to call it.
          </li>
          <li>
            <b>Check the event ID</b> against what you have already processed; if seen before, return{" "}
            <code>200</code> and do nothing further &mdash; this handles Stripe&apos;s retries safely.
          </li>
          <li>
            <b>Queue the real work</b> (mark the order paid, send a receipt) and return{" "}
            <code>200</code> immediately, well within Stripe&apos;s timeout.
          </li>
          <li>
            <b>If your endpoint is down</b> when the event fires, Stripe retries with backoff for a
            while &mdash; but you should still be able to reconcile via their API as a backup.
          </li>
        </ol>
        <div className="takeaway">
          A webhook is just an HTTP request like any other &mdash; the only twist is that it was the{" "}
          <i>other</i> company&apos;s system that decided to send it, on their timing, not yours.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Trusting the payload without verifying it</h3>
            <p>
              A webhook URL is public. Without signature verification, anyone who finds it can send
              you fake &quot;payment succeeded&quot; events.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Doing slow work before responding</h3>
            <p>
              If you take 30 seconds to reply, the sender may time out and retry &mdash; now you are
              processing the same event twice, concurrently.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No fallback if the webhook never arrives</h3>
            <p>
              Networks fail both ways. Periodically reconciling against the provider&apos;s API
              catches events a lost or misfired webhook missed.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            Your webhook handler processes a refund event, but the sender retries it twice more due
            to a slow response. What two things prevent the customer from being refunded three
            times?
          </p>
        </div>
      </section>
    </div>
  );
}
