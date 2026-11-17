// Testing lessons for Frontend System Design.
import { fsd } from "./fsdLessonSchema.js";

export const testingLessons = {
  "testing--testing-overview": fsd({
    intro:
      "A testing strategy is a design decision about confidence per unit of effort. Frontends combine fast unit tests, component and integration tests that exercise real rendering, a thin layer of end-to-end tests through a real browser, and specialised checks for performance, accessibility, and security. The goal is catching regressions before users do, without a suite so slow or flaky that people stop trusting it.",
    concepts: [
      "The testing pyramid, or the testing trophy popular in frontend teams, says most confidence should come from cheap tests. Static analysis with TypeScript and ESLint catches whole classes of bugs for free; unit tests cover pure logic; integration tests cover components with their real children; a few E2E tests cover critical journeys.",
      "Test behavior, not implementation. Tests that query by role and text and simulate real user events survive refactors; tests that assert internal state or CSS classes break every time the code is reorganised.",
      "Tests belong in the delivery pipeline. Run fast suites on every commit, E2E on pull requests or merges, and visual, performance, and security checks on schedules or release candidates, with clear owners for failures.",
    ],
    code: `// package.json scripts for a layered strategy
{
  "scripts": {
    "lint": "eslint . && tsc --noEmit",                 // static: seconds
    "test": "vitest run",                               // unit + integration: under a minute
    "test:e2e": "playwright test --project=chromium",   // critical journeys: minutes
    "test:a11y": "playwright test tests/a11y",          // axe scans on key pages
    "test:perf": "lhci autorun"                         // Lighthouse budgets on build output
  }
}

// What goes where for a checkout feature
// unit:        calculateTotals(cart, coupon) → exact numbers, edge cases
// integration: <Checkout /> with mocked API → errors shown, button disabled while paying
// e2e:         guest adds item, pays with test card, sees confirmation
// a11y:        checkout page has no critical axe violations
// perf:        checkout JS stays under 170 KB gzipped`,
    walkthrough:
      "Each script targets a different layer and cost. The checkout comment block shows how one feature is split: arithmetic lives in unit tests where hundreds of cases run in milliseconds, UI behavior with failure states lives in integration tests with a mocked network, and only the happy path plus one payment failure runs end to end through a browser.",
    flow: ["Static checks", "Unit + integration", "Few E2E journeys"],
    mistake:
      "Inverting the pyramid with hundreds of E2E tests. The suite takes an hour, fails randomly on timing, and developers learn to rerun until green, which hides real bugs.",
    exercise:
      "Your team has 90% line coverage yet a broken checkout button reached production. What does that tell you about the suite?",
    answer:
      "Coverage measures which lines ran, not whether behavior was asserted. The suite likely tests implementation details or lacks an integration or E2E test that actually clicks the button through the real flow. Add a behavioral test for that journey.",
    deepDive: [
      {
        heading: "Types of tests covered in this module",
        points: [
          "Unit and integration: logic and components in isolation or together.",
          "E2E and automation: real browsers driving real flows.",
          "A/B testing: experiments that test product hypotheses with users.",
          "Performance testing: lab and load tests against budgets.",
          "Security testing: scanners, dependency checks, and manual review.",
          "TDD: a workflow that writes tests first to drive design.",
        ],
      },
    ],
    animation: {
      title: "A change moving through the test layers",
      nodes: [
        ["commit", "Commit", "checkout change"],
        ["static", "Static", "types + lint"],
        ["unit", "Unit/integration", "Vitest"],
        ["e2e", "E2E", "Playwright"],
        ["release", "Release", "monitored"],
      ],
      steps: [
        ["commit", "static", "seconds", "Types and lint run first and reject a misspelled prop instantly."],
        ["static", "unit", "< 1 min", "Hundreds of unit and component tests verify totals and error states."],
        ["unit", "e2e", "minutes", "A handful of browser tests complete a guest checkout end to end."],
        ["e2e", "release", "ship", "Only after all layers pass does the change ship behind monitoring."],
        ["release", "commit", "feedback", "A production error becomes a new regression test at the cheapest layer."],
      ],
    },
  }),

  "testing--unit-and-integration-testing": fsd({
    intro:
      "Unit tests check a small piece of logic in isolation; integration tests check that pieces work together, such as a component with its children, hooks, and a mocked network. In frontend work the most valuable tests are often component integration tests that render real UI and interact like a user, with only the network boundary faked.",
    concepts: [
      "Pure functions are the easiest units: formatting prices, reducing cart state, building query strings. They need no DOM and run in microseconds, so test edge cases exhaustively here.",
      "Component integration tests render with Testing Library and query by accessible role, label, and text. User events such as typing and clicking go through userEvent, which fires the same sequence of events a browser would.",
      "Mock at the network boundary with a tool like Mock Service Worker rather than mocking your own modules. The component then uses its real data layer, so the test catches mistakes in request building and response handling.",
    ],
    code: `// cart.js
export function totals(items, couponPercent = 0) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = Math.round(subtotal * (couponPercent / 100));
  return { subtotal, discount, total: subtotal - discount };
}

// cart.test.js: unit
import { totals } from "./cart";
test("applies a percentage coupon and rounds to whole cents", () => {
  expect(totals([{ price: 999, qty: 3 }], 10)).toEqual({ subtotal: 2997, discount: 300, total: 2697 });
});

// ApplyCoupon.test.jsx: integration with a mocked API
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { setupServer } from "msw/node";
import ApplyCoupon from "./ApplyCoupon";

const server = setupServer(
  http.post("/api/coupons/validate", async ({ request }) => {
    const { code } = await request.json();
    return code === "SAVE10"
      ? HttpResponse.json({ percent: 10 })
      : HttpResponse.json({ message: "Coupon expired" }, { status: 422 });
  }),
);
beforeAll(() => server.listen());
afterAll(() => server.close());

test("shows the server error for an invalid coupon", async () => {
  render(<ApplyCoupon />);
  await userEvent.type(screen.getByLabelText(/coupon code/i), "OLD5");
  await userEvent.click(screen.getByRole("button", { name: /apply/i }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Coupon expired");
});`,
    walkthrough:
      "The unit test pins the arithmetic, including rounding, which is where money bugs hide. The integration test renders the real ApplyCoupon component, types into the field by its label, clicks the button by its accessible name, and waits for an alert. MSW intercepts the real fetch call, so the component's request body and error handling are exercised exactly as in production.",
    flow: ["Test pure logic directly", "Render like a user", "Fake only the network"],
    mistake:
      "Mocking the component's own hooks or child components to make tests easier. The test passes even when the real wiring is broken, which is the bug you most wanted to catch.",
    exercise:
      "A test uses container.querySelector('.btn-primary') to click Apply. Why is that fragile, and what should it use instead?",
    answer:
      "It couples the test to a CSS class that may change with styling and ignores whether the button is accessible. Use screen.getByRole('button', { name: /apply/i }), which also fails if the button loses its accessible name.",
    deepDive: [
      {
        heading: "Keeping integration tests fast and stable",
        points: [
          "Use findBy queries or waitFor for async UI instead of fixed sleeps.",
          "Reset MSW handlers and module state between tests to avoid order dependence.",
          "Run in jsdom or happy-dom for speed; move layout-dependent checks to browser tests.",
        ],
      },
    ],
    animation: {
      title: "An integration test run",
      nodes: [
        ["test", "Test", "userEvent"],
        ["component", "Component", "real code"],
        ["fetch", "fetch()", "real call"],
        ["msw", "MSW", "fake server"],
        ["dom", "DOM", "assertions"],
      ],
      steps: [
        ["test", "component", "type + click", "The test types a coupon and clicks Apply through the accessible button."],
        ["component", "fetch", "POST", "The component's real data layer builds and sends the request."],
        ["fetch", "msw", "intercept", "MSW intercepts it and returns a 422 for the expired coupon."],
        ["msw", "component", "error", "The component handles the error exactly as it would in production."],
        ["component", "dom", "alert", "The test finds the alert by role and checks its text."],
      ],
    },
  }),

  "testing--e2e-and-automation-testing": fsd({
    intro:
      "End-to-end tests drive a real browser through your deployed app the way a user would, touching the real backend or a realistic staging copy. They give the highest confidence that the system works as a whole, and they are the slowest and most fragile tests you have. Design them around a few critical journeys and invest in stability.",
    concepts: [
      "Choose journeys by business risk: sign-up, sign-in, search, add to cart, checkout, and anything that would page someone if broken. Each test should represent a full user goal, not a single click.",
      "Stability comes from user-facing locators, auto-waiting assertions, isolated test data, and avoiding shared state between tests. Tools such as Playwright wait for elements to be actionable and retry assertions until a timeout.",
      "Automation extends beyond tests: the same scripts can run against production as synthetic monitoring, capture screenshots for visual regression, and run across browsers and device sizes in parallel.",
    ],
    code: `// tests/checkout.spec.ts (Playwright)
import { test, expect } from "@playwright/test";

test.beforeEach(async ({ request }) => {
  // Seed isolated data through an API instead of clicking through setup screens
  await request.post("/test-api/reset", { data: { seed: "one-product" } });
});

test("guest can buy a product with a test card", async ({ page }) => {
  await page.goto("/products/p_demo0001");
  await page.getByRole("button", { name: "Add to cart" }).click();
  await page.getByRole("link", { name: /cart \\(1\\)/i }).click();
  await page.getByRole("button", { name: "Checkout" }).click();

  await page.getByLabel("Email").fill("guest@example.test");
  const card = page.frameLocator('iframe[title="Secure card payment"]');
  await card.getByLabel("Card number").fill("4242 4242 4242 4242");
  await card.getByLabel("Expiry").fill("12 / 34");
  await card.getByLabel("CVC").fill("123");

  await page.getByRole("button", { name: /pay/i }).click();
  await expect(page.getByRole("heading", { name: "Thank you for your order" })).toBeVisible();
});`,
    walkthrough:
      "Setup happens through a test-only API, which is fast and deterministic. The test then follows the real journey using roles and labels, fills the payment provider's iframe with its published test card, and asserts on the confirmation heading. Playwright's auto-waiting means there are no sleeps; each action waits until the element is visible, enabled, and stable.",
    flow: ["Seed isolated data", "Drive the journey", "Assert the user outcome"],
    mistake:
      "Writing E2E tests that depend on each other, such as one test creating an account the next test signs into. A single failure cascades, and tests cannot run in parallel or in random order.",
    exercise:
      "Your checkout E2E test fails one run in ten with an element-not-found error right after clicking Pay. What do you investigate first?",
    answer:
      "Check whether the test waits on a fixed timeout or a non-retrying query instead of an auto-waiting expect. Look at the trace for slow network responses or animations, and make sure the assertion targets the final state, such as the confirmation heading, rather than an intermediate spinner.",
    deepDive: [
      {
        heading: "Debugging tools worth using",
        points: [
          "Traces record DOM snapshots, network, and console for each step of a failed run.",
          "Run headed or in UI mode locally to watch the browser.",
          "Retries in CI should be a safety net with flake tracking, not a way to hide broken tests.",
        ],
      },
    ],
    animation: {
      title: "A checkout journey in a real browser",
      nodes: [
        ["runner", "Test runner", "Playwright"],
        ["browser", "Browser", "Chromium"],
        ["app", "App", "staging build"],
        ["api", "Backend", "seeded data"],
        ["payment", "Payment iframe", "test mode"],
      ],
      steps: [
        ["runner", "api", "seed", "The runner resets data so this test starts from a known state."],
        ["runner", "browser", "goto", "A fresh browser context opens the product page."],
        ["browser", "app", "add to cart", "Clicks and typing follow the same path a customer would."],
        ["app", "payment", "test card", "The card form inside the provider's iframe receives a test card."],
        ["payment", "app", "confirmed", "The app shows the confirmation heading that the test asserts on."],
      ],
    },
  }),

  "testing--a-b-testing": fsd({
    intro:
      "A/B testing compares two or more versions of an experience with real users to learn which performs better on a chosen metric. Frontend engineers own much of the machinery: assigning users to variants consistently, rendering variants without flicker, logging exposures accurately, and cleaning up after the decision.",
    concepts: [
      "Assignment must be random and sticky. Hashing a stable user or device ID with the experiment name gives each user the same variant on every visit and device without storing extra state.",
      "Exposure logging records when a user actually saw a variant, not when they were assigned. Analysis compares users exposed to each variant on a primary metric, such as conversion, and guardrail metrics, such as errors and latency.",
      "Rendering choices matter. Client-side switching after load causes flicker and biases results; server-side or edge assignment renders the right variant in the first HTML.",
    ],
    code: `// Deterministic bucketing shared by server and client
async function bucket(userId, experiment, weights = { control: 50, treatment: 50 }) {
  const data = new TextEncoder().encode(\`\${experiment}:\${userId}\`);
  const hash = new Uint32Array(await crypto.subtle.digest("SHA-256", data))[0];
  let point = hash % 100;
  for (const [variant, weight] of Object.entries(weights)) {
    if (point < weight) return variant;
    point -= weight;
  }
  return "control";
}

// React: render the assigned variant and log exposure once it is visible
function CheckoutButton({ userId }) {
  const variant = useExperiment("checkout-button-copy", userId); // resolved on the server
  useEffect(() => {
    track("experiment_exposure", { experiment: "checkout-button-copy", variant });
  }, [variant]);
  return <button>{variant === "treatment" ? "Buy now, pay later" : "Place order"}</button>;
}`,
    walkthrough:
      "Hashing the experiment name with the user ID gives a uniform number from 0 to 99, which maps onto weighted variants. Because it is deterministic, the server can render the correct text in the initial HTML and the client computes the same answer during hydration. Exposure is logged after render so only users who reached the button count in the analysis.",
    flow: ["Assign deterministically", "Render without flicker", "Log exposure and analyse"],
    mistake:
      "Stopping an experiment the moment the dashboard shows significance. Peeking repeatedly inflates false positives. Decide sample size and duration in advance, or use a sequential testing method designed for peeking.",
    exercise:
      "The treatment variant loads an extra 80 KB of JavaScript. Conversion drops slightly. How do you know whether the copy or the performance caused it?",
    answer:
      "Check guardrail metrics such as load time and interaction latency per variant. If performance differs, the experiment is confounded; ship the treatment without the extra bundle, or run a variant with the same weight, to isolate the copy change.",
    deepDive: [
      {
        heading: "Hygiene after the decision",
        points: [
          "Remove losing variants and the flag check from code promptly; stale experiments become dead code.",
          "Keep a registry of running experiments so tests do not interact on the same page.",
          "Exclude internal users and bots from analysis.",
        ],
      },
    ],
    animation: {
      title: "Running an experiment without flicker",
      nodes: [
        ["user", "User", "user_42"],
        ["edge", "Edge / server", "hash bucket"],
        ["page", "Page", "variant B"],
        ["events", "Analytics", "exposures"],
        ["analysis", "Analysis", "conversion"],
      ],
      steps: [
        ["user", "edge", "request", "The request carries a stable user ID cookie."],
        ["edge", "page", "treatment", "Hashing experiment and user puts this user in treatment."],
        ["page", "events", "exposure", "The button renders in the first HTML and logs an exposure when seen."],
        ["user", "events", "purchase", "A later purchase is attributed to the variant the user saw."],
        ["events", "analysis", "compare", "Analysts compare conversion and guardrails between variants."],
      ],
    },
  }),

  "testing--performance-testing": fsd({
    intro:
      "Performance testing checks that the app stays fast under realistic conditions and does not regress over time. For frontends that means lab tests of loading and interaction on throttled devices, budgets enforced in CI, and load tests of the APIs and edge infrastructure the frontend depends on during traffic spikes.",
    concepts: [
      "Lab tests such as Lighthouse and WebPageTest run controlled loads with fixed CPU and network throttling, so results are repeatable and good for catching regressions before release. They complement, but do not replace, real-user monitoring.",
      "Budgets turn goals into pass or fail checks: maximum JavaScript size per route, Largest Contentful Paint under 2.5 seconds on a mid-range phone profile, no long task over 200 ms during a key interaction.",
      "Load testing tools such as k6 or Artillery simulate many concurrent users against APIs, SSR servers, and CDNs, revealing bottlenecks like slow database queries or cache stampedes that a single-user lab test never sees.",
    ],
    code: `// lighthouserc.json: fail the pull request if budgets regress
{
  "ci": {
    "collect": { "url": ["http://localhost:4173/", "http://localhost:4173/products/p_demo0001"], "numberOfRuns": 3 },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "total-blocking-time": ["error", { "maxNumericValue": 200 }],
        "resource-summary:script:size": ["error", { "maxNumericValue": 180000 }]
      }
    }
  }
}

// load/search.js: k6 load test for the search API behind autocomplete
import http from "k6/http";
import { check } from "k6";
export const options = {
  stages: [{ duration: "1m", target: 200 }, { duration: "3m", target: 200 }, { duration: "1m", target: 0 }],
  thresholds: { http_req_duration: ["p(95)<300"], http_req_failed: ["rate<0.01"] },
};
export default function () {
  const res = http.get(\`https://staging.shop.example/api/search?q=sho\${__VU % 10}\`);
  check(res, { "status 200": (r) => r.status === 200 });
}`,
    walkthrough:
      "Lighthouse CI loads two key pages three times each and fails the build if the median breaks the performance score, LCP, blocking time, or script size budgets. The k6 script ramps to 200 virtual users hitting the search API, holds for three minutes, and fails if the 95th percentile latency exceeds 300 ms or more than 1% of requests fail.",
    flow: ["Set budgets", "Test in lab and under load", "Fail builds on regressions"],
    mistake:
      "Running Lighthouse once on a fast developer laptop and calling the result your performance. Single runs vary widely; use multiple runs, consistent throttling, and real-user data to judge.",
    exercise:
      "Your LCP budget passes in CI but real users on low-end Android phones see LCP around 4 seconds. Name two reasons.",
    answer:
      "Lab throttling may not match real devices and networks, and the lab test may hit warm caches or a nearby server. Real users also see personalised content, third-party scripts, and consent banners that the CI page may not load. Calibrate lab settings using field data.",
    deepDive: [
      {
        heading: "Kinds of load tests",
        points: [
          "Load: expected peak traffic for a sustained period.",
          "Stress: beyond peak to find the breaking point.",
          "Spike: sudden surges, such as a sale starting at noon.",
          "Soak: moderate load for hours to find memory leaks and slow degradation.",
        ],
      },
    ],
    animation: {
      title: "A budget catching a regression",
      nodes: [
        ["pr", "Pull request", "adds chart lib"],
        ["build", "Build", "preview server"],
        ["lab", "Lighthouse CI", "3 runs"],
        ["budget", "Budgets", "JS < 180 KB"],
        ["dev", "Developer", "fixes it"],
      ],
      steps: [
        ["pr", "build", "build", "A pull request adds a charting library to the product page."],
        ["build", "lab", "measure", "Lighthouse CI loads the page three times with mobile throttling."],
        ["lab", "budget", "230 KB", "Script size and blocking time exceed their budgets."],
        ["budget", "dev", "fail", "The check fails and the report shows the new chunk."],
        ["dev", "pr", "lazy load", "The developer lazy-loads the chart and the budget passes."],
      ],
    },
  }),

  "testing--test-driven-development": fsd({
    intro:
      "Test-driven development is a short loop: write a failing test that describes the next behavior, write the simplest code that passes it, then refactor with the test as a safety net. In frontend work it shines for logic-heavy pieces such as reducers, validation, formatting, and custom hooks, and it pushes designs towards small, testable units.",
    concepts: [
      "Red, green, refactor. A failing test proves the test can fail and states the requirement; the minimal implementation avoids speculative code; refactoring improves structure while tests stay green.",
      "Tests become an executable specification. Reading the test names for a pagination hook should tell a new teammate exactly how it behaves at the first page, the last page, and with an empty list.",
      "TDD is a tool, not a rule. It is less useful for exploratory visual work where the design is still changing hourly; many teams prototype first, then drive the production version with tests.",
    ],
    code: `// Step 1 (red): describe the behavior before it exists
import { renderHook, act } from "@testing-library/react";
import { usePagination } from "./usePagination";

test("starts on page 1 and computes the total pages", () => {
  const { result } = renderHook(() => usePagination({ total: 95, pageSize: 10 }));
  expect(result.current.page).toBe(1);
  expect(result.current.totalPages).toBe(10);
});

test("does not move past the last page", () => {
  const { result } = renderHook(() => usePagination({ total: 95, pageSize: 10, initialPage: 10 }));
  act(() => result.current.next());
  expect(result.current.page).toBe(10);
  expect(result.current.hasNext).toBe(false);
});

// Step 2 (green): the simplest implementation that passes
import { useState } from "react";
export function usePagination({ total, pageSize, initialPage = 1 }) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const [page, setPage] = useState(initialPage);
  return {
    page,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
    next: () => setPage((p) => Math.min(totalPages, p + 1)),
    prev: () => setPage((p) => Math.max(1, p - 1)),
  };
}

// Step 3 (refactor): extract clamp(), add offset for API calls, keep tests green`,
    walkthrough:
      "The first test pins the starting state and page count, including the rounding up from 95 items. The second pins the boundary behavior. Only then is the hook written, and it contains nothing the tests do not require. Adding an offset value for API calls later starts with another failing test, so every behavior is documented by an example.",
    flow: ["Red: failing test", "Green: minimal code", "Refactor safely"],
    mistake:
      "Writing many tests up front for a whole feature. The loop loses its tight feedback, and early design mistakes get baked into dozens of tests that all need rewriting.",
    exercise:
      "Using TDD, what is the next test you would write for usePagination if total can change after a filter is applied?",
    answer:
      "A test that starts on page 8 of 10, rerenders with total 30, and expects page to clamp to 3 with hasNext false. It drives code that reacts to totalPages shrinking.",
    deepDive: [
      {
        heading: "Where TDD pays off most in frontends",
        points: [
          "State machines and reducers with many transitions.",
          "Parsing, formatting, and validation with many edge cases.",
          "Bug fixes: write the failing test that reproduces the bug first, then fix it.",
        ],
      },
    ],
    animation: {
      title: "The TDD loop",
      nodes: [
        ["red", "Red", "failing test"],
        ["green", "Green", "minimal code"],
        ["refactor", "Refactor", "clean design"],
        ["spec", "Test suite", "living spec"],
      ],
      steps: [
        ["red", "green", "fails", "A new test for the last-page boundary fails because next() is unbounded."],
        ["green", "refactor", "passes", "A Math.min clamp makes it pass with the smallest possible change."],
        ["refactor", "spec", "still green", "The clamp is extracted into a helper and all tests stay green."],
        ["spec", "red", "next case", "The next behavior, shrinking totals, starts the loop again."],
      ],
    },
  }),

  "testing--security-testing": fsd({
    intro:
      "Security testing looks for vulnerabilities before attackers do. For frontends it combines automated checks in the pipeline, such as static analysis, dependency scanning, header and CSP checks, and dynamic scanners, with targeted manual testing of authentication, authorization, and input handling, plus periodic penetration tests by specialists.",
    concepts: [
      "SAST, static application security testing, scans source code for dangerous patterns such as innerHTML with variables, eval, or hard-coded secrets. Secret scanners catch API keys in commits before they reach the repository history.",
      "DAST, dynamic testing, probes the running app with tools such as OWASP ZAP: injecting payloads into inputs, checking headers and cookies, and crawling for exposed endpoints.",
      "Authorization bugs, such as viewing another user's order by changing an ID, are rarely found by scanners. Write explicit tests that sign in as one user and try to access another user's resources.",
    ],
    code: `// Playwright test for broken object-level authorization (IDOR)
import { test, expect } from "@playwright/test";

test("a customer cannot read another customer's order", async ({ browser }) => {
  const alice = await browser.newContext({ storageState: "auth/alice.json" });
  const bob = await browser.newContext({ storageState: "auth/bob.json" });

  const aliceOrder = await (await alice.request.post("/api/orders", { data: { productId: "p_demo0001" } })).json();

  const response = await bob.request.get(\`/api/orders/\${aliceOrder.id}\`);
  expect([403, 404]).toContain(response.status());
});

test("security headers are present on the app shell", async ({ request }) => {
  const res = await request.get("/");
  expect(res.headers()["content-security-policy"]).toContain("frame-ancestors");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  expect(res.headers()["strict-transport-security"]).toMatch(/max-age=\\d+/);
});

# CI: secrets and static analysis on every pull request
# gitleaks detect --source . --redact
# semgrep --config p/javascript --config p/react --error`,
    walkthrough:
      "The first test creates an order as Alice, then uses Bob's session to request it directly, which is how real attackers find IDOR bugs. Any status other than 403 or 404 fails the build. The second test guards against a deploy that drops security headers. The commented CI steps scan for leaked secrets and dangerous code patterns on every pull request.",
    flow: ["Automate scans in CI", "Test authz explicitly", "Pen-test periodically"],
    mistake:
      "Treating a clean scanner report as proof of security. Scanners miss business-logic flaws such as applying a coupon twice or reading other users' data, which are often the most damaging bugs.",
    exercise:
      "List three security checks you could add to a frontend repository's CI in under an hour.",
    answer:
      "A secret scanner such as gitleaks, npm audit for production dependencies at high severity, and an ESLint security plugin or Semgrep ruleset that flags dangerouslySetInnerHTML, eval, and javascript: URLs. A header assertion test is another quick win.",
    deepDive: [
      {
        heading: "Manual test checklist for a new feature",
        points: [
          "Change every ID in URLs and request bodies to another user's ID.",
          "Replay requests after logout and after permission changes.",
          "Submit oversized, malformed, and script-containing input to every field.",
          "Check that error messages do not leak stack traces or internal details.",
        ],
      },
    ],
    animation: {
      title: "Catching an IDOR before release",
      nodes: [
        ["alice", "Alice session", "creates order"],
        ["api", "Orders API", "/orders/:id"],
        ["bob", "Bob session", "tries same ID"],
        ["ci", "CI result", "pass / fail"],
      ],
      steps: [
        ["alice", "api", "POST", "The test creates an order as Alice and records its ID."],
        ["bob", "api", "GET id", "Bob's session requests Alice's order directly by ID."],
        ["api", "bob", "200?", "If the API returns the order, the authorization check is missing."],
        ["bob", "ci", "fail", "The test fails the pull request before the bug reaches production."],
        ["api", "ci", "403", "After the fix, the API returns 403 and the check passes."],
      ],
    },
  }),
};
