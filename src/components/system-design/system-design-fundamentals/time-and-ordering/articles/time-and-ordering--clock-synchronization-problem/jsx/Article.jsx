import "../css/Article.css";

export default function TimeAndOrderingClockSynchronizationProblemArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Every machine has its own physical clock, and those clocks drift apart over time — even
          machines synced via NTP can differ by tens of milliseconds. That makes "which of these
          two events happened first" a genuinely hard question across machines.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          If machine A's clock reads a timestamp slightly ahead of machine B's, an event that
          truly happened first on B can carry a <i>later</i> timestamp than an event that happened
          second on A. Naively comparing wall-clock timestamps across machines to determine order
          can therefore simply be wrong. Protocols like NTP reduce drift but never eliminate it —
          which is why distributed systems that need a reliable notion of "what happened before
          what" turn to logical clocks instead of trusting physical clocks alone.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Two machines, slightly different clocks.</b> Machine A's clock is 50ms ahead of
            machine B's.</li>
          <li><b>B writes first, in real time.</b> B updates a record at its local time 10:00:00.000.</li>
          <li><b>A writes second, in real time,</b> just 20ms later, at its local time
            10:00:00.070 (50ms ahead + 20ms elapsed).</li>
          <li><b>Compare timestamps naively:</b> both look like A came after B, which happens to
            be correct here — but flip the drift direction or the timing slightly and a
            "last-write-wins" system using raw timestamps can easily pick the wrong write as
            newest.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of two machines with clocks offset from each other, showing how comparing their raw timestamps can misjudge which event actually happened first in real time.">
          <line x1="20" y1="35" x2="420" y2="35" stroke="var(--muted)" />
          <text x="20" y="25" className="figHint">machine A clock</text>
          <circle className="boxAccent" cx="260" cy="35" r="6" /><text x="260" y="55" className="figHint" textAnchor="middle">writes at 10:00:00.070</text>
          <line x1="20" y1="85" x2="420" y2="85" stroke="var(--muted)" />
          <text x="20" y="75" className="figHint">machine B clock</text>
          <circle className="box" cx="210" cy="85" r="6" /><text x="210" y="105" className="figHint" textAnchor="middle">writes at 10:00:00.000</text>
          <text x="220" y="122" className="figHint" textAnchor="middle">real order needs more than raw timestamps to trust</text>
        </svg>
        <figcaption>Clock drift between machines can make raw timestamp comparison unreliable for true event order.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Trusting <code>System.currentTimeMillis()</code>-style timestamps across machines for
          anything order-sensitive (like conflict resolution) is a recurring source of subtle bugs.
          Assuming NTP makes clocks perfectly synchronized is the underlying misconception —
          NTP reduces drift to a bounded error, it doesn't erase it.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can comparing two machines' local timestamps give the wrong answer for which of two events truly happened first?</p>
        </div>
      </section>
      <p className="takeaway">
        Physical clocks across machines are never perfectly in sync — anything that needs a
        trustworthy notion of event order needs a mechanism other than raw timestamp comparison.
      </p>
    </div>
  );
}
