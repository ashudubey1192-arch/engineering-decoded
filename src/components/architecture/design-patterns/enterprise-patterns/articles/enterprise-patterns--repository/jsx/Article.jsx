export default function EnterprisePatternsRepositoryArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Repository mediates between the domain and data-mapping layers using a collection-like
          interface for accessing objects, so application code can add, remove, and query objects
          without knowing whether they're backed by SQL, a document store, or an in-memory map.
          This section covers Fowler's enterprise application patterns generically &mdash; the
          same pattern names may be familiar from a DDD context, but here they're independent
          building blocks for any data-driven application, not specifically aggregate-persistence
          tools.
        </p>
        <p>
          Intent: give the rest of the application a collection-like interface for querying and
          persisting objects, hiding the actual storage technology behind it. Applicability: data
          access logic (queries, ORM calls, connection handling) is scattered across the codebase
          and needs a single, testable seam.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building a repository, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Define the interface in domain vocabulary, not storage vocabulary.</b>{" "}
            <code>ProductRepository.findByCategory(Category)</code>, never{" "}
            <code>executeQuery(String sql)</code>.
          </li>
          <li>
            <b>Implement it against one specific storage technology.</b> A{" "}
            <code>JdbcProductRepository</code> translating each method into SQL, hidden entirely
            behind the interface.
          </li>
          <li>
            <b>Let application code depend only on the interface.</b> A{" "}
            <code>CatalogService</code> holds a <code>ProductRepository</code>, never a{" "}
            <code>Connection</code> or an ORM session directly.
          </li>
          <li>
            <b>Provide an in-memory implementation for fast, dependency-free tests.</b> An{" "}
            <code>InMemoryProductRepository</code> backed by a plain <code>Map</code>, satisfying
            the same interface with zero database involved.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="50" width="130" height="40" rx="6" />
            <text className="boxText" x="85" y="73" fontSize="10">CatalogService</text>
            <line className="flow" x1="150" y1="70" x2="200" y2="70" />
            <rect className="boxAccent" x="200" y="50" width="150" height="40" rx="6" />
            <text className="boxText" x="275" y="73" fontSize="9">ProductRepository</text>
            <line className="flowMuted" x1="350" y1="60" x2="410" y2="30" />
            <line className="flowMuted" x1="350" y1="80" x2="410" y2="110" />
            <text className="figHint" x="440" y="30">Jdbc impl</text>
            <text className="figHint" x="440" y="110">InMemory impl</text>
          </svg>
          <figcaption>Application code depends only on the interface; either implementation can sit behind it.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A collection-like interface, two implementations</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface ProductRepository {
    Optional<Product> findById(String id);
    List<Product> findByCategory(String category);
    void save(Product product);
}

class JdbcProductRepository implements ProductRepository {
    public Optional<Product> findById(String id) { /* SQL SELECT, mapped to Product */ return Optional.empty(); }
    public List<Product> findByCategory(String category) { /* SQL SELECT WHERE category = ? */ return List.of(); }
    public void save(Product product) { /* SQL INSERT/UPDATE */ }
}

class InMemoryProductRepository implements ProductRepository { // for fast tests
    private final Map<String, Product> store = new HashMap<>();
    public Optional<Product> findById(String id) { return Optional.ofNullable(store.get(id)); }
    public List<Product> findByCategory(String category) {
        return store.values().stream().filter(p -> p.category().equals(category)).toList();
    }
    public void save(Product product) { store.put(product.id(), product); }
}

class CatalogService {
    private final ProductRepository repository; // depends only on the interface
    CatalogService(ProductRepository repository) { this.repository = repository; }
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting SQL or ORM-specific types leak through the interface.</b> A method
            returning a <code>ResultSet</code> or an ORM entity type has stopped being a true
            abstraction over storage.
          </li>
          <li>
            <b>Adding query methods that only one specific call site ever uses.</b> A repository
            interface bloated with narrow, single-purpose methods is harder to implement
            consistently across every storage backend it needs to support.
          </li>
          <li>
            <b>Putting business logic inside the repository implementation.</b> A repository's job
            is translation between domain objects and storage, not enforcing business rules
            &mdash; those belong in the domain or application layer.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why can <code>CatalogService</code> be tested with <code>InMemoryProductRepository</code> instead of a real database, with no changes to <code>CatalogService</code> itself?</p>
          <p>
            <b>Answer:</b> <code>CatalogService</code> depends only on the{" "}
            <code>ProductRepository</code> interface, never on <code>JdbcProductRepository</code>{" "}
            directly. Since <code>InMemoryProductRepository</code> satisfies the exact same
            interface, it can be substituted at construction time, letting tests run fast and
            without any database dependency.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Repository gives the rest of the application a collection-like, storage-agnostic interface
        &mdash; keep it in domain vocabulary, keep storage details entirely behind it, and let a
        second, in-memory implementation prove the abstraction is real.
      </p>
    </div>
  );
}
