import "../css/Article.css";

export default function TimeAndOrderingLogicalClocksArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A logical clock captures the order events happened in — without relying on synchronized
          wall-clock time at all. Instead of asking "what time was it," it asks "what did this
          event depend on."
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The key insight is <b>causality</b>: if event A causes event B (A happens, then a
          message about it is sent and received, triggering B), then A must be ordered before B —
          regardless of what either machine's physical clock says. A logical clock is just a
          counter or structure that increments in a way that preserves this "happened-before"
          relationship. Two concrete implementations — Lamport timestamps and vector clocks — build
          on exactly this idea, each with different strengths, covered in the next two articles.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Local event.</b> A node increments its own logical counter for every local event.</li>
          <li><b>Send a message.</b> The current counter value is attached to any outgoing message.</li>
          <li><b>Receive a message.</b> The receiving node updates its own counter to be at least
            one more than the received value — guaranteeing the "receive" event is ordered after
            the "send" event it depended on.</li>
          <li><b>Order is now derivable.</b> Even though the two nodes' physical clocks may
            disagree entirely, the logical counters correctly reflect that the send caused the
            receive.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 140" role="img" aria-label="Diagram of two nodes exchanging a message, with the receiving node updating its logical clock to be greater than the sender's, preserving the causal happened-before relationship regardless of physical clock time.">
          <text x="90" y="20" className="figLabel" textAnchor="middle">NODE A</text>
          <line x1="90" y1="35" x2="90" y2="120" stroke="var(--muted)" />
          <circle className="box" cx="90" cy="55" r="5" /><text x="115" y="59" className="figHint">t=1</text>
          <circle className="boxAccent" cx="90" cy="90" r="5" /><text x="115" y="94" className="figHint">t=2, sends msg</text>
          <text x="330" y="20" className="figLabel" textAnchor="middle">NODE B</text>
          <line x1="330" y1="35" x2="330" y2="120" stroke="var(--muted)" />
          <circle className="box" cx="330" cy="55" r="5" /><text x="300" y="59" className="figHint" textAnchor="end">t=1</text>
          <line className="flow" x1="95" y1="90" x2="325" y2="90" />
          <circle className="boxAccent" cx="330" cy="90" r="5" /><text x="300" y="94" className="figHint" textAnchor="end">receives → t=max(1,2)+1=3</text>
        </svg>
        <figcaption>The receiver's logical clock jumps ahead of the sender's, preserving causal order.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Logical clocks establish a partial or total order consistent with causality — they don't
          reconstruct real-world elapsed time, so using them where you actually need wall-clock
          duration is the wrong tool. It's also easy to forget that a logical clock only captures
          causality that flowed through observed messages — two truly independent (concurrent)
          events may get an arbitrary relative order that doesn't reflect any real dependency.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a logical clock correctly order two causally-related events even when the two machines' physical clocks disagree?</p>
        </div>
      </section>
      <p className="takeaway">
        Logical clocks sidestep unreliable physical time entirely, ordering events by causality —
        what actually depended on what — instead of by wall-clock timestamps.
      </p>
    </div>
  );
}
