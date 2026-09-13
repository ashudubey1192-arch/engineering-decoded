import "../css/Article.css";

export default function HldCaseStudiesUrlShortenerArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          &ldquo;Given a long URL, return a short one that redirects back to it.&rdquo; It&rsquo;s
          often the very first system design question a candidate hears, precisely because it&rsquo;s
          small enough to finish in one session &mdash; which means the interviewer isn&rsquo;t
          grading scope, they&rsquo;re grading whether you notice this is a wildly read-heavy
          service and design the write path accordingly.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Functional requirements are short: turn a long URL into a short code, redirect visitors
          from the short code back to the original, and optionally support a custom alias or an
          expiry date. The requirement that actually shapes the design is non-functional &mdash;
          redirects must be fast, codes must never collide, and reads will outnumber writes by
          orders of magnitude, since one shortened link gets visited far more times than it gets
          created.
        </p>
        <p>
          That leaves one core decision: how do you generate the code? Hashing the long URL and
          keeping a few characters is simple, but two different URLs can hash to the same short
          prefix, so every write needs a collision check and a retry loop. The alternative is a
          counter: assign each new URL the next integer and base62-encode it &mdash; unique by
          construction, no collision check needed. The catch is that a single shared counter
          becomes exactly the kind of bottleneck a read-heavy system can&rsquo;t afford on its
          write path, so production systems hand each application server a block of IDs (say,
          the next 1,000) to consume locally before asking for another block.
        </p>
        <table className="miniTable">
          <caption>Two ways to generate the code</caption>
          <thead><tr><th>Approach</th><th>Uniqueness</th><th>Cost</th></tr></thead>
          <tbody>
            <tr><td>Hash of the URL</td><td>Not guaranteed</td><td>Retry loop on every collision</td></tr>
            <tr><td>Counter + base62</td><td>Guaranteed</td><td>Needs ID ranges to avoid one shared counter</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A user submits a long URL.</b> The app server handling the request already holds
            a locally-claimed block of IDs, so it takes the next free one without talking to any
            other server.</li>
          <li><b>That ID is base62-encoded</b> into a short code and written to the datastore as
            <code>{'{code: longURL}'}</code>, along with the owner and any expiry.</li>
          <li><b>A visitor opens the short link.</b> The app checks a cache first, since reads so
            heavily outnumber writes &mdash; a cache hit returns the long URL immediately.</li>
          <li><b>On a cache miss,</b> the app looks up the datastore, backfills the cache with
            that mapping, and then redirects &mdash; using a 302, not a 301, so every visit still
            passes through the service and can be counted.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram of the write path, where a server claims IDs from a local block before writing to the datastore, above the read path, where a visitor is served from a cache first and the datastore is touched only on a miss." >
          <rect className="box" x="20" y="20" width="110" height="32" rx="6" /><text x="75" y="40" className="boxText" style={{fontSize:"8px"}}>New URL</text>
          <line className="flow" x1="130" y1="36" x2="175" y2="36" /><text x="152" y="26" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>local ID block</text>
          <rect className="boxAccent" x="180" y="20" width="120" height="32" rx="6" /><text x="240" y="40" className="boxText" style={{fontSize:"8px"}}>App server</text>
          <line className="flow" x1="300" y1="36" x2="345" y2="36" />
          <rect className="box" x="350" y="20" width="95" height="32" rx="6" /><text x="397" y="40" className="boxText" style={{fontSize:"8px"}}>Datastore</text>
          <line className="divider" x1="20" y1="75" x2="445" y2="75" />
          <rect className="box" x="20" y="95" width="140" height="32" rx="6" /><text x="90" y="115" className="boxText" style={{fontSize:"8px"}}>Short link visited</text>
          <line className="flow" x1="160" y1="111" x2="205" y2="111" /><text x="182" y="101" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>check</text>
          <rect className="boxAccent" x="210" y="95" width="90" height="32" rx="6" /><text x="255" y="115" className="boxText" style={{fontSize:"8px"}}>Cache</text>
          <line className="flow" x1="255" y1="95" x2="255" y2="52" /><text x="270" y="75" className="figHint" style={{fontSize:"6.5px"}}>hit &rarr; redirect</text>
          <line className="flowMuted" x1="300" y1="111" x2="350" y2="111" /><text x="325" y="101" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>miss</text>
          <line className="flowMuted" x1="397" y1="95" x2="397" y2="52" />
        </svg>
        <figcaption>Writes claim IDs from a local block before reaching the datastore; reads are served from cache first, touching the datastore only on a miss.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using one shared, global counter directly &mdash; every write then serializes through a
          single point of contention, exactly what a read-heavy system doesn&rsquo;t need on its
          write side. Skipping the cache because &ldquo;it&rsquo;s just a lookup&rdquo; ignores
          that reads can outnumber writes a thousand to one, so the datastore becomes the
          bottleneck without one. Defaulting to a permanent 301 redirect also quietly gives up the
          ability to count clicks or ever repoint the mapping, since browsers may stop asking the
          service at all once they&rsquo;ve cached a &ldquo;permanent&rdquo; response.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does handing each server a pre-claimed block of IDs, instead of one shared counter, matter for this system's write path?</p>
        </div>
      </section>
      <p className="takeaway">
        A small-sounding prompt is really a test of read/write judgment: get ID generation off the
        write path&rsquo;s critical section and put a cache in front of the read path, and the
        rest of the design falls out on its own.
      </p>
    </div>
  );
}
