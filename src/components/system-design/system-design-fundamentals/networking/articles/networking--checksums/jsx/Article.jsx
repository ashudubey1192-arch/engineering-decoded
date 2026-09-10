import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function NetworkingChecksumsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          A checksum is a small value computed from a block of data. Send it alongside the data;
          recompute it on arrival. If the two differ, the data was corrupted in transit.
        </p>
        <p>
          It is an <b>error-detection</b> tool, not error correction and not security. It answers one
          question: &quot;did these bytes arrive exactly as they left?&quot;.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You download a 4 GB Linux ISO. The site also lists a{" "}
            <code>SHA-256</code> hash. You run the hash on your file and compare. Match &rarr; every
            one of 4 billion bytes is intact. Mismatch &rarr; a flipped bit somewhere (bad cable,
            flaky RAM, truncated download) and booting it would fail in a confusing way. The checksum
            caught it in 5 seconds.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Where checksums already protect you</h2>
        <table className="miniTable">
          <caption>CHECKSUMS IN THE STACK</caption>
          <thead>
            <tr>
              <th>Layer</th>
              <th>Checksum</th>
              <th>Covers</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Ethernet (L2)</td>
              <td>CRC-32 (FCS)</td>
              <td>Each frame on each hop</td>
            </tr>
            <tr>
              <td>IP (L3)</td>
              <td>Header checksum (IPv4)</td>
              <td>The IP header only</td>
            </tr>
            <tr>
              <td>TCP / UDP (L4)</td>
              <td>16-bit checksum</td>
              <td>Header + payload, end to end</td>
            </tr>
            <tr>
              <td>Application</td>
              <td>MD5, SHA-256, CRC</td>
              <td>Whole files, messages, DB pages</td>
            </tr>
          </tbody>
        </table>
        <p>
          A corrupted TCP segment fails its checksum and is silently retransmitted &mdash; you never
          see it. The rare bad bytes that slip through are ones that happen to still match a weak
          16-bit checksum, which is why big files add a strong application-level hash.
        </p>

        <h2>2. How a simple checksum works</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="ckTitle">
            <title id="ckTitle">
              Sender computes a checksum over the data and appends it; receiver recomputes and
              compares.
            </title>
            <rect className="box" x="20" y="55" width="150" height="40" />
            <text className="boxText" x="95" y="72">
              data
            </text>
            <text className="boxText" x="95" y="88">
              [12, 44, 7, 91]
            </text>
            <line className="flow" x1="170" y1="75" x2="230" y2="75" />
            <rect className="boxAccent" x="230" y="55" width="120" height="40" />
            <text className="boxText" x="290" y="72">
              sum mod 256
            </text>
            <text className="boxText" x="290" y="88">
              = 154
            </text>
            <line className="flow" x1="350" y1="75" x2="410" y2="75" />
            <rect className="box" x="410" y="55" width="210" height="40" />
            <text className="boxText" x="515" y="72">
              send: [12, 44, 7, 91] + 154
            </text>
            <text className="figHint" x="320" y="125">
              receiver re-sums &rarr; 154? keep. 153? reject.
            </text>
          </svg>
          <figcaption>
            Real checksums (CRC, Adler-32) use polynomial math so that common errors &mdash; burst
            flips, reordering, dropped bytes &mdash; are almost always caught.
          </figcaption>
        </figure>

        <h2>3. Checksum vs hash vs signature</h2>
        <ul>
          <li>
            <b>Checksum (CRC):</b> catches accidental corruption. Fast. An attacker can easily forge
            one.
          </li>
          <li>
            <b>Cryptographic hash (SHA-256):</b> also catches deliberate tampering &mdash;
            practically impossible to find two inputs with the same hash.
          </li>
          <li>
            <b>Digital signature:</b> a hash encrypted with a private key &mdash; proves <i>who</i>{" "}
            produced the data, not just that it is intact.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: verifying a download</h2>
        <ol className="stepList">
          <li>
            <b>Publisher</b> computes <code>sha256(app-1.2.0.zip)</code> and publishes it next to the
            file.
          </li>
          <li>
            <b>You download</b> the zip. Somewhere in transit, byte 900,001 flips from{" "}
            <code>0x41</code> to <code>0x40</code>.
          </li>
          <li>
            <b>You run</b> <code>sha256sum app-1.2.0.zip</code> locally.
          </li>
          <li>
            <b>Compare.</b> One flipped bit changes about half the hash&apos;s bits &mdash; the values
            are obviously different.
          </li>
          <li>
            <b>Act.</b> Re-download. If it still mismatches, suspect your disk or RAM, or a
            man-in-the-middle.
          </li>
        </ol>
        <div className="takeaway">
          TCP&apos;s checksum protects the wire; an application hash protects everything else &mdash;
          disk writes, proxies, CDN caches, and storage that TCP never saw.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Trusting a checksum for security</h3>
            <p>
              CRC and even MD5 can be forged. If tampering is a concern, use SHA-256 and ideally a
              signature.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Assuming TCP makes hashes unnecessary</h3>
            <p>
              TCP&apos;s 16-bit checksum is weak and only covers the network path, not disk or
              memory. Large data still needs a strong end-to-end hash.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Checksumming after the corruption</h3>
            <p>
              Computing the hash on the server <i>after</i> a bad upload just certifies the broken
              file. Verify as close to the source as possible.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            TCP already checksums every segment. Give two reasons a file-transfer service still
            computes a SHA-256 of each uploaded file.
          </p>
        </div>
      </section>
    </div>
  );
}
