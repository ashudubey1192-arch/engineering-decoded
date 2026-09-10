import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function NetworkingProxyVsReverseProxyArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          Both sit between a client and a server and relay traffic. The difference is <i>whose
          side</i> they are on: a <b>forward proxy</b> acts for the client; a <b>reverse proxy</b>{" "}
          acts for the server.
        </p>
        <p>
          A forward proxy hides <i>who is asking</i>. A reverse proxy hides <i>what is answering</i>.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            At an office, every employee&apos;s web traffic goes through a company <b>forward
            proxy</b> that filters sites and logs usage &mdash; the websites only ever see the
            proxy&apos;s IP. Meanwhile that company&apos;s own website sits behind a <b>reverse
            proxy</b> (Nginx / Cloudflare) that terminates HTTPS, blocks attacks, caches pages, and
            spreads requests across 8 hidden backend servers &mdash; visitors only ever see the
            proxy.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The two directions</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 210" role="img" aria-labelledby="proxyTitle">
            <title id="proxyTitle">
              A forward proxy sits next to the clients; a reverse proxy sits next to the servers.
            </title>
            <text className="figLabel" x="160" y="20">
              FORWARD PROXY
            </text>
            <rect className="box" x="30" y="35" width="60" height="28" />
            <text className="boxText" x="60" y="54">
              client
            </text>
            <rect className="box" x="30" y="70" width="60" height="28" />
            <text className="boxText" x="60" y="89">
              client
            </text>
            <line className="flow" x1="90" y1="66" x2="140" y2="66" />
            <rect className="boxAccent" x="140" y="48" width="80" height="36" />
            <text className="boxText" x="180" y="70">
              proxy
            </text>
            <line className="flow" x1="220" y1="66" x2="280" y2="66" />
            <rect className="box" x="280" y="48" width="70" height="36" />
            <text className="boxText" x="315" y="70">
              internet
            </text>

            <text className="figLabel" x="470" y="20">
              REVERSE PROXY
            </text>
            <rect className="box" x="370" y="120" width="70" height="30" />
            <text className="boxText" x="405" y="140">
              visitor
            </text>
            <line className="flow" x1="440" y1="135" x2="480" y2="135" />
            <rect className="boxAccent" x="480" y="118" width="70" height="34" />
            <text className="boxText" x="515" y="139">
              proxy
            </text>
            <line className="flow" x1="550" y1="128" x2="595" y2="105" />
            <line className="flow" x1="550" y1="135" x2="595" y2="135" />
            <line className="flow" x1="550" y1="142" x2="595" y2="165" />
            <rect className="box" x="595" y="92" width="40" height="24" />
            <rect className="box" x="595" y="123" width="40" height="24" />
            <rect className="box" x="595" y="154" width="40" height="24" />
            <text className="figHint" x="615" y="192">
              backends
            </text>
          </svg>
          <figcaption>
            Same box in the middle, opposite purpose. Forward: many known clients &rarr; the whole
            internet. Reverse: the whole internet &rarr; a few hidden servers.
          </figcaption>
        </figure>

        <h2>2. What each is used for</h2>
        <table className="miniTable">
          <caption>FORWARD VS REVERSE</caption>
          <thead>
            <tr>
              <th>Forward proxy</th>
              <th>Reverse proxy</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Content filtering / access control</td>
              <td>Load balancing across backends</td>
            </tr>
            <tr>
              <td>Caching for a group of users</td>
              <td>TLS termination (HTTPS ends here)</td>
            </tr>
            <tr>
              <td>Hiding / changing the client&apos;s IP</td>
              <td>Caching + compression for all visitors</td>
            </tr>
            <tr>
              <td>Bypassing geo-restrictions (VPN-like)</td>
              <td>WAF: block SQLi, DDoS, bad bots</td>
            </tr>
            <tr>
              <td>Corporate / school / ISP gateways</td>
              <td>Routing by path (<code>/api</code> vs <code>/</code>)</td>
            </tr>
          </tbody>
        </table>

        <h2>3. Related terms</h2>
        <ul>
          <li>
            <b>Load balancer:</b> a reverse proxy whose main job is spreading traffic. Most reverse
            proxies can do both.
          </li>
          <li>
            <b>API gateway:</b> a reverse proxy specialised for APIs &mdash; auth, rate limiting,
            request shaping, routing to microservices.
          </li>
          <li>
            <b>CDN:</b> a globally distributed reverse-proxy cache in front of your origin.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: a request through a reverse proxy</h2>
        <ol className="stepList">
          <li>
            <b>DNS</b> for <code>shop.example.com</code> points at the reverse proxy&apos;s IP, not
            any backend.
          </li>
          <li>
            <b>TLS ends at the proxy.</b> It holds the certificate and private key; traffic to
            backends can be plain HTTP inside the private network.
          </li>
          <li>
            <b>Security checks.</b> The proxy / WAF drops obvious attacks and rate-limits abusive
            IPs.
          </li>
          <li>
            <b>Cache check.</b> If the page is cacheable and fresh, return it now &mdash; backends
            never see the request.
          </li>
          <li>
            <b>Route + balance.</b> <code>/api/*</code> goes to the API pool, everything else to the
            web pool; pick a healthy instance (round-robin / least-connections).
          </li>
          <li>
            <b>Add headers.</b> The proxy sets <code>X-Forwarded-For</code> so the backend still
            knows the real client IP, then relays the response back.
          </li>
        </ol>
        <div className="takeaway">
          The reverse proxy is where you put every cross-cutting concern &mdash; TLS, caching,
          compression, auth, rate limiting, routing &mdash; so backend code stays simple and hidden.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Losing the client IP</h3>
            <p>
              Without <code>X-Forwarded-For</code> (and the backend trusting it), every request looks
              like it came from the proxy &mdash; breaking rate limits and analytics.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Backends reachable directly</h3>
            <p>
              If a backend has a public IP, attackers skip the proxy and its protections. Lock
              backends to the proxy&apos;s network only.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Confusing the two in interviews</h3>
            <p>
              &quot;Proxy&quot; alone is ambiguous. Say &quot;forward proxy for outbound client
              traffic&quot; or &quot;reverse proxy in front of our services&quot;.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            Your API sees every request coming from one IP (your Nginx box) so rate limiting blocks
            everyone at once. What is misconfigured, and where is the fix?
          </p>
        </div>
      </section>
    </div>
  );
}
