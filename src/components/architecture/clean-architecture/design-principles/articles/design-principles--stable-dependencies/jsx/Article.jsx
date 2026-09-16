export default function DesignPrinciplesStableDependenciesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Depend only on things less likely to change than you are — never the other way around.</p>
        <p>The Stable Dependencies Principle (SDP) gives a name to something you already feel intuitively: it's fine for a volatile, frequently-changing component to depend on a rock-solid one, but backwards for a rock-solid component to depend on something volatile, because every change to the volatile thing then drags the stable thing along with it. SDP turns that intuition into something you can actually reason about with a metric, and it's the principle that explains <em>why</em> the Dependency Rule points inward, not just that it does.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>What "stability" means for a component</h3>
        <p>Stability here has nothing to do with correctness or bugs — it means "how hard is this to change." A component is hard to change when a lot of other things depend on it, because changing it has to consider all those dependents. A component is easy to change when nothing depends on it — you can rewrite it freely and nothing else breaks. So stability is really about <strong>how many things would be affected</strong> if this component changed.</p>
        <h3>The intuition behind the instability metric</h3>
        <p>Robert Martin formalizes this by counting two things for a component: how many other components depend <em>on</em> it (fan-in), and how many other components <em>it</em> depends on (fan-out). A component with lots of incoming dependencies and few outgoing ones is stable — many things rely on it, but it doesn't rely on much, so it has little reason to be forced to change and a lot of blast radius if it does. A component with lots of outgoing dependencies and few incoming ones is unstable — it depends on plenty of things that can each drag it into a change, but nothing depends on it, so when it <em>does</em> change, nothing downstream feels it. Martin calls this ratio "instability" (I): roughly, instability is the fraction of a component's total dependency relationships that are outgoing. A component that only gets depended on has instability near zero (maximally stable); a component that only depends on others and has nothing depending on it has instability near one (maximally unstable). You don't need to memorize a formula — just remember that <strong>high fan-in and low fan-out means stable, high fan-out and low fan-in means unstable</strong>.</p>
        <h3>The principle itself</h3>
        <p>SDP says: a component should depend only on components that are equally or more stable than itself. Violate this and you get a stable component whose fate is tied to something volatile — every time the volatile component changes, the stable one (and everything that depends on it) is forced to change too, even though nothing about the stable component's own responsibility changed.</p>
        <h3>Why entities are stable and controllers are not</h3>
        <p>In the order-management domain, <code>{'Order'}</code> has essentially zero outgoing dependencies — no imports from persistence, no imports from the web layer, nothing but plain Java. Meanwhile <code>{'PlaceOrderUseCase'}</code>, <code>{'OrderInvoiceFormatter'}</code>, <code>{'JpaOrderRepository'}</code>, and <code>{'OrderController'}</code> all depend on it. That's a low fan-out, high fan-in shape: <code>{'Order'}</code> is highly stable, exactly as you'd want for the class everything else is built on. <code>{'OrderController'}</code>, by contrast, depends on Spring MVC, on <code>{'PlaceOrderInputBoundary'}</code>, and on <code>{'OrderPresenter'}</code> — high fan-out — while essentially nothing depends back on <code>{'OrderController'}</code> — low fan-in. It's highly unstable, and that's fine, because nothing important is built on top of a controller.</p>
        <p>SDP violated would look like <code>{'Order'}</code> importing something from <code>{'adapter.web'}</code> — say, calling back into <code>{'OrderController'}</code> to check a request header. Now the most stable, most depended-upon class in the system is at the mercy of a web-layer class that changes constantly. A routing change or a new endpoint could now force a rebuild of the entity every other component in the system relies on.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 250" role="img" aria-label="Diagram showing four components arranged from unstable to stable with allowed dependency arrows pointing only toward more stable components">
            <rect x="30" y="90" width="130" height="50" rx="6" className="mutedStroke" fill="none" />
            <text x="95" y="112" textAnchor="middle" fontSize="9">OrderController</text>
            <text x="95" y="128" textAnchor="middle" fontSize="8">I ≈ high</text>

            <rect x="200" y="90" width="130" height="50" rx="6" className="mutedStroke" fill="none" />
            <text x="265" y="112" textAnchor="middle" fontSize="9">JpaOrderRepository</text>
            <text x="265" y="128" textAnchor="middle" fontSize="8">I ≈ high</text>

            <rect x="370" y="90" width="130" height="50" rx="6" className="accentStroke" fill="none" />
            <text x="435" y="112" textAnchor="middle" fontSize="9">PlaceOrderUseCase</text>
            <text x="435" y="128" textAnchor="middle" fontSize="8">I ≈ mid</text>

            <rect x="530" y="90" width="90" height="50" rx="6" className="accentStroke" fill="none" />
            <text x="575" y="112" textAnchor="middle" fontSize="9">Order</text>
            <text x="575" y="128" textAnchor="middle" fontSize="8">I ≈ low</text>

            <line x1="160" y1="115" x2="198" y2="115" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#sdpArrow)" />
            <line x1="330" y1="115" x2="368" y2="115" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#sdpArrow)" />
            <line x1="500" y1="115" x2="528" y2="115" className="accentStroke" strokeWidth="1.5" markerEnd="url(#sdpArrowAccent)" />

            <text x="330" y="170" textAnchor="middle" fontSize="10">allowed: dependencies flow toward increasing stability →</text>
            <line x1="60" y1="195" x2="600" y2="195" className="mutedStroke" strokeWidth="1" strokeDasharray="3 3" markerEnd="url(#sdpArrow)" />
            <text x="60" y="215" fontSize="9">unstable (easy to change,</text>
            <text x="60" y="228" fontSize="9">nothing depends on it)</text>
            <text x="470" y="215" fontSize="9" textAnchor="end">stable (hard to change,</text>
            <text x="470" y="228" fontSize="9" textAnchor="end">much depends on it)</text>

            <defs>
              <marker id="sdpArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="mutedFill" />
              </marker>
              <marker id="sdpArrowAccent" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Dependencies should only flow from less stable components toward more stable ones — never backward.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The violation makes the most stable class in the system depend on one of the least stable; the fix keeps the dependency arrow pointing the right way, using the same abstraction-based inversion from the DIP lesson.</p>
        <pre><code>{`// VIOLATION — a highly stable entity depending on a highly unstable adapter
package com.engineeringdecoded.orders.entity;

import com.engineeringdecoded.orders.adapter.web.RequestContext; // web-layer import!

public class Order {
    private OrderStatus status;

    public void place(RequestContext requestContext) {
        // Order now changes whenever the web layer's request shape changes
        if (requestContext.header("X-Priority-Customer") != null) {
            status = OrderStatus.PLACED_PRIORITY;
        } else {
            status = OrderStatus.PLACED;
        }
    }
}

// FIX — Order depends on nothing; the volatile detail is pushed to the caller
package com.engineeringdecoded.orders.entity;

public class Order {
    private OrderStatus status;

    public void place(boolean isPriorityCustomer) {
        if (lines.isEmpty()) {
            throw new IllegalStateException("Cannot place an order with no lines");
        }
        status = isPriorityCustomer ? OrderStatus.PLACED_PRIORITY : OrderStatus.PLACED;
    }
}

// The unstable adapter now does the work of reading its own volatile detail
// and depends INWARD on the stable entity — the correct direction
package com.engineeringdecoded.orders.adapter.web;

public class OrderController {

    private final PlaceOrderInputBoundary placeOrder;

    public OrderController(PlaceOrderInputBoundary placeOrder) {
        this.placeOrder = placeOrder;
    }

    public void handlePlaceOrder(HttpServletRequest request) {
        boolean isPriority = request.getHeader("X-Priority-Customer") != null;
        placeOrder.execute(new PlaceOrderRequest(/* ... */, isPriority));
    }
}`}</code></pre>
        <p>After the fix, <code>{'Order'}</code> has zero knowledge of HTTP; only <code>{'OrderController'}</code> — already unstable, already expected to change often — absorbs that volatility.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>"Just importing one small thing" from an outer layer</h3><p>A single convenience import from a controller or a framework class into an entity or use case looks harmless, but it's enough to make a stable component's compile depend on a volatile one's churn.</p></div>
          <div><b>MISTAKE</b><h3>Assuming stability is about how old or well-tested code is</h3><p>Stability in SDP is purely structural — fan-in versus fan-out — not a judgment about code quality. A brand-new interface with many implementers is already stable; a ten-year-old controller with no dependents is still unstable.</p></div>
          <div><b>MISTAKE</b><h3>Treating every dependency as equally risky</h3><p>Teams sometimes resist any new dependency at all. SDP doesn't forbid depending on things — it forbids depending on things <em>less stable than you</em>. Depending on a more stable abstraction is exactly what you want.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>The <code>{'OrderRepository'}</code> interface (in <code>{'usecase.port'}</code>) has several implementations depending on it (high fan-in) and depends on nothing itself (zero fan-out) — so its instability is close to zero, same as <code>{'Order'}</code>. <code>{'PlaceOrderUseCase'}</code> depends on both. Does that dependency respect SDP? Now suppose someone adds a dependency from <code>{'OrderRepository'}</code> back to <code>{'PlaceOrderUseCase'}</code> for a "convenience" callback — which component's instability would that change, and why would it now violate the principle?</p>
        </div>
      </section>
    </div>
  );
}
