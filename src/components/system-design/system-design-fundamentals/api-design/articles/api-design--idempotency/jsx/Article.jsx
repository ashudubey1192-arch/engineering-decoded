import "../../../../conceptArticle.css";
import "../css/Article.css";

export default function ApiDesignIdempotencyArticle() {
  return (
    <div className="dedicatedStructuredArticle sdConcept">
      <section id="overview">
        <p className="lead">
          An operation is idempotent if doing it once and doing it many times have the exact same
          effect. Ask for the light to be &quot;on&quot; five times &mdash; it is still just on.
        </p>
        <p>
          This matters because networks fail. A client that does not get a response cannot tell
          &quot;it failed&quot; from &quot;it worked but the reply was lost&quot;, so it retries. If
          the operation is idempotent, retrying is safe.
        </p>

        <div className="scenarioBox">
          <small>A REAL SCENARIO</small>
          <p>
            A customer taps &quot;Pay &#8377;2,000&quot;. The request reaches your server, the charge
            succeeds, but the response times out on the way back. The app shows an error, the
            customer taps again. Without idempotency you just charged them <b>&#8377;4,000</b>. With
            it, the server recognises the retry and returns the <i>original</i> result &mdash; one
            charge.
          </p>
        </div>
      </section>

      <section id="concepts">
        <h2>1. Which HTTP methods are idempotent?</h2>
        <table className="miniTable">
          <caption>BY THE HTTP SPEC</caption>
          <thead>
            <tr>
              <th>Method</th>
              <th>Idempotent?</th>
              <th>Why</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GET</td>
              <td>Yes</td>
              <td>Reading changes nothing</td>
            </tr>
            <tr>
              <td>PUT</td>
              <td>Yes</td>
              <td>&quot;Set the resource to X&quot; &mdash; same result every time</td>
            </tr>
            <tr>
              <td>DELETE</td>
              <td>Yes</td>
              <td>Deleting an already-deleted thing is still &quot;gone&quot;</td>
            </tr>
            <tr>
              <td>POST</td>
              <td>No</td>
              <td>&quot;Create a new one&quot; &mdash; twice makes two</td>
            </tr>
            <tr>
              <td>PATCH</td>
              <td>Not necessarily</td>
              <td>
                <code>balance += 10</code> is not; <code>balance = 50</code> is
              </td>
            </tr>
          </tbody>
        </table>

        <h2>2. Making POST safe: the idempotency key</h2>
        <p>
          The client generates a unique ID (a UUID) for the operation and sends it as a header:{" "}
          <code>Idempotency-Key: 7c3e-...-9f</code>. The server remembers, for a while, what result
          it produced for each key.
        </p>
        <figure className="fig">
          <svg viewBox="0 0 640 170" role="img" aria-labelledby="idemTitle">
            <title id="idemTitle">
              First request with a key does the work and stores the result; a retry with the same key
              returns the stored result without repeating the work.
            </title>
            <rect className="box" x="20" y="30" width="90" height="34" />
            <text className="boxText" x="65" y="51">
              request 1
            </text>
            <line className="flow" x1="110" y1="47" x2="200" y2="47" />
            <text className="figHint" x="155" y="37">
              key=abc
            </text>
            <rect className="boxAccent" x="200" y="55" width="150" height="44" />
            <text className="boxText" x="275" y="72">
              key seen before?
            </text>
            <text className="boxText" x="275" y="88">
              no &rarr; charge, store
            </text>
            <line className="flow" x1="350" y1="77" x2="440" y2="77" />
            <rect className="box" x="440" y="55" width="120" height="44" />
            <text className="boxText" x="500" y="81">
              200 + result
            </text>
            <rect className="boxWarn" x="20" y="115" width="90" height="34" />
            <text className="boxText" x="65" y="136">
              retry
            </text>
            <line className="flowMuted" x1="110" y1="132" x2="200" y2="110" />
            <text className="figHint" x="330" y="140">
              key=abc seen &rarr; return stored 200, no second charge
            </text>
          </svg>
          <figcaption>
            The key ties &quot;this intent&quot; to &quot;this result&quot; so retries are free of
            side effects.
          </figcaption>
        </figure>

        <h2>3. Idempotent vs safe</h2>
        <p>
          <b>Safe</b> = no side effects at all (GET). <b>Idempotent</b> = side effects, but repeating
          does not add more. All safe methods are idempotent; not all idempotent methods are safe.
        </p>
      </section>

      <section id="example">
        <h2>4. Step by step: an idempotent &quot;create order&quot;</h2>
        <ol className="stepList">
          <li>
            <b>Client</b> creates <code>key = uuid()</code> once, before the first attempt, and keeps
            it for all retries of this order.
          </li>
          <li>
            <b>POST /orders</b> with header <code>Idempotency-Key: {`{key}`}</code> and the order
            body.
          </li>
          <li>
            <b>Server checks a key store</b> (Redis, a DB table) inside a transaction. Not found
            &rarr; lock the key, create the order, save{" "}
            <code>{`{key -> orderId, response}`}</code> with a 24h TTL.
          </li>
          <li>
            <b>Server responds</b> <code>201</code> with the order.
          </li>
          <li>
            <b>Timeout, client retries</b> with the same key. Server finds the key &rarr; returns the
            stored <code>201</code> and the same order. No duplicate.
          </li>
          <li>
            <b>Edge case:</b> same key, <i>different</i> body &rarr; return <code>422</code> &mdash;
            the client is confused, do not silently pick one.
          </li>
        </ol>
        <div className="takeaway">
          Anything that moves money, sends a message, or creates a record should accept an
          idempotency key. It is the difference between &quot;safe to retry&quot; and &quot;pray the
          network holds&quot;.
        </div>
      </section>

      <section id="mistakes">
        <h2>5. Common mistakes</h2>
        <div className="mistakeGrid">
          <div>
            <b>01</b>
            <h3>Generating the key per attempt</h3>
            <p>
              If the client makes a new UUID for the retry, the server sees a brand-new operation and
              does it again. One key per <i>intent</i>.
            </p>
          </div>
          <div>
            <b>02</b>
            <h3>Non-atomic key check</h3>
            <p>
              Check-then-write without a lock lets two concurrent retries both pass the check and
              both charge. Use a transaction or an atomic insert.
            </p>
          </div>
          <div>
            <b>03</b>
            <h3>Assuming PATCH is idempotent</h3>
            <p>
              <code>{`{"op": "increment", "by": 1}`}</code> doubles on retry. Prefer set-style
              updates or protect them with a key.
            </p>
          </div>
        </div>
      </section>

      <section id="check">
        <h2>6. Knowledge check</h2>
        <div className="quiz">
          <p>
            A mobile client sends <code>POST /transfers</code> and the connection drops before the
            response. It retries twice. What must the server have in place so the user is not
            debited three times, and where should the &quot;have I seen this before?&quot; check
            live?
          </p>
        </div>
      </section>
    </div>
  );
}
