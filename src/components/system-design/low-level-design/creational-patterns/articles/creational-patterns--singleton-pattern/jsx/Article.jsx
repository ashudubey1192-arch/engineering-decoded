import "../css/Article.css";

export default function CreationalPatternsSingletonPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Singleton ensures a class has exactly one instance and gives every caller the same
          shared access point to it &mdash; the right tool for a genuinely shared, expensive
          resource, and an easy pattern to reach for too often.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The mechanics are simple: a private constructor prevents anyone from creating a second
          instance directly, and a static <code>getInstance()</code> method returns the one shared
          instance, creating it the first time it's needed. It fits things like a configuration
          manager or a connection pool, where having two separate instances would mean two
          different, inconsistent views of the same resource.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>Logger</code> class with a private constructor and a static
          <code>getInstance()</code> method: the first call constructs the one instance and every
          later call &mdash; from any part of the application &mdash; returns that same object, so
          all log output goes through one consistently-configured logger rather than several
          independently-configured ones.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 120" role="img" aria-label="Diagram of three different callers across an application all calling Logger.getInstance() and receiving a reference to the same single shared Logger object." >
          {["Module A","Module B","Module C"].map((t,i) => (<rect key={t} className="box" x="20" y={15+i*32} width="90" height="24" rx="5" />))}
          {["Module A","Module B","Module C"].map((t,i) => (<text key={t} x="65" y={31+i*32} className="boxText" textAnchor="middle" style={{fontSize:"7px"}}>{t}</text>))}
          {[0,1,2].map(i => (<line key={i} className="flow" x1="110" y1={27+i*32} x2="240" y2="60" />))}
          <rect className="boxAccent" x="250" y="42" width="120" height="36" rx="6" /><text x="310" y="64" className="boxText" style={{fontSize:"8px"}}>Logger (one instance)</text>
        </svg>
        <figcaption>Every caller's getInstance() call resolves to the same single object, regardless of where in the app it's called from.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reaching for Singleton as a substitute for proper dependency injection turns it into
          hidden global state &mdash; any class can silently depend on it without that dependency
          ever appearing in a constructor, which makes testing and reasoning about the code harder.
          Not considering thread-safety is the other classic mistake: two threads both calling
          <code>getInstance()</code> for the first time simultaneously can both see no instance
          yet and both construct one, defeating the entire point.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can two threads calling getInstance() at the same time end up creating two separate instances if the method isn't made thread-safe?</p>
        </div>
      </section>
      <p className="takeaway">
        Singleton is right for a genuinely shared resource, not a convenient way to avoid passing
        a dependency through a constructor &mdash; and it needs real thought about concurrent
        first-time creation.
      </p>
    </div>
  );
}
