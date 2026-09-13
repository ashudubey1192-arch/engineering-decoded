import "../css/Article.css";

export default function StructuralPatternsProxyPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Proxy provides a stand-in object that controls access to another object &mdash;
          implementing the same interface, but able to add behavior like lazy loading, access
          control, or caching before forwarding the call along.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          A proxy implements the same interface as the real object it stands in for, so callers
          can't tell the difference at the call site. What the proxy adds is control: it might defer
          creating the real object until it's actually needed, check permissions before allowing a
          call through, or cache a result instead of forwarding every call.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          An <code>ImageProxy</code> implements the same <code>Image</code> interface as a
          <code>RealImage</code>, but doesn't actually load the (expensive) image file from disk
          until <code>display()</code> is called on it for the first time. Every earlier reference
          to the proxy &mdash; holding it in a list, passing it around &mdash; stays cheap, and the
          real loading cost only happens if and when the image is actually displayed.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of a client calling display() on an ImageProxy, which only loads the real, expensive RealImage the first time display is actually called." >
          <rect className="box" x="20" y="40" width="90" height="26" rx="5" /><text x="65" y="57" className="boxText" style={{fontSize:"7px"}}>Client</text>
          <line className="flow" x1="110" y1="53" x2="150" y2="53" /><text x="130" y="43" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>display()</text>
          <rect className="boxAccent" x="155" y="40" width="100" height="26" rx="5" /><text x="205" y="57" className="boxText" style={{fontSize:"7px"}}>ImageProxy</text>
          <line className="flowMuted" x1="255" y1="53" x2="300" y2="53" /><text x="278" y="43" className="figHint" textAnchor="middle" style={{fontSize:"6px"}}>loads once</text>
          <rect className="box" x="305" y="40" width="100" height="26" rx="5" /><text x="355" y="57" className="boxText" style={{fontSize:"6.5px"}}>RealImage</text>
        </svg>
        <figcaption>The proxy stands in for the real object cheaply, deferring the expensive load until it's genuinely needed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Confusing Proxy with Decorator is common since they look structurally similar in code
          &mdash; Proxy controls access to essentially the same object (often creating or gating
          it), while Decorator adds genuinely new behavior to an object the client already fully
          has. Loading so much unrelated logic into a proxy that it stops being a transparent
          stand-in is the other risk.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>What's the practical difference between what Proxy and Decorator each do, even though they look structurally similar?</p>
        </div>
      </section>
      <p className="takeaway">
        A proxy looks exactly like the real object to its callers, but controls when &mdash; or
        whether &mdash; the real, often expensive object actually gets involved.
      </p>
    </div>
  );
}
