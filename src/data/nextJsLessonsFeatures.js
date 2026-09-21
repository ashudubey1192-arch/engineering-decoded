import { lesson } from "./nextJsLessonSchema.js";

export const nextJsFeatureLessons = {
  "fullstack--route-handlers": lesson(
    "Route Handlers expose HTTP endpoints using Web Request and Response APIs. They are useful for external clients, webhooks, and browser requests that need an explicit HTTP contract.",
    [
      "Create route.ts and export functions named for supported HTTP methods. The handler belongs at its resolved URL and cannot share that same segment with a page file.",
      "Parse untrusted input and return meaningful status codes. A successful JSON parse does not prove that the body has the expected fields or permissions.",
      "Configure caching deliberately for read endpoints and return privacy-appropriate response headers. Authentication, authorization, rate limits, and durable writes remain application responsibilities.",
    ],
    `// FILE: app/api/validate-plan/route.ts
export async function POST(request: Request) {
  let body: unknown;
  try { body = await request.json(); }
  catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const title = body && typeof body === 'object' && 'title' in body ? body.title : undefined;
  if (typeof title !== 'string' || title.trim().length < 3 || title.length > 120) {
    return Response.json({ error: 'Title must be 3–120 characters' }, { status: 422 });
  }
  return Response.json({ valid: true, title: title.trim() }, {
    headers: { 'Cache-Control': 'no-store' }
  });
}`,
    "POST a JSON object containing title to /api/validate-plan. Malformed JSON returns 400, invalid field data returns 422, and valid input returns normalized data. This public validation demonstration does not save or expose private records.",
    ["HTTP request", "Parse and validate contract", "Status plus response body"],
    "Do not expose a database mutation just because a handler is server-side. Verify the caller and enforce resource permissions before every protected write.",
    "When would a Route Handler be preferable to a Server Action?",
    "When a consumer needs a stable HTTP endpoint, such as a webhook sender, mobile client, or third-party integration.",
    "https://nextjs.org/docs/app/getting-started/route-handlers",
  ),
  "fullstack--forms": lesson(
    "A useful form combines semantic HTML, server validation, pending feedback, and recoverable results. Native form behavior remains valuable even when the framework handles submission.",
    [
      "Name each submitted control and associate it with a label. FormData reads named controls; unchecked checkboxes and disabled fields need deliberate handling.",
      "Use useActionState when a server result should update validation or confirmation UI. Its pending value can disable repeat submission and explain the wait.",
      "Preserve the user’s draft on validation failure and distinguish validation from durable persistence. Do not show Saved unless a write really succeeded.",
    ],
    `// FILE: app/plan/actions.ts
'use server';
export async function checkPlan(_previous: { message: string }, data: FormData) {
  const title = data.get('title');
  const hours = Number(data.get('hours'));
  if (typeof title !== 'string' || title.trim().length < 3 || title.length > 120 ||
      !Number.isInteger(hours) || hours < 1 || hours > 20) {
    return { message: 'Use a 3–120 character title and 1–20 whole hours.' };
  }
  return { message: 'Plan validated. No server storage is configured in this demo.' };
}
// FILE: app/plan/page.tsx
'use client';
import { useActionState, useState } from 'react';
import { checkPlan } from './actions';
export default function Plan() {
  const [title, setTitle] = useState('');
  const [hours, setHours] = useState('3');
  const [state, action, pending] = useActionState(checkPlan, { message: '' });
  return <main><h1>Plan your week</h1><form action={action}>
    <label>Title <input name="title" value={title} onChange={e => setTitle(e.target.value)} /></label>
    <label>Hours <input name="hours" type="number" min="1" max="20" value={hours}
      onChange={e => setHours(e.target.value)} /></label>
    <button disabled={pending}>{pending ? 'Checking…' : 'Validate plan'}</button>
    <p role="status">{state.message}</p>
  </form></main>;
}`,
    "The controlled inputs retain the entered draft while the server reports its result. Number conversion is followed by integer and range checks. A production form should also link field-specific errors to their inputs.",
    ["Accessible controls", "Validated server submission", "Pending and recoverable result"],
    "Do not trust input type=number or client constraints as the only validation. A caller can submit a request without using the form.",
    "Why keep a validation message separate from a save confirmation?",
    "Valid input does not prove a database write succeeded. Report exactly which operation completed so users know whether their work is stored.",
    "https://nextjs.org/docs/app/guides/forms",
  ),
  "fullstack--authentication": lesson(
    "Authentication establishes who the caller is; authorization decides what that identity may do. Use a maintained authentication solution and enforce resource-level rules near data access.",
    [
      "A cookie’s presence is not proof of a valid session. Verify its signature or look it up through the chosen session system, including expiration and revocation rules.",
      "Create a server-only data-access layer that returns a minimal public result. Recheck permissions in each protected action or handler rather than relying on a layout redirect alone.",
      "Session handling needs secure cookie settings, CSRF protections appropriate to the flow, and an account lifecycle. These are reasons to integrate a maintained library instead of inventing a password/session scheme in a UI lesson.",
    ],
    `// FILE: lib/my-plans.ts
import 'server-only';
import { requireUser } from '@/lib/session';
import { db } from '@/lib/db';
export async function getMyPlans() {
  const user = await requireUser();
  return db.plan.findMany({
    where: { ownerId: user.id },
    select: { id: true, title: true }
  });
}
// Integration contracts:
// requireUser verifies a real session and rejects unauthenticated callers.
// db is your configured database adapter with a Plan ownership model.`,
    "The query is constrained by the verified user ID rather than a caller-supplied ownerId. Only the needed fields leave the data layer. Implement the session and database adapters before using this excerpt.",
    ["Verify session", "Authorize resource access", "Return minimal public data"],
    "Do not accept a role or user ID from a hidden form field as authority. The server derives identity from the verified session.",
    "Why is checking only in a shared layout insufficient?",
    "Layouts can be reused, and actions or endpoints can be invoked independently. The operation that reads or writes protected data must enforce its own checks.",
    "https://nextjs.org/docs/app/guides/authentication",
  ),
  "fullstack--database-access": lesson(
    "Keep database clients and credentials in server-only modules. A data-access layer should combine safe queries, authorization, and output shaping rather than exposing raw database objects to the browser.",
    [
      "Choose a database driver and connection strategy compatible with the deployment runtime. Long-lived servers, serverless instances, and edge environments have different connection constraints.",
      "Use parameterized queries or a well-configured ORM instead of interpolating user text into SQL. Validate identifiers and constrain every private query by the verified owner.",
      "Use transactions for related changes that must commit together. Add concurrency or idempotency rules where retries and overlapping requests can otherwise duplicate or overwrite work.",
    ],
    `// FILE: lib/rename-plan.ts
import 'server-only';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/session';
export async function renameMyPlan(id: string, title: string) {
  const user = await requireUser();
  const normalized = title.trim();
  if (!id || normalized.length < 3 || normalized.length > 120) throw new Error('Invalid plan');
  const result = await db.plan.updateMany({
    where: { id, ownerId: user.id },
    data: { title: normalized }
  });
  if (result.count !== 1) throw new Error('Plan unavailable');
}
// Requires the database and verified-session adapters from Authentication.`,
    "The ownership predicate and write happen in the same query, reducing a separate check-then-write race. The adapter must implement the shown ORM-style contract; configure schema, migrations, and pooling for your database.",
    [
      "Verified caller and validated values",
      "Ownership-constrained query",
      "Commit and return narrow result",
    ],
    "Do not return an entire user or database record to a Client Component when it only needs a title. Private fields can leak through serialized props.",
    "When would this operation need optimistic concurrency control?",
    "When two editors can overwrite the same plan. Include a version or updated-at condition and handle a conflict instead of silently accepting the last write.",
    "https://nextjs.org/docs/app/guides/data-security",
  ),
  "fullstack--file-uploads": lesson(
    "File uploads need an end-to-end trust and storage design. The browser selects bytes, but the server decides who may upload, which content is acceptable, and how it may later be served.",
    [
      "A small form can send multipart FormData to a handler or action. Large files often fit direct object-storage uploads with short-lived, narrowly scoped upload permissions.",
      "Check size and declared type, then verify actual content rather than trusting the filename or MIME declaration. A production pipeline may need scanning and safe content transformation.",
      "Do not rely on local filesystem persistence in a deployment where instances are ephemeral. Store files in durable object storage and keep ownership and access policy in trusted metadata.",
    ],
    `// FILE: app/api/check-upload/route.ts
export async function POST(request: Request) {
  let data: FormData;
  try { data = await request.formData(); }
  catch { return Response.json({ error: 'Invalid multipart form' }, { status: 400 }); }
  const file = data.get('file');
  if (!(file instanceof File)) return Response.json({ error: 'Choose a file' }, { status: 400 });
  if (file.size === 0 || file.size > 2 * 1024 * 1024) {
    return Response.json({ error: 'Use a nonempty file up to 2 MB' }, { status: 413 });
  }
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    return Response.json({ error: 'Declare a PNG or JPEG image' }, { status: 415 });
  }
  return Response.json({ message: 'Preliminary checks passed; file not stored or verified.' });
}`,
    "This demonstration only checks metadata and deliberately does not publish or store the file. Actual uploads need authentication, byte-level inspection, durable storage, and host-level body limits before buffering; file.size is checked after form parsing.",
    [
      "Select and authorize upload",
      "Limit and inspect actual content",
      "Store under controlled ownership",
    ],
    "Do not serve arbitrary uploaded HTML from your application origin or accept a MIME declaration as proof that a file is safe.",
    "Why is the post-parse size check not a complete resource limit?",
    "The server may already have received or buffered the body. Configure limits at the hosting or request-processing boundary, or use a controlled direct-upload architecture.",
    "https://nextjs.org/docs/app/guides/backend-for-frontend",
  ),
  "experience--loading-ui": lesson(
    "Loading UI communicates that navigation or data work is still in progress while preserving useful context. Match the fallback to the region that is actually waiting.",
    [
      "loading.tsx creates a Suspense loading boundary for the segment’s page and descendants beneath the layout. It does not automatically cover slow work performed above that boundary in the same layout.",
      "A skeleton should reserve roughly the final content’s space to reduce layout shift. Give a concise status message rather than making assistive technology announce every decorative placeholder.",
      "A pending indicator is different from an empty result and an error. Ensure every operation can leave its waiting state through either success or failure.",
    ],
    `// FILE: app/courses/loading.tsx
export default function LoadingCourses() {
  return <section aria-busy="true" aria-label="Course catalog">
    <p role="status">Loading courses…</p>
    <div aria-hidden="true" style={{ minHeight: 180, background: '#e5e7eb', borderRadius: 8 }} />
  </section>;
}
// The sibling page.tsx performs the asynchronous course read.
// Place a closer Suspense boundary around independently useful panels.`,
    "While the page region waits, the fallback reserves space and announces progress. Once the route content is ready, the boundary reveals it. Very fast or prefetched routes may not visibly show the fallback.",
    ["Navigation starts", "Stable fallback region", "Ready content replaces fallback"],
    "Do not add artificial delays to production just to make a skeleton visible. The goal is responsive output, not a loading animation on every visit.",
    "Why might loading.tsx fail to cover a slow query in its parent layout?",
    "That work occurs above the automatically created boundary. Move the waiting region below an appropriate Suspense boundary or restructure the layout.",
    "https://nextjs.org/docs/app/api-reference/file-conventions/loading",
  ),
  "experience--error-handling": lesson(
    "Separate expected outcomes from unexpected failures. Validation and missing resources deserve intentional UI; unexpected rendering failures need a recovery boundary and safe diagnostics.",
    [
      "error.tsx is a Client Component boundary for a route segment’s descendants. It receives an error and reset function; reset retries rendering but cannot repair a deterministic underlying fault.",
      "Errors in a segment’s own layout are handled by a boundary above it. Root layout failures may need global-error.tsx, which supplies its own html and body.",
      "Use notFound for unavailable resources and structured return values for expected form validation. Do not broadly catch redirect or notFound signals and accidentally convert them into generic failures.",
    ],
    `// FILE: app/courses/error.tsx
'use client';
export default function CourseError({ error, reset }: {
  error: Error & { digest?: string }; reset: () => void;
}) {
  return <section role="alert">
    <h2>Courses could not be loaded</h2>
    <p>Please try again. Your saved plans have not been changed.</p>
    {error.digest && <p>Reference: {error.digest}</p>}
    <button onClick={() => reset()}>Try again</button>
  </section>;
}`,
    "A rendering failure below this boundary displays a local recovery UI. The digest can help correlate a report with server diagnostics. Only use the unchanged-plans statement when the failed operation is truly a read.",
    [
      "Expected result or unexpected failure",
      "Nearest appropriate boundary",
      "Explain and offer recovery",
    ],
    "Do not display raw server stack traces or secret-bearing messages to users. Log safely on the server and present a useful, limited explanation.",
    "Does this error boundary catch every failure from a button’s async handler?",
    "No. Handle ordinary event-handler and asynchronous failures at their operation boundary, updating local error state or using the appropriate framework action flow.",
    "https://nextjs.org/docs/app/getting-started/error-handling",
  ),
  "experience--images": lesson(
    "next/image helps deliver appropriately sized images while reserving layout space. Good source assets, responsive sizing, and meaningful alternative text remain your responsibility.",
    [
      "Provide dimensions for a known image or use fill with a positioned container and a useful sizes value. Intrinsic dimensions establish aspect ratio; CSS can control rendered size.",
      "Remote images require a deliberate remotePatterns policy. Restrict host and path patterns rather than allowing arbitrary external sources to be optimized by your server.",
      "Choose loading priority based on the actual largest visible image. In Next.js 16, preload is the current explicit preload prop; do not preload every image in a long list.",
    ],
    `// FILE: app/page.tsx
import Image from 'next/image';
export default function Home() {
  return <main><h1>Learn by building</h1>
    <Image src="/course-workshop.jpg" alt="Learners reviewing a component diagram"
      width={1200} height={675} sizes="(max-width: 768px) 100vw, 800px"
      style={{ width: '100%', maxWidth: 800, height: 'auto' }} />
  </main>;
}
// Supply public/course-workshop.jpg with the stated aspect ratio.
// Use preload only if measurements identify this as the critical hero image.`,
    "The browser can choose an appropriate generated image size from the responsive hint. The dimensions reserve the aspect ratio, preventing a large jump when the file loads. The sample asset must be supplied by the practice project.",
    ["Source image and dimensions", "Responsive delivery", "Stable accessible presentation"],
    "Do not use a decorative image’s filename as its alt text. Describe its relevant meaning, or use empty alt text when it is genuinely decorative.",
    "Why include sizes when CSS makes the image responsive?",
    "It informs resource selection so the browser can download a suitable candidate instead of assuming an unnecessarily large display width.",
    "https://nextjs.org/docs/app/api-reference/components/image",
  ),
  "experience--fonts": lesson(
    "next/font integrates font loading with the application build and stylesheet system. Use a small deliberate font set and verify layout behavior rather than adding many families and weights.",
    [
      "The Google-font integration obtains font assets at build time and serves them with the application. A restricted build environment may need a local font instead.",
      "next/font/local uses project-owned font files. Keep licenses and supported formats in mind, and provide a fallback family for graceful rendering.",
      "Apply the generated class or CSS variable at a stable layout boundary. Unnecessary font variants increase transfer cost even when the typography looks similar.",
    ],
    `// FILE: app/layout.tsx
import type { ReactNode } from 'react';
import localFont from 'next/font/local';
const uiFont = localFont({
  src: './fonts/planner-ui.woff2',
  display: 'swap',
  fallback: ['Arial', 'sans-serif']
});
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body className={uiFont.className}>{children}</body></html>;
}
// Supply a licensed font file at app/fonts/planner-ui.woff2.`,
    "The root layout applies one generated font class throughout the application. Use an actual font file with known metrics; inspect layout shift and readability while the fallback is visible.",
    ["Licensed source font", "Build-integrated assets", "Stable typography boundary"],
    "Do not load the same font through both next/font and a separate external stylesheet. Duplicate loading can waste bandwidth and complicate behavior.",
    "Why might a local font be preferable in a restricted CI environment?",
    "The build can use the checked-in asset without fetching font files from a remote service, making that part of the build reproducible.",
    "https://nextjs.org/docs/app/getting-started/fonts",
  ),
  "experience--metadata-and-seo": lesson(
    "Metadata describes a page to browsers, search engines, and sharing tools. Pair it with readable content, semantic headings, and a deliberate URL policy.",
    [
      "Export metadata for a static description or generateMetadata for values derived from route data. These exports belong in Server Components, not a use client module.",
      "Define a valid metadataBase when relative metadata URLs need an origin. Canonical URLs should identify the preferred public location, not repeat every tracking query parameter.",
      "Open Graph images, robots instructions, and sitemaps help discovery but do not guarantee ranking or indexing. Private data still requires authentication; robots directives are not access control.",
    ],
    `// FILE: app/layout.tsx
import type { Metadata } from 'next';
import type { ReactNode } from 'react';
export const metadata: Metadata = {
  metadataBase: new URL('https://example.com'), // Replace with the production origin.
  title: { default: 'Course Planner', template: '%s | Course Planner' },
  description: 'Practice frontend engineering through focused lessons.'
};
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
// FILE: app/courses/page.tsx
import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Courses', alternates: { canonical: '/courses' } };
export default function Courses() { return <main><h1>Your courses</h1></main>; }`,
    "The child title uses the layout’s title template, and the canonical URL resolves against the configured origin. Replace example.com before deployment and inspect the actual rendered metadata.",
    ["Page identity and content", "Server metadata exports", "Browser and crawler presentation"],
    "Do not ship the same generic title and description on every distinct public page or leave example.com as the production canonical origin.",
    "Can robots.txt protect a private course plan?",
    "No. It communicates crawling preferences. The server must restrict access to the data itself.",
    "https://nextjs.org/docs/app/getting-started/metadata-and-og-images",
  ),
};
