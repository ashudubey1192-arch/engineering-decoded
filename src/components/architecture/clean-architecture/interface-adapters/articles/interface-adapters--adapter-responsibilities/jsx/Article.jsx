export default function InterfaceAdaptersAdapterResponsibilitiesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">The interface-adapters layer has one job — convert data shapes at the seams — and its biggest risk isn't doing too little, it's letting things leak in both directions.</p>
        <p>You've now built a controller, a presenter, a gateway, a view model, and a mapper. This lesson steps back and draws the boundary around all of them as a whole: what belongs in this ring, what must never leak in from the business rules below, and what must never leak out toward the frameworks above.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>Interface adapters is the third ring out from the center. Everything you've built in this section — <code>OrderController</code>, <code>OrderPresenter</code>, <code>OrderViewModel</code>, <code>JpaOrderRepository</code>, <code>OrderEntityMapper</code> — lives here. Its single unifying purpose is converting data between the shape the use-case layer wants and the shape the outside world (frameworks, databases, UIs) wants, in both directions.</p>
        <h3>What belongs here</h3>
        <ul>
          <li><strong>Controllers</strong> — translate inbound framework input into use-case request objects.</li>
          <li><strong>Presenters</strong> — translate use-case output into view models, including all formatting decisions.</li>
          <li><strong>Gateway implementations</strong> — translate between the use case's port interfaces and a specific external system's API (JDBC, an HTTP client, an SDK).</li>
          <li><strong>View models</strong> — hold data already shaped for one specific view.</li>
          <li><strong>Mappers</strong> — the explicit translation code that makes all of the above honest instead of leaky.</li>
        </ul>
        <h3>What must not leak in: business rules</h3>
        <p>Nothing in this layer should decide whether an order is valid, whether stock should be reserved, or what happens when an order is cancelled. Those decisions belong to entities and use cases. A controller that checks credit limits, a presenter that recalculates a total, or a gateway that silently retries a failed save with different business semantics are all examples of enterprise or application rules leaking outward into a layer that's only supposed to translate.</p>
        <h3>What must not leak out: framework types</h3>
        <p>Just as importantly, nothing from this layer should reach inward into the use-case layer. <code>PlaceOrderInputBoundary</code>, <code>PlaceOrderRequest</code>, <code>PlaceOrderOutputBoundary</code>, and <code>OrderRepository</code> must never mention <code>{'HttpServletRequest'}</code>, a JPA annotation, or a Spring type in their signatures. The interface-adapters layer is where those framework details are absorbed and converted away — if a framework type manages to cross back into the use-case layer, every promise this architecture makes about swappability and testability quietly breaks.</p>
        <h3>A layer of honest translators, not decision-makers</h3>
        <p>The unifying test for anything you're about to add to this layer: "am I converting a shape, or am I deciding something?" Converting a shape belongs here. Deciding something belongs one ring in (business rules) or is a detail this layer delegates outward (an actual database call, an actual HTTP request) to the frameworks-and-drivers ring you haven't built yet.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="Interface adapters layer shown as a ring containing controller, presenter, gateway, and view model boxes, with a blocked arrow labeled business rules from below and a blocked arrow labeled framework types from above" >
            <rect x="70" y="70" width="520" height="130" rx="10" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="330" y="58" textAnchor="middle" fontSize="11" className="accentFill">Interface Adapters</text>

            <rect x="95" y="95" width="105" height="46" rx="5" className="mutedStroke" fill="none" strokeWidth="1.3" />
            <text x="147" y="122" textAnchor="middle" fontSize="8">Controller</text>

            <rect x="215" y="95" width="105" height="46" rx="5" className="mutedStroke" fill="none" strokeWidth="1.3" />
            <text x="267" y="122" textAnchor="middle" fontSize="8">Presenter</text>

            <rect x="335" y="95" width="105" height="46" rx="5" className="mutedStroke" fill="none" strokeWidth="1.3" />
            <text x="387" y="122" textAnchor="middle" fontSize="8">Gateway impl</text>

            <rect x="455" y="95" width="105" height="46" rx="5" className="mutedStroke" fill="none" strokeWidth="1.3" />
            <text x="507" y="122" textAnchor="middle" fontSize="8">View Model</text>

            <text x="330" y="165" textAnchor="middle" fontSize="8" className="mutedFill">mappers translate at every edge of this ring</text>

            <text x="330" y="235" textAnchor="middle" fontSize="9">business rules blocked from entering ↑</text>
            <line x1="230" y1="245" x2="260" y2="215" className="mutedStroke" strokeWidth="2" />
            <line x1="260" y1="245" x2="230" y2="215" className="mutedStroke" strokeWidth="2" />

            <text x="330" y="35" textAnchor="middle" fontSize="9">framework types blocked from leaving ↓</text>
            <line x1="400" y1="25" x2="430" y2="55" className="mutedStroke" strokeWidth="2" />
            <line x1="430" y1="25" x2="400" y2="55" className="mutedStroke" strokeWidth="2" />
          </svg>
          <p className="diagramCaption">The interface-adapters ring holds only translators — business rules never enter it, and framework types never leave it.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A composition point that wires everything together shows the whole layer's job at a glance — pure assembly, no decisions:</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.web;

import com.engineeringdecoded.orders.adapter.persistence.JpaOrderRepository;
import com.engineeringdecoded.orders.usecase.PlaceOrderInputBoundary;
import com.engineeringdecoded.orders.usecase.PlaceOrderUseCase;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OrderWiringConfig {

    @Bean
    public PlaceOrderOutputBoundary placeOrderOutputBoundary() {
        return new OrderPresenter();
    }

    @Bean
    public PlaceOrderInputBoundary placeOrderInputBoundary(JpaOrderRepository orderRepository,
                                                             PlaceOrderOutputBoundary outputBoundary) {
        // Assembly only: no business logic, no formatting, no framework leakage
        // into PlaceOrderUseCase's constructor arguments.
        return new PlaceOrderUseCase(orderRepository, outputBoundary);
    }

    @Bean
    public OrderController orderController(PlaceOrderInputBoundary placeOrder) {
        return new OrderController(placeOrder);
    }
}`}</code></pre>
        <p>Every class this configuration wires together is either a use-case type behind an interface, or an interface-adapters class that implements one. Nothing here decides anything about orders — it only assembles translators around a use case that stays completely unaware of Spring, JPA, or HTTP.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Treating "adapters" as a dumping ground</h3><p>Once a codebase has an <code>adapter</code> package, it becomes tempting to put anything hard-to-classify there — utility classes, cross-cutting logic, even bits of business logic "just for now." Left unchecked, the layer stops being translators and becomes a second, undisciplined business layer.</p></div>
          <div><b>MISTAKE</b><h3>A framework type sneaking into a use-case-owned interface</h3><p>Adding a Spring <code>{'@Transactional'}</code> requirement or an <code>{'HttpStatus'}</code> return type to <code>PlaceOrderOutputBoundary</code> "since Spring is already a dependency here" pulls a framework concept into a boundary the use-case layer owns and is supposed to be framework-agnostic.</p></div>
          <div><b>MISTAKE</b><h3>Skipping the adapters layer "since it's just CRUD"</h3><p>Wiring a controller straight to a JPA repository for a "simple" feature, planning to "add proper layers later," is how simple features quietly grow business logic directly inside a controller, with no seam left to retrofit once it matters.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A new requirement says: "if an order's total exceeds $5,000, log it to a separate audit table for compliance." Walk through which of controller, presenter, gateway, or use case should own each part of that requirement, and identify the one part, if any, that's purely an interface-adapters concern.</p>
        </div>
      </section>
    </div>
  );
}
