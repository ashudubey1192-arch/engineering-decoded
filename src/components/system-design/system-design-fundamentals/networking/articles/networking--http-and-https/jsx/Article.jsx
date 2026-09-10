import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function NetworkingHttpAndHttpsArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          HTTP is the request/response language of the web: a client asks for a resource, a server
          answers. HTTPS is the same language spoken over an encrypted (TLS) channel.
        </p>
        <p>
          Every page load, API call, and image fetch is an HTTP exchange: a <b>method</b>, a{" "}
          <b>URL</b>, <b>headers</b>, an optional <b>body</b> &mdash; and a response with a{" "}
          <b>status code</b>, headers, and a body.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            You submit a login form. The browser sends{" "}
            <code>POST /login</code> with your credentials in the body. Over plain <b>HTTP</b>, anyone
            on the same wifi can read that password in transit. Over <b>HTTPS</b>, they see only
            encrypted bytes and the destination host. That single difference is why browsers now mark
            HTTP pages &quot;Not secure&quot;.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Anatomy of a request</h2>
        <pre>
          <code>{`POST /api/orders HTTP/1.1
Host: shop.example.com
Authorization: Bearer eyJhbGc...
Content-Type: application/json
Content-Length: 54

{"item":"SKU-42","qty":2}`}</code>
        </pre>
        <p>
          The response mirrors it: a status line (<code>HTTP/1.1 201 Created</code>), headers, blank
          line, body.
        </p>

        <h2>2. Methods and status codes</h2>
        <table className="miniTable">
          <caption>THE PARTS YOU USE DAILY</caption>
          <thead>
            <tr>
              <th>Method</th>
              <th>Meaning</th>
              <th>Safe / idempotent</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GET</td>
              <td>Read a resource</td>
              <td>Yes / Yes</td>
            </tr>
            <tr>
              <td>POST</td>
              <td>Create, or trigger an action</td>
              <td>No / No</td>
            </tr>
            <tr>
              <td>PUT</td>
              <td>Replace a resource wholesale</td>
              <td>No / Yes</td>
            </tr>
            <tr>
              <td>PATCH</td>
              <td>Partially update</td>
              <td>No / No</td>
            </tr>
            <tr>
              <td>DELETE</td>
              <td>Remove a resource</td>
              <td>No / Yes</td>
            </tr>
          </tbody>
        </table>
        <ul>
          <li>
            <b>2xx</b> success (200 OK, 201 Created, 204 No Content)
          </li>
          <li>
            <b>3xx</b> redirect (301 permanent, 302 temporary, 304 Not Modified)
          </li>
          <li>
            <b>4xx</b> client error (400 bad request, 401 unauth, 403 forbidden, 404, 429 rate limit)
          </li>
          <li>
            <b>5xx</b> server error (500, 502 bad gateway, 503 unavailable, 504 timeout)
          </li>
        </ul>

        <h2>3. How HTTPS gets set up</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 160" role="img" aria-labelledby="httpsTitle">
            <title id="httpsTitle">
              After the TCP handshake, TLS exchanges a certificate and keys, then all HTTP data is
              encrypted.
            </title>
            <rect className="box" x="20" y="60" width="90" height="44" />
            <text className="boxText" x="65" y="86">
              Browser
            </text>
            <line className="flow" x1="110" y1="70" x2="520" y2="70" />
            <text className="figHint" x="315" y="60">
              TCP handshake
            </text>
            <line className="flow" x1="110" y1="95" x2="520" y2="95" />
            <text className="figHint" x="315" y="88">
              TLS: cert + key exchange
            </text>
            <line className="flow" x1="110" y1="120" x2="520" y2="120" />
            <text className="figHint" x="315" y="135">
              encrypted HTTP (GET / POST ...)
            </text>
            <rect className="boxAccent" x="520" y="60" width="90" height="44" />
            <text className="boxText" x="565" y="86">
              Server
            </text>
          </svg>
          <figcaption>
            The certificate proves the server really is <code>shop.example.com</code> (signed by a
            Certificate Authority the browser trusts). Then a shared secret encrypts everything.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>4. Step by step: a cached GET</h2>
        <ol className="stepList">
          <li>
            <b>First request:</b> browser sends <code>GET /logo.png</code>. Server replies{" "}
            <code>200 OK</code> with <code>ETag: &quot;abc123&quot;</code> and{" "}
            <code>Cache-Control: max-age=3600</code>.
          </li>
          <li>
            <b>Within the hour:</b> the browser serves <code>logo.png</code> straight from disk
            &mdash; zero network.
          </li>
          <li>
            <b>After an hour:</b> browser revalidates with{" "}
            <code>If-None-Match: &quot;abc123&quot;</code>.
          </li>
          <li>
            <b>Unchanged:</b> server replies <code>304 Not Modified</code> with an empty body &mdash;
            a few bytes instead of re-downloading the image.
          </li>
          <li>
            <b>Changed:</b> server replies <code>200 OK</code> with the new bytes and a new ETag.
          </li>
        </ol>
        <div className="takeaway">
          HTTP is stateless &mdash; each request stands alone. &quot;Sessions&quot; are rebuilt every
          request from a cookie or token the client re-sends.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Using GET to change data</h3>
            <p>
              GET must be safe. Browsers, proxies, and crawlers pre-fetch GETs &mdash;{" "}
              <code>GET /delete?id=5</code> will eventually fire on its own.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Returning 200 for errors</h3>
            <p>
              <code>200 OK</code> with <code>{`{"error":"not found"}`}</code> breaks caching,
              monitoring, and clients. Use the real status code.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Mixed content on HTTPS pages</h3>
            <p>
              An HTTPS page loading an <code>http://</code> script is blocked or downgrades security.
              Serve every asset over HTTPS.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A client calls <code>PUT /users/7</code> three times with the same body. How many times
            does the user get updated, and how is that different from three <code>POST /users</code>{" "}
            calls?
          </p>
        </div>
      </section>
    </div>
  );
}
