import "../css/Article.css";

export default function AdvancedSecuritySecretsManagementArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Secrets management is how a system handles sensitive credentials — API keys, database
          passwords, encryption keys — safely: never hardcoded, never committed to source control,
          and issued to services with tight, auditable access control.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A dedicated secrets manager (HashiCorp Vault, AWS Secrets Manager) stores secrets
          centrally, encrypted, and hands them out to services at runtime through an authenticated
          API call — instead of secrets being baked into config files, environment variables set
          by hand, or worst of all, committed directly into source code. This gives centralized
          access control (who or what can read which secret), a full audit log of every access,
          and the ability to <b>rotate</b> a secret (issue a new one and retire the old) without
          redeploying every service that uses it.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A service needs a database password.</b> Instead of it being hardcoded, the
            service authenticates to the secrets manager at startup and requests it.</li>
          <li><b>Secrets manager verifies the service's identity</b> and returns the current
            password, logging the access.</li>
          <li><b>The password needs to rotate</b> (routine security practice, or in response to a
            suspected leak). A new password is generated and the old one retired in the secrets
            manager.</li>
          <li><b>Services pick up the new value</b> on their next request to the secrets manager
            — no code change or manual credential distribution needed.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 120" role="img" aria-label="Diagram of a service authenticating to a centralized secrets manager at runtime to retrieve a credential, instead of having that credential hardcoded or stored in a config file." >
          <rect className="box" x="30" y="45" width="120" height="30" rx="5" /><text x="90" y="65" className="boxText">service</text>
          <line className="flow" x1="150" y1="60" x2="250" y2="60" /><text x="200" y="45" className="figHint">authenticated request</text>
          <rect className="boxAccent" x="260" y="45" width="140" height="30" rx="5" /><text x="330" y="65" className="boxText">secrets manager</text>
          <text x="200" y="95" className="figHint" textAnchor="middle">no secret ever lives in source code or a config file</text>
        </svg>
        <figcaption>Secrets are fetched at runtime through an authenticated, audited request — never hardcoded.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Committing a secret to source control, even briefly or in a private repository, is a
          serious and common mistake — once committed, it should be considered compromised and
          rotated, since git history is hard to truly scrub. Granting overly broad access (every
          service can read every secret) also defeats much of the value — access should be scoped
          to exactly what each service actually needs.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does storing secrets in a dedicated secrets manager make credential rotation far easier than hardcoding secrets in each service?</p>
        </div>
      </section>
      <p className="takeaway">
        Centralized, audited secrets management replaces hardcoded credentials with authenticated,
        revocable, rotatable access — turning a leaked secret from a catastrophe into a
        manageable, logged event.
      </p>
    </div>
  );
}
