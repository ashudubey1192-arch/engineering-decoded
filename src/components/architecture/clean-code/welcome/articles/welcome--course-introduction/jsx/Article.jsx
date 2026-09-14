import "../css/Article.css";

export default function WelcomeCourseIntroductionArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Clean code is not about following a style guide. It is about writing software that
          the next person &mdash; often you, six months from now &mdash; can read, trust, and
          change without fear. This course builds that skill one habit at a time: naming,
          functions, comments, objects, error handling, tests, and the discipline to leave
          code better than you found it.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Clean code is a practice, not a destination</b> &mdash; you never arrive at "clean," you keep a codebase clean through hundreds of small decisions.</li>
          <li><b>Readers outnumber writers</b> &mdash; code is read far more often than it is written, so every choice should optimize for the next reader.</li>
          <li><b>A running example</b> &mdash; this course follows <b>Ledgerly</b>, a small invoicing tool for freelancers, through every section. The same handful of classes &mdash; <code>Invoice</code>, <code>LineItem</code>, <code>Customer</code>, <code>TaxCalculator</code> &mdash; get cleaner as the course progresses.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Here is the kind of function this course exists to fix. It is real working code from
          an early version of Ledgerly &mdash; it calculates what a customer owes &mdash; and it compiles,
          runs, and passes its one existing test. It is also nearly impossible to safely change:
        </p>
        <span className="codeLabel">LEDGERLY, BEFORE</span>
        <div className="codeBlock">
          <pre>{`function calc(inv) {
  let t = 0;
  for (let i = 0; i < inv.li.length; i++) {
    if (inv.li[i].q > 0) {
      t = t + inv.li[i].q * inv.li[i].p;
    }
  }
  if (inv.c.reg == "EU") { t = t * 1.20; }
  else if (inv.c.reg == "UK") { t = t * 1.20; }
  else { t = t * 1.0; }
  if (inv.disc) { t = t - (t * inv.disc); }
  return t;
}`}</pre>
        </div>
        <p>
          Nothing here is syntactically wrong. But the names carry no meaning, one function
          mixes three unrelated jobs (summing, taxing, discounting), and there is no way to
          tell what <code>inv.disc</code> means without reading every call site. By the end of
          this course, you will be able to look at this and immediately see six or seven ways
          to make it safer to change &mdash; and you will rewrite it yourself in the Functions
          and Refactoring sections.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of the course structure: eleven sections building from naming and functions, through objects and error handling, to testing, refactoring, and applied practice, all illustrated with one running example called Ledgerly.">
          <rect className="box" x="10" y="15" width="110" height="30" rx="5" />
          <text x="65" y="35" className="boxText" style={{fontSize:"6px"}}>Naming &amp; functions</text>
          <rect className="box" x="155" y="15" width="110" height="30" rx="5" />
          <text x="210" y="35" className="boxText" style={{fontSize:"6px"}}>Objects &amp; errors</text>
          <rect className="box" x="300" y="15" width="110" height="30" rx="5" />
          <text x="355" y="35" className="boxText" style={{fontSize:"6px"}}>Tests &amp; refactoring</text>
          <line className="flow" x1="120" y1="30" x2="153" y2="30" />
          <line className="flow" x1="265" y1="30" x2="298" y2="30" />
          <rect className="boxAccent" x="130" y="75" width="160" height="34" rx="6" />
          <text x="210" y="97" className="boxText" style={{fontSize:"7px"}}>One example: Ledgerly</text>
          <line className="flowMuted" x1="65" y1="45" x2="180" y2="75" />
          <line className="flowMuted" x1="210" y1="45" x2="210" y2="75" />
          <line className="flowMuted" x1="355" y1="45" x2="240" y2="75" />
        </svg>
        <figcaption>Eleven sections, one thread: every principle is demonstrated on the same small invoicing app.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          The most common way to misuse a course like this is to treat it as a list of rules to
          apply mechanically &mdash; renaming everything, extracting every function to three lines,
          commenting nothing. Clean code principles are heuristics that trade off against each
          other; the goal explained throughout this course is judgment, not compliance. Where a
          rule and readability conflict, readability wins.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does this course optimize its advice around "the next reader" rather than around getting code to compile and pass tests?</p>
        </div>
      </section>
      <p className="takeaway">
        Clean code is judged by how easily the next person can understand and safely change it &mdash;
        everything in this course is a tool for making that easier, illustrated on one small app,
        Ledgerly, so you can watch the same code improve section by section.
      </p>

    </div>
  );
}
