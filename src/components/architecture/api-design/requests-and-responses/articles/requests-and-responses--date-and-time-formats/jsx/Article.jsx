import "../css/Article.css";

export default function RequestsAndResponsesDateAndTimeFormatsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Dates and times are a small field with an outsized number of ways to get wrong &mdash;
          pick one unambiguous format, always include a timezone, and most of the classic bugs in
          this area simply never happen.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Use ISO 8601 / RFC 3339</b> &mdash; a format like 2026-09-18T14:30:00Z, not 09/18/2026 or a locale-dependent string.</li>
          <li><b>Always include a timezone or use UTC</b> &mdash; a timestamp with no timezone is ambiguous the moment it crosses a server or client in a different one.</li>
          <li><b>Prefer strings over raw Unix timestamps</b> &mdash; a bare numeric timestamp is compact but silently ambiguous between seconds and milliseconds, and unreadable in logs without tooling.</li>
          <li><b>One instant, one field</b> &mdash; avoid splitting a single point in time into separate date and time fields the client has to recombine.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <table className="miniTable">
          <caption>BEFORE AND AFTER</caption>
          <thead><tr><th>Avoid</th><th>Prefer</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td><code>"09/18/2026"</code></td><td><code>"2026-09-18T00:00:00Z"</code></td><td>MM/DD vs. DD/MM is ambiguous across locales; ISO 8601 never is.</td></tr>
            <tr><td><code>1758153000</code></td><td><code>"2026-09-18T00:30:00Z"</code></td><td>Seconds or milliseconds? A string removes the guesswork and is human-readable in logs.</td></tr>
            <tr><td>separate date and time fields</td><td><code>"2026-09-18T14:30:00Z"</code></td><td>One field for one instant; nothing for the client to recombine or get wrong.</td></tr>
          </tbody>
        </table>
        <p>
          Parcelly's <code>estimated_delivery</code> field is always a full RFC 3339 timestamp in
          UTC, even though a shipping estimate is really "sometime on this day" &mdash; that
          precision is kept because a display client can always round it down to a date, but a
          date-only field could never be turned back into a precise instant if Parcelly later needs
          to add a delivery time window.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 90" role="img" aria-label="Anatomy of an RFC 3339 timestamp: full date, a literal T separator, time, and an explicit UTC offset marked Z.">
          <text x="210" y="20" className="figHint" style={{fontSize:"8px"}}>2026-09-18T14:30:00Z</text>
          {[
            {label:"date", x:35, w:110},
            {label:"separator", x:150, w:20},
            {label:"time", x:175, w:100},
            {label:"UTC offset", x:280, w:20},
          ].map((n,i) => (
            <g key={i}>
              <rect className={i===3 ? "boxAccent" : "box"} x={n.x} y="35" width={n.w} height="22" rx="4" />
              <text x={n.x + n.w/2} y="70" className="figHint" style={{fontSize:"5.5px"}}>{n.label}</text>
            </g>
          ))}
        </svg>
        <figcaption>Every part of the timestamp is explicit &mdash; nothing is left for the reader to assume, including the timezone.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Returning a timestamp with no timezone information is the most common mistake &mdash; it
          works fine until a client in a different timezone assumes it's local time instead of UTC,
          and every delivery estimate is suddenly off by several hours. Mixing formats across an
          API &mdash; Unix timestamps on one endpoint, ISO 8601 strings on another &mdash; is the
          other common one, and it means every client integration needs per-field special-casing
          instead of one shared date parser.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A timestamp field with no timezone marker reads as 14:30 to both a server in UTC and a client in UTC-5. Why is this dangerous even though both sides parse it without an error?</p>
        </div>
      </section>
      <p className="takeaway">
        Timezone ambiguity is a silent bug, not a loud one &mdash; both sides parse the timestamp
        successfully and disagree about what it means. RFC 3339 with an explicit UTC offset removes
        the ambiguity entirely, for a cost of a few extra characters.
      </p>
    </div>
  );
}
