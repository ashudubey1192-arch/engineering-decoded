export default function DesignPrinciplesOpenClosedPrincipleArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Add new behavior by adding new code, not by reopening code that already works.</p>
        <p>The Open-Closed Principle says a module should be open for extension but closed for modification. In practice that means when the business asks for one more variation of something you already built, you should be able to write a new class and plug it in — without editing, recompiling, or re-testing the classes that already ship. This is the principle that makes plugin-style architectures, and Clean Architecture's whole "swap the framework without touching use cases" promise, actually possible.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Extension without modification</h3>
        <p>"Closed for modification" doesn't mean a class is frozen forever — it means that once it's stable and in production, adding a new case shouldn't require editing its source. "Open for extension" means the design leaves a seam — usually an interface or abstract class — where new behavior can be added by writing a brand-new class that implements that seam. The existing, tested code never has to be touched, recompiled, or redeployed just because a new variant showed up.</p>
        <h3>The seam is almost always an abstraction</h3>
        <p>You get OCP by depending on an abstraction at the point where variation happens, instead of a concrete <code>{'if/else'}</code> or <code>{'switch'}</code> chain over types. Every time you find yourself adding another branch to a conditional whenever a new case appears, that's a signal the code is open for modification but not for extension — exactly backwards from what you want.</p>
        <h3>Applied to pricing rules</h3>
        <p>Say the order system needs to support multiple discount strategies: a percentage-off promo, a loyalty-tier discount, a bulk-quantity discount, and — inevitably — more discount types the business will invent next quarter. A naive implementation puts a <code>{'switch'}</code> over a <code>{'DiscountType'}</code> enum inside <code>{'PlaceOrderUseCase'}</code>. Every new discount type means reopening and re-testing that use case, and risking every other discount that already works.</p>
        <p>The OCP-compliant version introduces a <code>{'DiscountPolicy'}</code> interface. <code>{'PlaceOrderUseCase'}</code> depends only on that interface — it never knows how many implementations exist or what they're called. Adding a new discount is now a matter of writing a new class that implements <code>{'DiscountPolicy'}</code> and registering it at the composition root; <code>{'PlaceOrderUseCase'}</code>'s source file is never touched again.</p>
        <h3>Where OCP shows up elsewhere in Clean Architecture</h3>
        <p>The same shape reappears constantly: a new persistence technology means writing a new <code>{'OrderRepository'}</code> implementation, not editing the use case that depends on the interface; a new delivery mechanism (a CLI, a message queue consumer) means a new adapter, not a rewrite of the interactor underneath it. OCP is really DIP applied over time — abstractions are the stable seams that let the system grow without regressing what already works.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="Diagram showing PlaceOrderUseCase depending on a DiscountPolicy interface, with three concrete discount classes implementing it and a fourth added without touching the use case">
            <rect x="240" y="30" width="180" height="44" rx="6" className="accentStroke" fill="none" />
            <text x="330" y="57" textAnchor="middle" fontSize="12">PlaceOrderUseCase</text>

            <line x1="330" y1="74" x2="330" y2="108" className="accentStroke" strokeWidth="1.5" markerEnd="url(#ocpArrow)" />

            <rect x="230" y="110" width="200" height="36" rx="6" className="accentStroke" fill="none" strokeDasharray="4 3" />
            <text x="330" y="133" textAnchor="middle" fontSize="11">«interface» DiscountPolicy</text>

            <line x1="120" y1="200" x2="270" y2="148" className="mutedStroke" strokeWidth="1" markerEnd="url(#ocpArrowMuted)" />
            <rect x="40" y="200" width="140" height="34" rx="6" className="mutedStroke" fill="none" />
            <text x="110" y="221" textAnchor="middle" fontSize="9">PercentageDiscount</text>

            <line x1="330" y1="200" x2="330" y2="148" className="mutedStroke" strokeWidth="1" markerEnd="url(#ocpArrowMuted)" />
            <rect x="260" y="200" width="140" height="34" rx="6" className="mutedStroke" fill="none" />
            <text x="330" y="221" textAnchor="middle" fontSize="9">LoyaltyTierDiscount</text>

            <line x1="540" y1="200" x2="390" y2="148" className="mutedStroke" strokeWidth="1" markerEnd="url(#ocpArrowMuted)" />
            <rect x="460" y="200" width="160" height="34" rx="6" className="accentStroke" fill="none" strokeDasharray="3 3" />
            <text x="540" y="216" textAnchor="middle" fontSize="9">SeasonalDiscount</text>
            <text x="540" y="228" textAnchor="middle" fontSize="8">(added later, new file)</text>

            <defs>
              <marker id="ocpArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="accentFill" />
              </marker>
              <marker id="ocpArrowMuted" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">PlaceOrderUseCase depends only on DiscountPolicy; a new discount is a new file, never an edit to the use case.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The use case below computes a total using whichever <code>{'DiscountPolicy'}</code> it's handed. Adding <code>{'SeasonalDiscount'}</code> requires no change to <code>{'PlaceOrderUseCase'}</code> or the interface it depends on.</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase.port;

