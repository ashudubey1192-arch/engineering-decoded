import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CommunicationPatternsPublishSubscribeArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Publish-Subscribe (pub/sub) is a message queue&apos;s sibling with one key difference: a
          published message can go to <b>every</b> subscriber interested in it, not just one worker
          that happens to pick it up.
        </p>
        <p>
          The publisher does not address anyone directly &mdash; it publishes to a <b>topic</b>.
          Anyone subscribed to that topic gets a copy. Publisher and subscribers never know about
          each other.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A user places an order. That single event &mdash; <code>order.placed</code> &mdash;
            needs to trigger inventory reservation, an email receipt, an analytics update, and a
            fraud check, all independently. With a queue, one worker would grab the message and the
            other three would never see it. With pub/sub, all four services subscribe to{" "}
            <code>order.placed</code> and each gets its own copy.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Queue vs pub/sub</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 160" role="img" aria-labelledby="pubsubTitle">
            <title id="pubsubTitle">
              A queue message goes to exactly one consumer; a pub/sub message on a topic goes to
              every subscriber of that topic.
            </title>
            <text className="figLabel" x="120" y="18">
              QUEUE (one wins)
            </text>
            <rect className="box" x="20" y="35" width="90" height="30" />
            <text className="boxText" x="65" y="54">
              message
            </text>
            <line className="flow" x1="110" y1="50" x2="180" y2="50" />
            <rect className="boxAccent" x="180" y="35" width="70" height="30" />
            <text className="boxText" x="215" y="54">
              worker A
            </text>
            <text className="figHint" x="215" y="80">
              worker B gets nothing
            </text>

            <line className="divider" x1="290" y1="10" x2="290" y2="150" />

            <text className="figLabel" x="470" y="18">
              PUB/SUB (all get it)
            </text>
            <rect className="box" x="330" y="60" width="100" height="30" />
            <text className="boxText" x="380" y="79">
              topic
            </text>
            <line className="flow" x1="430" y1="65" x2="520" y2="30" />
            <line className="flow" x1="430" y1="75" x2="520" y2="75" />
            <line className="flow" x1="430" y1="85" x2="520" y2="120" />
            <rect className="box" x="520" y="15" width="100" height="26" />
            <text className="boxText" x="570" y="33">
              inventory
            </text>
            <rect className="box" x="520" y="62" width="100" height="26" />
            <text className="boxText" x="570" y="80">
              email
            </text>
            <rect className="box" x="520" y="107" width="100" height="26" />
            <text className="boxText" x="570" y="125">
              analytics
            </text>
          </svg>
          <figcaption>
            Same &quot;drop a message and move on&quot; feel as a queue, but the fan-out is the whole
            point.
          </figcaption>
        </figure>

        <h2>2. The vocabulary</h2>
        <table className="miniTable">
          <caption>PUB/SUB TERMS</caption>
          <thead>
            <tr>
              <th>Term</th>
              <th>Meaning</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Publisher</td>
              <td>Sends a message to a topic, knowing nothing about who reads it</td>
            </tr>
            <tr>
              <td>Topic / channel</td>
              <td>A named category messages are published to</td>
            </tr>
            <tr>
              <td>Subscriber</td>
              <td>Registers interest in a topic and receives every message on it</td>
            </tr>
            <tr>
              <td>Fan-out</td>
              <td>One message becoming many deliveries, one per subscriber</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Adding a new subscriber is free</h2>
        <p>
          Because the publisher never lists who is listening, you can add a brand-new subscriber
          &mdash; say, a new &quot;send to Slack&quot; service &mdash; without touching the
          publisher&apos;s code at all. It just subscribes to the existing topic and starts
          receiving events from that point on.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: fanning out an order event</h2>
        <ol className="stepList">
          <li>
            <b>Checkout service publishes</b>{" "}
            <code>{`{topic: "order.placed", orderId: 501, total: 780}`}</code> and is done &mdash;
            no idea who, if anyone, is listening.
          </li>
          <li>
            <b>The message broker fans it out</b> to every current subscriber of{" "}
            <code>order.placed</code>: inventory, email, analytics, fraud-check.
          </li>
          <li>
            <b>Each subscriber processes its own copy independently.</b> Email being slow does not
            delay inventory reserving stock.
          </li>
          <li>
            <b>Months later, a new &quot;loyalty points&quot; service is added.</b> It subscribes to
            the same topic &mdash; the checkout service is never modified.
          </li>
          <li>
            <b>Each subscriber tracks its own progress</b> (which messages it has processed), so a
            slow subscriber does not block a fast one.
          </li>
        </ol>
        <div className="takeaway">
          Pub/sub is how you add new behaviour to &quot;something happened&quot; without editing the
          code that caused it &mdash; the foundation of event-driven architecture, next.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Using pub/sub when only one consumer should act</h3>
            <p>
              &quot;Charge this card&quot; must happen exactly once. If every subscriber processes
              it, you have just built duplicate charges by design.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>No idea who is subscribed</h3>
            <p>
              Fan-out is powerful but can hide dependencies &mdash; deleting a topic can silently
              break three services nobody remembered were listening.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Ignoring subscriber lag</h3>
            <p>
              If one subscriber falls behind, messages can pile up for it specifically. Monitor
              per-subscriber lag, not just the topic overall.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            &quot;Send a confirmation email&quot; should happen once. &quot;Notify every service that
            cares about a new order&quot; should reach many. Which pattern fits each, and why would
            using pub/sub for the first one be a bug?
          </p>
        </div>
      </section>
    </div>
  );
}
