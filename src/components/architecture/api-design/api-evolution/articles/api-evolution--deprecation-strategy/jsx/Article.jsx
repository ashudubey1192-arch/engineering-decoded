import "../css/Article.css";

export default function ApiEvolutionDeprecationStrategyArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Deprecating part of an API is a process with a timeline, not a flag you flip &mdash;
          consumers need advance notice, a clear migration path, and visibility into whether
          they've actually finished migrating before anything gets removed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Announce it</b> &mdash; in a changelog, in docs, and ideally directly to consumers known to be using it.</li>
          <li><b>Signal it in every response</b> &mdash; a <code>Deprecation</code> header, and a <code>Sunset</code> header (RFC 8594) naming the removal date.</li>
          <li><b>Monitor real usage</b> &mdash; track which API keys are still calling the deprecated path, not just how long it's been since the announcement.</li>
          <li><b>Only remove once usage is actually zero</b> &mdash; not just because the calendar date arrived.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly deprecated a legacy flat <code>tracking_url</code> string field in favor of a
          structured <code>tracking</code> object with separate carrier, number, and URL fields.
        </p>
        <span className="codeLabel">RESPONSE HEADERS DURING THE DEPRECATION WINDOW</span>
        <div className="codeBlock">
          <pre>{`HTTP/1.1 200 OK
Deprecation: true
Sunset: Wed, 01 Apr 2026 00:00:00 GMT
Link: <https://docs.parcelly.com/migrate/tracking-object>; rel="deprecation"`}</pre>
        </div>
        <p>
          Both fields shipped together for six months. A month before the sunset date, Parcelly's
          usage dashboard showed twelve partners still reading the old field; the partner success
          team reached out to each directly rather than relying on the headers alone. The field was
          removed only after that number reached zero, two weeks past the original sunset date.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Timeline of a deprecation: announce, then a period where both old and new fields are supported together, then a sunset date, then removal only once usage has actually reached zero.">
          {["Announce","Dual support\n(6 months)","Sunset date","Removed\n(usage = 0)"].map((t,i) => (
            <g key={i}>
              <rect className={i===3 ? "boxAccent" : "box"} x={10 + i*108} y="30" width="96" height="46" rx="6" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={58 + i*108} y={50 + li*13} className="boxText" style={{fontSize:"6px"}}>{line}</text>
              ))}
              {i < 3 && <line className="flow" x1={106 + i*108} y1="53" x2={118 + i*108} y2="53" />}
            </g>
          ))}
        </svg>
        <figcaption>Removal is gated on verified zero usage, not just on the calendar reaching the sunset date.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Removing a deprecated field the moment the sunset date passes, without checking actual
          usage, is the most damaging mistake &mdash; a date is a plan, not a guarantee that every
          consumer read the memo. Deprecating something with no dual-support window at all, forcing
          an immediate cutover, is the other common one; it turns a manageable migration into an
          unplanned incident for anyone who missed the announcement.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did Parcelly wait two weeks past its own announced sunset date before actually removing the tracking_url field?</p>
        </div>
      </section>
      <p className="takeaway">
        A sunset date is a target for consumers to migrate by, not a trigger to remove things on.
        Verify usage has actually dropped to zero before anything is taken away for good.
      </p>
    </div>
  );
}
