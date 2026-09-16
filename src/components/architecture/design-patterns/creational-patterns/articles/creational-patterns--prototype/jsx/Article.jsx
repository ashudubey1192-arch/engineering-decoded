export default function CreationalPatternsPrototypeArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Prototype creates new objects by copying an existing, fully-configured instance rather
          than building one from scratch. It's the right call when constructing an object from raw
          inputs is expensive or complex, but a similar, already-built instance is available to
          clone and adjust. Where Builder assembles an object step by step, Prototype starts from
          a finished one and copies it.
        </p>
        <p>
          Intent: specify the kinds of objects to create using a prototypical instance, and create
          new objects by copying it. Applicability: object creation is expensive relative to
          copying, or the exact class to instantiate should be determined by which prototype is
          chosen, not by naming a concrete class.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Applying Prototype, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify an expensive-to-build, cheap-to-copy object.</b> A{" "}
            <code>DocumentTemplate</code> that's loaded from disk, parsed, and validated once
            &mdash; expensive to build, but trivial to duplicate in memory once built.
          </li>
          <li>
            <b>Add a <code>clone()</code> method that produces an independent copy.</b> "Independent"
            is the key word &mdash; mutating the copy must never affect the original prototype.
          </li>
          <li>
            <b>Distinguish shallow copy from deep copy deliberately.</b> If the object holds
            mutable collections or nested objects, a shallow copy would share those references;
            <code> clone()</code> must deep-copy anything the caller is expected to mutate
            independently.
          </li>
          <li>
            <b>Keep a registry of prototypes when multiple variants exist.</b> A{" "}
            <code>Map&lt;String, DocumentTemplate&gt;</code> of prototypes, looked up by name,
            replaces "construct the right concrete class" with "clone the right registered
            prototype."
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 460 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="30" y="45" width="140" height="50" rx="8" />
            <text className="boxText" x="100" y="68" fontSize="10">Prototype</text>
            <text className="figHint" x="100" y="85">expensive to build</text>
            <line className="flow" x1="170" y1="70" x2="230" y2="70" />
            <rect className="box" x="230" y="20" width="90" height="40" rx="6" />
            <text className="boxText" x="275" y="45" fontSize="9">clone() 1</text>
            <rect className="box" x="230" y="80" width="90" height="40" rx="6" />
            <text className="boxText" x="275" y="105" fontSize="9">clone() 2</text>
            <text className="figHint" x="390" y="70">cheap, independent copies</text>
          </svg>
          <figcaption>The expensive build happens once; every subsequent instance is a cheap, independent clone.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A deep-copying clone, and why it must be deep</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class DocumentTemplate implements Cloneable {
    private String header;
    private List<String> sections; // mutable -- must be deep-copied

    public DocumentTemplate clone() {
        DocumentTemplate copy = new DocumentTemplate();
        copy.header = this.header; // immutable String, shallow copy is fine
        copy.sections = new ArrayList<>(this.sections); // deep copy: a new independent list
        return copy;
    }
}

DocumentTemplate invoicePrototype = loadExpensiveTemplate("invoice.xml"); // built once
DocumentTemplate thisInvoice = invoicePrototype.clone();
thisInvoice.addSection("Line Items"); // does NOT affect invoicePrototype or any other clone`}</pre>
        </div>
        <p>
          If <code>clone()</code> had assigned <code>copy.sections = this.sections</code> directly
          (a shallow copy), every clone would share and corrupt the same list &mdash; the deep
          copy is what makes each clone genuinely independent.
        </p>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Shallow-copying mutable fields by accident.</b> This is the pattern's single most
            common bug: a clone that appears independent until one caller mutates a shared nested
            collection and every other clone sees the change.
          </li>
          <li>
            <b>Using Prototype when construction is actually cheap.</b> If building a fresh
            instance from scratch is simple and fast, cloning adds a layer of copy-semantics
            complexity for no real benefit.
          </li>
          <li>
            <b>Forgetting that a clone can drift from its prototype over time.</b> If the
            prototype itself gets updated later, already-taken clones don't retroactively pick up
            the change &mdash; that's usually desired, but should be a deliberate expectation, not
            a surprise.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why must <code>DocumentTemplate.clone()</code> create a new <code>ArrayList</code> for <code>sections</code> instead of copying the reference directly?</p>
          <p>
            <b>Answer:</b> Copying the reference directly (a shallow copy) would mean every clone
            shares the exact same underlying list object. Calling <code>addSection()</code> on one
            clone would then be visible on the prototype and every other clone too, defeating the
            independence Prototype is supposed to guarantee.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Prototype when building from scratch is expensive but copying an existing
        instance is cheap &mdash; and make every clone a genuinely deep, independent copy, not a
        shared reference in disguise.
      </p>
    </div>
  );
}
