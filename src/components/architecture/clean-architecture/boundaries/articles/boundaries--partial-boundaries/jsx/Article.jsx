export default function BoundariesPartialBoundariesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">You don't have to buy a full boundary outright — you can buy the option on one, cheaply, and that option is a deliberate trade-off, not a shortcut you forget about.</p>
        <p>A full boundary costs real effort: an interface, a separate implementation, a data-crossing shape, and a place that wires them together. Sometimes that cost is justified today; often it isn't yet, because the volatility that would justify it hasn't shown up. Robert C. Martin's answer to this gap is the partial boundary — a handful of lighter-weight patterns that get you some of the decoupling benefit, and the ability to finish the job later, for a fraction of the price.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Strategy without the split</h3>
        <p>The cheapest partial boundary is defining the interface and its only implementation, but keeping both in the same package, deployed together, wired with plain constructor injection instead of a separate module. You get the seam — callers depend on the interface, not the concrete class — without yet paying for physical separation (separate packages, separate build artifacts, a real plugin boundary). If a second implementation is ever needed, the interface is already there; only the implementation split has to happen.</p>
        <h3>A facade that hides the seam, not removes it</h3>
        <p>Another partial form: put a single class in front of a cluster of collaborators as a facade, without yet defining the full interface-plus-implementation structure behind it. Callers get a stable, narrow entry point; the messy detail behind the facade can still be reorganized freely because nothing external depends on its internals directly. It's weaker than a full boundary — the facade itself can still be bypassed — but it's cheap and it buys real flexibility.</p>
        <h3>One-way boundaries</h3>
        <p>A full boundary inverts dependencies in both directions of use. A one-way partial boundary uses an interface for the dependency that matters most right now and accepts a direct dependency the other way, deliberately, because that direction isn't expected to vary. This is a conscious bet on which axis of change is real today, not a mistake — as long as it's written down as a bet, not left implicit.</p>
        <h3>The debt is real, so name it</h3>
        <p>Every partial boundary is technical debt in the literal sense: a deliberate shortcut taken now, with interest that accrues if the volatility it was hedging against actually arrives before the boundary is completed. That's not a reason to avoid partial boundaries — it's a reason to treat them the way you'd treat any other debt: visible, and revisited on purpose rather than discovered under pressure.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="Two panels: a partial boundary today, with an interface and its single implementation in the same package, next to a full boundary later, with the implementation split across a real module boundary">
            <text x="160" y="26" textAnchor="middle" fontSize="13" fontWeight="600">Partial boundary — today</text>
            <rect x="20" y="45" width="290" height="150" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="165" y="68" textAnchor="middle" fontSize="10" className="mutedFill">usecase package</text>

            <rect x="45" y="85" width="240" height="40" rx="5" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="165" y="109" textAnchor="middle" fontSize="10">OrderPricingStrategy (interface)</text>

            <line x1="60" y1="140" x2="270" y2="140" className="mutedStroke" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="165" y="135" textAnchor="middle" fontSize="8" className="mutedFill">future split line</text>

            <rect x="45" y="150" width="240" height="35" rx="5" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="165" y="172" textAnchor="middle" fontSize="10">StandardPricingStrategy (impl)</text>

            <path d="M330 130 L370 130" className="mutedStroke" strokeWidth="2" strokeDasharray="5 5" markerEnd="url(#pbArr)" fill="none" />
            <text x="350" y="118" textAnchor="middle" fontSize="9" className="mutedFill">if needed</text>

            <text x="500" y="26" textAnchor="middle" fontSize="13" fontWeight="600">Full boundary — later</text>
            <rect x="380" y="45" width="110" height="150" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="435" y="68" textAnchor="middle" fontSize="9" className="mutedFill">usecase</text>
            <rect x="395" y="95" width="80" height="40" rx="5" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="435" y="119" textAnchor="middle" fontSize="9">Strategy (iface)</text>

            <line x1="505" y1="35" x2="505" y2="205" className="mutedStroke" strokeWidth="2" strokeDasharray="6 6" />

            <rect x="520" y="45" width="120" height="150" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="580" y="68" textAnchor="middle" fontSize="9" className="mutedFill">adapter module</text>
            <rect x="535" y="95" width="90" height="40" rx="5" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="580" y="119" textAnchor="middle" fontSize="9">PromoPricing</text>

            <text x="330" y="230" textAnchor="middle" fontSize="11" className="mutedFill">Same interface either way — only the physical split changes</text>

            <defs>
              <marker id="pbArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0 0 L8 4 L0 8 Z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">A partial boundary keeps interface and implementation together on purpose; only a real need for a second implementation earns the full split.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The interface and its only implementation live side by side, wired with plain constructor injection — the seam exists for later, but nothing has been physically split out yet.</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase;

// Partial boundary: interface + single implementation, same package.
// If a second pricing strategy shows up, only this file needs to move.
public interface OrderPricingStrategy {
    Money priceFor(Order order);
}

public class StandardOrderPricingStrategy implements OrderPricingStrategy {

    @Override
    public Money priceFor(Order order) {
        return order.total();
    }
}

public class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository;
    private final OrderPricingStrategy pricingStrategy;
    private final PlaceOrderOutputBoundary presenter;

    public PlaceOrderUseCase(OrderRepository orderRepository,
                              OrderPricingStrategy pricingStrategy,
                              PlaceOrderOutputBoundary presenter) {
        this.orderRepository = orderRepository;
        this.pricingStrategy = pricingStrategy;
        this.presenter = presenter;
    }

    @Override
    public void execute(PlaceOrderRequest request) {
        Order order = Order.from(request);
        order.place();
        Money price = pricingStrategy.priceFor(order);
        orderRepository.save(order);
        presenter.present(new PlaceOrderResponse(order.id(), price));
    }
}`}</code></pre>
        <p>When marketing asks for tiered promotional pricing, the change is additive: a new <code>{'OrderPricingStrategy'}</code> implementation and a decision in the composition root — <code>{'PlaceOrderUseCase'}</code> doesn't change.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Mistaking "has an interface" for "is decoupled"</h3><p>Adding an interface but leaving its single method's parameters or return types tied to framework or persistence shapes means the partial boundary protects nothing real — the thing it was supposed to isolate can still leak straight through it.</p></div>
          <div><b>MISTAKE</b><h3>Never revisiting the shortcut</h3><p>A partial boundary left as a permanent "we'll split it later" quietly accumulates unrelated responsibilities in the single implementation until it's doing five jobs — at which point finishing the boundary is far more expensive than it would have been the day the debt was taken on.</p></div>
          <div><b>MISTAKE</b><h3>Using partial boundaries as a blanket default</h3><p>Wrapping every dependency in an interface-plus-single-impl "just in case" pays the small ongoing cost of extra indirection everywhere, for options that will very often never be exercised — the point of a partial boundary is a deliberate bet, not a habit.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p><code>{'OrderPricingStrategy'}</code> has one implementation today. Six months from now, marketing wants three interchangeable strategies selected per customer tier. What work does today's partial boundary save you, and what work still has to happen that it doesn't save you from?</p>
        </div>
      </section>
    </div>
  );
}
