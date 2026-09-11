import "../css/Article.css";

export default function DistributedSystemsFundamentalsChallengesOfDistributionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A distributed system is a set of independent machines that must work together and appear
          as one coherent system — and that coordination introduces problems that simply don't
          exist when everything runs in one process on one machine.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          On a single machine, function calls are fast and reliable, memory is shared, and there's
          one clock. Across machines, none of that holds: the network can be slow, drop messages,
          or partition entirely; each machine has its own clock that drifts relative to others;
          and any machine can fail independently of the rest. Distributed systems design is largely
          about building correct, available systems despite these facts, not pretending they don't
          exist.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A single-machine app "just works."</b> A function call either returns a result or
            throws immediately — there's no in-between.</li>
          <li><b>Split it across two machines.</b> Now that same call goes over a network — it can
            succeed, fail, or hang with no way for the caller to tell "it failed" from "it's just
            slow."</li>
          <li><b>A message is lost.</b> Did the recipient never receive it, or receive it and
            crash before replying? From the sender's side, these look identical.</li>
          <li><b>Design around it.</b> Real systems use timeouts, retries with idempotency, and
            replication specifically because these failure modes are unavoidable, not because of
            sloppy code.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting a single-process function call that is fast and reliable against a network call between two machines that can succeed, fail, or hang ambiguously.">
          <text x="100" y="18" className="figLabel" textAnchor="middle">ONE PROCESS</text>
          <rect className="box" x="40" y="35" width="60" height="30" rx="5" /><text x="70" y="55" className="boxText">A</text>
          <line className="flow" x1="100" y1="50" x2="140" y2="50" />
          <rect className="box" x="150" y="35" width="60" height="30" rx="5" /><text x="180" y="55" className="boxText">B</text>
          <text x="125" y="90" className="figHint" textAnchor="middle">always fast, always reliable</text>
          <line className="divider" x1="240" y1="10" x2="240" y2="120" />
          <text x="335" y="18" className="figLabel" textAnchor="middle">TWO MACHINES</text>
          <rect className="boxAccent" x="270" y="35" width="60" height="30" rx="5" /><text x="300" y="55" className="boxText">A</text>
          <line className="flowMuted" x1="330" y1="50" x2="370" y2="50" />
          <rect className="boxAccent" x="380" y="35" width="30" height="30" rx="5" /><text x="395" y="55" className="boxText">?</text>
          <text x="340" y="90" className="figHint" textAnchor="middle">slow? lost? crashed after receiving?</text>
        </svg>
        <figcaption>A local call fails cleanly or succeeds; a network call can hang in genuine ambiguity.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The single biggest mistake is designing a distributed system as if it were a single
          machine with extra steps — assuming a call will always succeed quickly, or that two
          machines' clocks agree. Every one of the more specific topics in this section (partitions,
          split-brain, heartbeats, failure handling) is really a consequence of taking these
          challenges seriously instead of assuming them away.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can't a machine that sends a request and gets no response tell whether the request was lost, the response was lost, or the other machine crashed?</p>
        </div>
      </section>
      <p className="takeaway">
        Distributed systems trade a single machine's simplicity for scale and fault tolerance —
        and that trade means designing deliberately for network unreliability, clock drift, and
        partial failure from the start.
      </p>
    </div>
  );
}
