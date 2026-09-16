export default function StructuralPatternsFlyweightArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Flyweight minimizes memory use by sharing as much data as possible between many similar
          objects, splitting each object's state into shared "intrinsic" state and unique
          "extrinsic" state passed in from outside. It matters specifically at scale: rendering a
          million trees in a forest simulation, each needing its own position but sharing the same
          mesh and texture data, is the textbook case.
        </p>
        <p>
          Intent: support large numbers of similar objects efficiently by sharing common state.
          Applicability: an application needs to create a huge number of objects, most of whose
          state can be shared, and memory (not raw object count) is the actual constraint.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Splitting state, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Separate each object's state into what's shared and what's unique.</b> A tree's
            mesh, texture, and color are identical across every tree of the same species
            (intrinsic); its position and scale are unique per instance (extrinsic).
          </li>
          <li>
            <b>Model the intrinsic state as an immutable, shareable object.</b>{" "}
            <code>TreeType</code>, holding mesh, texture, and color &mdash; safe to share because
            it never changes.
          </li>
          <li>
            <b>Keep extrinsic state outside the shared object, supplied at the point of use.</b>{" "}
            A <code>Tree</code> holds its own <code>x</code>, <code>y</code>, and a reference to a
            shared <code>TreeType</code>, not a copy of the mesh data.
          </li>
          <li>
            <b>Use a factory to guarantee each distinct intrinsic combination is only constructed
            once.</b> A <code>TreeTypeFactory</code> that returns the same <code>TreeType</code>{" "}
            instance for the same species, instead of constructing a new one per tree.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="180" y="20" width="140" height="40" rx="6" />
            <text className="boxText" x="250" y="45" fontSize="10">TreeType (Oak)</text>
            <text className="figLabel" x="250" y="12">shared, one instance</text>
            <line className="flow" x1="220" y1="60" x2="100" y2="100" />
            <line className="flow" x1="250" y1="60" x2="250" y2="100" />
            <line className="flow" x1="280" y1="60" x2="400" y2="100" />
            <rect className="box" x="40" y="100" width="120" height="35" rx="5" />
            <text className="boxText" x="100" y="122" fontSize="8">Tree(x=12,y=8)</text>
            <rect className="box" x="190" y="100" width="120" height="35" rx="5" />
            <text className="boxText" x="250" y="122" fontSize="8">Tree(x=40,y=3)</text>
            <rect className="box" x="340" y="100" width="120" height="35" rx="5" />
            <text className="boxText" x="400" y="122" fontSize="8">Tree(x=91,y=55)</text>
          </svg>
          <figcaption>A million trees can share one TreeType instance; only position (extrinsic) is stored per tree.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Sharing intrinsic state through a factory</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`final class TreeType { // intrinsic, immutable, safe to share
    final String mesh, texture, color;
    TreeType(String mesh, String texture, String color) {
        this.mesh = mesh; this.texture = texture; this.color = color;
    }
}

class TreeTypeFactory {
    private static final Map<String, TreeType> cache = new HashMap<>();
    static TreeType get(String species) {
        return cache.computeIfAbsent(species, s -> new TreeType(loadMesh(s), loadTexture(s), loadColor(s)));
    }
}

class Tree { // extrinsic: unique per instance
    private final int x, y;
    private final TreeType type; // shared reference, not a copy
    Tree(int x, int y, TreeType type) { this.x = x; this.y = y; this.type = type; }
}

// a million trees, but at most a handful of distinct TreeType instances
for (int i = 0; i < 1_000_000; i++) {
    forest.add(new Tree(randomX(), randomY(), TreeTypeFactory.get("oak")));
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Applying Flyweight without a real memory problem to solve.</b> A few thousand
            objects rarely justify the complexity of splitting intrinsic and extrinsic state
            &mdash; this pattern earns its cost specifically at large scale.
          </li>
          <li>
            <b>Letting intrinsic state be mutable.</b> If <code>TreeType</code> could be changed
            after creation, mutating one shared instance would silently affect every tree using
            it &mdash; intrinsic state must be immutable to be safely shared.
          </li>
          <li>
            <b>Skipping the factory and constructing intrinsic objects directly at each call
            site.</b> Without <code>TreeTypeFactory</code> guaranteeing reuse, each caller could
            accidentally create its own duplicate <code>TreeType</code>, losing the memory
            benefit entirely.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why must <code>TreeType</code> be immutable for the Flyweight pattern to be safe?</p>
          <p>
            <b>Answer:</b> Many <code>Tree</code> instances hold a reference to the exact same
            shared <code>TreeType</code> object. If <code>TreeType</code> could be mutated, a
            change made through one <code>Tree</code>'s reference would be visible to every other
            tree sharing that same instance &mdash; an unintended, hard-to-trace side effect.
            Immutability is what makes sharing the object safe in the first place.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Flyweight when a real memory constraint meets a large number of similar objects
        &mdash; split state into immutable, shared intrinsic data and per-instance extrinsic data,
        and use a factory to guarantee the shared data is actually shared.
      </p>
    </div>
  );
}
