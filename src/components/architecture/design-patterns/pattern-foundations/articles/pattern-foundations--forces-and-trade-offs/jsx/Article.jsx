export default function PatternFoundationsForcesAndTradeOffsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Every design pattern is a resolution of competing forces &mdash; flexibility against
          simplicity, decoupling against directness, extensibility against the cost of extra
          indirection. No pattern eliminates these tensions; each one picks a specific point on
          the trade-off and names it. Understanding a pattern's forces is what lets you recognize
          when the trade-off it makes is wrong for your situation, even when its intent and
          applicability both seem to fit.
        </p>
        <p>
          This is the article this whole section has been building toward: intent tells you the
          problem, applicability tells you if it's your problem, forces and trade-offs tell you
          what you're actually giving up to solve it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Reading a pattern's forces, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the two things in tension.</b> Singleton trades global accessibility
            against testability and hidden coupling. Factory Method trades flexibility in what
            gets created against an extra layer of indirection over <code>new</code>.
          </li>
          <li>
            <b>Ask which side of the tension your situation actually needs more of.</b> A small
            script with one obvious way to construct an object doesn't need Factory Method's
            flexibility; a plugin system that must support types unknown at compile time does.
          </li>
          <li>
            <b>Weigh the cost as a real, ongoing cost, not a one-time complexity tax.</b>{" "}
            Decorator's extra indirection is paid every time someone reads the code, not just once
            at implementation &mdash; that recurring reading cost has to be worth the flexibility
            bought.
          </li>
          <li>
            <b>Accept that "no pattern" is often the correct resolution.</b> If neither side of the
            tension is under real pressure &mdash; nothing actually varies, nothing actually needs
            decoupling &mdash; the honest trade-off is to not pay the pattern's cost at all.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 140" xmlns="http://www.w3.org/2000/svg">
            <line className="divider" x1="30" y1="70" x2="470" y2="70" />
            <circle className="ringNode" cx="150" cy="70" r="8" />
            <text className="boxText" x="150" y="45">Flexibility</text>
            <text className="figHint" x="150" y="95">easy to extend later</text>
            <circle className="ringNode" cx="350" cy="70" r="8" />
            <text className="boxText" x="350" y="45">Simplicity</text>
            <text className="figHint" x="350" y="95">easy to read now</text>
            <text className="figLabel" x="250" y="120">every pattern sits somewhere on this line</text>
          </svg>
          <figcaption>No pattern sits at either extreme &mdash; each one is a specific, named point on the flexibility/simplicity trade-off.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. The same problem, two different trade-offs</h2>
        <span className="codeLabel">JAVA &mdash; RESOLVING THE SAME FORCE DIFFERENTLY</span>
        <div className="codeBlock">
          <pre>{`// Resolution A: direct construction -- simple, but every call site is coupled
// to the concrete class, and every new report type means editing every call site.
Report report = new PdfReport(data);

// Resolution B: Factory Method -- flexible, but adds a class and a layer of
// indirection that a reader must trace through to see which Report gets built.
Report report = ReportFactory.create(reportType, data);`}</pre>
        </div>
        <p>
          Neither line is "correct" in isolation. Resolution A is right when the codebase has one
          report type and no plausible near-term need for a second. Resolution B is right when new
          report types are added routinely and the call sites shouldn't need to change each time.
          The trade-off, not the code, is what decides.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Treating a pattern's benefit as free.</b> Every documented benefit in a pattern's
            "Consequences" section has a corresponding cost listed right next to it &mdash;
            reading only the benefits is reading half the entry.
          </li>
          <li>
            <b>Assuming the trade-off a pattern makes is universally correct.</b> Factory Method's
            flexibility is a genuine win in a plugin architecture and genuine overhead in a script
            with one report type &mdash; the pattern doesn't change; the right answer does.
          </li>
          <li>
            <b>Deciding based on what feels more "advanced" rather than the actual forces.</b> The
            more sophisticated-looking solution is not automatically the better trade-off for a
            given codebase's actual needs.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why might direct construction (<code>new PdfReport(data)</code>) be the objectively better choice in one codebase and Factory Method the better choice in another, given they solve the "same" problem?</p>
          <p>
            <b>Answer:</b> They resolve the same underlying force (flexibility vs. simplicity)
            differently, and which resolution is correct depends on the codebase's actual needs:
            how often new variants get added, and how many call sites would need to change. Neither
            pattern is universally superior &mdash; the right choice is whichever trade-off matches
            the real, current pressure on that force.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Every pattern resolves a real tension in a specific direction &mdash; know which forces are
        actually under pressure in your situation before adopting the trade-off a pattern commits
        you to.
      </p>
    </div>
  );
}
