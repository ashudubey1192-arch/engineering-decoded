export default function WelcomeCourseIntroductionArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">This course teaches you how to structure software so that business rules survive frameworks, databases, and UIs coming and going around them.</p>
        <p>Clean Architecture, as laid out by Robert C. Martin, is not a framework, a folder-naming convention, or a checklist you run once. It is a way of drawing boundaries in a system so that the things that matter most to the business are the things that depend on nothing else. Over this course you will build up that skill one lesson at a time, using a single running example &mdash; an order-management system &mdash; so the ideas accumulate into one coherent codebase instead of scattering across unrelated toy snippets.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>Before you write a line of code, it helps to know what this course is actually optimizing for. Clean Architecture exists to answer one question: <strong>how do we build systems that are cheap to change six months and six years from now, not just cheap to ship today?</strong> Every idea in this course &mdash; entities, use cases, boundaries, the Dependency Rule &mdash; is a tool for answering that question.</p>

        <h3>What you already know</h3>
        <p>This course assumes you can write Java, you understand basic object-oriented programming, and you have shipped something with a framework like Spring. What it does not assume is that you have thought carefully about <em>where</em> code should live and <em>why</em>. That is the gap this course fills.</p>

        <h3>What "clean" means here</h3>
        <p>"Clean" does not mean fewer lines of code or prettier syntax. It means a specific property: your business rules &mdash; the logic that makes your system worth building &mdash; can be described, read, and tested without knowing anything about the web framework, the database, or the UI toolkit you happen to be using this year. Frameworks and databases are details. Details are supposed to be easy to swap. In most codebases they are not, and this course explains exactly why, and what to do about it.</p>

        <h3>The shape of the course</h3>
        <ul>
          <li><strong>Foundations</strong> &mdash; what architecture actually is, and Martin's core ideas about policy, detail, and the cost of coupling.</li>
          <li><strong>The four layers</strong> &mdash; Entities, Use Cases, Interface Adapters, and Frameworks &amp; Drivers, and the Dependency Rule that holds them together.</li>
          <li><strong>SOLID and boundaries</strong> &mdash; the design principles that make the layered structure enforceable in real code, not just on a whiteboard.</li>
          <li><strong>Applied patterns</strong> &mdash; composition roots, the humble object pattern, testing strategy, and how this scales to real applications.</li>
        </ul>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 220" role="img" aria-label="A package tree showing the four layers of the running order-management example, rooted at com.engineeringdecoded.orders">
            <rect x="20" y="20" width="220" height="180" rx="6" className="mutedStroke" fill="none" />
            <text x="30" y="42" fontSize="13">com.engineeringdecoded.orders</text>
            <text x="45" y="66" fontSize="12">entity</text>
            <text x="45" y="90" fontSize="12">usecase</text>
            <text x="45" y="114" fontSize="12">usecase.port</text>
            <text x="45" y="138" fontSize="12">adapter.web</text>
            <text x="45" y="162" fontSize="12">adapter.persistence</text>
            <text x="45" y="186" fontSize="12">Main</text>

            <line x1="260" y1="66" x2="360" y2="40" className="mutedStroke" strokeWidth="1.5" />
            <line x1="260" y1="90" x2="360" y2="90" className="accentStroke" strokeWidth="1.5" />
            <line x1="260" y1="138" x2="360" y2="140" className="mutedStroke" strokeWidth="1.5" />
            <line x1="260" y1="186" x2="360" y2="190" className="mutedStroke" strokeWidth="1.5" />

            <text x="370" y="44" fontSize="12">Entities: pure business rules</text>
            <text x="370" y="94" fontSize="12" className="accentFill">Use cases: application logic</text>
            <text x="370" y="144" fontSize="12">Adapters: web + persistence</text>
            <text x="370" y="194" fontSize="12">Main: wires it all together</text>
          </svg>
          <p className="diagramCaption">The package shape you will build toward: business rules at the center, frameworks pushed to the edges.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>Here is the finished shape of the package structure you will assemble piece by piece across this course. Nothing here is code you need to understand yet &mdash; just notice how the folders separate business rules from delivery mechanisms.</p>
        <pre><code>{`com.engineeringdecoded.orders
├── entity
│   ├── Order.java              // business rules, zero framework imports
│   ├── OrderLine.java
│   ├── Money.java
│   └── OrderStatus.java
├── usecase
│   ├── PlaceOrderUseCase.java  // application-specific logic
│   ├── PlaceOrderInputBoundary.java
│   ├── PlaceOrderOutputBoundary.java
│   └── port
│       └── OrderRepository.java   // interface, owned here
├── adapter
│   ├── web
│   │   ├── OrderController.java   // Spring MVC, a detail
│   │   └── OrderPresenter.java
│   └── persistence
│       ├── JpaOrderRepository.java // implements OrderRepository
│       └── OrderEntityMapper.java
└── Main.java                     // composition root: wires interfaces to impls`}</code></pre>
        <p>Notice that <code>entity</code> and <code>usecase</code> never mention Spring or JPA anywhere &mdash; those only show up under <code>adapter</code>. That single rule is most of what this course is about.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Treating this as a framework tutorial</h3><p>Clean Architecture is not "how to use Spring correctly." Engineers who approach it that way end up with well-organized framework code and business logic still tangled through it.</p></div>
          <div><b>MISTAKE</b><h3>Skipping straight to the four rings</h3><p>Jumping to Entities/Use Cases/Adapters/Frameworks without understanding the Dependency Rule and why coupling costs money makes the layers feel like arbitrary bureaucracy instead of a solution to a real problem.</p></div>
          <div><b>MISTAKE</b><h3>Assuming it only applies to "big" systems</h3><p>Engineers dismiss these ideas as enterprise overkill for small apps, then watch a supposedly small app grow for three years with no seams left to cut it apart.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Look at a recent class you wrote that talks to a database or a web framework directly inside its business logic. If you had to swap that database or framework next month, how many files would you need to touch, and why does this course exist to shrink that number?</p>
        </div>
      </section>
    </div>
  );
}
