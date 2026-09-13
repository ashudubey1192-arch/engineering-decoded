import "../css/Article.css";

export default function DistributedSystemsDistributedLocksArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          When two processes on different machines might otherwise act on the same resource at the
          same time, a distributed lock is what makes sure only one of them proceeds &mdash; a
          single-machine mutex extended across the network.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A distributed lock is typically implemented against a shared, fast store (Redis,
          Zookeeper): a process tries to write a lock key, and only the one that succeeds may
          proceed. Because a process holding the lock can crash without releasing it, locks are
          given a <b>time-to-live</b> so they expire automatically &mdash; trading a small risk of
          the lock expiring too early against the much larger risk of a permanently stuck resource.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A nightly billing job</b> must run on exactly one instance, even though the job
            scheduler runs on every instance of the service.</li>
          <li><b>Each instance tries to acquire a lock key</b> (e.g. <code>lock:billing-job</code>)
            in Redis at the scheduled time.</li>
          <li><b>Only one instance&rsquo;s write succeeds;</b> the rest see the key already exists
            and skip running the job.</li>
          <li><b>The lock has a TTL of, say, 10 minutes.</b> If the winning instance crashes
            mid-job, the lock expires and the job can be safely retried on the next run.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of three instances racing to acquire a lock key in a shared store, with only one instance succeeding and proceeding while the others back off." >
          {[0,1,2].map(i => (<rect key={i} className={i===0?"boxAccent":"box"} x={20 + i*90} y="20" width="70" height="30" rx="5" />))}
          {["wins","skips","skips"].map((t,i) => (<text key={t} x={55 + i*90} y="40" className="boxText" textAnchor="middle" style={{fontSize:"8px"}}>{t}</text>))}
          {[0,1,2].map(i => (<line key={i} className="flow" x1={55 + i*90} y1="50" x2="210" y2="85" />))}
          <rect className="box" x="170" y="88" width="80" height="26" rx="5" /><text x="210" y="105" className="boxText" style={{fontSize:"8px"}}>lock store</text>
        </svg>
        <figcaption>Every instance races for the same lock key; only the winner proceeds, and the lock's TTL protects against it crashing mid-task.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Forgetting a TTL on the lock means a crashed process holds it forever, permanently
          blocking the resource. Setting the TTL shorter than the task actually takes is just as
          dangerous &mdash; the lock can expire and be acquired by a second process while the first
          is still working, defeating the whole point.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a distributed lock need a time-to-live, when a single-machine mutex typically doesn't?</p>
        </div>
      </section>
      <p className="takeaway">
        A distributed lock coordinates access across machines the way a mutex does on one &mdash;
        with the added, unavoidable wrinkle of needing an expiry for when the lock holder disappears.
      </p>
    </div>
  );
}
