import "../css/Article.css";

export default function ApiPlatformApiDesignCaseStudyArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Every idea in this course is only as useful as your ability to apply several of them
          together, under real constraints, in one sitting. This closing lesson walks Parcelly's
          scheduled-pickups feature from a blank page to a reviewed, documented, shippable contract
          &mdash; touching most of what came before it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The feature: a partner should be able to request a specific pickup window for a
          shipment, and later see their whole day's scheduled pickups across every shipment at
          once. The design follows the workflow from the API Foundations section directly:
          identify consumers, model resources, sketch endpoints, define schemas, review edge
          cases, write it down, prototype, implement.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <b>Resource modeling:</b> a pickup <i>references</i> a shipment rather than nesting under
          it &mdash; because the actual use case (see my whole day's pickups, across every
          shipment) needs to list and filter pickups independently of any single shipment, exactly
          the reference-vs-containment call from the Resource Modeling lesson.
        </p>
        <span className="codeLabel">THE RESULTING CONTRACT</span>
        <div className="codeBlock">
          <pre>{`POST /v1/pickups
Idempotency-Key: 7b1e2c9a-pickup-1
{
  "shipment_id": "shp_9f8a",
  "window_start": "2026-09-20T09:00:00Z",
  "window_end": "2026-09-20T12:00:00Z"
}

GET /v1/pickups?date=2026-09-20&status=scheduled&cursor=...
PATCH /v1/pickups/pkp_3d21   { "window_end": "2026-09-20T13:00:00Z" }`}</pre>
        </div>
        <p>
          <b>Creation</b> carries an <code>Idempotency-Key</code>, since a partner's own retry
          logic could otherwise double-book a pickup slot with a carrier. <b>Listing</b> uses
          filtering and cursor pagination, exactly as covered in Querying Resources.
          <b>Updating</b> a window uses <code>PATCH</code>, not <code>PUT</code>, because partners
          typically change one field, not the whole resource. The whole feature is purely additive
          &mdash; a new resource, new endpoints &mdash; so it ships without a version bump, and
          launches labeled <code>beta</code> for its first month, exactly as the API Lifecycle
          lesson describes, while Parcelly confirms the window semantics hold up against real
          carrier feedback.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of the final resource design: a Pickup resource referencing a Shipment by ID, with its own top-level collection endpoint supporting filtering and pagination independent of any single shipment.">
          <rect className="box" x="20" y="50" width="110" height="34" rx="6" />
          <text x="75" y="71" className="boxText" style={{fontSize:"6.5px"}}>Shipment shp_9f8a</text>
          <rect className="boxAccent" x="230" y="20" width="170" height="34" rx="6" />
          <text x="315" y="41" className="boxText" style={{fontSize:"6.5px"}}>Pickup (top-level, /v1/pickups)</text>
          <line className="flowMuted" x1="230" y1="40" x2="130" y2="65" />
          <text x="180" y="52" className="figHint" style={{fontSize:"5px"}}>shipment_id</text>
          <rect className="box" x="230" y="80" width="170" height="34" rx="6" />
          <text x="315" y="101" className="boxText" style={{fontSize:"6px"}}>listed & filtered independently</text>
        </svg>
        <figcaption>The final design: Pickup references Shipment by ID and gets its own top-level, filterable, paginated collection.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The first draft nested pickups entirely under shipments &mdash;
          <code>/shipments/shp_9f8a/pickups</code> only, with no top-level listing &mdash; and
          design review caught that this broke the actual "show my whole day's schedule" use case
          the partner had asked for in the first place, exactly the kind of gap that talking to
          consumers before modeling resources is meant to prevent. The first draft also had no
          idempotency key on creation, until a partner reviewer pointed out their own retry logic
          would risk double-booking; and it originally used <code>PUT</code> for updates, changed
          to <code>PATCH</code> once it was clear partners only ever touch one field at a time.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Which single earlier design decision &mdash; caught in review, not in the original draft &mdash; prevented scheduled pickups from becoming a resource nobody could query the way its actual users needed?</p>
        </div>
      </section>
      <p className="takeaway">
        None of this course's individual lessons is complicated on its own &mdash; resource
        modeling, idempotency, the right HTTP method, a review before implementation. What makes
        API design hard is holding all of them at once, under a deadline, for a feature a partner
        is waiting on. That's the actual skill this course has been building toward, one lesson at
        a time.
      </p>
    </div>
  );
}
