import "../css/Article.css";

export default function StorageSystemsDistributedFileSystemsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A distributed file system (HDFS, Google File System, Amazon EFS) spreads a single
          logical file system across many machines, so a file can be larger than any one disk and
          survive the loss of any one machine.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Large files are split into fixed-size chunks (blocks), and each chunk is stored on
          several different machines. A separate <b>metadata service</b> (the NameNode, in HDFS)
          keeps track of which chunks make up which file and where each chunk's replicas live —
          clients ask the metadata service "where are the chunks for this file," then read or
          write chunks directly from the storage machines that hold them.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Split a large file.</b> A 3GB log file is split into 128MB chunks — roughly 24
            chunks.</li>
          <li><b>Replicate each chunk.</b> Each chunk is written to 3 different machines, so
            losing any one machine loses no data.</li>
          <li><b>Record the map.</b> The metadata service stores "file X = chunks 1-24, chunk 1 is
            on machines A, B, C."</li>
          <li><b>Read in parallel.</b> A client reading the whole file fetches different chunks
            from different machines simultaneously — much faster than one machine serving it all.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 160" role="img" aria-label="Diagram of a metadata service directing a client to the machines holding replicated chunks of a large file split across storage nodes.">
          <rect className="boxAccent" x="190" y="10" width="90" height="30" rx="5" /><text x="235" y="30" className="boxText">metadata svc</text>
          <line className="flow" x1="235" y1="40" x2="235" y2="65" />
          <text x="255" y="55" className="figHint">"chunk 1 → A,B,C"</text>
          <rect className="box" x="60" y="75" width="90" height="30" rx="5" /><text x="105" y="95" className="boxText">node A: chunk1</text>
          <rect className="box" x="185" y="75" width="90" height="30" rx="5" /><text x="230" y="95" className="boxText">node B: chunk1</text>
          <rect className="box" x="310" y="75" width="90" height="30" rx="5" /><text x="355" y="95" className="boxText">node C: chunk1</text>
          <text x="230" y="135" className="figHint" textAnchor="middle">same chunk lives on 3 machines — any one can fail without data loss</text>
        </svg>
        <figcaption>A metadata service tracks chunk locations; storage nodes hold the replicated data itself.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Storing huge numbers of tiny files is a classic anti-pattern for chunk-based distributed
          file systems like HDFS — metadata overhead per file adds up and can overwhelm the
          metadata service. These systems are optimized for large, mostly-append, sequentially-read
          files, not lots of tiny random-access ones.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does splitting a large file into replicated chunks across machines help both durability and read speed?</p>
        </div>
      </section>
      <p className="takeaway">
        Distributed file systems turn "one file, one disk" into "one file, many chunks, many
        machines" — buying scale and fault tolerance at the cost of being tuned for large,
        sequential access rather than lots of small files.
      </p>
    </div>
  );
}
