import "../css/Article.css";

export default function WelcomeCourseIntroductionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          This course is about the decisions that come after you already know how to write a
          service: how to split a system into services in the first place, how those services
          talk to each other without falling over, and how to run dozens of them in production
          without losing your ability to reason about the whole thing.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          "Microservices" describes a style of building a system as a set of small, independently
          deployable services, each owning its own data, rather than as one large deployable unit.
          Four things define that style, and the rest of this course is really just working out the
          consequences of each one:
        </p>
        <ul className="stepList">
          <li><b>Independently deployable</b> &mdash; a team can ship a change to one service without redeploying any other.</li>
          <li><b>Owns its data</b> &mdash; each service has the only code that reads or writes its own storage; nothing reaches around it into its tables.</li>
          <li><b>Communicates over the network</b> &mdash; services call each other through APIs or messages, never through a shared in-process function call.</li>
          <li><b>Organized around a business capability</b> &mdash; a service like "Billing" or "Shipping" does one cohesive job end to end, rather than one layer (like "the database layer") of every job.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Picture <code>StreamFlix</code>, a video-subscription platform. Instead of one
          application handling accounts, the video catalog, playback, and billing, StreamFlix runs
          it as four services &mdash; <code>AccountService</code>, <code>CatalogService</code>,
          <code>PlaybackService</code>, and <code>BillingService</code> &mdash; each with its own
          database and its own deploy pipeline. When the billing team ships a fix for a failed
          renewal, only <code>BillingService</code> redeploys; catalog browsing and video playback
          are never even touched.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of the StreamFlix platform as four independent services, Account, Catalog, Playback, and Billing, each with its own database, connected only by network calls between them.">
          {["Account","Catalog","Playback","Billing"].map((t,i) => (
            <g key={t}>
              <rect className="boxAccent" x={20 + i*105} y="30" width="90" height="34" rx="6" />
              <text x={65 + i*105} y="51" className="boxText" style={{fontSize:"7.5px"}}>{t}Service</text>
              <rect className="box" x={40 + i*105} y="80" width="50" height="24" rx="5" />
              <text x={65 + i*105} y="96" className="figHint" style={{fontSize:"6px"}}>own DB</text>
              <line className="flowMuted" x1={65 + i*105} y1="64" x2={65 + i*105} y2="78" />
            </g>
          ))}
        </svg>
        <figcaption>Four independently deployable services, each with its own database &mdash; nothing here shares storage or a deploy pipeline.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The most common mistake before you've even started is treating "microservices" as a
          synonym for "small services" &mdash; size is incidental; independence is the point. A
          service that's 200 lines but shares a database with three others isn't a microservice in
          any useful sense, and a service that's 8,000 lines but fully owns its data and deploy
          pipeline is. The second common mistake is assuming every system needs this style from day
          one; the trade-offs involved get their own lesson shortly, and they're real.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A team splits one application into four separate deployables that all still read and write the same shared database. Which of the four defining properties above are they missing?</p>
        </div>
      </section>
      <p className="takeaway">
        A microservice is defined by independence &mdash; in deployment and in data &mdash; not by
        line count. Keep that distinction in mind and most of the confusing terminology in this
        space starts to sort itself out.
      </p>
    </div>
  );
}
