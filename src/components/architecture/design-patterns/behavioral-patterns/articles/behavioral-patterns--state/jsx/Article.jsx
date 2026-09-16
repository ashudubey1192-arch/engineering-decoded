export default function BehavioralPatternsStateArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          State lets an object change its behavior when its internal state changes, by
          representing each state as its own class rather than a field checked by scattered{" "}
          <code>if</code> statements. The Intent and Applicability article contrasted State with
          Strategy: both swap behavior behind a shared interface, but State's variants represent
          stages of one object's lifecycle, where moving between them is itself part of the
          design &mdash; not just an interchangeable, independent choice.
        </p>
        <p>
          Intent: allow an object to alter its behavior when its internal state changes, appearing
          to change its class. Applicability: an object's behavior depends heavily on its current
          state, and state-checking conditionals are scattered across multiple methods.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Modeling states as classes, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the object's distinct states and the operations that vary by state.</b> An{" "}
            <code>Order</code> with states Placed, Shipped, Delivered &mdash; where{" "}
            <code>cancel()</code> behaves differently (or is disallowed) in each.
          </li>
          <li>
            <b>Define a state interface with one method per state-dependent operation.</b>{" "}
            <code>OrderState</code>, with <code>cancel(Order)</code> and{" "}
            <code>ship(Order)</code>.
          </li>
          <li>
            <b>Implement one class per state, each handling operations its own way.</b>{" "}
            <code>PlacedState.cancel()</code> succeeds; <code>ShippedState.cancel()</code> throws,
            since a shipped order can't be canceled.
          </li>
          <li>
            <b>Let a state transition by having the context replace its current state object.</b>{" "}
            <code>PlacedState.ship(order)</code> calls{" "}
            <code>order.setState(new ShippedState())</code> &mdash; the transition itself is part
            of the state's own logic.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="120" height="40" rx="6" />
            <text className="boxText" x="80" y="68" fontSize="10">PlacedState</text>
            <line className="flow" x1="140" y1="65" x2="190" y2="65" />
            <rect className="box" x="190" y="45" width="120" height="40" rx="6" />
            <text className="boxText" x="250" y="68" fontSize="10">ShippedState</text>
            <line className="flow" x1="310" y1="65" x2="360" y2="65" />
            <rect className="boxAccent" x="360" y="45" width="120" height="40" rx="6" />
            <text className="boxText" x="420" y="68" fontSize="9">DeliveredState</text>
          </svg>
          <figcaption>Each state is its own class; the order transitions by replacing which state object it currently holds.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. State transitions owned by the state classes themselves</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface OrderState {
    void cancel(Order order);
    void ship(Order order);
}

class PlacedState implements OrderState {
    public void cancel(Order order) { order.setState(new CanceledState()); }
    public void ship(Order order) { order.setState(new ShippedState()); }
}
class ShippedState implements OrderState {
    public void cancel(Order order) { throw new IllegalStateException("cannot cancel a shipped order"); }
    public void ship(Order order) { throw new IllegalStateException("already shipped"); }
}

class Order {
    private OrderState state = new PlacedState();
    void setState(OrderState state) { this.state = state; }
    void cancel() { state.cancel(this); } // delegates entirely -- no if/else on order status
    void ship() { state.ship(this); }
}`}</pre>
        </div>
        <p>
          <code>Order.cancel()</code> has no conditional logic at all &mdash; it delegates to
          whichever state object it currently holds, and that state decides what "cancel" even
          means right now.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Confusing State with Strategy because the code looks similar.</b> If the "states"
            don't actually represent stages of a lifecycle with transitions between them, and are
            just interchangeable algorithms with no ordering, that's Strategy, not State.
          </li>
          <li>
            <b>Letting the context (<code>Order</code>) keep its own conditional logic alongside
            the state classes.</b> If <code>Order</code> still checks <code>if (state instanceof
            ShippedState)</code> anywhere, the delegation this pattern is built around has been
            undermined.
          </li>
          <li>
            <b>Modeling too few states, forcing one state class to represent two conceptually
            different situations.</b> "Placed but payment pending" and "placed and paid" behaving
            differently probably deserve to be two distinct state classes, not flags checked
            inside one.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>PlacedState.ship()</code> call <code>order.setState(new ShippedState())</code> rather than <code>Order</code> deciding transitions itself?</p>
          <p>
            <b>Answer:</b> In the State pattern, each state class owns the logic for what happens
            during its own operations, including which state comes next. Keeping that decision
            inside the state class (rather than in <code>Order</code>) means adding, removing, or
            reordering states never requires touching <code>Order</code>'s own code &mdash; the
            same Open/Closed discipline applied to state transitions specifically.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for State when an object's behavior genuinely depends on its position in a
        lifecycle with real transitions between stages &mdash; model each stage as its own class,
        and let transitions be part of each state's own logic.
      </p>
    </div>
  );
}
