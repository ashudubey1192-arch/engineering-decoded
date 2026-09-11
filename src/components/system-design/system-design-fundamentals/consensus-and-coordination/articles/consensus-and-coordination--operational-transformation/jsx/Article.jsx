import "../css/Article.css";

export default function ConsensusAndCoordinationOperationalTransformationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Operational Transformation (OT) is the technique behind real-time collaborative editors
          like Google Docs — it lets multiple people edit the same document simultaneously by
          transforming each person's operations to account for others' concurrent edits.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          When two people edit concurrently, their operations (like "insert 'x' at position 5")
          were computed against a document state that's now out of date on one side. OT defines
          transformation functions that adjust an incoming operation so it still makes sense
          against the current state — for example, shifting an insert position forward if someone
          else's earlier edit added characters before that point. Every client and the server apply
          these transformed operations so everyone converges to the same final document, even
          though each person typed against a slightly different, evolving view.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Starting text:</b> <code>"Hello world"</code> — both users see this.</li>
          <li><b>User A inserts</b> <code>"cruel "</code> at position 6:{" "}
            <code>"Hello cruel world"</code>, and sends that operation to the server.</li>
          <li><b>User B, concurrently, inserts</b> <code>"!"</code> at position 11 (the end),
            based on the original text — before seeing A's edit.</li>
          <li><b>Transform B's operation.</b> Since A's insert added 6 characters before position
            11, B's operation is transformed to insert at position 17 instead — landing correctly
            at the new end of the combined text: <code>"Hello cruel world!"</code>.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of two users concurrently editing the same document, with one user's operation transformed to account for the position shift caused by the other user's earlier concurrent insert.">
          <rect className="box" x="20" y="20" width="160" height="28" rx="4" /><text x="100" y="38" className="boxText">A: insert "cruel " @6</text>
          <rect className="box" x="20" y="60" width="160" height="28" rx="4" /><text x="100" y="78" className="boxText">B: insert "!" @11</text>
          <line className="flow" x1="180" y1="74" x2="230" y2="74" />
          <rect className="boxAccent" x="240" y="60" width="180" height="28" rx="4" /><text x="330" y="78" className="boxText">transformed: insert "!" @17</text>
          <text x="220" y="115" className="figHint" textAnchor="middle">B's position shifts to account for A's earlier insert</text>
        </svg>
        <figcaption>OT adjusts each operation's position so concurrent edits still land correctly together.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Implementing OT's transformation functions correctly for every pair of operation types is
          notoriously tricky to get exactly right — most teams reach for a mature library or a
          CRDT-based alternative (which sidesteps transformation entirely) rather than
          implementing OT from scratch. Assuming OT and CRDTs are interchangeable is another
          common confusion — they solve the same class of problem with different tradeoffs around
          server involvement and complexity.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does user B's insert position need to be transformed even though B typed against what looked like the current document?</p>
        </div>
      </section>
      <p className="takeaway">
        Operational Transformation makes real-time collaborative editing feel seamless by
        adjusting each concurrent edit to account for others — powerful, but intricate enough that
        most teams lean on existing libraries rather than building it from scratch.
      </p>
    </div>
  );
}
