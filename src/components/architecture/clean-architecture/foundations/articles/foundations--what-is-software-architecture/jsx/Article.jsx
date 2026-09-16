export default function FoundationsWhatIsSoftwareArchitectureArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Software architecture is not a diagram you draw once at the start of a project &mdash; it is the shape your components and their dependencies take, decided one class, one method, one import at a time.</p>
        <p>Before this course can teach you rings, rules, and layers, you need a working definition of the word "architecture" itself. Robert C. Martin's answer is more modest and more useful than most people expect: architecture is design, just viewed at a scale where the goal becomes obvious &mdash; keeping the system cheap to build and cheap to change.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Architecture is the shape of the system</h3>
        <p>The architecture of a software system is the shape given to it by the people who built it &mdash; specifically, the shape formed by its components, the way those components are arranged, and the dependencies that run between them. It is not a separate artifact that lives in a design document; it is a property of the actual code, visible in which modules are allowed to know about which other modules.</p>

        <h3>There is no line between "architecture" and "design"</h3>
        <p>It is tempting to think of architecture as the big, early, structural decisions and design as the small, later, tactical ones. Martin rejects that split: the low-level details and the high-level structure are all part of one continuous fabric, and you cannot get the big picture right while ignoring the details, because the big picture is made of nothing but details arranged well or badly. A package boundary is an architectural decision made of the same material as a method signature &mdash; the difference is scope, not kind.</p>

        <h3>The goal is to minimize the human resources required</h3>
        <p>Martin states the purpose of architecture directly: <strong>the goal of software architecture is to minimize the human resources required to build and maintain the required system.</strong> Not to look elegant, not to use the fashionable pattern of the year &mdash; to make the system cheap to staff, cheap to extend, and cheap to operate over its whole lifetime, not just at launch.</p>

        <h3>Development, deployment, operation, and maintenance</h3>
        <p>Good architecture must make all four of these easy, and it must do so without unnecessarily sacrificing any of the others. A structure that is easy to deploy but painful to develop against is bad architecture. A structure that is easy to write once but expensive to operate or maintain is bad architecture. The four rings you will meet in the next section &mdash; Entities, Use Cases, Interface Adapters, Frameworks &amp; Drivers &mdash; exist because they make all four goals achievable at once, by keeping the parts that change for different reasons separated from each other.</p>

        <h3>Why this framing matters going forward</h3>
        <p>Every later lesson in this course &mdash; the Dependency Rule, SOLID, boundaries &mdash; is a technique for achieving this one goal. If you find yourself applying a rule because "that's how Clean Architecture is done" rather than because it keeps the system cheaper to change, you have lost the thread; come back to this definition and ask what human effort the rule is actually saving.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 240" role="img" aria-label="A box diagram showing that architecture is the arrangement of components and the dependencies between them, not any single class">
            <rect x="40" y="40" width="140" height="60" rx="6" className="accentStroke" fill="none" />
            <text x="110" y="75" fontSize="12" textAnchor="middle">Order</text>

            <rect x="260" y="40" width="160" height="60" rx="6" className="accentStroke" fill="none" />
            <text x="340" y="70" fontSize="12" textAnchor="middle">PlaceOrderUseCase</text>
            <text x="340" y="86" fontSize="10" textAnchor="middle" className="mutedFill">uses Order</text>

            <rect x="480" y="40" width="140" height="60" rx="6" className="mutedStroke" fill="none" />
            <text x="550" y="75" fontSize="12" textAnchor="middle">OrderController</text>

            <line x1="180" y1="70" x2="260" y2="70" className="accentStroke" strokeWidth="2" markerEnd="url(#waArrow)" />
            <line x1="420" y1="70" x2="480" y2="70" className="mutedStroke" strokeWidth="2" markerEnd="url(#waArrow)" />

            <text x="320" y="150" fontSize="12" textAnchor="middle">Architecture = these boxes + which arrows are allowed to exist</text>
            <text x="320" y="175" fontSize="11" textAnchor="middle" className="mutedFill">not any single class's internal code</text>

            <defs>
              <marker id="waArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Architecture lives in the boxes and arrows &mdash; the arrangement of components and the direction their dependencies point.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The same behavior can be built with two different architectures. Here, one arrangement decision &mdash; whether the use case depends on a concrete repository or an interface it owns &mdash; is the entire difference between an architecture that supports swapping the database and one that does not.</p>
        <pre><code>{`// Arrangement A: use case depends directly on a concrete class.
// This "works" today, but the shape now forces every future
// persistence change to touch PlaceOrderUseCase.
public final class PlaceOrderUseCase {
    private final JpaOrderRepository repository; // concrete, framework-bound

    public PlaceOrderUseCase(JpaOrderRepository repository) {
        this.repository = repository;
    }
}

// Arrangement B: use case depends on an interface it defines itself.
// Same behavior, different shape -- the shape is the architecture.
public interface OrderRepository {
    void save(Order order);
    Order findById(OrderId id);
}

public final class PlaceOrderUseCase implements PlaceOrderInputBoundary {
    private final OrderRepository repository; // abstract, owned by this layer

    public PlaceOrderUseCase(OrderRepository repository) {
        this.repository = repository;
    }
}`}</code></pre>
        <p>Nothing about what the use case <em>does</em> changed between A and B. What changed is the shape &mdash; and that shape is exactly what "architecture" refers to.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Treating architecture as a one-time diagram</h3><p>Teams draw boxes and arrows in a design doc, then let the actual code drift away from it with every sprint. The diagram was never the architecture &mdash; the current import statements are.</p></div>
          <div><b>MISTAKE</b><h3>Splitting "architects" from "developers" by decision size</h3><p>Assuming only senior architects make architectural decisions while everyone else "just codes" ignores that every new dependency a developer adds is an architectural decision, made or unmade correctly.</p></div>
          <div><b>MISTAKE</b><h3>Optimizing for one goal at the expense of the others</h3><p>Chasing "easy to deploy" (say, one giant deployable) at the cost of "easy to develop" (every team stepping on every other team's code) trades one of the four goals for another instead of designing a shape that serves all of them.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>In the practical example, Arrangement A and Arrangement B produce identical behavior for every existing test. Explain, using Martin's definition of architecture's goal, why B is still the better architecture even though no current feature depends on the difference.</p>
        </div>
      </section>
    </div>
  );
}
