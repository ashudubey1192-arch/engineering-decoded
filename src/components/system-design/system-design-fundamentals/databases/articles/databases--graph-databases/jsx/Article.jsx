import "../css/Article.css";

export default function DatabasesGraphDatabasesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A graph database (Neo4j, Amazon Neptune) stores data as nodes and the relationships
          (edges) between them as first-class citizens, making "how are these two things
          connected" a fast, native operation instead of a chain of joins.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          In a relational database, "friends of friends of friends" means joining the same table
          against itself three times — each join gets more expensive. In a graph database, each
          node stores direct pointers to its edges, so walking from node to node is a constant-time
          hop regardless of how big the overall graph is. That's the core trade: relationships are
          cheap to traverse, at the cost of being a less natural fit for tabular reporting.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Model the domain as nodes and edges.</b> People are nodes; <code>FOLLOWS</code>{" "}
            and <code>FRIENDS_WITH</code> are edges between them.</li>
          <li><b>Ask a relationship question.</b> "Recommend people two hops away that I don't
            already follow."</li>
          <li><b>Traverse, don't join.</b> The database walks outward from your node,
            hop by hop, following edges directly.</li>
          <li><b>Get a result in milliseconds</b> even on a graph with hundreds of millions of
            edges, because each hop is a pointer lookup, not a table scan.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 160" role="img" aria-label="Diagram of a small social graph, showing a two-hop traversal from one person through a mutual friend to a recommended new connection.">
          <circle className="boxAccent" cx="60" cy="80" r="24" /><text x="60" y="85" className="boxText">You</text>
          <line className="flow" x1="84" y1="80" x2="176" y2="80" />
          <circle className="box" cx="200" cy="80" r="24" /><text x="200" y="85" className="boxText">Ann</text>
          <line className="flow" x1="224" y1="80" x2="316" y2="80" />
          <circle className="box" cx="340" cy="80" r="24" /><text x="340" y="85" className="boxText">Bo</text>
          <text x="130" y="65" className="figHint" textAnchor="middle">FOLLOWS</text>
          <text x="270" y="65" className="figHint" textAnchor="middle">FOLLOWS</text>
          <text x="340" y="130" className="figHint" textAnchor="middle">2 hops → recommend Bo</text>
        </svg>
        <figcaption>Each hop is a direct pointer walk, not a re-join of the whole table.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using a graph database for data that isn't really relationship-heavy adds complexity for
          no benefit — most CRUD apps don't need it. And "supernodes" (a celebrity account
          followed by millions) can make traversals through that one node slow, which needs
          specific handling in graph schema design.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does "friends of friends" get more expensive in a relational database as the hop count grows, but not in a graph database?</p>
        </div>
      </section>
      <p className="takeaway">
        Reach for a graph database when the relationships between records — not just the records
        themselves — are what your queries actually care about.
      </p>
    </div>
  );
}
