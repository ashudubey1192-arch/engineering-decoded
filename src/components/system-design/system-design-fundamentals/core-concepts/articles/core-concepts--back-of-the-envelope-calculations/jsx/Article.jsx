import "../../../conceptArticle.css";
import "../css/Article.css";

export default function CoreConceptsBackOfEnvelopeArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A back-of-the-envelope calculation is fast, rough arithmetic to check whether a design
          idea is even plausible &mdash; done in your head or on a napkin, in under a minute.
        </p>
        <p>
          It is the same skill as capacity estimation, but lighter: you round hard, use memorised
          reference numbers, and aim for &quot;is this megabytes or petabytes?&quot; not a spreadsheet.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Someone proposes &quot;let&apos;s keep every user&apos;s full click history in memory for
            instant analytics.&quot; You think: 50M users &times; 10k clicks &times; 50 bytes &asymp;
            25 TB. RAM is a few hundred GB per machine. So that is ~100 machines just for RAM &mdash;
            probably not. The idea is reshaped in 20 seconds, before anyone writes code.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Numbers worth memorising</h2>
        <table className="miniTable">
          <caption>LATENCY LADDER (ROUGH, ORDER-OF-MAGNITUDE)</caption>
          <thead>
            <tr>
              <th>Operation</th>
              <th>Time</th>
              <th>Relative</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>L1 / CPU cache reference</td>
              <td>~1 ns</td>
              <td>1&times;</td>
            </tr>
            <tr>
              <td>Main memory (RAM) reference</td>
              <td>~100 ns</td>
              <td>100&times;</td>
            </tr>
            <tr>
              <td>Read 1 MB sequentially from RAM</td>
              <td>~5 &micro;s</td>
              <td>&mdash;</td>
            </tr>
            <tr>
              <td>SSD random read</td>
              <td>~100 &micro;s</td>
              <td>1,000&times; RAM</td>
            </tr>
            <tr>
              <td>Round trip within a data centre</td>
              <td>~0.5 ms</td>
              <td>&mdash;</td>
            </tr>
            <tr>
              <td>Read 1 MB from SSD</td>
              <td>~1 ms</td>
              <td>&mdash;</td>
            </tr>
            <tr>
              <td>Disk (HDD) seek</td>
              <td>~10 ms</td>
              <td>&mdash;</td>
            </tr>
            <tr>
              <td>Round trip across continents</td>
              <td>~150 ms</td>
              <td>&mdash;</td>
            </tr>
          </tbody>
        </table>
        <p>Plus a few constants:</p>
        <ul>
          <li>Seconds in a day &asymp; 86,400 &asymp; 10<sup>5</sup>.</li>
          <li>2<sup>10</sup> &asymp; 1 thousand, 2<sup>20</sup> &asymp; 1 million, 2<sup>30</sup> &asymp; 1 billion.</li>
          <li>1 char &asymp; 1 byte; a typical short JSON record &asymp; a few hundred bytes.</li>
          <li>A day of one event per second &asymp; 100k events.</li>
        </ul>

        <figure className="fig">
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="ladderTitle">
            <title id="ladderTitle">
              Bar chart: RAM is 100 times slower than cache, SSD 1000 times slower than RAM, a
              cross-continent round trip a million times slower again.
            </title>
            <text className="figHint" x="70" y="30">
              RAM
            </text>
            <rect className="boxAccent" x="110" y="18" width="40" height="16" />
            <text className="figHint" x="70" y="60">
              SSD read
            </text>
            <rect className="boxAccent" x="110" y="48" width="130" height="16" />
            <text className="figHint" x="70" y="90">
              DC round trip
            </text>
            <rect className="boxAccent" x="110" y="78" width="240" height="16" />
            <text className="figHint" x="70" y="120">
              cross-continent
            </text>
            <rect className="boxWarn" x="110" y="108" width="500" height="16" />
          </svg>
          <figcaption>
            Each step down the storage/network stack is roughly 10&ndash;1000&times; slower. This is
            why &quot;keep it in RAM&quot; and &quot;keep data near the user&quot; are such common
            answers.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>2. Step by step: two quick checks</h2>
        <ol className="stepList">
          <li>
            <b>&quot;A year of tweets &mdash; how much storage?&quot;</b> 500M tweets/day &times; 300
            bytes &asymp; 150 GB/day. &times; 365 &asymp; 55 TB/year. &times;3 replication &asymp; 165
            TB. Verdict: fits on a modest cluster, not in memory.
          </li>
          <li>
            <b>&quot;Can we cache all product data in RAM?&quot;</b> 2M products &times; 2 KB each = 4
            GB. A single server has 64&ndash;256 GB RAM. Verdict: easily &mdash; do it.
          </li>
          <li>
            <b>&quot;QPS for a URL shortener?&quot;</b> 10B redirects/month &divide; (30 &times; 10<sup>5</sup>)
            &asymp; 3,300/s average, ~10k/s peak. Verdict: needs a cache, but one region can handle
            it.
          </li>
        </ol>
        <div className="takeaway">
          The pattern: pick round inputs &rarr; multiply/divide with powers of ten &rarr; compare the
          result to a known limit (RAM size, one server&apos;s QPS, a disk). The comparison is the
          answer.
        </div>
      </section>

      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Doing exact arithmetic</h3>
            <p>
              If you reach for a calculator you have lost the plot. Round every input to one
              significant figure and keep it mental.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Mixing up bits and bytes</h3>
            <p>
              Network speeds are quoted in bits (Mbps), storage in bytes. A factor of 8 error can
              flip your conclusion.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Skipping the comparison</h3>
            <p>
              &quot;55 TB&quot; alone means nothing. &quot;55 TB, which is ~5 disks&quot; is the
              insight. Always end by comparing to a real limit.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>
            A service serves 1M images/second, each 50 KB. Estimate the outbound bandwidth in GB/s,
            and say whether a single 10 Gbps server link could handle it.
          </p>
        </div>
      </section>
    </div>
  );
}
