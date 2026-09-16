export default function TestingTestingAdaptersArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Adapters are the one place where faking the dependency away would defeat the point — an adapter's whole job is to prove it works against the real technology.</p>
        <p>The last two lessons deliberately avoided real infrastructure. This one deliberately uses it. <code>JpaOrderRepository</code> exists to translate between the domain and a real database — a test that fakes the database out isn't testing the adapter at all, it's testing nothing.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Why the strategy has to change here</h3>
        <p>Entity and use case tests replace outward-facing collaborators with fakes precisely because the code under test doesn't know or care what the fake actually is — it only calls interface methods. An adapter is different: <code>JpaOrderRepository</code>'s entire reason for existing is its interaction with a specific technology (Hibernate, SQL, a schema). Faking that away and asserting "the mock was called" would tell you nothing about whether the adapter actually maps <code>Order</code> to a row correctly, handles constraint violations, or commits within the right transaction boundary.</p>
        <h3>Integration tests, not unit tests</h3>
        <p>Adapter tests are integration tests by nature: they exercise the adapter against something close to its real dependency. The two common approaches:</p>
        <ul>
          <li><strong>An in-memory or embedded database</strong> (H2 in JPA compatibility mode, for example) — fast, but risks passing on things that behave differently on the real production database (dialect quirks, constraint behavior, JSON column types).</li>
          <li><strong>Testcontainers</strong> — spins up a real PostgreSQL (or whatever production actually runs) in Docker for the test run. Slower to start than an in-memory substitute, but it's testing against the real thing, which is the entire point of testing an adapter.</li>
        </ul>
        <p>For <code>JpaOrderRepository</code>, Testcontainers is the stronger choice specifically because the promise being tested is "this class correctly implements <code>OrderRepository</code> against our actual production database engine," and an in-memory substitute can quietly stop being that proof.</p>
        <h3>What an adapter test should assert</h3>
        <p>Round-trip behavior, mostly: save an <code>Order</code>, read it back by ID, and assert the domain object that comes out equals the one that went in — including nested value objects like <code>OrderLine</code> and <code>Money</code>. Also worth covering: what happens on a missing ID (does <code>findById</code> return <code>Optional.empty()</code> as the interface promises?), and any mapping edge cases in <code>OrderEntityMapper</code> (currency precision, enum mapping, null handling).</p>
        <h3>This is not a contradiction of the earlier lessons</h3>
        <p>Different layers earn different test strategies because they play different architectural roles. Entities and use cases are pure logic, tested in isolation, fast and numerous. Adapters are the seams where the architecture meets the real world, tested against that real world, fewer in number and slower to run — and that's correct, not a compromise. A test suite with 500 fast unit tests and 20 slower adapter integration tests is a healthy shape; one with 500 adapter tests and 20 unit tests usually means business logic leaked into the adapters.</p>
        <h3>Where these run in CI</h3>
        <p>Because adapter tests are slower and need Docker (or an embedded engine), they're commonly split into a separate test source set or tagged suite (<code>@Tag("integration")</code>) so the fast unit tests can run on every save while the adapter suite runs on every push or pull request — keeping fast feedback fast without skipping the coverage that actually matters for persistence correctness.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="Four concentric circles with Entities and Use Cases muted and Adapters in accent color, connected to a real Postgres database cylinder outside the circles via a Testcontainers label">
            <circle cx="260" cy="130" r="110" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="260" cy="130" r="82" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="260" cy="130" r="54" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="260" cy="130" r="26" fill="none" className="mutedStroke" strokeWidth="1.5" />

            <path d="M215,95 A45,15 0 0 1 305,95 L305,140 A45,15 0 0 1 215,140 Z" fill="none" className="accentStroke" strokeWidth="2" />
            <path d="M215,95 A45,15 0 0 0 305,95" fill="none" className="accentStroke" strokeWidth="2" />
            <text x="260" y="122" textAnchor="middle" fontSize="8" className="accentFill">Adapters</text>

            <text x="260" y="60" textAnchor="middle" fontSize="8" className="mutedFill">Use Cases</text>
            <text x="260" y="45" textAnchor="middle" fontSize="8" className="mutedFill">Entities</text>

            <rect x="480" y="90" width="130" height="80" rx="8" className="accentStroke" fill="none" strokeWidth="2" />
            <ellipse cx="545" cy="100" rx="55" ry="10" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="545" y="135" textAnchor="middle" fontSize="9" className="accentFill">real Postgres</text>
            <text x="545" y="150" textAnchor="middle" fontSize="9" className="accentFill">(Testcontainers)</text>

            <defs>
              <marker id="taArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
            </defs>
            <line x1="330" y1="120" x2="475" y2="120" className="accentStroke" strokeWidth="2" markerEnd="url(#taArrow)" />
            <text x="400" y="112" textAnchor="middle" fontSize="8" className="accentFill">JPA / SQL</text>

            <text x="320" y="20" textAnchor="middle" fontSize="12" className="accentFill">Adapters are tested against the real technology, not a fake</text>
          </svg>
          <p className="diagramCaption">JpaOrderRepository is exercised against a real database container, proving it satisfies OrderRepository for real.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A Testcontainers-backed integration test proving <code>JpaOrderRepository</code> round-trips an <code>Order</code> correctly against real PostgreSQL.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.persistence;

