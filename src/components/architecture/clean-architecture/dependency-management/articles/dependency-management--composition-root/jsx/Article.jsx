export default function DependencyManagementCompositionRootArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Every constructor call in the last four lessons needs to happen somewhere — the composition root is the deliberate decision to make that somewhere a single place, not a scattered habit.</p>
        <p>Constructor injection (two lessons back) means classes like <code>PlaceOrderUseCase</code> receive their dependencies instead of constructing them. Something still has to call <code>new</code> on the concrete implementations and pass them in. The composition root is the architectural pattern for where that happens: ideally one cohesive location, wiring the entire object graph, rather than <code>new JpaOrderRepository()</code> calls sprinkled wherever a class happened to need one.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Definition</h3>
        <p>A composition root is the single location in an application where the object graph is composed — where interfaces get matched to their concrete implementations and handed to the things that need them. It's not a design pattern in the Gang-of-Four sense so much as a discipline: concentrate the "here's what implements what" decisions instead of letting them leak throughout the codebase.</p>
        <h3>What it looks like without a framework</h3>
        <p>In a hand-wired system, the composition root is usually the body of <code>Main.main()</code> or a dedicated builder class it calls into: a sequence of <code>new</code> calls building the graph from the "leaves" (concrete adapters) up to the objects that depend on them, finishing with whatever kicks off the application (starting an HTTP server, running a batch job).</p>
        <h3>What it looks like with Spring</h3>
        <p>Spring's version of a composition root is a <code>@Configuration</code> class full of <code>@Bean</code> methods. Each method is a named, explicit wiring decision: <em>when something asks for an <code>OrderRepository</code>, give it a <code>JpaOrderRepository</code>.</em> This is functionally identical to a hand-written composition root — the difference is that Spring resolves the dependency graph automatically by matching parameter types to other <code>@Bean</code> return types, instead of you sequencing the <code>new</code> calls by hand in the right order.</p>
        <h3>The anti-pattern: wiring scattered everywhere</h3>
        <p>The opposite of a composition root isn't "no dependency injection" — it's dependency injection with the wiring decisions smeared across the codebase. A controller that does <code>new JpaOrderRepository()</code> inline. A batch job class that does the same thing with slightly different constructor arguments three files away. A test helper that builds its own separate wiring path. Each of these individually looks harmless; together they mean there is no single place you can look to answer "what implementation of <code>PaymentGateway</code> does production actually use?" — you have to grep the entire codebase and hope you found every instantiation site. Worse, when you need to swap <code>StripePaymentGateway</code> for a new provider, you're now hunting down every scattered <code>new</code> call instead of editing one <code>@Bean</code> method.</p>
        <h3>"Ideally one place" — and why that's a real caveat</h3>
        <p>Martin's own phrasing allows for composition to be split across a small number of well-factored roots in a large system (per-module configuration classes, for instance), as long as each one is still a deliberate, centralized wiring point rather than incidental scatter. The test isn't literally "exactly one file" — it's "can I find every wiring decision without hunting."</p>
        <h3>Why this belongs in the Dependency Management section</h3>
        <p>Every earlier lesson in this section explained why source dependencies must point inward and how constructor injection makes that possible without inner code reaching outward for its own collaborators. The composition root is where that possibility gets cashed in — it's the one place allowed to see both sides of every interface at once, so it's the only place that can correctly connect them.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 680 300" role="img" aria-label="Two panels: left shows a single composition root box fanning out with solid arrows to three concrete implementation boxes, with dashed arrows up to the interfaces they satisfy; right shows the anti-pattern of wiring calls scattered across three unrelated boxes">
            <text x="165" y="24" textAnchor="middle" fontSize="11" className="accentFill">Composition root</text>
            <rect x="85" y="34" width="160" height="34" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="165" y="55" textAnchor="middle" fontSize="10">OrdersConfig (@Configuration)</text>

            <rect x="20" y="120" width="90" height="40" rx="5" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="65" y="144" textAnchor="middle" fontSize="8">JpaOrderRepository</text>
            <rect x="125" y="120" width="90" height="40" rx="5" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="170" y="144" textAnchor="middle" fontSize="8">StripePaymentGateway</text>
            <rect x="230" y="120" width="90" height="40" rx="5" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="275" y="138" textAnchor="middle" fontSize="8">PlaceOrder</text>
            <text x="275" y="150" textAnchor="middle" fontSize="8">UseCase</text>

            <defs>
              <marker id="crArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
            </defs>
            <line x1="130" y1="68" x2="70" y2="118" className="accentStroke" strokeWidth="1.5" markerEnd="url(#crArrow)" />
            <line x1="165" y1="68" x2="170" y2="118" className="accentStroke" strokeWidth="1.5" markerEnd="url(#crArrow)" />
            <line x1="200" y1="68" x2="270" y2="118" className="accentStroke" strokeWidth="1.5" markerEnd="url(#crArrow)" />

            <line x1="80" y1="120" x2="140" y2="72" className="mutedStroke" strokeWidth="1" strokeDasharray="3 3" />
            <text x="70" y="185" textAnchor="middle" fontSize="7" className="mutedFill">implements OrderRepository</text>

            <line x1="470" y1="90" x2="470" y2="270" className="mutedStroke" strokeWidth="1" strokeDasharray="2 4" />
            <text x="575" y="24" textAnchor="middle" fontSize="11" className="mutedFill">Anti-pattern: scattered wiring</text>

            <rect x="500" y="50" width="110" height="36" rx="5" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="555" y="72" textAnchor="middle" fontSize="8" className="mutedFill">OrderController</text>
            <text x="555" y="100" textAnchor="middle" fontSize="7" className="mutedFill">new JpaOrderRepository()</text>

            <rect x="500" y="130" width="110" height="36" rx="5" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="555" y="152" textAnchor="middle" fontSize="8" className="mutedFill">BatchJob</text>
            <text x="555" y="180" textAnchor="middle" fontSize="7" className="mutedFill">new StripePaymentGateway()</text>

            <rect x="500" y="210" width="110" height="36" rx="5" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="555" y="232" textAnchor="middle" fontSize="8" className="mutedFill">TestHelper</text>
            <text x="555" y="260" textAnchor="middle" fontSize="7" className="mutedFill">new JpaOrderRepository(x)</text>
          </svg>
          <p className="diagramCaption">One configuration class wires everything versus new-calls scattered wherever an object happened to be needed.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A Spring composition root for the order system's core dependencies, wiring each port to its implementation in one readable place.</p>
        <pre><code>{`package com.engineeringdecoded.orders.config;

import com.engineeringdecoded.orders.adapter.payment.StripePaymentGateway;
import com.engineeringdecoded.orders.adapter.persistence.JpaOrderRepository;
import com.engineeringdecoded.orders.usecase.PlaceOrderUseCase;
import com.engineeringdecoded.orders.usecase.port.OrderRepository;
import com.engineeringdecoded.orders.usecase.port.PaymentGateway;
import jakarta.persistence.EntityManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OrdersConfig {

    // Every "interface -> concrete class" decision for this module lives here,
    // and only here. Want to swap Stripe for Adyen? Change this one method.

    @Bean
    OrderRepository orderRepository(EntityManager entityManager) {
        return new JpaOrderRepository(entityManager);
    }

    @Bean
    PaymentGateway paymentGateway(StripeProperties properties) {
        return new StripePaymentGateway(properties.apiKey());
    }

    @Bean
    PlaceOrderUseCase placeOrderUseCase(OrderRepository orderRepository,
                                         PaymentGateway paymentGateway) {
        return new PlaceOrderUseCase(orderRepository, paymentGateway);
    }
}

// Anti-pattern, found scattered across the codebase instead:
// class OrderController {
//     private final OrderRepository repo = new JpaOrderRepository(...); // NO
// }
// class NightlyReconciliationJob {
//     private final PaymentGateway gateway = new StripePaymentGateway(...); // NO
// }`}</code></pre>
        <p>Every method here answers exactly one question — which implementation satisfies which port — and the whole set is readable top to bottom in seconds.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Letting @ComponentScan hide the wiring instead of stating it</h3><p>Slapping <code>@Repository</code>/<code>@Service</code> on every concrete class and relying on classpath scanning to auto-wire everything can obscure which implementation actually gets chosen when more than one candidate exists, making the "single readable place" property disappear.</p></div>
          <div><b>MISTAKE</b><h3>Instantiating a concrete adapter inside a controller "just for this one endpoint"</h3><p>Each one-off instantiation is a small, individually defensible decision that collectively destroys the composition root's whole value: knowing every wiring decision by looking in one place.</p></div>
          <div><b>MISTAKE</b><h3>Duplicating wiring logic between production config and tests</h3><p>Hand-rolling a second, slightly different object graph inside test setup code (instead of reusing or deliberately overriding specific beans) creates two sources of truth for how the system is wired, which drift apart silently over time.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your codebase has three <code>@Configuration</code> classes, each defining a <code>@Bean</code> for a different <code>PaymentGateway</code> implementation, and which one wins depends on Spring profile ordering nobody fully remembers. Is this still "a composition root" in the sense this lesson describes? Explain using the "single readable place" criterion.</p>
        </div>
      </section>
    </div>
  );
}
