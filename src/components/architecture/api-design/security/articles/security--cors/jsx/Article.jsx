import "../css/Article.css";

export default function SecurityCorsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          CORS protects users, not APIs &mdash; it's a browser-enforced rule about which websites
          are allowed to read a cross-origin response via JavaScript, and it's entirely irrelevant
          to server-to-server calls that never pass through a browser.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Same-origin policy</b> &mdash; by default, a browser blocks a page's JavaScript from reading a response from a different origin.</li>
          <li><b>CORS headers</b> &mdash; <code>Access-Control-Allow-Origin</code> and friends are an explicit, server-controlled opt-in that relaxes that default for specific origins.</li>
          <li><b>Preflight requests</b> &mdash; for non-simple requests, the browser sends an <code>OPTIONS</code> request first to check permission before sending the real one.</li>
          <li><b>Not a security boundary by itself</b> &mdash; CORS is enforced by browsers; a non-browser client (curl, a backend service) simply ignores it entirely.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's partner dashboard is a web app calling Parcelly's API directly from browser
          JavaScript, so Parcelly must explicitly allow that origin:
        </p>
        <span className="codeLabel">RESPONSE TO THE DASHBOARD'S BROWSER REQUEST</span>
        <div className="codeBlock">
          <pre>{`Access-Control-Allow-Origin: https://dashboard.parcelly.com
Access-Control-Allow-Methods: GET, POST, PATCH
Access-Control-Allow-Headers: Authorization, Content-Type`}</pre>
        </div>
        <p>
          A partner's own backend calling the same API to create shipments is completely unaffected
          by any of this &mdash; there's no browser involved, so there's no origin for CORS to
          check in the first place. Authentication (the API key) is what actually protects that
          call; CORS was never in the picture.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 130" role="img" aria-label="Diagram contrasting a browser, which enforces CORS and blocks JavaScript from reading a disallowed cross-origin response, against a non-browser client like curl or a backend service, which ignores CORS headers entirely.">
          <text x="105" y="18" className="figLabel">BROWSER</text>
          <rect className="box" x="30" y="35" width="150" height="30" rx="5" />
          <text x="105" y="54" className="boxText" style={{fontSize:"6px"}}>fetch() from page JS</text>
          <rect className="boxWarn" x="30" y="80" width="150" height="30" rx="5" />
          <text x="105" y="99" className="boxText" style={{fontSize:"6px"}}>CORS check enforced</text>
          <line className="flow" x1="105" y1="65" x2="105" y2="78" />

          <line className="divider" x1="230" y1="10" x2="230" y2="120" />

          <text x="335" y="18" className="figLabel">NON-BROWSER</text>
          <rect className="box" x="260" y="35" width="150" height="30" rx="5" />
          <text x="335" y="54" className="boxText" style={{fontSize:"6px"}}>curl / backend service</text>
          <rect className="boxAccent" x="260" y="80" width="150" height="30" rx="5" />
          <text x="335" y="99" className="boxText" style={{fontSize:"5.5px"}}>CORS headers ignored entirely</text>
          <line className="flow" x1="335" y1="65" x2="335" y2="78" />
        </svg>
        <figcaption>The same CORS headers mean something to a browser and nothing at all to a non-browser client.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Setting <code>Access-Control-Allow-Origin: *</code> on an endpoint that relies on
          browser-held credentials (like a session cookie) is a genuinely dangerous combination
          &mdash; it lets JavaScript on any website make credentialed requests on a logged-in
          user's behalf, which is exactly what same-origin protection exists to prevent. The other
          common mistake is treating CORS as a security boundary at all: it stops a browser from
          letting a malicious page read a response, but it does nothing to stop a direct,
          non-browser request from reaching the API &mdash; that's authentication's job.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does setting Access-Control-Allow-Origin: * on Parcelly's API do nothing to stop a script running outside a browser from calling it?</p>
        </div>
      </section>
      <p className="takeaway">
        CORS decides which websites a browser will let read a response, nothing more &mdash; keep
        it scoped to real, known origins, and rely on authentication, not CORS, to actually secure
        the endpoint.
      </p>
    </div>
  );
}
