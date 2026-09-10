import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function NetworkingOsiModelArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          The OSI model is a 7-layer map of networking. Each layer does one job and talks only to the
          layers directly above and below it. It is a teaching tool for &quot;where does this problem
          live?&quot;.
        </p>
        <p>
          Real systems use the simpler 4-layer TCP/IP model, but OSI&apos;s vocabulary (&quot;that is
          a layer 7 load balancer&quot;, &quot;a layer 2 switch&quot;) is everywhere.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A page will not load. Is it DNS (layer 7-ish), a firewall blocking a port (layer 4), a
            bad cable or wifi (layer 1&ndash;2), or wrong routing (layer 3)? Naming the layer turns
            &quot;the internet is broken&quot; into a checklist you can walk top-down or
            bottom-up.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The seven layers</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 300" role="img" aria-labelledby="osiTitle">
            <title id="osiTitle">
              Layers 7 to 1: Application, Presentation, Session, Transport, Network, Data Link,
              Physical.
            </title>
            <rect className="boxAccent" x="60" y="15" width="520" height="34" />
            <text className="boxText" x="320" y="37">
              7 Application &mdash; HTTP, DNS, SMTP (the data you care about)
            </text>
            <rect className="box" x="60" y="53" width="520" height="34" />
            <text className="boxText" x="320" y="75">
              6 Presentation &mdash; TLS encryption, compression, encoding
            </text>
            <rect className="box" x="60" y="91" width="520" height="34" />
            <text className="boxText" x="320" y="113">
              5 Session &mdash; open / keep / close a conversation
            </text>
            <rect className="boxAccent" x="60" y="129" width="520" height="34" />
            <text className="boxText" x="320" y="151">
              4 Transport &mdash; TCP / UDP, ports, reliability
            </text>
            <rect className="boxAccent" x="60" y="167" width="520" height="34" />
            <text className="boxText" x="320" y="189">
              3 Network &mdash; IP addresses, routing between networks
            </text>
            <rect className="box" x="60" y="205" width="520" height="34" />
            <text className="boxText" x="320" y="227">
              2 Data Link &mdash; MAC addresses, switches, one local hop
            </text>
            <rect className="box" x="60" y="243" width="520" height="34" />
            <text className="boxText" x="320" y="265">
              1 Physical &mdash; cables, radio, voltages, bits on a wire
            </text>
          </svg>
          <figcaption>
            Mnemonic (top to bottom): <b>A</b>ll <b>P</b>eople <b>S</b>eem <b>T</b>o <b>N</b>eed{" "}
            <b>D</b>ata <b>P</b>rocessing.
          </figcaption>
        </figure>

        <h2>2. What each layer adds</h2>
        <table className="miniTable">
          <caption>LAYER, UNIT, AND A REAL EXAMPLE</caption>
          <thead>
            <tr>
              <th>Layer</th>
              <th>Data unit</th>
              <th>You touch it as</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>7 Application</td>
              <td>Message</td>
              <td>A REST call, a GraphQL query</td>
            </tr>
            <tr>
              <td>4 Transport</td>
              <td>Segment</td>
              <td>Opening a socket on port 443</td>
            </tr>
            <tr>
              <td>3 Network</td>
              <td>Packet</td>
              <td>Setting a route or a subnet</td>
            </tr>
            <tr>
              <td>2 Data Link</td>
              <td>Frame</td>
              <td>A switch, a VLAN, an ARP entry</td>
            </tr>
            <tr>
              <td>1 Physical</td>
              <td>Bits</td>
              <td>Plugging in the ethernet cable</td>
            </tr>
          </tbody>
        </table>

        <h2>3. OSI vs TCP/IP</h2>
        <p>
          The TCP/IP model collapses OSI into four: <b>Application</b> (OSI 5&ndash;7),{" "}
          <b>Transport</b> (4), <b>Internet</b> (3), <b>Link</b> (1&ndash;2). When engineers say
          &quot;layer 7&quot; they usually just mean &quot;the application looks at the actual
          request&quot;, and &quot;layer 4&quot; means &quot;it only looks at IP and port&quot;.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: a message going down and up the stack</h2>
        <ol className="stepList">
          <li>
            <b>L7:</b> your app builds <code>GET /orders</code>.
          </li>
          <li>
            <b>L6:</b> TLS encrypts it.
          </li>
          <li>
            <b>L4:</b> TCP wraps it in a segment, adds source/destination <b>ports</b>, sequence
            numbers.
          </li>
          <li>
            <b>L3:</b> IP wraps that in a packet, adds source/destination <b>IP addresses</b>.
          </li>
          <li>
            <b>L2:</b> the NIC wraps it in a frame with the next hop&apos;s <b>MAC address</b>.
          </li>
          <li>
            <b>L1:</b> the frame becomes electrical / optical / radio signals on the wire.
          </li>
          <li>
            <b>At the server</b> each layer unwraps its header in reverse until L7 hands the plain{" "}
            <code>GET /orders</code> to the application.
          </li>
        </ol>
        <div className="takeaway">
          Each layer only reads its own header and trusts the rest. That is why you can swap wifi for
          ethernet (L1/L2) without changing a line of your HTTP code (L7).
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Treating OSI as literal implementation</h3>
            <p>
              Real stacks do not have clean layer 5 and 6 components. OSI is a mental model, TCP/IP
              is what runs.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Confusing L4 and L7 load balancing</h3>
            <p>
              An L4 balancer routes by IP/port only (fast, protocol-agnostic). An L7 balancer reads
              the URL and headers (routing by path, TLS termination) &mdash; different capabilities.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Debugging at the wrong layer</h3>
            <p>
              Rewriting application code when the real problem is a firewall dropping a port, or DNS
              returning the wrong record.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            For each, name the OSI layer: (a) a switch forwarding by MAC address, (b) choosing TCP vs
            UDP, (c) picking a backend based on the URL path, (d) an IP routing table.
          </p>
        </div>
      </section>
    </div>
  );
}
