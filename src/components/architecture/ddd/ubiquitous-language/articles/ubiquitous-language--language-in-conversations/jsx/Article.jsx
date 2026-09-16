export default function UbiquitousLanguageLanguageInConversationsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Ubiquitous language flows in both directions. The previous article covered getting the
          language into code; this one covers keeping the glossary terms alive in daily
          conversation &mdash; standups, tickets, Slack threads &mdash; so the code does not
          become the only place the precise vocabulary survives.
        </p>
        <p>
          A team that writes <code>ShipmentStatus.IN_TRANSIT</code> correctly in code but says
          "the thing is moving" in a planning meeting has a language that only half exists.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Habits that keep language alive day to day</h2>
        <ol className="stepList">
          <li>
            <b>Write ticket titles in glossary terms.</b> "Fix Leg deadline calculation for
            multi-carrier routes" instead of "fix the date bug" forces precision at the point
            where work gets defined.
          </li>
          <li>
            <b>Correct imprecise language in the moment, not after the fact.</b> If someone says
            "the shipment is late" in standup, ask: late against the Deadline, or behind the ETA?
            The distinction usually matters.
          </li>
          <li>
            <b>Use the glossary term even when a shorter slang term is faster to say.</b> "The
            multi-leg thing" is faster than "a shipment with more than one Leg," but the shortcut
            erodes precision over weeks of repetition.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>A CORRECTION THAT MATTERED</small>
          <p>
            An engineer reported "shipments are late" during an incident. A teammate asked: late
            against the contractual Deadline, or just behind the routing ETA? The answer changed
            the severity of the incident entirely &mdash; ETA slippage was expected and harmless;
            Deadline misses triggered contractual refunds. The correction was not pedantry; it was
            the actual question that mattered.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 560 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="40" width="200" height="60" rx="8" />
            <text className="boxText" x="130" y="65">"shipments are late"</text>
            <text className="figHint" x="130" y="85">imprecise</text>
            <line className="flow" x1="230" y1="70" x2="300" y2="70" />
            <rect className="boxAccent" x="300" y="20" width="230" height="45" rx="8" />
            <text className="boxText" x="415" y="47">Deadline missed &rarr; refund risk</text>
            <rect className="boxAccent" x="300" y="80" width="230" height="45" rx="8" />
            <text className="boxText" x="415" y="107">ETA slipped &rarr; expected, low severity</text>
          </svg>
          <figcaption>One imprecise sentence hides two very different situations; the glossary term forces the distinction to surface.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Precision in a ticket, not just in code</h2>
        <span className="codeLabel">TICKET TITLE &amp; DESCRIPTION</span>
        <div className="codeBlock">
          <pre>{`Title: Shipments missing Deadline on multi-carrier Legs undercount refund risk

Description: When a shipment has more than one Leg handled by different
carriers, Shipment.missedDeadline() only checks the final Leg's arrival,
not intermediate Legs that could still cause a contractual Deadline miss
even if the final Leg is on time.`}</pre>
        </div>
        <p>
          Every term in this ticket &mdash; Shipment, Leg, Deadline &mdash; maps directly to the
          glossary, so an engineer picking it up cold already knows exactly what is being
          described, with no separate translation step.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Enforcing precise language only in code review, never in conversation.</b> Half the
            drift happens in planning and incident discussions that never touch a pull request.
          </li>
          <li>
            <b>Treating corrections as pedantic instead of substantive.</b> As the Deadline/ETA
            example shows, the "pedantic" correction is often the one that changes the actual
            decision.
          </li>
          <li>
            <b>Letting slang persist because "everyone on the team already knows what it means."</b>{" "}
            New team members and cross-team readers do not share that tacit knowledge.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why did asking "Deadline or ETA?" during the incident matter more than it might seem?</p>
          <p>
            <b>Answer:</b> The two terms mapped to genuinely different severities &mdash; a
            Deadline miss triggered contractual refunds, an ETA slip did not. The imprecise phrase
            "shipments are late" hid which situation was actually happening.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Keep glossary terms alive in tickets, standups, and incident discussions, not just in
        code &mdash; language that only lives in the codebase is only half built.
      </p>
    </div>
  );
}
