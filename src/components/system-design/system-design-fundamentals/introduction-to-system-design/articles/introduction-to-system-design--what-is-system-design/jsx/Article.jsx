import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function IntroductionToSystemDesignWhatIsSystemDesignArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          System design is the process of deciding how a software system should be structured so it
          actually holds up at the scale it needs to run at &mdash; not just &quot;does it work&quot;,
          but &quot;does it work for a million users, at 3 AM, when a server dies?&quot;
        </p>
        <p>
          Anyone can draw boxes and arrows. System design is being able to explain <i>why</i> each
          box exists, what happens when one of them fails, and what you gave up to gain what you
          got &mdash; because every choice is a trade-off, not a rule.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Two engineers are both asked to design &quot;a URL shortener.&quot; One draws a web
            server and a database and calls it done. The other asks: how many links a day, how long
            do they need to work, can two people get the same short code, what happens if the
            database goes down for a minute? Same feature, completely different depth &mdash; and the
            second answer is what system design actually means.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. It is trade-offs, not templates</h2>
        <p>
          There is no single correct architecture for &quot;a chat app&quot; or &quot;an e-commerce
          site.&quot; The right design depends on constraints: how many users, how much money, how
          much downtime is acceptable, how fresh the data must be. Change the constraints and the
          right answer changes too &mdash; that is the whole discipline.
        </p>

        <h2>2. The five-step loop</h2>
        <p>
          Instead of jumping straight to &quot;we need Kafka and Redis&quot;, experienced designers
          repeat a simple loop:
        </p>
        <figure className="fig">
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="loopTitle">
            <title id="loopTitle">
              Five steps in a loop: clarify requirements, estimate scale, start simple, find the
              bottleneck, then explain the trade-off, repeating as the design grows.
            </title>
            <rect className="boxAccent" x="10" y="55" width="110" height="46" />
            <text className="boxText" x="65" y="75">
              1. Clarify
            </text>
            <text className="boxText" x="65" y="91">
              requirements
            </text>
            <line className="flow" x1="120" y1="78" x2="150" y2="78" />
            <rect className="box" x="150" y="55" width="100" height="46" />
            <text className="boxText" x="200" y="75">
              2. Estimate
            </text>
            <text className="boxText" x="200" y="91">
              the scale
            </text>
            <line className="flow" x1="250" y1="78" x2="280" y2="78" />
            <rect className="box" x="280" y="55" width="90" height="46" />
            <text className="boxText" x="325" y="75">
              3. Start
            </text>
            <text className="boxText" x="325" y="91">
              simple
            </text>
            <line className="flow" x1="370" y1="78" x2="400" y2="78" />
            <rect className="box" x="400" y="55" width="110" height="46" />
            <text className="boxText" x="455" y="75">
              4. Find the
            </text>
            <text className="boxText" x="455" y="91">
              bottleneck
            </text>
            <line className="flow" x1="510" y1="78" x2="540" y2="78" />
            <rect className="boxAccent" x="540" y="55" width="90" height="46" />
            <text className="boxText" x="585" y="75">
              5. Explain
            </text>
            <text className="boxText" x="585" y="91">
              the trade-off
            </text>
            <text className="figHint" x="320" y="130">
              repeat 3&ndash;5 as new requirements or scale show up
            </text>
          </svg>
          <figcaption>
            You almost never do this once. Real designs loop through &quot;add complexity &rarr;
            justify it&quot; several times.
          </figcaption>
        </figure>

        <h2>3. The pieces you will keep reusing</h2>
        <p>
          Most systems, big or small, are built from the same small set of parts, combined
          differently:
        </p>
        <ul>
          <li>
            <b>Clients</b> that send requests &mdash; browsers, apps, other services.
          </li>
          <li>
            <b>APIs</b> that define what a client is allowed to ask for.
          </li>
          <li>
            <b>Load balancers</b> that spread requests across many servers.
          </li>
          <li>
            <b>Application servers</b> that run the actual business logic.
          </li>
          <li>
            <b>Caches</b> that keep hot data close and fast.
          </li>
          <li>
            <b>Databases</b> that store data durably.
          </li>
          <li>
            <b>Message queues</b> that let services hand off work without waiting on each other.
          </li>
          <li>
            <b>Observability</b> &mdash; logs, metrics, alerts &mdash; so you know when something
            breaks.
          </li>
        </ul>
        <p>
          Not every system needs every piece. A personal blog does not need a message queue; a
          payments platform almost certainly does.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: designing &quot;a URL shortener&quot;, the right way</h2>
        <ol className="stepList">
          <li>
            <b>Clarify requirements.</b> Users can shorten a URL and share it; visiting the short link
            redirects to the original. Reads will vastly outnumber writes.
          </li>
          <li>
            <b>Estimate the scale.</b> Say 10M new links a month and 500M redirects a month &mdash;
            roughly 200 redirects/second on average, more at peak. That single number already rules
            out &quot;one small server&quot;.
          </li>
          <li>
            <b>Start simple.</b> One web server, one database table mapping short code &rarr; long
            URL. This works and is worth saying out loud &mdash; it is your baseline.
          </li>
          <li>
            <b>Find the bottleneck.</b> At 200+ redirects/second, hitting the database on every single
            redirect is wasteful and risky if it goes down.
          </li>
          <li>
            <b>Explain the trade-off.</b> Add a cache in front of the database for redirects. You gain
            speed and resilience; you give up instant consistency if a link&apos;s target is ever
            changed &mdash; a trade-off you can defend because you know the numbers behind it.
          </li>
        </ol>
        <div className="takeaway">
          Notice what did <i>not</i> happen: nobody reached for a specific technology first. The
          requirements and the scale decided what was needed; the technology came last.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Designing for imaginary scale</h3>
            <p>
              Adding sharding and multi-region replication for an app with 500 users burns time and
              adds failure points nobody needed yet.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Naming technologies instead of reasoning</h3>
            <p>
              &quot;We&apos;ll use Kafka&quot; is not a design. <i>Why</i> a queue, <i>why</i> that
              one, and what it costs you is the actual answer.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Never stating assumptions</h3>
            <p>
              Two designs can both be &quot;correct&quot; for different assumed scale. Say your
              numbers out loud so the trade-offs make sense to anyone reviewing them.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A friend says &quot;the right way to design a chat app is with microservices and
            Kafka.&quot; What two questions would you ask before agreeing or disagreeing with them?
          </p>
        </div>
      </section>
    </div>
  );
}
