import "../css/Article.css";

export default function StructuralPatternsFacadePatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Facade provides one simplified interface in front of a complex subsystem of many
          interacting classes &mdash; without hiding that subsystem entirely from callers who
          genuinely need finer control.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The facade itself contains little logic of its own &mdash; its job is to know the right
          order to call the subsystem's existing classes in, so most callers never have to learn
          that order themselves. Callers who need something the facade doesn't expose can usually
          still reach the underlying subsystem classes directly.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>HomeTheaterFacade.watchMovie()</code> method internally calls
          <code>projector.on()</code>, <code>soundSystem.setVolume()</code>, and
          <code>streamingDevice.play()</code> in the specific order that actually works. A caller
          just calls <code>watchMovie()</code> once, without needing to know that turning on the
          sound system before the projector warms up causes a distracting pop.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a client calling one Facade method, which internally coordinates calls to a Projector, SoundSystem, and StreamingDevice in the correct order." >
          <rect className="box" x="20" y="45" width="90" height="26" rx="5" /><text x="65" y="62" className="boxText" style={{fontSize:"7px"}}>Client</text>
          <line className="flow" x1="110" y1="58" x2="150" y2="58" /><text x="130" y="48" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>watchMovie()</text>
          <rect className="boxAccent" x="155" y="45" width="110" height="26" rx="5" /><text x="210" y="62" className="boxText" style={{fontSize:"7px"}}>HomeTheaterFacade</text>
          {["Projector","SoundSystem","Streaming"].map((t,i) => (<line key={t} className="flowMuted" x1="265" y1="58" x2="310" y2={20+i*35} />))}
          {["Projector","SoundSystem","Streaming"].map((t,i) => (<rect key={t} className="box" x="315" y={8+i*35} width="90" height="24" rx="5" />))}
          {["Projector","SoundSystem","Streaming"].map((t,i) => (<text key={t} x="360" y={24+i*35} className="boxText" textAnchor="middle" style={{fontSize:"6.5px"}}>{t}</text>))}
        </svg>
        <figcaption>The client makes one call; the facade knows the correct order to coordinate the subsystem underneath.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Letting the facade grow into a god-object that reimplements subsystem logic itself,
          rather than just coordinating existing calls, defeats its purpose. Treating the facade as
          the only way in &mdash; blocking advanced callers who genuinely need subsystem-level
          control from ever reaching it &mdash; is the opposite mistake.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What does HomeTheaterFacade.watchMovie() actually do internally, and why does that save every caller from repeating it?</p>
        </div>
      </section>
      <p className="takeaway">
        A facade's value is in knowing the right order to call an existing subsystem &mdash; not in
        replacing that subsystem or being the only path to it.
      </p>
    </div>
  );
}
