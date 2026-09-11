import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function IntroductionToSystemDesign30MustKnowConceptsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Thirty terms that quietly show up in almost every system design conversation. You do not
          need to master them today &mdash; this is a map of what is coming, and a fast checklist to
          revisit before an interview.
        </p>
        <p>
          Each one gets its own full lesson later in this course with a real scenario, a diagram, and
          a worked example. Here, the goal is just recognition: read the name, read the one-line idea,
          and move on.
        </p>

        <div className="scenarioBox">
          <small>HOW TO USE THIS PAGE</small>
          <p>
            Skim it once now so nothing later feels totally new. Then bookmark it &mdash; the week
            before an interview, come back, cover the right-hand explanation, and see how many you
            can say in your own words. The ones you stumble on are exactly where to spend your study
            time.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Networking foundations</h2>
        <table className="miniTable">
          <caption>HOW A REQUEST EVEN REACHES A SERVER</caption>
          <thead>
            <tr>
              <th>Concept</th>
              <th>In one line</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Client-server model</td>
              <td>Your app (the client) asks; a server does the work and answers back.</td>
            </tr>
            <tr>
              <td>IP address</td>
              <td>A unique number that identifies one device on a network.</td>
            </tr>
            <tr>
              <td>DNS</td>
              <td>The internet&apos;s phone book &mdash; turns a name into an IP address.</td>
            </tr>
            <tr>
              <td>Proxy vs reverse proxy</td>
              <td>A forward proxy hides the client; a reverse proxy hides the server.</td>
            </tr>
            <tr>
              <td>Latency</td>
              <td>How long one request takes, start to finish.</td>
            </tr>
            <tr>
              <td>HTTP / HTTPS</td>
              <td>The request/response language of the web; HTTPS adds encryption.</td>
            </tr>
          </tbody>
        </table>

        <h2>2. APIs and communication</h2>
        <table className="miniTable">
          <caption>HOW SERVICES TALK TO EACH OTHER</caption>
          <thead>
            <tr>
              <th>Concept</th>
              <th>In one line</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>API</td>
              <td>A contract: what you can ask for, and what you get back.</td>
            </tr>
            <tr>
              <td>REST API</td>
              <td>An API style built around resources (URLs) and HTTP methods.</td>
            </tr>
            <tr>
              <td>GraphQL</td>
              <td>A query language where the client asks for exactly the fields it needs.</td>
            </tr>
            <tr>
              <td>WebSockets</td>
              <td>One connection that stays open so both sides can send anytime.</td>
            </tr>
            <tr>
              <td>Webhooks</td>
              <td>The server calls <i>you</i> when something happens, instead of you asking.</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Data storage</h2>
        <table className="miniTable">
          <caption>WHERE DATA LIVES AND HOW IT IS FOUND</caption>
          <thead>
            <tr>
              <th>Concept</th>
              <th>In one line</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Databases</td>
              <td>Software built to store data and let you query it reliably.</td>
            </tr>
            <tr>
              <td>SQL vs NoSQL</td>
              <td>Fixed, related tables vs flexible, loosely structured data.</td>
            </tr>
            <tr>
              <td>Database indexing</td>
              <td>A lookup structure that finds rows without scanning the whole table.</td>
            </tr>
            <tr>
              <td>Vertical partitioning</td>
              <td>Split one wide table into narrower ones by groups of columns.</td>
            </tr>
            <tr>
              <td>Caching</td>
              <td>Keep a copy of hot data somewhere much faster to read.</td>
            </tr>
            <tr>
              <td>Denormalization</td>
              <td>Duplicate some data on purpose so reads skip expensive joins.</td>
            </tr>
            <tr>
              <td>Blob storage</td>
              <td>Storage built for large files &mdash; images, videos, backups.</td>
            </tr>
          </tbody>
        </table>

        <h2>4. Scaling</h2>
        <table className="miniTable">
          <caption>HANDLING MORE LOAD</caption>
          <thead>
            <tr>
              <th>Concept</th>
              <th>In one line</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Vertical scaling</td>
              <td>Give one machine more power &mdash; simple, but has a ceiling.</td>
            </tr>
            <tr>
              <td>Horizontal scaling</td>
              <td>Add more machines and share the load &mdash; near-unlimited headroom.</td>
            </tr>
            <tr>
              <td>Load balancers</td>
              <td>Spread incoming requests across a pool of servers.</td>
            </tr>
            <tr>
              <td>Replication</td>
              <td>Keep copies of the same data on several servers.</td>
            </tr>
            <tr>
              <td>Sharding</td>
              <td>Split the data itself across servers, each holding a slice.</td>
            </tr>
          </tbody>
        </table>

        <h2>5. Distributed systems</h2>
        <table className="miniTable">
          <caption>WHEN MANY MACHINES MUST AGREE</caption>
          <thead>
            <tr>
              <th>Concept</th>
              <th>In one line</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CAP theorem</td>
              <td>
                During a network split, pick consistency or availability &mdash; not both.
              </td>
            </tr>
            <tr>
              <td>CDN</td>
              <td>Cache copies of content in many cities so users hit the nearest one.</td>
            </tr>
            <tr>
              <td>Idempotency</td>
              <td>Doing an operation once or five times has the same result &mdash; safe to retry.</td>
            </tr>
          </tbody>
        </table>

        <h2>6. Architecture patterns</h2>
        <table className="miniTable">
          <caption>HOW BIGGER SYSTEMS ARE SHAPED</caption>
          <thead>
            <tr>
              <th>Concept</th>
              <th>In one line</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Microservices</td>
              <td>Split one app into small services, each owning one job.</td>
            </tr>
            <tr>
              <td>Message queues</td>
              <td>A buffer that holds work until a consumer is ready for it.</td>
            </tr>
            <tr>
              <td>Rate limiting</td>
              <td>Cap how many requests a client can make in a time window.</td>
            </tr>
            <tr>
              <td>API gateway</td>
              <td>One front door that handles auth, limits, and routing for every service.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section id="example">
        <h2>7. Step by step: spotting them in one real system</h2>
        <p>Take something you use daily &mdash; a photo-sharing app &mdash; and you can already point at most of these:</p>
        <ol className="stepList">
          <li>
            <b>You open the app.</b> DNS resolves the domain, HTTPS secures the connection, your
            request hits a <b>load balancer</b>.
          </li>
          <li>
            <b>The load balancer</b> picks one of many app servers &mdash; that pool exists because of{" "}
            <b>horizontal scaling</b>.
          </li>
          <li>
            <b>The app server calls an internal API</b>, checks a <b>cache</b> first, and only queries
            the <b>database</b> (indexed for speed) on a miss.
          </li>
          <li>
            <b>Your uploaded photo</b> goes to <b>blob storage</b>, and is served back to viewers
            through a <b>CDN</b> so it is fast worldwide.
          </li>
          <li>
            <b>Behind the scenes,</b> a like or comment might go through a <b>message queue</b> so the
            request returns instantly while a notification is sent later.
          </li>
          <li>
            <b>An API gateway</b> in front of all of this enforces <b>rate limiting</b> so one bad
            client cannot take the app down for everyone.
          </li>
        </ol>
        <div className="takeaway">
          These 30 ideas are not exotic &mdash; they are the small set of building blocks that almost
          every real system recombines. Learn the blocks once; you will keep recognising them
          everywhere.
        </div>
      </section>

      <section id="mistakes">
        <h2>8. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Memorising the list, not the &quot;why&quot;</h3>
            <p>
              Reciting &quot;CAP theorem: consistency, availability, partition tolerance&quot; is
              useless if you cannot explain what happens during an actual network split.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Treating this as the finish line</h3>
            <p>
              This page is an index, not the course. Each concept deserves the full lesson &mdash;
              scenario, diagram, worked numbers &mdash; before you call it &quot;known&quot;.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Assuming every system needs all 30</h3>
            <p>
              A small internal tool may need three of these. Knowing <i>when</i> a concept applies
              matters as much as knowing what it is.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>9. Knowledge check</h2>
        <div className="quiz">
          <p>
            Cover the right-hand column above. Pick five concepts at random and explain each one, in
            your own words, in one sentence. Which ones did you hesitate on?
          </p>
        </div>
      </section>
    </div>
  );
}
