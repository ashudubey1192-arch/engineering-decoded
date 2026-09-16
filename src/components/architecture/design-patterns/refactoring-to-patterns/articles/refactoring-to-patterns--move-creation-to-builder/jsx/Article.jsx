export default function RefactoringToPatternsMoveCreationToBuilderArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Move Creation to Builder takes a constructor that's accumulated so many parameters
          &mdash; especially optional ones &mdash; that call sites have become error-prone strings
          of positional arguments, and replaces it with a builder that sets each value by name,
          one call at a time, in any order.
        </p>
        <p>
          This is the refactoring path into Creational Patterns' Builder article, which covers
          the resulting structure in depth; this one covers recognizing when a constructor's
          parameter list has become the problem.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The refactoring, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Notice a constructor with many parameters, especially several optional ones.</b>{" "}
            A <code>HttpRequest</code> constructor taking a URL, method, headers, body, timeout,
            and three retry-related flags &mdash; most calls only need two or three of them.
          </li>
          <li>
            <b>Introduce a builder class with one method per parameter.</b>{" "}
            <code>HttpRequestBuilder</code> with <code>url()</code>, <code>method()</code>,{" "}
            <code>header()</code>, each returning the builder itself for chaining.
          </li>
          <li>
            <b>Give unset parameters sensible defaults inside the builder.</b> A default HTTP
            method of <code>GET</code>, a default timeout of 30 seconds, so callers only specify
            what differs from the default.
          </li>
          <li>
            <b>Replace call sites with the fluent builder chain.</b> A call site that used to
            pass eight positional arguments (several as <code>null</code> or default placeholders)
            now names only the two or three values it actually needs.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 110" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="35" width="180" height="40" rx="6" />
            <text className="boxText" x="110" y="52" fontSize="7">new HttpRequest(url, "GET",</text>
            <text className="boxText" x="110" y="66" fontSize="7">null, null, 30, false, 0, null)</text>
            <line className="flow" x1="200" y1="55" x2="260" y2="55" />
            <rect className="boxAccent" x="260" y="30" width="200" height="50" rx="6" />
            <text className="boxText" x="360" y="50" fontSize="7">new HttpRequestBuilder()</text>
            <text className="boxText" x="360" y="65" fontSize="7">.url(url).timeout(10).build()</text>
          </svg>
          <figcaption>An eight-argument positional call becomes a named, chainable sequence that only sets what actually varies.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Before and after</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Before: which argument is which? easy to mix up, hard to read at the call site
class HttpRequest {
    HttpRequest(String url, String method, Map<String,String> headers, String body,
                int timeoutSeconds, boolean followRedirects, int maxRedirects, String proxyHost) { /* ... */ }
}
HttpRequest request = new HttpRequest("https://api.example.com", "GET", null, null, 30, false, 0, null);

// After: named, chainable, defaults handled once
class HttpRequestBuilder {
    private String url;
    private String method = "GET"; // sensible default
    private final Map<String, String> headers = new HashMap<>();
    private String body;
    private int timeoutSeconds = 30; // sensible default

    HttpRequestBuilder url(String url) { this.url = url; return this; }
    HttpRequestBuilder method(String method) { this.method = method; return this; }
    HttpRequestBuilder header(String key, String value) { headers.put(key, value); return this; }
    HttpRequestBuilder timeout(int seconds) { this.timeoutSeconds = seconds; return this; }
    HttpRequest build() { return new HttpRequest(url, method, headers, body, timeoutSeconds); }
}

HttpRequest request = new HttpRequestBuilder()
    .url("https://api.example.com")
    .timeout(10)
    .build(); // only the two values that actually differ from the defaults`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Introducing a builder for a constructor with two or three required parameters.</b>{" "}
            A small, fully-required parameter list is already clear; a builder adds ceremony
            without solving a real readability problem.
          </li>
          <li>
            <b>Letting <code>build()</code> return an object in an invalid state.</b> If{" "}
            <code>url</code> is genuinely required, <code>build()</code> should validate that
            it's set and throw clearly, rather than producing an <code>HttpRequest</code> with a{" "}
            <code>null</code> URL.
          </li>
          <li>
            <b>Making the builder mutable and shared across threads.</b> A builder instance
            being reused or shared concurrently while its fields are being set can produce
            objects built from a half-configured, racing state.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is <code>new HttpRequestBuilder().url(...).timeout(10).build()</code> less error-prone at the call site than the original eight-argument constructor call, even though both ultimately construct the same kind of object?</p>
          <p>
            <b>Answer:</b> The builder's methods are named, so each value is clearly labeled
            (<code>timeout(10)</code> can't be confused with any other parameter), and only the
            values that differ from the defaults need to be specified at all. The original
            constructor call required passing all eight arguments positionally, including{" "}
            <code>null</code> and placeholder values for unused ones, making it easy to
            accidentally swap two arguments of the same type without any compiler warning.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Move Creation to Builder replaces an error-prone, many-parameter constructor with a
        named, chainable sequence &mdash; the win grows with the number of optional parameters,
        and shrinks to nothing for a constructor that's already small and fully required.
      </p>
    </div>
  );
}
