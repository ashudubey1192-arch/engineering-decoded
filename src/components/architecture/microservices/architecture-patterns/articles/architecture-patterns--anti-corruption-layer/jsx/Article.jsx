import "../css/Article.css";

export default function ArchitecturePatternsAntiCorruptionLayerArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An anti-corruption layer is a translation boundary between your service and an external or
          legacy system, so that system's awkward data model and quirks don't leak into and reshape
          your own service's clean internal model.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Rather than every part of your service calling the external system directly and working
          with its native, often awkward shapes, one dedicated layer does that translation exactly
          once &mdash; converting the external system's model into your own domain's model right at
          the boundary, so the rest of your codebase never has to know the external system's quirks
          even exist.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A legacy inventory mainframe represents stock as a cryptic fixed-width string:
          <code>STK-LVL: 000182 UOM: EA STAT: A</code>. <code>InventoryService</code>'s
          anti-corruption layer parses that once, at the boundary, and hands the rest of the service a
          clean object instead &mdash; no other part of <code>InventoryService</code> ever sees the
          mainframe's raw format at all.
        </p>
        <span className="codeLabel">TRANSLATING AT THE BOUNDARY, ONCE</span>
        <div className="codeBlock">
          <pre>{`function translateLegacyStock(raw) {
  // raw: "STK-LVL: 000182 UOM: EA STAT: A"
  return {
    quantity: parseInt(raw.slice(8, 14), 10),
    unit: raw.includes("UOM: EA") ? "each" : "unknown",
    active: raw.includes("STAT: A"),
  }
}`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of an anti-corruption layer sitting between a legacy mainframe's cryptic fixed-width stock format and the rest of InventoryService, translating once at the boundary so the clean domain model is all the rest of the service ever sees.">
          <rect className="box" x="20" y="35" width="110" height="30" rx="6" />
          <text x="75" y="53" className="boxText" style={{fontSize:"6px"}}>Legacy mainframe</text>
          <rect className="boxAccent" x="160" y="35" width="110" height="30" rx="6" />
          <text x="215" y="53" className="boxText" style={{fontSize:"6px"}}>Anti-corruption layer</text>
          <rect className="box" x="300" y="35" width="105" height="30" rx="6" />
          <text x="352" y="53" className="boxText" style={{fontSize:"6px"}}>Rest of InventoryService</text>
          <line className="flow" x1="130" y1="50" x2="158" y2="50" />
          <text x="144" y="40" className="figHint" style={{fontSize:"5px"}}>raw format</text>
          <line className="flow" x1="270" y1="50" x2="298" y2="50" />
          <text x="284" y="40" className="figHint" style={{fontSize:"5px"}}>clean model</text>
        </svg>
        <figcaption>The mainframe's raw format is translated exactly once, at the boundary &mdash; everything past that layer only ever sees the clean domain model.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Skipping the anti-corruption layer "to save time" and calling the legacy system's raw
          format directly from multiple places in your service means that system's quirks &mdash; and
          every future quirk it introduces &mdash; end up scattered and duplicated throughout your
          own codebase. Letting the layer leak partial translations, passing some raw fields through
          unchanged alongside translated ones, reintroduces exactly the coupling the layer was built
          to prevent.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does calling the legacy mainframe's raw stock format directly from five different places inside InventoryService cause more long-term pain than translating it once at a single boundary?</p>
        </div>
      </section>
      <p className="takeaway">
        An anti-corruption layer contains a messy external system's influence to exactly one place
        &mdash; everything on your side of that boundary stays clean, regardless of how awkward the
        other side actually is.
      </p>
    </div>
  );
}
