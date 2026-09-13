import "../css/Article.css";

export default function WelcomeHowToApproachHldArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Every HLD prompt, no matter how different on the surface, can be worked through with the
          same repeatable four-step loop: clarify, estimate, define, then build &mdash; in that order.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The loop is: <b>clarify</b> requirements and scope, <b>estimate</b> rough scale (users,
          QPS, storage), <b>define</b> the APIs and data model those requirements imply, and only
          then <b>build</b> the component diagram &mdash; adding pieces like caches, queues, or
          replicas specifically because the estimate justified them, not by default. Skipping a
          step doesn&rsquo;t save time; it just means backtracking later when an assumption turns
          out to be wrong.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>Applying the loop to &ldquo;design a URL shortener,&rdquo; at a high level, before any specifics:</p>
        <ol className="stepList">
          <li><b>Clarify.</b> Custom aliases needed? Analytics needed? Assume: no custom aliases,
            basic click count is enough.</li>
          <li><b>Estimate.</b> 100M new URLs/month, 100:1 read-to-write ratio &mdash; reads
            dominate, so the design should optimize for fast redirects over write throughput.</li>
          <li><b>Define.</b> <code>POST /urls</code>, <code>GET /{"{"}code{"}"}</code>, and a single{" "}
            <code>ShortUrl(code, longUrl, createdAt)</code> record.</li>
          <li><b>Build.</b> Because reads dominate, add a cache in front of the database from the
            start &mdash; a decision justified by step 2, not assumed upfront.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a four-step loop: clarify, estimate, define, and build, arranged in a cycle with arrows connecting each step to the next." >
          {["Clarify","Estimate","Define","Build"].map((t,i) => {
            const positions = [[60,25],[300,25],[300,90],[60,90]];
            const [x,y] = positions[i];
            return (<g key={t}><rect className={i===3?"boxAccent":"box"} x={x-45} y={y-18} width="90" height="36" rx="6" /><text x={x} y={y+5} className="boxText" textAnchor="middle">{t}</text></g>);
          })}
          <line className="flow" x1="105" y1="25" x2="255" y2="25" />
          <line className="flow" x1="300" y1="43" x2="300" y2="72" />
          <line className="flow" x1="255" y1="90" x2="105" y2="90" />
        </svg>
        <figcaption>The same four-step loop applies whether the prompt is a URL shortener or a global chat platform.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Going quiet and designing in your head instead of narrating each step out loud is a
          common failure in interview settings specifically &mdash; the process is the point, and
          nobody can evaluate a process they can&rsquo;t see. Reaching for heavyweight tools
          (microservices, Kafka, multi-region replication) before the estimate has justified them
          is the other common trap; it signals pattern-matching over reasoning.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does estimating scale come before defining APIs and building the component diagram, rather than after?</p>
        </div>
      </section>
      <p className="takeaway">
        Clarify, estimate, define, build &mdash; the same four-step loop turns any HLD prompt from
        overwhelming to mechanical, and every later section in this course is a tool you plug into
        the &ldquo;build&rdquo; step once the earlier steps justify it.
      </p>
    </div>
  );
}
