export default function BehavioralPatternsTemplateMethodArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Template Method defines the skeleton of an algorithm in a base class, with certain steps
          deferred to subclasses, so the overall sequence stays fixed while individual steps vary.
          Where Strategy swaps an entire algorithm behind an interface, Template Method fixes the
          algorithm's shape and varies only specific steps inside it &mdash; a different way of
          applying Encapsulate Variation, at a finer grain.
        </p>
        <p>
          Intent: define an algorithm's skeleton in one place, deferring some steps to subclasses
          without letting them change the algorithm's overall structure. Applicability: several
          algorithms share the same overall sequence of steps, differing only in how specific
          steps are performed.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Fixing the skeleton, varying the steps, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the fixed sequence shared across variants.</b> Every data import follows
            the same shape: open the source, read records, validate each one, save valid records
            &mdash; whether the source is a CSV file or a REST API.
          </li>
          <li>
            <b>Write the skeleton as a final (non-overridable) method in a base class.</b>{" "}
            <code>DataImporter.run()</code>, calling <code>open()</code>,{" "}
            <code>readRecords()</code>, <code>validate()</code>, and <code>save()</code> in a
            fixed order.
          </li>
          <li>
            <b>Make the varying steps abstract, implemented by subclasses.</b>{" "}
            <code>CsvImporter</code> and <code>ApiImporter</code> each implement{" "}
            <code>open()</code> and <code>readRecords()</code> differently; both share the same{" "}
            <code>validate()</code> and <code>save()</code> if that logic is identical.
          </li>
          <li>
            <b>Keep the sequence itself un-overridable.</b> Marking <code>run()</code> as{" "}
            <code>final</code> guarantees no subclass can reorder or skip steps &mdash; only the
            individual step implementations vary.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 500 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="20" y="20" width="460" height="35" rx="6" />
            <text className="figLabel" x="250" y="42">DataImporter.run() -- fixed sequence, final</text>
            <rect className="box" x="20" y="80" width="100" height="35" rx="5" />
            <text className="boxText" x="70" y="102" fontSize="8">open()</text>
            <rect className="box" x="140" y="80" width="100" height="35" rx="5" />
            <text className="boxText" x="190" y="102" fontSize="8">readRecords()</text>
            <rect className="box" x="260" y="80" width="100" height="35" rx="5" />
            <text className="boxText" x="310" y="102" fontSize="8">validate()</text>
            <rect className="box" x="380" y="80" width="100" height="35" rx="5" />
            <text className="boxText" x="430" y="102" fontSize="8">save()</text>
          </svg>
          <figcaption>The sequence and its order are fixed; open() and readRecords() are the steps each subclass implements differently.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A fixed sequence with two abstract steps</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`abstract class DataImporter {
    final void run() { // final: the sequence itself can never be overridden
        open();
        List<Record> records = readRecords();
        List<Record> valid = records.stream().filter(this::validate).toList();
        save(valid);
    }
    abstract void open();
    abstract List<Record> readRecords();
    boolean validate(Record r) { return r.isComplete(); } // shared default, overridable if needed
    void save(List<Record> records) { repository.saveAll(records); } // shared default
}

class CsvImporter extends DataImporter {
    void open() { /* open file handle */ }
    List<Record> readRecords() { /* parse CSV rows */ return List.of(); }
}
class ApiImporter extends DataImporter {
    void open() { /* authenticate against the API */ }
    List<Record> readRecords() { /* page through API results */ return List.of(); }
}

new CsvImporter().run(); // same sequence, different open()/readRecords()`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Leaving the skeleton method overridable.</b> Without <code>final</code>, a subclass
            could override <code>run()</code> itself and break the guaranteed sequence &mdash; the
            whole point of the pattern.
          </li>
          <li>
            <b>Making too many steps abstract, leaving nothing actually shared.</b> If every step
            is abstract with no shared default logic, the base class isn't providing much beyond
            documentation of the sequence &mdash; worth checking whether Strategy fits better.
          </li>
          <li>
            <b>Confusing Template Method with Strategy.</b> Template Method varies individual
            steps inside one fixed algorithm shape via inheritance; Strategy varies the entire
            algorithm via composition &mdash; different tools for a similar-sounding goal.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is <code>DataImporter.run()</code> declared <code>final</code> instead of being left open for subclasses to override?</p>
          <p>
            <b>Answer:</b> Template Method's guarantee is that the overall algorithm's structure
            &mdash; open, read, validate, save, in that order &mdash; never changes, only the
            individual steps do. If <code>run()</code> could be overridden, a subclass could skip
            validation or reorder steps, breaking that guarantee entirely.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Template Method when several variants share one fixed algorithmic sequence and
        differ only in specific steps &mdash; lock the sequence itself down, and let subclasses
        implement only the steps that genuinely vary.
      </p>
    </div>
  );
}
