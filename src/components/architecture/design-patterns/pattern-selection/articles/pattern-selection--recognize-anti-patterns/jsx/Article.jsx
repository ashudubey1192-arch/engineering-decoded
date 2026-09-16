export default function PatternSelectionRecognizeAntiPatternsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An anti-pattern is a commonly repeated response to a problem that looks reasonable but
          reliably makes things worse &mdash; the pattern-related anti-patterns are all versions
          of the same root cause covered in Avoiding Pattern Overuse: reaching for structure
          before there's a real problem that structure solves.
        </p>
        <p>
          Recognizing them matters because each one is easy to justify in the moment ("this is
          more flexible," "this follows best practices") while quietly making the code harder to
          read, test, or change than the plain version would have been.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Four recognizable anti-patterns</h2>
        <ol className="stepList">
          <li>
            <b>Golden Hammer.</b> Applying one favorite pattern to every problem regardless of
            fit &mdash; a team that just learned Visitor starts reaching for it even where a
            simple method would do.
          </li>
          <li>
            <b>Speculative Generality.</b> Building an abstraction (an interface, a plugin point,
            an extra layer) for flexibility that no current requirement actually needs, on the
            chance it might be useful later.
          </li>
          <li>
            <b>Interface Bloat.</b> A Strategy, Repository, or Visitor interface that's grown
            methods for every caller's specific need, until implementing it means writing several
            methods any given implementation doesn't actually use.
          </li>
          <li>
            <b>Pattern-Name-Driven Design.</b> Deciding "this should be a Factory" before naming
            what problem in the code the factory would solve &mdash; designing from the pattern
            catalog inward instead of from the code's actual friction outward.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 120" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="15" width="200" height="30" rx="5" />
            <text className="boxText" x="120" y="34" fontSize="8">"We should use a Factory here"</text>
            <line className="flow" x1="220" y1="30" x2="280" y2="30" />
            <text className="figHint" x="285" y="25">no named problem</text>
            <text className="figHint" x="285" y="40">behind the suggestion</text>
            <rect className="box" x="20" y="70" width="200" height="30" rx="5" />
            <text className="boxText" x="120" y="89" fontSize="7">"Construction is duplicated 5x"</text>
            <line className="flow" x1="220" y1="85" x2="280" y2="85" />
            <text className="figHint" x="285" y="80">Factory follows</text>
            <text className="figHint" x="285" y="95">from a real problem</text>
          </svg>
          <figcaption>Pattern-name-driven design starts from the pattern; well-founded design starts from a named, observed problem.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Speculative generality versus a grounded abstraction</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Anti-pattern: an interface built for hypothetical future storage backends that don't exist yet
interface DataStore { // "we might switch off Postgres someday"
    void save(Object o);
    void delete(Object o);
    void migrate(SchemaVersion from, SchemaVersion to); // no current backend needs this
    void shard(int shardCount);                          // speculative, unused, untested
}
class PostgresDataStore implements DataStore { // the only implementation that will ever exist
    public void save(Object o) { /* ... */ }
    public void delete(Object o) { /* ... */ }
    public void migrate(SchemaVersion from, SchemaVersion to) { throw new UnsupportedOperationException(); }
    public void shard(int shardCount) { throw new UnsupportedOperationException(); } // dead weight
}

// Grounded: the interface has exactly the methods the one real, current need requires
interface ProductRepository {
    Optional<Product> findById(String id);
    void save(Product product);
}
class PostgresProductRepository implements ProductRepository {
    public Optional<Product> findById(String id) { /* ... */ return Optional.empty(); }
    public void save(Product product) { /* ... */ }
}
// If a second backend genuinely arrives later, the interface grows to meet that real need then --
// not before.`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Justifying speculative generality as "just good practice."</b> Flexibility that no
            current requirement uses isn't validated by anything &mdash; it's untested code
            carrying real maintenance cost for a scenario that may never happen.
          </li>
          <li>
            <b>Treating anti-pattern recognition as only about other people's code.</b> The
            golden hammer is easiest to spot in a pattern a team just learned and is now applying
            everywhere &mdash; including one's own recent enthusiasm.
          </li>
          <li>
            <b>Fixing an anti-pattern by adding another pattern on top.</b> Interface bloat isn't
            solved by wrapping the bloated interface in a Facade; it's solved by splitting the
            interface back down to what each caller actually needs.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is <code>DataStore</code>'s <code>migrate()</code> and <code>shard()</code> an instance of speculative generality rather than reasonable forward planning?</p>
          <p>
            <b>Answer:</b> The interface includes methods that no current backend implements
            meaningfully &mdash; <code>PostgresDataStore</code> has to throw{" "}
            <code>UnsupportedOperationException</code> for both, meaning they've never been
            exercised by real code or tests. They exist for a hypothetical future backend that
            may never arrive, at the cost of a larger interface every current and future
            implementer has to satisfy. Grounded design adds methods when a real need creates
            them, not in anticipation of one.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Pattern-related anti-patterns share one root cause: structure introduced before a real,
        current problem justifies it &mdash; recognizing them means asking, for any abstraction,
        what specific present need it's actually serving.
      </p>
    </div>
  );
}
