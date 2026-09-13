import "../css/Article.css";

export default function WelcomeCourseRoadmapArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          This course moves from the raw material of object-oriented design up to fully worked
          interview problems &mdash; each section is a tool, and the case studies at the end are
          where every tool gets used together on one problem at a time.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          LLD Foundations gives you the vocabulary &mdash; turning requirements into classes,
          naming how objects relate, and choosing composition over inheritance where it fits.
          SOLID Principles gives you the standards a good class design should meet. UML and
          Modeling gives you the notation to communicate a design before writing code. Creational,
          Structural, and Behavioral Patterns give you named, battle-tested solutions to problems
          that recur across many different systems. Implementation Practices covers the practical
          concerns &mdash; error handling, concurrency, dependency injection, testing &mdash; that
          separate a design that merely compiles from one that survives real changes. LLD Case
          Studies is where all of it gets exercised on full prompts, start to finish.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Asked to turn a paragraph of requirements into classes?</b> That&rsquo;s LLD
            Foundations.</li>
          <li><b>Asked why a design &ldquo;feels wrong&rdquo; even though it works?</b> That&rsquo;s
            usually a SOLID principle being quietly violated.</li>
          <li><b>Asked to communicate a design without writing code?</b> Reach for the UML and
            Modeling section&rsquo;s diagrams.</li>
          <li><b>Recognize a recurring shape</b> &mdash; swappable behavior, a family of related
            objects, a fixed algorithm with variable steps? That&rsquo;s a Design Pattern from one
            of the three pattern sections.</li>
          <li><b>Asked to walk through a full design end-to-end?</b> That&rsquo;s exactly the shape
            of the Case Studies section.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram of a pipeline of sections: Foundations, SOLID, UML, Patterns, and Practices, converging into Case Studies." >
          {["Foundations", "SOLID", "UML", "Patterns", "Practices"].map((t, i) => (
            <rect key={t} className="box" x={10 + i * 88} y="20" width="78" height="34" rx="5" />
          ))}
          {["Foundations", "SOLID", "UML", "Patterns", "Practices"].map((t, i) => (
            <text key={t} x={49 + i * 88} y="41" className="boxText" textAnchor="middle" style={{fontSize:"7.5px"}}>{t}</text>
          ))}
          {[0,1,2,3].map((i) => (<line key={i} className="flow" x1={88 + i * 88} y1="37" x2={98 + i * 88} y2="37" />))}
          <line className="flow" x1="230" y1="54" x2="230" y2="90" />
          <rect className="boxAccent" x="150" y="95" width="160" height="36" rx="6" /><text x="230" y="117" className="boxText">Case Studies</text>
        </svg>
        <figcaption>Each section is a tool; Case Studies is where every tool gets used together.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Skipping straight to design patterns without the SOLID foundations underneath leaves you
          applying a pattern without understanding which problem it actually solves. Treating each
          section as an isolated fact to memorize, instead of a tool that gets reused across many
          different case studies, makes the knowledge hard to retrieve under pressure.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does the course place SOLID principles before the design pattern sections rather than after?</p>
        </div>
      </section>
      <p className="takeaway">
        Move through the sections in order at least once &mdash; each one is a tool the Case
        Studies section assumes you already have in hand.
      </p>
    </div>
  );
}
