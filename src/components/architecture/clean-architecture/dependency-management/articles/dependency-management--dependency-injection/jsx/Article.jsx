export default function DependencyManagementDependencyInjectionArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Dependency injection is the mechanism, not the theory — it's how an object gets handed the collaborators it depends on instead of constructing them itself.</p>
        <p>The last two lessons established that <code>PlaceOrderUseCase</code> depends on the <code>OrderRepository</code> interface, and that a concrete implementation supplies the runtime behavior. This lesson answers the practical question: how does <code>PlaceOrderUseCase</code> actually end up holding a reference to a working <code>JpaOrderRepository</code> if it never constructs one itself? The answer is dependency injection, and in its simplest, most important form it's just a constructor parameter.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The problem DI solves</h3>
        <p>If <code>PlaceOrderUseCase</code> needed an <code>OrderRepository</code> and had to obtain one itself, the only options that don't involve a service locator are for it to either construct a concrete class directly (<code>new JpaOrderRepository(...)</code>) or reach for some global singleton. Both reintroduce exactly the outward source dependency the Dependency Rule forbids — the use case's own code would have to name a concrete, outer-layer class. Dependency injection sidesteps this entirely: instead of the use case <em>obtaining</em> its dependency, something else <em>gives</em> it one.</p>
        <h3>Constructor injection: the mechanism, not a framework</h3>
        <p>The cleanest and most common form is constructor injection: the class declares what it needs as constructor parameters, typed as interfaces, and does nothing else to acquire them.</p>
        <ul>
          <li><code>PlaceOrderUseCase</code> declares a constructor taking an <code>OrderRepository</code>.</li>
          <li>It stores the reference in a <code>final</code> field and never reassigns it.</li>
          <li>It never calls <code>new</code> on anything that implements <code>OrderRepository</code>.</li>
        </ul>
        <p>This is plain Java — no annotations, no framework, no reflection required. You can write, compile, and unit test this class with nothing but the JDK on the classpath.</p>
        <h3>Field and setter injection exist, but constructor injection is the default for a reason</h3>
        <p>Field injection (framework magic setting a private field via reflection) and setter injection (a public setter called after construction) both leave a window where the object exists but isn't fully wired, and both usually require a framework to populate them at all. Constructor injection makes "fully constructed" and "fully wired" the same moment — the object literally cannot exist without its dependencies, and the class stays framework-agnostic since a plain <code>new PlaceOrderUseCase(fakeRepository)</code> works fine in a unit test.</p>
        <h3>DI frameworks automate this — they don't replace it</h3>
        <p>Spring's <code>@Autowired</code> and <code>@Bean</code>, Guice's <code>@Inject</code>, and similar tools are frequently described as if they introduce a new concept. They don't — they automate the same constructor injection you'd otherwise wire by hand. When Spring sees <code>@Service class PlaceOrderUseCase</code> with a constructor parameter of type <code>OrderRepository</code>, it looks in its container for a bean implementing that interface and passes it in — mechanically the same thing as calling <code>new PlaceOrderUseCase(jpaOrderRepository)</code> yourself. The framework's value is saving you from writing that wiring by hand across a large object graph, not a different form of dependency management. In fact, the cleanest use case classes in this course carry zero Spring annotations at all — annotating <code>PlaceOrderUseCase</code> with <code>@Service</code> would itself be a Dependency Rule violation, so the wiring for it typically lives in a separate configuration class instead (see the Composition Root lesson).</p>
        <h3>Why this is worth a whole lesson</h3>
        <p>Constructor injection is the load-bearing mechanism that makes the Dependency Rule practical rather than theoretical. Every inward-pointing interface in this course — <code>OrderRepository</code>, <code>PaymentGateway</code>, <code>PlaceOrderOutputBoundary</code> — only works because something outside the class supplies the implementation through a constructor, instead of the class reaching outward to get it itself.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="An external caller box passing a JpaOrderRepository instance into the constructor of PlaceOrderUseCase, contrasted with a crossed-out box showing the use case constructing its own JpaOrderRepository">
            <rect x="40" y="40" width="220" height="60" rx="6" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="150" y="65" textAnchor="middle" fontSize="10">caller / composition root</text>
            <text x="150" y="82" textAnchor="middle" fontSize="9" className="mutedFill">new PlaceOrderUseCase(repo)</text>

            <rect x="360" y="40" width="230" height="60" rx="6" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="475" y="65" textAnchor="middle" fontSize="10">PlaceOrderUseCase</text>
            <text x="475" y="82" textAnchor="middle" fontSize="9" className="mutedFill">constructor(OrderRepository)</text>

            <defs>
              <marker id="diArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
            </defs>
            <line x1="260" y1="70" x2="355" y2="70" className="accentStroke" strokeWidth="2" markerEnd="url(#diArrow)" />
            <text x="307" y="60" textAnchor="middle" fontSize="9" className="accentFill">injected</text>

            <rect x="180" y="150" width="280" height="70" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="320" y="175" textAnchor="middle" fontSize="10" className="mutedFill">anti-pattern: PlaceOrderUseCase</text>
            <text x="320" y="192" textAnchor="middle" fontSize="9" className="mutedFill">builds its own new JpaOrderRepository()</text>
            <line x1="200" y1="158" x2="440" y2="212" className="mutedStroke" strokeWidth="2" />
            <line x1="440" y1="158" x2="200" y2="212" className="mutedStroke" strokeWidth="2" />

            <text x="320" y="245" textAnchor="middle" fontSize="12" className="accentFill">Receive dependencies through the constructor — never construct them yourself</text>
          </svg>
          <p className="diagramCaption">Constructor injection hands the use case a ready-made OrderRepository instead of letting it build one.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The same class, first wired by hand, then wired the same way by Spring — the constructor doesn't change either time.</p>
        <pre><code>{`// usecase/PlaceOrderUseCase.java — plain Java, no framework annotations
package com.engineeringdecoded.orders.usecase;

public final class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository;
    private final PlaceOrderOutputBoundary outputBoundary;

    // Constructor injection: dependencies arrive here, nothing is built inside
    public PlaceOrderUseCase(OrderRepository orderRepository,
                              PlaceOrderOutputBoundary outputBoundary) {
        this.orderRepository = orderRepository;
        this.outputBoundary = outputBoundary;
    }

    @Override
    public void execute(PlaceOrderRequest request) {
        Order order = Order.place(request.customerId(), request.lines());
        orderRepository.save(order);
        outputBoundary.present(new PlaceOrderResponse(order.id()));
    }
}

// Wired by hand, e.g. in a Main class or a unit test:
OrderRepository repository = new JpaOrderRepository(entityManager);
PlaceOrderOutputBoundary presenter = new OrderPresenter(viewModel);
PlaceOrderUseCase useCase = new PlaceOrderUseCase(repository, presenter);

// Wired by Spring — same constructor, framework supplies the arguments:
@Configuration
class UseCaseConfig {
    @Bean
    PlaceOrderInputBoundary placeOrderUseCase(OrderRepository orderRepository,
                                               PlaceOrderOutputBoundary presenter) {
        return new PlaceOrderUseCase(orderRepository, presenter);
        // Spring finds beans matching each parameter type and passes them in —
        // this @Bean method IS the constructor injection, just automated.
    }
}`}</code></pre>
        <p><code>PlaceOrderUseCase</code> itself carries no <code>@Autowired</code>, no <code>@Service</code> — it stays plain Java either way, which is exactly what keeps it testable and framework-agnostic.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Annotating the use case class itself with @Service</h3><p>Doing this ties <code>PlaceOrderUseCase</code>'s source to Spring, breaking the Dependency Rule for no real benefit — a separate <code>@Configuration</code> class can wire it up with zero annotations touching the use case.</p></div>
          <div><b>MISTAKE</b><h3>Using field injection "for convenience"</h3><p><code>@Autowired private OrderRepository orderRepository;</code> compiles fine but requires Spring's reflection to populate, makes the class impossible to construct plainly in a unit test, and hides the dependency from the constructor signature where it belongs.</p></div>
          <div><b>MISTAKE</b><h3>Treating DI frameworks as the concept instead of an implementation of it</h3><p>Engineers new to this often think "we don't do dependency injection" because they don't use Spring. Any class receiving collaborators through its constructor is doing dependency injection — a framework is optional machinery for doing it at scale.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your team debates whether to add <code>@Component</code> to <code>PlaceOrderUseCase</code> so Spring can "just find it" instead of writing an explicit <code>@Bean</code> method. Using what this lesson covered about the Dependency Rule and constructor injection, make the case for which approach to take and why.</p>
        </div>
      </section>
    </div>
  );
}
