import "../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsLatencyThroughputArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          <b>Latency</b> is how long one request takes. <b>Throughput</b> is how many requests the
          system finishes per second. They are different axes and you tune them differently.
        </p>
        <p>
          Think of a highway: latency is how long <i>your</i> car takes to cross it; throughput is
          how many cars cross per minute. A wider road (more lanes) raises throughput without making
          any single trip faster.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A video call and a file download use the same network. The call needs <b>low latency</b>
            &mdash; even 300 ms of delay makes people talk over each other &mdash; but almost no
            bandwidth. The download needs <b>high throughput</b> and does not care if the first byte
            takes half a second. One pipe, two totally different goals.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. What makes up latency</h2>
        <p>The time for one request is a sum of parts:</p>
        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="latTitle">
            <title id="latTitle">
              One request&apos;s latency is network time out, queue wait, processing, database time,
              and network time back.
            </title>
            <rect className="box" x="20" y="45" width="110" height="40" />
            <text className="boxText" x="75" y="62">
              network
            </text>
            <text className="boxText" x="75" y="78">
              ~20 ms
            </text>
            <rect className="boxWarn" x="140" y="45" width="110" height="40" />
            <text className="boxText" x="195" y="62">
              queue wait
            </text>
            <text className="boxText" x="195" y="78">
              0&ndash;? ms
            </text>
            <rect className="boxAccent" x="260" y="45" width="110" height="40" />
            <text className="boxText" x="315" y="62">
              app work
            </text>
            <text className="boxText" x="315" y="78">
              ~15 ms
            </text>
            <rect className="boxAccent" x="380" y="45" width="110" height="40" />
            <text className="boxText" x="435" y="62">
              database
            </text>
            <text className="boxText" x="435" y="78">
              ~30 ms
            </text>
            <rect className="box" x="500" y="45" width="110" height="40" />
            <text className="boxText" x="555" y="62">
              network
            </text>
            <text className="boxText" x="555" y="78">
              ~20 ms
            </text>
          </svg>
          <figcaption>
            Queue wait is the sneaky one: when a server is near capacity, requests sit in line and
            latency shoots up even though the work itself did not get slower.
          </figcaption>
        </figure>

        <h2>2. Averages lie &mdash; use percentiles</h2>
        <p>
          &quot;Average latency 50 ms&quot; can hide that 1 in 100 users waits 2 seconds. Measure
          <b> p50</b> (median), <b>p95</b>, and <b>p99</b> &mdash; the value that 50%, 95%, 99% of
          requests come in under. The slow tail is what users complain about.
        </p>

        <h2>3. Little&apos;s Law ties them together</h2>
        <div className="takeaway">
          concurrency = throughput &times; latency &nbsp; (L = &lambda; &times; W)
        </div>
        <p>
          If you handle 200 requests/second and each takes 0.1 s, then on average 20 requests are
          in flight at once. This tells you how many workers / connections you need.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: sizing a service</h2>
        <ol className="stepList">
          <li>
            <b>Target throughput:</b> 1,000 requests/second at peak.
          </li>
          <li>
            <b>Measured latency per request:</b> 200 ms (0.2 s), mostly waiting on a database call.
          </li>
          <li>
            <b>Concurrency needed:</b> 1000 &times; 0.2 = <b>200 requests in flight</b> at once.
          </li>
          <li>
            <b>Threads per server:</b> if one server comfortably runs 50 concurrent requests, you
            need 200 / 50 = <b>4 servers</b> (plus headroom).
          </li>
          <li>
            <b>Now attack latency:</b> add a cache so 80% of reads skip the database. Latency drops
            to ~60 ms &rarr; concurrency needed falls to 60 &rarr; 2 servers do the same job.
          </li>
        </ol>
        <p>
          Notice: cutting latency also cut the server count. Faster requests free up capacity.
        </p>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Reporting only the average</h3>
            <p>
              A healthy average with an ugly p99 means a chunk of your users are having a bad time.
              Alert on p95/p99, not the mean.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Adding servers to fix latency</h3>
            <p>
              More servers raise throughput and cut queue wait, but a single slow query is still
              slow. Profile the request path first.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Ignoring the network floor</h3>
            <p>
              Light from New York to Sydney takes ~80 ms one way. No amount of optimisation beats
              physics &mdash; put data near users instead.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A service handles 500 req/s with an average latency of 40 ms. Using Little&apos;s Law,
            how many requests are being processed at any instant, and what happens to that number if
            latency doubles?
          </p>
        </div>
      </section>
    </div>
  );
}
