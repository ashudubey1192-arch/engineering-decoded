import "../css/Article.css";

export default function MicroservicesFoundationsServiceBoundariesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A service boundary decides what lives inside one team's independent unit of change and
          what has to be requested from someone else's &mdash; draw it along a business capability
          and services stay decoupled; draw it along a technical layer and you've just distributed
          one tightly-coupled system across a network.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>Two properties separate a good boundary from a bad one:</p>
        <ul className="stepList">
          <li><b>High cohesion inside it</b> &mdash; the things that change together for the same business reason live in the same service.</li>
          <li><b>Low coupling across it</b> &mdash; two services rarely need to change on the same day because of the same requirement.</li>
        </ul>
        <p>
          A boundary drawn along technical layers (an "API service", a "validation service", a
          "persistence service") fails both tests: a single business change &mdash; say, a new
          required field on an order &mdash; now touches all three, and none of them is cohesive on
          its own.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>OrderService</code> owns everything about placing and tracking an order: validation,
          the order record, and its status history. It does <i>not</i> own payment capture or stock
          reservation &mdash; those are <code>PaymentService</code>'s and
          <code>InventoryService</code>'s jobs respectively, called through their APIs. A change to
          "how we validate a discount code" stays entirely inside <code>OrderService</code>; it never
          requires touching payment or inventory code.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 150" role="img" aria-label="Diagram contrasting a boundary drawn around a business capability, Order Service containing validation, order record, and status history together, versus a boundary drawn along technical layers that would split those same three concerns into separate services.">
          <text x="105" y="20" className="figLabel">GOOD: BY CAPABILITY</text>
          <rect className="boxAccent" x="15" y="35" width="180" height="80" rx="8" />
          <text x="105" y="55" className="boxText" style={{fontSize:"7.5px"}}>OrderService</text>
          {["Validation","Order record","Status history"].map((t,i) => (
            <text key={t} x="105" y={72 + i*14} className="figHint" style={{fontSize:"6px"}}>{t}</text>
          ))}
          <line className="divider" x1="230" y1="10" x2="230" y2="140" />
          <text x="335" y="20" className="figLabel">BAD: BY LAYER</text>
          {["Validation\nService","Order-record\nService","Status-history\nService"].map((t,i) => (
            <g key={i}>
              <rect className="boxWarn" x={250 + i*55} y="35" width="48" height="46" rx="6" />
              {t.split("\n").map((line,li) => (
                <text key={li} x={274 + i*55} y={53 + li*11} className="boxText" style={{fontSize:"5.5px"}}>{line}</text>
              ))}
            </g>
          ))}
          <text x="335" y="105" className="figHint" style={{fontSize:"6px"}}>one business change now touches all three</text>
        </svg>
        <figcaption>The left boundary keeps everything that changes together in one place; the right one scatters a single business change across three services.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Drawing boundaries around existing team org-charts instead of business capabilities is a
          frequent trap &mdash; if the org chart doesn't already match how the business actually
          works, the services won't either, and you'll be renaming and re-splitting services every
          time the team is reorganized. Drawing a boundary too finely, one service per database
          table, is the opposite failure: it creates constant cross-service chatter for what should
          have been one cohesive unit.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A team splits Order into a ValidationService, an OrderRecordService, and a StatusHistoryService. A new discount-code rule now requires changes in all three. What does that tell you about where the boundary was drawn?</p>
        </div>
      </section>
      <p className="takeaway">
        Test a proposed boundary by asking what change would cross it &mdash; if a single business
        requirement routinely needs changes in two services at once, the boundary is in the wrong
        place.
      </p>
    </div>
  );
}
