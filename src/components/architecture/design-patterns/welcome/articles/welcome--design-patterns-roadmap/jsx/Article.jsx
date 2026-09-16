export default function WelcomeDesignPatternsRoadmapArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          This article lays out the order the course commits to, and why that order matters:
          foundations and object-design principles come first because nearly every pattern later
          in the catalog is a named application of one or two of those principles. Skipping ahead
          to, say, Visitor without Encapsulate Variation and Open/Closed Design underneath it
          means memorizing a diagram instead of understanding why it looks that way.
        </p>
        <p>
          Twelve sections, seventy-three articles, moving from "what is a pattern" to combining
          several patterns in a realistic system design.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The twelve sections, in commitment order</h2>
        <ol className="stepList">
          <li>
            <b>Welcome, then Pattern Foundations.</b> What a pattern is, how to read pattern
            language (intent, applicability, forces), and when overusing patterns becomes its own
            problem.
          </li>
          <li>
            <b>Object Design Principles.</b> The underlying design instincts &mdash; program to an
            interface, favor composition over inheritance, encapsulate what varies &mdash; that
            most named patterns are specific, well-tested applications of.
          </li>
          <li>
            <b>Creational, Structural, then Behavioral Patterns.</b> The Gang of Four's three
            families, in their original order: how objects get built, how they're composed into
            larger structures, then how they communicate and share responsibility.
          </li>
          <li>
            <b>Enterprise, Concurrency, then Distributed System Patterns.</b> Patterns the
            original catalog didn't cover: data-access and layering patterns from Fowler's
            enterprise catalog, patterns for safe multi-threaded code, and patterns for the
            specific failure modes distributed systems introduce.
          </li>
          <li>
            <b>Refactoring to Patterns, Selecting Patterns, then Case Studies.</b> Moving from
            knowing the catalog to applying it: recognizing when existing code is straining toward
            a pattern, choosing between two that both seem to fit, and combining several in full
            worked designs.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 600 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="10" y="40" width="70" height="40" rx="5" />
            <text className="boxText" x="45" y="65" fontSize="9">Foundations</text>
            <rect className="box" x="95" y="40" width="70" height="40" rx="5" />
            <text className="boxText" x="130" y="65" fontSize="9">Object design</text>
            <rect className="box" x="180" y="40" width="70" height="40" rx="5" />
            <text className="boxText" x="215" y="65" fontSize="8">Creational</text>
            <rect className="box" x="265" y="40" width="70" height="40" rx="5" />
            <text className="boxText" x="300" y="65" fontSize="8">Structural</text>
            <rect className="box" x="350" y="40" width="70" height="40" rx="5" />
            <text className="boxText" x="385" y="65" fontSize="8">Behavioral</text>
            <rect className="box" x="435" y="40" width="70" height="40" rx="5" />
            <text className="boxText" x="470" y="60" fontSize="8">Enterprise /</text>
            <text className="boxText" x="470" y="72" fontSize="8">Concurrency</text>
            <rect className="boxAccent" x="520" y="40" width="70" height="40" rx="5" />
            <text className="boxText" x="555" y="60" fontSize="8">Applying</text>
            <text className="boxText" x="555" y="72" fontSize="8">the catalog</text>
            <line className="flow" x1="80" y1="60" x2="95" y2="60" />
            <line className="flow" x1="165" y1="60" x2="180" y2="60" />
            <line className="flow" x1="250" y1="60" x2="265" y2="60" />
            <line className="flow" x1="335" y1="60" x2="350" y2="60" />
            <line className="flow" x1="420" y1="60" x2="435" y2="60" />
            <line className="flow" x1="505" y1="60" x2="520" y2="60" />
          </svg>
          <figcaption>Each stage builds on the vocabulary and instincts of the one before it.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Why order matters: one pattern, traced backward</h2>
        <p>
          Strategy &mdash; encapsulating an interchangeable algorithm behind a common interface
          &mdash; appears in the Behavioral Patterns section. But its justification was already
          taught twice by the time you reach it:
        </p>
        <span className="codeLabel">JAVA &mdash; THE PRINCIPLE, THEN THE PATTERN</span>
        <div className="codeBlock">
          <pre>{`// Object Design Principles: "Program to an interface"
interface DiscountPolicy { double apply(Order order); }

// Behavioral Patterns, later: naming this shape "Strategy"
class GoldDiscountPolicy implements DiscountPolicy { /* 20% */ }
class SilverDiscountPolicy implements DiscountPolicy { /* 10% */ }
// Order now holds a DiscountPolicy instead of a switch statement`}</pre>
        </div>
        <p>
          Reading Strategy first, without "program to an interface" already in hand, would make
          the pattern look like unnecessary indirection instead of what it actually is: an
          interface, applied.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Jumping straight to the "interesting" patterns (Visitor, Observer) and skipping
            foundations.</b> Those patterns read as clever tricks without the underlying
            principles; with them, they read as inevitable.
          </li>
          <li>
            <b>Treating the roadmap as a strict prerequisite chain that can never be revisited.</b>{" "}
            It's an order optimized for first-time learning, not a one-way gate &mdash; returning
            to Object Design Principles after finishing Behavioral Patterns is often exactly the
            right move.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does Object Design Principles come before any of the three classic pattern families, rather than after?</p>
          <p>
            <b>Answer:</b> Most classic patterns are specific, well-tested applications of a small
            set of underlying principles (program to an interface, favor composition, encapsulate
            variation). Learning the principle first turns each later pattern into a recognizable
            application of something already understood, rather than an arbitrary diagram to
            memorize.
          </p>
        </div>
      </section>
      <p className="takeaway">
        The roadmap moves from principles to patterns to application on purpose &mdash; each later
        section leans on vocabulary and instincts the earlier ones built.
      </p>
    </div>
  );
}
