import "../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsRequirementsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Requirements describe what you are building. <b>Functional</b> requirements say what the
          system must <i>do</i>; <b>non-functional</b> requirements say how <i>well</i> it must do it.
        </p>
        <p>
          Every design starts here. If you skip this step you end up building the wrong thing, or the
          right thing that falls over at 10&times; traffic.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Your team is asked to &quot;build food delivery.&quot; That sentence hides a hundred
            decisions. Can a customer track the rider live? Must an order never be lost even if a
            server crashes mid-checkout? How fast should search feel? Writing requirements turns the
            one-line ask into a checklist everyone agrees on.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Functional requirements (FRs)</h2>
        <p>
          These are concrete features and behaviours, usually phrased as &quot;the system shall
          &hellip;&quot;. For the food delivery app:
        </p>
        <ul>
          <li>A customer can search restaurants by name, cuisine, and location.</li>
          <li>A customer can place an order and pay for it.</li>
          <li>A restaurant can accept or reject an order.</li>
          <li>A customer can track the rider&apos;s location until delivery.</li>
        </ul>
        <p>
          Good FRs are testable: you can write a yes/no test for each one.
        </p>

        <h2>2. Non-functional requirements (NFRs)</h2>
        <p>
          NFRs are the quality bars around those features. They are what turn a demo into a
          production system, and they drive almost every architecture choice.
        </p>
        <table className="miniTable">
          <caption>COMMON NFR CATEGORIES</caption>
          <thead>
            <tr>
              <th>Category</th>
              <th>Question it answers</th>
              <th>Example target</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Performance</td>
              <td>How fast does it respond?</td>
              <td>Search returns in &lt; 200 ms (p95)</td>
            </tr>
            <tr>
              <td>Scalability</td>
              <td>How much load can it grow to?</td>
              <td>Handle 50k orders/min on peak days</td>
            </tr>
            <tr>
              <td>Availability</td>
              <td>How often is it up?</td>
              <td>99.95% uptime (~4.4 h down/year)</td>
            </tr>
            <tr>
              <td>Durability</td>
              <td>Can we ever lose data?</td>
              <td>A confirmed order is never lost</td>
            </tr>
            <tr>
              <td>Security</td>
              <td>Who can do what?</td>
              <td>Payment data encrypted, PCI compliant</td>
            </tr>
            <tr>
              <td>Consistency</td>
              <td>Do all users see the same data?</td>
              <td>Order status is the same on every device</td>
            </tr>
          </tbody>
        </table>

        <figure className="fig">
          <svg viewBox="0 0 640 220" role="img" aria-labelledby="frTitle">
            <title id="frTitle">
              Functional requirements are the features; non-functional requirements wrap around them
              as quality constraints.
            </title>
            <rect className="boxAccent" x="40" y="30" width="560" height="160" rx="8" />
            <text className="figLabel" x="320" y="52">
              NON-FUNCTIONAL: fast, available, secure, scalable
            </text>
            <rect className="box" x="80" y="80" width="140" height="80" />
            <text className="boxText" x="150" y="125">
              Search
            </text>
            <rect className="box" x="250" y="80" width="140" height="80" />
            <text className="boxText" x="320" y="125">
              Place order
            </text>
            <rect className="box" x="420" y="80" width="140" height="80" />
            <text className="boxText" x="490" y="125">
              Track rider
            </text>
          </svg>
          <figcaption>
            Features sit inside a box of quality constraints. Change a constraint (say, 10&times; the
            traffic) and the design inside the box changes too.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>3. Step by step: requirements for a URL shortener</h2>
        <p>A URL shortener (like bit.ly) looks tiny, but the same process applies.</p>
        <ol className="stepList">
          <li>
            <b>List the features.</b> Create a short link from a long URL; visiting the short link
            redirects to the long URL; optionally pick a custom alias; optionally see click counts.
          </li>
          <li>
            <b>Find the actors.</b> Anonymous visitor (redirect), signed-in user (create + analytics),
            admin (abuse takedowns).
          </li>
          <li>
            <b>Attach numbers to each NFR.</b> Redirects must be &lt; 100 ms (p99). Reads are ~100&times;
            more common than writes. A created link must survive a server crash.
          </li>
          <li>
            <b>Mark what is out of scope.</b> No editing a link&apos;s target after creation, no
            team accounts in v1. Writing this down prevents scope creep.
          </li>
          <li>
            <b>Derive scale.</b> 100M new links/month and 10B redirects/month &rarr; ~4k redirects/s
            average, ~20k/s peak. That number decides caching and database choices.
          </li>
        </ol>
        <div className="takeaway">
          The NFRs (read-heavy, low-latency redirects, durable writes) are what push you toward a
          cache in front of a key-value store &mdash; not the feature list.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>NFRs with no numbers</h3>
            <p>
              &quot;It should be fast&quot; is not a requirement. &quot;p95 &lt; 200 ms at 5k req/s&quot;
              is. Numbers are what you design and test against.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Only listing features</h3>
            <p>
              Two systems with identical features can have completely different architectures because
              their availability and scale targets differ.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Never writing down non-goals</h3>
            <p>
              If you do not say what you are <i>not</i> building, every review meeting reopens the
              scope and the design never stabilises.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            For a messaging app, classify each as functional or non-functional: (a) messages are
            delivered in order, (b) a user can delete a message, (c) 99.99% uptime, (d) a sent
            message is never lost.
          </p>
        </div>
      </section>
    </div>
  );
}
