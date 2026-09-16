export default function StructuralPatternsProxyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Proxy provides a stand-in for another object, implementing the same interface, to
          control access to it &mdash; adding caching, lazy loading, access checks, or logging
          without the real object or its callers ever knowing the proxy is there. As noted in the
          Decorator article, the structural shape looks nearly identical to Decorator; the
          difference is intent: Decorator adds behavior, Proxy controls access to existing
          behavior.
        </p>
        <p>
          Intent: control access to an object by interposing a surrogate with the same interface.
          Applicability: direct access to the real object needs to be mediated &mdash; for cost
          (lazy loading), permission (access control), or location (a remote call).
        </p>
      </section>
      <section id="concepts">
        <h2>1. Building a proxy, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the specific access concern the real object shouldn't have to handle
            itself.</b> A <code>HighResImage</code> is expensive to load from disk; loading it
            eagerly, even when it's never displayed, wastes time and memory.
          </li>
          <li>
            <b>Implement the proxy behind the same interface as the real object.</b>{" "}
            <code>ImageProxy implements Image</code>, exactly like <code>HighResImage</code>{" "}
            does &mdash; callers can't tell them apart by type.
          </li>
          <li>
            <b>Defer creating or delegating to the real object until it's actually needed.</b>{" "}
            <code>ImageProxy.render()</code> constructs the real <code>HighResImage</code> only on
            first call, then delegates every subsequent call to that same instance.
          </li>
          <li>
            <b>Keep the proxy's added logic narrow and specific to its one concern.</b> A lazy-
            loading proxy handles loading, nothing else; an access-control proxy handles
            permission checks, nothing else &mdash; mixing concerns defeats the clarity the
            pattern is meant to provide.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="50" width="110" height="40" rx="6" />
            <text className="boxText" x="75" y="73" fontSize="10">Caller</text>
            <line className="flow" x1="130" y1="70" x2="180" y2="70" />
            <rect className="boxAccent" x="180" y="50" width="120" height="40" rx="6" />
            <text className="boxText" x="240" y="73" fontSize="9">ImageProxy</text>
            <text className="figHint" x="240" y="35">same interface</text>
            <line className="flowMuted" x1="300" y1="70" x2="360" y2="70" />
            <rect className="boxWarn" x="360" y="50" width="110" height="40" rx="6" />
            <text className="boxText" x="415" y="73" fontSize="9">HighResImage</text>
            <text className="figHint" x="415" y="100">created lazily, on first call</text>
          </svg>
          <figcaption>The caller talks to the proxy exactly as it would talk to the real object &mdash; the real object may not even exist yet.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A lazy-loading proxy behind a shared interface</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface Image { void render(); }

class HighResImage implements Image {
    HighResImage(String path) { loadFromDisk(path); } // expensive, happens at construction
    public void render() { /* draw pixels */ }
}

class ImageProxy implements Image {
    private final String path;
    private HighResImage real; // null until actually needed
    ImageProxy(String path) { this.path = path; } // cheap -- no loading yet
    public void render() {
        if (real == null) real = new HighResImage(path); // created only on first real use
        real.render();
    }
}

// a gallery of 200 images: constructing 200 ImageProxy instances is cheap;
// only the ones actually scrolled into view ever load from disk
List<Image> gallery = paths.stream().map(ImageProxy::new).toList();`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Confusing Proxy's intent with Decorator's.</b> If the goal is adding a genuinely
            new capability the real object didn't have, that's Decorator; if the goal is
            controlling how and when the existing capability is reached, that's Proxy &mdash; the
            code can look nearly identical while the reasoning differs.
          </li>
          <li>
            <b>Letting the proxy's caching or access-control logic leak business behavior.</b> A
            proxy should mediate access, not make business decisions &mdash; those still belong on
            the real object or elsewhere.
          </li>
          <li>
            <b>Forgetting thread-safety on lazy initialization.</b> The naive{" "}
            <code>if (real == null)</code> check has the same race condition risk covered in the
            Singleton article, if <code>render()</code> can be called concurrently.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>The Proxy and Decorator patterns can produce nearly identical class structures. What actually distinguishes an <code>ImageProxy</code> from a hypothetical <code>ImageDecorator</code>?</p>
          <p>
            <b>Answer:</b> The intent, not the structure. <code>ImageProxy</code> controls access
            to the same rendering behavior <code>HighResImage</code> already has &mdash;
            specifically, deferring when it's created. A decorator would instead add a genuinely
            new capability on top of rendering, like a border or a watermark, that the wrapped
            object didn't have before.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Proxy when access to an object &mdash; its cost, its permissions, or its
        location &mdash; needs mediation, not new capability &mdash; the same interface, but a
        stand-in deciding when and how the real object gets involved.
      </p>
    </div>
  );
}
