export default function BoundariesBoundaryTradeOffsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Every boundary you draw is a bet that its cost today is cheaper than the cost of not having it later — and the only way to place that bet well is to price both sides honestly.</p>
        <p>This section has built up the case for boundaries one mechanism at a time. This lesson is the counterweight: boundaries are not free, and drawing one you didn't need is a real, ongoing cost, not a harmless precaution. The skill that ties the whole section together is deciding, for a specific seam, in a specific system, at a specific time, whether to pay for the boundary now, defer it, or accept the direct dependency permanently.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>What a boundary actually costs</h3>
        <p>An interface, at least one extra implementation class, a data-crossing shape, and wiring at a composition root — that's the minimum. Beyond the file count, there's a cognitive cost: a developer reading <code>{'PlaceOrderUseCase'}</code> for the first time now has to also find and understand <code>{'OrderRepository'}</code>'s contract and trace which implementation is wired in, instead of reading one concrete class top to bottom. Multiply a handful of unnecessary boundaries across a codebase and onboarding a new engineer gets measurably slower for no corresponding benefit.</p>
        <h3>What the absence of a boundary costs</h3>
        <p>The other side of the ledger is easy to underestimate because it's deferred: if <code>{'PlaceOrderUseCase'}</code> called <code>{'JpaOrderRepository'}</code> directly everywhere, and six months later the team genuinely needs to swap persistence technologies, the retrofit isn't a single afternoon. It's finding every call site, extracting an interface after the fact, verifying behavior didn't drift during the extraction, and doing all of it under the schedule pressure that usually accompanies "we have to migrate off this database." The cost didn't disappear by skipping the boundary — it moved later and grew.</p>
        <h3>YAGNI and boundaries are in genuine tension, not aligned</h3>
        <p>YAGN — "you aren't gonna need it" — argues against building for hypothetical futures. Boundaries argue for building a seam before you're certain you need it, because some seams are far cheaper to add early than to retrofit late. Resolving the tension means asking two questions, honestly, for each candidate boundary: how likely is this specific axis of change to materialize, and how much more expensive would it be to introduce this same boundary after the code around it has grown? A seam with low retrofit cost can wait. A seam with high retrofit cost — anything many other classes will come to depend on directly — deserves to be drawn earlier, even under some uncertainty.</p>
        <h3>This is a per-seam decision, not a philosophy</h3>
        <p>"Always draw boundaries early" and "always defer until proven necessary" are both wrong as blanket rules. The persistence boundary in this course's domain was worth drawing early because nearly everything ends up depending on order storage. A boundary around, say, how order line numbers are formatted in a log message almost never is — low retrofit cost, low likelihood of change, not worth a single extra file.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="Line chart: cost of introducing a boundary early stays low and flat over time, while the cost of retrofitting it later rises steeply, crossing a point of no easy return">
            <line x1="60" y1="220" x2="620" y2="220" className="mutedStroke" strokeWidth="2" />
            <line x1="60" y1="220" x2="60" y2="30" className="mutedStroke" strokeWidth="2" />
            <text x="340" y="248" textAnchor="middle" fontSize="12" className="mutedFill">Time / code that depends on the seam</text>
            <text x="30" y="125" textAnchor="middle" fontSize="12" className="mutedFill" transform="rotate(-90 30 125)">Cost to add boundary</text>

            <path d="M60 195 L620 190" className="accentStroke" strokeWidth="2.5" fill="none" />
            <text x="560" y="178" textAnchor="middle" fontSize="10" className="accentFill">drawn early</text>

            <path d="M60 205 C 250 200, 420 120, 600 45" className="mutedStroke" strokeWidth="2.5" fill="none" />
            <text x="560" y="70" textAnchor="middle" fontSize="10" className="mutedFill">retrofitted late</text>

            <line x1="430" y1="30" x2="430" y2="220" className="mutedStroke" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="430" y="20" textAnchor="middle" fontSize="10" className="mutedFill">point of no easy return</text>

            <circle cx="90" cy="200" r="4" className="accentFill" />
            <text x="90" y="215" textAnchor="middle" fontSize="9" className="mutedFill">decision point</text>
          </svg>
          <p className="diagramCaption">Some seams stay cheap to add for a long time; others get exponentially more expensive once enough code depends on them directly — the trade-off is knowing which is which.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Because <code>{'PlaceOrderUseCase'}</code> already depends on the <code>{'OrderRepository'}</code> interface, the boundary was cheap — one interface, one implementation, wired once. The comment marks exactly what the alternative would have cost.</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase;

public class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    // Boundary already paid for: one interface, wired once.
    // If this had been a direct dependency on JpaOrderRepository from
    // day one, and forty other classes had grown the same dependency
    // over a year, swapping the database now would mean:
    //   1. Extracting an interface after the fact from a class whose
    //      shape was never designed to be an abstraction.
    //   2. Finding and updating every direct call site.
    //   3. Writing regression tests to prove behavior didn't drift
    //      during an extraction nobody planned for.
    private final OrderRepository orderRepository;
    private final PlaceOrderOutputBoundary presenter;

    public PlaceOrderUseCase(OrderRepository orderRepository,
                              PlaceOrderOutputBoundary presenter) {
        this.orderRepository = orderRepository;
        this.presenter = presenter;
    }

    @Override
    public void execute(PlaceOrderRequest request) {
        Order order = Order.from(request);
        order.place();
        orderRepository.save(order);
        presenter.present(new PlaceOrderResponse(order.id(), order.total()));
    }
}`}</code></pre>
        <p>The interface cost roughly an hour to introduce when the class was written. Retrofitting it after forty call sites exist is a project, not an hour — that asymmetry is the whole argument for drawing this particular boundary early.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Boundaries as a blanket policy</h3><p>Interfacing every dependency on principle, regardless of how unlikely it is to vary, inflates file count and cognitive load for seams that will never pay the cost back — this is the exact over-application the axis-of-change test in the first lesson was meant to prevent.</p></div>
          <div><b>MISTAKE</b><h3>Treating YAGNI as license for zero seams</h3><p>Hardwiring framework and persistence types straight into business rules because "we don't need flexibility yet" ignores that some retrofits are cheap and some are brutally expensive — YAGNI without a retrofit-cost estimate is a guess dressed up as a principle.</p></div>
          <div><b>MISTAKE</b><h3>Letting org chart or sprint boundaries decide</h3><p>Drawing a boundary because two teams happen to own adjacent code this quarter, rather than because a real axis of change exists between them, produces boundaries that don't protect anything and get quietly bypassed the moment the org chart changes again.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your team estimates a boundary between <code>{'PlaceOrderUseCase'}</code> and notification-sending would take two days to add now, versus roughly three weeks to retrofit after six more months of direct dependencies accumulate. What's the actual trade-off calculus here beyond just comparing those two numbers, and what additional information would you want before deciding?</p>
        </div>
      </section>
    </div>
  );
}
