export default function WelcomeHowToUseThisCourseArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">This course rewards reading the code as carefully as the prose &mdash; every lesson extends the same codebase, so skipping a snippet means missing a piece you will need later.</p>
        <p>Clean Architecture is a design discipline, not a list of trivia, so the way you work through this course matters. This lesson explains how the lessons are structured, how the running example accumulates across the course, and how to get the most out of each section instead of skimming past the parts that feel obvious.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Every lesson has the same five parts</h3>
        <p>Each lesson in this course follows the same shape on purpose, so you always know what you are getting: an overview that frames the idea, a concepts section with the real technical explanation and a diagram, a practical Java example, a set of common mistakes, and a knowledge-check question. Use that structure &mdash; if you are short on time, at least read the concepts section and try the knowledge check honestly before moving on; the mistakes section alone often prevents weeks of rework later.</p>

        <h3>One codebase, not sixty-six snippets</h3>
        <p>Every code example in this course lives in the same fictional package, <code>com.engineeringdecoded.orders</code>. A lesson on entities shows you <code>Order</code>. A later lesson on use cases has <code>PlaceOrderUseCase</code> call methods on that same <code>Order</code>. A lesson on adapters has <code>JpaOrderRepository</code> implement an interface a use-case lesson already defined. This is deliberate: architecture problems only really show up at the seams between pieces, and you cannot see a seam in an isolated ten-line snippet. Keep a rough mental (or literal) picture of the package tree from the roadmap lesson as you go &mdash; each new lesson slots a piece into it.</p>

        <h3>Read foundations before you touch code</h3>
        <p>It is tempting to skip straight to "how do I write a use case," but the <strong>Foundations</strong> section that follows this one is not optional scaffolding &mdash; it is where you learn <em>why</em> the rest of the course draws boundaries the way it does. Policy versus detail, the cost of coupling, and what architecture is actually for are the ideas that make every later rule feel inevitable instead of arbitrary.</p>

        <h3>Use the knowledge checks as a real test</h3>
        <p>The "Knowledge check" question at the end of each lesson is written to be specific to that lesson's content, not a generic recall question. If you cannot answer it in a sentence or two without re-reading, that is useful signal &mdash; it means the concept has not landed yet, and it is worth rereading the concepts section before moving forward, since later lessons assume it.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 200" role="img" aria-label="A horizontal pipeline of the five sections every lesson follows: overview, concepts, example, mistakes, check">
            <rect x="10" y="70" width="110" height="60" rx="6" className="accentStroke" fill="none" />
            <text x="65" y="105" fontSize="11" textAnchor="middle">Overview</text>

            <rect x="150" y="70" width="110" height="60" rx="6" className="accentStroke" fill="none" />
            <text x="205" y="105" fontSize="11" textAnchor="middle">Concepts</text>

            <rect x="290" y="70" width="110" height="60" rx="6" className="accentStroke" fill="none" />
            <text x="345" y="105" fontSize="11" textAnchor="middle">Example</text>

            <rect x="430" y="70" width="110" height="60" rx="6" className="mutedStroke" fill="none" />
            <text x="485" y="105" fontSize="11" textAnchor="middle">Mistakes</text>

            <rect x="570" y="70" width="60" height="60" rx="6" className="mutedStroke" fill="none" />
            <text x="600" y="105" fontSize="11" textAnchor="middle">Check</text>

            <line x1="120" y1="100" x2="150" y2="100" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#htuArrow)" />
            <line x1="260" y1="100" x2="290" y2="100" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#htuArrow)" />
            <line x1="400" y1="100" x2="430" y2="100" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#htuArrow)" />
            <line x1="540" y1="100" x2="570" y2="100" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#htuArrow)" />

            <defs>
              <marker id="htuArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">The same five-step shape repeats in every lesson &mdash; work through all five, in order, every time.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>To make "one running codebase" concrete, here is a tiny illustration of how two lessons apart in the course end up connected in a single listing. A later entity lesson defines this invariant on <code>Order</code>; a use-case lesson several sections later reuses that exact method without redefining it:</p>
        <pre><code>{`public final class Order {
    private OrderStatus status;
    private final List<OrderLine> lines = new ArrayList<>();

    public void addLine(OrderLine line) {
        if (status != OrderStatus.DRAFT) {
            throw new IllegalStateException("cannot add lines after placement");
        }
        lines.add(line);
    }
}

public final class PlaceOrderUseCase implements PlaceOrderInputBoundary {
    private final OrderRepository orders;

    public PlaceOrderUseCase(OrderRepository orders) {
        this.orders = orders;
    }

    public PlaceOrderResponse execute(PlaceOrderRequest request) {
        Order order = new Order(request.customerId());
        request.lines().forEach(order::addLine);   // relies on Order's own rule
        order.place();
        orders.save(order);
        return new PlaceOrderResponse(order.id());
    }
}`}</code></pre>
        <p>If you skipped the entity lesson, <code>{'order::addLine'}</code> here would look like an arbitrary method call instead of a rule you already know the reasoning behind.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Skimming for syntax, skipping the reasoning</h3><p>Engineers who only copy the Java snippets and skip the concepts prose end up able to reproduce the pattern but unable to explain when it should change &mdash; the first time their real system differs from the example, they are stuck.</p></div>
          <div><b>MISTAKE</b><h3>Jumping straight to a favorite topic</h3><p>Skipping ahead to "Dependency Injection" or "Testing" without foundations and the four layers means the later lessons keep referencing terms (policy, boundary, the Dependency Rule) that were never actually explained.</p></div>
          <div><b>MISTAKE</b><h3>Treating the mistakes section as filler</h3><p>The common-mistakes cards are drawn from real code review patterns, not padding. Reading them passively instead of checking your own recent code against them wastes the most actionable part of the lesson.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Pick one class name from the roadmap lesson's package tree (for example <code>{'JpaOrderRepository'}</code>) and predict, before you get there, which later section of this course you expect to introduce it and why its placement in the package tree gives that away.</p>
        </div>
      </section>
    </div>
  );
}
