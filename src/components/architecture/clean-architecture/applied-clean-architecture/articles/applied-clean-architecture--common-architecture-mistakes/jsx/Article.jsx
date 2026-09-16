export default function AppliedCleanArchitectureCommonArchitectureMistakesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Almost nobody violates the Dependency Rule on purpose — they violate it one small, reasonable-sounding shortcut at a time.</p>
        <p>You've now seen entities, use cases, boundaries, SOLID, package organization, modular monoliths, and microservices. This lesson is the synthesis: the five mistakes that show up again and again across real Clean Architecture codebases, why each one feels harmless in the moment it's introduced, and what it costs six months later when nobody remembers it was ever a shortcut.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Framework annotations leaking into entities</h3>
        <p>It starts innocently: someone adds <code>@Entity</code> and <code>@Id</code> to the <code>Order</code> class instead of maintaining a separate <code>OrderJpaEntity</code>, because "it's less code, why map between two nearly-identical classes?" Now <code>Order</code> needs a no-arg constructor for Hibernate, its fields can't be <code>final</code> because JPA needs setters, and its invariants can no longer be fully enforced in the constructor. The entity — the class meant to be the most stable, most framework-independent thing in the system — is now recompiled every time you change persistence libraries. This is precisely the failure mode the entity/adapter split exists to prevent.</p>
        <h3>Anemic use cases that are just pass-throughs</h3>
        <p>A use case class exists, has the right name, implements the right input boundary — and its <code>execute()</code> method is three lines that just call <code>repository.save(request.toEntity())</code>. There's no orchestration, no invariant enforcement, no coordination between collaborators. This usually means the real business logic either got left in the controller (nobody finished the extraction) or was scattered across the entity in a way that doesn't match how the use case actually needs to coordinate multiple entities and ports. An anemic use case isn't wrong to have occasionally — some operations really are that simple — but when <em>every</em> use case looks like this, it's a sign the layering is decorative rather than doing real work.</p>
        <h3>Fat "God" repository interfaces</h3>
        <p><code>OrderRepository</code> starts with <code>save</code> and <code>findById</code>. Eighteen months later it has <code>findByCustomerIdAndStatusAndDateRange</code>, <code>updateStatusOnly</code>, <code>findTopTenBySpend</code>, and a dozen other methods added by whoever needed a query that week. Every use case that depends on <code>OrderRepository</code> now depends — transitively — on methods it doesn't use, and every implementation of that interface has to implement all of them. This is the Interface Segregation Principle failing at the repository-port level: it's usually a sign you need several smaller, purpose-built ports (<code>OrderWriter</code>, <code>OrderFinder</code>, a dedicated reporting query object) instead of one interface that tries to be everything to everyone.</p>
        <h3>Skipping boundaries because "it's just a small feature"</h3>
        <p>A one-off admin endpoint doesn't seem worth a full entity/use-case/adapter treatment, so it's written as a single <code>@RestController</code> method with inline JDBC. Reasonable in isolation — until three more "small" features get added the same way, and now there's a second, informal architecture living inside the codebase that the rest of the team has to remember exists and treat differently. Small features are exactly where the discipline is cheapest to apply and most often skipped anyway.</p>
        <h3>Over-engineering boundaries for code that will never change</h3>
        <p>The opposite failure: introducing an interface, a port, and a swappable adapter for something that has exactly one implementation and zero realistic reason to ever get a second one — a value object's <code>toString()</code> formatting, say. Every extra layer of indirection has a real cost in the time it takes a reader to trace a call, and Clean Architecture's boundaries earn that cost only where something genuinely varies (frameworks, delivery mechanisms, external systems) or is genuinely likely to change. Boundaries are a tool for managing volatility, not a badge of architectural seriousness to sprinkle everywhere.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 240" role="img" aria-label="A concentric ring diagram of the four Clean Architecture layers with warning markers placed at the specific points where each common mistake occurs, plus two side boxes contrasting a skipped boundary with an over-engineered one">
            <circle cx="230" cy="120" r="100" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="230" cy="120" r="70" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="230" cy="120" r="42" className="accentStroke" fill="none" strokeWidth="1.4" />
            <text x="203" y="124" fontSize="9">Entities</text>
            <text x="176" y="82" fontSize="9">Use Cases</text>
            <text x="140" y="46" fontSize="9">Interface Adapters</text>

            <circle cx="230" cy="120" r="3.5" className="accentFill" />
            <text x="196" y="105" fontSize="9">{'@Entity leak'}</text>

            <circle cx="230" cy="78" r="3.5" className="accentFill" />
            <text x="238" y="70" fontSize="9">anemic use case</text>

            <circle cx="290" cy="150" r="3.5" className="accentFill" />
            <text x="298" y="155" fontSize="9">God repository</text>

            <line x1="440" y1="70" x2="440" y2="170" className="mutedStroke" strokeWidth="1" strokeDasharray="4 4" />
            <rect x="400" y="50" width="70" height="30" rx="4" className="mutedStroke" fill="none" strokeWidth="1" />
            <text x="408" y="69" fontSize="9">quick hack</text>
            <text x="480" y="65" fontSize="9">skipped boundary</text>

            <rect x="400" y="160" width="100" height="30" rx="4" className="mutedStroke" fill="none" strokeWidth="1" strokeDasharray="3 3" />
            <text x="410" y="179" fontSize="8">Port for a class</text>
            <text x="410" y="190" fontSize="7">with 1 impl, ever</text>
            <text x="510" y="180" fontSize="9">over-engineered</text>
          </svg>
          <p className="diagramCaption">Five mistakes mapped to where they actually happen: three inside the rings, two at the edges of how much boundary a feature deserves.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A composite before/after: an anemic use case papering over logic that never got extracted, next to what it should look like once the use case actually does its job.</p>
        <pre><code>{`// MISTAKE: an "anemic" use case — no orchestration, no rules,
// just a pass-through to the repository
public class PlaceOrderUseCase implements PlaceOrderInputBoundary {
    private final OrderRepository orderRepository;

    public PlaceOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    @Override
    public void placeOrder(PlaceOrderRequest request) {
        orderRepository.save(request.toEntity()); // all the real work
    }                                              // happens inside toEntity(),
}                                                   // a DTO method nobody reviews

// FIXED: the use case actually orchestrates and enforces the rule
// that matters — the entity enforces its own invariants, the use
// case coordinates entity + repository + output boundary
public class PlaceOrderUseCase implements PlaceOrderInputBoundary {
    private final OrderRepository orderRepository;
    private final PlaceOrderOutputBoundary outputBoundary;

    public PlaceOrderUseCase(OrderRepository orderRepository,
                              PlaceOrderOutputBoundary outputBoundary) {
        this.orderRepository = orderRepository;
        this.outputBoundary = outputBoundary;
    }

    @Override
    public void placeOrder(PlaceOrderRequest request) {
        Order order = Order.place(request.customerId(), request.lines());
        orderRepository.save(order);
        outputBoundary.present(new PlaceOrderResponse(order.id(), order.status()));
    }
}`}</code></pre>
        <p>The fix isn't more code for its own sake — it's putting the orchestration where a reader expects to find it, instead of hidden inside a DTO's <code>toEntity()</code> method.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Framework annotations in the entity</h3><p><code>@Entity</code>/<code>@Id</code> on <code>Order</code> forces a no-arg constructor and mutable fields, quietly destroying the invariant-enforcement the entity layer exists to guarantee.</p></div>
          <div><b>MISTAKE</b><h3>Fat "God" repository interfaces</h3><p>An <code>OrderRepository</code> that accumulates every query anyone ever needed forces every implementation and every consumer to depend on methods they don't use.</p></div>
          <div><b>MISTAKE</b><h3>Boundaries built for code that will never vary</h3><p>Introducing a port and swappable adapter for something with exactly one implementation and no realistic second one adds indirection that costs future readers more than it ever saves.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>You inherit a codebase where every use case is three lines that call straight through to a repository, and every repository interface has thirty methods. Which of these two problems would you fix first, and how does fixing one make the other easier to see and fix?</p>
        </div>
      </section>
    </div>
  );
}
