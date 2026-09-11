import "../css/Article.css";

export default function ConsensusAndCoordinationPaxosAlgorithmArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Paxos is the original, rigorously-proven consensus algorithm — famous for being provably
          correct and famously hard to understand and implement, which is a big part of why Raft
          (next article) was later designed as a more approachable alternative.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Paxos works in two phases. In the <b>prepare</b> phase, a proposer asks a majority of
          nodes (acceptors) "will you promise not to accept any proposal older than mine?" — if a
          majority promises, the proposer moves to the <b>accept</b> phase, asking that same
          majority to actually accept its value. Because any two majorities must overlap, it's
          impossible for two different values to both be accepted by a majority — that overlap is
          the whole safety argument.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Proposer picks a proposal number</b> higher than any it's seen, and sends
            "prepare" to all acceptors.</li>
          <li><b>Acceptors promise.</b> A majority reply "promise — we won't accept anything
            numbered lower than yours."</li>
          <li><b>Proposer sends "accept"</b> with its value to that same majority.</li>
          <li><b>Majority accepts.</b> Once a majority has accepted the value, it's permanently
            chosen — any future proposal, even from a different proposer, is required to
            discover and preserve that already-chosen value.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of the two-phase Paxos protocol: a prepare phase gathering promises from a majority of acceptors, followed by an accept phase where that majority accepts the proposed value.">
          <text x="110" y="18" className="figLabel" textAnchor="middle">PHASE 1: PREPARE</text>
          <rect className="boxAccent" x="30" y="30" width="90" height="28" rx="4" /><text x="75" y="48" className="boxText">proposer</text>
          <line className="flow" x1="120" y1="44" x2="170" y2="30" /><line className="flow" x1="120" y1="44" x2="170" y2="58" />
          <rect className="box" x="180" y="15" width="70" height="24" rx="4" /><text x="215" y="31" className="boxText">acceptor</text>
          <rect className="box" x="180" y="50" width="70" height="24" rx="4" /><text x="215" y="66" className="boxText">acceptor</text>
          <text x="330" y="18" className="figLabel" textAnchor="middle">PHASE 2: ACCEPT</text>
          <rect className="boxAccent" x="280" y="90" width="90" height="28" rx="4" /><text x="325" y="108" className="boxText">proposer</text>
          <line className="flow" x1="370" y1="104" x2="410" y2="90" style={{ opacity: 0 }} />
          <text x="325" y="135" className="figHint" textAnchor="middle">same majority accepts the value → chosen</text>
        </svg>
        <figcaption>Prepare gathers promises from a majority; accept commits the value with that same majority.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Implementing "basic Paxos" naively without addressing liveness (dueling proposers can
          livelock, each interrupting the other indefinitely) is a well-known trap — real systems
          add a stable leader or randomized backoff to avoid it. Paxos's reputation for
          complexity also means many teams should default to a mature existing implementation
          rather than writing their own from the paper.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why must a proposer's "accept" phase target the same majority (or a majority overlapping it) that promised in the "prepare" phase?</p>
        </div>
      </section>
      <p className="takeaway">
        Paxos proves that safe consensus is achievable through majority overlap alone — its
        difficulty to implement correctly is exactly what later motivated Raft's design.
      </p>
    </div>
  );
}
