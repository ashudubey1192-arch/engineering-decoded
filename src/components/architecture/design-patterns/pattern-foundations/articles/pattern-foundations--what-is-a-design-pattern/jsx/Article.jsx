export default function PatternFoundationsWhatIsADesignPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A design pattern is a named, reusable solution to a problem that recurs in a particular
          context &mdash; not a library, not a piece of code you copy in, but a documented shape
          that you re-implement each time in whatever form the current codebase needs. The
          "Gang of Four" book that popularized the term catalogued 23 such shapes, each with a
          name, a problem it solves, and a structure that solves it.
        </p>
        <p>
          The name is the useful part. "Let's use Observer here" communicates a specific,
          well-understood structure in three words that would otherwise take a paragraph.
        </p>
      </section>
      <section id="concepts">
        <h2>1. What makes something a pattern, step by step</h2>
        <ol className="stepList">
          <li>
            <b>It solves a problem that recurs, not a one-off need.</b> A pattern earns its name
            by showing up independently, in unrelated codebases, solving what turns out to be the
            same underlying problem.
          </li>
          <li>
            <b>It's a structure, not an implementation.</b> "Observer" describes a relationship
            (subjects notify registered observers of changes) that looks different in every
            language and every codebase it appears in &mdash; there's no canonical <code>Observer.java</code>{" "}
            to import.
          </li>
          <li>
            <b>It has a name that carries meaning on its own.</b> The name is a compression tool:
            once a team shares the vocabulary, "this needs a Decorator" replaces an explanation of
            wrapping behavior around an object without subclassing.
          </li>
          <li>
            <b>It has documented trade-offs, not just benefits.</b> A real pattern description
            (see the Intent and Applicability and Forces and Trade-Offs articles next) always
            includes when not to use it, alongside when to.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="130" height="40" rx="6" />
            <text className="boxText" x="85" y="45" fontSize="10">Codebase A</text>
            <rect className="box" x="20" y="90" width="130" height="40" rx="6" />
            <text className="boxText" x="85" y="115" fontSize="10">Codebase B</text>
            <line className="flow" x1="150" y1="40" x2="220" y2="75" />
            <line className="flow" x1="150" y1="110" x2="220" y2="75" />
            <rect className="boxAccent" x="220" y="55" width="140" height="40" rx="6" />
            <text className="boxText" x="290" y="80" fontSize="10">Same structure</text>
            <line className="flow" x1="360" y1="75" x2="420" y2="75" />
            <rect className="box" x="420" y="55" width="70" height="40" rx="6" />
            <text className="boxText" x="455" y="80" fontSize="10">A name</text>
          </svg>
          <figcaption>A pattern is the shape two independently-written solutions turn out to share, given a name once that recurrence is noticed.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The same shape, arrived at independently</h2>
        <p>
          Two unrelated classes, written by two different teams, solving unrelated problems &mdash;
          but sharing the same underlying structure:
        </p>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Team A: a UI widget notifying listeners of a click
interface ClickListener { void onClick(Button source); }
class Button {
    private final List<ClickListener> listeners = new ArrayList<>();
    void addClickListener(ClickListener l) { listeners.add(l); }
    void click() { listeners.forEach(l -> l.onClick(this)); }
}

// Team B, unrelated codebase: a StockPrice notifying watchers of a change
interface PriceListener { void onPriceChanged(StockPrice source); }
class StockPrice {
    private final List<PriceListener> listeners = new ArrayList<>();
    void addPriceListener(PriceListener l) { listeners.add(l); }
    void update(double newPrice) { listeners.forEach(l -> l.onPriceChanged(this)); }
}`}</pre>
        </div>
        <p>
          Different domains, identical shape: one subject, a list of interested parties, a
          notification loop. This shape is what the Observer pattern names.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Treating a pattern as code to copy-paste rather than a structure to adapt.</b> The
            <code> Button</code> and <code>StockPrice</code> examples above share a shape, not a
            single reusable class.
          </li>
          <li>
            <b>Assuming a pattern is language-specific.</b> The shape above is expressible in
            nearly any object-oriented language; only the syntax changes.
          </li>
          <li>
            <b>Believing patterns were invented and then adopted.</b> They were observed in
            existing, independently-written code first, and named afterward &mdash; the naming is
            what makes them teachable, not what makes them valid.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is there no single canonical "Observer.java" file you can import into any project?</p>
          <p>
            <b>Answer:</b> A pattern names a structural relationship, not a concrete
            implementation. <code>Button</code> and <code>StockPrice</code> both implement the
            Observer shape, but with completely different types and domains &mdash; the pattern
            is what they have in common, re-implemented fresh in each context.
          </p>
        </div>
      </section>
      <p className="takeaway">
        A design pattern is a named, recurring structural solution, not a library &mdash; its
        value is the shared vocabulary it gives a team, and the documented trade-offs that come
        attached to the name.
      </p>
    </div>
  );
}
