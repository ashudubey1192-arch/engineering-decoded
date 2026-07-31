import "../css/CoreConcepts.css";
export default function ReactCoreConcepts() {
  return (
    <div className="reactCore">
      <section id="overview">
        <p className="lead">
          Components, props, state, and composition form React&apos;s small but powerful core.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Data flows down</h2>
        <p>
          Parents pass props to children. Components keep only the state they own. Derived values
          are calculated during render instead of stored again.
        </p>
        <div className="reactFlow">
          <b>App state</b>
          <span>↓ props</span>
          <b>Feature</b>
          <span>↓ props</span>
          <b>UI component</b>
        </div>
        <h2>2. Events flow up</h2>
        <p>
          Children communicate intent through callback props. The owner of the state decides how
          that state changes.
        </p>
      </section>
      <section id="example">
        <h2>3. Controlled state</h2>
        <pre>
          <code>{`const [query, setQuery] = useState("");\n<input value={query} onChange={e => setQuery(e.target.value)} />`}</code>
        </pre>
      </section>
      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <p>
          Duplicating derived state, mutating arrays, using effects for calculations, and placing
          all state at the application root make React harder than it needs to be.
        </p>
      </section>
      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>Which component should own state shared by two sibling components?</p>
        </div>
      </section>
    </div>
  );
}
