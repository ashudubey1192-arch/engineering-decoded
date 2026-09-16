export default function BoundedContextsLanguageBoundariesArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A language boundary is the linguistic sibling of a context boundary: the point where a
          word's meaning is allowed to change. Inside Booking, "Customer" means the shipper who
          pays for a booking. Inside Support, "Customer" means whoever opened a case. Both are
          correct &mdash; inside their own boundary.
        </p>
        <p>
          The Ubiquitous Language section, next, goes deep on building the language inside one
          context. This article is specifically about the edges: how to know when you've crossed
          into a different vocabulary.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Spotting a language boundary as it happens</h2>
        <ol className="stepList">
          <li>
            <b>Notice when a word needs a qualifier to stay clear.</b> If people start saying
            "the billing Customer" versus "the support Customer" in conversation, a language
            boundary already exists whether or not the code reflects it yet.
          </li>
          <li>
            <b>Check if the word's attributes actually differ.</b> Billing's Customer has a
            credit limit; Support's Customer has a satisfaction score. Different attributes are
            strong evidence of different concepts.
          </li>
          <li>
            <b>Confirm the two meanings evolve independently.</b> A change to how credit limits
            work should never require a change to case management, and vice versa.
          </li>
        </ol>
        <div className="scenarioBox">
          <small>A LANGUAGE BOUNDARY CARGOFLOW MISSED AT FIRST</small>
          <p>
            Early on, "Shipment status" meant one thing to Booking (BOOKED, IN_TRANSIT, DELIVERED)
            and something subtly different to Support (which needed OPEN_CASE, ESCALATED,
            RESOLVED states layered on top). Using one shared status enum forced awkward
            workarounds until the teams recognized this was a language boundary and split it into
            two separate types.
          </p>
        </div>
        <figure className="fig">
          <svg viewBox="0 0 580 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="30" width="220" height="90" rx="10" />
            <text className="figLabel" x="140" y="55">BOOKING'S "STATUS"</text>
            <text className="boxText" x="140" y="80">BOOKED</text>
            <text className="boxText" x="140" y="100">IN_TRANSIT / DELIVERED</text>
            <rect className="boxAccent" x="330" y="30" width="220" height="90" rx="10" />
            <text className="figLabel" x="440" y="55">SUPPORT'S "STATUS"</text>
            <text className="boxText" x="440" y="80">OPEN_CASE / ESCALATED</text>
            <text className="boxText" x="440" y="100">RESOLVED</text>
            <line className="divider" x1="280" y1="20" x2="280" y2="140" />
          </svg>
          <figcaption>Same English word, two different, independently-evolving concepts &mdash; the divider is the language boundary.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Splitting one overloaded type into two</h2>
        <span className="codeLabel">JAVA &mdash; BEFORE: ONE OVERLOADED ENUM</span>
        <div className="codeBlock">
          <pre>{`enum ShipmentStatus { BOOKED, IN_TRANSIT, DELIVERED, ESCALATED, RESOLVED } // mixes two languages`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; AFTER: TWO TYPES, ONE PER LANGUAGE</span>
        <div className="codeBlock">
          <pre>{`// Booking's language
enum ShipmentStatus { BOOKED, IN_TRANSIT, DELIVERED }

// Support's language, referencing Booking's status through its own view
enum CaseStatus { OPEN, ESCALATED, RESOLVED }
record SupportCaseView(String shipmentId, ShipmentStatus shipmentStatus, CaseStatus caseStatus) {}`}</pre>
        </div>
        <p>
          Support keeps a read-only view of Booking's status alongside its own, instead of trying
          to force one enum to speak both languages at once.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Merging two meanings to "avoid duplication."</b> The duplicated word is not the
            same concept twice; forcing it into one type is the actual cost, not the savings.
          </li>
          <li>
            <b>Missing the boundary because the word is spelled the same.</b> Language boundaries
            hide behind identical vocabulary more often than behind obviously different words.
          </li>
          <li>
            <b>Splitting language boundaries too eagerly.</b> Not every qualifier ("the current
            Customer" vs. "the previous Customer") signals a real boundary &mdash; check that the
            attributes and evolution genuinely diverge first.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>What was the actual evidence that Cargoflow had a language boundary around "Shipment status," not just a naming coincidence?</p>
          <p>
            <b>Answer:</b> The two meanings had different attributes (delivery states vs. case
            states) and evolved independently &mdash; changing one never needed to change the
            other. That independence is what makes it a real language boundary, not just a shared
            word.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Watch for words that need a qualifier to stay clear in conversation &mdash; that qualifier
        is usually marking a language boundary the code should reflect.
      </p>
    </div>
  );
}
