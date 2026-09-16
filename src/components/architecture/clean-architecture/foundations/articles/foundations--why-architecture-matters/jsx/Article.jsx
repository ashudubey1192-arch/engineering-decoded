export default function FoundationsWhyArchitectureMattersArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Every system has two kinds of value: what it does right now, and how easy it is to change later &mdash; and the second one is the one that quietly decides whether the business survives.</p>
        <p>This lesson makes the business case for everything that follows in this course. If you cannot explain to a product manager why architecture is worth investing in, the rest of this course will feel like academic ceremony instead of a survival strategy. Martin's "tale of two values" gives you exactly that explanation.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Behavior and structure</h3>
        <p>Every piece of software delivers two kinds of value to its stakeholders. The first is <strong>behavior</strong>: the features that make the program do what the business needs today &mdash; place an order, cancel it, calculate a total. The second is <strong>structure</strong>: the shape of the code that determines how easily that behavior can be changed tomorrow. Most organizations only ever talk about the first.</p>

        <h3>Urgent versus important</h3>
        <p>Borrowing Eisenhower's distinction, Martin observes that behavior is <em>urgent</em> &mdash; there is always a deadline, a stakeholder waiting, a sprint demo &mdash; but not always <em>important</em> in the long run. Architecture is the opposite: it is rarely urgent on any given day, but it is the most important factor in whether the system is still worth working on a year from now. Urgent-but-unimportant work reliably crowds out important-but-not-urgent work unless someone actively defends the second.</p>

        <h3>Who has to make the case</h3>
        <p>Business stakeholders are usually not equipped to argue for architecture, because they cannot see it &mdash; they can only see behavior. Martin's conclusion is blunt: <strong>it is the responsibility of the software development team to assert the importance of architecture over the urgency of features.</strong> If engineers do not fight for it, no one else in the room will, and every "just this once, skip the interface" request will be granted.</p>

        <h3>The cost curve of ignoring structure</h3>
        <p>A system built by chasing only urgent behavior does not fail immediately &mdash; it fails slowly. Each new feature gets a little harder to add than the last, because there are more tangled dependencies to work around. The classic symptom: a team that shipped fast in month one is shipping barely anything by month eighteen, with the same headcount, because the cost of adding <em>anything</em> has climbed while the cost of adding it well never got paid down. This is the real, measurable cost of treating architecture as optional.</p>

        <h3>Why this is a foundations lesson, not a motivational aside</h3>
        <p>Every technique later in this course &mdash; the Dependency Rule, SOLID, isolating policy from detail &mdash; is a specific tool for keeping the structure value high without sacrificing the behavior value. Understanding <em>why</em> that trade matters is what turns these techniques from arbitrary rules into an obviously worthwhile investment.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="A line graph of engineering productivity over time comparing a team that invests in architecture with a team that ignores it">
            <line x1="60" y1="220" x2="600" y2="220" className="mutedStroke" strokeWidth="1.5" />
            <line x1="60" y1="220" x2="60" y2="30" className="mutedStroke" strokeWidth="1.5" />
            <text x="320" y="248" fontSize="12" textAnchor="middle">time / feature count</text>
            <text x="26" y="130" fontSize="12" transform="rotate(-90 26 130)">cost per feature</text>

            <path d="M 60 60 L 600 60" className="accentStroke" strokeWidth="2" fill="none" />
            <text x="500" y="48" fontSize="11" className="accentFill">with architecture: roughly flat</text>

            <path d="M 60 60 C 220 80, 340 140, 460 190 S 560 215, 600 218" className="mutedStroke" strokeWidth="2" fill="none" />
            <text x="420" y="205" fontSize="11" className="mutedFill">ignoring structure: rises steadily</text>
          </svg>
          <p className="diagramCaption">Behavior-only teams ship fast early and slow down every release; structure keeps the cost of each new feature roughly constant.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Consider two ways of adding a "discount code" feature to order placement six months into the project. One team spent those six months adding features directly to a monolithic controller; the other kept the use-case boundary intact from day one.</p>
        <pre><code>{`// Team A, six months of "just get behavior out the door":
// PlaceOrderController has grown to 40 methods, mixes validation,
// pricing, persistence and email. Adding a discount means finding
// the right spot among 40 methods and hoping nothing else breaks.
@PostMapping("/orders")
public ResponseEntity<?> placeOrder(@RequestBody OrderRequest req) {
    // ...900 lines of accumulated behavior across many features...
    if (req.discountCode() != null) {
        // new logic wedged between pricing and persistence,
        // with no clear owner and no test boundary
    }
    // ...
}

// Team B, six months of protecting the use-case boundary:
// adding behavior means adding a new, isolated interactor --
// nothing else has to be touched or re-understood.
public final class ApplyDiscountUseCase implements ApplyDiscountInputBoundary {
    private final OrderRepository orders;
    private final DiscountPolicy discountPolicy;

    public ApplyDiscountUseCase(OrderRepository orders, DiscountPolicy discountPolicy) {
        this.orders = orders;
        this.discountPolicy = discountPolicy;
    }

    public void execute(OrderId id, String code) {
        Order order = orders.findById(id);
        Money discount = discountPolicy.resolve(code);
        order.applyDiscount(discount);
        orders.save(order);
    }
}`}</code></pre>
        <p>Team A's cost to add the feature keeps climbing with every prior feature crammed into the same method. Team B's cost stays roughly constant, because the structure they invested in months ago pays for itself on every new request.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Letting "ship it now" always win</h3><p>Treating every deadline as an excuse to skip structural work trains the organization to believe architecture is optional, and by the time it visibly hurts, the cost to fix it has multiplied.</p></div>
          <div><b>MISTAKE</b><h3>Waiting for stakeholders to ask for architecture</h3><p>Business stakeholders cannot see structure, so waiting for them to request it means it never gets requested. Engineers who stay silent are choosing the urgent-only path by default.</p></div>
          <div><b>MISTAKE</b><h3>Framing architecture as a rewrite</h3><p>Presenting structural investment as "we need to stop and rebuild" instead of "we design this way going forward" makes it sound like a luxury project instead of the normal cost of doing the work correctly the first time.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your product manager asks why the "Apply Discount" feature should take a full day when the "Cancel Order" feature two weeks ago took only two hours, even though both are similarly sized. Using the urgent-versus-important distinction, what question would you ask about the codebase before answering them?</p>
        </div>
      </section>
    </div>
  );
}
