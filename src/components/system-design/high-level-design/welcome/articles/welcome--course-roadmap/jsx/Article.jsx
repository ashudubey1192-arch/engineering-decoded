import "../css/Article.css";

export default function WelcomeCourseRoadmapArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          The eight sections in this course aren&rsquo;t independent trivia &mdash; each one hands
          you a tool the next section assumes you already have, building toward the final case
          studies where you use all of them together.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The path runs from process to primitives to failure handling to worked examples. HLD
          Foundations gives you the repeatable process (clarify, estimate, define, identify).
          Scalability and Data Layer give you the two most common levers you&rsquo;ll pull once
          the core design exists &mdash; handling more traffic, and handling more data. Distributed
          Systems covers what breaks once your one design becomes many machines. Reliability and
          Operations cover what happens when things fail or need to run safely in production. The
          Case Studies section is where all of it gets exercised on real prompts, start to finish.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Asked to design something small and read-heavy?</b> Lean hardest on Scalability
            (caching, CDNs) and Data Layer (replication).</li>
          <li><b>Asked to design something with heavy writes and coordination?</b> Lean hardest on
            Distributed Systems (consistent hashing, message queues, leader election).</li>
          <li><b>Asked &ldquo;what happens if this component goes down&rdquo;?</b> That&rsquo;s
            Reliability &mdash; failover, circuit breakers, retries.</li>
          <li><b>Asked to walk through a full design end-to-end?</b> That&rsquo;s exactly the shape
            of the Case Studies section.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram of a pipeline of six sections: Foundations, Scalability, Data Layer, Distributed Systems, Reliability and Operations, converging into Case Studies." >
          {["Foundations", "Scalability", "Data Layer", "Dist. Systems", "Reliability / Ops"].map((t, i) => (
            <rect key={t} className="box" x={10 + i * 88} y="20" width="78" height="34" rx="5" />
          ))}
          {["Foundations", "Scalability", "Data Layer", "Dist. Systems", "Reliability / Ops"].map((t, i) => (
            <text key={t} x={49 + i * 88} y="41" className="boxText" textAnchor="middle" style={{fontSize:"8px"}}>{t}</text>
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
          Skipping straight to Case Studies without the earlier sections leaves you naming patterns
          you can&rsquo;t explain when asked &ldquo;why this one, specifically?&rdquo; Treating each
          section as an isolated fact to memorize, rather than a tool that gets reused across many
          different case studies, makes the knowledge hard to retrieve under pressure.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>If a prompt is heavy on writes and needs strong coordination across machines, which section&rsquo;s tools would you reach for first, and why?</p>
        </div>
      </section>
      <p className="takeaway">
        The course is ordered deliberately: process first, then the two big scaling levers, then
        distribution and failure, then full worked designs that pull from everything before them.
      </p>
    </div>
  );
}
