export default function DistributedPatternsSagaArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Saga coordinates a business transaction that spans multiple services as a sequence of
          local transactions, each with a defined compensating action that undoes it &mdash; when
          a step fails partway through, the saga runs the compensations for every step that
          already succeeded, in reverse, instead of relying on a distributed transaction no
          single database can provide.
        </p>
        <p>
          Intent: maintain data consistency across multiple services without a two-phase-commit
          distributed transaction, by structuring the operation as a series of local transactions
          with compensating actions. Applicability: a single business operation (placing an
          order) needs to update several independently-owned services (inventory, payment,
          shipping), and there's no shared database transaction that can span all of them.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Steps and compensations, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Break the operation into a sequence of local transactions.</b> Reserve inventory,
            then charge payment, then schedule shipping &mdash; each a transaction local to its
            own service.
          </li>
          <li>
            <b>Define a compensating action for every step.</b> Release inventory undoes the
            reservation; refund payment undoes the charge &mdash; one compensation per forward
            step, written in advance.
          </li>
          <li>
            <b>Run steps in order, tracking what's completed.</b> A saga coordinator (or each
            service reacting to events) executes each step and records it as done before moving
            to the next.
          </li>
          <li>
            <b>On failure, run completed steps' compensations in reverse.</b> If shipping
            scheduling fails after payment succeeded, the saga refunds the payment and releases
            the inventory &mdash; undoing only what actually happened.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="100" height="30" rx="5" />
            <text className="boxText" x="70" y="39" fontSize="8">Reserve stock</text>
            <line className="flow" x1="120" y1="35" x2="180" y2="35" />
            <rect className="box" x="180" y="20" width="100" height="30" rx="5" />
            <text className="boxText" x="230" y="39" fontSize="8">Charge payment</text>
            <line className="flow" x1="280" y1="35" x2="340" y2="35" />
            <rect className="boxWarn" x="340" y="20" width="100" height="30" rx="5" />
            <text className="boxText" x="390" y="39" fontSize="8">Schedule ship (fails)</text>
            <line className="flowMuted" x1="340" y1="55" x2="280" y2="80" />
            <line className="flowMuted" x1="280" y1="80" x2="120" y2="80" />
            <text className="figHint" x="150" y="100">compensations run in reverse: refund, release stock</text>
          </svg>
          <figcaption>When the last step fails, only the already-completed steps get compensated, in reverse order.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A saga compensating completed steps on failure</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface SagaStep {
    void execute(OrderContext ctx);
    void compensate(OrderContext ctx);
}

class ReserveInventoryStep implements SagaStep {
    public void execute(OrderContext ctx) { inventoryService.reserve(ctx.items()); }
    public void compensate(OrderContext ctx) { inventoryService.release(ctx.items()); }
}
class ChargePaymentStep implements SagaStep {
    public void execute(OrderContext ctx) { ctx.setTransactionId(paymentService.charge(ctx.total())); }
    public void compensate(OrderContext ctx) { paymentService.refund(ctx.transactionId()); }
}
class ScheduleShippingStep implements SagaStep {
    public void execute(OrderContext ctx) { shippingService.schedule(ctx.order()); } // may throw
    public void compensate(OrderContext ctx) { /* nothing to undo if execute never ran */ }
}

class OrderSaga {
    private final List<SagaStep> steps = List.of(
        new ReserveInventoryStep(), new ChargePaymentStep(), new ScheduleShippingStep());

    void run(OrderContext ctx) {
        List<SagaStep> completed = new ArrayList<>();
        try {
            for (SagaStep step : steps) {
                step.execute(ctx);
                completed.add(step); // only steps that actually succeeded are tracked
            }
        } catch (RuntimeException e) {
            Collections.reverse(completed);
            for (SagaStep step : completed) step.compensate(ctx); // undo in reverse order
            throw e;
        }
    }
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Writing a compensation that isn't actually safe to run twice.</b> If a saga
            coordinator crashes and retries, compensations may run more than once &mdash; each
            one needs to be idempotent, not just correct the first time.
          </li>
          <li>
            <b>Forgetting that compensation can't always perfectly undo a step.</b> Refunding a
            payment doesn't undo the customer having seen "payment successful" &mdash; sagas
            manage eventual consistency, not the illusion that nothing ever happened.
          </li>
          <li>
            <b>Reaching for Saga when a single service and a local transaction would do.</b> If
            every step touches the same database, an ordinary ACID transaction is simpler and
            stronger than saga's eventual consistency.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>In the example, if <code>ScheduleShippingStep.execute()</code> throws, why does the saga call <code>compensate()</code> on <code>ChargePaymentStep</code> and <code>ReserveInventoryStep</code> but not on <code>ScheduleShippingStep</code> itself?</p>
          <p>
            <b>Answer:</b> Only steps whose <code>execute()</code> actually completed are added
            to the <code>completed</code> list. Since <code>ScheduleShippingStep.execute()</code>{" "}
            threw before finishing, nothing happened there that needs undoing. The two steps that
            did succeed &mdash; reserving inventory and charging payment &mdash; are compensated
            in reverse order to bring the system back to a consistent state.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Saga replaces a distributed transaction with a sequence of local transactions and their
        compensations &mdash; consistency comes from undoing exactly what succeeded, not from a
        lock spanning every service at once.
      </p>
    </div>
  );
}
