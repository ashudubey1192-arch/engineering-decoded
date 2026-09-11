import "../css/Article.css";

export default function DatabasesHowDatabasesGuaranteeDurabilityArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Durability is the promise that once a transaction commits, it survives — even a power
          loss the very next instant. Databases deliver on this with a write-ahead log, not by
          hoping the in-memory state never gets lost.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Before a change is applied to the actual data files, it's first written to a{" "}
          <b>write-ahead log (WAL)</b> — a simple, sequential, append-only file — and that log
          write is flushed to disk (<code>fsync</code>) before the transaction is allowed to report
          success. If the server crashes right after, the data files might be stale, but the WAL
          has a durable record of exactly what needs to be redone. On restart, the database replays
          the WAL forward to reconstruct any committed changes that hadn't yet made it into the main
          data files.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Transaction commits.</b> The change is appended to the WAL first, and that write
            is fsynced to disk.</li>
          <li><b>Client is told "success."</b> Only after the WAL write is durably on disk — not
            when the in-memory change happens.</li>
          <li><b>Main data files update later,</b> in the background, batched for efficiency —
            this lag is safe because the WAL already has the record.</li>
          <li><b>Power fails</b> before the main data file is updated.</li>
          <li><b>On restart, replay the WAL.</b> The database reads the log from the last
            checkpoint forward and reapplies any committed change the data files are missing.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram of a transaction being written to a write-ahead log and fsynced to disk before the client is told success, with the main data file updated later in the background.">
          <rect className="boxAccent" x="20" y="20" width="110" height="30" rx="5" /><text x="75" y="40" className="boxText">transaction</text>
          <line className="flow" x1="130" y1="35" x2="180" y2="35" />
          <rect className="box" x="190" y="20" width="120" height="30" rx="5" /><text x="250" y="40" className="boxText">WAL + fsync</text>
          <line className="flow" x1="310" y1="35" x2="360" y2="35" />
          <rect className="boxAccent" x="370" y="20" width="70" height="30" rx="5" /><text x="405" y="40" className="boxText">"OK"</text>
          <line className="flowMuted" x1="250" y1="50" x2="250" y2="90" />
          <rect className="box" x="190" y="95" width="120" height="30" rx="5" /><text x="250" y="115" className="boxText">data files</text>
          <text x="250" y="135" className="figHint" textAnchor="middle">updated later, replayed from WAL if crash happens first</text>
        </svg>
        <figcaption>Success is reported only once the log entry is durably on disk — the data file can catch up afterward.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Disabling <code>fsync</code> or WAL flushing for a performance boost is a classic trap —
          it makes writes faster but silently removes the durability guarantee, so a crash can lose
          "committed" transactions. Assuming a replica automatically gives you durability is another
          gap: without confirming the write reached the replica's durable log too, a primary
          failure can still lose recent commits.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does writing to the WAL and fsyncing it happen before the client is told the transaction succeeded, rather than after the main data file is updated?</p>
        </div>
      </section>
      <p className="takeaway">
        Durability comes from a sequential, fsynced log written before the client hears "success" —
        everything else about updating the actual data files can happen afterward, safely.
      </p>
    </div>
  );
}
