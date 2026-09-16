export default function CreationalPatternsSingletonArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Singleton ensures a class has exactly one instance and provides a single, well-known
          point of access to it. It is the most recognized pattern in the catalog and, for the
          same reason, the most frequently overused &mdash; global state disguised as a design
          pattern. This article covers where it genuinely earns its place, and the specific
          testability cost that makes it worth being suspicious of by default.
        </p>
        <p>
          Intent: guarantee a single instance. Applicability: exactly one instance is a real
          requirement, not just a current accident of how the code happens to be written.
        </p>
      </section>
      <section id="concepts">
        <h2>1. When Singleton is a genuine fit, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Confirm "exactly one" is a hard requirement, not a habit.</b> A configuration
            registry loaded once from a single file at startup has a real one-instance
            requirement; a "logger" often doesn't &mdash; multiple logger instances writing to the
            same destination usually cause no actual problem.
          </li>
          <li>
            <b>Prefer dependency injection to provide that single instance over a static
            accessor.</b> A DI container configured to provide one shared instance gets the
            "exactly one" guarantee without a global static reference baked into every caller.
          </li>
          <li>
            <b>If a static accessor is genuinely necessary, make construction thread-safe.</b> Lazy
            initialization needs explicit synchronization or a static holder class; a naive
            check-then-create is a race condition under concurrent first access.
          </li>
          <li>
            <b>Isolate the accessor itself so it can be substituted in tests.</b> Code that calls{" "}
            <code>ConfigRegistry.getInstance()</code> directly, scattered everywhere, is
            untestable without a real singleton in play &mdash; injecting the instance instead
            keeps the "one instance" guarantee without that cost.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 460 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="180" y="20" width="120" height="45" rx="6" />
            <text className="boxText" x="240" y="47" fontSize="10">ConfigRegistry</text>
            <text className="figLabel" x="240" y="12">one instance</text>
            <line className="flow" x1="240" y1="65" x2="100" y2="105" />
            <line className="flow" x1="240" y1="65" x2="240" y2="105" />
            <line className="flow" x1="240" y1="65" x2="380" y2="105" />
            <rect className="box" x="40" y="105" width="120" height="30" rx="5" />
            <text className="boxText" x="100" y="124" fontSize="9">ServiceA</text>
            <rect className="box" x="180" y="105" width="120" height="30" rx="5" />
            <text className="boxText" x="240" y="124" fontSize="9">ServiceB</text>
            <rect className="box" x="320" y="105" width="120" height="30" rx="5" />
            <text className="boxText" x="380" y="124" fontSize="9">ServiceC</text>
          </svg>
          <figcaption>Every consumer shares the exact same instance, whether reached via a static accessor or via injection from a DI container.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A thread-safe Singleton, and the injectable alternative</h2>
        <span className="codeLabel">JAVA &mdash; CLASSIC, THREAD-SAFE STATIC ACCESSOR</span>
        <div className="codeBlock">
          <pre>{`public final class ConfigRegistry {
    private static final ConfigRegistry INSTANCE = new ConfigRegistry(); // eager, thread-safe by class-loading
    private final Map<String, String> values;
    private ConfigRegistry() { values = loadFromFile("config.properties"); }
    public static ConfigRegistry getInstance() { return INSTANCE; }
    public String get(String key) { return values.get(key); }
}`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; SAME GUARANTEE, INJECTABLE</span>
        <div className="codeBlock">
          <pre>{`// a DI container configured to provide exactly one shared ConfigRegistry
// gives the same "one instance" guarantee, without any caller needing a static accessor
class ServiceA {
    private final ConfigRegistry config;
    ServiceA(ConfigRegistry config) { this.config = config; } // easy to substitute a test double
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Reaching for Singleton to avoid passing a dependency through a few constructors.</b>{" "}
            Convenience is not the same as a genuine one-instance requirement; this is the pattern
            most commonly chosen for the wrong reason.
          </li>
          <li>
            <b>Naive lazy initialization with no synchronization.</b> A plain{" "}
            <code>if (instance == null) instance = new ConfigRegistry();</code> is a data race
            under concurrent first access, potentially constructing two instances.
          </li>
          <li>
            <b>Scattering <code>getInstance()</code> calls throughout the codebase instead of
            injecting.</b> This is what actually makes Singleton hard to test &mdash; every direct
            call site is a hidden dependency that can't be swapped for a test double.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does injecting a singleton-managed <code>ConfigRegistry</code> through a constructor keep the same guarantee as a static <code>getInstance()</code> accessor, while being easier to test?</p>
          <p>
            <b>Answer:</b> The "exactly one instance" guarantee comes from how the instance is
            created and shared (by the DI container, or the class's own static field), not from
            how callers reach it. Injecting it means each class depends only on the{" "}
            <code>ConfigRegistry</code> type, so a test can substitute a different instance
            without touching any global state.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reserve Singleton for a genuine "exactly one" requirement, prefer providing that one
        instance through injection over a static accessor, and if a static accessor is
        unavoidable, make its construction explicitly thread-safe.
      </p>
    </div>
  );
}
