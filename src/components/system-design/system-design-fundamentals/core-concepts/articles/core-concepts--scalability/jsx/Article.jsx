import "../css/Article.css";

export default function CoreConceptsScalabilityArticle() {
  return (
    <div className="dedicatedStructuredArticle scalabilityArticle">
      <section id="overview">
        <p className="lead">
          Scalability is a system&apos;s ability to keep working well as the amount of work grows.
        </p>
        <p>
          &quot;Work&quot; usually means more users, more requests per second, more data, or bigger
          responses. A scalable system handles that growth by adding resources&mdash;without a rewrite
          and without users noticing a slowdown.
        </p>

        <div className="analogyBox">
          <small>EVERYDAY ANALOGY</small>
          <p>
            Think of a coffee shop. One barista serves 10 customers an hour comfortably. At lunchtime
            200 people show up. You can either give that one barista a faster machine
            (<b>scale up</b>), or add five more baristas and a second counter (<b>scale out</b>).
            Software faces the exact same choice.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Two ways to scale</h2>
        <p>
          Every scaling decision is a mix of these two directions. Knowing which one you are reaching
          for&mdash;and why&mdash;is the core skill.
        </p>

        <figure className="scaleFig">
          <svg viewBox="0 0 640 260" role="img" aria-labelledby="scaleTitle">
            <title id="scaleTitle">
              Vertical scaling makes one machine bigger; horizontal scaling adds more machines.
            </title>

            {/* Vertical scaling */}
            <text className="figLabel" x="120" y="24">
              VERTICAL (scale up)
            </text>
            <rect className="box" x="70" y="150" width="100" height="70" />
            <text className="boxText" x="120" y="190">
              1 server
            </text>
            <rect className="boxAccent" x="255" y="70" width="120" height="150" />
            <text className="boxText" x="315" y="150">
              bigger server
            </text>
            <text className="figHint" x="120" y="245">
              more CPU / RAM
            </text>

            {/* divider */}
            <line className="divider" x1="420" y1="30" x2="420" y2="235" />

            {/* Horizontal scaling */}
            <text className="figLabel" x="530" y="24">
              HORIZONTAL (scale out)
            </text>
            <rect className="boxAccent" x="460" y="150" width="60" height="70" />
            <rect className="boxAccent" x="530" y="150" width="60" height="70" />
            <rect className="boxAccent" x="600" y="150" width="30" height="70" />
            <text className="figHint" x="535" y="245">
              more servers, same size
            </text>
          </svg>
        </figure>

        <div className="defGrid">
          <div>
            <b>Vertical scaling (scale up)</b>
            <p>
              Give one machine more power&mdash;CPU cores, RAM, faster disk. Simple: no code changes.
              But there is a hard ceiling (the biggest machine you can buy) and it is a single point
              of failure.
            </p>
          </div>
          <div>
            <b>Horizontal scaling (scale out)</b>
            <p>
              Add more machines and spread the load across them with a load balancer. Nearly
              unlimited headroom and survives one machine dying&mdash;but the app must be written to
              run as many copies at once (no local state).
            </p>
          </div>
        </div>

        <h2>2. What &quot;scales well&quot; actually means</h2>
        <p>
          A system scales well when adding <i>X%</i> more resources lets it handle roughly{" "}
          <i>X%</i> more load, while latency stays flat. If you double the servers but only get 20%
          more throughput, something (a shared database, a lock, a queue) is the bottleneck.
        </p>

        <div className="conceptDiagram">
          <div>
            <small>LOAD 2&times;</small>
            <b>Requests double</b>
          </div>
          <span>&rarr;</span>
          <div>
            <small>RESOURCES 2&times;</small>
            <b>Servers double</b>
          </div>
          <span>&rarr;</span>
          <div>
            <small>RESULT</small>
            <b>Latency flat</b>
          </div>
        </div>
      </section>

      <section id="example">
        <h2>3. Worked example: a photo-sharing app</h2>
        <p>
          You launch a photo app. It becomes popular. Let&apos;s walk the numbers a fresher can
          reason about on paper.
        </p>

        <pre>
          <code>{`Users            : 1,000,000 daily active
Requests / user  : 20 per day  (feed loads, likes, uploads)
Total requests   : 20,000,000 per day

Per second (avg) : 20,000,000 / 86,400  = ~230 req/s
Peak (x5 spike)  : ~1,150 req/s

One server handles: ~200 req/s comfortably
Servers needed   : 1,150 / 200        = ~6 servers  (+1 spare)`}</code>
        </pre>

        <p>
          One machine cannot do 1,150 req/s, and buying a giant one still leaves you with a single
          point of failure. So we scale <b>out</b>: put a load balancer in front of ~7 identical app
          servers.
        </p>

        <figure className="scaleFig">
          <svg viewBox="0 0 640 240" role="img" aria-labelledby="lbTitle">
            <title id="lbTitle">
              A load balancer spreads incoming traffic across several identical app servers, which
              share one database.
            </title>

            <rect className="box" x="20" y="95" width="90" height="50" />
            <text className="boxText" x="65" y="125">
              Users
            </text>
            <line className="flow" x1="110" y1="120" x2="180" y2="120" />

            <rect className="boxAccent" x="180" y="90" width="110" height="60" />
            <text className="boxText" x="235" y="125">
              Load balancer
            </text>

            <line className="flow" x1="290" y1="115" x2="370" y2="55" />
            <line className="flow" x1="290" y1="120" x2="370" y2="120" />
            <line className="flow" x1="290" y1="125" x2="370" y2="185" />

            <rect className="box" x="370" y="35" width="90" height="40" />
            <text className="boxText" x="415" y="60">
              app #1
            </text>
            <rect className="box" x="370" y="100" width="90" height="40" />
            <text className="boxText" x="415" y="125">
              app #2
            </text>
            <rect className="box" x="370" y="165" width="90" height="40" />
            <text className="boxText" x="415" y="190">
              app #3&hellip;
            </text>

            <line className="flow" x1="460" y1="55" x2="540" y2="115" />
            <line className="flow" x1="460" y1="120" x2="540" y2="120" />
            <line className="flow" x1="460" y1="185" x2="540" y2="125" />

            <rect className="boxAccent" x="540" y="90" width="90" height="60" />
            <text className="boxText" x="585" y="125">
              Database
            </text>
          </svg>
        </figure>

        <div className="articleCallout">
          <span>NOTICE</span>
          <p>
            The database is now shared by every app server&mdash;it is the next bottleneck. That is
            why later lessons cover read replicas, caching, and sharding.
          </p>
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Storing state on the server</h3>
            <p>
              Keeping a user&apos;s session or uploaded file on one machine breaks the moment the
              load balancer sends their next request elsewhere. Push state to a shared store.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Scaling app servers, ignoring the DB</h3>
            <p>
              Ten app servers all hammering one database just moves the queue. Measure where time is
              actually spent before adding machines.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Designing for 1000&times; on day one</h3>
            <p>
              Over-engineering for imaginary scale wastes time and adds failure modes. Scale when the
              numbers say so, and make it easy to scale later.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Your app runs on one large server at 70% CPU and traffic is growing 15% per month. Would
            you scale up or scale out, and what one change to the code would you make first to keep
            that option open?
          </p>
        </div>
      </section>
    </div>
  );
}
