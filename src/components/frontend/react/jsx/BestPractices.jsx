import "../css/BestPractices.css";
export default function ReactBestPractices() {
  return (
    <div className="reactPractices">
      <section id="overview">
        <p className="lead">
          Good React code makes state ownership, data flow, and user behavior easy to trace.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Practices that scale</h2>
        <div className="practiceList">
          <p>
            <b>01</b>
            <span>
              <strong>Keep state minimal</strong>Calculate derived values during render.
            </span>
          </p>
          <p>
            <b>02</b>
            <span>
              <strong>Prefer composition</strong>Build behavior from small, explicit pieces.
            </span>
          </p>
          <p>
            <b>03</b>
            <span>
              <strong>Test user outcomes</strong>Assert what the user sees and can do.
            </span>
          </p>
        </div>
      </section>
      <section id="example">
        <h2>2. Name event handlers by intent</h2>
        <pre>
          <code>{`<CheckoutForm onSubmitOrder={handleSubmitOrder} />`}</code>
        </pre>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Unnecessary effects, unstable list keys, state mutation, prop drilling without a real
          problem, and memoization everywhere add complexity.
        </p>
      </section>
      <section id="check">
        <h2>4. Review checklist</h2>
        <div className="quiz">
          <p>
            Can another engineer identify every state owner and side effect in under five minutes?
          </p>
        </div>
      </section>
    </div>
  );
}
