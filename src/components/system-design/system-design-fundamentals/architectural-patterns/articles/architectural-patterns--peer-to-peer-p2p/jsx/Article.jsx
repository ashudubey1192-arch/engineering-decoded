import "../css/Article.css";

export default function ArchitecturalPatternsPeerToPeerP2pArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          In a peer-to-peer architecture, participants (peers) talk directly to each other instead
          of going through a central server — every peer can act as both client and server. BitTorrent
          and many blockchain networks are built this way.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          There's no single central server that must stay up for the system to function — peers
          find each other (often via a smaller discovery mechanism) and exchange data directly. This
          removes a single point of failure and lets total capacity grow as more peers join (each
          new peer adds resources, not just demand). The trade-off is coordination: there's no
          central authority to resolve conflicts, enforce consistency, or guarantee any peer is
          honest or even online.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A file is split into pieces.</b> A large file is broken into chunks, each
            identified by a hash.</li>
          <li><b>Peers discover each other.</b> A tracker or DHT tells a new peer which other peers
            already have pieces of the file.</li>
          <li><b>Peers exchange pieces directly.</b> Downloaders fetch different pieces from
            different peers simultaneously, and also upload pieces they already have to others.</li>
          <li><b>Capacity grows with demand.</b> More downloaders means more upload sources too —
            unlike a central server that gets more overloaded as more clients connect.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 160" role="img" aria-label="Diagram of five peers connected directly to each other in a mesh, exchanging data without a central server.">
          {[[200, 20], [80, 70], [320, 70], [120, 140], [280, 140]].map(([x, y], i) => (
            <circle key={i} className={i === 0 ? "boxAccent" : "box"} cx={x} cy={y} r="22" />
          ))}
          <line className="flowMuted" x1="200" y1="20" x2="80" y2="70" /><line className="flowMuted" x1="200" y1="20" x2="320" y2="70" />
          <line className="flowMuted" x1="80" y1="70" x2="120" y2="140" /><line className="flowMuted" x1="320" y1="70" x2="280" y2="140" />
          <line className="flowMuted" x1="120" y1="140" x2="280" y2="140" /><line className="flowMuted" x1="80" y1="70" x2="320" y2="70" />
          <text x="200" y="26" className="boxText" textAnchor="middle">peer</text>
        </svg>
        <figcaption>Every peer connects to others directly — no central server in the data path.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming P2P automatically means "no infrastructure needed" ignores that most real P2P
          systems still need some discovery/bootstrapping mechanism (a tracker, a DHT seed list).
          Trusting peer-supplied data without verification (like checksums) also opens the door to
          corrupted or malicious data from an untrusted peer.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a peer-to-peer system's capacity tend to grow with demand, unlike a traditional client-server system?</p>
        </div>
      </section>
      <p className="takeaway">
        P2P removes the central server as a bottleneck and single point of failure, trading it for
        the harder problem of coordinating and trusting a set of independent, possibly-unreliable
        peers.
      </p>
    </div>
  );
}
