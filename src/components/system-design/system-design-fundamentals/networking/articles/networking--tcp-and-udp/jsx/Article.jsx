import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function NetworkingTcpAndUdpArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          TCP and UDP are the two ways to actually send data over IP. <b>TCP</b> is a reliable,
          ordered connection. <b>UDP</b> is fire-and-forget: fast, no guarantees.
        </p>
        <p>
          IP alone just tosses packets toward an address and hopes. TCP and UDP sit on top and decide
          how much effort to spend making delivery dependable.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You are on a video call while your laptop downloads an OS update. The <b>download</b> uses
            TCP &mdash; if a packet is lost, resend it; a missing byte would corrupt the file. The{" "}
            <b>call</b> uses UDP &mdash; if a packet is lost, skip it; a 200 ms-old slice of audio is
            useless, so do not wait for it. Same network, opposite strategies.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Side by side</h2>
        <table className="miniTable">
          <caption>TCP VS UDP</caption>
          <thead>
            <tr>
              <th>Feature</th>
              <th>TCP</th>
              <th>UDP</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Connection</td>
              <td>Yes &mdash; 3-way handshake first</td>
              <td>No &mdash; just send</td>
            </tr>
            <tr>
              <td>Delivery</td>
              <td>Guaranteed, retransmits lost packets</td>
              <td>Best effort, losses ignored</td>
            </tr>
            <tr>
              <td>Order</td>
              <td>Bytes arrive in order</td>
              <td>Packets may arrive out of order</td>
            </tr>
            <tr>
              <td>Speed / overhead</td>
              <td>Higher latency, more header, flow control</td>
              <td>Minimal &mdash; low latency</td>
            </tr>
            <tr>
              <td>Used by</td>
              <td>HTTP, HTTPS, SSH, database drivers, email</td>
              <td>DNS, video/voice (RTP), gaming, QUIC</td>
            </tr>
          </tbody>
        </table>

        <h2>2. The TCP handshake and teardown</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 170" role="img" aria-labelledby="tcpTitle">
            <title id="tcpTitle">
              TCP opens with SYN, SYN-ACK, ACK before any data, and closes with FIN and ACK.
            </title>
            <text className="figLabel" x="90" y="24">
              CLIENT
            </text>
            <text className="figLabel" x="550" y="24">
              SERVER
            </text>
            <line className="divider" x1="90" y1="30" x2="90" y2="150" />
            <line className="divider" x1="550" y1="30" x2="550" y2="150" />
            <line className="flow" x1="90" y1="45" x2="550" y2="60" />
            <text className="figHint" x="320" y="40">
              SYN (let&apos;s talk)
            </text>
            <line className="flow" x1="550" y1="75" x2="90" y2="90" />
            <text className="figHint" x="320" y="70">
              SYN-ACK (ok, you too)
            </text>
            <line className="flow" x1="90" y1="105" x2="550" y2="120" />
            <text className="figHint" x="320" y="100">
              ACK (confirmed) + data flows
            </text>
          </svg>
          <figcaption>
            That is one full round trip <i>before</i> the first byte of your request &mdash; the cost
            of reliability. Keep-alive connections avoid paying it repeatedly.
          </figcaption>
        </figure>

        <h2>3. What TCP does for you</h2>
        <ul>
          <li>
            <b>Retransmission:</b> unacknowledged segments are sent again.
          </li>
          <li>
            <b>Ordering:</b> each byte has a sequence number; the receiver reassembles in order.
          </li>
          <li>
            <b>Flow control:</b> the receiver advertises a window so a fast sender cannot drown it.
          </li>
          <li>
            <b>Congestion control:</b> the sender slows down when the network drops packets.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: choosing for a new feature</h2>
        <ol className="stepList">
          <li>
            <b>Is every byte essential?</b> File transfer, API call, payment &rarr; <b>TCP</b>.
          </li>
          <li>
            <b>Is fresh data more valuable than complete data?</b> Live audio, sensor telemetry,
            game position &rarr; <b>UDP</b>.
          </li>
          <li>
            <b>Do you need many short request/replies with low latency?</b> DNS uses UDP (one packet
            each way) and only falls back to TCP for large answers.
          </li>
          <li>
            <b>Want UDP&apos;s speed but TCP&apos;s reliability?</b> Use <b>QUIC</b> (the basis of
            HTTP/3): runs on UDP but adds ordering, retransmission, and encryption in user space.
          </li>
        </ol>
        <div className="takeaway">
          Default to TCP. Reach for UDP only when the latency cost of waiting for a lost packet is
          worse than the data loss itself &mdash; then be ready to handle loss in your app.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Opening a new connection per request</h3>
            <p>
              Paying the handshake (and TLS) every time adds one or more round trips. Reuse
              connections with keep-alive / pooling.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Assuming UDP &quot;just works&quot;</h3>
            <p>
              With UDP <i>you</i> handle loss, ordering, and congestion. Skipping that gives choppy
              audio and packet storms.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Ignoring head-of-line blocking</h3>
            <p>
              One lost TCP packet stalls everything behind it. For many parallel streams, HTTP/3
              (QUIC) avoids this.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A multiplayer game sends the player&apos;s position 30 times a second. Which protocol,
            and what must the client do when a position update never arrives?
          </p>
        </div>
      </section>
    </div>
  );
}
