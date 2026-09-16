export default function AppliedCleanArchitecturePackageOrganizationArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">The Dependency Rule lives in your head until your package structure makes it live in the compiler.</p>
        <p>Every lesson so far has drawn circles and arrows on a whiteboard. This lesson is about the unglamorous next step: turning those circles into real Java packages that a colleague can't accidentally violate, even under deadline pressure. You'll see the classic "package by layer" structure for the orders system, and — more importantly — how Java's package-private visibility can turn the Dependency Rule from a convention people are supposed to remember into something <code>javac</code> refuses to compile.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Package by layer</h3>
        <p>The most common first move when applying Clean Architecture in Java is to mirror the four rings directly as packages: <code>entity</code>, <code>usecase</code>, <code>adapter.web</code>, <code>adapter.persistence</code>. It's an obvious mapping, and it works well for small-to-medium codebases because the package structure literally documents the architecture. Anyone opening the project sees the layers before they've read a single class.</p>
        <p>The risk is that "package by layer" only encodes the Dependency Rule as a <strong>convention</strong>. Nothing stops a developer in <code>adapter.persistence</code> from importing a class from another adapter package, or a use case from quietly reaching into <code>adapter.web</code> for a convenience method. Java's default package visibility (public) means every class is fair game to every other package unless someone actively restricts it.</p>
        <h3>Package-private visibility as an enforcement mechanism</h3>
        <p>This is where most teams stop, and where the strongest teams keep going. Java has had a tool for exactly this problem since 1996: leave a class without a visibility modifier and it becomes <strong>package-private</strong> — visible only within its own package. If <code>OrderEntityMapper</code> is a persistence-adapter implementation detail, marking it package-private (no <code>public</code> keyword) means the compiler itself refuses to let <code>usecase</code> or <code>adapter.web</code> code import it. The Dependency Rule stops being a code-review checklist item and becomes a build error.</p>
        <p>The pattern is: keep the <strong>interfaces and DTOs</strong> that other layers legitimately depend on <code>public</code> (a use case's input boundary, a repository port, a view model), and make the <strong>implementation classes</strong> package-private wherever possible. In a multi-module Gradle or Maven build you can go further and split each layer into its own module with its own dependency declarations, so a stray import isn't just discouraged — it doesn't resolve.</p>
        <h3>Screaming architecture</h3>
        <p>Uncle Bob's other point about package structure is easy to miss: your top-level packages should scream <em>domain</em>, not <em>framework</em>. A package tree of <code>controllers</code>, <code>services</code>, <code>repositories</code>, <code>dtos</code> tells a reader nothing about what the system does — it could be any CRUD app ever written. A tree built around <code>orders</code>, with the layer split happening underneath that, tells a reader "this is an order-management system" the instant they open the project. Framework-first naming optimizes for the tooling you're using today; domain-first naming optimizes for the business the code will still be modeling five frameworks from now.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 300" role="img" aria-label="A package tree diagram showing com.engineeringdecoded.orders split into entity, usecase, adapter.web, and adapter.persistence packages, with a lock icon marking package-private classes">
            <rect x="20" y="16" width="230" height="30" rx="4" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="34" y="36" fontSize="13">com.engineeringdecoded.orders</text>

            <line x1="40" y1="46" x2="40" y2="270" className="mutedStroke" strokeWidth="1" />

            <line x1="40" y1="70" x2="60" y2="70" className="mutedStroke" strokeWidth="1" />
            <rect x="60" y="58" width="150" height="26" rx="3" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="70" y="75" fontSize="12">entity</text>
            <text x="220" y="75" fontSize="11">Order, Money (public)</text>

            <line x1="40" y1="110" x2="60" y2="110" className="mutedStroke" strokeWidth="1" />
            <rect x="60" y="98" width="150" height="26" rx="3" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="70" y="115" fontSize="12">usecase</text>
            <text x="220" y="115" fontSize="11">PlaceOrderUseCase</text>
            <line x1="40" y1="146" x2="80" y2="146" className="mutedStroke" strokeWidth="1" />
            <rect x="80" y="136" width="160" height="22" rx="3" className="mutedStroke" fill="none" strokeWidth="1" />
            <text x="88" y="151" fontSize="11">usecase.port (interfaces)</text>

            <line x1="40" y1="182" x2="60" y2="182" className="mutedStroke" strokeWidth="1" />
            <rect x="60" y="170" width="180" height="26" rx="3" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="70" y="187" fontSize="12">adapter.web</text>
            <rect x="420" y="170" width="180" height="26" rx="3" className="mutedStroke" fill="none" strokeWidth="1" strokeDasharray="3 3" />
            <text x="430" y="187" fontSize="11">OrderController (public)</text>

            <line x1="40" y1="222" x2="60" y2="222" className="mutedStroke" strokeWidth="1" />
            <rect x="60" y="210" width="180" height="26" rx="3" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="70" y="227" fontSize="12">adapter.persistence</text>
            <rect x="420" y="210" width="180" height="26" rx="3" className="mutedStroke" fill="none" strokeWidth="1" strokeDasharray="3 3" />
            <text x="430" y="227" fontSize="11">OrderEntityMapper (private)</text>

            <circle cx="605" cy="223" r="7" className="accentFill" />
            <text x="601" y="227" fontSize="9" fill="#111">L</text>

            <text x="330" y="268" fontSize="11" className="mutedStroke" fill="currentColor">no-modifier class = compiler-enforced boundary</text>
          </svg>
          <p className="diagramCaption">A layer-based package tree; package-private classes (lock icon) can't be imported from outside their own package.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Here's the persistence adapter package with visibility deliberately controlled: the repository implementation is public because the composition root needs to wire it up, but the mapper is package-private because nothing outside <code>adapter.persistence</code> should ever touch a JPA entity directly.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.persistence;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.entity.OrderId;
import com.engineeringdecoded.orders.usecase.port.OrderRepository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

// public: the composition root wires this into PlaceOrderUseCase
@Repository
public class JpaOrderRepository implements OrderRepository {

    private final SpringDataOrderJpaRepository springData;
    private final OrderEntityMapper mapper; // package-private collaborator

    public JpaOrderRepository(SpringDataOrderJpaRepository springData,
                               OrderEntityMapper mapper) {
        this.springData = springData;
        this.mapper = mapper;
    }

    @Override
    public void save(Order order) {
        springData.save(mapper.toJpaEntity(order));
    }

    @Override
    public Optional<Order> findById(OrderId id) {
        return springData.findById(id.value()).map(mapper::toDomain);
    }
}

// no "public" modifier: invisible outside adapter.persistence.
// usecase and adapter.web literally cannot import this class.
class OrderEntityMapper {
    Order toDomain(OrderJpaEntity jpa) { /* ... */ return null; }
    OrderJpaEntity toJpaEntity(Order order) { /* ... */ return null; }
}`}</code></pre>
        <p>Try to import <code>OrderEntityMapper</code> from <code>adapter.web.OrderController</code> and the build fails before a reviewer ever has to say "this shouldn't be here."</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Everything is public "to be safe"</h3><p>Teams mark every class public by default because it's the path of least resistance, then rely entirely on code review to catch boundary violations — which works until the reviewer is busy or new.</p></div>
          <div><b>MISTAKE</b><h3>Framework-named top-level packages</h3><p>Packages like <code>controllers</code>, <code>services</code>, <code>repositories</code> scream "Spring app," not "order-management system" — new hires can't tell what the software does from the package tree alone.</p></div>
          <div><b>MISTAKE</b><h3>Ports living next to their implementations</h3><p>Putting the <code>OrderRepository</code> interface inside <code>adapter.persistence</code> instead of <code>usecase.port</code> inverts ownership — the use case ends up depending on the adapter package, quietly breaking the Dependency Rule.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your team's <code>OrderPresenter</code> needs a small formatting helper class. Should that helper be public or package-private, and which package should it live in to keep the Dependency Rule enforceable by the compiler rather than by convention?</p>
        </div>
      </section>
    </div>
  );
}
