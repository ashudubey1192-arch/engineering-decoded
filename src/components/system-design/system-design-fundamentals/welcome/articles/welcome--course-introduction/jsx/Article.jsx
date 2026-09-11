import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function WelcomeCourseIntroductionArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          System Design is simply the skill of turning &quot;build an app that works for a million
          people&quot; into an actual, working plan &mdash; which servers, which databases, how data
          moves, and what breaks first.
        </p>
        <p>
          It feels overwhelming at first because it pulls in a lot at once: networking, databases,
          caching, load balancing, messaging, and more. This course exists to put all of that in one
          place, taught in plain language, so a beginner can follow it start to finish without a
          computer science degree in their back pocket.
        </p>

        <div className="scenarioBox">
          <small>WHO THIS IS FOR</small>
          <p>
            You are a student, a fresher, or an engineer a few years in, and you want system design
            to stop feeling like memorised buzzwords (&quot;add a cache&quot;, &quot;use a load
            balancer&quot;) and start feeling like something you actually understand &mdash; well
            enough to design a real system, explain your reasoning in an interview, or make better
            calls at work.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. What makes this course different</h2>
        <ul>
          <li>
            <b>No prior system design knowledge assumed.</b> Every concept starts from &quot;what is
            this and why does it exist&quot;, not from jargon.
          </li>
          <li>
            <b>Every lesson uses a real scenario.</b> Instead of abstract definitions, you see the
            actual situation a concept solves &mdash; a site going down, a slow page, a double
            charge.
          </li>
          <li>
            <b>Every lesson has a visual.</b> Diagrams for how requests flow, how data replicates,
            how a load balancer decides &mdash; because system design is fundamentally about how
            pieces connect, and that is easier to see than to read.
          </li>
          <li>
            <b>Every lesson ends with a worked, numeric example</b> &mdash; the kind of back-of-the-
            envelope math you would actually do while designing something.
          </li>
        </ul>

        <h2>2. How a lesson is laid out</h2>
        <p>Every article in this course follows the same four-part shape, so you always know what to expect:</p>
      </section>

      <section id="example">
        <h2>3. The shape of every lesson</h2>
        <ol className="stepList">
          <li>
            <b>A real scenario.</b> The problem in plain terms &mdash; something that could happen to
            a real product, described before any jargon.
          </li>
          <li>
            <b>The concept, with a diagram.</b> What the idea actually is, how the pieces relate, and
            a simple visual so you can picture it, not just recite it.
          </li>
          <li>
            <b>A worked example.</b> Real numbers, a step-by-step walkthrough, or a concrete design
            decision &mdash; so the idea sticks as something you did, not something you read.
          </li>
          <li>
            <b>Common mistakes and a knowledge check.</b> The traps people fall into, and one question
            to test whether the idea actually landed.
          </li>
        </ol>
        <div className="takeaway">
          You do not need to memorise definitions. If you can explain the scenario and sketch the
          diagram from memory, you know the concept.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. How to get the most out of it</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Don&apos;t skip the fundamentals</h3>
            <p>
              &quot;Consistent Hashing&quot; feels more exciting than &quot;Availability&quot;, but
              the later, flashier topics all lean on the early ones. Go in order the first time
              through.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Redo the worked examples yourself</h3>
            <p>
              Reading someone else&apos;s capacity estimate teaches little. Cover the numbers and try
              to redo the calculation before checking the answer.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Explain it out loud</h3>
            <p>
              If you cannot explain a concept simply to someone else &mdash; or to yourself in the
              mirror &mdash; you have memorised it, not understood it. That gap shows up fast in
              interviews.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Before you start</h2>
        <div className="quiz">
          <p>
            In one or two sentences, write down why <i>you</i> are taking this course &mdash; an
            interview coming up, a system at work you want to understand better, or plain curiosity.
            Keep it in mind; it will tell you which sections to slow down on.
          </p>
        </div>
      </section>
    </div>
  );
}
