export default function InterfaceAdaptersPresentersArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">A presenter takes the plain result a use case produces and turns it into exactly what a UI needs to render — formatting decisions the use case must never make.</p>
        <p>If the controller is the translator on the way in, the presenter is the translator on the way out. This lesson covers <code>OrderPresenter</code>: what it's responsible for formatting, and why keeping those decisions here — instead of in the interactor — is what lets the same use case serve wildly different UIs.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <p>A presenter implements the use case's output boundary — in our domain, <code>OrderPresenter implements PlaceOrderOutputBoundary</code>. When the interactor finishes, it calls a method on that boundary with plain data (cents as a <code>{'long'}</code>, a raw success flag, a reason string). The presenter's job is to take that plain data and shape it into something a specific view can use directly, with zero further logic required on the view's part.</p>
        <h3>Formatting decisions live here, not in the use case</h3>
        <p>"Should the total be displayed as <code>{'$1,204.00'}</code> or <code>{'1204,00 €'}</code>?" is not a question <code>PlaceOrderUseCase</code> should ever have an opinion on — it's a presentation concern tied to locale and UI, not to the business rule of placing an order. Currency formatting, date formatting, capitalizing a status enum into a human-readable label, deciding whether "did this succeed" becomes a boolean flag or a CSS class name — all of that belongs in the presenter.</p>
        <h3>The humble object pattern</h3>
        <p>Martin calls this a case of the <strong>humble object pattern</strong>: split a hard-to-test concern (rendering, actually drawing pixels) from an easy-to-test one (deciding what data and formatting the rendering needs). The presenter is the easy-to-test half — you can unit test that <code>OrderPresenter</code> turns a <code>{'PlaceOrderResponse'}</code> with <code>{'totalCents=120400'}</code> into a view model with <code>{'"$1,204.00"'}</code>, with no HTML, no browser, and no web server involved.</p>
        <h3>One presenter per output boundary, not per screen</h3>
        <p>A presenter is tied to a use case's output shape, not to a specific page. If two different screens both need the result of placing an order, they can both consume the same <code>OrderViewModel</code> the presenter produces — it's the view template that decides what to render, not the presenter that decides what the page looks like.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 660 220" role="img" aria-label="PlaceOrderResponse flowing from the interactor into OrderPresenter, which applies currency and date formatting, producing an OrderViewModel ready for the view to render directly">
            <rect x="20" y="80" width="150" height="56" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" strokeDasharray="4 3" />
            <text x="95" y="103" textAnchor="middle" fontSize="9">«interface»</text>
            <text x="95" y="118" textAnchor="middle" fontSize="9">OutputBoundary</text>

            <rect x="230" y="65" width="180" height="86" rx="8" className="accentStroke" fill="none" strokeWidth="2.5" />
            <text x="320" y="92" textAnchor="middle" fontSize="10">OrderPresenter</text>
            <text x="320" y="108" textAnchor="middle" fontSize="8">currency formatting</text>
            <text x="320" y="121" textAnchor="middle" fontSize="8">date formatting</text>
            <text x="320" y="134" textAnchor="middle" fontSize="8">success/failure flags</text>

            <rect x="470" y="80" width="160" height="56" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="550" y="103" textAnchor="middle" fontSize="9">OrderViewModel</text>
            <text x="550" y="118" textAnchor="middle" fontSize="8">ready to render</text>

            <line x1="170" y1="108" x2="228" y2="108" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowPre)" />
            <line x1="410" y1="108" x2="468" y2="108" className="mutedStroke" strokeWidth="1.5" markerEnd="url(#arrowPre)" />

            <text x="95" y="160" textAnchor="middle" fontSize="8" className="mutedFill">plain data: totalCents, accepted</text>
            <text x="550" y="160" textAnchor="middle" fontSize="8" className="mutedFill">"$1,204.00", "Order placed"</text>

            <defs>
              <marker id="arrowPre" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" className="mutedFill" />
              </marker>
            </defs>
          </svg>
          <p className="diagramCaption">The presenter is where raw output data becomes display-ready data — the view itself does no further formatting.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p><code>OrderPresenter</code> implements the output boundary and performs the formatting the use case deliberately avoided:</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.web;

import com.engineeringdecoded.orders.usecase.PlaceOrderOutputBoundary;
import com.engineeringdecoded.orders.usecase.PlaceOrderResponse;

import java.text.NumberFormat;
import java.util.Locale;

public class OrderPresenter implements PlaceOrderOutputBoundary {

    private OrderViewModel viewModel;

    @Override
    public void presentSuccess(PlaceOrderResponse response) {
        String formattedTotal = NumberFormat.getCurrencyInstance(Locale.US)
                .format(response.totalCents() / 100.0);

        this.viewModel = new OrderViewModel(
                response.orderId(),
                formattedTotal,
                "Order placed successfully",
                true);
    }

    @Override
    public void presentFailure(String reason) {
        this.viewModel = new OrderViewModel(
                null,
                null,
                "We couldn't place your order: " + reason,
                false);
    }

    public OrderViewModel viewModel() {
        return viewModel;
    }
}`}</code></pre>
        <p>Notice the presenter, not the use case, decided that <code>120400</code> cents becomes the string <code>{'"$1,204.00"'}</code>, and decided the exact wording of the failure message shown to a user.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Formatting inside the use case</h3><p>Having <code>PlaceOrderUseCase</code> build the currency string itself means every alternate presentation — a CLI printout, a different locale, an API that wants raw cents — inherits a formatting decision it didn't ask for and can't easily override.</p></div>
          <div><b>MISTAKE</b><h3>Presenter reaching back into entities or the repository</h3><p>Having <code>OrderPresenter</code> call <code>orderRepository.findById(...)</code> to "get a bit more detail" breaks the one-directional flow — presenters consume what the output boundary hands them, they don't go fetch more.</p></div>
          <div><b>MISTAKE</b><h3>Pushing formatting logic into the view template instead</h3><p>Leaving currency and date formatting to be done in JSX or a Thymeleaf template scatters the same formatting rules across every view that touches order data, instead of centralizing them in one testable presenter.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>Your app needs to support both a JSON API response and a server-rendered HTML confirmation page for the same "place order" use case. How many presenters do you need, and what — if anything — changes inside <code>PlaceOrderUseCase</code> to support the second one?</p>
        </div>
      </section>
    </div>
  );
}
