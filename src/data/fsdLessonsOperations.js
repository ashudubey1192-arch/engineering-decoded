// Logging and monitoring, accessibility, and offline support lessons.
import { fsd } from "./fsdLessonSchema.js";

export const operationsLessons = {
  "logging-and-monitoring--logging-and-monitoring-overview": fsd({
    intro:
      "Once code ships, the browser becomes a black box running on millions of devices you will never see. Logging and monitoring give you eyes inside it: errors with context, performance data, and product signals. Good observability lets you detect a broken release in minutes, understand which users are affected, and fix it with evidence rather than guesses.",
    concepts: [
      "Signals come in three families: logs (discrete events such as errors or warnings), metrics (numbers aggregated over time such as error rate or LCP), and traces (the path of one user action across frontend and backend services).",
      "Frontend data must be collected deliberately. Global error and unhandledrejection handlers catch crashes, error boundaries catch React render failures, and instrumentation records network failures and slow interactions, all enriched with release, route, device, and an anonymous session ID.",
      "Monitoring closes the loop: dashboards show health, alerts page people when thresholds break, and runbooks plus source maps help them fix issues fast.",
    ],
    code: `// The minimum viable frontend observability setup
const context = {
  release: import.meta.env.VITE_RELEASE,          // ties errors to deploys
  sessionId: crypto.randomUUID(),                  // anonymous, per visit
  route: () => location.pathname,
  device: () => (navigator.userAgentData?.mobile ? "mobile" : "desktop"),
};

function report(type, payload) {
  const event = { type, ...payload, release: context.release, sessionId: context.sessionId, route: context.route(), device: context.device(), ts: Date.now() };
  navigator.sendBeacon("/observe", JSON.stringify(event));
}

window.addEventListener("error", (e) => report("error", { message: e.message, stack: e.error?.stack, source: e.filename }));
window.addEventListener("unhandledrejection", (e) => report("rejection", { message: String(e.reason?.message || e.reason), stack: e.reason?.stack }));

// Wrap fetch to record failed and slow API calls
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  const started = performance.now();
  try {
    const response = await originalFetch(...args);
    const ms = performance.now() - started;
    if (!response.ok || ms > 3000) report("api", { url: String(args[0]), status: response.status, ms: Math.round(ms) });
    return response;
  } catch (error) {
    report("api", { url: String(args[0]), status: 0, message: error.message });
    throw error;
  }
};`,
    walkthrough:
      "Every event carries the release, route, device class, and an anonymous session ID, which is what turns a pile of stack traces into an answer like errors on checkout started with release 812 on mobile. Global handlers catch thrown errors and rejected promises, and the fetch wrapper records failed and slow API calls. In production you would usually use an SDK such as Sentry or OpenTelemetry rather than this hand-rolled version, but the principles are identical.",
    flow: ["Capture errors and signals", "Enrich with context", "Alert, dashboard, fix"],
    mistake:
      "Logging personal data such as emails, tokens, or full request bodies. Observability data is widely accessible inside companies and often retained for months; scrub it at the source.",
    exercise:
      "An error dashboard shows 4,000 events per hour of 'Script error.' with no stack. What is happening, and how do you get useful details?",
    answer:
      "The errors come from cross-origin scripts, so the browser hides details. Load them with crossorigin=\"anonymous\" and make the server send CORS headers, or self-host them; then real messages and stacks are reported. Filter browser-extension noise separately.",
    deepDive: [
      {
        heading: "The rest of this module",
        points: [
          "Telemetry: what to collect and how to send it efficiently.",
          "Alerting: turning signals into pages that matter.",
          "Fixing: from alert to root cause with source maps, replays, and rollbacks.",
        ],
      },
    ],
    animation: {
      title: "From a crash to a fix",
      nodes: [
        ["browser", "Browser", "error thrown"],
        ["collector", "Collector", "/observe"],
        ["store", "Error store", "grouped issues"],
        ["alert", "Alert", "error rate up"],
        ["engineer", "Engineer", "fixes release"],
      ],
      steps: [
        ["browser", "collector", "beacon", "An unhandled error is captured with release, route, and device context."],
        ["collector", "store", "group", "Similar errors are grouped into one issue with a count of affected sessions."],
        ["store", "alert", "spike", "The checkout error rate jumps after release 812, triggering an alert."],
        ["alert", "engineer", "page", "The on-call engineer sees the stack trace mapped to source code."],
        ["engineer", "browser", "rollback", "A rollback ships within minutes and the error rate falls back."],
      ],
    },
  }),

  "logging-and-monitoring--telemetry": fsd({
    intro:
      "Telemetry is the automatic collection and transmission of data about how software behaves in use. For frontends it covers errors, performance, network calls, feature usage, and traces that connect a click to backend work. Designing telemetry means choosing what to collect, keeping it cheap for users, respecting privacy, and making it queryable.",
    concepts: [
      "Use a consistent event schema with a name, timestamp, and shared attributes such as release, route, and session. Consistent names, for example checkout.payment_failed rather than ad-hoc strings, make analysis and dashboards possible.",
      "Sample and batch. Collect all errors but sample high-volume events such as performance traces, batch events in memory, and flush with sendBeacon on visibility change so telemetry never competes with user requests.",
      "Distributed tracing propagates a trace context header (W3C traceparent) from the browser to backends, so one user action shows up as a single trace across the frontend, API gateway, and services.",
    ],
    code: `// OpenTelemetry in the browser: traces for page load and fetch, linked to backend spans
import { WebTracerProvider, BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { DocumentLoadInstrumentation } from "@opentelemetry/instrumentation-document-load";
import { FetchInstrumentation } from "@opentelemetry/instrumentation-fetch";
import { TraceIdRatioBasedSampler } from "@opentelemetry/sdk-trace-base";
import { resourceFromAttributes } from "@opentelemetry/resources";

const provider = new WebTracerProvider({
  resource: resourceFromAttributes({ "service.name": "shop-web", "service.version": import.meta.env.VITE_RELEASE }),
  sampler: new TraceIdRatioBasedSampler(0.1), // keep 10% of traces
  spanProcessors: [new BatchSpanProcessor(new OTLPTraceExporter({ url: "/otel/v1/traces" }))],
});
provider.register();

registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new FetchInstrumentation({ propagateTraceHeaderCorsUrls: [/api\\.shop\\.example/] }), // adds traceparent
  ],
});

// Custom business span
const tracer = provider.getTracer("checkout");
export async function pay(order) {
  return tracer.startActiveSpan("checkout.pay", async (span) => {
    span.setAttribute("order.items", order.items.length);
    try { return await submitPayment(order); }
    catch (error) { span.recordException(error); throw error; }
    finally { span.end(); }
  });
}`,
    walkthrough:
      "The provider labels every span with the service and release, samples 10% of traces to control volume, and exports in batches. Document-load and fetch instrumentation create spans automatically, and the fetch instrumentation adds a traceparent header to API calls, so backend spans join the same trace. The custom checkout.pay span records business attributes and exceptions, which makes slow or failing payments easy to find.",
    flow: ["Define a schema", "Sample and batch", "Propagate trace context"],
    mistake:
      "Sending one request per event as it happens. On a busy page that can mean dozens of extra requests competing with real work and draining mobile batteries; batch and flush at idle or on page hide.",
    exercise:
      "Your telemetry bill doubled after adding interaction tracking to every click. Name two ways to cut cost without losing important signals.",
    answer:
      "Sample routine interaction events at a low rate while keeping 100% of errors and key business events, and aggregate on the client, for example counting clicks per component per session, instead of sending each click. Also drop attributes nobody queries.",
    deepDive: [
      {
        heading: "Privacy by design",
        points: [
          "Never put personal data in event names, URLs, or attributes; use opaque IDs.",
          "Respect consent for analytics-style telemetry; error and security telemetry may have a different legal basis but still needs minimization.",
          "Set retention periods and document what is collected.",
        ],
      },
    ],
    animation: {
      title: "One click as one trace",
      nodes: [
        ["click", "Pay click", "span: checkout.pay"],
        ["fetch", "fetch /pay", "traceparent"],
        ["gateway", "API gateway", "child span"],
        ["service", "Payment svc", "child span"],
        ["backend", "Trace backend", "full timeline"],
      ],
      steps: [
        ["click", "fetch", "start span", "The click starts a checkout.pay span in the browser."],
        ["fetch", "gateway", "traceparent", "The fetch carries a traceparent header with the trace ID."],
        ["gateway", "service", "propagate", "The gateway and payment service create child spans in the same trace."],
        ["service", "backend", "export", "Each service exports its spans to the tracing backend."],
        ["click", "backend", "batched", "The browser exports its spans in a batch when the page is idle."],
      ],
    },
  }),

  "logging-and-monitoring--alerting": fsd({
    intro:
      "Alerting turns monitoring data into a human response. A good alert fires when users are actually hurt, reaches the right person quickly, and tells them where to look. A bad alert fires constantly for nothing, so people learn to ignore it. Designing frontend alerts means picking user-centred signals, sensible thresholds, and clear routing.",
    concepts: [
      "Alert on symptoms users feel, such as checkout error rate, failed API calls, crash-free session rate, or a jump in p75 LCP, rather than on internal causes like a single noisy console warning.",
      "Use rates and durations, not single events. 'Error rate above 2% for 5 minutes on checkout' is actionable; 'any error occurred' pages someone every minute. Service level objectives and error budgets formalise this.",
      "Every alert needs an owner, severity, and runbook link. Urgent alerts page on-call; lower-severity ones create tickets or post to a channel for business-hours follow-up.",
    ],
    code: `# alerts.yml: illustrative alert rules for frontend signals
- name: checkout-error-rate
  query: rate(frontend_errors_total{route="/checkout"}[5m]) / rate(frontend_sessions_total{route="/checkout"}[5m])
  condition: "> 0.02"
  for: 5m
  severity: page
  owner: payments-web
  runbook: https://runbooks.internal.example/checkout-errors
  message: "Checkout sessions with errors above 2% for 5 min (release {{ $labels.release }})"

- name: lcp-regression
  query: histogram_quantile(0.75, sum by (le) (rate(web_vitals_lcp_bucket{page="product"}[30m])))
  condition: "> 3.0"
  for: 30m
  severity: ticket
  owner: web-platform

- name: api-5xx-from-browser
  query: rate(frontend_api_calls_total{status=~"5.."}[5m]) / rate(frontend_api_calls_total[5m])
  condition: "> 0.05"
  for: 10m
  severity: page
  owner: api-oncall`,
    walkthrough:
      "The checkout rule measures the share of checkout sessions with errors over five minutes and must stay above 2% for five more minutes before paging, which filters out brief blips. The LCP rule watches a slower signal over a longer window and only opens a ticket. The API rule catches backend failures as experienced by browsers, which can reveal CDN or routing problems that server-side metrics miss.",
    flow: ["Measure user symptoms", "Threshold over time", "Route with a runbook"],
    mistake:
      "Alerting on absolute error counts. Traffic doubles during a sale, the count doubles, and the alert fires even though the error rate is unchanged; at night the count is low and a real outage might not cross the threshold.",
    exercise:
      "A new browser extension injects code that throws errors on 3% of sessions, but those errors do not affect your app. How do you keep alerts useful?",
    answer:
      "Filter events whose stacks come from extension URLs such as chrome-extension://, group them separately, and alert on errors from your own bundles only. Better still, alert on user-impact signals like failed checkouts rather than raw error counts.",
    deepDive: [
      {
        heading: "Reducing alert fatigue",
        points: [
          "Review every alert that fired last month: was it actionable? Delete or tune the ones that were not.",
          "Deduplicate and group related alerts into one incident.",
          "Silence alerts automatically during planned maintenance or canary deploys with their own checks.",
        ],
      },
    ],
    animation: {
      title: "From metric to page",
      nodes: [
        ["metrics", "Metrics", "error rate"],
        ["rule", "Alert rule", "> 2% for 5m"],
        ["router", "Router", "severity, owner"],
        ["oncall", "On-call", "paged"],
        ["runbook", "Runbook", "next steps"],
      ],
      steps: [
        ["metrics", "rule", "2.6%", "Checkout error rate rises to 2.6% after a deploy."],
        ["rule", "router", "fires", "It stays above 2% for five minutes, so the rule fires."],
        ["router", "oncall", "page", "Routing finds the payments-web owner and pages their on-call."],
        ["oncall", "runbook", "open", "The alert links to a runbook with dashboards and rollback steps."],
        ["runbook", "metrics", "resolved", "After the rollback the rate falls and the alert resolves itself."],
      ],
    },
  }),

  "logging-and-monitoring--fixing-production-issues": fsd({
    intro:
      "When an alert fires, the goal is to stop user harm first and understand the cause second. Frontend incident response relies on fast mitigation such as rollbacks and feature flags, then evidence such as source-mapped stack traces, session context, and replays to find the root cause. Afterwards, a blameless review turns the incident into lasting improvements.",
    concepts: [
      "Mitigate before you debug. Roll back the release, turn off the feature flag, or route traffic away. Immutable, versioned deploys make a rollback a one-click change of which HTML points at which assets.",
      "Source maps translate minified stack traces back to original files and lines. Upload them privately to your error tool on each build instead of serving them publicly.",
      "Reproduce with context: the release, browser, route, user actions leading up to the error (breadcrumbs), and, where consented and masked, session replays. Then write a failing test before fixing.",
    ],
    code: `// 1. Mitigate: a kill switch around a risky feature
function CheckoutPage() {
  const flags = useFlags(); // fetched from a flag service, cached briefly
  return flags.newPaymentForm ? <NewPaymentForm /> : <LegacyPaymentForm />;
}

// 2. Diagnose: breadcrumbs give the steps before the crash
const breadcrumbs = [];
export function crumb(message, data) {
  breadcrumbs.push({ message, data, t: Date.now() });
  if (breadcrumbs.length > 30) breadcrumbs.shift();
}
crumb("route", { to: "/checkout" });
crumb("click", { target: "button#pay" });
window.addEventListener("error", (e) => report("error", { stack: e.error?.stack, breadcrumbs }));

// 3. Fix with a regression test that reproduces the bug
test("pays when the saved card has no billing postcode", async () => {
  server.use(http.get("/api/me/cards", () => HttpResponse.json([{ id: "c1", last4: "4242", postcode: null }])));
  render(<NewPaymentForm />);
  await userEvent.click(await screen.findByRole("button", { name: /pay/i }));
  expect(await screen.findByText(/payment complete/i)).toBeInTheDocument();
});

// Build step (CI): upload hidden source maps, then delete them from the deploy folder
// sentry-cli sourcemaps upload --release "$RELEASE" dist && rm dist/assets/*.map`,
    walkthrough:
      "The flag lets on-call switch back to the legacy form in seconds without a deploy. Breadcrumbs record the last thirty steps, so the error report shows the user navigated to checkout and clicked Pay. The mapped stack trace pointed at a null postcode, so the fix starts with a test that loads a card without one. Source maps are uploaded privately and removed from the public deploy.",
    flow: ["Mitigate impact", "Diagnose with context", "Fix, test, review"],
    mistake:
      "Debugging live for an hour while users keep failing, because rolling back feels like admitting defeat. Restore service first; the broken release is still available for investigation.",
    exercise:
      "An error only happens in Safari 17 on iOS, in a code path that works everywhere else. What context do you collect, and what are your next steps?",
    answer:
      "Group by browser and OS to confirm scope, inspect the mapped stack and breadcrumbs, and check which API or CSS feature is involved. Reproduce on a real device or cloud device lab, add feature detection or a fallback, and add that browser to the test matrix for this flow.",
    deepDive: [
      {
        heading: "A blameless review template",
        points: [
          "Timeline: when it started, was detected, mitigated, and resolved.",
          "Impact: users and revenue affected.",
          "Root cause and contributing factors, not a person to blame.",
          "Action items with owners: a test, an alert, a guardrail.",
        ],
      },
    ],
    animation: {
      title: "Incident response",
      nodes: [
        ["alert", "Alert", "checkout errors"],
        ["flag", "Feature flag", "kill switch"],
        ["trace", "Mapped stack", "+ breadcrumbs"],
        ["test", "Regression test", "red → green"],
        ["release", "Fixed release", "flag back on"],
      ],
      steps: [
        ["alert", "flag", "mitigate", "On-call turns off the new payment form flag; errors stop within minutes."],
        ["flag", "trace", "investigate", "Source-mapped stacks and breadcrumbs point at a null postcode."],
        ["trace", "test", "reproduce", "A test loads a saved card without a postcode and fails."],
        ["test", "release", "fix", "The fix makes the test pass and ships in a new release."],
        ["release", "alert", "watch", "The flag is re-enabled gradually while the alert stays quiet."],
      ],
    },
  }),

  "accessibility--accessibility-overview": fsd({
    intro:
      "Accessibility means people can perceive, understand, navigate, and operate your interface regardless of disability, device, or situation. That includes screen reader and keyboard users, people with low vision or colour blindness, people with motor or cognitive impairments, and anyone using a phone in bright sunlight. It is also a legal requirement in many markets, such as the ADA in the US, the European Accessibility Act, and India's RPwD Act.",
    concepts: [
      "WCAG organises requirements under four principles, often remembered as POUR: perceivable (text alternatives, captions, contrast), operable (keyboard access, enough time, no seizure risks), understandable (readable, predictable, input help), and robust (works with assistive technologies). Level AA is the common target.",
      "Semantic HTML does most of the work. A real button is focusable, keyboard operable, and announced correctly for free; a div with a click handler is none of those. ARIA fills gaps for custom widgets, but the first rule of ARIA is to prefer native elements.",
      "Accessibility belongs in the design system and the definition of done. Accessible components, automated checks in CI, and manual keyboard and screen reader testing prevent regressions far more cheaply than audits after launch.",
    ],
    code: `<!-- ❌ Looks like a button, but is invisible to keyboard and screen reader users -->
<div class="btn" onclick="addToCart()">Add to cart</div>

<!-- ✅ Native semantics: focusable, Enter/Space work, announced as "Add to cart, button" -->
<button type="button" onclick="addToCart()">Add to cart</button>

<!-- ✅ Structure that assistive tech can navigate -->
<header>…</header>
<nav aria-label="Main">…</nav>
<main id="main">
  <h1>Winter jackets</h1>
  <section aria-labelledby="filters-heading">
    <h2 id="filters-heading">Filters</h2>
    <label for="size">Size</label>
    <select id="size">…</select>
  </section>
  <img src="/jacket.avif" alt="Red insulated jacket with a hood">
  <img src="/divider.svg" alt="">  <!-- decorative: empty alt hides it -->
</main>
<footer>…</footer>`,
    walkthrough:
      "The div version only works with a mouse. The button version gets focus, keyboard activation, and the correct role from the browser. Landmarks such as header, nav, main, and footer, plus a logical heading order, let screen reader users jump around the page. Labels are tied to inputs, meaningful images get descriptive alt text, and decorative images get empty alt so they are skipped.",
    flow: ["Use semantic HTML", "Add ARIA only for gaps", "Test with keyboard and AT"],
    mistake:
      "Adding ARIA everywhere, such as role=\"button\" on a div, without also adding tabindex, key handlers, and focus styles. ARIA changes what is announced, not how the element behaves, so it can make things worse.",
    exercise:
      "Name three accessibility checks you can do on any page in five minutes without special tools.",
    answer:
      "Tab through the whole page and check every control is reachable with a visible focus indicator; zoom to 200% and check nothing breaks or overlaps; and inspect images and form fields to confirm alt text and visible labels exist.",
    deepDive: [
      {
        heading: "Disabilities and situations to design for",
        points: [
          "Visual: blindness, low vision, colour blindness. Screen readers, magnification, contrast.",
          "Motor: limited fine control, tremor. Keyboard, switch access, voice control, large targets.",
          "Hearing: captions and transcripts for audio and video.",
          "Cognitive: clear language, consistent navigation, forgiving forms, no time pressure.",
          "Situational: one hand busy, bright sun, slow network, noisy environment.",
        ],
      },
    ],
    animation: {
      title: "What assistive tech reads",
      nodes: [
        ["html", "HTML", "semantic markup"],
        ["tree", "A11y tree", "roles + names"],
        ["sr", "Screen reader", "speaks"],
        ["kbd", "Keyboard", "Tab, Enter"],
        ["user", "User", "completes task"],
      ],
      steps: [
        ["html", "tree", "build", "The browser derives an accessibility tree from the DOM."],
        ["tree", "sr", "button", "A native button appears as role button with the name Add to cart."],
        ["kbd", "html", "Tab", "Pressing Tab moves focus to the button because it is focusable by default."],
        ["kbd", "tree", "Enter", "Enter activates it, just like a click."],
        ["sr", "user", "announce", "The screen reader announces the result, and the user finishes the purchase."],
      ],
    },
  }),

  "accessibility--keyboard-accessibility": fsd({
    intro:
      "Everything you can do with a mouse must be possible with a keyboard alone. Keyboard users include people with motor impairments, screen reader users, power users, and anyone whose trackpad just died. Keyboard accessibility depends on focus order, visible focus, expected key behaviour for each widget, and no traps.",
    concepts: [
      "Native interactive elements, such as a, button, input, select, and summary, are focusable and operable by default. Custom controls need tabindex=\"0\" and key handlers, which is why native elements are almost always better.",
      "Focus order should follow the visual reading order, which it does when DOM order matches layout. Avoid positive tabindex values and CSS reordering that makes focus jump around the screen.",
      "Composite widgets such as tabs, menus, listboxes, and grids use one Tab stop and arrow keys inside, a pattern called roving tabindex. Escape closes popups, and focus never gets stuck inside a component unless it is a modal that intentionally traps it.",
    ],
    code: `// Accessible tabs with roving tabindex and arrow-key navigation
import { useRef, useState } from "react";

export function Tabs({ tabs }) {
  const [active, setActive] = useState(0);
  const refs = useRef([]);

  function onKeyDown(event) {
    const last = tabs.length - 1;
    const next = { ArrowRight: active === last ? 0 : active + 1, ArrowLeft: active === 0 ? last : active - 1, Home: 0, End: last }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    setActive(next);
    refs.current[next].focus();
  }

  return (
    <div>
      <div role="tablist" aria-label="Product details" onKeyDown={onKeyDown}>
        {tabs.map((tab, i) => (
          <button key={tab.id} ref={(el) => (refs.current[i] = el)} role="tab" id={\`tab-\${tab.id}\`}
            aria-selected={i === active} aria-controls={\`panel-\${tab.id}\`} tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)}>
            {tab.label}
          </button>
        ))}
      </div>
      {tabs.map((tab, i) => (
        <div key={tab.id} role="tabpanel" id={\`panel-\${tab.id}\`} aria-labelledby={\`tab-\${tab.id}\`} hidden={i !== active} tabIndex={0}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}

/* Visible focus for keyboard users, without showing rings on every mouse click */
/* :focus-visible { outline: 3px solid #1a73e8; outline-offset: 2px; } */`,
    walkthrough:
      "Only the active tab has tabIndex 0, so Tab enters the tablist once and then moves on to the panel. Arrow keys, Home, and End move between tabs and wrap around, matching the ARIA Authoring Practices pattern that screen reader users expect. Each tab is linked to its panel with aria-controls and aria-labelledby, and :focus-visible keeps a strong outline for keyboard focus.",
    flow: ["Reach every control", "See where focus is", "Use expected keys"],
    mistake:
      "Removing focus outlines with outline: none for aesthetics. Keyboard users lose track of where they are on the page. Style :focus-visible instead of removing it.",
    exercise:
      "A dropdown menu opens on hover only and closes when the mouse leaves. What must change for keyboard users?",
    answer:
      "Make the trigger a button that toggles the menu on Enter, Space, and ArrowDown, move focus into the menu, support arrow keys between items and Escape to close and return focus to the trigger, and close when focus leaves the menu.",
    deepDive: [
      {
        heading: "Skip links",
        code: `<a class="skip-link" href="#main">Skip to main content</a>
<style>
  .skip-link { position: absolute; left: -9999px; }
  .skip-link:focus { left: 16px; top: 16px; z-index: 1000; }
</style>`,
      },
    ],
    animation: {
      title: "One Tab stop, arrow keys inside",
      nodes: [
        ["before", "Search box", "previous stop"],
        ["tablist", "Tablist", "Details tab"],
        ["reviews", "Reviews tab", "tabindex -1 → 0"],
        ["panel", "Tab panel", "content"],
      ],
      steps: [
        ["before", "tablist", "Tab", "Tab moves from the search box into the tablist, onto the active tab."],
        ["tablist", "reviews", "ArrowRight", "ArrowRight moves focus and selection to the Reviews tab."],
        ["reviews", "panel", "Tab", "Tab leaves the tablist and lands on the Reviews panel."],
        ["panel", "reviews", "Shift+Tab", "Shift+Tab returns to the selected tab, not the first one."],
      ],
    },
  }),

  "accessibility--screen-readers": fsd({
    intro:
      "Screen readers such as NVDA, JAWS, VoiceOver, and TalkBack turn the accessibility tree into speech or braille. Users navigate by headings, landmarks, links, and form fields, and expect every control to announce its role, name, state, and value. Designing for screen readers means giving everything a meaningful name and announcing changes that happen without a page load.",
    concepts: [
      "Accessible names come from content, labels, alt text, aria-labelledby, or aria-label, in that order of preference. Icon-only buttons need a name; images need alt text that conveys purpose, not file names.",
      "States and properties communicate what is going on: aria-expanded for disclosures, aria-pressed for toggles, aria-current for the current page, aria-invalid and aria-describedby for form errors.",
      "Dynamic updates need live regions. role=\"status\" or aria-live=\"polite\" announces messages like 'Added to cart' when the user is idle; role=\"alert\" interrupts for urgent errors. The region must exist in the DOM before its content changes.",
    ],
    code: `export function CartButton({ count, onAdd, adding }) {
  return (
    <>
      {/* Icon-only button: give it a name, and expose busy state */}
      <button type="button" onClick={onAdd} aria-busy={adding} aria-describedby="cart-count">
        <svg aria-hidden="true" focusable="false" width="20" height="20">{/* cart icon */}</svg>
        <span className="visually-hidden">Add to cart</span>
      </button>
      <span id="cart-count">{count} items in cart</span>

      {/* Live region rendered once, content updated later */}
      <p role="status" className="visually-hidden">{adding ? "" : count ? \`Added. Cart now has \${count} items.\` : ""}</p>
    </>
  );
}

export function EmailField({ error }) {
  return (
    <>
      <label htmlFor="email">Email</label>
      <input id="email" type="email" autoComplete="email"
        aria-invalid={Boolean(error)} aria-describedby={error ? "email-error" : "email-hint"} />
      <p id="email-hint">We will send the receipt here.</p>
      {error && <p id="email-error" role="alert">{error}</p>}
    </>
  );
}

/* .visually-hidden { position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; } */`,
    walkthrough:
      "The cart button's icon is hidden from assistive tech, and visually hidden text provides the name, so it is announced as 'Add to cart, button' followed by its description. After adding, the status region announces the new count politely. The email field links its hint or error with aria-describedby, marks itself invalid, and the error uses role=\"alert\" so it is announced immediately.",
    flow: ["Name every control", "Expose state", "Announce changes"],
    mistake:
      "Mounting a live region at the same time as its message. Many screen readers only announce changes to regions that already existed, so the message is never spoken.",
    exercise:
      "A search results page updates the list as the user types. What should a screen reader user hear, and how?",
    answer:
      "A concise polite announcement such as '24 results for jackets', from a status region that is always present and updated after a short debounce. Do not announce every result or every keystroke.",
    deepDive: [
      {
        heading: "Testing with real screen readers",
        points: [
          "Windows: NVDA with Firefox or Chrome; JAWS where your users use it.",
          "macOS and iOS: VoiceOver with Safari.",
          "Android: TalkBack with Chrome.",
          "Navigate by headings (H), landmarks, and form fields, and listen for names, roles, and states.",
        ],
      },
    ],
    animation: {
      title: "Announcing an added item",
      nodes: [
        ["button", "Add button", "named"],
        ["state", "Cart state", "count = 3"],
        ["live", "Status region", "already in DOM"],
        ["sr", "Screen reader", "speaks politely"],
      ],
      steps: [
        ["button", "sr", "focus", "Focus lands on the button: 'Add to cart, button, 2 items in cart'."],
        ["button", "state", "activate", "Pressing Enter adds the item and the cart count becomes 3."],
        ["state", "live", "update text", "The existing status region's text changes to the new count."],
        ["live", "sr", "polite", "The screen reader announces 'Added. Cart now has 3 items.' when idle."],
      ],
    },
  }),

  "accessibility--focus-management": fsd({
    intro:
      "Focus management means deliberately moving keyboard focus when the interface changes in ways the browser cannot infer: opening a dialog, deleting an item, navigating in a single-page app, or showing an error summary. Done well, users always know where they are. Done badly, focus disappears into the void or gets trapped.",
    concepts: [
      "Dialogs move focus inside when opened, keep it inside while open, close with Escape, and return focus to the element that opened them. The native dialog element with showModal() provides most of this, including making the rest of the page inert.",
      "Client-side route changes do not move focus or announce the new page by default. Move focus to the new page's main heading or a skip target, and update document.title.",
      "When content is removed, such as deleting a row, move focus to a logical neighbour or a heading; never leave it on an element that no longer exists, which sends it back to the top of the page.",
    ],
    code: `import { useEffect, useRef } from "react";

// Native modal dialog: focus moves in, background becomes inert, Escape closes
export function ConfirmDelete({ open, onConfirm, onClose }) {
  const ref = useRef(null);
  const opener = useRef(null);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) {
      opener.current = document.activeElement; // remember who opened it
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
      opener.current?.focus(); // return focus
    }
  }, [open]);

  return (
    <dialog ref={ref} aria-labelledby="del-title" onClose={onClose} onCancel={onClose}>
      <h2 id="del-title">Delete this address?</h2>
      <p>This cannot be undone.</p>
      <button onClick={onClose} autoFocus>Cancel</button>
      <button onClick={onConfirm}>Delete</button>
    </dialog>
  );
}

// SPA route change: move focus to the new page heading
export function useRouteFocus(pathname, title) {
  useEffect(() => {
    document.title = \`\${title} · Shop\`;
    const heading = document.querySelector("main h1");
    if (heading) {
      heading.setAttribute("tabindex", "-1");
      heading.focus();
    }
  }, [pathname, title]);
}`,
    walkthrough:
      "showModal() moves focus into the dialog, makes everything outside inert, and handles Escape through the cancel event. autoFocus places focus on the safer Cancel button. When the dialog closes, focus returns to the button that opened it so the user continues where they were. On route changes, the hook updates the title and focuses the main heading with tabindex -1, so screen readers announce the new page.",
    flow: ["Move focus in", "Contain while open", "Restore on close"],
    mistake:
      "Building a modal from a div with a high z-index and no focus handling. Keyboard users tab behind it into the page, and screen reader users may not know the modal exists.",
    exercise:
      "After a user deletes the third item in a list of five, where should focus go?",
    answer:
      "To the item that took its place, the new third item, or to the previous item if it was the last one; if the list becomes empty, to the list heading or the Add button. Announce the deletion with a status message.",
    deepDive: [
      {
        heading: "Focus-related WCAG criteria",
        points: [
          "2.4.3 Focus Order: focus follows a meaningful sequence.",
          "2.4.7 Focus Visible: a visible indicator exists.",
          "2.4.11 Focus Not Obscured: sticky headers or cookie banners do not cover the focused element.",
          "2.1.2 No Keyboard Trap: users can always move focus away, except by design in modals with a way out.",
        ],
      },
    ],
    animation: {
      title: "A dialog's focus lifecycle",
      nodes: [
        ["trigger", "Delete button", "opener"],
        ["dialog", "Dialog", "showModal()"],
        ["cancel", "Cancel", "autoFocus"],
        ["page", "Page", "inert"],
      ],
      steps: [
        ["trigger", "dialog", "open", "Activating Delete opens the dialog and remembers the opener."],
        ["dialog", "cancel", "focus", "Focus moves to Cancel, the safest first action."],
        ["dialog", "page", "inert", "The rest of the page is inert, so Tab cycles only inside the dialog."],
        ["cancel", "trigger", "Escape", "Escape closes the dialog and focus returns to the Delete button."],
      ],
    },
  }),

  "accessibility--color-contrast": fsd({
    intro:
      "Colour contrast decides whether text and controls can be seen by people with low vision, colour blindness, ageing eyes, or a phone screen in sunlight. WCAG defines measurable contrast ratios, and design tokens make meeting them systematic. Colour must also never be the only way information is conveyed.",
    concepts: [
      "Contrast ratio compares the relative luminance of two colours, from 1:1 to 21:1. WCAG AA requires 4.5:1 for normal text, 3:1 for large text (about 24 px, or 19 px bold), and 3:1 for UI components and meaningful graphics such as input borders and focus rings.",
      "Do not rely on colour alone. Errors need an icon or text as well as red, links in body text need an underline or other cue, and charts need labels or patterns, because about 1 in 12 men has some form of colour vision deficiency.",
      "Check every state: hover, focus, disabled, placeholder, dark mode, and text over images or gradients. Contrast often passes in the default state and fails in the others.",
    ],
    code: `// Contrast ratio from WCAG relative luminance
function luminance(hex) {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

contrast("#767676", "#ffffff"); // ≈ 4.54 → passes AA for body text
contrast("#999999", "#ffffff"); // ≈ 2.85 → fails, even for large text

// Design tokens validated in a unit test, so a theme change cannot regress contrast
const tokens = { text: "#1f2937", muted: "#4b5563", surface: "#ffffff", danger: "#b91c1c", border: "#6b7280" };
test("text tokens meet AA on surface", () => {
  expect(contrast(tokens.text, tokens.surface)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(tokens.muted, tokens.surface)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(tokens.danger, tokens.surface)).toBeGreaterThanOrEqual(4.5);
  expect(contrast(tokens.border, tokens.surface)).toBeGreaterThanOrEqual(3);
});`,
    walkthrough:
      "The function implements the WCAG formula: convert sRGB channels to linear light, weight them by how sensitive the eye is to each, then compare the lighter and darker luminance with a small offset. #767676 on white is famously the lightest grey that passes 4.5:1. The token test runs in CI so a designer or developer changing a token cannot silently ship unreadable text.",
    flow: ["Measure the ratio", "Meet AA per element type", "Add non-colour cues"],
    mistake:
      "Using light grey placeholder text as the only label for an input. It usually fails contrast and disappears when the user starts typing. Use a visible label.",
    exercise:
      "A form shows invalid fields with a red border only. Name two changes that make it accessible.",
    answer:
      "Add an error message in text with an icon next to the field, linked with aria-describedby, and make sure the border colour itself has at least 3:1 contrast against the background. Also mark the field aria-invalid.",
    deepDive: [
      {
        heading: "Beyond WCAG 2 ratios",
        paragraphs: [
          "The draft APCA method in WCAG 3 work models perceived contrast more accurately, especially for dark mode and thin fonts. WCAG 2.2 ratios remain the legal and audit baseline today, so meet them while using better models to guide design decisions.",
        ],
      },
    ],
    animation: {
      title: "Checking a text colour",
      nodes: [
        ["token", "Muted token", "#999999"],
        ["calc", "Contrast calc", "luminance ratio"],
        ["fail", "2.85:1", "fails AA"],
        ["fix", "Darker token", "#4b5563"],
        ["pass", "7.56:1", "passes AA"],
      ],
      steps: [
        ["token", "calc", "measure", "The muted grey is compared with the white surface."],
        ["calc", "fail", "2.85", "At 2.85:1 it fails even the large-text threshold."],
        ["fail", "fix", "adjust", "The token is darkened in the design system."],
        ["fix", "calc", "re-measure", "The new value is measured against the same background."],
        ["calc", "pass", "7.56", "The new ratio passes AA and even AAA for body text."],
      ],
    },
  }),

  "accessibility--accessibility-tools": fsd({
    intro:
      "Accessibility tools catch issues faster and more consistently than memory alone. Automated scanners find roughly a third to a half of WCAG issues, such as missing labels, low contrast, and invalid ARIA, while browser devtools and screen readers help with the rest. A good toolkit covers design, development, CI, and manual testing.",
    concepts: [
      "Linters such as eslint-plugin-jsx-a11y flag issues while you type: images without alt, click handlers on non-interactive elements, invalid ARIA attributes.",
      "Scanners built on axe-core, available as browser extensions, Lighthouse audits, and libraries for Playwright, Cypress, and Testing Library, check rendered pages and fail CI on violations.",
      "Browser devtools show the accessibility tree, computed names and roles, contrast ratios, and can emulate vision deficiencies and reduced motion. Screen readers and keyboard-only testing remain essential for flows and usability.",
    ],
    code: `// tests/a11y.spec.ts: scan key pages with axe in Playwright
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = ["/", "/products/p_demo0001", "/cart", "/checkout"];

for (const path of pages) {
  test(\`no serious accessibility violations on \${path}\`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .exclude("#third-party-chat") // tracked separately with the vendor
      .analyze();

    const serious = results.violations.filter((v) => ["serious", "critical"].includes(v.impact));
    expect(serious, serious.map((v) => \`\${v.id}: \${v.nodes.length} nodes\`).join("\\n")).toEqual([]);
  });
}

// eslint.config.js
// import jsxA11y from "eslint-plugin-jsx-a11y";
// export default [jsxA11y.flatConfigs.recommended];`,
    walkthrough:
      "The test visits four key pages, runs axe against WCAG A and AA rules up to 2.2, ignores a third-party widget tracked elsewhere, and fails if any serious or critical violation exists, printing rule IDs and node counts for quick debugging. The ESLint config catches common issues before code is even committed.",
    flow: ["Lint while coding", "Scan in CI", "Test manually with AT"],
    mistake:
      "Treating a passing axe scan as full compliance. Scanners cannot judge whether alt text is meaningful, whether focus order makes sense, or whether a custom widget is usable with a screen reader.",
    exercise:
      "Which tool would catch each: a missing form label, a confusing focus order in a modal, and alt text that says 'image123.jpg'?",
    answer:
      "Missing label: axe or the ESLint plugin. Focus order: manual keyboard testing. Meaningless alt text: human review, though some scanners flag file-name-like alt text as suspicious.",
    deepDive: [
      {
        heading: "Devtools features to try",
        points: [
          "Chrome: Elements → Accessibility pane, full-page accessibility tree, Rendering → emulate vision deficiencies.",
          "Firefox: Accessibility Inspector with tab-order overlay and contrast checks.",
          "Safari: Accessibility audit and VoiceOver rotor for headings and landmarks.",
        ],
      },
    ],
    animation: {
      title: "Accessibility checks across the pipeline",
      nodes: [
        ["editor", "Editor", "jsx-a11y lint"],
        ["ci", "CI", "axe scans"],
        ["manual", "Manual test", "keyboard + SR"],
        ["prod", "Production", "user feedback"],
      ],
      steps: [
        ["editor", "ci", "commit", "Lint catches an img without alt before the commit lands."],
        ["ci", "editor", "violation", "axe finds a low-contrast button on the cart page and fails the build."],
        ["ci", "manual", "release", "Before release, a tester runs the checkout flow with keyboard and VoiceOver."],
        ["manual", "prod", "ship", "Issues found by people go into the backlog with WCAG references."],
        ["prod", "editor", "feedback", "An accessibility feedback link lets users report problems directly."],
      ],
    },
  }),

  "accessibility--fixing-accessibility-issues": fsd({
    intro:
      "Fixing accessibility on an existing product is a prioritisation problem. Audits often return hundreds of findings; the trick is to fix shared components first, unblock the most important user journeys, prevent new issues with automation, and track progress so it does not stall. Most fixes are small once you know the pattern.",
    concepts: [
      "Prioritise by impact and reach: blockers that stop a task, such as an unlabeled pay button or a keyboard trap, on high-traffic journeys come first. Fixing a shared Button or Modal component fixes every screen that uses it.",
      "Use a repeatable workflow: reproduce with keyboard and a screen reader, identify the WCAG criterion, apply the established pattern, add an automated test where possible, and verify again with assistive technology.",
      "Prevent regressions by adding checks to CI, documenting accessible usage in the design system, and including accessibility in design reviews and the definition of done.",
    ],
    code: `// Before: an audit finding on a custom select ("Blocker: not operable by keyboard")
<div className="select" onClick={() => setOpen(!open)}>
  {value || "Choose size"}
  {open && <ul>{sizes.map((s) => <li onClick={() => choose(s)}>{s}</li>)}</ul>}
</div>

// After: native control with a visible label, error, and description
<label htmlFor="size">Size</label>
<select id="size" value={value} onChange={(e) => choose(e.target.value)}
  aria-invalid={Boolean(error)} aria-describedby={error ? "size-error" : undefined}>
  <option value="">Choose size</option>
  {sizes.map((s) => <option key={s} value={s}>{s}</option>)}
</select>
{error && <p id="size-error" role="alert">{error}</p>}

// Regression test locks the fix in
test("size can be chosen with the keyboard and is labelled", async () => {
  render(<SizePicker sizes={["S", "M", "L"]} />);
  const select = screen.getByRole("combobox", { name: "Size" });
  await userEvent.selectOptions(select, "M");
  expect(select).toHaveValue("M");
});`,
    walkthrough:
      "The custom div select failed keyboard, screen reader, and mobile usability. Replacing it with a native select fixes all of those at once and is styled with CSS. The label gives it a name, errors are announced and linked, and the test finds the control by role and name, so it fails if anyone removes the label in future.",
    flow: ["Triage by impact", "Apply the pattern", "Test to prevent regressions"],
    mistake:
      "Installing an accessibility overlay widget that promises automatic compliance. Overlays rarely fix underlying markup, often interfere with users' own assistive technology, and do not satisfy legal requirements.",
    exercise:
      "An audit lists 300 issues across 40 pages. Describe the first week of your plan.",
    answer:
      "Group findings by component and by criterion, fix the shared components that account for most of them, prioritise blockers on sign-in, search, and checkout, add axe scans to CI to stop new issues, and publish a tracker so progress is visible.",
    deepDive: [
      {
        heading: "Common fixes, quick reference",
        points: [
          "Missing name: add a visible label or visually hidden text.",
          "Clickable div: change to button or link.",
          "Low contrast: adjust the design token.",
          "Missing focus style: style :focus-visible.",
          "Silent updates: add a status live region.",
          "Modal problems: use dialog with showModal.",
        ],
      },
    ],
    animation: {
      title: "From audit finding to lasting fix",
      nodes: [
        ["audit", "Audit", "300 findings"],
        ["triage", "Triage", "by component"],
        ["component", "Shared Select", "fixed once"],
        ["pages", "40 pages", "inherit fix"],
        ["ci", "CI checks", "no regressions"],
      ],
      steps: [
        ["audit", "triage", "group", "Findings are grouped; 90 come from one custom select component."],
        ["triage", "component", "fix", "The component is rebuilt on a native select with a proper label."],
        ["component", "pages", "propagate", "Every page using it is fixed in the same release."],
        ["pages", "ci", "guard", "A role-and-name test and axe scans stop the issue returning."],
        ["ci", "audit", "re-audit", "A follow-up audit shows the remaining work and the progress made."],
      ],
    },
  }),

  "offline-support--service-workers": fsd({
    intro:
      "A service worker is a script the browser runs in the background, separate from your pages, that can intercept network requests, cache responses, receive push messages, and sync data when connectivity returns. It is the foundation of offline support and installable web apps, and it has a lifecycle you must understand to ship updates safely.",
    concepts: [
      "Lifecycle: register, install (precache files), wait while old pages still use the previous worker, activate (clean old caches), then control pages and handle fetch events. Updates follow the same path when the worker script changes.",
      "Scope and security: a worker controls pages under its scope path, only works on HTTPS or localhost, and has no DOM access. It talks to pages through postMessage and to the network with fetch.",
      "Background capabilities include Background Sync to retry actions when online, Push notifications with user permission, and periodic sync in some browsers. The browser may stop an idle worker at any time, so keep no important state in memory.",
    ],
    code: `// main.js: register and offer updates without surprising the user
if ("serviceWorker" in navigator) {
  const registration = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

  registration.addEventListener("updatefound", () => {
    const worker = registration.installing;
    worker.addEventListener("statechange", () => {
      if (worker.state === "installed" && navigator.serviceWorker.controller) {
        showToast("A new version is available", { action: "Reload", onAction: () => worker.postMessage("SKIP_WAITING") });
      }
    });
  });

  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!reloading) { reloading = true; location.reload(); }
  });
}

// sw.js: lifecycle hooks and background sync for queued orders
self.addEventListener("message", (event) => { if (event.data === "SKIP_WAITING") self.skipWaiting(); });
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

self.addEventListener("sync", (event) => {
  if (event.tag === "send-outbox") event.waitUntil(sendQueuedRequests()); // reads IndexedDB outbox
});`,
    walkthrough:
      "When a new worker finishes installing while an old one controls the page, the app shows a toast instead of switching silently. Choosing Reload tells the waiting worker to skip waiting; when it takes control, controllerchange reloads the page once so HTML, assets, and worker all match. The sync handler retries queued requests stored in IndexedDB when the browser detects connectivity.",
    flow: ["Install and precache", "Activate and claim", "Intercept, sync, update"],
    mistake:
      "Calling skipWaiting() unconditionally on install. A page that loaded old JavaScript can suddenly have its requests served by a new worker with a different cache, causing missing chunks and odd bugs mid-session.",
    exercise:
      "You deploy a broken service worker that serves an error page for every navigation. How do you recover users quickly?",
    answer:
      "Deploy a fixed sw.js at the same URL; browsers check for updates on navigation and at least every 24 hours, and serving sw.js with no-cache ensures they see it. In an emergency, deploy a worker that unregisters itself and clears caches. Keep a kill-switch plan documented.",
    deepDive: [
      {
        heading: "Debugging service workers",
        points: [
          "DevTools → Application → Service Workers: update on reload, bypass for network, unregister.",
          "Application → Cache Storage to inspect cached entries.",
          "Use a separate scope or a query flag to disable the worker while developing other features.",
        ],
      },
    ],
    animation: {
      title: "Service worker lifecycle",
      nodes: [
        ["page", "Page", "register()"],
        ["install", "Installing", "precache"],
        ["waiting", "Waiting", "old worker active"],
        ["active", "Active", "controls pages"],
        ["network", "Network", "fetch / sync"],
      ],
      steps: [
        ["page", "install", "register", "The page registers sw.js and the browser starts installing it."],
        ["install", "waiting", "installed", "Precaching succeeds; the new worker waits while the old one controls tabs."],
        ["waiting", "active", "skipWaiting", "The user chooses Reload, so the new worker activates and cleans old caches."],
        ["active", "page", "controllerchange", "The page reloads once under the new worker."],
        ["active", "network", "intercept", "From now on, fetches and background syncs pass through the worker."],
      ],
    },
  }),

  "offline-support--progressive-web-applications": fsd({
    intro:
      "A Progressive Web App is a website that can be installed, launched like an app, work offline or on poor networks, and re-engage users with notifications, while remaining a normal URL that search engines and links reach. The ingredients are HTTPS, a web app manifest, a service worker, and an offline-first design mindset.",
    concepts: [
      "The manifest describes the app: name, icons, start URL, display mode such as standalone, theme colour, and shortcuts. With a service worker that handles fetch, browsers offer installation and the app gets its own window and icon.",
      "Offline-first means the UI reads from local data first and syncs in the background. The app shell loads from cache instantly, content comes from IndexedDB or cached responses, and writes go to an outbox until the network returns.",
      "Platform features grow over time: push notifications, badging, file handling, share target, and background sync. Support varies by browser and operating system, so detect features and enhance progressively.",
    ],
    code: `// manifest.webmanifest
{
  "name": "Shop: Winter Store",
  "short_name": "Shop",
  "start_url": "/?source=pwa",
  "scope": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#1a73e8",
  "icons": [
    { "src": "/icons/192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [{ "name": "My orders", "url": "/orders" }]
}

<!-- index.html -->
<link rel="manifest" href="/manifest.webmanifest">

// Offer install at a meaningful moment, not on first load
let deferredPrompt;
addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
});
export async function offerInstallAfterOrder() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice; // "accepted" | "dismissed"
  track("pwa_install_prompt", { outcome });
  deferredPrompt = null;
}

// Offline-aware UI
addEventListener("offline", () => showBanner("You are offline. Changes will sync later."));
addEventListener("online", () => hideBanner());`,
    walkthrough:
      "The manifest gives the installed app a name, icons including a maskable one for Android shapes, a standalone window, and a shortcut to orders. The start URL is tagged so you can measure installed usage. Instead of prompting on first visit, the app saves the install event and offers it after a successful order, when users see value. Online and offline events drive a banner that sets expectations.",
    flow: ["Add manifest + service worker", "Design offline-first", "Enhance with platform features"],
    mistake:
      "Calling something a PWA because it has a manifest, while every screen still shows a browser error page offline. Installability without offline resilience gives users an app icon that breaks on the train.",
    exercise:
      "Design the offline behaviour of a PWA for field technicians who fill inspection forms in basements.",
    answer:
      "Precache the app shell and form definitions, store drafts and completed inspections in IndexedDB, queue submissions in an outbox with Background Sync and a manual retry button, show clear sync status per item, and resolve conflicts when the server already has newer data.",
    deepDive: [
      {
        heading: "Checklist for a solid PWA",
        points: [
          "Fast load from cache on repeat visits; a custom offline page at minimum.",
          "Works with keyboard and screen readers in standalone mode, where there is no browser UI.",
          "Handles updates gracefully with a refresh prompt.",
          "Respects permissions: ask for notifications only after a user action that explains why.",
        ],
      },
    ],
    animation: {
      title: "An installed app on a flaky network",
      nodes: [
        ["icon", "Home screen", "launch"],
        ["shell", "App shell", "from cache"],
        ["idb", "IndexedDB", "local data"],
        ["outbox", "Outbox", "queued writes"],
        ["server", "Server", "sync"],
      ],
      steps: [
        ["icon", "shell", "launch", "Tapping the icon opens a standalone window and the cached shell loads instantly."],
        ["shell", "idb", "read", "Orders and drafts render from IndexedDB, even with no signal."],
        ["shell", "outbox", "submit", "A new form submission is saved to the outbox while offline."],
        ["outbox", "server", "sync", "When connectivity returns, Background Sync sends the queued submission."],
        ["server", "idb", "confirm", "The server confirms and the local record is marked synced."],
      ],
    },
  }),
};
