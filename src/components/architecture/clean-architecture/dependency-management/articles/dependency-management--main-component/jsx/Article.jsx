export default function DependencyManagementMainComponentArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Every rule needs an exception, and Clean Architecture has exactly one: the Main component, which is allowed to know about everything because nothing depends on it back.</p>
        <p>You've now seen the Dependency Rule, the compile-time graph that enforces it, the runtime graph it resolves against, and constructor injection as the mechanism that wires objects together. This lesson covers where that wiring physically lives: the Main component — the outermost, least-constrained piece of code in the entire system.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Main sits outside every ring</h3>
        <p>Martin places Main outside even the Frameworks &amp; Drivers ring, as its own special circle. Every other component in the system has to obey the Dependency Rule relative to the rings inside it. Main doesn't, because there is no ring further out that could ever depend on it — nothing in the whole codebase imports <code>Main</code>. That asymmetry is exactly what licenses it to break every rule the rest of the codebase has to follow.</p>
        <h3>What Main is allowed to do</h3>
        <p>Main is explicitly permitted to import and instantiate concrete classes from every layer: <code>new JpaOrderRepository(entityManager)</code>, <code>new StripePaymentGateway(apiKey)</code>, <code>new OrderController(placeOrderUseCase)</code>. It's allowed to read configuration files, parse command-line arguments, set up logging, configure a connection pool, and start an embedded web server. None of this is a lapse in discipline — it's the one place in the system where this kind of code is supposed to live.</p>
        <h3>Main's actual job description</h3>
        <p>Strip away everything Main is allowed to do and ask what it's <em>for</em>: creating concrete objects and wiring them together so the rest of the system can run in terms of abstractions. In a Spring Boot application, this role is typically split between the <code>@SpringBootApplication</code> class (which boots the container) and one or more <code>@Configuration</code> classes (which describe the wiring — covered in the next lesson on the composition root). In a system with no framework at all, Main is a single class with a <code>public static void main(String[] args)</code> method that does the wiring by hand.</p>
        <h3>Why "dirtiest" is a compliment here, not a criticism</h3>
        <p>Calling Main "dirty" isn't a knock — it's a precise description of where messiness is supposed to concentrate. Every <code>new</code> keyword pointed at a concrete class, every environment-variable read, every framework-specific bootstrap call that you kept out of your entities and use cases has to go <em>somewhere</em>. Main is that somewhere, by design, so that the mess doesn't leak into code that has actual business value and needs to stay stable and testable.</p>
        <h3>Main and the composition root are related but distinct ideas</h3>
        <p>This lesson and the next are closely linked: Main is the <em>component</em> — the outermost circle, the entry point, the thing the JVM actually invokes. The composition root (next lesson) is the <em>pattern</em> for organizing the wiring code that Main triggers — ideally a single, well-organized place rather than scattered across the codebase. Main is often where the composition root is invoked from, but in a Spring application the composition root's actual content (the <code>@Bean</code> definitions) usually lives in separate <code>@Configuration</code> classes that Main merely boots.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 300" role="img" aria-label="A Main box positioned outside four concentric circles representing the architecture layers, with arrows reaching into every ring to construct concrete objects">
            <circle cx="320" cy="170" r="110" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="320" cy="170" r="82" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="320" cy="170" r="54" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <circle cx="320" cy="170" r="26" fill="none" className="mutedStroke" strokeWidth="1.5" />
            <text x="320" y="170" textAnchor="middle" fontSize="9" className="mutedFill">Entities</text>
            <text x="320" y="132" textAnchor="middle" fontSize="9" className="mutedFill">Use Cases</text>
            <text x="320" y="102" textAnchor="middle" fontSize="9" className="mutedFill">Adapters</text>
            <text x="320" y="74" textAnchor="middle" fontSize="9" className="mutedFill">Frameworks</text>

            <rect x="260" y="16" width="120" height="34" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="320" y="37" textAnchor="middle" fontSize="11" className="accentFill">Main</text>

            <defs>
              <marker id="mainArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
            </defs>
            <line x1="320" y1="50" x2="320" y2="78" className="accentStroke" strokeWidth="1.5" markerEnd="url(#mainArrow)" />
            <line x1="280" y1="50" x2="230" y2="98" className="accentStroke" strokeWidth="1.5" markerEnd="url(#mainArrow)" />
            <line x1="360" y1="50" x2="410" y2="98" className="accentStroke" strokeWidth="1.5" markerEnd="url(#mainArrow)" />
            <line x1="250" y1="30" x2="150" y2="130" className="accentStroke" strokeWidth="1.5" markerEnd="url(#mainArrow)" />
            <line x1="390" y1="30" x2="490" y2="130" className="accentStroke" strokeWidth="1.5" markerEnd="url(#mainArrow)" />

            <text x="320" y="280" textAnchor="middle" fontSize="12" className="accentFill">Main sits outside every ring — nothing depends on it, so it may depend on anything</text>
          </svg>
          <p className="diagramCaption">Main reaches into every layer to construct concrete objects; no layer ever reaches back.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Two equivalent Main components for the same system — one a hand-written entry point, one Spring Boot's version of the same idea.</p>
        <pre><code>{`// Hand-written Main — no framework, wiring done by hand
package com.engineeringdecoded.orders;

import com.engineeringdecoded.orders.adapter.persistence.JpaOrderRepository;
import com.engineeringdecoded.orders.adapter.web.OrderController;
import com.engineeringdecoded.orders.usecase.PlaceOrderUseCase;
import com.engineeringdecoded.orders.usecase.port.OrderRepository;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.Persistence;

public final class Main {
    public static void main(String[] args) {
        EntityManagerFactory emf = Persistence.createEntityManagerFactory("orders");

        // Main is the one place allowed to know about every concrete class:
        OrderRepository orderRepository = new JpaOrderRepository(emf.createEntityManager());
        PlaceOrderUseCase placeOrderUseCase = new PlaceOrderUseCase(orderRepository);
        OrderController controller = new OrderController(placeOrderUseCase);

        HttpServer.start(8080, controller); // starts listening, framework detail
    }
}

// Spring Boot's version of the same job — bootstraps a container instead of
// wiring every object by hand, but the ROLE is identical: nothing but wiring
// and startup concerns live here.
package com.engineeringdecoded.orders;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OrdersApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrdersApplication.class, args);
    }
}`}</code></pre>
        <p>Notice what's absent from both: no business rule, no validation logic, nothing that would need a unit test of its own. Main only creates and connects.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Letting business logic creep into Main "just this once"</h3><p>Because Main is exempt from the Dependency Rule, some teams treat it as exempt from good design entirely and start putting real decision logic there. Main's exemption covers <em>what it may depend on</em>, not license to hold business rules.</p></div>
          <div><b>MISTAKE</b><h3>Assuming @SpringBootApplication means there's no Main component</h3><p>Spring Boot doesn't remove the concept — the annotated class and its bootstrap call still play exactly the Main role, just with less code because the framework automates the container startup.</p></div>
          <div><b>MISTAKE</b><h3>Unit-testing Main the same way you'd unit test a use case</h3><p>Main's value comes from being simple enough to verify by inspection or a thin smoke test — the same rigor you apply to <code>PlaceOrderUseCase</code> doesn't apply here because there's no business logic to cover.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A reviewer flags that <code>Main.java</code> imports <code>JpaOrderRepository</code>, an adapter-layer concrete class, and says this "violates the Dependency Rule." Are they right? Explain what makes Main's position in the architecture different from every other component.</p>
        </div>
      </section>
    </div>
  );
}
