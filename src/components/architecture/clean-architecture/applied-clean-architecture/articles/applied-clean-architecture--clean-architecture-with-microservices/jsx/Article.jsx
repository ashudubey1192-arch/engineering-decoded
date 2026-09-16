export default function AppliedCleanArchitectureCleanArchitectureWithMicroservicesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">"We use microservices" is not an architecture claim — it's a deployment claim, and it says nothing about what's happening inside any one service.</p>
        <p>Microservices and Clean Architecture solve different problems at different scales, and conflating them is one of the most expensive mistakes a team can make. This lesson separates the two: the Dependency Rule governs the boundaries <em>inside</em> a single service's codebase, while the boundary <em>between</em> services is a coarser, different kind of boundary entirely — one crossed by the network, not by an interface.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Two boundaries, two granularities</h3>
        <p>Inside the <code>orders</code> service, the Dependency Rule works exactly as it does in a monolith: entities know nothing about use cases' orchestration, use cases know nothing about Spring or JPA, and adapters depend inward on ports the use case layer owns. That boundary is crossed with a Java method call, resolved at compile time, and enforced by package visibility or module boundaries as covered earlier in this section.</p>
        <p>The boundary between the <code>orders</code> service and the <code>inventory</code> service is a different animal. It's crossed with an HTTP call, a gRPC call, or a message on a queue — serialized, sent over a network, subject to latency, partial failure, retries, and versioning. You cannot "inject an interface" across that boundary the way you inject <code>OrderRepository</code> into a use case; you have to design an actual API contract, handle the case where the other service is down, and think about backward compatibility for every deploy. It's still a boundary the Dependency Rule cares about in spirit — orders' domain logic shouldn't be shaped by inventory's database schema — but the mechanism enforcing it is completely different, and much less forgiving.</p>
        <h3>The mistake: assuming physical separation implies architectural cleanliness</h3>
        <p>Because a microservice is small and deployed independently, teams frequently assume it must be well-factored — after all, "it's just the orders service, it only does one thing." But nothing about splitting a system into services prevents a single service's codebase from being an undisciplined mess internally. It is entirely possible — common, even — to write a microservice where the Spring <code>@RestController</code> method calls Hibernate directly, business rules live in a giant <code>OrderService</code> class annotated with <code>@Service</code>, and there is no entity layer at all. That service is physically small and independently deployable, and it is <em>not</em> clean architecture — it's a tangled monolith that happens to be smaller and to talk over HTTP instead of in-process calls. Splitting a mess into ten smaller messes that now also have network latency and distributed-debugging problems is strictly worse, not better.</p>
        <h3>What actually carries across the service boundary</h3>
        <p>What should stay consistent between a modular monolith and a microservices version of the same system is the <em>internal</em> discipline: each service keeps its own entity/use-case/adapter layering, keeps framework code at its outer edge, and exposes a small, intentional public contract (a REST API, a set of published events) instead of leaking its internal domain model over the wire. The <code>OrderController</code> in the orders service should translate between its internal <code>Order</code> entity and an external-facing DTO at the boundary, exactly the way it would translate between HTTP and the use case layer in a monolith — the network is just one more "framework and driver" detail to keep at the edge.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="Two service boxes, orders service and inventory service, each with their own internal clean architecture rings, connected by a network boundary line crossed by an HTTP arrow, contrasted with a fine-grained interface arrow inside one service">
            <rect x="24" y="30" width="270" height="200" rx="6" className="accentStroke" fill="none" strokeWidth="1.4" />
            <text x="38" y="50" fontSize="12">orders service (its own deploy)</text>
            <circle cx="159" cy="145" r="65" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="159" cy="145" r="44" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="159" cy="145" r="22" className="accentStroke" fill="none" strokeWidth="1.2" />
            <text x="120" y="148" fontSize="9">Order entity</text>
            <line x1="98" y1="100" x2="120" y2="112" className="accentStroke" strokeWidth="1.2" markerEnd="url(#msArrow)" />
            <text x="30" y="98" fontSize="8">in-process interface call</text>

            <rect x="366" y="30" width="270" height="200" rx="6" className="accentStroke" fill="none" strokeWidth="1.4" />
            <text x="380" y="50" fontSize="12">inventory service (its own deploy)</text>
            <circle cx="501" cy="145" r="65" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="501" cy="145" r="44" className="mutedStroke" fill="none" strokeWidth="1" />
            <circle cx="501" cy="145" r="22" className="accentStroke" fill="none" strokeWidth="1.2" />

            <line x1="294" y1="130" x2="366" y2="130" strokeDasharray="6 4" className="mutedStroke" strokeWidth="1.4" />
            <line x1="310" y1="160" x2="350" y2="160" className="accentStroke" strokeWidth="1.6" markerEnd="url(#msArrow)" />
            <text x="290" y="185" fontSize="9">HTTP/JSON over network</text>
            <text x="292" y="112" fontSize="8" className="mutedStroke" fill="currentColor">deployment boundary</text>

            <defs>
              <marker id="msArrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Inside each service, the Dependency Rule is enforced by interfaces; between services, the boundary is enforced by the network and an explicit API contract.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Inside the orders service, the web adapter still translates between the external contract and the internal domain — the network boundary gets the same "keep details at the edge" treatment a database boundary would get:</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.web;

import com.engineeringdecoded.orders.usecase.PlaceOrderInputBoundary;
import com.engineeringdecoded.orders.usecase.PlaceOrderRequest;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final PlaceOrderInputBoundary placeOrder; // use case, unaware of HTTP

    public OrderController(PlaceOrderInputBoundary placeOrder) {
        this.placeOrder = placeOrder;
    }

    @PostMapping
    public ResponseEntity<OrderResponseDto> create(@RequestBody OrderRequestDto body) {
        placeOrder.placeOrder(new PlaceOrderRequest(body.customerId(), body.lines()));
        return ResponseEntity.accepted().build();
    }
}

// The use case, in turn, never calls inventory over HTTP directly —
// it depends on a port, whose implementation happens to make the call.
package com.engineeringdecoded.orders.usecase.port;

public interface InventoryClient {
    boolean isInStock(String sku, int quantity);
}

// adapter.client implements InventoryClient with a REST call, retries,
// and a timeout — all "framework detail" kept out of the use case layer.`}</code></pre>
        <p>The use case depends on <code>InventoryClient</code>, an interface it owns — exactly the Dependency Rule you'd apply for a database port. The fact that the real implementation happens to make a network call is an adapter-layer detail, not a use-case concern.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Assuming "microservice" means "well-architected"</h3><p>A small, independently deployed service can still have a <code>@RestController</code> calling Hibernate directly with zero entity or use-case layer — physical smallness doesn't buy you internal discipline.</p></div>
          <div><b>MISTAKE</b><h3>Leaking internal domain models over the wire</h3><p>Returning the <code>Order</code> entity directly as a JSON response couples every consumer of the API to internal refactors — a field rename inside the entity becomes a breaking API change for every client.</p></div>
          <div><b>MISTAKE</b><h3>Treating the network call like a free interface</h3><p>Calling another service synchronously from deep inside a use case without a timeout, retry policy, or fallback ignores that this boundary fails in ways an in-process interface call never does.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your <code>orders</code> service and <code>inventory</code> service are both "clean" internally, but the inventory service is occasionally slow to respond. Where in the orders codebase should you handle that slowness, and why does that answer depend on treating the service call as an adapter-layer detail rather than a use-case concern?</p>
        </div>
      </section>
    </div>
  );
}
