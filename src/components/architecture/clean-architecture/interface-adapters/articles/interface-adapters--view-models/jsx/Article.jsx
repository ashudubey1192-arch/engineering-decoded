export default function InterfaceAdaptersViewModelsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A view model is a plain data holder shaped exactly for what one specific view needs to render — no behavior, no formatting logic left undone, nothing for the view to figure out.</p>
        <p>You've seen the presenter produce one; this lesson looks closely at what makes <code>OrderViewModel</code> itself well-designed, and why "just a bit of logic in the view" is a trap that undoes everything the presenter was for.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>A <strong>view model</strong> is the output of a presenter and the input to a view. It is deliberately the dumbest class in the system: fields, maybe a constructor, and nothing else. Every decision about <em>what</em> to show and <em>how</em> to format it has already been made by the time an <code>OrderViewModel</code> exists — the view's only job left is to place those already-final strings and flags onto the screen.</p>
        <h3>Shaped for one view, not reused as a general-purpose DTO</h3>
        <p>Unlike <code>PlaceOrderResponse</code>, which is shaped around what the use case knows, <code>OrderViewModel</code> is shaped around what a specific screen displays: a formatted total string ready to print, a human-readable status label, a boolean the template can check for an "if success, show a green banner" branch. If a second screen needs different fields — say, a compact order-summary widget that doesn't need the full breakdown — it's fine, and often correct, to have a second, differently-shaped view model rather than stretching one to cover both.</p>
        <h3>No behavior means no surprises</h3>
        <p>A view model should not have a method that computes anything, calls anything, or makes a decision. The moment <code>OrderViewModel</code> gets a method like <code>{'isOverdue()'}</code> that inspects a date and does date-math, you've smuggled business or presentation logic into a class whose entire reason for existing was to hold already-finished answers. That logic belongs back in the presenter, where it's easy to unit test in isolation from any rendering.</p>
        <h3>The view stays humble</h3>
        <p>This is the other half of the humble object pattern from the presenters lesson: the view (a JSX component, a Thymeleaf template, a console printer) does no computation at all — it just maps view model fields onto markup or text. That split is what makes the hard-to-test part (actual rendering) trivially thin, and pushes everything worth testing into the presenter.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 220" role="img" aria-label="OrderPresenter producing an OrderViewModel with only plain fields, flowing into a View box that is shown doing no computation, only placing fields onto markup">
            <rect x="20" y="80" width="140" height="56" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="90" y="112" textAnchor="middle" fontSize="9">OrderPresenter</text>

            <rect x="230" y="55" width="200" height="110" rx="8" className="accentStroke" fill="none" strokeWidth="2.5" />
            <text x="330" y="78" textAnchor="middle" fontSize="10">OrderViewModel</text>
            <text x="330" y="96" textAnchor="middle" fontSize="8">orderId: String</text>
            <text x="330" y="110" textAnchor="middle" fontSize="8">formattedTotal: String</text>
            <text x="330" y="124" textAnchor="middle" fontSize="8">message: String</text>
            <text x="330" y="138" textAnchor="middle" fontSize="8">success: boolean</text>
            <text x="330" y="155" textAnchor="middle" fontSize="7" className="mutedFill">no methods, no logic</text>

            <rect x="500" y="80" width="140" height="56" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="570" y="103" textAnchor="middle" fontSize="9">View / template</text>
            <text x="570" y="118" textAnchor="middle" fontSize="7" className="mutedFill">renders fields only</text>

            <line x1="160" y1="108" x2="228" y2="108" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowVm)" />
            <line x1="430" y1="108" x2="498" y2="108" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowVm)" />

            <defs>
              <marker id="arrowVm" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">A view model is a dead-end for logic: everything upstream has already been decided, and the view only places fields.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p><code>OrderViewModel</code> is nothing but final fields — every value already fully formatted for display:</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.web;

public final class OrderViewModel {

    private final String orderId;
    private final String formattedTotal;
    private final String message;
    private final boolean success;

    public OrderViewModel(String orderId, String formattedTotal, String message, boolean success) {
        this.orderId = orderId;
        this.formattedTotal = formattedTotal;
        this.message = message;
        this.success = success;
    }

    public String orderId() { return orderId; }
    public String formattedTotal() { return formattedTotal; }
    public String message() { return message; }
    public boolean success() { return success; }
}`}</code></pre>
        <p>Compare this to a hypothetical view model that also exposed <code>{'rawTotalCents'}</code> and a <code>{'formatTotal()'}</code> method — that design would push the formatting decision back onto whatever renders it, defeating the point of having a presenter at all.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Adding a computed getter to the view model</h3><p>A method like <code>{'statusCssClass()'}</code> that inspects <code>{'success'}</code> and returns <code>{'"badge-success"'}</code> or <code>{'"badge-error"'}</code> looks harmless, but it's a formatting decision that snuck past the presenter and into a class that's supposed to hold only finished answers.</p></div>
          <div><b>MISTAKE</b><h3>Reusing the response DTO as the view model</h3><p>Rendering directly from <code>PlaceOrderResponse</code> instead of building an <code>OrderViewModel</code> skips the presenter entirely, so every view ends up doing its own currency formatting, its own success-message wording, inconsistently.</p></div>
          <div><b>MISTAKE</b><h3>One bloated view model shared by unrelated screens</h3><p>Growing <code>OrderViewModel</code> to carry fields for the confirmation page, the admin dashboard, and the email receipt all at once means most consumers get a pile of null or irrelevant fields, and a change for one screen risks breaking another.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your view needs to show "3 days ago" instead of a raw timestamp for when an order was placed. Where exactly does the "3 days ago" string get computed — in the view model's constructor caller, in the view itself, or somewhere else — and why does that placement matter for testability?</p>
        </div>
      </section>
    </div>
  );
}
