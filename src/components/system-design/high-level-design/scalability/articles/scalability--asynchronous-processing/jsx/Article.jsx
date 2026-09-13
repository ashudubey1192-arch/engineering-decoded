import "../css/Article.css";

export default function ScalabilityAsynchronousProcessingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Not every piece of work a request triggers needs to finish before the user gets a
          response &mdash; asynchronous processing moves the slow, non-urgent parts off the
          request path entirely.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          When a request does something that&rsquo;s slow but doesn&rsquo;t need to complete before
          responding (sending a confirmation email, generating a video thumbnail, recording an
          analytics event), the API service can hand that work to a queue and respond to the user
          immediately. A separate worker process consumes the queue and does the slow work in the
          background. This keeps request latency low and lets the queue absorb bursts of load that
          would otherwise overwhelm downstream systems.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A user uploads a video.</b> The upload itself must be synchronous &mdash; the
            user is waiting for confirmation it succeeded.</li>
          <li><b>Thumbnail generation and transcoding are slow</b> (seconds to minutes) and
            don&rsquo;t need to block that confirmation.</li>
          <li><b>The API service enqueues a &ldquo;process video&rdquo; job</b> and immediately
            responds &ldquo;upload received.&rdquo;</li>
          <li><b>A pool of background workers</b> pulls jobs off the queue, transcodes the video,
            and updates its status when done &mdash; independently of the original request.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Diagram of an API service responding immediately to the client while placing a slow job on a queue, which background workers process independently." >
          <rect className="box" x="15" y="45" width="70" height="30" rx="5" /><text x="50" y="64" className="boxText">Client</text>
          <line className="flow" x1="85" y1="55" x2="140" y2="55" />
          <rect className="boxAccent" x="145" y="40" width="90" height="30" rx="5" /><text x="190" y="59" className="boxText" style={{fontSize:"9px"}}>API service</text>
          <line className="flow" x1="235" y1="45" x2="85" y2="30" /><text x="160" y="20" className="figHint" style={{fontSize:"8px"}}>immediate response</text>
          <line className="flow" x1="235" y1="60" x2="290" y2="60" /><text x="262" y="80" className="figHint" style={{fontSize:"7px"}}>enqueue</text>
          <rect className="box" x="295" y="45" width="60" height="30" rx="5" /><text x="325" y="64" className="boxText" style={{fontSize:"8px"}}>Queue</text>
          <line className="flow" x1="355" y1="60" x2="400" y2="60" />
          <rect className="box" x="360" y="90" width="70" height="26" rx="5" /><text x="395" y="107" className="boxText" style={{fontSize:"7px"}}>Worker</text>
        </svg>
        <figcaption>The client gets an immediate response while a queue and background workers handle the slow work.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Making genuinely required, user-visible work asynchronous (the upload confirmation itself)
          just to look faster on paper breaks the user experience it was meant to help. The
          opposite mistake &mdash; leaving slow, non-essential work synchronous on the request path
          &mdash; needlessly inflates latency for something the user isn&rsquo;t actually waiting on.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What test decides whether a piece of work triggered by a request should be synchronous or handed off to a queue?</p>
        </div>
      </section>
      <p className="takeaway">
        Ask, for every piece of work a request triggers, whether the user is actually waiting on
        it &mdash; if not, a queue and a background worker keep it off the critical path.
      </p>
    </div>
  );
}
