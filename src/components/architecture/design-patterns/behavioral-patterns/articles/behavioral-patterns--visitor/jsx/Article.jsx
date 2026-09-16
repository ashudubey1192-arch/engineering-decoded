export default function BehavioralPatternsVisitorArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Visitor lets a new operation be added to a group of related classes without modifying
          those classes, by moving the operation into a separate visitor object and having each
          class accept the visitor. It's a genuinely advanced pattern &mdash; closing this section
          because it earns its complexity in a specific, narrow situation: a stable class
          hierarchy that needs many new, unrelated operations added over time.
        </p>
        <p>
          Intent: represent an operation to be performed on the elements of a class hierarchy,
          without modifying the classes of the elements it operates on. Applicability: the class
          hierarchy is stable, but new operations across it are added frequently, and modifying
          every class for every new operation has become the real cost.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Double dispatch, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Confirm the hierarchy is genuinely stable, and operations are what's growing.</b> A{" "}
            <code>Shape</code> hierarchy (<code>Circle</code>, <code>Square</code>,{" "}
            <code>Triangle</code>) rarely gets new shape types, but regularly needs new
            operations: area, perimeter, export to SVG, export to PDF.
          </li>
          <li>
            <b>Define a visitor interface with one method per element type.</b>{" "}
            <code>ShapeVisitor</code>, with <code>visit(Circle)</code>,{" "}
            <code>visit(Square)</code>, <code>visit(Triangle)</code>.
          </li>
          <li>
            <b>Give each element an <code>accept(visitor)</code> method that calls back into the
            visitor.</b> <code>Circle.accept(visitor)</code> calls{" "}
            <code>visitor.visit(this)</code> &mdash; this is the "double dispatch": which{" "}
            <code>visit()</code> overload runs depends on both the element's real type and the
            visitor's real type.
          </li>
          <li>
            <b>Add a new operation as one new visitor class, touching no element class.</b> A{" "}
            <code>SvgExportVisitor</code> implementing all three <code>visit()</code> methods adds
            SVG export without editing <code>Circle</code>, <code>Square</code>, or{" "}
            <code>Triangle</code> at all.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="110" height="35" rx="5" />
            <text className="boxText" x="75" y="42" fontSize="9">Circle</text>
            <rect className="box" x="20" y="65" width="110" height="35" rx="5" />
            <text className="boxText" x="75" y="87" fontSize="9">Square</text>
            <rect className="box" x="20" y="110" width="110" height="35" rx="5" />
            <text className="boxText" x="75" y="132" fontSize="9">Triangle</text>
            <line className="flow" x1="130" y1="37" x2="200" y2="60" />
            <line className="flow" x1="130" y1="82" x2="200" y2="70" />
            <line className="flow" x1="130" y1="127" x2="200" y2="80" />
            <rect className="boxAccent" x="200" y="55" width="150" height="35" rx="6" />
            <text className="boxText" x="275" y="77" fontSize="9">AreaVisitor</text>
            <text className="figHint" x="420" y="35">one new visitor per</text>
            <text className="figHint" x="420" y="50">new operation, not</text>
            <text className="figHint" x="420" y="65">a new shape method</text>
          </svg>
          <figcaption>Every shape accepts a visitor; each new operation is a new visitor class, not a new method on every shape.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Adding an operation with zero changes to the shapes</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface ShapeVisitor { double visit(Circle c); double visit(Square s); }

interface Shape { double accept(ShapeVisitor visitor); }

class Circle implements Shape {
    final double radius;
    Circle(double radius) { this.radius = radius; }
    public double accept(ShapeVisitor visitor) { return visitor.visit(this); } // double dispatch
}
class Square implements Shape {
    final double side;
    Square(double side) { this.side = side; }
    public double accept(ShapeVisitor visitor) { return visitor.visit(this); }
}

class AreaVisitor implements ShapeVisitor {
    public double visit(Circle c) { return Math.PI * c.radius * c.radius; }
    public double visit(Square s) { return s.side * s.side; }
}
class PerimeterVisitor implements ShapeVisitor { // added later -- zero changes to Circle or Square
    public double visit(Circle c) { return 2 * Math.PI * c.radius; }
    public double visit(Square s) { return 4 * s.side; }
}

double area = shape.accept(new AreaVisitor());
double perimeter = shape.accept(new PerimeterVisitor());`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Applying Visitor to a hierarchy that gains new element types often.</b> Every new
            shape type forces every existing visitor to add a new <code>visit()</code> overload
            &mdash; the pattern inverts the cost from "editing shapes" to "editing every visitor,"
            which is only a win if operations, not element types, are what actually grows.
          </li>
          <li>
            <b>Forgetting <code>accept()</code> and calling <code>visitor.visit(shape)</code>{" "}
            directly from generic code.</b> Without going through <code>accept()</code>, the
            compiler resolves the overload by the static (compile-time) type, not the shape's
            actual runtime type &mdash; breaking the double dispatch the pattern depends on.
          </li>
          <li>
            <b>Reaching for Visitor when a simple method on each shape would do.</b> If only one
            or two operations will ever exist, adding a method directly to each shape class is far
            simpler than the visitor machinery.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does adding <code>PerimeterVisitor</code> require zero changes to <code>Circle</code> or <code>Square</code>, while adding a new shape type (say, <code>Triangle</code>) would require changes to both <code>AreaVisitor</code> and <code>PerimeterVisitor</code>?</p>
          <p>
            <b>Answer:</b> Visitor inverts the usual trade-off: operations are cheap to add (one
            new visitor class implementing existing <code>visit()</code> signatures), but element
            types are expensive to add (every existing visitor needs a new overload). It's the
            right fit specifically when the hierarchy is stable and operations are what keeps
            growing &mdash; the reverse situation would favor putting methods directly on the
            shapes instead.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Visitor only when a stable class hierarchy needs many new, unrelated operations
        over time &mdash; double dispatch through <code>accept()</code> lets each new operation
        arrive as one new visitor class, at the cost of every element type staying hard to add.
      </p>
    </div>
  );
}
