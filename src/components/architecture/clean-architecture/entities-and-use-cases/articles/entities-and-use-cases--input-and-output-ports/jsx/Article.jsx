export default function EntitiesAndUseCasesInputAndOutputPortsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Input and output ports are the two interfaces that let a use case talk to the outside world without ever depending on it.</p>
        <p>This is the mechanism, not just the metaphor, behind "the use case doesn't know about the web or the UI." Both boundary interfaces are owned by the use-case layer itself, and that single fact is what keeps <code>PlaceOrderUseCase</code> completely ignorant of Spring MVC on one side and JSON formatting on the other.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>A <strong>port</strong> is just an interface that marks a boundary the Dependency Rule has to respect. There are two, matching the two directions data flows through a use case:</p>
        <ul>
          <li><strong>Input boundary</strong> — <code>PlaceOrderInputBoundary</code>. This is what a controller calls <em>into</em>. It declares the operation the outside world can ask the use case to perform, in terms of plain data.</li>
          <li><strong>Output boundary</strong> — <code>PlaceOrderOutputBoundary</code>. This is what the interactor calls <em>out to</em> when it's done. It declares what the use case can report back, again in plain data — never in a view-ready or framework-specific shape.</li>
        </ul>
        <h3>Ownership is the whole trick</h3>
        <p>Both interfaces live in the use-case layer's package (<code>com.engineeringdecoded.orders.usecase</code>), not in the controller's package and not in the presenter's package. <code>OrderController</code> depends on <code>PlaceOrderInputBoundary</code> — an interface owned by the inner layer — and <code>OrderPresenter</code> implements <code>PlaceOrderOutputBoundary</code> — again, an interface owned by the inner layer. In both cases, the arrow of dependency points <strong>toward</strong> the use case, never away from it. This is the Dependency Inversion Principle applied at an architectural seam: outer, volatile code depends on an abstraction defined by inner, stable code, never the reverse.</p>
        <h3>What this buys you</h3>
        <p>Because <code>PlaceOrderUseCase</code> only knows the shape of two interfaces it owns, you can swap the delivery mechanism (REST today, a message queue tomorrow) by writing a new adapter that implements <code>PlaceOrderInputBoundary</code>, and you can swap the presentation format (JSON API response vs. server-rendered HTML vs. a CLI printout) by writing a new class that implements <code>PlaceOrderOutputBoundary</code> — all without a single line inside the interactor changing. The ports are the load-bearing walls; everything else is furniture.</p>
        <h3>Not the same as a repository port</h3>
        <p>Don't confuse these with <code>OrderRepository</code>, which is a different kind of port pointed at persistence (covered in the Gateways lesson). Input/output boundaries are specifically about the interactor's relationship with its caller and its result consumer — the delivery and presentation seam, not the storage seam.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 230" role="img" aria-label="Two boundary interfaces shown as thin vertical panels, both owned by the use case layer, with dependency arrows from the controller and presenter pointing inward toward the interactor">
            <rect x="250" y="30" width="160" height="170" rx="6" className="accentStroke" fill="none" strokeWidth="1" strokeDasharray="2 3" />
            <text x="330" y="20" textAnchor="middle" fontSize="9" className="accentFill">use-case layer owns both interfaces</text>

            <rect x="270" y="90" width="120" height="60" rx="6" className="accentStroke" fill="none" strokeWidth="2.5" />
            <text x="330" y="118" textAnchor="middle" fontSize="10">PlaceOrderUseCase</text>
            <text x="330" y="134" textAnchor="middle" fontSize="8">interactor</text>

            <rect x="60" y="95" width="34" height="50" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="77" y="88" textAnchor="middle" fontSize="8">InputBoundary</text>

            <rect x="566" y="95" width="34" height="50" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="583" y="88" textAnchor="middle" fontSize="8">OutputBoundary</text>

            <rect x="10" y="90" width="90" height="60" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="55" y="124" textAnchor="middle" fontSize="9">OrderController</text>

            <rect x="558" y="90" width="92" height="60" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="604" y="124" textAnchor="middle" fontSize="9">OrderPresenter</text>

            <line x1="100" y1="120" x2="268" y2="120" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowPort)" />
            <line x1="392" y1="120" x2="556" y2="120" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowPort)" />

            <text x="180" y="175" textAnchor="middle" fontSize="9">depends on (calls into)</text>
            <text x="475" y="175" textAnchor="middle" fontSize="9">implements (called out to)</text>

            <defs>
              <marker id="arrowPort" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Both boundary interfaces belong to the use-case layer — controllers and presenters depend inward on them, never the other way around.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Both ports are small interfaces, defined right alongside the interactor they serve:</p>
        <pre><code>{`package com.engineeringdecoded.orders.usecase;

// Input boundary — what a controller calls into.
public interface PlaceOrderInputBoundary {
    void placeOrder(PlaceOrderRequest request);
}

// Output boundary — what the interactor calls out to when it's done.
public interface PlaceOrderOutputBoundary {
    void presentSuccess(PlaceOrderResponse response);
    void presentFailure(String reason);
}

// --- adapter.web package: only depends on the interfaces above ---

package com.engineeringdecoded.orders.adapter.web;

import com.engineeringdecoded.orders.usecase.PlaceOrderInputBoundary;
import com.engineeringdecoded.orders.usecase.PlaceOrderRequest;

public class OrderController {

    private final PlaceOrderInputBoundary placeOrder; // depends on the interface, not the interactor class

    public OrderController(PlaceOrderInputBoundary placeOrder) {
        this.placeOrder = placeOrder;
    }

    public void handlePlaceOrder(PlaceOrderRequest request) {
        placeOrder.placeOrder(request);
    }
}`}</code></pre>
        <p><code>OrderController</code> never imports <code>PlaceOrderUseCase</code> directly — only the boundary interface. The concrete interactor gets wired in by the composition root, which you'll see in a later lesson.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Defining the output boundary in the presenter's package</h3><p>Putting <code>PlaceOrderOutputBoundary</code> under <code>adapter.web</code> instead of <code>usecase</code> flips the ownership: now the use-case layer would have to depend on the adapter layer to see the interface, breaking the Dependency Rule entirely.</p></div>
          <div><b>MISTAKE</b><h3>Controller depending on the interactor class directly</h3><p>Injecting <code>PlaceOrderUseCase</code> instead of <code>PlaceOrderInputBoundary</code> into <code>OrderController</code> works today but silently removes the seam — you can no longer swap in a test double or an alternate implementation without changing the controller.</p></div>
          <div><b>MISTAKE</b><h3>One boundary interface shared across unrelated use cases</h3><p>A single giant <code>OrderInputBoundary</code> with methods for placing, cancelling, and refunding forces every controller to depend on operations it doesn't call, and makes it unclear which use case actually changed when the interface does.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>If you wanted to add a second delivery mechanism — a CLI command that also places orders — which classes would you need to write, and which existing classes, including <code>PlaceOrderUseCase</code>, would need zero changes? What does that tell you about where the real cost of "supporting a new channel" actually lives?</p>
        </div>
      </section>
    </div>
  );
}
