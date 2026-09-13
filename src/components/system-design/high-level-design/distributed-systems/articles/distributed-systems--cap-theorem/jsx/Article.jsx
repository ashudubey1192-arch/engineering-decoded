import "../css/Article.css";

export default function DistributedSystemsCapTheoremArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          CAP theorem is the reminder that once a system is split across a network that can fail,
          you cannot have perfect consistency and perfect availability at the same time &mdash; and
          every HLD design implicitly picks a side.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          CAP says a distributed system, during a <b>network partition</b>, must choose between{" "}
          <b>consistency</b> (every node sees the same data, but some requests may be refused) and{" "}
          <b>availability</b> (every request gets a response, but it might be stale). Partitions
          are the trigger &mdash; when the network is healthy, a well-built system can usually give
          both. The practical use of CAP in HLD isn&rsquo;t reciting the theorem; it&rsquo;s
          explicitly stating which side a given piece of data falls on when a partition happens.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="twoCol">
          <div>
            <h3>Inventory count &rarr; consistency-leaning</h3>
            <p>Selling the last unit of stock twice is a real business problem &mdash; during a
              partition, better to refuse the sale than risk overselling.</p>
          </div>
          <div>
            <h3>Product page views &rarr; availability-leaning</h3>
            <p>Showing a slightly stale view count during a partition costs nothing real &mdash;
              better to keep serving the page than show an error.</p>
          </div>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of two data centers split by a network partition, where a consistency-leaning system refuses a request during the split and an availability-leaning system answers it anyway with possibly stale data." >
          <rect className="box" x="20" y="40" width="100" height="34" rx="6" /><text x="70" y="62" className="boxText" style={{fontSize:"9px"}}>Region A</text>
          <rect className="box" x="300" y="40" width="100" height="34" rx="6" /><text x="350" y="62" className="boxText" style={{fontSize:"9px"}}>Region B</text>
          <line className="divider" x1="210" y1="10" x2="210" y2="110" style={{strokeDasharray:"4 4"}} />
          <text x="210" y="20" className="figHint" textAnchor="middle" style={{fontSize:"8px"}}>partition</text>
        </svg>
        <figcaption>When the link between regions breaks, each side must decide: refuse requests, or answer with what it locally has.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating CAP as a fixed, system-wide label (&ldquo;we are a CP system&rdquo;) misses that
          the real decision is made per piece of data. Forgetting that CAP only applies during an
          actual partition &mdash; and that most of the time, a well-designed system gives both
          consistency and availability &mdash; leads to over-engineering for a rare event.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does an inventory count typically lean toward consistency during a partition, while a page view counter typically leans toward availability?</p>
        </div>
      </section>
      <p className="takeaway">
        Use CAP as a prompt to state, out loud, which side each piece of data falls on during a
        partition &mdash; not as a single label for the whole system.
      </p>
    </div>
  );
}
