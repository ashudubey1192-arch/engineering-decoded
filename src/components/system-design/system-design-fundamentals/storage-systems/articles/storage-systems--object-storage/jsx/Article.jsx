import "../css/Article.css";

export default function StorageSystemsObjectStorageArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Object storage (Amazon S3, Google Cloud Storage, Azure Blob) stores data as immutable
          objects in a flat namespace, each identified by a key and described by metadata — the
          default choice for durable storage of unstructured data at scale.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Every object is written as a whole and read as a whole — there's no "open file, seek to
          byte 500, overwrite 10 bytes" the way a filesystem allows. To change an object, you
          upload a new version. That simplicity is exactly what makes object storage easy to
          replicate across machines and data centers for durability, and easy to scale
          horizontally, since there's no shared directory tree that every write has to coordinate
          through.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <div className="scenarioBox">
          <small>SCENARIO</small>
          <p>A photo-sharing app needs to store and serve 500 million user photos durably and cheaply.</p>
        </div>
        <ol className="stepList">
          <li><b>Upload.</b> Each photo is PUT to a bucket with a unique key, like{" "}
            <code>users/42/photo-9183.jpg</code>.</li>
          <li><b>Replicate automatically.</b> The storage service copies the object across
            multiple disks and availability zones behind the scenes.</li>
          <li><b>Serve directly.</b> Photos are fetched straight from object storage (often via a
            CDN in front of it) — the application server doesn't sit in the data path.</li>
          <li><b>Update means replace.</b> Editing a photo's caption in its metadata doesn't
            rewrite the image bytes; changing the image itself uploads a new object.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a client uploading an object which is then replicated across three separate disks for durability.">
          <rect className="boxAccent" x="20" y="45" width="90" height="30" rx="5" /><text x="65" y="65" className="boxText">PUT object</text>
          <line className="flow" x1="110" y1="60" x2="160" y2="60" />
          <rect className="box" x="170" y="15" width="80" height="26" rx="4" /><text x="210" y="33" className="boxText">disk / AZ 1</text>
          <rect className="box" x="170" y="47" width="80" height="26" rx="4" /><text x="210" y="65" className="boxText">disk / AZ 2</text>
          <rect className="box" x="170" y="79" width="80" height="26" rx="4" /><text x="210" y="97" className="boxText">disk / AZ 3</text>
          <text x="330" y="60" className="figHint">replicated for durability</text>
        </svg>
        <figcaption>One upload, replicated behind the scenes — the client never manages the copies directly.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Expecting strong read-after-write consistency everywhere without checking the specific
          service's guarantees can surprise you — some object stores historically offered only
          eventual consistency for certain operations. Storing huge numbers of tiny objects without
          considering request-cost pricing (many stores charge per request) can also get expensive
          fast compared to batching.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does treating objects as immutable (replace, don't edit in place) make an object store easier to scale and replicate?</p>
        </div>
      </section>
      <p className="takeaway">
        Object storage's simplicity — whole-object writes, flat namespace, rich metadata — is
        exactly what lets it scale to massive, durable, low-cost storage.
      </p>
    </div>
  );
}
