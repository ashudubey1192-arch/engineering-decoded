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
        <p>
          Think of an architecture as an explanation of a user action. When someone buys a ticket,
          which component checks the seat, which one records the reservation, and when is it safe
          to say &quot;confirmed&quot;? Then ask what changes if two people choose the same seat,
          the response gets lost, or the database becomes unavailable. Those questions turn a
          diagram into a design you can reason about.
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
            <b>Each section includes an interactive case study.</b> Step through changes to a
            system, inspect its state, and explain the trade-off. Numerical examples state their
            assumptions so you can redo the calculation with different inputs.
          </li>
        </ul>

        <h2>2. What you will learn to explain</h2>
        <ul>
          <li><b>The request path:</b> how a browser finds a server, sends a request, and receives a response.</li>
          <li><b>The source of truth:</b> where a value is durable and which copies may temporarily be stale.</li>
          <li><b>The capacity limit:</b> how traffic, storage growth, and dependency limits constrain a design.</li>
          <li><b>The failure behavior:</b> what a timeout means, whether retrying is safe, and how a system recovers.</li>
          <li><b>The decision:</b> why a component is needed, what it improves, and what complexity it adds.</li>
        </ul>
        <p>
          Basic familiarity with an application, an HTTP request, and stored data is enough to
          start. If those are new, read the Networking and API Design introductions slowly and
          return to them as needed. You can follow the visual examples without installing servers.
        </p>
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
        <h2>A first design decision: should we add a cache?</h2>
        <p>
          Suppose a link shortener handles 10,000 redirects per day. Divide by 86,400 seconds:
          that is about <b>0.12 requests per second</b> on average. Even an assumed 100-fold burst
          is about 12 requests per second. Start with an application and a database, then measure
          the peak before adding another service.
        </p>
        <p>
          Later, traffic grows to 1,000 requests per second and repeated lookups strain the database.
          With a measured 90% cache hit rate, approximately <b>100 requests per second</b> still need
          the database: 1,000 × (1 − 0.90). The cache now has a specific purpose. It also creates a
          new problem: an edited destination must not remain cached forever.
        </p>
        <p>
          Practice this reasoning: state the workload, identify a bottleneck, add a mechanism, and
          explain the new failure mode. The interactive case study below walks through this
          example one change at a time. Its numbers are teaching assumptions, not performance promises.
        </p>
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
        <p>
          Read the explanation, predict the next step, advance the animation, and compare the
          system state with your prediction. Use Previous or Restart whenever something is unclear.
          The section case study connects related lessons; article diagrams and quizzes focus on
          the individual topic.
        </p>
        <p>
          After a lesson, try saying: &quot;This solves ___ when ___, but costs ___. If ___ fails,
          the system will ___.&quot; A clear answer is more useful than memorizing a list of tools.
        </p>
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
