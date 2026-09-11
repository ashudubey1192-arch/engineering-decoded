import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsMessageQueuesArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A message queue sits between a producer and a consumer, holding messages until the
          consumer is ready for them. The producer does not call the consumer directly &mdash; it
          drops a message in the queue and moves on.
        </p>
        <p>
          This decouples the two sides completely: the producer does not need to know who consumes
          the message, how many consumers there are, or whether they are even online right now.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            An e-commerce site gets a flash-sale spike: 5,000 orders in one minute. If &quot;place
            order&quot; directly called the inventory, invoice, and shipping services synchronously,
            the whole checkout would crawl or fail whenever any one of them got overwhelmed. Instead,
            &quot;place order&quot; just drops a message on a queue and returns instantly. Workers
            drain the queue at whatever pace they can sustain &mdash; the spike is absorbed, not felt.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The moving parts</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 140" role="img" aria-labelledby="mqTitle">
            <title id="mqTitle">
              A producer pushes messages onto a queue; one or more consumers pull messages off it at
              their own pace.
            </title>
            <rect className="box" x="20" y="50" width="110" height="40" />
            <text className="boxText" x="75" y="74">
              producer
            </text>
            <line className="flow" x1="130" y1="70" x2="220" y2="70" />
            <rect className="boxAccent" x="220" y="35" width="200" height="70" />
            <text className="boxText" x="320" y="60">
              queue
            </text>
            <text className="boxText" x="320" y="78">
              [m1][m2][m3][m4]
            </text>
            <line className="flow" x1="420" y1="55" x2="500" y2="45" />
            <line className="flow" x1="420" y1="85" x2="500" y2="95" />
            <rect className="box" x="500" y="25" width="120" height="34" />
            <text className="boxText" x="560" y="47">
              consumer A
            </text>
            <rect className="box" x="500" y="80" width="120" height="34" />
            <text className="boxText" x="560" y="102">
              consumer B
            </text>
          </svg>
          <figcaption>
            The producer is free the instant the message is queued. Consumers pull at their own
            speed, and you can add more of them to drain the queue faster.
          </figcaption>
        </figure>

        <h2>2. Why decoupling matters</h2>
        <ul>
          <li>
            <b>Absorbs spikes:</b> the queue buffers a burst instead of the consumer falling over.
          </li>
          <li>
            <b>Independent scaling:</b> add more consumers when the queue backs up, remove them when
            it is quiet.
          </li>
          <li>
            <b>Survives outages:</b> if the consumer is down, messages simply wait instead of being
            lost.
          </li>
          <li>
            <b>Retries built in:</b> a failed message can go back on the queue and be tried again.
          </li>
        </ul>

        <h2>3. Delivery guarantees</h2>
        <table className="miniTable">
          <caption>WHAT &quot;DELIVERED&quot; CAN MEAN</caption>
          <thead>
            <tr>
              <th>Guarantee</th>
              <th>Meaning</th>
              <th>Consumer must</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>At-most-once</td>
              <td>Delivered 0 or 1 times &mdash; can be lost</td>
              <td>Tolerate occasional loss</td>
            </tr>
            <tr>
              <td>At-least-once</td>
              <td>Delivered 1 or more times &mdash; never lost, can duplicate</td>
              <td>Be idempotent</td>
            </tr>
            <tr>
              <td>Exactly-once</td>
              <td>Delivered exactly once (hard, often emulated)</td>
              <td>Rely on dedupe + transactions under the hood</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="example">
        <h2>4. Step by step: processing an order asynchronously</h2>
        <ol className="stepList">
          <li>
            <b>Checkout service</b> validates the order and pushes{" "}
            <code>{`{type: "order.placed", orderId: 501}`}</code> onto the <code>orders</code>{" "}
            queue, then returns <code>201</code> to the user &mdash; instantly.
          </li>
          <li>
            <b>An inventory worker</b> pulls the message, reserves stock, and acknowledges it (the
            queue then removes it).
          </li>
          <li>
            <b>If the worker crashes</b> before acknowledging, the message becomes visible again
            after a timeout and another worker picks it up &mdash; that is at-least-once delivery.
          </li>
          <li>
            <b>Because a retry can redeliver the same message,</b> the worker checks &quot;have I
            already reserved stock for order 501?&quot; before acting &mdash; making the handler
            idempotent.
          </li>
          <li>
            <b>Repeated failures</b> (say, 5 retries) move the message to a dead-letter queue instead
            of retrying forever, so a poison message does not block the rest.
          </li>
        </ol>
        <div className="takeaway">
          A queue turns &quot;call this service now&quot; into &quot;this work will happen, at some
          point, even if the consumer is briefly down.&quot; That durability is the whole point.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Assuming exactly-once by default</h3>
            <p>
              Most queues are at-least-once. If your handler is not idempotent, a redelivered message
              causes a duplicate charge or duplicate email.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>No dead-letter queue</h3>
            <p>
              A message that always fails will retry forever and can block everything behind it in an
              ordered queue.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Using a queue for things that need an instant answer</h3>
            <p>
              &quot;Is this password correct?&quot; cannot go through a queue &mdash; the user is
              waiting synchronously for a yes/no right now.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            An order-processing worker crashes right after charging a card but before acknowledging
            the message, so it gets redelivered. What must the worker check before charging again,
            and what pattern from Core Concepts does that rely on?
          </p>
        </div>
      </section>
    </div>
  );
}
