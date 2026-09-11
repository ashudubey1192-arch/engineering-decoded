import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsEventDrivenArchitectureArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Event-driven architecture is a way of designing a whole system around the idea that
          services announce <b>facts about what already happened</b> &mdash; events &mdash; and other
          services react, instead of one service directly telling another what to do.
        </p>
        <p>
          It is pub/sub taken from &quot;a messaging technique&quot; to &quot;how the entire system
          is organised&quot;: services are loosely connected through a shared stream of events rather
          than a web of direct calls.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            In a request-driven design, the order service would directly call inventory, then email,
            then loyalty, then analytics &mdash; growing a longer chain of direct calls every time a
            new feature is added, and breaking if any one of them is down. In an event-driven design,
            the order service just publishes <b>&quot;order placed&quot;</b> and stops caring. Every
            interested service reacts on its own schedule. Adding &quot;send an SMS too&quot; later
            touches zero existing code.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Commands vs events</h2>
        <table className="miniTable">
          <caption>TWO DIFFERENT KINDS OF MESSAGE</caption>
          <thead>
            <tr>
              <th></th>
              <th>Command</th>
              <th>Event</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Says</td>
              <td>&quot;Do this&quot; &mdash; an instruction</td>
              <td>&quot;This happened&quot; &mdash; a fact</td>
            </tr>
            <tr>
              <td>Tense</td>
              <td>Imperative: <code>ChargeCard</code></td>
              <td>Past: <code>CardCharged</code></td>
            </tr>
            <tr>
              <td>Addressed to</td>
              <td>One specific service</td>
              <td>Nobody in particular &mdash; anyone can react</td>
            </tr>
            <tr>
              <td>Sender expects</td>
              <td>The command to be carried out</td>
              <td>Nothing &mdash; it already happened</td>
            </tr>
          </tbody>
        </table>

        <h2>2. How services connect</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 160" role="img" aria-labelledby="edaTitle">
            <title id="edaTitle">
              Instead of services calling each other directly, they all publish and subscribe to
              events through a shared event bus.
            </title>
            <rect className="boxAccent" x="240" y="60" width="160" height="40" />
            <text className="boxText" x="320" y="84">
              event bus
            </text>
            <rect className="box" x="30" y="20" width="120" height="30" />
            <text className="boxText" x="90" y="39">
              order service
            </text>
            <line className="flow" x1="150" y1="35" x2="240" y2="70" />
            <text className="figHint" x="190" y="55">
              publishes
            </text>
            <rect className="box" x="490" y="10" width="120" height="28" />
            <text className="boxText" x="550" y="28">
              inventory
            </text>
            <rect className="box" x="490" y="66" width="120" height="28" />
            <text className="boxText" x="550" y="84">
              email
            </text>
            <rect className="box" x="490" y="122" width="120" height="28" />
            <text className="boxText" x="550" y="140">
              loyalty
            </text>
            <line className="flow" x1="400" y1="70" x2="490" y2="25" />
            <line className="flow" x1="400" y1="80" x2="490" y2="80" />
            <line className="flow" x1="400" y1="90" x2="490" y2="135" />
            <text className="figHint" x="440" y="145">
              subscribes
            </text>
          </svg>
          <figcaption>
            No service calls another by name. Everything routes through events on a shared bus
            (Kafka, EventBridge, or a pub/sub broker).
          </figcaption>
        </figure>

        <h2>3. What you gain and what you give up</h2>
        <ul>
          <li>
            <b>Gain:</b> services stay independent &mdash; new reactions can be added without
            touching the publisher, and one slow subscriber cannot block the rest.
          </li>
          <li>
            <b>Gain:</b> a natural audit trail &mdash; the event log <i>is</i> a history of
            everything that happened.
          </li>
          <li>
            <b>Give up:</b> it is harder to trace &quot;what happens when an order is placed&quot;
            &mdash; the logic is spread across many subscribers instead of one call stack.
          </li>
          <li>
            <b>Give up:</b> consistency becomes eventual &mdash; inventory might reserve stock a few
            hundred milliseconds after the order event, not in the same transaction.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: an event-driven order flow</h2>
        <ol className="stepList">
          <li>
            <b>Order service</b> saves the order and publishes{" "}
            <code>OrderPlaced {`{orderId: 501}`}</code> to the event bus.
          </li>
          <li>
            <b>Inventory service</b> (subscribed to <code>OrderPlaced</code>) reserves stock and, if
            successful, publishes its own event: <code>StockReserved {`{orderId: 501}`}</code>.
          </li>
          <li>
            <b>Shipping service</b> (subscribed to <code>StockReserved</code>, not{" "}
            <code>OrderPlaced</code>) only starts once stock is actually confirmed &mdash; events can
            chain.
          </li>
          <li>
            <b>Email and analytics</b> both independently subscribed to <code>OrderPlaced</code> react
            in parallel, on their own time.
          </li>
          <li>
            <b>If inventory fails</b> (out of stock), it publishes{" "}
            <code>StockReservationFailed</code>, and a saga-style handler reacts by cancelling the
            order &mdash; no single service orchestrated the whole flow up front.
          </li>
        </ol>
        <div className="takeaway">
          Event-driven systems are built from small, independent reactions to facts, chained
          together &mdash; not from one big function that calls everything in order.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Hidden implicit workflows</h3>
            <p>
              With logic spread across ten subscribers, nobody can see the full order flow in one
              place. Document and trace event chains deliberately.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Treating events as commands</h3>
            <p>
              Publishing <code>OrderPlaced</code> but expecting a specific service to definitely
              react a specific way turns an event into a disguised, unreliable command.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No correlation IDs</h3>
            <p>
              Without a shared ID carried through every event in a chain, debugging &quot;what
              happened to order 501&quot; across five services becomes guesswork.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            Rewrite &quot;call the email service to send a receipt&quot; as an event-driven design.
            What event gets published, what does it get named, and which service decides to send
            the email?
          </p>
        </div>
      </section>
    </div>
  );
}
