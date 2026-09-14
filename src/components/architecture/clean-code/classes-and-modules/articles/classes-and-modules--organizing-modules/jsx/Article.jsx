import "../css/Article.css";

export default function ClassesAndModulesOrganizingModulesArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          How files are grouped into folders is itself a design decision. A structure organized
          by technical layer scatters every feature across the codebase; a structure organized
          by feature keeps everything one change touches in a single place.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Group by feature, not only by technical layer</b> &mdash; folders like controllers, services, and models split every single feature into three or more pieces scattered across the codebase.</li>
          <li><b>A feature-based module can still layer internally</b> &mdash; a feature folder can have its own controller, service, and model files; the point is that they live together, not that layers disappear.</li>
          <li><b>Keep each module's public surface intentional</b> &mdash; export only what other modules actually need, so an internal helper doesn't quietly become a dependency the whole codebase relies on.</li>
          <li><b>Circular dependencies signal unclear boundaries</b> &mdash; if two modules import from each other, they don't yet have a clean boundary between them.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's folder structure, reorganized from technical layer to feature:
        </p>
        <span className="codeLabel">BY TECHNICAL LAYER</span>
        <div className="codeBlock">
          <pre>{`src/
  controllers/invoiceController.js
  controllers/paymentController.js
  controllers/customerController.js
  services/invoiceService.js
  services/paymentService.js
  services/customerService.js
  models/invoice.js
  models/payment.js
  models/customer.js
// changing how invoices work means opening three different top-level folders`}</pre>
        </div>
        <span className="codeLabel">BY FEATURE</span>
        <div className="codeBlock">
          <pre>{`src/
  invoicing/controller.js
  invoicing/service.js
  invoicing/model.js
  payments/controller.js
  payments/service.js
  payments/model.js
  customers/controller.js
  customers/service.js
  customers/model.js
// changing how invoices work now means opening one folder: invoicing/`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 170" role="img" aria-label="Diagram of a single invoicing change reaching into three separate top-level folders, controllers, services, and models, when code is organized by technical layer, versus the same change reaching into just one invoicing folder when code is organized by feature.">
          <rect className="boxWarn" x="155" y="10" width="140" height="24" rx="4" /><text x="225" y="26" className="boxText" style={{fontSize:"4.2px"}}>Invoicing change (3 folders)</text>
          <rect className="box" x="20" y="58" width="110" height="24" rx="4" /><text x="75" y="74" className="boxText" style={{fontSize:"4.2px"}}>controllers/</text>
          <rect className="box" x="155" y="58" width="110" height="24" rx="4" /><text x="210" y="74" className="boxText" style={{fontSize:"4.2px"}}>services/</text>
          <rect className="box" x="290" y="58" width="110" height="24" rx="4" /><text x="345" y="74" className="boxText" style={{fontSize:"4.2px"}}>models/</text>
          <line className="flowMuted" x1="225" y1="34" x2="75" y2="56" />
          <line className="flowMuted" x1="225" y1="34" x2="210" y2="56" />
          <line className="flowMuted" x1="225" y1="34" x2="345" y2="56" />
          <line className="divider" x1="20" y1="98" x2="400" y2="98" />
          <rect className="boxAccent" x="155" y="112" width="140" height="24" rx="4" /><text x="225" y="128" className="boxText" style={{fontSize:"4.2px"}}>Invoicing change (1 folder)</text>
          <rect className="box" x="155" y="150" width="140" height="20" rx="4" /><text x="225" y="164" className="boxText" style={{fontSize:"4.2px"}}>invoicing/</text>
          <line className="flow" x1="225" y1="136" x2="225" y2="148" />
        </svg>
        <figcaption>The same feature change touches three scattered folders under a layer-first structure, and one folder under a feature-first structure.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Reorganizing purely by technical layer when the actual complaint is "changing one
          feature touches ten files in ten folders" fixes the wrong axis. Grouping by feature,
          while keeping layering inside each feature folder, is what actually collapses that
          scatter.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why did changing how invoices work require opening three separate top-level folders under the layer-based structure, and only one folder after reorganizing by feature?</p>
        </div>
      </section>
      <p className="takeaway">
        Organize modules around what changes together &mdash; a feature-based structure keeps a
        single change's files in one place, while still allowing clean layering inside each
        feature.
      </p>

    </div>
  );
}
