export default function CreationalPatternsBuilderArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Builder separates the construction of a complex object from its representation, so the
          same step-by-step construction process can produce different configurations, and a
          caller never has to face a constructor with ten optional parameters. Where Factory
          Method and Abstract Factory answer "which class," Builder answers "how do I assemble one
          object that has a lot of optional pieces."
        </p>
        <p>
          Intent: construct a complex object step by step, with the same process producing
          different representations. Applicability: an object has many optional fields, and the
          combination of "required" telescoping constructors would be unreadable.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Applying Builder, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify a constructor drowning in optional parameters.</b> An{" "}
            <code>HttpRequest</code> with a method, URL, and eight optional fields (headers, body,
            timeout, retries, and more) that most callers only set a few of.
          </li>
          <li>
            <b>Create a builder class holding the same fields, with fluent setter methods.</b>{" "}
            Each setter returns <code>this</code>, so calls chain into a readable sequence.
          </li>
          <li>
            <b>Give unset optional fields sensible defaults inside the builder.</b> A caller who
            never calls <code>.timeout()</code> gets a documented default, not an unset field
            causing a later null-pointer.
          </li>
          <li>
            <b>Validate and assemble the final immutable object only in <code>build()</code>.</b>{" "}
            Required-field checks happen once, in one place, rather than being the caller's
            responsibility to remember.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 520 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="130" height="50" rx="8" />
            <text className="boxText" x="85" y="68" fontSize="10">.method(GET)</text>
            <text className="figHint" x="85" y="85">chained call</text>
            <line className="flow" x1="150" y1="70" x2="190" y2="70" />
            <rect className="box" x="190" y="45" width="130" height="50" rx="8" />
            <text className="boxText" x="255" y="68" fontSize="10">.timeout(5s)</text>
            <line className="flow" x1="320" y1="70" x2="360" y2="70" />
            <rect className="boxAccent" x="360" y="45" width="130" height="50" rx="8" />
            <text className="boxText" x="425" y="68" fontSize="10">.build()</text>
            <text className="figHint" x="425" y="85">validates, assembles</text>
          </svg>
          <figcaption>Each chained call sets one field; the object itself is only assembled and validated at the very end.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A fluent builder replacing a telescoping constructor</h2>
        <span className="codeLabel">JAVA &mdash; TELESCOPING CONSTRUCTOR</span>
        <div className="codeBlock">
          <pre>{`// which boolean is which at the call site? unreadable without checking the signature
HttpRequest request = new HttpRequest("GET", url, null, null, 5000, 3, false, true);`}</pre>
        </div>
        <span className="codeLabel">JAVA &mdash; BUILDER</span>
        <div className="codeBlock">
          <pre>{`class HttpRequestBuilder {
    private String method = "GET", url; private int timeoutMs = 3000, retries = 0;
    HttpRequestBuilder method(String m) { this.method = m; return this; }
    HttpRequestBuilder url(String u) { this.url = u; return this; }
    HttpRequestBuilder timeout(int ms) { this.timeoutMs = ms; return this; }
    HttpRequestBuilder retries(int n) { this.retries = n; return this; }
    HttpRequest build() {
        if (url == null) throw new IllegalStateException("url is required");
        return new HttpRequest(method, url, timeoutMs, retries);
    }
}

HttpRequest request = new HttpRequestBuilder()
    .url("https://api.example.com/orders")
    .timeout(5000)
    .retries(3)
    .build(); // every field is self-explanatory at the call site`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Reaching for Builder when an object has only one or two optional fields.</b> A
            constructor with one optional parameter and a sensible overload doesn't need a builder
            &mdash; the readability problem Builder solves hasn't actually appeared yet.
          </li>
          <li>
            <b>Making the built object mutable after <code>build()</code>.</b> Part of Builder's
            value is producing a fully-validated, often-immutable object; skipping that leaves
            validation and mutability holes the pattern was meant to close.
          </li>
          <li>
            <b>Skipping validation in <code>build()</code> and pushing it back onto callers.</b>{" "}
            Centralizing validation in one place is one of the pattern's main benefits &mdash;
            omitting it loses most of the value while keeping the extra class.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>HttpRequestBuilder.build()</code> check that <code>url</code> is set, rather than requiring it as the builder's constructor argument?</p>
          <p>
            <b>Answer:</b> Requiring it in the constructor would reintroduce a required-parameter
            call site, defeating some of the fluent readability Builder provides. Validating in
            <code> build()</code> instead means every field is set through the same uniform
            chained-call style, and the one validation point guarantees no caller can produce an
            invalid <code>HttpRequest</code> by forgetting a required field.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Builder when an object has enough optional configuration that a constructor call
        would stop being self-explanatory &mdash; chain readable setter calls, and validate once,
        centrally, in <code>build()</code>.
      </p>
    </div>
  );
}
