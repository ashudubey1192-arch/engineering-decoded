import "../css/Article.css";

export default function AlternativeApiStylesWebhooksArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          A webhook flips the direction of a request &mdash; instead of a consumer polling to ask
          "has anything changed," the API calls the consumer's own endpoint the moment something
          actually does.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Registration</b> &mdash; the consumer provides a URL upfront; the server posts events to it as they happen.</li>
          <li><b>Signed payloads</b> &mdash; an HMAC signature over the payload, using a shared secret, lets the receiver verify a webhook genuinely came from the sender and wasn't forged.</li>
          <li><b>Retries on delivery failure</b> &mdash; the receiving endpoint might be temporarily down; the sender needs a retry-with-backoff policy rather than giving up after one attempt.</li>
          <li><b>Idempotent-safe delivery</b> &mdash; the same event might be delivered more than once; an event ID lets the receiver detect and skip duplicates.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly signs every webhook so a partner can verify authenticity before trusting it:
        </p>
        <span className="codeLabel">WEBHOOK DELIVERY</span>
        <div className="codeBlock">
          <pre>{`POST https://partner.example.com/webhooks/parcelly
X-Parcelly-Signature: sha256=4f8a2b91c7...
X-Parcelly-Event-Id: evt_5f21a

{
  "type": "shipment.delivered",
  "shipment_id": "shp_9f8a",
  "delivered_at": "2026-09-18T14:32:00Z"
}`}</pre>
        </div>
        <p>
          The partner recomputes the HMAC over the raw body using their shared secret and confirms
          it matches <code>X-Parcelly-Signature</code> before acting on the event. If their
          endpoint was briefly down, Parcelly retries with exponential backoff; if the same event
          somehow arrives twice, <code>evt_5f21a</code> lets the partner recognize and skip the
          duplicate rather than processing a delivery confirmation twice.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a webhook delivery: Parcelly signs the payload and posts it to the partner's registered URL, the partner verifies the signature before trusting it, then acknowledges receipt.">
          <rect className="box" x="20" y="50" width="90" height="30" rx="5" />
          <text x="65" y="69" className="boxText" style={{fontSize:"6.5px"}}>Parcelly</text>
          <rect className="boxAccent" x="310" y="50" width="90" height="30" rx="5" />
          <text x="355" y="69" className="boxText" style={{fontSize:"6px"}}>Partner URL</text>
          <line className="flow" x1="110" y1="60" x2="308" y2="60" />
          <text x="210" y="45" className="figHint" style={{fontSize:"5.5px"}}>signed POST, event_id included</text>
          <line className="flowMuted" x1="308" y1="90" x2="110" y2="95" />
          <text x="210" y="108" className="figHint" style={{fontSize:"5.5px"}}>partner verifies signature, then acks</text>
        </svg>
        <figcaption>The signature lets the partner trust the event actually came from Parcelly, not from anyone who happened to find the URL.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Sending webhooks with no signature or verification mechanism is the most dangerous
          mistake &mdash; anyone who discovers or guesses a receiving URL could forge fake events
          with no way for the receiver to tell the difference. Not retrying or handling failed
          deliveries at all is the other common one: a consumer's few minutes of downtime becomes a
          permanently lost event, with neither side ever finding out.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an event ID on every webhook matter even though the sender is doing its best to deliver each event exactly once?</p>
        </div>
      </section>
      <p className="takeaway">
        A webhook is a request your API makes to someone else's server, with all the same failure
        modes any HTTP request has &mdash; sign it, retry it sensibly, and give the receiver a
        reliable way to deduplicate.
      </p>
    </div>
  );
}
