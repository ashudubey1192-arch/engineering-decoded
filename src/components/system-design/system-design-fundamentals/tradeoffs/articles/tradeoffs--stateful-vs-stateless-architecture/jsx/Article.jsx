import "../css/Article.css";

export default function TradeoffsStatefulVsStatelessArchitectureArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A stateless service keeps no memory of previous requests between calls — every request
          carries everything needed to handle it. A stateful service remembers something about a
          client or session between requests. That difference is what makes stateless services so
          much easier to scale horizontally.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Because a stateless server holds nothing client-specific in memory, any instance can
          handle any request — a load balancer can route requests anywhere, and adding or removing
          instances is trivial. A stateful server (or one relying on in-memory session data) needs
          requests from the same client to keep landing on the same instance (sticky sessions), or
          it needs that state moved somewhere shared, like a database or cache, which is usually the
          better long-term fix.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Start stateful.</b> A server stores each user's shopping cart in its own memory —
            simple, but that user must always hit the same server.</li>
          <li><b>Add a second server for scale.</b> Now a user's requests need "sticky" routing to
            the server holding their cart — the load balancer can't freely distribute load.</li>
          <li><b>Move state out.</b> The cart moves to a shared Redis store; any server can read or
            write it.</li>
          <li><b>Now stateless.</b> Requests can be load-balanced freely across any number of
            servers — none of them hold client-specific memory anymore.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram contrasting a stateful server holding session data in memory requiring sticky routing versus stateless servers reading shared state from an external store so any server can handle any request.">
          <text x="100" y="18" className="figLabel" textAnchor="middle">STATEFUL</text>
          <rect className="box" x="40" y="35" width="120" height="40" rx="5" /><text x="100" y="58" className="boxText">server (has cart in RAM)</text>
          <text x="100" y="95" className="figHint" textAnchor="middle">this user must always return here</text>
          <line className="divider" x1="210" y1="10" x2="210" y2="140" />
          <text x="330" y="18" className="figLabel" textAnchor="middle">STATELESS</text>
          <rect className="box" x="240" y="35" width="60" height="30" rx="5" /><text x="270" y="55" className="boxText">server A</text>
          <rect className="box" x="320" y="35" width="60" height="30" rx="5" /><text x="350" y="55" className="boxText">server B</text>
          <line className="flow" x1="270" y1="65" x2="310" y2="100" /><line className="flow" x1="350" y1="65" x2="310" y2="100" />
          <rect className="boxAccent" x="270" y="100" width="80" height="30" rx="5" /><text x="310" y="120" className="boxText">shared store</text>
        </svg>
        <figcaption>Moving state to a shared store frees any server to handle any request.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Leaning on sticky sessions as a permanent scaling strategy just delays the real fix — it
          also means one server crashing loses every session pinned to it. Going fully stateless
          isn't free either: it usually shifts state to a shared store, and that store now has to
          be fast and available enough not to become the new bottleneck.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does moving session state out of server memory and into a shared store make horizontal scaling significantly easier?</p>
        </div>
      </section>
      <p className="takeaway">
        Stateless services scale horizontally with almost no coordination cost — the price is
        moving state somewhere shared, which then has its own availability and speed to worry about.
      </p>
    </div>
  );
}
