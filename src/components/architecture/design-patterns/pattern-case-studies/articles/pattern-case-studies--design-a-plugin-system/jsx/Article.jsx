export default function PatternCaseStudiesDesignAPluginSystemArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A plugin system needs to let third-party code extend an application without the core
          application knowing about any specific plugin in advance, and without one misbehaving
          plugin being able to crash the whole system &mdash; a design problem that centers on a
          stable extension point plus isolation.
        </p>
        <p>
          The core tension: the application must be genuinely open to plugins it's never seen,
          while staying protected from them &mdash; two requirements that point to different
          patterns working together rather than one pattern covering both.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Working through the design, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Define a stable extension point.</b> A <code>Plugin</code> interface with{" "}
            <code>onEvent(Event event)</code> is the one contract every plugin, known or unknown
            at compile time, must satisfy.
          </li>
          <li>
            <b>Let the application discover and register plugins without a fixed list.</b> A{" "}
            <code>PluginRegistry</code> loads plugin implementations (via a classpath scan or
            configuration file) and holds them as a list of the <code>Plugin</code> interface
            &mdash; the application never names a specific plugin class.
          </li>
          <li>
            <b>Isolate each plugin's execution from the others and from the core.</b> Each
            plugin's <code>onEvent()</code> call runs inside a guard that catches any exception
            and logs it, so one plugin throwing never stops the event from reaching the rest.
          </li>
          <li>
            <b>Recognize this as Observer at its core, with an isolation layer added.</b> The
            registry publishing an event to every registered plugin is Observer's exact
            structure; the isolation guard is the addition this specific problem requires beyond
            plain Observer.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="50" width="110" height="30" rx="5" />
            <text className="boxText" x="75" y="69" fontSize="8">PluginRegistry</text>
            <line className="flow" x1="130" y1="55" x2="190" y2="25" />
            <line className="flow" x1="130" y1="65" x2="190" y2="65" />
            <line className="flow" x1="130" y1="75" x2="190" y2="105" />
            <rect className="boxAccent" x="190" y="10" width="110" height="30" rx="5" />
            <text className="boxText" x="245" y="29" fontSize="7">Plugin A (guarded)</text>
            <rect className="boxAccent" x="190" y="50" width="110" height="30" rx="5" />
            <text className="boxText" x="245" y="69" fontSize="7">Plugin B (guarded)</text>
            <rect className="boxWarn" x="190" y="90" width="110" height="30" rx="5" />
            <text className="boxText" x="245" y="109" fontSize="7">Plugin C (throws, caught)</text>
          </svg>
          <figcaption>Every plugin is dispatched the same event through the same guarded call; one throwing doesn't affect the others.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A guarded plugin dispatch loop</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface Plugin { void onEvent(Event event); } // the one contract every plugin implements

class PluginRegistry {
    private final List<Plugin> plugins = new ArrayList<>();

    void register(Plugin plugin) { plugins.add(plugin); } // core never names a specific plugin class

    void publish(Event event) {
        for (Plugin plugin : plugins) {
            try {
                plugin.onEvent(event); // isolation: one plugin's failure can't stop the others
            } catch (RuntimeException e) {
                log("plugin " + plugin.getClass().getSimpleName() + " failed on event " + event, e);
            }
        }
    }
    private void log(String message, Exception e) { /* structured logging */ }
}

// A third-party plugin, written against only the Plugin interface, with no core code changed
class SlackNotifyPlugin implements Plugin {
    public void onEvent(Event event) {
        if (event instanceof OrderPlacedEvent) { /* post to Slack */ }
    }
}

PluginRegistry registry = new PluginRegistry();
registry.register(new SlackNotifyPlugin());   // core knows nothing about SlackNotifyPlugin specifically
registry.publish(new OrderPlacedEvent(order));`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting one plugin's exception propagate and stop the dispatch loop.</b> Without
            the try/catch around each individual call, one broken third-party plugin can prevent
            every other plugin from ever receiving events.
          </li>
          <li>
            <b>Growing the <code>Plugin</code> interface to cover every plugin's specific needs.</b>{" "}
            A bloated interface with methods most plugins don't use is exactly the Interface
            Bloat anti-pattern; a single, general <code>onEvent()</code> with typed event objects
            keeps the contract stable.
          </li>
          <li>
            <b>Skipping resource limits alongside exception isolation.</b> Catching exceptions
            protects against crashes, but a plugin stuck in an infinite loop or consuming
            unbounded memory needs a different kind of isolation (a timeout, a separate thread or
            process) that exception handling alone doesn't provide.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is this plugin system fundamentally Observer, and what does it add on top of plain Observer?</p>
          <p>
            <b>Answer:</b> <code>PluginRegistry.publish()</code> notifying every registered{" "}
            <code>Plugin</code> of an event is exactly Observer's structure: a subject holds a
            list of observers and calls each one when something happens, with the subject never
            knowing the observers' concrete types. What this design adds beyond plain Observer is
            the try/catch isolation around each individual <code>onEvent()</code> call &mdash;
            necessary here specifically because, unlike typical in-house observers, these
            plugins are third-party code the core application can't fully trust to behave.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A plugin system is Observer at its structural core &mdash; a stable interface, an
        open-ended registry of implementers &mdash; with per-call isolation added on top because
        the "observers" here are untrusted third-party code, not code the core team controls.
      </p>
    </div>
  );
}
