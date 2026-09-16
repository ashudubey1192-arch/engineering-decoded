export default function BoundariesPluginArchitectureArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Zoom out far enough and every boundary you've drawn adds up to one shape: a stable core, surrounded by plugins that can be swapped without the core noticing.</p>
        <p>This lesson reframes everything from this section so far as a single system-level picture. Once business rules and use cases are isolated behind interfaces they own, the database, the web framework, the messaging system, and every external service stop being "the architecture" and become interchangeable plugins around it. This is the payoff of doing boundaries well: a core that could, in principle, keep running while you unplugged and replugged almost everything around it.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>The core is entities and use cases, nothing else</h3>
        <p>In the order-management system, the core is <code>{'Order'}</code>, <code>{'OrderLine'}</code>, <code>{'Money'}</code>, and the use cases that orchestrate them, like <code>{'PlaceOrderUseCase'}</code>. It has no knowledge of Spring MVC, Hibernate, Kafka, or any specific email provider — only of the ports it needs, like <code>{'OrderRepository'}</code> or a notification gateway interface. Everything with a vendor name attached to it lives outside the core by definition.</p>
        <h3>Plugins connect through interfaces the core defines</h3>
        <p>Each plugin — the Spring MVC controllers, the JPA repository implementation, a Kafka event publisher, an email gateway — implements an interface that the core owns. The plugin doesn't get to shape that interface; it conforms to it, the same discipline from the boundary-interfaces lesson, just repeated once for every external concern instead of once for persistence alone. This is what makes the picture a hub, not a layered stack: the core doesn't call "downward" into specific technologies, it calls "outward" into abstractions, and plugins call "inward" to satisfy them.</p>
        <h3>Swappability is the test, not a slogan</h3>
        <p>"Plugin architecture" doesn't require dynamically loaded JARs or an actual plugin framework — in most systems it just means compile-time replaceable via dependency injection. The real test is concrete: could you write a second implementation of <code>{'OrderRepository'}</code> backed by a different database, wire it in at the composition root, and have <code>{'PlaceOrderUseCase'}</code> run unmodified? If yes, that seam is a genuine plugin boundary. If the use case would need changes too, it wasn't actually decoupled from that plugin — it just looked that way.</p>
        <h3>The composition root is where plugins get plugged in</h3>
        <p>Nothing wires plugins to the core automatically. A composition root — <code>{'Main'}</code> or a Spring <code>{'@Configuration'}</code> class — is the one place in the system allowed to know about both the interfaces and their concrete implementations simultaneously, constructing the object graph and handing the core its plugins at startup.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 420" role="img" aria-label="Plugin architecture diagram: a central core of Entities and Use Cases surrounded by four plugins — Web UI, Database, Messaging, and Email Gateway — each connecting through an interface the core defines">
            <circle cx="330" cy="210" r="95" className="accentStroke" fill="none" strokeWidth="2.5" />
            <text x="330" y="200" textAnchor="middle" fontSize="14" fontWeight="600">Core</text>
            <text x="330" y="220" textAnchor="middle" fontSize="10" className="mutedFill">Entities</text>
            <text x="330" y="235" textAnchor="middle" fontSize="10" className="mutedFill">Use Cases</text>

            <rect x="255" y="10" width="150" height="52" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="330" y="30" textAnchor="middle" fontSize="11" fontWeight="600">Web UI</text>
            <text x="330" y="45" textAnchor="middle" fontSize="9" className="mutedFill">Spring MVC</text>
            <path d="M330 62 L330 105" className="accentStroke" strokeWidth="2" markerEnd="url(#pArr)" fill="none" />
            <circle cx="330" cy="115" r="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="365" y="90" textAnchor="middle" fontSize="8" className="mutedFill">InputBoundary</text>

            <rect x="480" y="150" width="150" height="52" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="555" y="170" textAnchor="middle" fontSize="11" fontWeight="600">Database</text>
            <text x="555" y="185" textAnchor="middle" fontSize="9" className="mutedFill">JPA / Postgres</text>
            <path d="M480 176 L423 182" className="accentStroke" strokeWidth="2" markerEnd="url(#pArr)" fill="none" />
            <circle cx="413" cy="184" r="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="470" y="215" textAnchor="middle" fontSize="8" className="mutedFill">OrderRepository</text>

            <rect x="255" y="358" width="150" height="52" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="330" y="378" textAnchor="middle" fontSize="11" fontWeight="600">Messaging</text>
            <text x="330" y="393" textAnchor="middle" fontSize="9" className="mutedFill">Kafka publisher</text>
            <path d="M330 358 L330 315" className="accentStroke" strokeWidth="2" markerEnd="url(#pArr)" fill="none" />
            <circle cx="330" cy="305" r="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="380" y="330" textAnchor="middle" fontSize="8" className="mutedFill">EventPublisher</text>

            <rect x="30" y="150" width="150" height="52" rx="6" className="mutedStroke" fill="none" strokeWidth="2" />
            <text x="105" y="170" textAnchor="middle" fontSize="11" fontWeight="600">Notifications</text>
            <text x="105" y="185" textAnchor="middle" fontSize="9" className="mutedFill">Email gateway</text>
            <path d="M180 176 L237 182" className="accentStroke" strokeWidth="2" markerEnd="url(#pArr)" fill="none" />
            <circle cx="247" cy="184" r="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="190" y="215" textAnchor="middle" fontSize="8" className="mutedFill">NotificationGateway</text>

            <defs>
              <marker id="pArr" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0 0 L8 4 L0 8 Z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">The core defines every dot on its boundary as an interface; each plugin around it conforms to one and can be replaced without touching the core.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>The composition root is the only place that knows both the core's ports and the concrete plugins — swapping <code>{'JpaOrderRepository'}</code> for a different plugin would mean changing this one class, not <code>{'PlaceOrderUseCase'}</code>.</p>
        <pre><code>{`package com.engineeringdecoded.orders;

@Configuration
public class OrdersConfiguration {

    @Bean
    public OrderRepository orderRepository(SpringDataOrderJpaRepository jpa,
                                            OrderEntityMapper mapper) {
        // Today's plugin. Swapping to a different database means
        // changing this method only — PlaceOrderUseCase never moves.
        return new JpaOrderRepository(jpa, mapper);
    }

    @Bean
    public NotificationGateway notificationGateway(EmailClient emailClient) {
        return new EmailNotificationGateway(emailClient);
    }

    @Bean
    public PlaceOrderInputBoundary placeOrderUseCase(OrderRepository orderRepository,
                                                       NotificationGateway notifications,
                                                       PlaceOrderOutputBoundary presenter) {
        return new PlaceOrderUseCase(orderRepository, notifications, presenter);
    }
}

// A second plugin, same port, zero changes to the core:
public class InMemoryOrderRepository implements OrderRepository {
    private final Map<OrderId, Order> store = new HashMap<>();
    @Override public void save(Order order) { store.put(order.id(), order); }
    @Override public Optional<Order> findById(OrderId id) { return Optional.ofNullable(store.get(id)); }
}`}</code></pre>
        <p><code>{'InMemoryOrderRepository'}</code> is a real plugin — usable in tests today, and proof that a completely different persistence technology could sit in that same slot in production.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Plugins reaching back through shared state</h3><p>A plugin that mutates a shared static field or singleton the core also reads is a covert back-channel — the core is no longer isolated from that plugin's behavior even though there's no formal source-code dependency, and swapping the plugin can silently change core behavior.</p></div>
          <div><b>MISTAKE</b><h3>Treating the web framework as the center</h3><p>Building the system so that Spring MVC controllers are the entry point that owns wiring, validation, and orchestration turns the "plugin" into the thing everything else plugs into — the framework has quietly become the core, and the actual business rules are the replaceable part.</p></div>
          <div><b>MISTAKE</b><h3>Confusing plugin architecture with dynamic loading</h3><p>Assuming this pattern requires OSGi bundles or runtime class loading leads teams to either over-engineer a simple system or, more often, conclude plugin architecture "doesn't apply to us" and skip separating the core at all — when compile-time swappability via DI is enough for nearly every case.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>If your team replaced Spring Data JPA with a NoSQL store next quarter, list what would have to change and what should not change in a properly plugin-shaped version of this system — be specific about which classes fall on each side.</p>
        </div>
      </section>
    </div>
  );
}
