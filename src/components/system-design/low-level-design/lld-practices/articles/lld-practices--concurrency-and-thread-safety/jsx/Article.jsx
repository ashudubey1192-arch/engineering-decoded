import "../css/Article.css";

export default function LldPracticesConcurrencyAndThreadSafetyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An LLD only needs to worry about thread safety where an object's mutable state can
          genuinely be reached by more than one thread at once &mdash; the design decision is
          recognizing which objects that applies to, not applying it defensively everywhere.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Immutable objects, and objects confined to a single thread, are automatically safe
          &mdash; there's no shared mutable state for two threads to race over. Shared, mutable
          state is where synchronization actually needs to be reasoned about, and the goal is
          synchronizing only the specific section that's actually unsafe, not the whole object.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Revisit the earlier <code>Logger.getInstance()</code> singleton: two threads calling it
          for the first time simultaneously can both see no instance yet and both construct one,
          defeating the &ldquo;exactly one instance&rdquo; guarantee entirely. The fix is
          synchronizing just the check-and-create step (or constructing the instance eagerly at
          class load time, sidestepping the race entirely) &mdash; not synchronizing every method
          the Logger exposes afterward, which would serialize all logging unnecessarily.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of two threads both racing to create a singleton instance under an unsynchronized check, versus a synchronized creation path that only one thread can pass through at a time." >
          <rect className="boxWarn" x="20" y="15" width="180" height="26" rx="5" /><text x="110" y="32" className="boxText" style={{fontSize:"7px"}}>unsynchronized getInstance()</text>
          <text x="30" y="55" className="figHint" style={{fontSize:"6.5px"}}>Thread A: sees null, creates</text>
          <text x="30" y="70" className="figHint" style={{fontSize:"6.5px"}}>Thread B: also sees null, creates</text>
          <text x="30" y="88" className="figHint" style={{fontSize:"6.5px"}}>&rarr; two instances exist</text>
          <line className="divider" x1="220" y1="10" x2="220" y2="100" />
          <rect className="boxAccent" x="240" y="15" width="160" height="26" rx="5" /><text x="320" y="32" className="boxText" style={{fontSize:"7px"}}>synchronized getInstance()</text>
          <text x="250" y="55" className="figHint" style={{fontSize:"6.5px"}}>Thread A: passes, creates</text>
          <text x="250" y="70" className="figHint" style={{fontSize:"6.5px"}}>Thread B: waits, then reuses it</text>
        </svg>
        <figcaption>Without synchronizing the check-and-create step, two threads racing on first creation can each build a separate instance.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Synchronizing an object's every method &ldquo;to be safe&rdquo; serializes access across
          the board and loses most of the concurrency benefit the object needed to provide in the
          first place. Assuming an object is thread-safe just because it looks immutable, when it
          actually holds a mutable reference somewhere inside, is a subtler version of the same
          underlying mistake.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can two threads calling an unsynchronized getInstance() at the same time both end up creating their own instance?</p>
        </div>
      </section>
      <p className="takeaway">
        Synchronize the specific section where mutable state is genuinely shared &mdash; not the
        whole object, and not by default everywhere just in case.
      </p>
    </div>
  );
}
