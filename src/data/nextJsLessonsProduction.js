import { lesson } from "./nextJsLessonSchema.js";

export const nextJsProductionLessons = {
  "quality--unit-testing": lesson(
    "Unit tests protect small deterministic rules with fast feedback. Keep domain logic independent of the framework where possible, and use a test environment suited to the behavior under examination.",
    [
      "Pure normalization and validation functions can run in a Node test environment without rendering React or starting Next.js. Import the real function so the test verifies production behavior.",
      "Client Components can be tested with a DOM environment and Testing Library. Current Vitest support does not cover async Server Components as ordinary component unit tests; use appropriate integration or browser checks for those flows.",
      "Test meaningful boundary cases rather than internal implementation details. Empty values, whitespace, and length limits often reveal mistakes that a happy-path assertion misses.",
    ],
    `// FILE: lib/plan-title.ts
export function normalizeTitle(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const title = value.trim();
  return title.length >= 3 && title.length <= 120 ? title : null;
}
// FILE: lib/plan-title.test.ts
import { expect, test } from 'vitest';
import { normalizeTitle } from './plan-title';
test('trims a valid title', () => expect(normalizeTitle(' Angular ')).toBe('Angular'));
test('rejects missing or short values', () => {
  expect(normalizeTitle(null)).toBeNull();
  expect(normalizeTitle(' ab ')).toBeNull();
});
test('rejects an overlong title', () => expect(normalizeTitle('x'.repeat(121))).toBeNull());
// Install in the practice workspace: npm install -D vitest
// Run: npx vitest run`,
    "The tests exercise the actual normalizer with accepted and rejected inputs. A Server Action can reuse this function before persisting data. These pure tests need no JSX transformation or browser simulation.",
    ["Extract deterministic rule", "Exercise boundaries", "Assert public contract"],
    "Do not duplicate the production implementation inside the test and then test the duplicate. Import the code used by the application.",
    "Why not render an async page directly in a basic Vitest component test?",
    "The framework’s async Server Component execution model is not fully represented by that setup. Test its pure helpers separately and verify the complete route in a suitable integration or browser environment.",
    "https://nextjs.org/docs/app/guides/testing/vitest",
  ),
  "quality--integration-testing": lesson(
    "Integration tests verify that cooperating parts honor a boundary contract. Choose the boundary deliberately: a handler plus validation can be tested in-process, while routing, cookies, and deployment behavior require a running framework.",
    [
      "Exercise the real handler with a Request and inspect its Response. This checks parsing, status codes, and payloads without mocking away the logic under test.",
      "Use isolated test databases or controlled adapters for persistence tests. Reset data so outcomes do not depend on earlier tests or a developer’s account.",
      "An in-process handler test does not verify that Next.js registered the URL or configured production middleware. Add browser or HTTP-level checks for those integration risks.",
    ],
    `// FILE: tests/validate-plan.test.ts
import { expect, test } from 'vitest';
import { POST } from '../app/api/validate-plan/route';
test('returns 422 for an invalid title', async () => {
  const response = await POST(new Request('http://localhost/api/validate-plan', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'ab' })
  }));
  expect(response.status).toBe(422);
});
test('returns a normalized valid title', async () => {
  const response = await POST(new Request('http://localhost/api/validate-plan', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: ' Next.js ' })
  }));
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({ valid: true, title: 'Next.js' });
});
// Uses the complete Route Handlers lesson implementation and Vitest.`,
    "Both tests call the real exported POST function. Add a malformed JSON case and an authorization case when the endpoint becomes protected. The Request URL is only an input here; no HTTP server is contacted.",
    ["Real boundary input", "Connected parsing and validation", "Response contract assertions"],
    "Mocking POST itself would remove the behavior these tests are meant to verify. Replace external dependencies only where needed.",
    "What does this test not prove about /api/validate-plan?",
    "It does not prove the deployed URL is reachable or that runtime infrastructure behaves correctly. A running-app smoke test covers that layer.",
    "https://nextjs.org/docs/app/guides/testing",
  ),
  "quality--end-to-end-testing": lesson(
    "End-to-end tests verify critical workflows in a real browser against a running Next.js application. Include direct navigation and refresh because server routing and client navigation have different entry paths.",
    [
      "Use Playwright or another browser runner with a baseURL and managed application server. Test a production build when rendering and deployment semantics are central to the risk.",
      "Prefer accessible role and label queries and assertions that wait for the expected result. Fixed sleeps are fragile and make otherwise fast tests slow.",
      "Keep test data and authentication isolated. An intercepted-route modal should be tested both through a Link and through a direct load of its canonical URL.",
    ],
    `// FILE: playwright.config.ts
import { defineConfig } from '@playwright/test';
export default defineConfig({
  use: { baseURL: 'http://localhost:3000' },
  webServer: { command: 'npm run build && npm run start', url: 'http://localhost:3000', timeout: 180000 }
});
// FILE: tests/navigation.spec.ts
import { expect, test } from '@playwright/test';
test('catalog is reachable by link and reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Browse courses', exact: true }).click();
  await expect(page).toHaveURL(/\\/courses$/);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your courses', exact: true })).toBeVisible();
});
// Uses the Why Next.js example. Stop other servers using port 3000.
// npm install -D @playwright/test
// npx playwright install
// npx playwright test`,
    "The configuration builds and serves the practice app before navigation. The test follows the earlier example’s link, checks the URL, and confirms the same page survives a reload.",
    ["Production app in browser", "User journey and deep link", "Observable screen and URL"],
    "A passing local test does not prove a host’s base path, CDN, or environment configuration is correct. Repeat a focused smoke check in the deployed test environment.",
    "Why cover both soft navigation and a reload for intercepted routes?",
    "Soft navigation can show an overlay while a direct reload should show the canonical page. Both behaviors are part of the routing contract.",
    "https://nextjs.org/docs/app/guides/testing/playwright",
  ),
  "quality--accessibility": lesson(
    "Accessible Next.js applications need semantic content and intentional handling of dynamic navigation. Server rendering does not automatically provide keyboard behavior, readable labels, or sensible focus.",
    [
      "Use one clear page heading, meaningful metadata, native controls, and descriptive links. Next.js route announcements benefit from meaningful titles and headings.",
      "Loading, validation, and mutation results should be announced appropriately. Reserve assertive alerts for messages that warrant interruption; avoid multiple competing live regions.",
      "Dialogs and intercepted overlays need focus containment, Escape handling, background interaction control, and focus restoration. Route interception alone does not implement those behaviors.",
    ],
    `// FILE: app/layout.tsx
import type { ReactNode } from 'react';
import './globals.css';
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>
    <a className="skip-link" href="#main-content">Skip to content</a>
    <main id="main-content" tabIndex={-1}>{children}</main>
  </body></html>;
}
// FILE: app/globals.css
.skip-link { position: absolute; left: 1rem; top: -5rem; }
.skip-link:focus { top: 1rem; z-index: 100; padding: 1rem; background: white; color: black; }
:focus-visible { outline: 3px solid #2563eb; outline-offset: 3px; }
// Pages beneath this layout should not add another main landmark.`,
    "Keyboard users can bypass repeated navigation and reach the content target. The layout owns the main landmark in this variation; adapt the earlier page examples to avoid nesting main elements.",
    ["Semantic document", "Keyboard and focus behavior", "Understandable dynamic feedback"],
    "Do not remove outlines or replace links with generic elements just to match a design. Styling should preserve the control’s underlying behavior.",
    "What should happen when a course preview dialog closes?",
    "Focus should return to a sensible control, normally the link that opened it, and the background should become operable again.",
    "https://nextjs.org/docs/architecture/accessibility",
  ),
  "quality--security": lesson(
    "Security boundaries follow data and operations, not visual component boundaries. Treat server entry points as callable interfaces and browser-provided values as untrusted.",
    [
      "Use server-only modules for private adapters and send minimal props to the browser. A secret can still leak if it appears in rendered text, a response, an error, or telemetry.",
      "Authenticate and authorize every protected action and handler. Validate all incoming identifiers and ownership rules even if the UI only offers valid choices.",
      "Constrain redirect targets, file uploads, and rich HTML by context. Keep framework and authentication dependencies updated and review production security headers for the actual application.",
    ],
    `// FILE: lib/safe-return-path.ts
export function safeReturnPath(raw: unknown): string {
  if (typeof raw !== 'string') return '/courses';
  try {
    const base = new URL('https://planner.example');
    const destination = new URL(raw, base);
    if (destination.origin !== base.origin) return '/courses';
    if (destination.pathname !== '/courses' && !destination.pathname.startsWith('/courses/')) {
      return '/courses';
    }
    return destination.pathname + destination.search;
  } catch { return '/courses'; }
}
// Use a fixed trusted origin and an intentional destination allowlist.
// This helper constrains redirects; it does not authorize course access.`,
    "External destinations and unrelated application paths fall back to /courses. The helper returns a relative allowed path rather than forwarding an arbitrary URL. Validate downstream behavior too if an allowed page itself accepts redirect parameters.",
    ["Untrusted boundary value", "Context-specific validation", "Authorized minimal operation"],
    "Do not assume use server means only your own page can invoke an action, or that a hidden field can safely identify the current user.",
    "Does hiding an admin link stop unauthorized API calls?",
    "No. Visibility is a usability concern; the server independently checks identity and resource permissions for every protected operation.",
    "https://nextjs.org/docs/app/guides/data-security",
  ),
  "production--performance": lesson(
    "Measure the complete user experience: server latency, transferred JavaScript, image delivery, hydration, and browser rendering. Optimize the bottleneck that actually limits a task.",
    [
      "Keep client boundaries focused to avoid shipping server-oriented dependencies to the browser. A small interactive control should not require the entire page to become client code.",
      "Run independent server reads concurrently, cache suitable public data, and stream useful regions. These mechanisms solve different costs and should follow an explicit freshness and privacy policy.",
      "Inspect Core Web Vitals and representative slow-device behavior. A smaller bundle alone does not guarantee a faster primary interaction if data still waits in a waterfall.",
    ],
    `// FILE: app/reports/ReportLauncher.tsx
'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';
const Report = dynamic(() => import('./Report'), {
  loading: () => <p role="status">Loading report tools…</p>
});
export default function ReportLauncher() {
  const [open, setOpen] = useState(false);
  return <section><button onClick={() => setOpen(true)}>Open report</button>
    {open && <Report />}
  </section>;
}
// FILE: app/reports/Report.tsx
'use client';
export default function Report() { return <h2>Your study report</h2>; }`,
    "The optional report is only rendered after the user asks for it. Replace the tiny sample with a real heavy feature, then compare production network and interaction measurements to confirm the boundary is worthwhile.",
    [
      "Measure critical interaction",
      "Reduce or defer actual cost",
      "Compare under the same conditions",
    ],
    "Do not set ssr: false merely to hide hydration mistakes. Fix inconsistent rendering, and reserve browser-only rendering for a justified dependency or feature.",
    "When would deferring a component make the experience worse?",
    "When it is essential to the initial task and the first interaction now waits on an avoidable chunk load. Defer optional work, not blindly every visible region.",
    "https://nextjs.org/docs/app/guides/lazy-loading",
  ),
  "production--observability": lesson(
    "Observability explains whether users can complete the workflows a release promises. Correlate safe diagnostics, request timings, and release versions across server and client boundaries.",
    [
      "Measure outcomes such as successful plan saves alongside latency and rendering signals. A lack of crashes does not prove the main workflow works.",
      "Attach correlation or release identifiers without logging private form values, credentials, cookies, or access tokens. Monitoring is another data boundary that needs a minimal payload.",
      "Use framework instrumentation for server initialization and an appropriate client reporting mechanism for browser errors and Web Vitals. Reporting failure must not break the user operation.",
    ],
    `// FILE: lib/measured-operation.ts
type Event = { operation: string; outcome: 'success' | 'failure'; durationMs: number };
export async function measured<T>(operation: string, run: () => Promise<T>, report: (event: Event) => void) {
  const started = performance.now();
  const emit = (outcome: Event['outcome']) => {
    try { report({ operation, outcome, durationMs: performance.now() - started }); }
    catch { /* Telemetry must not change the operation outcome. */ }
  };
  try {
    const result = await run();
    emit('success');
    return result;
  } catch (error) {
    emit('failure');
    throw error;
  }
}`,
    "Wrap a server operation with a stable non-sensitive name and a reporting adapter. The wrapper reports timing and success/failure while preserving the result or original error. Async reporting adapters must handle their own rejected promises.",
    ["Observe real workflow", "Record minimal correlated signals", "Diagnose and verify a fix"],
    "Do not swallow a failed save because it was logged. The caller still needs the failure to show a recoverable state.",
    "What should you compare when failures rise after deployment?",
    "Compare release IDs, affected routes, response statuses, and timings using safe test data, then reproduce the failing path and add a targeted regression check.",
    "https://nextjs.org/docs/app/guides/instrumentation",
  ),
  "production--environment-variables": lesson(
    "Environment variables configure an application across local, test, and production environments. Understand which values remain on the server and which are embedded into browser code.",
    [
      "Keep private values unprefixed and read them only in server code. NEXT_PUBLIC_ values are intended for browser exposure and are generally inlined during the build.",
      "Use .env.local for local values and keep secret-bearing files out of version control. Commit a safe example listing required names without real credentials.",
      "Validate required values when they are used or during appropriate startup checks. Build-time and runtime configuration can differ; promoting one built artifact does not rewrite already inlined public values.",
    ],
    `# FILE: .env.example
DATABASE_URL=replace-with-your-server-database-url
NEXT_PUBLIC_SUPPORT_LABEL=Help center

// FILE: lib/database-config.ts
import 'server-only';
export function databaseUrl() {
  const value = process.env.DATABASE_URL;
  if (!value) throw new Error('DATABASE_URL is not configured');
  return value;
}
// Do not log the returned URL or pass it into a Client Component.`,
    "The database setting remains server-only when its use stays within that boundary. The support label is deliberately public. A deployment should supply real private values through its supported secret configuration mechanism.",
    [
      "Environment configuration",
      "Server-only or build-inlined public value",
      "Validated application use",
    ],
    "Renaming a private key with NEXT_PUBLIC_ does not make integration easier safely; it publishes the value to browser code. Rotate any credential that has already been exposed.",
    "Will changing NEXT_PUBLIC_SUPPORT_LABEL after building always change an existing browser bundle?",
    "No. Public values are typically embedded at build time. Rebuild or design an explicit runtime public-configuration mechanism when that behavior is required.",
    "https://nextjs.org/docs/app/guides/environment-variables",
  ),
  "production--deployment": lesson(
    "Deploy the runtime your application actually requires. Server rendering, Server Actions, image optimization, and static export do not all have the same hosting needs.",
    [
      "A Node server or compatible managed platform can execute server features. A static export produces files for static hosting but cannot run arbitrary request-time server behavior.",
      "Build from the lockfile, configure environment values, run tests, and inspect the production artifact. Check the selected host’s feature support rather than assuming all Next.js APIs work identically everywhere.",
      "Smoke-test direct URLs, mutations, failures, and assets after deployment. Plan cache consistency, database migrations, observability, and rollback before sending production traffic to a new release.",
    ],
    `# CI / server deployment baseline
npm ci
npm run build
npm run start

# Static-only alternative in next.config.ts:
# const config = { output: 'export' };
# export default config;
# Publish the generated out directory only for compatible static features.

# Smoke checks
# - Open and refresh /courses/next.
# - Verify authentication and a failed mutation.
# - Check image/font URLs and required environment values.
# - Confirm rollback and monitoring.`,
    "Choose the server baseline for a project using the mutation and private-data lessons. Static export requires a deliberately compatible design; it is not a generic way to host Server Actions on a file server.",
    ["Required application features", "Compatible build and host", "Smoke-tested release"],
    "Do not publish only static files from an application that depends on runtime server handlers. A successful build does not prove the selected hosting mode supports those features.",
    "Why test a direct dynamic URL after deployment?",
    "The first request reaches the host before client navigation runs. It exposes route handling, prerendered-path, and runtime configuration problems.",
    "https://nextjs.org/docs/app/getting-started/deploying",
  ),
  "production--architecture": lesson(
    "A maintainable Next.js architecture makes server boundaries, feature ownership, and data contracts visible. Route conventions should organize the application without forcing all business logic into page files.",
    [
      "Keep page and layout modules focused on composition. Server-only data adapters own authorization, persistence, and mapping; Client Components own local interaction.",
      "Avoid maintaining duplicate authoritative state in client caches, global stores, and server data without a synchronization policy. The URL is a useful owner for shareable navigation state.",
      "Choose cache scope and invalidation alongside feature design. A mutation should identify which data and routes become stale, and private data must never inherit a public cache key accidentally.",
    ],
    `app/
  courses/
    page.tsx                 # server composition
    [slug]/page.tsx          # resource route
    actions.ts              # validated mutation entry points
    Bookmark.tsx            # small client interaction
lib/
  server/
    session.ts              # verified identity
    courses.ts              # authorization and data access
    db.ts                   # database adapter
  domain/
    plan-title.ts           # pure validation rules
tests/
  navigation.spec.ts        # critical browser journey

# Dependency direction: route/action -> server adapter -> database.
# Client modules receive public data and supported server action references.`,
    "This layout keeps the server/client split legible. A page may call a server adapter directly, while a Client Component receives only the public fields it needs. Add abstractions when they protect a real boundary, not just to make folders symmetrical.",
    [
      "Feature route composition",
      "Authorized data and mutation boundary",
      "Small interactive client surface",
    ],
    "Do not import a server database module through a shared barrel used by Client Components. Keep server-only boundaries explicit so accidental imports fail clearly.",
    "Where should invalidation for a renamed public course be decided?",
    "At the mutation boundary after the durable write succeeds, using tags and paths that reflect all affected readers. Keep this policy close to the feature’s data contract.",
    "https://nextjs.org/docs/app/guides/data-security",
  ),
};
