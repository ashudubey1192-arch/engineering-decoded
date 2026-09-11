import "../css/Article.css";

export default function AdvancedSecuritySslTlsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          TLS (the modern successor to SSL) is what makes HTTPS secure — it encrypts traffic
          between a client and server, and it verifies the server is actually who it claims to be,
          both before a single byte of application data is exchanged.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A TLS connection starts with a <b>handshake</b>: the server presents a certificate
          (issued and signed by a trusted certificate authority) proving its identity; the client
          verifies that signature against authorities it already trusts. Client and server then use{" "}
          <b>asymmetric encryption</b> (public/private key pairs) briefly, just to safely agree on
          a shared secret — asymmetric encryption is computationally expensive, so it's used only
          for this initial exchange. From then on, they switch to fast{" "}
          <b>symmetric encryption</b> using that shared secret for the actual data — combining
          asymmetric's ability to establish trust with symmetric's speed for bulk traffic.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Client connects to https://bank.example.com.</b> The server presents its TLS
            certificate.</li>
          <li><b>Client verifies the certificate</b> — is it signed by a trusted authority, is it
            unexpired, and does its domain name actually match bank.example.com?</li>
          <li><b>Handshake establishes a shared secret,</b> using asymmetric cryptography briefly
            for this one exchange.</li>
          <li><b>All further traffic is encrypted</b> with fast symmetric encryption using that
            shared secret — safe from eavesdropping, and the client can trust it's really talking
            to the bank, not an impersonator.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of a TLS handshake where the client verifies the server's certificate and both agree on a shared secret using asymmetric cryptography, then switch to fast symmetric encryption for the rest of the connection." >
          <rect className="box" x="20" y="20" width="90" height="28" rx="4" /><text x="65" y="38" className="boxText">client</text>
          <rect className="box" x="310" y="20" width="90" height="28" rx="4" /><text x="355" y="38" className="boxText">server</text>
          <line className="flow" x1="110" y1="34" x2="300" y2="34" /><text x="210" y="24" className="figHint" textAnchor="middle">handshake: verify cert, agree on secret</text>
          <line className="flowMuted" x1="110" y1="80" x2="300" y2="80" /><text x="210" y="70" className="figHint" textAnchor="middle">encrypted traffic (fast, symmetric)</text>
        </svg>
        <figcaption>A brief asymmetric handshake establishes trust and a shared secret; fast symmetric encryption handles the rest.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Ignoring certificate expiration monitoring is a surprisingly common cause of real
          outages — an expired certificate breaks every client's connection the moment it lapses.
          Disabling certificate validation "temporarily" to work around an error (a common
          debugging shortcut) removes the entire identity-verification guarantee TLS provides,
          and is easy to forget to re-enable.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does TLS use slow asymmetric encryption only briefly during the handshake, switching to fast symmetric encryption for the actual data?</p>
        </div>
      </section>
      <p className="takeaway">
        TLS combines asymmetric cryptography's ability to establish verified trust with symmetric
        encryption's speed — the handshake proves identity once, then fast encryption protects
        everything that follows.
      </p>
    </div>
  );
}
