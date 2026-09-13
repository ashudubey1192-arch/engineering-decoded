import "../css/Article.css";

export default function MicroservicesSecuritySecretsManagementArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Secrets management is about never letting a database password, API key, or signing key
          live in source code, a config file checked into version control, or an environment
          variable that any process on the box can read &mdash; because any of those is a leak
          waiting for the moment the repository or the box is exposed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A dedicated secrets manager stores credentials centrally, encrypted at rest, and hands
          them out to services at runtime, scoped to exactly what each service needs &mdash; a
          service authenticates to the secrets manager (often using the same service-identity
          mechanism from earlier lessons), requests only the secrets it's authorized to see, and
          never has them baked into an image or a repository. Rotation &mdash; regularly replacing a
          secret with a new one &mdash; becomes possible precisely because nothing has the old value
          hardcoded anywhere.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          <code>PaymentService</code> needs its database password at startup. Instead of reading it
          from a checked-in config file, it authenticates to the secrets manager using its own
          service identity and fetches the password at boot time:
        </p>
        <span className="codeLabel">FETCHING A SECRET AT RUNTIME</span>
        <div className="codeBlock">
          <pre>{`const dbPassword = await secretsManager.get(
  "payment-service/db-password",
  { identity: serviceIdentity }   // scoped to what payment-service can access
)
// never appears in the repo, the built image, or a plain env var file`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 110" role="img" aria-label="Diagram of PaymentService authenticating to a secrets manager at startup and fetching its database password at runtime, rather than the password being stored anywhere in source code or a config file." >
          <rect className="box" x="20" y="40" width="110" height="28" rx="6" />
          <text x="75" y="58" className="boxText" style={{fontSize:"6.5px"}}>PaymentService</text>
          <rect className="boxAccent" x="260" y="40" width="120" height="28" rx="6" />
          <text x="320" y="58" className="boxText" style={{fontSize:"6.5px"}}>Secrets manager</text>
          <line className="flow" x1="130" y1="54" x2="258" y2="54" />
          <text x="195" y="40" className="figHint" style={{fontSize:"5.5px"}}>authenticate + fetch</text>
          <line className="flowMuted" x1="75" y1="68" x2="75" y2="85" />
          <text x="75" y="98" className="figHint" style={{fontSize:"6px"}}>never in source or config files</text>
        </svg>
        <figcaption>The password is fetched at runtime after authenticating &mdash; it never exists in the repository, the image, or a plain config file at all.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Committing a secret to version control "temporarily" is one of the most common real-world
          security incidents &mdash; even a quick revert doesn't remove it from the repository's
          history, and it needs to be treated as compromised and rotated, not just deleted from the
          latest commit. Storing secrets as plain environment variables passed through a container
          orchestrator's configuration is the subtler version of the same problem: anything with
          access to inspect that configuration, or to the running container itself, can read them
          in plain text.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A database password is accidentally committed to a public repository and removed in the very next commit. Is it still safe to use? Why or why not?</p>
        </div>
      </section>
      <p className="takeaway">
        A secret that's never written to source code, a config file, or a plain environment variable
        can't leak from those places &mdash; fetch it at runtime, scoped to exactly the service that
        needs it, and rotate it on a real schedule.
      </p>
    </div>
  );
}
