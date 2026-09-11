import "../css/Article.css";

export default function StorageSystemsBlockVsFileVsObjectStorageArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Block, file, and object storage are three different ways to store and access raw data —
          each one built around a different unit of access, and each a better fit for different
          workloads.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <table className="miniTable">
          <caption>THREE STORAGE MODELS</caption>
          <thead><tr><th>Model</th><th>Unit of access</th><th>Typical use</th></tr></thead>
          <tbody>
            <tr><td>Block</td><td>fixed-size blocks, addressed by number</td><td>database disks, VM volumes</td></tr>
            <tr><td>File</td><td>files in a folder hierarchy</td><td>shared drives, home directories</td></tr>
            <tr><td>Object</td><td>whole objects with metadata, addressed by key</td><td>backups, media, static assets</td></tr>
          </tbody>
        </table>
        <p>
          Block storage is the lowest-level and fastest — the OS or database decides how to
          organize blocks into files or tables. File storage adds a familiar hierarchy (folders,
          paths, permissions) on top. Object storage drops the hierarchy entirely in favor of a
          flat namespace of key → object, each object carrying its own metadata, which is what lets
          it scale to billions of objects across many machines.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Database needs fast, low-level disk access.</b> It attaches a block volume (like
            AWS EBS) and manages its own file layout on top.</li>
          <li><b>Team needs a shared drive.</b> A file share (like NFS) gives them familiar folders
            and file paths, mounted like a local disk.</li>
          <li><b>App needs to store millions of user-uploaded images.</b> Object storage (like S3)
            handles that natively — each image is one object, retrieved by key, with no folder
            depth limits or file-count ceilings to worry about.</li>
          <li><b>Match the model to the access pattern</b> — trying to run a high-transaction
            database directly on object storage, for instance, fights its design instead of using it.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram contrasting block storage as numbered blocks, file storage as a folder hierarchy, and object storage as a flat namespace of keyed objects with metadata.">
          <text x="70" y="18" className="figLabel" textAnchor="middle">BLOCK</text>
          {[0, 1, 2].map((i) => (<rect key={i} className="box" x={20 + i * 34} y="30" width="28" height="28" rx="3" />))}
          <text x="230" y="18" className="figLabel" textAnchor="middle">FILE</text>
          <rect className="box" x="190" y="30" width="80" height="28" rx="4" /><text x="230" y="48" className="boxText">/docs/a.txt</text>
          <text x="380" y="18" className="figLabel" textAnchor="middle">OBJECT</text>
          <rect className="boxAccent" x="330" y="30" width="110" height="28" rx="4" /><text x="385" y="48" className="boxText">key: img-42.jpg</text>
          <text x="230" y="90" className="figHint" textAnchor="middle">same data, three different access models</text>
        </svg>
        <figcaption>Block is raw and low-level; file adds hierarchy; object trades hierarchy for flat, metadata-rich scale.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using object storage for a workload that needs frequent small updates (like a database's
          data files) fights its design — objects are typically replaced whole, not patched
          in-place. Conversely, using file storage for billions of small files runs into real
          scaling limits that object storage was built to avoid.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does object storage's flat, metadata-rich model scale to billions of items more easily than a traditional file hierarchy?</p>
        </div>
      </section>
      <p className="takeaway">
        Pick the storage model by access pattern: block for low-level speed, file for familiar
        hierarchy, object for massive scale with rich metadata.
      </p>
    </div>
  );
}
