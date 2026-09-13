import "../css/Article.css";

export default function WelcomeHowToApproachLldArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A reliable process matters more than knowing every pattern by name &mdash; the same six
          steps apply whether the prompt is a parking lot or a chat application.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ol className="stepList">
          <li><b>Clarify scope.</b> What does the system actually need to do, and what&rsquo;s
            explicitly out of scope? A vague prompt answered with a huge class hierarchy usually
            solved the wrong problem.</li>
          <li><b>Identify candidate classes.</b> The nouns in the requirements are your starting
            point &mdash; not every noun earns a class, but most classes start as a noun.</li>
          <li><b>Assign responsibilities.</b> Give each class one clear job before worrying about
            methods or fields.</li>
          <li><b>Define relationships.</b> Decide which pairs are is-a (inheritance) and which are
            has-a (composition or aggregation).</li>
          <li><b>Apply principles and patterns where they genuinely fit</b> &mdash; not because a
            pattern exists, but because the problem it solves is actually present here.</li>
          <li><b>Sketch it</b> &mdash; a rough class diagram &mdash; before writing the full
            implementation.</li>
        </ol>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          For &ldquo;design a vending machine,&rdquo; the first three steps might look like:
          scope is a single machine, one transaction at a time, no networked payment; candidate
          classes are VendingMachine, Product, and Coin; VendingMachine owns the transaction flow,
          Product owns its own price and stock count, Coin only represents a value. Only after
          that does it make sense to ask which relationships and patterns fit &mdash; jumping to
          &ldquo;I&rsquo;ll use the State pattern&rdquo; before this groundwork is done tends to
          produce a design that fits the pattern better than it fits the problem.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 120" role="img" aria-label="Diagram of six steps in sequence: clarify scope, identify classes, assign responsibilities, define relationships, apply patterns, and sketch the design." >
          {["Scope","Classes","Roles","Relations","Patterns","Sketch"].map((t,i) => (<rect key={t} className={i===5?"boxAccent":"box"} x={10+i*72} y="40" width="64" height="34" rx="5" />))}
          {["Scope","Classes","Roles","Relations","Patterns","Sketch"].map((t,i) => (<text key={t} x={42+i*72} y="61" className="boxText" textAnchor="middle" style={{fontSize:"7px"}}>{t}</text>))}
          {[0,1,2,3,4].map(i => (<line key={i} className="flow" x1={74+i*72} y1="57" x2={82+i*72} y2="57" />))}
        </svg>
        <figcaption>A repeatable six-step process, applied the same way regardless of which system the prompt names.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Designing the full class hierarchy before writing down what the system is actually
          required to do leads to elegant classes that solve the wrong problem. Reaching for a
          named pattern because it&rsquo;s recognizable, rather than because the problem it solves
          is actually present, is the other common overreach &mdash; it reads as over-engineering
          to anyone reviewing the design.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why should identifying candidate classes and their responsibilities come before deciding which design patterns to apply?</p>
        </div>
      </section>
      <p className="takeaway">
        Scope, classes, responsibilities, relationships, patterns, sketch &mdash; in that order,
        the same six steps carry you through almost any LLD prompt.
      </p>
    </div>
  );
}
