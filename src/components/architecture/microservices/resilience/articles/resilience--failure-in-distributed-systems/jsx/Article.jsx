import "../css/Article.css";

export default function ResilienceFailureInDistributedSystemsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A network call can fail in a way a local function call never does: partially. The caller
          can be left not knowing whether the other side received the request, processed it, or
          both, and that uncertainty &mdash; not just outright crashes &mdash; is the actual shape
          distributed failure takes.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>A single remote call can end in at least three genuinely different ways:</p>
        <ul className="stepList">
          <li><b>Clean failure</b> &mdash; the callee responds with a clear error before doing anything; safe to know and safe to retry.</li>
          <li><b>Timeout with unknown outcome</b> &mdash; the caller never gets a response and has no way to know if the callee actually completed the work before going silent.</li>
          <li><b>Partial success</b> &mdash; the callee did the work but the response never made it back (a network drop after the fact), so the caller sees a failure for something that actually succeeded.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>PaymentService</code> charges a card and then the connection to
          <code>CheckoutService</code> drops before it can send the success response back.
          <code>CheckoutService</code> sees a timeout and has no idea whether the charge went
          through. Blindly retrying can charge the customer twice; blindly giving up can leave a
          charged customer with no confirmed order &mdash; neither is safe without more information.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a partial failure: PaymentService successfully charges a card, but the response is lost in transit back to CheckoutService, which sees only a timeout and cannot tell whether the charge happened or not.">
          <rect className="box" x="20" y="45" width="100" height="28" rx="6" />
          <text x="70" y="63" className="boxText" style={{fontSize:"6.5px"}}>CheckoutService</text>
          <rect className="boxAccent" x="280" y="45" width="100" height="28" rx="6" />
          <text x="330" y="63" className="boxText" style={{fontSize:"6.5px"}}>PaymentService</text>
          <line className="flow" x1="120" y1="55" x2="278" y2="55" />
          <text x="200" y="45" className="figHint" style={{fontSize:"5.5px"}}>charge request</text>
          <text x="330" y="85" className="figHint" style={{fontSize:"6px"}}>card charged successfully</text>
          <line className="flowMuted" x1="280" y1="65" x2="120" y2="90" />
          <text x="150" y="105" className="figHint" style={{fontSize:"6px"}}>response lost &mdash; caller only sees a timeout</text>
        </svg>
        <figcaption>The charge succeeded, but the caller can't know that &mdash; a timeout looks identical whether the work happened or not.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating every timeout as equivalent to a clean failure and retrying automatically is a
          dangerous default for anything non-idempotent, like a payment charge &mdash; it can turn
          one partial failure into a duplicate charge. The opposite mistake, treating every timeout
          as a hard failure and never retrying, leaves genuinely transient blips (a brief network
          hiccup) looking like permanent errors to the end user.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>CheckoutService gets a timeout from PaymentService. Why can't it safely assume the charge either definitely happened or definitely didn't?</p>
        </div>
      </section>
      <p className="takeaway">
        Distributed failure is defined by uncertainty, not just by crashes &mdash; every pattern in
        the rest of this section exists to make that uncertainty safe to handle instead of ignoring
        it.
      </p>
    </div>
  );
}
