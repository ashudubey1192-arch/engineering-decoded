import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function WelcomeCourseRoadmapArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          The roadmap is simple: start with how one request travels across the internet, then layer
          on more machines, more data, and more failure modes &mdash; in that order.
        </p>
        <p>
          Each stage below leans on the one before it. You do not need to finish the whole course to
          be useful &mdash; even the first stage alone will change how you read any system&apos;s
          architecture diagram.
        </p>

        <div className="scenarioBox">
          <small>THE BIG PICTURE</small>
          <p>
            Early lessons ask &quot;how does a single request even reach a server?&quot; Middle
            lessons ask &quot;how do we serve millions of requests without falling over?&quot; Later
            lessons ask &quot;how do dozens of services and data centres stay
            correct together?&quot; You are always answering a bigger version of the same question.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The stages</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="roadmapTitle">
            <title id="roadmapTitle">
              Four stages in order: Foundations, APIs and Communication, Data Layer, then more
              advanced coordination and operating systems in production.
            </title>
            <rect className="boxAccent" x="10" y="55" width="140" height="50" />
            <text className="boxText" x="80" y="76">
              1. Foundations
            </text>
            <text className="boxText" x="80" y="92">
              you are here
            </text>
            <line className="flow" x1="150" y1="80" x2="185" y2="80" />
            <rect className="box" x="185" y="55" width="140" height="50" />
            <text className="boxText" x="255" y="76">
              2. APIs &amp;
            </text>
            <text className="boxText" x="255" y="92">
              Communication
            </text>
            <line className="flow" x1="325" y1="80" x2="360" y2="80" />
            <rect className="box" x="360" y="55" width="120" height="50" />
            <text className="boxText" x="420" y="76">
              3. Data Layer
            </text>
            <text className="boxText" x="420" y="92">
              durable data
            </text>
            <line className="flow" x1="480" y1="80" x2="515" y2="80" />
            <rect className="box" x="515" y="55" width="115" height="50" />
            <text className="boxText" x="572" y="76">
              4. Advanced
            </text>
            <text className="boxText" x="572" y="92">
              coordination
            </text>
          </svg>
          <figcaption>
            Each stage is a group of sections in the sidebar. Work top to bottom within a stage
            before jumping ahead.
          </figcaption>
        </figure>

        <table className="miniTable">
          <caption>WHAT EACH STAGE COVERS</caption>
          <thead>
            <tr>
              <th>Stage</th>
              <th>Sections</th>
              <th>The question it answers</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1. Foundations</td>
              <td>Intro, Core Concepts, Networking, Load Balancing</td>
              <td>How does one request get from a user to a server and back?</td>
            </tr>
            <tr>
              <td>2. APIs &amp; Communication</td>
              <td>API Design, API Infrastructure, API Security, Communication Patterns</td>
              <td>How do clients and services talk to each other, safely and clearly?</td>
            </tr>
            <tr>
              <td>3. Data Layer</td>
              <td>Caching, Databases, Database Scaling Techniques, Storage Systems</td>
              <td>Where does data live, and how does it survive real traffic?</td>
            </tr>
            <tr>
              <td>4. Advanced topics</td>
              <td>
                Architecture patterns, distributed systems, deployment, observability, security
                &mdash; including consensus, transactions, and recovery
              </td>
              <td>How do many services stay correct, fast, and recoverable together?</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="example">
        <h2>2. Step by step: how to actually move through it</h2>
        <ol className="stepList">
          <li>
            <b>Finish Welcome and Introduction to System Design first.</b> They set the vocabulary
            every later lesson assumes you already have.
          </li>
          <li>
            <b>Go through Core Concepts in order.</b> Scalability, Availability, Reliability, and the
            rest build on each other &mdash; skipping ahead usually means backtracking later.
          </li>
          <li>
            <b>Treat Networking and Load Balancing as one unit.</b> Together they explain how a
            single request actually reaches a server, which every later section assumes.
          </li>
          <li>
            <b>Use the sidebar as your map.</b> The highlighted lesson shows your current location.
            Section counts describe the number of lessons, not completed work. Keep a note of the
            ideas you can explain and the examples you want to revisit.
          </li>
          <li>
            <b>Once Foundations feels solid,</b> move into APIs &amp; Communication, then the Data
            Layer. Then study distributed coordination, safe deployment, and observability so you
            can explain how the design behaves when something fails.
          </li>
          <li>
            <b>Revisit, don&apos;t just reread.</b> Come back to a finished lesson a week later and
            try to redraw its diagram from memory before checking it.
          </li>
        </ol>
        <div className="takeaway">
          The sidebar order <i>is</i> the roadmap. If you ever feel lost, scroll to the top of it and
          ask &quot;what is the first section I have not completed?&quot;
        </div>
      </section>

      <section>
        <h2>Build evidence of understanding at each stage</h2>
        <ul>
          <li><b>Foundations:</b> trace one HTTPS request and estimate average and peak traffic with units.</li>
          <li><b>APIs and communication:</b> explain a retry after a lost response and make one operation idempotent.</li>
          <li><b>Data:</b> choose the authoritative store, identify stale copies, and protect a business invariant.</li>
          <li><b>Distributed systems:</b> describe what happens during a partition and how recovery works.</li>
          <li><b>Production:</b> propose a gradual rollout, useful alerts, and a recovery plan including data already written.</li>
        </ul>
        <p>
          Every section has a shared four-step case study. Read the topic explanation, then use
          the case to connect it to surrounding ideas. Inspect the before-and-after state, answer
          the practice question, and change one assumption: more traffic, a failed server, or a
          stricter freshness requirement. Explain which part of your design must change.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes when following a roadmap</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Jumping straight to the &quot;interesting&quot; topics</h3>
            <p>
              Consistent Hashing and CAP Theorem are exciting, but without Availability and
              Reliability first they will not fully click &mdash; they are the payoff, not the
              starting point.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Cramming a whole stage in one sitting</h3>
            <p>
              System design concepts compound. Ten lessons in one night blur together; two or three a
              day, revisited, stick far better.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Treating it as read-only</h3>
            <p>
              The worked examples and knowledge checks exist to be attempted, not skimmed. Skipping
              them is the single biggest reason concepts do not transfer to a real interview or
              design.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>4. Plan your path</h2>
        <div className="quiz">
          <p>
            Look at the sidebar now. Pick the one section you will finish this week, and name the one
            concept in it you are least confident about &mdash; that is the lesson to slow down on.
          </p>
        </div>
      </section>
    </div>
  );
}
