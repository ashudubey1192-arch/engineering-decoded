import "../css/Article.css";

export default function AdvancedSecurityPasswordManagementArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Password management is how a system stores user passwords so that even if the database
          is stolen, attackers can't easily recover the original passwords — the core technique is
          hashing, done specifically so it's slow.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A password is never stored directly — only its <b>hash</b> is stored, and a login check
          re-hashes the entered password and compares hashes. But a fast, general-purpose hash
          (like plain SHA-256) is a poor fit: attackers can hash billions of guesses per second on
          modern hardware. Password-specific hashing algorithms (bcrypt, Argon2, scrypt) are
          deliberately slow and tunable, making large-scale guessing attacks impractically
          expensive. Each password is also combined with a unique, random <b>salt</b> before
          hashing, so two users with the same password get completely different stored hashes —
          defeating precomputed lookup-table attacks.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>User creates a password.</b> A unique random salt is generated for this user.</li>
          <li><b>Hash with a slow algorithm.</b> The password and salt are combined and hashed
            with bcrypt (or similar) — deliberately taking a noticeable fraction of a second.</li>
          <li><b>Store only the salt and hash</b> — never the original password.</li>
          <li><b>Login later:</b> re-hash the entered password with the stored salt, and compare
            to the stored hash. If the database is later stolen, an attacker faces the same slow
            hashing cost for every single guess, against every single unique salt.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a password combined with a unique random salt and run through a deliberately slow hashing algorithm, with only the resulting salt and hash stored, never the original password." >
          <rect className="box" x="20" y="45" width="90" height="28" rx="4" /><text x="65" y="63" className="boxText">password</text>
          <rect className="box" x="20" y="80" width="90" height="24" rx="4" /><text x="65" y="96" className="boxText">salt</text>
          <line className="flow" x1="110" y1="55" x2="170" y2="65" /><line className="flow" x1="110" y1="90" x2="170" y2="70" />
          <rect className="boxAccent" x="180" y="50" width="110" height="34" rx="5" /><text x="235" y="72" className="boxText">slow hash</text>
          <line className="flow" x1="290" y1="67" x2="330" y2="67" />
          <rect className="box" x="340" y="52" width="70" height="30" rx="4" /><text x="375" y="71" className="boxText">stored</text>
        </svg>
        <figcaption>A unique salt and a deliberately slow hash — the original password is never stored anywhere.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Using a fast, general-purpose hash function for passwords (MD5, SHA-256 alone) is a
          serious, well-known mistake — it's specifically the wrong tool because it's too fast,
          making brute-force attacks cheap. Skipping a unique salt per user, or reusing one global
          salt, leaves the system vulnerable to precomputed rainbow-table attacks across the whole
          user base at once.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a fast hash function like plain SHA-256 a poor choice for storing passwords, even though it's cryptographically secure in other contexts?</p>
        </div>
      </section>
      <p className="takeaway">
        Password security comes from hashing that's deliberately slow, combined with a unique salt
        per user — making large-scale guessing attacks impractical even if the password database
        is stolen.
      </p>
    </div>
  );
}
