export default function FrameworksAndDriversUiAsADetailArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A web page is one way to place an order. A CLI, a batch job, or a mobile app are three more — and your use case shouldn't be able to tell the difference.</p>
        <p>Where the web framework boundary lesson looked at HTTP specifically, this lesson zooms out to the general principle: the user interface, whatever form it takes, is a delivery mechanism — a driver, in Robert Martin's terms — and it sits in the outermost ring alongside the web framework and the database. If <code>PlaceOrderUseCase</code> can only be invoked from a browser, something has gone wrong.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>"UI" means more than "web page"</h3>
        <p>Martin's own examples in <em>Clean Architecture</em> emphasize that a well-isolated system can swap its UI from a web GUI to a console interface without touching the business rules, because the use cases were never written in terms of buttons, pages, or HTTP requests in the first place. The same order-placement logic that today runs behind <code>OrderController</code> should be reachable, unchanged, from an <code>OrderCli</code> command, a scheduled batch job that replays a CSV of pending orders, or a gRPC endpoint — because all of those are just different input boundaries calling the identical <code>PlaceOrderInputBoundary.execute(PlaceOrderRequest)</code>.</p>
        <h3>The test: could you add a second driver without touching the use case?</h3>
        <p>This is the practical litmus test for whether your UI is actually a detail. Imagine your product team asks for a "place order" admin script that ops can run from a terminal during an incident, bypassing the web app entirely. If satisfying that request means writing a new thin adapter — <code>OrderCliCommand</code>, parsing arguments into a <code>PlaceOrderRequest</code>, calling the same interactor, printing the response — and nothing in <code>usecase</code> changes, your architecture passed. If it means duplicating validation logic because the rules were embedded in the controller, it failed, and you're paying the cost of that failure right now, not hypothetically.</p>
        <h3>Presenters keep this symmetric on the way out too</h3>
        <p>The same idea applies to output. <code>OrderPresenter</code> formats a <code>PlaceOrderResponse</code> into an <code>OrderViewModel</code> shaped for a web page; a CLI adapter would format the identical response into plain text for a terminal. The use case produces one neutral response object; each driver's presenter decides how to display it. Neither the interactor nor the response DTO has any idea whether the eventual output is HTML, JSON, or a line printed to stdout.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 260" role="img" aria-label="Three different drivers, web controller, CLI command, and batch job, all calling the same PlaceOrderInputBoundary interface into one use case interactor">
            <rect x="20" y="20" width="150" height="45" rx="5" className="mutedStroke" fill="none" />
            <text x="95" y="47" textAnchor="middle" fontSize="11">OrderController (web)</text>

            <rect x="20" y="95" width="150" height="45" rx="5" className="mutedStroke" fill="none" />
            <text x="95" y="122" textAnchor="middle" fontSize="11">OrderCliCommand</text>

            <rect x="20" y="170" width="150" height="45" rx="5" className="mutedStroke" fill="none" />
            <text x="95" y="197" textAnchor="middle" fontSize="11">OrderBatchJob</text>

            <line x1="170" y1="42" x2="300" y2="115" className="mutedStroke" markerEnd="url(#arrowU)" />
            <line x1="170" y1="117" x2="300" y2="117" className="mutedStroke" markerEnd="url(#arrowU)" />
            <line x1="170" y1="192" x2="300" y2="119" className="mutedStroke" markerEnd="url(#arrowU)" />

            <rect x="300" y="95" width="150" height="50" rx="5" className="accentStroke" fill="none" />
            <text x="375" y="115" textAnchor="middle" fontSize="10">PlaceOrder</text>
            <text x="375" y="132" textAnchor="middle" fontSize="10">InputBoundary</text>

            <line x1="450" y1="120" x2="520" y2="120" className="accentStroke" markerEnd="url(#arrowU2)" />

            <rect x="520" y="90" width="120" height="60" rx="5" className="accentStroke" fill="none" />
            <text x="580" y="115" textAnchor="middle" fontSize="10">PlaceOrder</text>
            <text x="580" y="132" textAnchor="middle" fontSize="10">UseCase</text>

            <defs>
              <marker id="arrowU" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="mutedFill" />
              </marker>
              <marker id="arrowU2" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 z" className="accentFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">Different drivers, same input boundary — the use case interactor has no idea which one is calling.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A CLI adapter reuses the exact same use case as the web controller shown earlier, with no changes to <code>PlaceOrderUseCase</code>.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.cli;

public class OrderCliCommand {

    private final PlaceOrderInputBoundary placeOrder;

    public OrderCliCommand(PlaceOrderInputBoundary placeOrder) {
        this.placeOrder = placeOrder;
    }

    public void run(String[] args) {
        // parse args into the same plain request DTO the controller builds
        CustomerId customerId = new CustomerId(args[0]);
        List<OrderLineRequest> lines = OrderLineArgsParser.parse(args);

        PlaceOrderRequest request = new PlaceOrderRequest(customerId, lines);
        PlaceOrderResponse response = placeOrder.execute(request);

        System.out.printf("Order %s placed with status %s%n",
            response.orderId().value(), response.status());
    }
}

// Composition root wires whichever driver into the same interactor
public class Main {
    public static void main(String[] args) {
        OrderRepository repository = new InMemoryOrderRepository();
        PaymentGateway paymentGateway = new StripePaymentGateway(StripeClient.create());
        PlaceOrderInputBoundary placeOrder = new PlaceOrderUseCase(repository, paymentGateway);

        new OrderCliCommand(placeOrder).run(args);
    }
}`}</code></pre>
        <p>Nothing in <code>PlaceOrderUseCase</code> changed to support this — the CLI is simply a second, independent caller of the same input boundary.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Business rules living in the frontend or controller layer</h3><p>Validating an order's line items only in a React form or only in <code>OrderController</code> means any new driver has to reimplement that validation from scratch.</p></div>
          <div><b>MISTAKE</b><h3>Designing the use case around one UI's data shape</h3><p>Building <code>PlaceOrderRequest</code> to mirror a specific web form's fields instead of the use case's actual inputs makes every other driver awkward to adapt.</p></div>
          <div><b>MISTAKE</b><h3>Assuming "we'll only ever have a web UI"</h3><p>Skipping the input-boundary abstraction because a second driver seems unlikely locks in a costly rewrite the first time ops needs a script, or a mobile app ships.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Ops wants a nightly batch job that replays failed orders from a queue. If this takes more than writing one new thin adapter class, what does that tell you about where your business logic actually lives today?</p>
        </div>
      </section>
    </div>
  );
}
