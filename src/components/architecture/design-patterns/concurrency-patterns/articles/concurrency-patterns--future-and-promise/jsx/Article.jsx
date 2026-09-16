export default function ConcurrencyPatternsFutureAndPromiseArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Future represents the eventual result of an asynchronous computation as an object that
          exists immediately, even though the value inside it isn't ready yet &mdash; letting
          calling code keep going, chain further work onto it, or wait for it only when the
          result is actually needed.
        </p>
        <p>
          Intent: represent a value that will exist at some point in the future as a first-class
          object, so asynchronous work can be composed and awaited without blocking the caller
          immediately. Applicability: a computation (a network call, a database query, heavy
          work handed to another thread) takes real time, and the caller has other work to do
          before it needs the result.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Representing "not yet" as an object, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Kick off the work and get a future back immediately.</b>{" "}
            <code>CompletableFuture&lt;User&gt; future = fetchUserAsync(id)</code> returns right
            away, before the network call finishes.
          </li>
          <li>
            <b>Chain transformations without blocking.</b>{" "}
            <code>future.thenApply(user -&gt; user.name())</code> registers a transformation that
            runs automatically once the value arrives, without the calling thread waiting.
          </li>
          <li>
            <b>Combine multiple futures.</b>{" "}
            <code>CompletableFuture.allOf(future1, future2)</code> represents "both are done," so
            code can wait for several independent async operations together.
          </li>
          <li>
            <b>Block only where a synchronous result is genuinely required.</b>{" "}
            <code>future.get()</code> or <code>.join()</code> waits for the value, but is used at
            the edge of the async pipeline, not throughout it.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="110" height="30" rx="5" />
            <text className="boxText" x="75" y="64" fontSize="8">fetchUserAsync()</text>
            <line className="flow" x1="130" y1="60" x2="190" y2="60" />
            <rect className="boxAccent" x="190" y="45" width="110" height="30" rx="5" />
            <text className="boxText" x="245" y="64" fontSize="8">Future&lt;User&gt;</text>
            <line className="flowMuted" x1="300" y1="60" x2="360" y2="30" />
            <line className="flowMuted" x1="300" y1="60" x2="360" y2="90" />
            <text className="figHint" x="365" y="28">thenApply(...)</text>
            <text className="figHint" x="365" y="92">join() -- blocks</text>
          </svg>
          <figcaption>The future exists immediately; the caller chooses whether to chain more work or block for the value.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Chaining async work without blocking</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class UserService {
    CompletableFuture<User> fetchUserAsync(String id) {
        return CompletableFuture.supplyAsync(() -> callUserApi(id)); // runs on another thread
    }
    private User callUserApi(String id) { /* blocking network call, off the calling thread */ return new User(id, "Ada"); }
}

class OrderService {
    CompletableFuture<List<Order>> fetchOrdersAsync(String userId) {
        return CompletableFuture.supplyAsync(() -> callOrdersApi(userId));
    }
    private List<Order> callOrdersApi(String userId) { return List.of(); }
}

// Compose two independent async calls without ever blocking until the very end
UserService users = new UserService();
OrderService orders = new OrderService();

CompletableFuture<User> userFuture = users.fetchUserAsync("u1");
CompletableFuture<List<Order>> ordersFuture = orders.fetchOrdersAsync("u1"); // fired concurrently

CompletableFuture<String> summary = userFuture.thenCombine(ordersFuture,
    (user, orderList) -> user.name() + " has " + orderList.size() + " orders");

String result = summary.join(); // blocks only here, at the edge, once both calls are done`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Calling <code>.get()</code> or <code>.join()</code> immediately after starting the future.</b>{" "}
            <code>future.join()</code> right after <code>supplyAsync()</code> blocks the calling
            thread anyway, throwing away every benefit of doing the work asynchronously.
          </li>
          <li>
            <b>Starting two futures sequentially when they don't depend on each other.</b>{" "}
            Calling <code>fetchUserAsync(id).join()</code> and then{" "}
            <code>fetchOrdersAsync(id).join()</code> runs them one after another instead of
            concurrently, losing the parallelism futures are meant to provide.
          </li>
          <li>
            <b>Letting an exception in one future silently vanish.</b> A failed future that's
            never joined or whose exception is never handled can fail silently; use{" "}
            <code>exceptionally()</code> or check the result explicitly.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>In the example, why are <code>userFuture</code> and <code>ordersFuture</code> both fetched before either is joined, rather than calling <code>fetchUserAsync(...).join()</code> followed by <code>fetchOrdersAsync(...).join()</code>?</p>
          <p>
            <b>Answer:</b> Starting both futures first lets the user lookup and the orders lookup
            run concurrently on separate threads, since neither depends on the other's result.
            Joining each one immediately after starting it would force them to run sequentially,
            doubling the total wait time for no benefit &mdash; the whole point of representing
            them as futures is to compose independent async work without blocking between steps.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Future turns "the result isn't ready yet" into a first-class, composable object &mdash;
        the value comes from chaining and combining futures without blocking, and reserving{" "}
        <code>.join()</code> for the one place a synchronous result is truly needed.
      </p>
    </div>
  );
}