public interface DiscountPolicy {
    Money apply(Order order, Money subtotal);
}

package com.engineeringdecoded.orders.usecase;

public class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository;
    private final DiscountPolicy discountPolicy;
    private final PlaceOrderOutputBoundary outputBoundary;

    public PlaceOrderUseCase(OrderRepository orderRepository,
                              DiscountPolicy discountPolicy,
                              PlaceOrderOutputBoundary outputBoundary) {
        this.orderRepository = orderRepository;
        this.discountPolicy = discountPolicy;
        this.outputBoundary = outputBoundary;
    }

    @Override
    public void execute(PlaceOrderRequest request) {
        Order order = orderRepository.findById(request.orderId());
        Money subtotal = order.subtotal();
        Money finalTotal = discountPolicy.apply(order, subtotal);

        order.place();
        orderRepository.save(order);
        outputBoundary.present(new PlaceOrderResponse(order.id(), finalTotal));
    }
}

// Existing implementations — untouched when a new discount arrives
package com.engineeringdecoded.orders.adapter.pricing;

public class PercentageDiscount implements DiscountPolicy {
    private final int percentOff;
    public PercentageDiscount(int percentOff) { this.percentOff = percentOff; }

    @Override
    public Money apply(Order order, Money subtotal) {
        return subtotal.minusPercent(percentOff);
    }
}

// New requirement, new file — PlaceOrderUseCase never changes
package com.engineeringdecoded.orders.adapter.pricing;

public class SeasonalDiscount implements DiscountPolicy {
    private final Money flatAmountOff;
    public SeasonalDiscount(Money flatAmountOff) { this.flatAmountOff = flatAmountOff; }

    @Override
    public Money apply(Order order, Money subtotal) {
        return subtotal.minus(flatAmountOff);
    }
}`}</code></pre>
        <p>The composition root, not the use case, decides which <code>{'DiscountPolicy'}</code> to wire in — that's the only place that ever needs to know <code>{'SeasonalDiscount'}</code> exists.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>A switch statement over a "type" enum</h3><p>Branching on an enum inside business logic looks harmless at first, but every new case means reopening that method — the exact modification OCP tries to avoid — and risks breaking the existing cases.</p></div>
          <div><b>MISTAKE</b><h3>Over-engineering seams nobody asked for</h3><p>Wrapping every class in an interface "just in case" adds indirection with no payoff. OCP applies where variation is actually expected or already recurring — not everywhere by default.</p></div>
          <div><b>MISTAKE</b><h3>Forgetting the composition root still has to change</h3><p>Some engineers think OCP means literally nothing changes anywhere. Wiring the new implementation into the composition root is expected and fine — OCP protects the use case and interface, not the wiring code.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Suppose a new discount needs to know the customer's order history, which no existing <code>{'DiscountPolicy'}</code> implementation currently receives. Does adding that data to the <code>{'apply'}</code> method's signature still count as "closed for modification"? What does that tell you about how much foresight OCP actually demands from an interface's design?</p>
        </div>
      </section>
    </div>
  );
}
