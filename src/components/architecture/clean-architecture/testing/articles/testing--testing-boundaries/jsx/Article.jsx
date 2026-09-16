export default function TestingTestingBoundariesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">You don't need a full end-to-end test to prove a controller turns bad input into the right error — you need a test of the boundary contract itself.</p>
        <p>Entity, use case, and adapter tests each cover one layer of the architecture in isolation. This lesson covers the seams between them — the input and output boundaries where one layer's data crosses into another's — and shows how to test that the translation at the seam is correct without paying for a full end-to-end run every time.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>What a boundary actually is</h3>
        <p>Martin's Clean Architecture draws boundaries wherever control crosses between circles: the input boundary (an interface like <code>PlaceOrderInputBoundary</code> that a controller calls into a use case through) and the output boundary (<code>PlaceOrderOutputBoundary</code>, that a use case calls out through to a presenter). Each boundary is a contract: specific shapes of data go in, specific shapes come out, and each side of the boundary only knows the interface, never the class on the other side.</p>
        <h3>Why boundary tests are their own category</h3>
        <p>A use case test (previous lessons) proves the use case's internal logic is correct given a well-formed request. It does not prove that <code>OrderController</code> correctly turns a malformed HTTP request — missing field, wrong type, invalid JSON — into the right <code>PlaceOrderRequest</code>, or that it turns a domain exception back into the right HTTP status and error body. That translation logic lives at the boundary, and it has its own failure modes independent of both the use case's business rules and the underlying HTTP framework's behavior.</p>
        <h3>Testing the translation without full end-to-end</h3>
        <p>A full end-to-end test — real HTTP call, real Spring context, real (or containerized) database, all the way through to a use case and back — proves the whole path works, but it's slow, and a single such test exercises validation, business logic, and persistence all at once, making failures hard to localize. A boundary test instead targets just the controller (or just the presenter), typically with a lightweight slice: for a Spring MVC controller, <code>@WebMvcTest</code> gives you a real HTTP-parsing pipeline with the use case layer mocked out, so you can assert "a request missing <code>customerId</code> yields <code>400</code> with a specific error body" without a database anywhere near the test.</p>
        <h3>Input boundary and output boundary, both worth testing</h3>
        <p>On the way in: does <code>OrderController</code> reject malformed JSON with the right status before it ever reaches the use case? Does it correctly map a valid request body into <code>PlaceOrderRequest</code>? On the way out: does <code>OrderPresenter</code> correctly turn a <code>PlaceOrderResponse</code> into an <code>OrderViewModel</code> the view can render, and does it turn a use case's thrown business exception into the right presentation, rather than letting a stack trace leak into an API response?</p>
        <h3>How this fits with the rest of the section</h3>
        <p>Entities prove business rules hold. Use cases prove orchestration logic is correct given well-formed input. Adapters prove infrastructure integration works. Boundary tests close the remaining gap: proving the translation at each crossing point is correct, independent of whether the use case or the database behaves correctly behind it. Skip this layer and you're left hoping the controller "probably" does the right thing with bad input, discovered for real only in production.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="An OrderController box and a PlaceOrderUseCase box separated by a vertical dashed boundary line, with a small labeled input boundary interface sitting on the line and a test bracket around only the controller side">
            <line x1="320" y1="40" x2="320" y2="220" className="mutedStroke" strokeWidth="1.5" strokeDasharray="5 4" />
            <text x="320" y="30" textAnchor="middle" fontSize="9" className="mutedFill">boundary</text>

            <rect x="70" y="90" width="180" height="60" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="160" y="115" textAnchor="middle" fontSize="10" className="accentFill">OrderController</text>
            <text x="160" y="132" textAnchor="middle" fontSize="8" className="mutedFill">adapter layer</text>

            <rect x="390" y="90" width="190" height="60" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="485" y="115" textAnchor="middle" fontSize="10" className="mutedFill">PlaceOrderUseCase</text>
            <text x="485" y="132" textAnchor="middle" fontSize="8" className="mutedFill">mocked in this test</text>

            <rect x="270" y="103" width="100" height="34" rx="5" className="accentStroke" fill="none" strokeWidth="1.5" />
            <text x="320" y="123" textAnchor="middle" fontSize="8" className="accentFill">InputBoundary</text>

            <defs>
              <marker id="tbArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
            </defs>
            <line x1="250" y1="120" x2="266" y2="120" className="accentStroke" strokeWidth="1.5" markerEnd="url(#tbArrow)" />
            <line x1="374" y1="120" x2="386" y2="120" className="mutedStroke" strokeWidth="1.5" strokeDasharray="3 3" />

            <path d="M55,80 L55,160 L60,160 M55,80 L60,80" fill="none" className="accentStroke" strokeWidth="2" />
            <path d="M265,80 L265,160 L260,160 M265,80 L260,80" fill="none" className="accentStroke" strokeWidth="2" />
            <text x="160" y="70" textAnchor="middle" fontSize="9" className="accentFill">@WebMvcTest scope</text>

            <text x="320" y="230" textAnchor="middle" fontSize="12" className="accentFill">Test the translation at the seam, not the whole path</text>
          </svg>
          <p className="diagramCaption">A slice test exercises OrderController's real HTTP handling while the use case behind the boundary is mocked.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>A <code>@WebMvcTest</code> slice proving <code>OrderController</code> handles malformed input correctly, without a running use case or database.</p>
        <pre><code>{`package com.engineeringdecoded.orders.adapter.web;

import com.engineeringdecoded.orders.usecase.PlaceOrderInputBoundary;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.verifyNoInteractions;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
class OrderControllerBoundaryTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PlaceOrderInputBoundary placeOrderUseCase; // real use case never runs here

    @Test
    void missingCustomerIdReturns400WithoutReachingTheUseCase() throws Exception {
        mockMvc.perform(post("/orders")
                .contentType("application/json")
                .content("{\\"lines\\": []}")) // no customerId field
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.error").value("customerId is required"));

        verifyNoInteractions(placeOrderUseCase); // proves validation happens
                                                  // BEFORE the boundary is crossed
    }

    @Test
    void wellFormedRequestIsTranslatedAndForwarded() throws Exception {
        mockMvc.perform(post("/orders")
                .contentType("application/json")
                .content("{\\"customerId\\":\\"cust-1\\",\\"lines\\":[{\\"sku\\":\\"SKU-1\\",\\"qty\\":2}]}"))
            .andExpect(status().isAccepted());
    }
}`}</code></pre>
        <p>This test proves the controller's input translation is correct in milliseconds — no Postgres container, no real use case, no end-to-end HTTP round trip through the whole system.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Only testing boundaries via full end-to-end tests</h3><p>Relying solely on slow, heavyweight end-to-end tests to catch controller-level input bugs means those bugs surface late, run slowly in CI, and are hard to localize when a large test fails for an unrelated reason.</p></div>
          <div><b>MISTAKE</b><h3>Letting validation logic live inside the use case instead of at the boundary</h3><p>If "customerId is required" validation happens inside <code>PlaceOrderUseCase</code> rather than at the controller, malformed requests pay the cost of constructing use case objects before failing, and the boundary test above can no longer prove the use case was never reached.</p></div>
          <div><b>MISTAKE</b><h3>Forgetting to test the output boundary, only the input</h3><p>Teams often test that requests parse correctly but never verify that <code>OrderPresenter</code> correctly turns a thrown domain exception into the right HTTP error response — a gap that surfaces as a raw stack trace in production instead of a clean 4xx.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>The <code>verifyNoInteractions(placeOrderUseCase)</code> assertion in the example is doing real architectural work, not just padding the test. Explain what specific bug it would catch that <code>status().isBadRequest()</code> alone would miss.</p>
        </div>
      </section>
    </div>
  );
}
