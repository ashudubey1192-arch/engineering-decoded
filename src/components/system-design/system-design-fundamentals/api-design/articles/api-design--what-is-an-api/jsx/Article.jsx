import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiDesignWhatIsAnApiArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          An API (Application Programming Interface) is a contract that lets one piece of software ask
          another to do something or return data &mdash; without knowing how it works inside.
        </p>
        <p>
          It defines <i>what</i> you can ask for, <i>how</i> to ask, and <i>what</i> you get back. The
          implementation behind it can change freely as long as the contract holds.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            Your app shows a weather widget. You do not run weather satellites &mdash; you call{" "}
            <code>GET https://api.weather.com/v1/current?city=Delhi</code> and get back{" "}
            <code>{`{"tempC": 34, "condition": "Haze"}`}</code>. You never see their databases,
            servers, or models. The API is the small, stable doorway into a huge system you know
            nothing about.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. The restaurant analogy</h2>
        <figure className="fig">
          <svg viewBox="0 0 640 150" role="img" aria-labelledby="apiTitle">
            <title id="apiTitle">
              The client is a diner, the API is the waiter and menu, the server is the kitchen.
            </title>
            <rect className="box" x="30" y="55" width="120" height="44" />
            <text className="boxText" x="90" y="75">
              Client
            </text>
            <text className="boxText" x="90" y="91">
              (diner)
            </text>
            <line className="flow" x1="150" y1="70" x2="250" y2="70" />
            <text className="figHint" x="200" y="60">
              request (order)
            </text>
            <line className="flow" x1="250" y1="88" x2="150" y2="88" />
            <text className="figHint" x="200" y="108">
              response (food)
            </text>
            <rect className="boxAccent" x="250" y="50" width="130" height="54" />
            <text className="boxText" x="315" y="73">
              API
            </text>
            <text className="boxText" x="315" y="89">
              (waiter + menu)
            </text>
            <line className="flow" x1="380" y1="77" x2="470" y2="77" />
            <rect className="box" x="470" y="50" width="130" height="54" />
            <text className="boxText" x="535" y="73">
              Server
            </text>
            <text className="boxText" x="535" y="89">
              (kitchen)
            </text>
          </svg>
          <figcaption>
            You order from the menu (the documented endpoints), the waiter carries the request, the
            kitchen does the work. You never walk into the kitchen.
          </figcaption>
        </figure>

        <h2>2. Kinds of API you will meet</h2>
        <table className="miniTable">
          <caption>NOT ALL APIS ARE WEB APIS</caption>
          <thead>
            <tr>
              <th>Type</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Web API (HTTP)</td>
              <td>Stripe, Google Maps, your own backend&apos;s <code>/api</code></td>
            </tr>
            <tr>
              <td>Library / SDK API</td>
              <td>
                <code>Array.map()</code>, <code>requests.get()</code> &mdash; functions you call in
                code
              </td>
            </tr>
            <tr>
              <td>Operating system API</td>
              <td>&quot;open a file&quot;, &quot;get the GPS location&quot;</td>
            </tr>
            <tr>
              <td>Hardware API</td>
              <td>How a driver talks to a graphics card</td>
            </tr>
          </tbody>
        </table>
        <p>In system design, &quot;API&quot; almost always means a web API over HTTP.</p>

        <h2>3. What a good API contract specifies</h2>
        <ul>
          <li>
            <b>Endpoints / methods</b> &mdash; <code>GET /users/{`{id}`}</code>,{" "}
            <code>POST /orders</code>.
          </li>
          <li>
            <b>Inputs</b> &mdash; path params, query params, headers, request body schema.
          </li>
          <li>
            <b>Outputs</b> &mdash; response body schema, status codes, error format.
          </li>
          <li>
            <b>Rules</b> &mdash; auth required, rate limits, pagination, versioning.
          </li>
        </ul>
      </section>

      <section id="example">
        <h2>4. Step by step: designing your first endpoint</h2>
        <ol className="stepList">
          <li>
            <b>Name the resource, not the action.</b> <code>/orders</code>, not{" "}
            <code>/createOrder</code>. The HTTP method is the verb.
          </li>
          <li>
            <b>Pick the method.</b> Create &rarr; <code>POST /orders</code>. Read one &rarr;{" "}
            <code>GET /orders/{`{id}`}</code>. Read many &rarr; <code>GET /orders</code>.
          </li>
          <li>
            <b>Define the request body.</b>{" "}
            <code>{`{"items": [{"sku": "A1", "qty": 2}], "address_id": 9}`}</code>.
          </li>
          <li>
            <b>Define the response.</b> <code>201 Created</code>, body ={" "}
            <code>{`{"id": 501, "status": "pending", "total": 780}`}</code>, header{" "}
            <code>Location: /orders/501</code>.
          </li>
          <li>
            <b>Define the errors.</b> <code>400</code> for bad input, <code>401</code> if not logged
            in, <code>422</code> if the item is out of stock &mdash; each with a consistent error
            body.
          </li>
          <li>
            <b>Write it down.</b> An OpenAPI / Swagger spec so clients can build against it before the
            code exists.
          </li>
        </ol>
        <div className="takeaway">
          The API is a promise. Once other teams build against it, changing its shape breaks them
          &mdash; which is why versioning and careful design matter from day one.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Leaking the database</h3>
            <p>
              Returning raw table rows ties your API to your schema. Map to a response model so
              storage can change without breaking clients.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Verbs in the URL</h3>
            <p>
              <code>/getUser</code>, <code>/deleteUser</code> reinvent HTTP badly. Use nouns +
              methods.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>No written contract</h3>
            <p>
              &quot;Read the code&quot; is not a contract. Without a spec, every integrator guesses
              differently.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            Design the request and response for &quot;mark notification 88 as read&quot; as a REST
            endpoint. Which method, which URL, which status code on success?
          </p>
        </div>
      </section>
    </div>
  );
}
