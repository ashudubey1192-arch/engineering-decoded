import "../css/Article.css";

export default function DataStructuresForScaleCuckooFilterArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A Cuckoo filter answers the same "have I seen this" question as a Bloom filter, with a
          similar small false-positive rate — but unlike a Bloom filter, it supports deleting
          items, and it's often more space-efficient at low target error rates.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Instead of setting scattered bits across one big array, a Cuckoo filter stores a small
          "fingerprint" of each item in one of a small number of candidate buckets (usually two),
          derived from hashing. If both an item's candidate buckets are full when inserting, the
          filter "kicks out" (cuckoos) an existing fingerprint to its own alternate bucket, freeing
          space — hence the name, after cuckoo birds that displace other eggs from a nest. Because
          each item's fingerprint lives in one identifiable slot, that specific slot can simply be
          cleared to delete it — something a Bloom filter's shared, overlapping bits can't safely
          support.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Insert item X.</b> Hash it to find 2 candidate buckets; if either has space,
            store X's fingerprint there.</li>
          <li><b>Both candidate buckets are full.</b> Pick one, evict its existing fingerprint,
            place X there instead.</li>
          <li><b>Relocate the evicted fingerprint</b> to its own alternate bucket — possibly
            triggering another eviction, cascading a few times until everything settles.</li>
          <li><b>Delete an item later.</b> Hash it to find its fingerprint's bucket, and simply
            remove it — a straightforward operation a Bloom filter can't safely offer.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 130" role="img" aria-label="Diagram of a new item being inserted into a full bucket by evicting an existing fingerprint, which then relocates to its own alternate bucket." >
          <rect className="box" x="30" y="35" width="90" height="50" rx="5" />
          <text x="75" y="55" className="boxText" textAnchor="middle">bucket 1</text><text x="75" y="72" className="figHint" textAnchor="middle">[A][B]</text>
          <line className="flow" x1="120" y1="60" x2="170" y2="60" /><text x="145" y="50" className="figHint">insert X → evict A</text>
          <rect className="boxAccent" x="30" y="35" width="90" height="50" rx="5" style={{opacity:0}} />
          <rect className="box" x="300" y="35" width="90" height="50" rx="5" />
          <text x="345" y="55" className="boxText" textAnchor="middle">bucket 2</text><text x="345" y="72" className="figHint" textAnchor="middle">[C][A]</text>
          <line className="flow" x1="180" y1="60" x2="290" y2="60" /><text x="235" y="50" className="figHint">A relocates here</text>
        </svg>
        <figcaption>A full bucket evicts an existing fingerprint to its alternate location, making room for the new item.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Filling a Cuckoo filter too close to capacity causes eviction chains to get long or fail
          outright, degrading insert performance sharply — they're typically kept under roughly
          95% load for reliable performance. Assuming it's a strict upgrade over a Bloom filter in
          every case also isn't quite right — the best choice depends on the specific target
          false-positive rate and whether deletion is actually needed.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can a Cuckoo filter support deleting an item safely, when a Bloom filter generally cannot?</p>
        </div>
      </section>
      <p className="takeaway">
        Cuckoo filters answer the same membership question as Bloom filters but store identifiable
        fingerprints instead of shared bits — adding safe deletion, often at better space
        efficiency for low error rates.
      </p>
    </div>
  );
}
