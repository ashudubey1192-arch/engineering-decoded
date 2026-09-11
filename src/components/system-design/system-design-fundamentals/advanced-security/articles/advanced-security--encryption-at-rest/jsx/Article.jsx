import "../css/Article.css";

export default function AdvancedSecurityEncryptionAtRestArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Encryption at rest protects data while it's stored — on disk, in a database, in a
          backup — so that anyone who gains access to the raw storage medium itself (a stolen
          drive, an unauthorized cloud storage read) still can't read the data without the
          encryption key.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          This is a distinct concern from TLS (encryption in transit) — TLS protects data moving
          over the network, but does nothing once that data is written to disk. Encryption at rest
          typically works through a <b>key management system</b> that holds the actual encryption
          keys separately from the encrypted data itself — so that even someone with full access to
          the storage (the encrypted bytes) still needs a separate, controlled path to the keys to
          actually decrypt anything. This separation is what makes stolen storage media, or a
          storage-layer misconfiguration, much less catastrophic on its own.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Database writes are encrypted</b> before being written to disk, using a key
            managed by a separate key management service (KMS) — not stored alongside the data.</li>
          <li><b>A backup of the database is taken</b> and stored in object storage — still
            encrypted, since the encryption happens at the storage layer, not per-backup.</li>
          <li><b>An attacker gains access to the raw storage</b> (a misconfigured bucket
            permission, say) — they get encrypted bytes, not usable data, without also
            compromising the separate KMS.</li>
          <li><b>An authorized application requests decryption</b> through the KMS, which enforces
            its own access controls and audit logging on every key use.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram of encrypted data on disk with the decryption key held separately in a key management service, so access to the raw storage alone is not enough to read the data." >
          <rect className="box" x="30" y="45" width="150" height="40" rx="6" /><text x="105" y="70" className="boxText">encrypted data (disk)</text>
          <rect className="boxAccent" x="250" y="45" width="140" height="40" rx="6" /><text x="320" y="70" className="boxText">key management svc</text>
          <text x="210" y="30" className="figHint" textAnchor="middle">held separately — one alone isn't enough</text>
        </svg>
        <figcaption>Keeping keys separate from the data they protect means stolen storage alone isn't enough to read it.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Storing encryption keys alongside the data they protect (in the same database, the same
          storage bucket) defeats much of the purpose — anyone who accesses the data also gets the
          key. Assuming encryption at rest alone is sufficient security is another gap — it
          protects against stolen storage media specifically, not against a compromised
          application that has legitimate decryption access.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does storing encryption keys separately from the encrypted data matter, rather than just encrypting the data at all?</p>
        </div>
      </section>
      <p className="takeaway">
        Encryption at rest protects stored data from anyone who gains access to the storage
        medium itself — but only if the keys are genuinely kept separate, with their own
        access controls.
      </p>
    </div>
  );
}
