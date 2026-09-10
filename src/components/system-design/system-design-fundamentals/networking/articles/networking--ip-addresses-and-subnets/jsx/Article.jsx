import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function NetworkingIpAddressesAndSubnetsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          An IP address is the number that identifies a device on a network so packets can be
          delivered to it. A subnet is a slice of the address space that groups devices that can talk
          directly.
        </p>
        <p>
          IPv4 addresses look like <code>192.168.1.10</code> &mdash; four numbers (0&ndash;255), 32
          bits total. IPv6 looks like <code>2001:db8::7334</code> &mdash; 128 bits, because the world
          ran out of IPv4.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            At home your laptop is <code>192.168.1.23</code> and your phone is{" "}
            <code>192.168.1.24</code>. They reach each other directly. But the whole house shares{" "}
            <b>one</b> public address (say <code>49.36.x.x</code>) that your router hands out. The
            internet only ever sees that one address &mdash; the router translates (NAT) between the
            outside world and your private subnet.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Public vs private addresses</h2>
        <table className="miniTable">
          <caption>ADDRESS RANGES YOU WILL SEE</caption>
          <thead>
            <tr>
              <th>Range</th>
              <th>Type</th>
              <th>Where</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>10.0.0.0/8</td>
              <td>Private</td>
              <td>Big corporate / cloud VPC networks</td>
            </tr>
            <tr>
              <td>172.16.0.0/12</td>
              <td>Private</td>
              <td>Docker, mid-size networks</td>
            </tr>
            <tr>
              <td>192.168.0.0/16</td>
              <td>Private</td>
              <td>Home routers</td>
            </tr>
            <tr>
              <td>127.0.0.0/8</td>
              <td>Loopback</td>
              <td>
                <code>localhost</code> &mdash; the machine itself
              </td>
            </tr>
            <tr>
              <td>everything else</td>
              <td>Public</td>
              <td>Routable on the internet, globally unique</td>
            </tr>
          </tbody>
        </table>

        <h2>2. What the /24 means (CIDR)</h2>
        <p>
          <code>192.168.1.0/24</code> means &quot;the first <b>24 bits</b> are the network, the last
          8 identify the host&quot;. 8 host bits &rarr; 2<sup>8</sup> = 256 addresses, of which 254
          are usable (one is the network address, one is broadcast).
        </p>
        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="cidrTitle">
            <title id="cidrTitle">
              In a /24, the first three octets are the network prefix and the last octet is the host
              number.
            </title>
            <rect className="boxAccent" x="30" y="45" width="330" height="44" />
            <text className="boxText" x="195" y="64">
              192 . 168 . 1
            </text>
            <text className="boxText" x="195" y="80">
              network (24 bits)
            </text>
            <rect className="box" x="370" y="45" width="150" height="44" />
            <text className="boxText" x="445" y="64">
              . 23
            </text>
            <text className="boxText" x="445" y="80">
              host (8 bits)
            </text>
            <text className="figHint" x="280" y="115">
              /24 &rarr; 256 addresses, 254 usable
            </text>
          </svg>
          <figcaption>
            Smaller number after the slash = bigger network. <code>/16</code> holds 65,536
            addresses; <code>/30</code> holds just 4 (handy for a point-to-point link).
          </figcaption>
        </figure>

        <h2>3. Why subnet at all?</h2>
        <ul>
          <li>
            <b>Isolation:</b> put databases in a private subnet with no internet route.
          </li>
          <li>
            <b>Security:</b> firewall rules are written per subnet (&quot;web tier may reach app
            tier on port 8080&quot;).
          </li>
          <li>
            <b>Scale:</b> smaller broadcast domains mean less noise and easier routing.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: are two hosts on the same subnet?</h2>
        <ol className="stepList">
          <li>
            <b>Hosts:</b> A = <code>10.1.4.20/22</code>, B = <code>10.1.5.200/22</code>.
          </li>
          <li>
            <b>/22 = 22 network bits</b> &rarr; the mask is <code>255.255.252.0</code>. The third
            octet&apos;s top 6 bits are fixed, bottom 2 are host space.
          </li>
          <li>
            <b>Network of A:</b> <code>10.1.4.0</code> (4 in binary is <code>000001|00</code>; masked
            &rarr; block starts at 4).
          </li>
          <li>
            <b>Network of B:</b> <code>10.1.4.0</code> as well &mdash; the /22 block covers third
            octets 4, 5, 6, 7.
          </li>
          <li>
            <b>Same network &rarr;</b> A and B talk directly, no router needed. If B were{" "}
            <code>10.1.8.5</code> it would be in the next block and need routing.
          </li>
        </ol>
        <div className="takeaway">
          A device compares its own network prefix with the destination&apos;s. Match &rarr; send
          directly. No match &rarr; hand the packet to the default gateway (router).
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Overlapping CIDR ranges</h3>
            <p>
              Two VPCs both using <code>10.0.0.0/16</code> cannot be peered without pain. Plan
              address space before you build.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Subnets too small</h3>
            <p>
              A <code>/28</code> gives 14 usable IPs. Autoscaling to 20 instances then fails with
              &quot;no free addresses&quot;.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Putting databases in a public subnet</h3>
            <p>
              If it has a route to an internet gateway, it is reachable from the internet. Data
              stores belong in private subnets.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            How many usable host addresses are in a <code>/26</code>? Would <code>172.16.10.5</code>
            and <code>172.16.10.70</code> with a <code>/26</code> mask be able to talk without a
            router?
          </p>
        </div>
      </section>
    </div>
  );
}
