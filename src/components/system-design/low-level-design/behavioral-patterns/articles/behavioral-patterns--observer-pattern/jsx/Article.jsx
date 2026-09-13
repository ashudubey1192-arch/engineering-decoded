import "../css/Article.css";

export default function BehavioralPatternsObserverPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Observer defines a one-to-many dependency so that when one object changes state, every
          registered dependent is notified automatically &mdash; without the object doing the
          notifying ever needing to know what its observers actually do with that notification.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A subject keeps a list of registered observers and calls a shared <code>update()</code>
          (or similar) method on each of them whenever its own state changes. Adding a new kind of
          observer means implementing that shared interface and registering an instance &mdash; the
          subject's own code never has to change to support it.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>WeatherStation</code> (the subject) calls <code>notify()</code> on every
          registered display whenever the temperature changes; <code>PhoneDisplay</code> and
          <code>WebDisplay</code> both implement an <code>Observer</code> interface and register
          themselves with the station. Adding a <code>SmartWatchDisplay</code> later means writing
          one new class and registering it &mdash; <code>WeatherStation</code> itself is untouched.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 120" role="img" aria-label="Diagram of a WeatherStation subject notifying three registered observers directly whenever its temperature changes." >
          <rect className="boxAccent" x="30" y="45" width="120" height="30" rx="6" /><text x="90" y="64" className="boxText" style={{fontSize:"7.5px"}}>WeatherStation</text>
          {["Phone","Web","Watch"].map((t,i) => (<line key={t} className="flow" x1="150" y1="60" x2="260" y2={15+i*35} />))}
          {["Phone","Web","Watch"].map((t,i) => (<rect key={t} className="box" x="265" y={3+i*35} width="90" height="24" rx="5" />))}
          {["Phone","Web","Watch"].map((t,i) => (<text key={t} x="310" y={19+i*35} className="boxText" textAnchor="middle" style={{fontSize:"6.5px"}}>{t}Display</text>))}
        </svg>
        <figcaption>The subject notifies every registered observer directly; it never needs to know what each one does with the update.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          An observer's <code>update()</code> throwing or blocking can stall notification to every
          other observer in line if the subject doesn't isolate each call. Forgetting to
          unregister an observer that's no longer needed is an easy, common leak &mdash; it keeps
          receiving (and reacting to) updates long after it should have stopped.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can one observer's update() method blocking or throwing be a problem for every other observer registered on the same subject?</p>
        </div>
      </section>
      <p className="takeaway">
        Observer decouples the subject from its dependents entirely &mdash; it just notifies; what
        each observer does with that notification is never its concern.
      </p>
    </div>
  );
}
