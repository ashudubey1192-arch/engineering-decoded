export default function FoundationsPolicyAndDetailArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Every line of code is either a business rule or a mechanism for delivering one &mdash; and confusing the two is the single most common way architectures quietly rot.</p>
        <p>Martin draws a sharp line between <strong>policy</strong>, the business rules that make a system valuable, and <strong>detail</strong>, the mechanisms that let humans and other systems talk to those rules. This distinction is the reasoning behind almost every later rule in this course, including the Dependency Rule itself, so it is worth understanding on its own before you see it applied to entities, use cases, and adapters.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Policy: where the value lives</h3>
        <p>Policy is Martin's word for the statements that encode business rules and procedures &mdash; the logic that would still be true even if you rewrote the entire application in a different language with a different database and a different UI. "An order cannot be cancelled once it has shipped" is policy. It is the reason the system exists; everything else is in service of it.</p>

        <h3>Detail: whatever is not policy</h3>
        <p>Detail is everything necessary to let policy communicate with the outside world without actually being part of what the system does: the choice of relational database versus document store, the choice of REST versus GraphQL, the choice of Spring versus a hand-rolled servlet. Details are things a competent team could swap out over a weekend <em>if</em> the architecture kept them properly separated from policy &mdash; and things that take months to swap when it did not.</p>

        <h3>The rule this produces</h3>
        <p>Because detail exists only to serve policy, the dependency should run one way: <strong>detail depends on policy, never the other way around.</strong> Policy should not know whether it is being called from a REST controller or a batch job, and it should not know whether its data is persisted in Postgres or MongoDB. This is not a stylistic preference &mdash; it is what makes it possible to change a detail without touching the rule it serves, and it is the exact reasoning that later becomes the Dependency Rule between the four rings.</p>

        <h3>A good architect maximizes decisions not made</h3>
        <p>One of Martin's more counterintuitive claims: a good architecture is one that lets you <em>defer</em> detail decisions as long as possible. You do not need to know your final database technology to start writing use cases correctly, and if your architecture forces that decision early, that is a sign policy and detail are already tangled. The measure of a clean separation is how late you could plausibly swap a framework, a database, or a UI without rewriting business rules.</p>

        <h3>Policy has levels too</h3>
        <p>Not all policy sits at the same level. Rules that are farther from the system's inputs and outputs &mdash; that apply no matter which specific use case invoked them &mdash; are higher-level policy (this is what entities capture). Rules specific to one application's workflow are lower-level policy (this is what use cases capture). Both are policy, and both must be kept away from detail; the split between them is a separate concern this course covers in the entities and use-cases sections.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="A policy box at the center with detail boxes around it, arrows pointing from each detail box inward toward the policy's own interfaces">
            <rect x="230" y="90" width="180" height="80" rx="8" className="accentStroke" fill="none" />
            <text x="320" y="125" fontSize="12" textAnchor="middle">Policy</text>
            <text x="320" y="145" fontSize="10" textAnchor="middle" className="mutedFill">business rules</text>

            <rect x="40" y="20" width="130" height="46" rx="6" className="mutedStroke" fill="none" />
            <text x="105" y="48" fontSize="11" textAnchor="middle">Web (Spring MVC)</text>
            <line x1="170" y1="55" x2="230" y2="105" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#pdArrow)" />

            <rect x="40" y="190" width="130" height="46" rx="6" className="mutedStroke" fill="none" />
            <text x="105" y="218" fontSize="11" textAnchor="middle">Database (JPA)</text>
            <line x1="170" y1="205" x2="230" y2="155" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#pdArrow)" />

            <rect x="470" y="20" width="130" height="46" rx="6" className="mutedStroke" fill="none" />
            <text x="535" y="48" fontSize="11" textAnchor="middle">CLI / batch job</text>
            <line x1="470" y1="55" x2="410" y2="105" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#pdArrow)" />

            <rect x="470" y="190" width="130" height="46" rx="6" className="mutedStroke" fill="none" />
            <text x="535" y="218" fontSize="11" textAnchor="middle">Presenter / UI</text>
            <line x1="470" y1="205" x2="410" y2="155" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#pdArrow)" />

            <defs>
              <marker id="pdArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Details surround policy and depend on it; swap any one detail box and the policy box never changes.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Here, the use case (policy) defines an output boundary as an interface it owns; the detail decision of <em>how</em> results are actually presented &mdash; JSON today, maybe something else tomorrow &mdash; is deferred to a class that depends on the policy, not the other way around.</p>
        <pre><code>{`// Policy: the use case only knows it must report a response
// through some PlaceOrderOutputBoundary -- it has no idea
// whether that boundary renders JSON, HTML, or a gRPC message.
public interface PlaceOrderOutputBoundary {
    void present(PlaceOrderResponse response);
}

public final class PlaceOrderUseCase implements PlaceOrderInputBoundary {
    private final OrderRepository orders;
    private final PlaceOrderOutputBoundary presenter;

    public PlaceOrderUseCase(OrderRepository orders, PlaceOrderOutputBoundary presenter) {
        this.orders = orders;
        this.presenter = presenter;
    }

    public void execute(PlaceOrderRequest request) {
        Order order = new Order(request.customerId());
        request.lines().forEach(order::addLine);
        order.place();
        orders.save(order);
        presenter.present(new PlaceOrderResponse(order.id()));
    }
}

// Detail: this class depends on the policy's interface, not
// the other way around. It could be replaced with an HTML
// or gRPC presenter without PlaceOrderUseCase ever changing.
public final class OrderPresenter implements PlaceOrderOutputBoundary {
    public void present(PlaceOrderResponse response) {
        // build an OrderViewModel for a specific delivery mechanism
    }
}`}</code></pre>
        <p>Notice that "how the response is rendered" was a decision the policy never had to make &mdash; it was deferred to a detail class that depends inward on the interface.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Letting a business rule reference a framework type</h3><p>A validation rule that throws a Spring <code>{'ResponseStatusException'}</code> directly has quietly made a detail (the web framework) part of the policy, which now cannot run, or be tested, without that framework on the classpath.</p></div>
          <div><b>MISTAKE</b><h3>Deciding the database schema before the business rules</h3><p>Starting design with an ER diagram trains the team to bend business rules to fit table shapes, when Martin's point is the opposite: policy should be designed first, and the database is a detail decided later.</p></div>
          <div><b>MISTAKE</b><h3>Calling everything "business logic" without distinguishing levels</h3><p>Lumping entity-level rules and use-case-level rules together as one undifferentiated pile of "business logic" makes it hard to tell what belongs in <code>Order</code> versus what belongs in <code>PlaceOrderUseCase</code>, and code ends up in whichever class was open at the time.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A teammate proposes storing the maximum number of line items allowed per order as a constant inside <code>{'JpaOrderRepository'}</code>, since "that's where the persistence limits live." Using the policy/detail distinction, explain why that constant is policy, not detail, and where it actually belongs.</p>
        </div>
      </section>
    </div>
  );
}
