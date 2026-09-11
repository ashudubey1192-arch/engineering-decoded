import "../css/Article.css";

export default function ArchitecturalPatternsClientServerArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Client-server is the foundational pattern behind most of the internet: clients (browsers,
          mobile apps) request things, and servers hold the data and logic to fulfill those
          requests. Almost every other pattern in this section is a refinement of this basic split.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The core idea is separation of concerns: the client handles presentation and user
          interaction, the server handles business logic, data, and security-sensitive
          decisions. This lets many lightweight clients share one (or many) capable servers,
          lets the server be updated without updating every client, and keeps sensitive logic and
          data off devices the operator doesn't control.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Client sends a request.</b> A mobile app requests <code>GET /api/orders/42</code>.</li>
          <li><b>Server authenticates and authorizes.</b> It checks the request is from a logged-in
            user allowed to view that order.</li>
          <li><b>Server fetches and returns data.</b> It queries the database and responds with
            JSON — the client never touches the database directly.</li>
          <li><b>Client renders.</b> The app is responsible only for displaying the data nicely —
            no business rules duplicated on the client.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 120" role="img" aria-label="Diagram of multiple clients sending requests to a server which holds the data and business logic and returns responses.">
          <rect className="box" x="20" y="15" width="70" height="26" rx="4" /><text x="55" y="32" className="boxText">client A</text>
          <rect className="box" x="20" y="50" width="70" height="26" rx="4" /><text x="55" y="67" className="boxText">client B</text>
          <rect className="box" x="20" y="85" width="70" height="26" rx="4" /><text x="55" y="102" className="boxText">client C</text>
          <line className="flow" x1="90" y1="28" x2="230" y2="55" /><line className="flow" x1="90" y1="63" x2="230" y2="60" /><line className="flow" x1="90" y1="98" x2="230" y2="65" />
          <rect className="boxAccent" x="240" y="35" width="120" height="50" rx="6" /><text x="300" y="65" className="boxText">server + data</text>
        </svg>
        <figcaption>Many clients, one shared server holding the logic and data.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Duplicating business rules on the client "for speed" creates drift — the server and
          client can disagree, and any client-side rule can be bypassed by a user calling the API
          directly. The server must always be the source of truth for anything security- or
          correctness-sensitive.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why must authorization checks always be enforced on the server, even if the client also hides UI the user shouldn't see?</p>
        </div>
      </section>
      <p className="takeaway">
        Client-server puts the source of truth on the server and lets many lightweight clients
        share it — nearly every architecture in this section builds on that split.
      </p>
    </div>
  );
}
