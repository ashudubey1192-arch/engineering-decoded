export default function DependencyManagementCompileTimeDependenciesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A compile-time dependency is nothing mysterious — it's the literal list of imports at the top of a file, and it's the single artifact you can inspect to prove the Dependency Rule is being obeyed.</p>
        <p>The Dependency Rule sounds abstract until you make it concrete: it's a claim about what appears in a Java file's <code>import</code> statements. This lesson shows how to read a class's compile-time dependency graph directly off its imports, and why that graph — not diagrams, not intentions — is the ground truth for whether your architecture is real.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>What "compile-time dependency" means</h3>
        <p>A compile-time dependency exists whenever class A needs class B's source (or compiled bytecode) to be present in order for A itself to compile. In Java, this shows up almost entirely through the <code>import</code> statement plus any fully-qualified references in the file. If <code>PlaceOrderUseCase.java</code> has no import of anything under <code>com.engineeringdecoded.orders.adapter</code>, then — full stop — the use case has zero compile-time dependency on any adapter, regardless of what happens when the program actually runs.</p>
        <h3>The module dependency graph</h3>
        <p>Scale this up from one file to a whole codebase and you get a directed graph: draw an arrow from every class to every class it imports. Clean Architecture's claim is that if you draw this graph for a well-formed system, arrows only ever point from an outer circle toward an inner one. <code>OrderController</code> (interface adapters) can import <code>PlaceOrderInputBoundary</code> (use cases). <code>PlaceOrderInputBoundary</code> can never import <code>OrderController</code> back. If you ever see an arrow pointing the wrong way, you've found either a Dependency Rule violation or a misplaced class.</p>
        <h3>Why this is checkable, not just aspirational</h3>
        <p>This is what makes the Dependency Rule enforceable rather than a matter of taste: the compile-time dependency graph is a fact about the code, extractable by tooling. You can read it by eye for one class (open the file, look at the imports), or you can have a build tool compute it for the whole codebase and fail the build if an inward-pointing package ever imports an outward-pointing one. (The <strong>Architecture Tests</strong> lesson later in this course shows exactly how, with ArchUnit.)</p>
        <h3>Reading PlaceOrderUseCase's import list</h3>
        <p>Take <code>com.engineeringdecoded.orders.usecase.PlaceOrderUseCase</code>. Its entire compile-time dependency list is: <code>java.util.*</code> as needed, <code>com.engineeringdecoded.orders.entity.Order</code>, <code>com.engineeringdecoded.orders.entity.OrderId</code>, and <code>com.engineeringdecoded.orders.usecase.port.OrderRepository</code> — an interface the use case layer itself owns. That's it. No <code>org.springframework.*</code>, no <code>jakarta.persistence.*</code>, no <code>com.engineeringdecoded.orders.adapter.*</code>. You could delete every line of Spring and Hibernate from the classpath and this file would still compile, because it never asked for them.</p>
        <h3>What this buys you</h3>
        <p>A class with a short, inward-only import list is a class you can compile, read, and — critically for the next section of this course — <em>test</em> in isolation, without spinning up a framework. The shorter and more inward-pointing a class's import list, the more stable and reusable that class is, because it has fewer reasons to change when something outside it changes. This is compile-time dependency management as a design discipline, not just a rule to satisfy.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="A file box for PlaceOrderUseCase.java listing its four imports, with arrows to Order, OrderId, and OrderRepository inside the circle, and a crossed-out arrow toward Spring and JPA outside it">
            <rect x="230" y="30" width="200" height="120" rx="6" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="330" y="50" textAnchor="middle" fontSize="11" className="accentFill">PlaceOrderUseCase.java</text>
            <text x="245" y="70" fontSize="9">import entity.Order;</text>
            <text x="245" y="86" fontSize="9">import entity.OrderId;</text>
            <text x="245" y="102" fontSize="9">import usecase.port.</text>
            <text x="245" y="114" fontSize="9">&#160;&#160;&#160;OrderRepository;</text>

            <rect x="40" y="190" width="150" height="46" rx="6" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="115" y="217" textAnchor="middle" fontSize="10">entity.Order / OrderId</text>

            <rect x="255" y="190" width="150" height="46" rx="6" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="330" y="217" textAnchor="middle" fontSize="10">usecase.port.OrderRepository</text>

            <rect x="470" y="190" width="150" height="46" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="545" y="211" textAnchor="middle" fontSize="9" className="mutedFill">Spring / JPA /</text>
            <text x="545" y="224" textAnchor="middle" fontSize="9" className="mutedFill">JpaOrderRepository</text>

            <defs>
              <marker id="ctdArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
            </defs>
            <line x1="255" y1="150" x2="150" y2="190" className="accentStroke" strokeWidth="1.5" markerEnd="url(#ctdArrow)" />
            <line x1="330" y1="150" x2="330" y2="190" className="accentStroke" strokeWidth="1.5" markerEnd="url(#ctdArrow)" />

            <line x1="405" y1="150" x2="520" y2="190" className="mutedStroke" strokeWidth="1.5" strokeDasharray="3 3" />
            <line x1="510" y1="182" x2="530" y2="198" className="mutedStroke" strokeWidth="2" />
            <line x1="530" y1="182" x2="510" y2="198" className="mutedStroke" strokeWidth="2" />

            <text x="330" y="10" textAnchor="middle" fontSize="12" className="accentFill">Reading the import list is reading the compile-time graph</text>
          </svg>
          <p className="diagramCaption">PlaceOrderUseCase's imports point only to Order, OrderId, and its own OrderRepository port — never to Spring or JPA.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>You can verify the Dependency Rule for a class in under a minute by doing exactly this: open the file and read every import.</p>
        <pre><code>{`// The ENTIRE import block of PlaceOrderUseCase.java — nothing hidden below the fold
package com.engineeringdecoded.orders.usecase;

import com.engineeringdecoded.orders.entity.Order;
import com.engineeringdecoded.orders.entity.OrderId;
import com.engineeringdecoded.orders.usecase.port.OrderRepository;
import java.util.Objects;

public final class PlaceOrderUseCase implements PlaceOrderInputBoundary {

    private final OrderRepository orderRepository;

    public PlaceOrderUseCase(OrderRepository orderRepository) {
        this.orderRepository = Objects.requireNonNull(orderRepository);
    }

    @Override
    public PlaceOrderResponse execute(PlaceOrderRequest request) {
        Order order = Order.place(request.customerId(), request.lines());
        orderRepository.save(order);
        return new PlaceOrderResponse(order.id());
    }
}

// Compare: adapter/persistence/JpaOrderRepository.java's imports (outer circle,
// so it's ALLOWED to reach inward toward entity/usecase — and it does):
//
// import com.engineeringdecoded.orders.entity.Order;
// import com.engineeringdecoded.orders.usecase.port.OrderRepository;
// import jakarta.persistence.EntityManager;
// import org.springframework.stereotype.Repository;`}</code></pre>
        <p>Four imports, all pointing inward or staying within the use case layer. If a code reviewer ever sees <code>adapter</code> or <code>org.springframework</code> appear in this block, that's the review comment — no architecture diagram required to make the case.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Trusting the package name instead of the imports</h3><p>A class sitting in the <code>usecase</code> package that quietly imports a JPA annotation is still a violation. The package is a filing convention; the imports are the actual dependency.</p></div>
          <div><b>MISTAKE</b><h3>Assuming transitive dependencies don't count</h3><p>If <code>PlaceOrderUseCase</code> imports a "helper" class that itself imports Spring, the use case now transitively depends on Spring at compile time too. The graph has to be checked all the way down, not just one hop.</p></div>
          <div><b>MISTAKE</b><h3>Only checking this during code review, never automatically</h3><p>Manual inspection catches violations when reviewers happen to look closely and misses them the rest of the time. Compile-time dependencies are exactly the kind of fact a build-time tool can check on every commit — see Architecture Tests later in this course.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Suppose <code>PlaceOrderUseCase</code> imports a class called <code>OrderValidationHelper</code> that lives in <code>com.engineeringdecoded.orders.usecase</code>, but that helper itself imports <code>jakarta.validation.constraints.NotNull</code> from the Bean Validation framework. Does this break the Dependency Rule? Walk through why, using the idea of a transitive compile-time dependency.</p>
        </div>
      </section>
    </div>
  );
}
