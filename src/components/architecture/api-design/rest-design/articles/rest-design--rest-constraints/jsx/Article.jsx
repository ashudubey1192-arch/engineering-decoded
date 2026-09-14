import "../css/Article.css";

export default function RestDesignRestConstraintsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          REST isn't "JSON over HTTP" &mdash; it's a specific set of six architectural constraints
          from Roy Fielding's 2000 dissertation, and most APIs people call "RESTful" only actually
          follow some of them. Knowing all six makes it clear which trade-offs you're accepting,
          and which you've quietly skipped.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>THE SIX REST CONSTRAINTS</caption>
          <thead><tr><th>Constraint</th><th>What it requires</th></tr></thead>
          <tbody>
            <tr><td>Client&ndash;server</td><td>UI concerns and data storage are separated; either can evolve independently.</td></tr>
            <tr><td>Statelessness</td><td>Every request carries everything needed to understand it; the server keeps no session between requests.</td></tr>
            <tr><td>Cacheability</td><td>Every response says, explicitly, whether it can be cached and for how long.</td></tr>
            <tr><td>Uniform interface</td><td>Resources are identified by URIs and manipulated through representations, using a small standard method set.</td></tr>
            <tr><td>Layered system</td><td>A client can't tell whether it's talking directly to the server or through a gateway, cache, or load balancer.</td></tr>
            <tr><td>Code on demand <i>(optional)</i></td><td>A server can extend client behavior by sending executable code, like a browser fetching JavaScript.</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's API follows five of the six without much effort. It's stateless: every request
          carries its bearer token in the <code>Authorization</code> header, so any of Parcelly's
          API servers can handle any request with no shared session state. It's cacheable: a
          <code>GET /v1/carriers</code> response ships an <code>ETag</code> and a
          <code>Cache-Control</code> header. It sits behind a layered stack of a CDN, a load
          balancer, and a gateway, and no client can tell. What it skips is the stricter reading of
          "uniform interface" known as HATEOAS &mdash; responses don't embed links describing what
          a client can do next; partners are expected to already know the API's endpoints from its
          documentation. That's normal: almost no production API implements HATEOAS in full, and
          calling an API "RESTful" in practice usually means "follows the other five reasonably
          well," not "implements all of Fielding's dissertation."
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram contrasting a stateless request, which carries its own token and full context to any server, against a stateful request that instead relies on a session tied to one particular server.">
          <text x="110" y="18" className="figLabel">STATELESS (Parcelly)</text>
          <rect className="box" x="30" y="35" width="70" height="26" rx="5" />
          <text x="65" y="52" className="boxText" style={{fontSize:"6px"}}>Client</text>
          <rect className="boxAccent" x="150" y="35" width="90" height="26" rx="5" />
          <text x="195" y="52" className="boxText" style={{fontSize:"5.5px"}}>Any API server</text>
          <line className="flow" x1="100" y1="48" x2="148" y2="48" />
          <text x="124" y="40" className="figHint" style={{fontSize:"5px"}}>token + full params</text>
          <text x="145" y="80" className="figHint" style={{fontSize:"6px"}}>no memory needed between requests</text>

          <line className="divider" x1="280" y1="10" x2="280" y2="130" />

          <text x="365" y="18" className="figLabel">STATEFUL (avoided)</text>
          <rect className="box" x="295" y="35" width="70" height="26" rx="5" />
          <text x="330" y="52" className="boxText" style={{fontSize:"6px"}}>Client</text>
          <rect className="boxWarn" x="395" y="35" width="35" height="26" rx="4" />
          <text x="412" y="52" className="boxText" style={{fontSize:"5px"}}>Server A</text>
          <line className="flow" x1="365" y1="48" x2="393" y2="48" />
          <text x="365" y="90" className="figHint" style={{fontSize:"6px"}}>only Server A remembers this client's session</text>
        </svg>
        <figcaption>Statelessness means any server can handle any request &mdash; nothing about "who this client is mid-conversation" lives only in one server's memory.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The most common mistake is assuming REST requires JSON &mdash; it doesn't; REST is
          format-agnostic, and plenty of RESTful APIs speak XML or other formats. The more damaging
          mistake is quietly breaking statelessness: storing "what step of a multi-step operation
          this client is on" in a server-side session tied to one server instance. It usually works
          in testing, then fails the moment a load balancer routes a client's next request to a
          different server that has never heard of them.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>An API stores "which page of results the client was on" in a server-side session instead of accepting a page parameter on every request. Which REST constraint does this break, and what happens when a load balancer sends the next request to a different server?</p>
        </div>
      </section>
      <p className="takeaway">
        "RESTful" is a spectrum, not a checkbox &mdash; know which of the six constraints your API
        actually follows, especially statelessness, since violating it quietly is the constraint
        most likely to cause a production outage rather than just an academic complaint.
      </p>
    </div>
  );
}
