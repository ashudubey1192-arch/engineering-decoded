export default function BehavioralPatternsObserverArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Observer defines a one-to-many dependency between objects, so that when one object's
          state changes, all of its registered dependents are notified automatically. This is the
          pattern the What is a Design Pattern? article used as its opening example &mdash; a
          subject holding a list of listeners, notifying them of a change &mdash; recognized
          independently by two unrelated teams before either knew its name.
        </p>
        <p>
          Intent: notify multiple dependent objects automatically when a subject's state changes,
          without the subject knowing who or what those dependents are. Applicability: a change to
          one object needs to trigger updates in an open-ended, possibly changing set of other
          objects.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building a subject/observer relationship, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Define an observer interface with an update method.</b>{" "}
            <code>PriceListener.onPriceChanged(double newPrice)</code>, implementable by anything
            interested.
          </li>
          <li>
            <b>Have the subject hold a list of registered observers, not concrete types.</b>{" "}
            <code>StockPrice</code> holds <code>List&lt;PriceListener&gt;</code>, never knowing
            which concrete classes actually implement it.
          </li>
          <li>
            <b>Notify every observer on state change, uniformly.</b> After updating its internal
            price, <code>StockPrice</code> loops the list and calls{" "}
            <code>onPriceChanged()</code> on each one.
          </li>
          <li>
            <b>Let observers register and unregister independently, at runtime.</b> A dashboard
            widget can subscribe when it's shown and unsubscribe when it's closed, with no change
            needed to <code>StockPrice</code> itself.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="180" y="15" width="110" height="40" rx="6" />
            <text className="boxText" x="235" y="40" fontSize="10">StockPrice</text>
            <line className="flow" x1="210" y1="55" x2="90" y2="95" />
            <line className="flow" x1="235" y1="55" x2="235" y2="95" />
            <line className="flow" x1="260" y1="55" x2="380" y2="95" />
            <rect className="box" x="30" y="95" width="120" height="35" rx="5" />
            <text className="boxText" x="90" y="117" fontSize="8">DashboardWidget</text>
            <rect className="box" x="175" y="95" width="120" height="35" rx="5" />
            <text className="boxText" x="235" y="117" fontSize="8">AlertService</text>
            <rect className="box" x="320" y="95" width="120" height="35" rx="5" />
            <text className="boxText" x="380" y="117" fontSize="8">TradeLogger</text>
          </svg>
          <figcaption>Any number of observers can register; the subject notifies all of them uniformly, without knowing their concrete types.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A subject notifying an open-ended set of observers</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface PriceListener { void onPriceChanged(double newPrice); }

class StockPrice {
    private double price;
    private final List<PriceListener> listeners = new ArrayList<>();
    void subscribe(PriceListener listener) { listeners.add(listener); }
    void unsubscribe(PriceListener listener) { listeners.remove(listener); }
    void update(double newPrice) {
        this.price = newPrice;
        listeners.forEach(l -> l.onPriceChanged(newPrice)); // uniform notification
    }
}

StockPrice appleStock = new StockPrice();
appleStock.subscribe(price -> dashboard.refresh(price)); // lambda: an anonymous PriceListener
appleStock.subscribe(price -> { if (price > threshold) alertService.notify(price); });
appleStock.update(187.42); // both listeners fire; StockPrice never named either one`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Forgetting to unsubscribe, causing a memory leak.</b> An observer that's no longer
            needed but never removed from the subject's list stays reachable indefinitely,
            preventing it from being garbage collected.
          </li>
          <li>
            <b>Notifying observers in an order they implicitly depend on.</b> If two observers
            must run in a specific sequence, that dependency should be explicit, not an accident
            of list-insertion order that could silently change.
          </li>
          <li>
            <b>Letting an observer's <code>onPriceChanged()</code> throw and break notification for
            every observer after it.</b> One misbehaving observer shouldn't be able to prevent the
            rest of the list from being notified.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why can <code>StockPrice.update()</code> notify both a dashboard widget and an alert service without any code inside <code>StockPrice</code> mentioning either class by name?</p>
          <p>
            <b>Answer:</b> Both are registered as <code>PriceListener</code> implementations
            (here, as lambdas) through the shared <code>subscribe()</code> method.{" "}
            <code>StockPrice</code> only ever calls the interface method{" "}
            <code>onPriceChanged()</code> on whatever's in its list &mdash; it has no knowledge of
            <code> DashboardWidget</code> or <code>AlertService</code> as concrete types.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Observer when a change in one object needs to reach an open-ended, changing set
        of dependents &mdash; the subject notifies through a shared interface, never needing to
        know who's actually listening.
      </p>
    </div>
  );
}
