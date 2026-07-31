import "../css/Architecture.css";
export default function ReactArchitecture() {
  return (
    <div className="reactArchitecture">
      <section id="overview">
        <p className="lead">
          A scalable React application groups code by product feature and keeps shared
          infrastructure at the edges.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Feature boundaries</h2>
        <p>
          Each feature can own its components, hooks, API calls, tests, and types. Shared UI should
          contain stable design-system primitives—not business logic.
        </p>
        <div className="folderMap">
          <code>
            src/
            <br />
            ├─ features/
            <br />
            │&nbsp; ├─ checkout/
            <br />
            │&nbsp; └─ account/
            <br />
            ├─ components/ui/
            <br />
            ├─ services/
            <br />
            └─ App.jsx
          </code>
        </div>
      </section>
      <section id="example">
        <h2>2. Dependency direction</h2>
        <p>
          Pages compose features, features use shared UI and services, while shared code never
          imports from a feature.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Architecture traps</h2>
        <p>
          Avoid enormous global component folders, catch-all utility files, circular feature
          imports, and premature state libraries.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Where should a checkout-specific currency formatter live?</p>
        </div>
      </section>
    </div>
  );
}
