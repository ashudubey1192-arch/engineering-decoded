export default function FoundationsArchitectureVsDesignArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">"Architecture" and "design" are usually treated as two different jobs done by two different people &mdash; Martin's actual claim is that they are the same activity performed at different scales, and treating them as separate is where a lot of the damage starts.</p>
        <p>This course will keep using both words, so it is worth being precise about what each one means here before that becomes a source of confusion. Getting this straight also explains why a junior engineer adding one method and a staff engineer defining a module boundary are doing fundamentally the same kind of work, just at different resolutions.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Martin's actual claim</h3>
        <p>In the opening chapter of <em>Clean Architecture</em>, Martin states directly that there is no real distinction between the two: "the low-level details and the high-level structure are all part of the same whole." What people usually call architecture is just design decisions made about larger-grained things &mdash; components, packages, deployable units &mdash; using the same underlying reasoning applied to smaller-grained things like classes and functions.</p>

        <h3>A continuum, not a boundary</h3>
        <p>Instead of a hard line, picture a single spectrum of decisions ordered by scope: a variable's name sits at one end, a method's signature a little further along, a class's responsibilities further still, then a package's public surface, then a component's dependencies, then how services are deployed. There is no point on that line where "design" stops and "architecture" begins &mdash; the same judgment about coupling and cohesion applies at every point, just with bigger consequences the further right you go.</p>

        <h3>Why this course still uses both words</h3>
        <p>Even without a hard boundary, the words remain useful shorthand for scope. This course tends to say "design" when discussing a single class or a small cluster of classes (a use case and the entity it manipulates), and "architecture" when discussing how whole packages, layers, or deployable services relate to each other. Read that as a convenience, not a claim that different rules apply.</p>

        <h3>The same principles, writ large</h3>
        <p>This is precisely why the SOLID principles you will study soon &mdash; conceived for classes &mdash; reappear later in the course as component principles for packages and services. The Dependency Inversion Principle applied between two classes and the Dependency Rule applied between two architectural layers are the same idea at different zoom levels: depend on abstractions owned by the more stable, more policy-heavy side, not on concrete detail.</p>

        <h3>The practical consequence</h3>
        <p>If you only think carefully about class-level design and treat "architecture" as somebody else's job on a whiteboard, you will keep making small, uncoordinated decisions that add up to a bad large-scale shape &mdash; because nobody was applying architectural judgment at the scale where it actually accumulates. Conversely, a beautiful component diagram cannot save a codebase where every class inside those components ignores basic design discipline. You need both, because they were never actually two things.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 200" role="img" aria-label="A horizontal continuum from low-level design decisions to high-level architecture decisions, with example decisions plotted along it">
            <line x1="40" y1="110" x2="620" y2="110" className="mutedStroke" strokeWidth="2" />
            <polygon points="620,110 610,104 610,116" className="mutedFill" />

            <circle cx="90" cy="110" r="5" className="accentFill" />
            <text x="90" y="140" fontSize="10" textAnchor="middle">variable name</text>

            <circle cx="210" cy="110" r="5" className="accentFill" />
            <text x="210" y="140" fontSize="10" textAnchor="middle">method signature</text>

            <circle cx="330" cy="110" r="5" className="accentFill" />
            <text x="330" y="140" fontSize="10" textAnchor="middle">class responsibility</text>

            <circle cx="450" cy="110" r="5" className="accentFill" />
            <text x="450" y="140" fontSize="10" textAnchor="middle">package boundary</text>

            <circle cx="570" cy="110" r="5" className="accentFill" />
            <text x="570" y="140" fontSize="10" textAnchor="middle">service boundary</text>

            <text x="90" y="80" fontSize="11" className="mutedFill">"design" (small scope)</text>
            <text x="480" y="80" fontSize="11" className="mutedFill">"architecture" (large scope)</text>
          </svg>
          <p className="diagramCaption">One continuum of the same judgment, from a variable's name to a service's boundary &mdash; not two separate disciplines.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The Dependency Inversion Principle looks almost identical whether you apply it between two classes ("design" scope) or between two packages ("architecture" scope) &mdash; because it is the same principle.</p>
        <pre><code>{`// Design scope: one class depending on an abstraction owned
// by the layer that matters more (the use case), not on a
// concrete detail class.
public final class PlaceOrderUseCase implements PlaceOrderInputBoundary {
    private final OrderRepository orders; // abstraction, not JpaOrderRepository

    public PlaceOrderUseCase(OrderRepository orders) {
        this.orders = orders;
    }
}

// Architecture scope: the same rule, applied between packages
// instead of classes. The interface lives in usecase.port;
// nothing in that package imports anything from adapter.*.
package com.engineeringdecoded.orders.usecase.port;

public interface OrderRepository {
    void save(Order order);
    Order findById(OrderId id);
}

// adapter.persistence depends on usecase.port -- never the reverse.
package com.engineeringdecoded.orders.adapter.persistence;

public final class JpaOrderRepository implements OrderRepository {
    // Spring Data JPA details live here, never leak upward
}`}</code></pre>
        <p>One interface, applied twice: once to decouple a class from a class, once to decouple a package from a package. The reasoning did not change &mdash; only the scope did.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Assigning architecture only to senior titles</h3><p>Believing that "architecture" is decided exclusively in design reviews by a named architect means every day-to-day class and package decision made by the rest of the team goes unexamined, even though those decisions are architecture too.</p></div>
          <div><b>MISTAKE</b><h3>Drawing a component diagram that the code does not follow</h3><p>Producing a high-level diagram as a one-time artifact, disconnected from the class-level design decisions engineers make daily, guarantees the diagram and the codebase drift apart within a few sprints.</p></div>
          <div><b>MISTAKE</b><h3>Applying SOLID only within a single class</h3><p>Treating Dependency Inversion as a class-only trick and ignoring it at the package or service level leaves you with well-designed individual classes wired together into a tangled, hard-to-change overall system.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your team has a rule: "only the architect can approve new package dependencies, but any engineer can add a new method parameter without review." Using the continuum idea from this lesson, what is the flaw in drawing the review line exactly there?</p>
        </div>
      </section>
    </div>
  );
}
