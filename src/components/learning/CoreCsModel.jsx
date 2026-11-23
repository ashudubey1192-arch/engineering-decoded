import { useId } from "react";
import "./CoreCsModel.css";

// Visible HTML labels remain readable on narrow screens instead of shrinking
// an entire wide SVG to fit. SVG connectors provide the diagram's direction.
export default function CoreCsModel({ model, activeId, onSelect }) {
  const id = useId();
  const directional = ["stack", "flow"].includes(model.kind);
  return <figure className={`coreCsModel coreCsModel--${model.kind}`} aria-labelledby={`${id}-title`}>
    <figcaption id={`${id}-title`}><strong>{model.title}</strong><p>{model.scope}</p></figcaption>
    <ol className="coreCsModelNodes" aria-label={model.title}>
      {model.nodes.map((item, index) => <li key={item.id} data-model-node={item.id} className={activeId === item.id ? "coreCsModelActive" : undefined}>
        {onSelect ? <button type="button" aria-pressed={activeId === item.id} onClick={() => onSelect(index)}><strong>{item.label}</strong><span>{item.detail}</span></button>
          : <div><strong>{item.label}</strong><span>{item.detail}</span></div>}
        {directional && index < model.nodes.length - 1 && <svg className="coreCsModelConnector" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2v18m-6-6 6 6 6-6" fill="none" stroke="currentColor" strokeWidth="2" /></svg>}
      </li>)}
    </ol>
    {!!model.edges.length && <div className="coreCsModelTransitions"><h4>Allowed transitions in this model</h4><ul>{model.edges.map(([from, to, event]) => <li key={`${from}-${to}`}><strong>{model.nodes.find(n => n.id === from).label} → {model.nodes.find(n => n.id === to).label}</strong>: {event}</li>)}</ul><p>A completed wait makes a task ready; it does not guarantee immediate execution. Only dispatch moves it to running.</p></div>}
  </figure>;
}

export function LayerReference({ model }) {
  return <section className="coreCsLayerReference" aria-label="Layer responsibilities and reference">
    <h3>Every layer, its unit, and its responsibility</h3>
    <p>Read from top to bottom for sending. The peer interprets the corresponding responsibilities in the reverse direction. Protocol examples below relate Internet technology to the model; they do not imply a perfect one-to-one standards mapping.</p>
    {model.layers.map(layer => <article key={layer.number} className="coreCsLayerCard">
      <h4>Layer {layer.number}: {layer.name}</h4>
      <p>{layer.detail}</p>
      <dl><div><dt>Responsibility</dt><dd>{layer.role}</dd></div><div><dt>Data unit</dt><dd>{layer.pdu}</dd></div><div><dt>Identity / context</dt><dd>{layer.identity}</dd></div><div><dt>Examples</dt><dd>{layer.examples}</dd></div></dl>
    </article>)}
  </section>;
}
