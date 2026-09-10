import "../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsConsistencyModelsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Once data is copied to more than one machine, a consistency model is the rule for{" "}
          <i>when</i> readers are guaranteed to see the latest write.
        </p>
        <p>
          Copies exist for speed and safety (replicas near users, backups of data). The catch: a
          write reaches them one at a time, so for a short window different replicas hold different
          values.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You update your profile photo. A friend in another country still sees the old one for a
            few seconds &mdash; annoying but fine. Now imagine that lag on your <b>bank balance</b>:
            you withdraw twice because both ATMs read the pre-withdrawal amount. Same mechanism, very
            different acceptable answer. The model you pick depends on the data.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Why replicas disagree</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 180" role="img" aria-labelledby="consTitle">
            <title id="consTitle">
              A write goes to the primary, replicates to a follower after a short delay; a read from
              the follower during that delay sees the old value.
            </title>
            <rect className="box" x="20" y="70" width="80" height="44" />
            <text className="boxText" x="60" y="97">
              Client
            </text>
            <line className="flow" x1="100" y1="82" x2="170" y2="62" />
            <text className="figHint" x="130" y="52">
              write x=5
            </text>
            <rect className="boxAccent" x="170" y="40" width="120" height="46" />
            <text className="boxText" x="230" y="68">
              Primary x=5
            </text>
            <line className="flowMuted" x1="290" y1="63" x2="400" y2="63" />
            <text className="figHint" x="345" y="53">
              replication lag
            </text>
            <rect className="boxWarn" x="400" y="40" width="120" height="46" />
            <text className="boxText" x="460" y="68">
              Follower x=4
            </text>
            <line className="flow" x1="100" y1="100" x2="400" y2="120" />
            <text className="figHint" x="250" y="140">
              read &rarr; still sees x=4
            </text>
          </svg>
          <figcaption>
            The window between &quot;write accepted&quot; and &quot;every replica updated&quot; is
            where consistency models differ.
          </figcaption>
        </figure>

        <h2>2. The main models</h2>
        <table className="miniTable">
          <caption>FROM STRICTEST TO LOOSEST</caption>
          <thead>
            <tr>
              <th>Model</th>
              <th>Guarantee</th>
              <th>Cost</th>
              <th>Good for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Strong</td>
              <td>Every read sees the most recent write, always</td>
              <td>Higher latency, lower availability</td>
              <td>Balances, inventory, bookings</td>
            </tr>
            <tr>
              <td>Read-your-writes</td>
              <td>You always see your own updates (others may lag)</td>
              <td>Sticky routing or cache tricks</td>
              <td>Editing your profile / settings</td>
            </tr>
            <tr>
              <td>Monotonic reads</td>
              <td>You never see time go backwards</td>
              <td>Pin a user to one replica</td>
              <td>Feeds, comment threads</td>
            </tr>
            <tr>
              <td>Eventual</td>
              <td>All replicas converge &quot;soon&quot; if writes stop</td>
              <td>Cheapest, fastest, most available</td>
              <td>Like counts, view counts, DNS</td>
            </tr>
          </tbody>
        </table>

        <h2>3. The trade-off (CAP, briefly)</h2>
        <p>
          When replicas cannot talk to each other (a network partition), a system must choose: reject
          requests to stay <b>consistent</b>, or keep serving with possibly-stale data to stay{" "}
          <b>available</b>. You cannot have both during the partition. Strong-consistency stores lean
          one way; eventually-consistent stores lean the other.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: picking a model per feature</h2>
        <ol className="stepList">
          <li>
            <b>Follower count on a profile.</b> Off by 3 for a few seconds? Nobody cares &rarr;{" "}
            <b>eventual</b>.
          </li>
          <li>
            <b>&quot;Seats left&quot; on a flight.</b> Selling the same seat twice is a real problem
            &rarr; <b>strong</b> for the final booking step.
          </li>
          <li>
            <b>Your own draft post.</b> You must see your edits immediately even if others do not
            &rarr; <b>read-your-writes</b>.
          </li>
          <li>
            <b>A chat conversation.</b> Messages must not appear, vanish, then reappear &rarr;{" "}
            <b>monotonic reads</b> at minimum.
          </li>
        </ol>
        <div className="takeaway">
          Most real systems are a mix: strong consistency on the few operations that touch money or
          inventory, eventual everywhere else.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Assuming the database is strong everywhere</h3>
            <p>
              Read replicas lag. If your app reads from a replica right after writing to the primary,
              it can read its own stale data.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Strong consistency for everything</h3>
            <p>
              It is the slowest and least available option. Paying that cost on like-counts throws
              away performance for a guarantee nobody needed.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Ignoring the partition case</h3>
            <p>
              &quot;It works in testing&quot; because the network was perfect. Decide now what
              happens when replicas cannot reach each other.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            An e-commerce site shows &quot;12 people are viewing this&quot; and also &quot;3 units in
            stock&quot;. Which needs strong consistency and which is fine with eventual, and why?
          </p>
        </div>
      </section>
    </div>
  );
}
