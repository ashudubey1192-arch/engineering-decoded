import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsCapTheoremArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          The CAP theorem says that when a distributed system hits a network partition, it must
          choose between <b>consistency</b> and <b>availability</b> &mdash; it cannot keep both.
        </p>
        <p>
          The three letters: <b>C</b>onsistency (every read sees the latest write),{" "}
          <b>A</b>vailability (every request gets a non-error response), <b>P</b>artition tolerance
          (the system keeps working when the network between nodes breaks).
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Your database has a node in Mumbai and a node in Frankfurt. The undersea link between
            them drops for 40 seconds. A user in Frankfurt writes a new value. A user in Mumbai now
            reads the same record. You have two choices: give Mumbai the <b>old</b> value (stay
            available, break consistency) or make Mumbai <b>wait / error</b> until the link is back
            (stay consistent, break availability). There is no third option.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Partitions are not optional</h2>
        <p>
          Networks fail: cables cut, switches reboot, packets drop. Any system spread across machines
          <b> will</b> experience partitions. So P is not really a choice &mdash; the real decision
          is <b>&quot;when a partition happens, are we CP or AP?&quot;</b>
        </p>
        <figure className="fig">
          <svg viewBox="0 0 640 200" role="img" aria-labelledby="capTitle">
            <title id="capTitle">
              During a network partition, a CP system rejects requests to stay consistent; an AP
              system answers with possibly-stale data to stay available.
            </title>
            <rect className="box" x="60" y="80" width="90" height="44" />
            <text className="boxText" x="105" y="107">
              Node A
            </text>
            <line className="flowMuted" x1="150" y1="102" x2="260" y2="102" />
            <text className="figHint" x="205" y="92">
              partition
            </text>
            <text className="figHint" x="205" y="122">
              (link down)
            </text>
            <rect className="box" x="260" y="80" width="90" height="44" />
            <text className="boxText" x="305" y="107">
              Node B
            </text>

            <line className="divider" x1="390" y1="20" x2="390" y2="180" />
            <text className="figLabel" x="480" y="34">
              CP: reject / wait
            </text>
            <rect className="boxWarn" x="420" y="50" width="140" height="34" />
            <text className="boxText" x="490" y="72">
              error, stay correct
            </text>
            <text className="figLabel" x="480" y="120">
              AP: answer anyway
            </text>
            <rect className="boxAccent" x="420" y="136" width="140" height="34" />
            <text className="boxText" x="490" y="158">
              stale, stay up
            </text>
          </svg>
          <figcaption>
            Outside a partition you can have both C and A. The trade-off only bites during the
            partition window.
          </figcaption>
        </figure>

        <h2>2. CP vs AP in practice</h2>
        <table className="miniTable">
          <caption>WHICH SIDE DO POPULAR STORES PICK?</caption>
          <thead>
            <tr>
              <th>Choice</th>
              <th>Behaviour on partition</th>
              <th>Examples</th>
              <th>Good for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CP</td>
              <td>Minority side stops serving to avoid split-brain</td>
              <td>ZooKeeper, etcd, HBase, Spanner</td>
              <td>Locks, config, balances, inventory</td>
            </tr>
            <tr>
              <td>AP</td>
              <td>Every node keeps answering; reconcile later</td>
              <td>Cassandra, DynamoDB, Riak</td>
              <td>Carts, feeds, metrics, session data</td>
            </tr>
          </tbody>
        </table>

        <h2>3. PACELC: the fuller picture</h2>
        <p>
          CAP only talks about partitions. <b>PACELC</b> adds: <i>else</i> (no partition), a system
          still trades <b>latency</b> vs <b>consistency</b>. Waiting for every replica to confirm a
          write is consistent but slow; replying after one replica is fast but may be stale.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: choosing per feature</h2>
        <ol className="stepList">
          <li>
            <b>Bank account balance.</b> Showing stale money or allowing a double-spend is
            unacceptable &rarr; <b>CP</b>: refuse the operation during a partition.
          </li>
          <li>
            <b>Shopping cart.</b> A user must always be able to add items; a briefly out-of-sync cart
            can be merged later &rarr; <b>AP</b>.
          </li>
          <li>
            <b>Leader election / distributed lock.</b> Two leaders = disaster &rarr; <b>CP</b>: only
            the majority side may elect.
          </li>
          <li>
            <b>View counter / like count.</b> Off by a few for a minute is invisible &rarr; <b>AP</b>,
            reconcile by summing later.
          </li>
        </ol>
        <div className="takeaway">
          &quot;Pick 2 of 3&quot; is a myth &mdash; P is forced on you. The honest statement is:
          during a partition, are you CP (consistent, some downtime) or AP (available, some
          staleness)?
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>&quot;We chose CA&quot;</h3>
            <p>
              A single-node database is CA, but the moment you replicate across machines, partitions
              are possible and CA is off the table.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>One choice for the whole system</h3>
            <p>
              Real products mix CP for money/locks and AP for everything else. The decision is
              per-operation, not per-company.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Ignoring the non-partition case</h3>
            <p>
              Most of the time there is no partition &mdash; and you are still trading latency for
              consistency (PACELC). Tune replica acknowledgements deliberately.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A ride-hailing app needs (a) a distributed lock so one driver gets one ride, and (b) a
            live count of nearby drivers on the map. Classify each as CP or AP and justify it in one
            sentence.
          </p>
        </div>
      </section>
    </div>
  );
}
