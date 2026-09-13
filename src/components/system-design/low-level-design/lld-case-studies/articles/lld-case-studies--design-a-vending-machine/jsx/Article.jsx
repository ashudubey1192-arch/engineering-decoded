import "../css/Article.css";

export default function LldCaseStudiesDesignAVendingMachineArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Another naturally state-driven system &mdash; idle, awaiting payment, dispensing,
          out-of-stock &mdash; giving the State pattern a second, deliberately different worked
          example from the elevator.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: select a product, insert money, dispense the product and any change, and
          handle insufficient funds or an out-of-stock slot. Candidate classes:
          <code>VendingMachine</code> (holds a current state object), <code>Product</code> (a
          slot's price and remaining quantity), and coin/payment handling. States:
          <code>IdleState</code> (awaiting a selection), <code>AwaitingPaymentState</code>
          (accepting coins toward the selected price), <code>DispensingState</code>, and
          <code>OutOfStockState</code> &mdash; each defines what pressing a button or inserting a
          coin actually does right now.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A customer selects a product while the machine is Idle.</b> If the slot has stock,
            it transitions to AwaitingPaymentState; if not, straight to OutOfStockState.</li>
          <li><b>The customer inserts coins</b> and the machine tracks the running balance against
            the selected product's price.</li>
          <li><b>Once the balance covers the price,</b> the machine transitions to
            DispensingState.</li>
          <li><b>It dispenses the product, returns any change,</b> and resets to IdleState for the
            next customer.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 110" role="img" aria-label="Diagram of a vending machine moving through Idle, Awaiting Payment, and Dispensing states in sequence, with a separate Out of Stock state branching off the initial selection." >
          {["Idle","AwaitingPayment","Dispensing"].map((t,i) => (<rect key={t} className={i===2?"boxAccent":"box"} x={20+i*130} y="20" width="110" height="30" rx="15" />))}
          {["Idle","Awaiting Payment","Dispensing"].map((t,i) => (<text key={t} x={75+i*130} y="39" className="boxText" textAnchor="middle" style={{fontSize:"7px"}}>{t}</text>))}
          {[0,1].map(i => (<line key={i} className="flow" x1={130+i*130} y1="35" x2={150+i*130} y2="35" />))}
          <rect className="boxWarn" x="20" y="75" width="110" height="28" rx="14" /><text x="75" y="94" className="boxText" style={{fontSize:"6.5px"}}>OutOfStock</text>
          <line className="flowMuted" x1="75" y1="50" x2="75" y2="72" />
        </svg>
        <figcaption>A stock check at the very first transition decides whether payment is even accepted for the selected slot.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Letting the machine accept payment for a product that's already out of stock, because
          the stock check isn't wired into the very first state transition, is the signature bug
          here. Hardcoding coin values and product prices as scattered magic numbers, instead of
          centralizing them in Product and the coin classes' own data, makes a simple price change
          touch far more code than it should.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why must the out-of-stock check happen at selection time, before AwaitingPaymentState is ever entered?</p>
        </div>
      </section>
      <p className="takeaway">
        The same State pattern that modeled an elevator's behavior models a vending machine's just
        as directly &mdash; a different system, the same underlying tool.
      </p>
    </div>
  );
}
