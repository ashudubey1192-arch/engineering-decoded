import "../css/Article.css";

export default function DataStructuresForScaleSkipListsArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          A skip list is an ordered data structure that gives fast search, insert, and delete —
          O(log n), like a balanced tree — using a simpler structure of layered linked lists with
          random "shortcuts," which is why Redis's sorted sets are built on one.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          The bottom layer is a normal sorted linked list of every element. Each higher layer
          contains a random subset of the elements below it — each element gets randomly
          "promoted" to the next layer up with some fixed probability (commonly 50%) — forming
          progressively sparser "express lanes." Searching starts at the top, sparsest layer,
          moving forward until the next node would overshoot the target, then drops down a layer
          and repeats — skipping over large chunks of the list at each layer, similar in spirit to
          how a highway with exits gets you most of the way before you switch to local roads.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Search for value 47</b> in a skip list of a million sorted elements.</li>
          <li><b>Start at the top layer.</b> Only a handful of elements exist here; jump forward
            until the next element would exceed 47.</li>
          <li><b>Drop down a layer</b> at that point and continue forward on the denser layer
            below, again until about to overshoot.</li>
          <li><b>Repeat down to the base layer,</b> where the exact element (or its correct
            insertion point) is found — having examined only a small fraction of the million
            elements, roughly proportional to log(n).</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of a skip list with three layers, where the top sparse layer allows large jumps forward before dropping down to denser layers to pinpoint the exact search target." >
          {[0, 1, 2].map((layer) => (
            <g key={layer}>
              <line x1="30" y1={30 + layer * 35} x2="410" y2={30 + layer * 35} stroke="var(--muted)" />
            </g>
          ))}
          {[30, 130, 230, 330].map((x, i) => (<circle key={i} className="box" cx={x} cy="100" r="6" />))}
          {[30, 130, 330].map((x, i) => (<circle key={"m" + i} className="box" cx={x} cy="65" r="6" />))}
          {[30, 230].map((x, i) => (<circle key={"t" + i} className="boxAccent" cx={x} cy="30" r="6" />))}
          <text x="220" y="125" className="figHint" textAnchor="middle">base layer: every element</text>
          <text x="220" y="15" className="figHint" textAnchor="middle">top layer: sparse "express lane"</text>
        </svg>
        <figcaption>Sparser upper layers let a search skip ahead quickly before dropping down to pinpoint the target.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Implementing a skip list with a fixed, non-random promotion scheme defeats the
          probabilistic balance that gives it its expected O(log n) performance — the randomness
          is a core part of the design, not an implementation detail. Skip lists are also generally
          simpler to implement correctly (especially for concurrent access) than a balanced tree,
          which is a big part of their real-world appeal.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does randomly promoting elements to higher layers give a skip list expected logarithmic search time?</p>
        </div>
      </section>
      <p className="takeaway">
        Skip lists get balanced-tree-like performance from a much simpler, randomized layered-list
        structure — simple enough that it's the structure behind Redis's sorted sets.
      </p>
    </div>
  );
}
