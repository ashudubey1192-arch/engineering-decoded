import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiDesignRestApiDesignArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          REST is a style for HTTP APIs built around <b>resources</b> (nouns) that you act on with
          standard <b>HTTP methods</b> (verbs). <code>GET /users/7</code> reads user 7;{" "}
          <code>DELETE /users/7</code> removes it.
        </p>
        <p>
          It is popular because it reuses everything HTTP already gives you: methods, status codes,
          caching, and a URL for every thing.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A new developer wants to list a user&apos;s recent orders. With a well-designed REST API
            they guess <code>GET /users/7/orders?status=shipped&amp;limit=20</code> &mdash; and it
            works, first try, no docs. Good REST design makes the API predictable: once you learn one
            endpoint, you can guess the rest.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Resources and methods</h2>
        <table className="miniTable">
          <caption>THE STANDARD CRUD MAPPING</caption>
          <thead>
            <tr>
              <th>Action</th>
              <th>Method + path</th>
              <th>Success code</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>List orders</td>
              <td>
                <code>GET /orders</code>
              </td>
              <td>200</td>
            </tr>
            <tr>
              <td>Get one order</td>
              <td>
                <code>GET /orders/42</code>
              </td>
              <td>200 (or 404)</td>
            </tr>
            <tr>
              <td>Create an order</td>
              <td>
                <code>POST /orders</code>
              </td>
              <td>201 + <code>Location</code></td>
            </tr>
            <tr>
              <td>Replace an order</td>
              <td>
                <code>PUT /orders/42</code>
              </td>
              <td>200</td>
            </tr>
            <tr>
              <td>Update some fields</td>
              <td>
                <code>PATCH /orders/42</code>
              </td>
              <td>200</td>
            </tr>
            <tr>
              <td>Cancel / delete</td>
              <td>
                <code>DELETE /orders/42</code>
              </td>
              <td>204</td>
            </tr>
          </tbody>
        </table>

        <h2>2. Design rules that keep it predictable</h2>
        <ul>
          <li>
            <b>Plural nouns:</b> <code>/orders</code>, not <code>/order</code> or{" "}
            <code>/getOrders</code>.
          </li>
          <li>
            <b>Nest for ownership:</b> <code>/users/7/orders</code> reads &quot;orders of user
            7&quot;.
          </li>
          <li>
            <b>Filter, sort, paginate with query params:</b>{" "}
            <code>?status=open&amp;sort=-created_at&amp;page=2</code>.
          </li>
          <li>
            <b>Use status codes honestly:</b> 201 on create, 404 when missing, 409 on conflict, 422
            on validation errors.
          </li>
          <li>
            <b>One error shape everywhere:</b>{" "}
            <code>{`{"error": {"code": "OUT_OF_STOCK", "message": "..."}}`}</code>.
          </li>
          <li>
            <b>Version the API:</b> <code>/v1/orders</code> or an <code>Accept</code> header, so you
            can evolve without breaking clients.
          </li>
        </ul>

        <figure className="fig">
          <svg viewBox="0 0 640 130" role="img" aria-labelledby="restTitle">
            <title id="restTitle">
              One base URL, resources as paths, methods as the verbs acting on them.
            </title>
            <rect className="boxAccent" x="40" y="50" width="180" height="34" />
            <text className="boxText" x="130" y="71">
              api.shop.com/v1
            </text>
            <line className="flow" x1="220" y1="67" x2="270" y2="67" />
            <rect className="box" x="270" y="30" width="150" height="24" />
            <text className="boxText" x="345" y="47">
              GET /products
            </text>
            <rect className="box" x="270" y="59" width="150" height="24" />
            <text className="boxText" x="345" y="76">
              POST /orders
            </text>
            <rect className="box" x="270" y="88" width="150" height="24" />
            <text className="boxText" x="345" y="105">
              DELETE /cart/9
            </text>
          </svg>
          <figcaption>
            The URL locates the <i>thing</i>; the method says <i>what to do</i> to it.
          </figcaption>
        </figure>
      </section>

      <section id="example">
        <h2>3. Step by step: designing a &quot;comments&quot; API</h2>
        <ol className="stepList">
          <li>
            <b>Identify the resource:</b> a comment belongs to a post &rarr; base is{" "}
            <code>/posts/{`{postId}`}/comments</code>.
          </li>
          <li>
            <b>List:</b> <code>GET /posts/12/comments?sort=-created_at&amp;limit=20&amp;cursor=abc</code>{" "}
            &rarr; 200 with an array and a <code>next_cursor</code>.
          </li>
          <li>
            <b>Create:</b> <code>POST /posts/12/comments</code> body{" "}
            <code>{`{"body": "Nice!"}`}</code> &rarr; 201, <code>Location: /comments/501</code>.
          </li>
          <li>
            <b>Edit:</b> <code>PATCH /comments/501</code> body <code>{`{"body": "Edited"}`}</code>{" "}
            &rarr; 200. Return 403 if it is not the author.
          </li>
          <li>
            <b>Delete:</b> <code>DELETE /comments/501</code> &rarr; 204. A repeat call also returns
            204 (idempotent).
          </li>
          <li>
            <b>Errors:</b> post not found &rarr; 404; empty body &rarr; 422 with the field that
            failed.
          </li>
        </ol>
        <div className="takeaway">
          A REST API is well designed when a developer can predict an endpoint they have never seen
          from the pattern of the ones they have.
        </div>
      </section>

      <section id="mistakes">
        <h2>4. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Actions as endpoints</h3>
            <p>
              <code>POST /orders/42/cancel</code> creeps in everywhere. Prefer a state change:{" "}
              <code>PATCH /orders/42</code> with <code>{`{"status": "cancelled"}`}</code>.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>200 for everything</h3>
            <p>
              Returning 200 with <code>{`{"ok": false}`}</code> breaks caches, retries, and generic
              clients. Use the real status code.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Offset pagination on big tables</h3>
            <p>
              <code>?page=5000</code> forces the DB to scan and skip millions of rows. Use
              cursor / keyset pagination.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>5. Knowledge check</h2>
        <div className="quiz">
          <p>
            Design the endpoints to (a) list a user&apos;s wishlists, (b) add a product to wishlist
            9, (c) remove it. Give method, path, and success status for each.
          </p>
        </div>
      </section>
    </div>
  );
}
