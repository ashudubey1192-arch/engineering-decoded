export default function BehavioralPatternsIteratorArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Iterator provides a way to access the elements of a collection sequentially, without
          exposing how that collection is actually stored internally. Most languages, Java
          included, bake this pattern directly into the standard library &mdash; every{" "}
          <code>Iterable</code> and <code>Iterator</code> you've already used is this pattern,
          which makes it a good one to understand deeply rather than just recognize by name.
        </p>
        <p>
          Intent: provide sequential access to a collection's elements without exposing its
          underlying representation. Applicability: code needs to traverse a collection uniformly,
          regardless of whether it's backed by an array, a linked list, or something more complex.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Separating traversal from storage, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Define a common iterator interface, independent of storage.</b>{" "}
            <code>hasNext()</code> and <code>next()</code> &mdash; the same two methods, whether
            the underlying structure is an array or a tree.
          </li>
          <li>
            <b>Implement traversal logic specific to the storage inside the iterator, not the
            collection's own public API.</b> A <code>BinaryTreeIterator</code> tracks its own
            position in a traversal order (in-order, say); the tree class itself doesn't need to
            expose that logic.
          </li>
          <li>
            <b>Let the collection expose a way to get a fresh iterator, not the traversal state
            itself.</b> Multiple independent iterators over the same collection shouldn't
            interfere with each other.
          </li>
          <li>
            <b>Let calling code depend only on the iterator interface.</b> A loop written against{" "}
            <code>hasNext()</code>/<code>next()</code> works identically whether it's iterating an{" "}
            <code>ArrayList</code> or a custom <code>BinaryTree</code>.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="140" height="40" rx="6" />
            <text className="boxText" x="90" y="68" fontSize="9">BinaryTree</text>
            <line className="flow" x1="160" y1="65" x2="210" y2="65" />
            <rect className="boxAccent" x="210" y="45" width="150" height="40" rx="6" />
            <text className="boxText" x="285" y="68" fontSize="9">BinaryTreeIterator</text>
            <line className="flow" x1="360" y1="65" x2="410" y2="65" />
            <rect className="box" x="410" y="45" width="60" height="40" rx="6" />
            <text className="boxText" x="440" y="68" fontSize="9">Caller</text>
          </svg>
          <figcaption>The caller calls hasNext()/next() uniformly; the iterator alone knows how to walk the tree's actual structure.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A custom iterator over a binary tree, in-order</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class BinaryTree implements Iterable<Integer> {
    Node root;
    public Iterator<Integer> iterator() { return new InOrderIterator(root); }
}

class InOrderIterator implements Iterator<Integer> {
    private final Deque<Node> stack = new ArrayDeque<>();
    InOrderIterator(Node root) { pushLeftSpine(root); }
    private void pushLeftSpine(Node node) { while (node != null) { stack.push(node); node = node.left; } }
    public boolean hasNext() { return !stack.isEmpty(); }
    public Integer next() {
        Node node = stack.pop();
        pushLeftSpine(node.right);
        return node.value;
    }
}

// caller: identical loop shape, whether iterating a List or this custom tree
for (int value : tree) { System.out.println(value); } // no knowledge of Node or the stack at all`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Exposing internal storage directly instead of an iterator.</b> A{" "}
            <code>getNodes()</code> method returning the raw internal structure lets callers
            depend on implementation details the pattern is meant to hide.
          </li>
          <li>
            <b>Sharing mutable iteration state across multiple callers.</b> If two callers ask for
            "the" iterator and get the same shared cursor, iterating with one silently disrupts
            the other &mdash; each call to get an iterator should return an independent one.
          </li>
          <li>
            <b>Mutating the collection while iterating without using the iterator's own removal
            mechanism.</b> Structural changes during iteration, outside the iterator's control,
            are a classic source of <code>ConcurrentModificationException</code>-style bugs.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why can the same <code>for (int value : tree)</code> loop shape work identically whether <code>tree</code> is a <code>BinaryTree</code> or a plain <code>List&lt;Integer&gt;</code>?</p>
          <p>
            <b>Answer:</b> Both expose the same <code>Iterable</code>/<code>Iterator</code>{" "}
            interface. The loop only ever calls <code>hasNext()</code> and <code>next()</code>
            &mdash; it has no knowledge of whether those calls are walking an array index or
            traversing a tree with a stack, because that logic is entirely inside each type's own
            iterator implementation.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Iterator whenever traversal needs to be uniform across different underlying
        storage &mdash; it's the pattern behind every <code>for</code> loop you've written over a
        Java collection, made explicit for your own custom structures.
      </p>
    </div>
  );
}
