import "../css/Article.css";

export default function LldCaseStudiesDesignAMeetingSchedulerArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          This system is fundamentally about one hard rule &mdash; no double-booking &mdash; and
          how cleanly that rule is enforced is what separates a good design here from a fragile one.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: users have calendars, a meeting has a time range and a list of required
          attendees, and scheduling must reject any time that conflicts with any attendee's
          existing meetings. Candidate classes: <code>User</code> (holds their own
          <code>Calendar</code>), <code>Calendar</code> (a user's booked time slots),
          <code>Meeting</code> (time range plus attendees), and <code>MeetingScheduler</code> (the
          entry point that checks every attendee before committing anything). The core reusable
          operation &mdash; does this time range overlap any existing one &mdash; deserves to be
          one clearly-named method on Calendar, not interval math duplicated everywhere it's needed.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>An organizer requests a meeting</b> with a set of attendees and a time range.</li>
          <li><b>MeetingScheduler asks each attendee's Calendar</b> whether that range overlaps any
            of their existing bookings.</li>
          <li><b>If every calendar reports free,</b> a Meeting is created and added to every
            attendee's Calendar in one committed step &mdash; never partially, since a partial
            booking would need an awkward rollback if a later attendee turned out busy.</li>
          <li><b>If any attendee conflicts,</b> the whole request is rejected, naming which
            attendee or attendees caused it.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of MeetingScheduler checking every attendee's Calendar for a time conflict before committing one Meeting to all of them together." >
          <rect className="boxAccent" x="160" y="15" width="120" height="28" rx="6" /><text x="220" y="34" className="boxText" style={{fontSize:"7px"}}>MeetingScheduler</text>
          {["Alice","Bob","Carol"].map((t,i) => (<line key={t} className="flowMuted" x1="220" y1="43" x2={60+i*160} y2="65" />))}
          {["Alice","Bob","Carol"].map((t,i) => (<rect key={t} className="box" x={20+i*160} y="70" width="80" height="26" rx="5" />))}
          {["Alice","Bob","Carol"].map((t,i) => (<text key={t} x={60+i*160} y="87" className="boxText" textAnchor="middle" style={{fontSize:"6.5px"}}>{t}'s Calendar</text>))}
          <text x="220" y="110" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>only commits if every calendar reports free</text>
        </svg>
        <figcaption>Every attendee's calendar is checked before the meeting is committed to any of them, never one at a time.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Booking each attendee's calendar one at a time as conflicts are discovered, instead of
          checking all of them first, leaves some calendars booked and others not if a conflict
          surfaces partway through. Implementing overlap-checking as ad hoc date comparisons at
          each call site, instead of one well-tested shared method, is how subtly different bugs
          creep into different parts of the same rule.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does MeetingScheduler need to check every attendee's calendar before committing the meeting to any of them?</p>
        </div>
      </section>
      <p className="takeaway">
        Check every attendee before committing to any of them, and give "does this overlap"
        exactly one home &mdash; the two decisions that keep double-booking from ever happening.
      </p>
    </div>
  );
}
