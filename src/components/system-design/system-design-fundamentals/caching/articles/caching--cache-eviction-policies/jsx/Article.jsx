import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function CachingEvictionPoliciesArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A cache has a fixed amount of memory. An eviction policy is the rule it uses to decide{" "}
          <b>what to throw away</b> when it is full and something new needs to fit.
        </p>
        <p>
          The goal is always the same &mdash; keep the entries most likely to be reused, evict the
          ones least likely to be &mdash; but different policies guess &quot;likely to be
          reused&quot; in different ways.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A 1 GB cache is full. A request comes in for a new item that is not cached. Something has
            to go to make room. If the cache picks badly &mdash; evicting a product page that gets
            hit every few seconds to make room for one nobody has viewed since yesterday &mdash; the
            hit rate quietly tanks even though the cache is technically &quot;full and working&quot;.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The common policies</h2>
        <table className="miniTable">
          <caption>WHAT GETS EVICTED FIRST</caption>
          <thead>
            <tr>
              <th>Policy</th>
              <th>Evicts</th>
              <th>Good when</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>LRU (Least Recently Used)</td>
              <td>The item not accessed for the longest time</td>
              <td>Recent access predicts future access &mdash; most common default</td>
            </tr>
            <tr>
              <td>LFU (Least Frequently Used)</td>
              <td>The item accessed the fewest total times</td>
              <td>Some items are consistently hot regardless of recency</td>
            </tr>
            <tr>
              <td>FIFO (First In, First Out)</td>
              <td>The oldest item added, regardless of use</td>
              <td>Simple, predictable; access pattern does not matter much</td>
            </tr>
            <tr>
              <td>TTL-based</td>
              <td>Anything past its expiry time, first</td>
              <td>Data has a natural freshness window</td>
            </tr>
            <tr>
              <td>Random</td>
              <td>A random entry</td>
              <td>Extremely cheap; surprisingly not much worse than FIFO</td>
            </tr>
          </tbody>
        </table>

        <h2>2. LRU, visually</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="lruTitle">
            <title id="lruTitle">
              Accessing an item moves it to the front; when the cache is full, the item at the back
              (least recently used) is evicted to make room.
            </title>
            <text className="figHint" x="70" y="25">
              most recent
            </text>
            <rect className="boxAccent" x="20" y="35" width="70" height="34" />
            <text className="boxText" x="55" y="57">
              D
            </text>
            <rect className="box" x="100" y="35" width="70" height="34" />
            <text className="boxText" x="135" y="57">
              C
            </text>
            <rect className="box" x="180" y="35" width="70" height="34" />
            <text className="boxText" x="215" y="57">
              A
            </text>
            <rect className="boxWarn" x="260" y="35" width="70" height="34" />
            <text className="boxText" x="295" y="57">
              B
            </text>
            <text className="figHint" x="295" y="25">
              least recent
            </text>
            <line className="flow" x1="330" y1="52" x2="400" y2="52" />
            <text className="figHint" x="480" y="42">
              cache full, new item E arrives
            </text>
            <text className="figHint" x="480" y="90">
              B is evicted &mdash; it was used longest ago
            </text>
          </svg>
          <figcaption>
            Each access reshuffles the order; eviction always removes from the &quot;used longest
            ago&quot; end.
          </figcaption>
        </figure>

        <h2>3. LRU vs LFU in one line</h2>
        <p>
          LRU asks &quot;when was this last touched?&quot; LFU asks &quot;how many times has this
          ever been touched?&quot; LRU can be fooled by a one-time burst of access to something you
          will never need again; LFU can hang onto an old &quot;popular last month&quot; item long
          after it stopped mattering.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: choosing a policy</h2>
        <ol className="stepList">
          <li>
            <b>Default to LRU.</b> Most real traffic follows recency &mdash; what was used a moment
            ago is likely to be used again soon.
          </li>
          <li>
            <b>Watch for one-time scans.</b> A background job reading every row once can flush truly
            hot data out of an LRU cache &mdash; some caches offer a scan-resistant variant for this.
          </li>
          <li>
            <b>Consider LFU</b> if a small set of items (a homepage, top-selling products) are
            reliably hot for a long time, regardless of momentary bursts elsewhere.
          </li>
          <li>
            <b>Layer on TTL regardless of policy.</b> Even the &quot;best&quot; eviction choice
            should not keep genuinely stale data around just because it is popular.
          </li>
          <li>
            <b>Measure the actual hit rate</b> after choosing &mdash; the right policy is the one
            that empirically performs best for your traffic, not the theoretically fanciest one.
          </li>
        </ol>
        <div className="takeaway">
          Eviction policy is a bet about which past behaviour best predicts the future. LRU wins that
          bet often enough to be the sensible default almost everywhere.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Cache sized far below the working set</h3>
            <p>
              No eviction policy fixes a cache that is simply too small &mdash; you will thrash no
              matter what you evict.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Letting a batch job poison an LRU cache</h3>
            <p>
              A full-table scan touches everything once, evicting genuinely hot data in its wake.
              Route bulk jobs around the cache, or use a scan-resistant policy.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Picking a policy without measuring</h3>
            <p>
              LFU sounds smarter than LRU on paper, but for many real workloads the difference is
              small &mdash; verify with your own hit-rate data before adding complexity.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A nightly job reads every row in a table once, and your cache uses LRU. What happens to
            your normal hot data right after that job runs, and why?
          </p>
        </div>
      </section>
    </div>
  );
}
