import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsLatencyThroughputBandwidthArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Three different measurements of a system&apos;s speed: <b>latency</b> is how long one
          request takes, <b>throughput</b> is how many requests finish per second, and{" "}
          <b>bandwidth</b> is the maximum data rate the pipe can carry.
        </p>
        <p>
          Picture a water pipe. Latency is how long water takes to travel its length. Bandwidth is
          the pipe&apos;s width &mdash; the most it could ever carry. Throughput is how much water is
          actually flowing right now (never more than bandwidth).
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A video call and a file download share your home connection. The call needs <b>low
            latency</b> &mdash; 300 ms of delay makes people talk over each other &mdash; but almost
            no bandwidth. The download wants to use <b>all the bandwidth</b> and does not care if the
            first byte takes half a second. One link, opposite priorities.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The three, side by side</h2>
        <table className="miniTable">
          <caption>SPEED, MEASURED THREE WAYS</caption>
          <thead>
            <tr>
              <th>Term</th>
              <th>Unit</th>
              <th>Question it answers</th>
              <th>Improve by</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Latency</td>
              <td>ms</td>
              <td>How long for one request?</td>
              <td>Caching, closer servers, fewer hops</td>
            </tr>
            <tr>
              <td>Throughput</td>
              <td>req/s or MB/s</td>
              <td>How much are we handling now?</td>
              <td>More servers, parallelism, batching</td>
            </tr>
            <tr>
              <td>Bandwidth</td>
              <td>Mbps / Gbps</td>
              <td>What is the ceiling of the link?</td>
              <td>Bigger pipes, compression, a CDN</td>
            </tr>
          </tbody>
        </table>

        <h2>2. What makes up latency</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 120" role="img" aria-labelledby="latTitle">
            <title id="latTitle">
              One request&apos;s latency is network time out, queue wait, app processing, database
              time, and network time back.
            </title>
            <rect className="box" x="20" y="40" width="110" height="40" />
            <text className="boxText" x="75" y="57">
              network
            </text>
            <text className="boxText" x="75" y="73">
              ~20 ms
            </text>
            <rect className="boxWarn" x="140" y="40" width="110" height="40" />
            <text className="boxText" x="195" y="57">
              queue wait
            </text>
            <text className="boxText" x="195" y="73">
              0&ndash;? ms
            </text>
            <rect className="boxAccent" x="260" y="40" width="110" height="40" />
            <text className="boxText" x="315" y="57">
              app work
            </text>
            <text className="boxText" x="315" y="73">
              ~15 ms
            </text>
            <rect className="boxAccent" x="380" y="40" width="110" height="40" />
            <text className="boxText" x="435" y="57">
              database
            </text>
            <text className="boxText" x="435" y="73">
              ~30 ms
            </text>
            <rect className="box" x="500" y="40" width="110" height="40" />
            <text className="boxText" x="555" y="57">
              network
            </text>
            <text className="boxText" x="555" y="73">
              ~20 ms
            </text>
          </svg>
          <figcaption>
            Queue wait is the sneaky part: near capacity, requests sit in line and latency spikes even
            though the work itself did not slow down.
          </figcaption>
        </figure>

        <h2>3. Averages lie &mdash; use percentiles</h2>
        <p>
          &quot;Average latency 50 ms&quot; can hide that 1 in 100 users waits 2 seconds. Track{" "}
          <b>p50</b> (median), <b>p95</b>, and <b>p99</b> &mdash; the time that 50%, 95%, 99% of
          requests beat. The slow tail is what users actually feel.
        </p>

        <h2>4. Little&apos;s Law ties latency to throughput</h2>
        <div className="takeaway">
          concurrency = throughput &times; latency &nbsp; (L = &lambda; &times; W)
        </div>
        <p>
          Handle 200 requests/second, each taking 0.1 s &rarr; on average 20 requests are in flight
          at once. That number sizes your thread pools and connection pools.
        </p>
      </section>

      <section id="example">
        <h2>5. Step by step: sizing a service</h2>
        <ol className="stepList">
          <li>
            <b>Target throughput:</b> 1,000 requests/second at peak.
          </li>
          <li>
            <b>Measured latency:</b> 200 ms (0.2 s) per request, mostly a database call.
          </li>
          <li>
            <b>Concurrency needed:</b> 1000 &times; 0.2 = <b>200 in flight</b> at once.
          </li>
          <li>
            <b>Servers:</b> if one server handles 50 concurrent requests, you need 200 / 50 ={" "}
            <b>4 servers</b> plus headroom.
          </li>
          <li>
            <b>Check bandwidth:</b> each response is 40 KB. 1000/s &times; 40 KB = 40 MB/s = 320 Mbps
            &mdash; fine on a 1 Gbps link, but a 10&times; traffic spike would saturate it, so plan a
            CDN.
          </li>
          <li>
            <b>Attack latency:</b> add a cache so 80% of reads skip the DB &rarr; latency ~60 ms
            &rarr; concurrency drops to 60 &rarr; 2 servers do the same work.
          </li>
        </ol>
        <p>Cutting latency also cut the server count &mdash; faster requests free capacity.</p>
      </section>

      <section id="mistakes">
        <h2>6. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Reporting only the average</h3>
            <p>
              A healthy mean with an ugly p99 means a slice of users are having a bad time. Alert on
              p95/p99.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Confusing bandwidth with throughput</h3>
            <p>
              A 1 Gbps link does not mean 1 Gbps of useful work &mdash; protocol overhead, latency,
              and small requests leave real throughput far lower.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Adding servers to fix latency</h3>
            <p>
              More servers raise throughput and cut queue wait, but one slow query stays slow.
              Profile the request path first.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>7. Knowledge check</h2>
        <div className="quiz">
          <p>
            A service handles 500 req/s at 40 ms average latency, each response 20 KB. Give the
            concurrency (Little&apos;s Law) and the outbound bandwidth in Mbps. Which one changes if
            latency doubles?
          </p>
        </div>
      </section>
    </div>
  );
}
