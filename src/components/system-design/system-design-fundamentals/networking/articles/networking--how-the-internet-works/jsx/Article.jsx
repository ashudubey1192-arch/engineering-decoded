import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function NetworkingHowTheInternetWorksArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          The internet is a network of networks. When you open a website, your request is broken into
          small packets that hop across many independent networks and are reassembled at the other
          end.
        </p>
        <p>
          Nobody owns the whole internet. It works because everyone agrees on a small set of rules
          (protocols) for addressing, routing, and delivering those packets.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You type <b>engineering-decoded.com</b> and hit enter. In under a second your laptop
            found the server&apos;s address, opened a connection across maybe 15 different networks,
            asked for the page, and got it back &mdash; all through cables, radio links, and routers
            owned by dozens of separate companies. This lesson walks that second in slow motion.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The key players</h2>
        <table className="miniTable">
          <caption>WHO DOES WHAT</caption>
          <thead>
            <tr>
              <th>Piece</th>
              <th>Job</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Client</td>
              <td>Your device &mdash; starts the request (browser, app)</td>
            </tr>
            <tr>
              <td>Server</td>
              <td>A machine that stores the site and answers requests</td>
            </tr>
            <tr>
              <td>Router</td>
              <td>Forwards packets one hop closer to the destination</td>
            </tr>
            <tr>
              <td>ISP</td>
              <td>Internet Service Provider &mdash; connects you to the wider internet</td>
            </tr>
            <tr>
              <td>DNS</td>
              <td>The &quot;phone book&quot; that turns a name into an IP address</td>
            </tr>
            <tr>
              <td>IP</td>
              <td>The addressing + routing rules every packet follows</td>
            </tr>
            <tr>
              <td>TCP</td>
              <td>Makes an unreliable packet stream look like a reliable pipe</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Packets, not phone calls</h2>
        <p>
          Your data is not sent as one long stream. It is chopped into <b>packets</b> of about
          1,500 bytes. Each packet carries the source and destination IP address and finds its own
          way. Two packets from the same request can take different routes and still arrive.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 640 170" role="img" aria-labelledby="netTitle">
            <title id="netTitle">
              A request travels from your device through your router and ISP, across the internet
              backbone, to the destination server, then back.
            </title>
            <rect className="box" x="15" y="65" width="80" height="42" />
            <text className="boxText" x="55" y="90">
              You
            </text>
            <line className="flow" x1="95" y1="86" x2="140" y2="86" />
            <rect className="box" x="140" y="65" width="80" height="42" />
            <text className="boxText" x="180" y="90">
              Router
            </text>
            <line className="flow" x1="220" y1="86" x2="265" y2="86" />
            <rect className="box" x="265" y="65" width="70" height="42" />
            <text className="boxText" x="300" y="90">
              ISP
            </text>
            <line className="flow" x1="335" y1="86" x2="380" y2="86" />
            <rect className="boxAccent" x="380" y="55" width="120" height="62" />
            <text className="boxText" x="440" y="82">
              Internet
            </text>
            <text className="boxText" x="440" y="98">
              (many routers)
            </text>
            <line className="flow" x1="500" y1="86" x2="545" y2="86" />
            <rect className="box" x="545" y="65" width="80" height="42" />
            <text className="boxText" x="585" y="90">
              Server
            </text>
          </svg>
          <figcaption>
            Every hop only knows &quot;which neighbour gets this packet next?&quot; &mdash; no single
            router knows the whole path.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>3. Step by step: loading a web page</h2>
        <ol className="stepList">
          <li>
            <b>Name &rarr; address (DNS).</b> Your device asks a DNS resolver for the IP of
            <b> engineering-decoded.com</b> and gets back something like <b>76.76.21.21</b>.
          </li>
          <li>
            <b>Open a connection (TCP).</b> Your device and the server exchange a 3-message handshake
            (SYN, SYN-ACK, ACK) to agree to talk.
          </li>
          <li>
            <b>Secure it (TLS).</b> For HTTPS, they swap certificates and keys so the rest of the
            conversation is encrypted.
          </li>
          <li>
            <b>Send the request (HTTP).</b> Your device sends <code>GET / HTTP/1.1</code> plus
            headers.
          </li>
          <li>
            <b>Route the packets (IP).</b> Each packet hops router-to-router. Routers read the
            destination IP and forward toward it; TTL stops loops.
          </li>
          <li>
            <b>Server responds.</b> It sends back the HTML, then the browser requests CSS, JS, and
            images the same way.
          </li>
          <li>
            <b>Reassemble &amp; render.</b> TCP puts packets back in order, the browser builds the
            page.
          </li>
        </ol>
        <div className="takeaway">
          Each layer solves one problem and trusts the layer below: DNS names, IP routing, TCP
          reliability, TLS privacy, HTTP meaning. That separation is why the internet can grow
          without a redesign.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common misconceptions</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>&quot;There is a direct line to the server&quot;</h3>
            <p>
              There is no dedicated wire. Packets share links with millions of other flows and are
              routed hop by hop.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>&quot;The internet and the web are the same&quot;</h3>
            <p>
              The internet is the infrastructure (IP, TCP, routers). The web (HTTP, HTML) is just one
              application running on top of it, like email or video calls.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>&quot;Packets always take the same path&quot;</h3>
            <p>
              Routes change with congestion and outages. The network self-heals by picking another
              path.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            List, in order, the four protocols involved between typing a URL and seeing the HTML, and
            say in one line what each one is responsible for.
          </p>
        </div>
      </section>
    </div>
  );
}
