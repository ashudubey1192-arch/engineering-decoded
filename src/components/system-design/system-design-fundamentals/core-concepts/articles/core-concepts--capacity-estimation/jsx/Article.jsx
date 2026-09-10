import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsCapacityEstimationArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Capacity estimation is working out &mdash; before you build &mdash; roughly how many
          requests per second, how much storage, and how much bandwidth a system will need.
        </p>
        <p>
          The goal is not a precise number. It is an order of magnitude: is this &quot;one small
          server&quot; or &quot;a fleet plus a CDN&quot;? That answer shapes every later decision.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            In an interview you are asked to design a Twitter-like feed. Before drawing anything, you
            say: &quot;300M daily users, each opens the app 5 times, each open loads 20 tweets &mdash;
            that is 30B feed reads a day, about 350k reads/second average, ~1M at peak.&quot; Now
            everyone knows caching is not optional. That 60-second calculation set the whole design.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The estimation recipe</h2>
        <ol className="stepList">
          <li>
            <b>Start with users.</b> Daily Active Users (DAU). If given monthly, assume DAU &asymp;
            MAU / 3.
          </li>
          <li>
            <b>Actions per user per day.</b> How many reads and writes does one user generate?
          </li>
          <li>
            <b>Read : write ratio.</b> Most consumer apps are read-heavy (often 100:1 or more).
          </li>
          <li>
            <b>Convert to per-second.</b> Divide daily totals by ~86,400 (&asymp; 10<sup>5</sup>).
          </li>
          <li>
            <b>Apply a peak factor.</b> Traffic is not flat &mdash; multiply the average by 2&ndash;5
            for peak.
          </li>
          <li>
            <b>Storage.</b> bytes per item &times; items per day &times; retention period. Add
            replication (&times;3) and metadata / indexes.
          </li>
          <li>
            <b>Bandwidth.</b> response size &times; requests per second, in and out.
          </li>
          <li>
            <b>Add headroom.</b> Size for ~2&times; your peak so a spike does not tip you over.
          </li>
        </ol>

        <figure className="fig">
          <svg viewBox="0 0 640 160" role="img" aria-labelledby="capTitle">
            <title id="capTitle">
              Users multiply into daily actions, which divide into a per-second rate, which divides
              into a server count.
            </title>
            <rect className="boxAccent" x="20" y="60" width="120" height="44" />
            <text className="boxText" x="80" y="87">
              10M DAU
            </text>
            <line className="flow" x1="140" y1="82" x2="190" y2="82" />
            <rect className="boxAccent" x="190" y="60" width="130" height="44" />
            <text className="boxText" x="255" y="80">
              &times;20 actions
            </text>
            <text className="boxText" x="255" y="96">
              = 200M/day
            </text>
            <line className="flow" x1="320" y1="82" x2="370" y2="82" />
            <rect className="boxAccent" x="370" y="60" width="120" height="44" />
            <text className="boxText" x="430" y="80">
              &divide; 86,400
            </text>
            <text className="boxText" x="430" y="96">
              &asymp; 2.3k/s
            </text>
            <line className="flow" x1="490" y1="82" x2="540" y2="82" />
            <rect className="box" x="540" y="60" width="90" height="44" />
            <text className="boxText" x="585" y="80">
              &times;5 peak
            </text>
            <text className="boxText" x="585" y="96">
              &asymp; 12k/s
            </text>
          </svg>
          <figcaption>Every capacity number is this same chain: multiply out, then divide down.</figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>2. Worked example: a photo-sharing service</h2>
        <pre>
          <code>{`ASSUMPTIONS
  DAU                 = 10,000,000
  photos uploaded/day = 2 per user        -> 20,000,000 writes/day
  photos viewed/day   = 100 per user      -> 1,000,000,000 reads/day
  avg photo size      = 300 KB (after compression)
  metadata per photo  = 1 KB
  retention           = 5 years
  replication factor  = 3

REQUEST RATE
  writes/s (avg) = 20,000,000 / 86,400        ~= 230 /s
  reads/s  (avg) = 1,000,000,000 / 86,400     ~= 11,600 /s
  peak (x4)      : writes ~1k/s, reads ~46k/s   -> reads dominate, cache them

STORAGE (5 years)
  photos/year   = 20,000,000 x 365            ~= 7.3 billion
  photos/5yr    ~= 36.5 billion
  raw bytes     = 36.5e9 x 300 KB             ~= 11 PB
  + metadata    = 36.5e9 x 1 KB               ~= 36 TB (negligible)
  x replication (3)                           ~= 33 PB total

BANDWIDTH (egress)
  peak reads x photo size = 46,000 x 300 KB   ~= 13.8 GB/s  -> needs a CDN`}</code>
        </pre>
        <div className="takeaway">
          Two conclusions fell out for free: reads are ~50&times; writes so a cache + CDN is
          mandatory, and 33 PB means object storage (like S3), never a single database.
        </div>
      </section>

      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Forgetting the peak factor</h3>
            <p>
              Sizing for the daily average means you are under-provisioned every lunchtime and every
              evening. Always design for peak.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Counting only the payload</h3>
            <p>
              Replication (&times;3), indexes, backups, and logs often double or triple the storage
              of the raw data.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>False precision</h3>
            <p>
              &quot;11,573,922 requests&quot; pretends the inputs were exact. Round aggressively
              &mdash; &quot;~12M&quot; &mdash; and move on.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>
            A chat app has 5M DAU sending 40 messages/day, each ~200 bytes, kept for 1 year with 3&times;
            replication. Estimate the write rate per second and the yearly storage.
          </p>
        </div>
      </section>
    </div>
  );
}