import com.engineeringdecoded.orders.entity.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;

@Testcontainers
@DataJpaTest
class JpaOrderRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres =
        new PostgreSQLContainer<>("postgres:16-alpine");

    @DynamicPropertySource
    static void datasourceProps(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
    }

    private final JpaOrderRepository repository; // constructed via Spring test context

    JpaOrderRepositoryTest(JpaOrderRepository repository) {
        this.repository = repository;
    }

    @Test
    void savedOrderRoundTripsWithLinesAndTotals() {
        Order order = Order.place(new CustomerId("cust-7"),
            List.of(new OrderLine("SKU-9", 2, Money.of(15, 00))));

        repository.save(order);
        Optional<Order> found = repository.findById(order.id());

        assertThat(found).isPresent();
        assertThat(found.get().lines()).hasSize(1);
        assertThat(found.get().total()).isEqualTo(Money.of(30, 00));
    }

    @Test
    void findByIdReturnsEmptyForUnknownOrder() {
        assertThat(repository.findById(new OrderId("does-not-exist"))).isEmpty();
    }
}`}</code></pre>
        <p>This test is slower than any entity or use case test by an order of magnitude — and that's exactly the cost worth paying for proof that the real SQL mapping works.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Mocking the EntityManager instead of using a real database</h3><p>A mocked <code>EntityManager</code> can only ever confirm that the adapter called the mock the way the test author expected — it can't catch a broken query, a wrong column mapping, or a constraint violation, which are exactly the failure modes adapter tests exist to catch.</p></div>
          <div><b>MISTAKE</b><h3>Relying only on an in-memory database that doesn't match production</h3><p>H2's default SQL dialect differs from PostgreSQL's in enough edge cases (JSON columns, certain constraints, case sensitivity) that a green H2 suite can still hide a broken query against real production infrastructure.</p></div>
          <div><b>MISTAKE</b><h3>Letting adapter tests replace use case tests</h3><p>Because adapter tests are thorough and feel "more real," teams sometimes skip use case unit tests and rely on adapter-level integration tests to cover business rules too — this collapses fast, isolated tests into slow, dependency-laden ones and can leave business logic branches uncovered.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A teammate proposes replacing <code>JpaOrderRepositoryTest</code>'s Testcontainers Postgres with a Mockito mock of <code>EntityManager</code>, arguing it would make the test suite faster. What specifically would the team lose the ability to catch if they made that change?</p>
        </div>
      </section>
    </div>
  );
}
