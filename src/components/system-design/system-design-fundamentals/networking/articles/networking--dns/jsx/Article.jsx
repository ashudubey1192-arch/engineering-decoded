import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function NetworkingDnsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          DNS (Domain Name System) is the internet&apos;s phone book. It translates a name people can
          remember, like <code>engineering-decoded.com</code>, into an IP address machines can route
          to, like <code>76.76.21.21</code>.
        </p>
        <p>
          It is a giant, distributed, cached database. No single server holds all of it &mdash;
          responsibility is delegated down a tree.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You open a site you have never visited. Before a single byte of the page loads, your
            device must answer &quot;what IP is this name?&quot;. That lookup can involve four
            different servers and take 20&ndash;120 ms &mdash; which is why a slow DNS provider makes
            every first visit feel sluggish, and why results are cached aggressively.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The players in a lookup</h2>
        <table className="miniTable">
          <caption>WHO ANSWERS WHAT</caption>
          <thead>
            <tr>
              <th>Server</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Stub resolver</td>
              <td>The tiny client in your OS that starts the query</td>
            </tr>
            <tr>
              <td>Recursive resolver</td>
              <td>Does the legwork (your ISP, or 8.8.8.8, 1.1.1.1). Caches heavily.</td>
            </tr>
            <tr>
              <td>Root servers</td>
              <td>Point to the right top-level-domain servers</td>
            </tr>
            <tr>
              <td>TLD servers</td>
              <td>
                <code>.com</code>, <code>.org</code>, <code>.in</code> &mdash; point to the
                domain&apos;s authoritative server
              </td>
            </tr>
            <tr>
              <td>Authoritative server</td>
              <td>Holds the real records for that domain</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Record types you will meet</h2>
        <ul>
          <li>
            <b>A</b> &mdash; name to IPv4 address. <b>AAAA</b> &mdash; name to IPv6.
          </li>
          <li>
            <b>CNAME</b> &mdash; alias one name to another (<code>www</code> to the apex domain).
          </li>
          <li>
            <b>MX</b> &mdash; where to deliver email for this domain.
          </li>
          <li>
            <b>NS</b> &mdash; which servers are authoritative for this zone.
          </li>
          <li>
            <b>TXT</b> &mdash; free text; used for domain verification, SPF, DKIM.
          </li>
        </ul>

        <figure className="fig">
          <svg viewBox="0 0 640 180" role="img" aria-labelledby="dnsTitle">
            <title id="dnsTitle">
              The resolver asks the root, then the TLD server, then the authoritative server, then
              returns the IP to your device.
            </title>
            <rect className="box" x="15" y="70" width="80" height="40" />
            <text className="boxText" x="55" y="94">
              You
            </text>
            <line className="flow" x1="95" y1="90" x2="135" y2="90" />
            <rect className="boxAccent" x="135" y="66" width="100" height="48" />
            <text className="boxText" x="185" y="86">
              Recursive
            </text>
            <text className="boxText" x="185" y="102">
              resolver
            </text>
            <line className="flow" x1="235" y1="80" x2="300" y2="45" />
            <rect className="box" x="300" y="25" width="90" height="34" />
            <text className="boxText" x="345" y="47">
              Root
            </text>
            <line className="flow" x1="235" y1="90" x2="300" y2="90" />
            <rect className="box" x="300" y="73" width="90" height="34" />
            <text className="boxText" x="345" y="95">
              .com TLD
            </text>
            <line className="flow" x1="235" y1="100" x2="300" y2="135" />
            <rect className="box" x="300" y="120" width="90" height="34" />
            <text className="boxText" x="345" y="142">
              Authoritative
            </text>
            <line className="flow" x1="390" y1="137" x2="470" y2="110" />
            <rect className="boxAccent" x="470" y="90" width="120" height="40" />
            <text className="boxText" x="530" y="114">
              A = 76.76.21.21
            </text>
          </svg>
          <figcaption>
            Each step narrows the search: root knows <code>.com</code>, <code>.com</code> knows the
            domain, the domain knows the host.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>3. Step by step: resolving blog.example.com</h2>
        <ol className="stepList">
          <li>
            <b>Check caches.</b> Browser cache &rarr; OS cache &rarr; recursive resolver cache. A hit
            here ends the story in &lt; 1 ms.
          </li>
          <li>
            <b>Ask a root server:</b> &quot;where is <code>.com</code>?&quot; It replies with the
            <code> .com</code> TLD server addresses.
          </li>
          <li>
            <b>Ask the .com TLD server:</b> &quot;where is <code>example.com</code>?&quot; It replies
            with <code>example.com</code>&apos;s authoritative name servers (NS records).
          </li>
          <li>
            <b>Ask the authoritative server:</b> &quot;what is <code>blog.example.com</code>?&quot;
            It returns the A record, say <code>93.184.216.34</code>, with a <b>TTL</b> (e.g. 300s).
          </li>
          <li>
            <b>Cache and use.</b> The resolver caches the answer for the TTL and hands the IP to your
            device, which now opens a TCP connection.
          </li>
        </ol>
        <div className="takeaway">
          TTL is the trade-off knob: high TTL = fast, cheap, but slow to change; low TTL = instant
          updates (good before a migration) but more lookups.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Forgetting TTL before a cutover</h3>
            <p>
              Switching servers with a 24-hour TTL means some users hit the old IP for a day. Lower
              the TTL to 60s a day <i>before</i> the change.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>CNAME at the apex</h3>
            <p>
              <code>example.com</code> (no subdomain) cannot be a CNAME per the spec. Use an A record
              or the provider&apos;s ALIAS / ANAME.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Treating DNS as instant</h3>
            <p>
              Propagation is really caches expiring. &quot;It works for me&quot; often just means
              your resolver cached the new record first.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            You are moving your site to a new host next Tuesday. What DNS change do you make on
            Monday, and why? What record type points <code>www.site.com</code> at{" "}
            <code>site.com</code>?
          </p>
        </div>
      </section>
    </div>
  );
}
