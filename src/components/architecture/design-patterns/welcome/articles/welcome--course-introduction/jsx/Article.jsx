export default function WelcomeCourseIntroductionArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Design patterns are named, reusable solutions to problems that recur across object-
          oriented software &mdash; not because someone invented them and pushed them into use,
          but because working programmers kept independently arriving at the same shapes and
          eventually gave those shapes names. This course covers the classic catalog end to end:
          when each pattern earns its place, what it costs, and how to recognize the problem it
          solves before reaching for it.
        </p>
        <p>
          Unlike some other courses on this site, there is no single running example threading
          through every article. Seventy-three patterns forced into one story would blur more
          than they'd clarify &mdash; instead, each article uses whichever concrete scenario makes
          that specific pattern clearest.
        </p>
      </section>
      <section id="concepts">
        <h2>1. What this course actually covers</h2>
        <ol className="stepList">
          <li>
            <b>Foundations first.</b> What a pattern actually is, how to read one, and the object-
            design principles &mdash; program to an interface, favor composition, encapsulate
            variation &mdash; that most patterns are just disciplined applications of.
          </li>
          <li>
            <b>The three classic families.</b> Creational patterns (how objects get built),
            structural patterns (how objects get composed), and behavioral patterns (how objects
            communicate) &mdash; the Gang of Four's original organization, still the clearest way
            to hold the catalog in your head.
          </li>
          <li>
            <b>Patterns beyond the original book.</b> Enterprise patterns for data access and
            application layering, concurrency patterns for multi-threaded code, and distributed
            system patterns for the failure modes networked services actually hit.
          </li>
          <li>
            <b>Applying the catalog, not just memorizing it.</b> Refactoring existing code toward
            a pattern, choosing between two patterns that both seem to fit, and full case studies
            that combine several patterns to solve one realistic design problem.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 560 170" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="150" height="45" rx="6" />
            <text className="boxText" x="95" y="47">Foundations</text>
            <rect className="box" x="205" y="20" width="150" height="45" rx="6" />
            <text className="boxText" x="280" y="47">Creational / Structural / Behavioral</text>
            <rect className="box" x="390" y="20" width="150" height="45" rx="6" />
            <text className="boxText" x="465" y="47">Enterprise / Concurrency / Distributed</text>
            <rect className="boxAccent" x="205" y="100" width="150" height="45" rx="6" />
            <text className="boxText" x="280" y="127">Applying the catalog</text>
            <line className="flow" x1="170" y1="42" x2="205" y2="42" />
            <line className="flow" x1="355" y1="42" x2="390" y2="42" />
            <line className="flowMuted" x1="280" y1="65" x2="280" y2="100" />
          </svg>
          <figcaption>The course moves from foundations, through the classic and extended pattern families, to actually applying the catalog to real problems.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A pattern, named, before you've been taught it</h2>
        <p>
          Most developers use patterns before they know the names. Consider a method that decides
          which discount calculation to run based on a customer's membership tier:
        </p>
        <span className="codeLabel">JAVA &mdash; A PATTERN, UNNAMED</span>
        <div className="codeBlock">
          <pre>{`public double discountFor(Order order, MembershipTier tier) {
    if (tier == MembershipTier.GOLD) return order.total() * 0.20;
    if (tier == MembershipTier.SILVER) return order.total() * 0.10;
    return order.total() * 0.02;
}`}</pre>
        </div>
        <p>
          By the end of the Behavioral Patterns section, this exact method will be rewritten using
          the Strategy pattern &mdash; not because the version above is wrong, but because naming
          the shape it should grow into, once it grows, makes that growth a deliberate choice
          instead of an accumulation of more <code>if</code> statements.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes when approaching this material</h2>
        <ul>
          <li>
            <b>Memorizing pattern names and class diagrams without the problem each one solves.</b>{" "}
            A pattern is a solution shape; without its motivating problem, the shape is just
            trivia.
          </li>
          <li>
            <b>Assuming more patterns in a codebase means better design.</b> The Avoiding Pattern
            Overuse article, later in this section, is a direct answer to this instinct.
          </li>
          <li>
            <b>Treating this as a course to read once instead of a catalog to return to.</b> The
            real skill this course builds is recognizing which pattern a problem is asking for
            &mdash; that recognition comes from revisiting the catalog against real problems, not
            a single read-through.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does this course avoid a single running example across all 73 articles, unlike some other courses on this site?</p>
          <p>
            <b>Answer:</b> Forcing dozens of genuinely different design problems into one
            fictional narrative would either distort the scenarios to fit the story or dilute the
            story until it stopped adding clarity. Each pattern instead gets the clearest concrete
            example for that specific problem.
          </p>
        </div>
      </section>
      <p className="takeaway">
        This course treats design patterns as named answers to recurring problems, not decoration
        &mdash; the goal is recognizing the problem a pattern solves, not memorizing its diagram.
      </p>
    </div>
  );
}
