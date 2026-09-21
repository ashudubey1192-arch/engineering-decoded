import { lesson } from "./nextJsLessonSchema.js";

export const nextJsDataLessons = {
  "data--fetching-data": lesson(
    "Fetch data near its server-side consumer when it does not require browser interaction. Make the request contract, freshness policy, and failure behavior explicit.",
    [
      "An async Server Component can call a database adapter or fetch an external API. Avoid routing a server read through your own HTTP endpoint unless an actual architectural boundary requires it.",
      "Check response.ok before treating an HTTP response as successful. TypeScript annotations do not validate JSON, so validate fields at the external boundary.",
      "Start independent requests together when they can run concurrently. Use Suspense for useful progressive rendering rather than awaiting every optional result at the top of the page.",
    ],
    `// FILE: app/courses/page.tsx
import { Suspense } from 'react';
type Course = { id: string; title: string };
function isCourses(value: unknown): value is Course[] {
  return Array.isArray(value) && value.every(item => item &&
    typeof item.id === 'string' && typeof item.title === 'string');
}
async function Catalog() {
  const base = process.env.COURSE_API_URL;
  if (!base) throw new Error('COURSE_API_URL is not configured');
  const response = await fetch(new URL('/courses', base), { cache: 'no-store' });
  if (!response.ok) throw new Error('Course catalog unavailable');
  const data: unknown = await response.json();
  if (!isCourses(data)) throw new Error('Invalid course response');
  return <ul>{data.map(course => <li key={course.id}>{course.title}</li>)}</ul>;
}
export default function Courses() {
  return <main><h1>Your courses</h1><Suspense fallback={<p>Loading courses…</p>}>
    <Catalog />
  </Suspense></main>;
}`,
    "Configure a trusted absolute COURSE_API_URL whose /courses endpoint returns an array of IDs and titles. This example requests a fresh response and validates its shape. Provide an error boundary for failures rather than displaying internal error details.",
    ["Server request", "Status and payload validation", "Render valid data or recover"],
    "Do not assume every fetch is cached forever or always uncached in every framework version and mode. Choose and document the actual freshness policy.",
    "How would you avoid a waterfall between independent catalog and category reads?",
    "Start both promises before awaiting them, then await Promise.all or give independently useful regions separate Suspense boundaries.",
    "https://nextjs.org/docs/app/getting-started/fetching-data",
  ),
  "data--caching": lesson(
    "Caching reuses a result under a defined key and freshness policy. Decide what may be shared, for how long, and which changes should invalidate it before adding cache directives.",
    [
      "This example enables Cache Components explicitly and uses a function-level use cache directive. cacheLife describes the reuse policy, while cacheTag assigns a label for later invalidation.",
      "Function inputs and relevant captured values participate in cached identity. Reusing public catalog data is different from caching a user-specific authorization result.",
      "A data cache, a prerendered route shell, and the browser’s navigation cache are different layers. A client refresh is not automatically an invalidation of cached server data.",
    ],
    `// FILE: next.config.ts
import type { NextConfig } from 'next';
const config: NextConfig = { cacheComponents: true };
export default config;
// FILE: lib/catalog.ts
import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
export async function getPublicCatalog() {
  'use cache';
  cacheLife('minutes');
  cacheTag('public-catalog');
  return [{ id: 'next', title: 'Next.js' }]; // Replace with a public data adapter.
}
// FILE: app/courses/page.tsx
import { getPublicCatalog } from '@/lib/catalog';
export default async function Courses() {
  const courses = await getPublicCatalog();
  return <ul>{courses.map(course => <li key={course.id}>{course.title}</li>)}</ul>;
}`,
    "The result is labeled public-catalog so a successful mutation can target related cached reads. The fixed array demonstrates the boundary; use a real adapter to observe changes over time. Do not combine this configuration with legacy route-level cache controls indiscriminately.",
    ["Cache key and scope", "Reuse under lifetime policy", "Invalidate on relevant changes"],
    "Do not read request cookies in this shared cache scope or cache all users under one key. Authentication and private data need carefully separated boundaries.",
    "Why is router.refresh not equivalent to invalidating public-catalog?",
    "It requests an updated server component payload, but that render can still reuse valid cached server data. Invalidate the relevant server cache when the data changes.",
    "https://nextjs.org/docs/app/getting-started/caching",
  ),
  "data--revalidation": lesson(
    "Revalidation connects successful writes to cached reads. Choose whether readers may briefly see stale data or need the writer’s confirmed result immediately.",
    [
      "revalidateTag with the max profile marks tagged data stale for stale-while-revalidate behavior. updateTag immediately expires a tag for read-your-own-writes and is restricted to Server Actions.",
      "revalidatePath targets affected route output. Path invalidation and tag invalidation express different relationships; tags can connect data used across multiple routes.",
      "Invalidate after the durable write succeeds. Invalidating first can trigger a refresh that simply caches the old database result again.",
    ],
    `// FILE: app/courses/actions.ts
'use server';
import { updateTag, revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireEditor, renamePublicCourse } from '@/lib/course-admin';
export async function renameCourse(formData: FormData) {
  const editor = await requireEditor(); // Must verify identity and editor permission.
  const id = formData.get('id');
  const title = formData.get('title');
  if (typeof id !== 'string' || typeof title !== 'string' || title.trim().length < 3) {
    throw new Error('Invalid course details');
  }
  await renamePublicCourse(editor, id, title.trim());
  updateTag('public-catalog');
  revalidatePath('/courses');
  redirect('/courses');
}`,
    "This integration excerpt requires a real course-admin adapter that authorizes and persists the change. It targets the caching lesson’s tag. redirect is intentionally outside a broad catch because it uses framework control flow.",
    ["Authorize and commit write", "Expire affected cached reads", "Render confirmed data"],
    "Do not use updateTag in a Route Handler; use the supported tag-revalidation API for that context. Also do not use deprecated single-argument revalidateTag semantics as the default teaching pattern.",
    "Which policy fits a public news feed that may briefly show older content?",
    'Stale-while-revalidate can be appropriate: revalidateTag(tag, "max") lets stale content be served while a fresh result is obtained.',
    "https://nextjs.org/docs/app/getting-started/revalidating",
  ),
  "data--server-actions": lesson(
    "Server Actions let forms and client interactions invoke server-side mutations. Treat every action as a callable server boundary with untrusted input.",
    [
      "A use server directive marks an async server function or a module of server functions. It does not make arbitrary exports private or automatically authorize callers.",
      "Validate FormData and derive identity on the server. Hidden inputs, bound arguments, and client-provided IDs remain subject to authorization checks.",
      "Return expected validation results as structured state; reserve thrown failures for unexpected conditions handled by an appropriate error boundary or recovery path.",
    ],
    `// FILE: app/plan/actions.ts
'use server';
export async function validatePlan(_previous: { message: string }, data: FormData) {
  const title = data.get('title');
  if (typeof title !== 'string' || title.trim().length < 3 || title.length > 120) {
    return { message: 'Use a title between 3 and 120 characters.' };
  }
  // This demonstration validates only; no database write is performed.
  return { message: 'Valid plan: ' + title.trim() };
}
// FILE: app/plan/page.tsx
'use client';
import { useActionState } from 'react';
import { validatePlan } from './actions';
export default function Plan() {
  const [state, action, pending] = useActionState(validatePlan, { message: '' });
  return <form action={action}><label>Title <input name="title" required /></label>
    <button disabled={pending}>{pending ? 'Checking…' : 'Validate plan'}</button>
    <p role="status">{state.message}</p>
  </form>;
}`,
    "The client displays pending and result states while the server validates input. This intentionally performs no persistent mutation. A real save must verify the session, enforce permissions, and write before reporting success.",
    [
      "Form submits untrusted values",
      "Server validates and authorizes",
      "Structured result updates UI",
    ],
    "Do not rely on a disabled submit button or hidden action reference as security. The server function must validate each invocation.",
    "Why is the first argument previous state in this example?",
    "useActionState supplies the previous action state before the form payload. An ordinary form action without that Hook has a different argument shape.",
    "https://nextjs.org/docs/app/getting-started/updating-data",
  ),
  "data--optimistic-updates": lesson(
    "An optimistic update displays an intended result before the server confirms it. It needs an explicit pending state, a failure path, and reconciliation with authoritative data.",
    [
      "useOptimistic overlays temporary UI on a confirmed base value while an Action is pending. When the Action settles, the base value determines the durable display.",
      "Keep optimistic mutations inside a supported Action or transition. Update the confirmed base after success and provide an understandable error if the write fails.",
      "Serialize or otherwise order conflicting mutations. A failed earlier request must not overwrite a later successful edit. The following example allows one request at a time.",
    ],
    `// FILE: app/courses/Completion.tsx
'use client';
import { useOptimistic, useState, useTransition } from 'react';
export default function Completion({ save }: { save: (value: boolean) => Promise<boolean> }) {
  const [confirmed, setConfirmed] = useState(false);
  const [optimistic, setOptimistic] = useOptimistic(confirmed, (_old, next: boolean) => next);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');
  function toggle() {
    if (pending) return;
    const next = !confirmed;
    setError('');
    startTransition(async () => {
      setOptimistic(next);
      try {
        const saved = await save(next);
        startTransition(() => setConfirmed(saved));
      } catch { setError('Save failed. The confirmed value has been restored.'); }
    });
  }
  return <section><button disabled={pending} onClick={toggle} aria-pressed={optimistic}>
    {optimistic ? 'Complete' : 'Incomplete'}
  </button><p role="status">{pending ? 'Saving…' : error}</p></section>;
}`,
    "Supply save as a Server Action from a server parent, or a suitable function from a client parent. It must resolve to the confirmed boolean or reject. The local confirmed value changes only after success; errors leave the original base intact.",
    ["Show intended state", "Await authoritative write", "Confirm or restore base"],
    "An ordinary server-defined function is not a serializable client prop. A server parent must supply a supported Server Action, and that action still needs authentication and validation.",
    "When is optimism a poor fit?",
    "When the result is unpredictable or the operation is difficult to reverse, such as a consequential payment. A clear pending state may be more appropriate.",
    "https://nextjs.org/docs/app/guides/forms",
  ),
  "routing--dynamic-segments": lesson(
    "Dynamic segments place resource identifiers into the URL. A segment’s shape determines whether the page receives one string, an array of strings, or an optional array.",
    [
      "[slug] captures one segment; [...slug] captures one or more; [[...slug]] can also match the parent path with no value. Validate the decoded parameter before using it.",
      "In current App Router APIs, params is a promise. Await it in a Server Component, and use the appropriate client APIs when reading route state in a Client Component.",
      "A valid path shape does not guarantee a resource exists or belongs to the viewer. Lookup and authorization are separate checks.",
    ],
    `// FILE: app/courses/[slug]/page.tsx
import { notFound } from 'next/navigation';
const courses = new Map([['next', 'Next.js'], ['react', 'React']]);
export default async function Course({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = courses.get(slug);
  if (!title) notFound();
  return <main><h1>{title}</h1><p>Course details for {slug}.</p></main>;
}
// FILE: app/courses/[slug]/not-found.tsx
import Link from 'next/link';
export default function MissingCourse() {
  return <main><h1>Course not found</h1><Link href="/courses">Browse courses</Link></main>;
}`,
    "The page handles /courses/next and /courses/react, while unknown IDs activate the nearest not-found UI. With Cache Components enabled, runtime params outside known prerendered values need a suitable Suspense boundary.",
    ["URL resource identifier", "Await params and lookup", "Detail or not-found UI"],
    "Do not blindly spread a catch-all array into a filesystem path or query. Constrain what each segment is allowed to identify.",
    "What type does [...slug] provide?",
    "A string array representing the captured segments. The optional catch-all form can provide undefined when no segments were supplied.",
    "https://nextjs.org/docs/app/api-reference/file-conventions/dynamic-routes",
  ),
  "routing--route-groups": lesson(
    "Route groups organize routes or choose layouts without adding their folder name to the URL. Parentheses mark an organizational segment rather than a public path segment.",
    [
      "A group such as (marketing) can hold public pages and a shared layout. A separate (workspace) group can organize application screens with a different nested layout.",
      "Group names disappear from resolved paths. Two files in different groups can still conflict if they map to the same URL.",
      "Multiple root layouts are a separate advanced arrangement. Navigating across different root layouts can cause a full page load; do not promise preserved state across that boundary.",
    ],
    `app/
  layout.tsx                 # shared root document
  (marketing)/
    layout.tsx               # marketing navigation
    about/
      page.tsx               # /about
  (workspace)/
    layout.tsx               # workspace navigation
    courses/
      page.tsx               # /courses

# Neither /(marketing)/about nor /(workspace)/courses is the public URL.`,
    "Both groups inherit the shared root layout but add their own nested shell. The visible URLs remain /about and /courses, so organization can change without exposing internal folder labels.",
    ["Grouped source folders", "Omit group from URL", "Apply intended layout"],
    "Creating (marketing)/about/page.tsx and (workspace)/about/page.tsx does not create two distinct pages. They both resolve to /about and conflict.",
    "How would you change navigation styling without changing course URLs?",
    "Move the course routes under a suitable route group with its own layout, while preserving the same resolved path and avoiding duplicate routes.",
    "https://nextjs.org/docs/app/api-reference/file-conventions/route-groups",
  ),
  "routing--parallel-routes": lesson(
    "Parallel routes render named slots beside the normal children region of a layout. They allow independently routed panels, each with its own loading and error boundaries.",
    [
      "A folder such as @progress defines a slot passed to its parent layout as the progress prop. The @slot name does not become a URL segment.",
      "Soft navigation can preserve a slot’s active state when it does not match the new URL. A hard reload cannot infer every previous active slot and may need default.tsx.",
      "Use slots for genuinely independent route-driven regions, not as a replacement for ordinary component props. Provide deliberate unmatched and recovery behavior.",
    ],
    `// FILE: app/dashboard/layout.tsx
import type { ReactNode } from 'react';
export default function Dashboard({ children, progress }: { children: ReactNode; progress: ReactNode }) {
  return <main><section>{children}</section><aside aria-label="Progress">{progress}</aside></main>;
}
// FILE: app/dashboard/page.tsx
export default function DashboardPage() { return <h1>Study dashboard</h1>; }
// FILE: app/dashboard/@progress/page.tsx
export default function Progress() { return <p>Two lessons complete.</p>; }
// FILE: app/dashboard/@progress/default.tsx
export default function DefaultProgress() { return null; }
// FILE: app/dashboard/default.tsx
export default function DefaultChildren() { return null; }`,
    "At /dashboard, the layout receives both the page and progress slot. The default files define a safe fallback for unmatched slot state during full loads. Extend the route tree only after testing both navigation and refresh.",
    ["Named slot folders", "Layout receives slot props", "Independent routed panels"],
    "Do not assume a slot that remains visible during client navigation will also resolve the same way after a refresh. Test hard-navigation fallbacks.",
    "Does @progress create a /dashboard/progress URL?",
    "No. It is a named slot. URL segments come from the ordinary route folders inside and around the slot.",
    "https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes",
  ),
  "routing--intercepting-routes": lesson(
    "Intercepting routes let a soft navigation display a destination in the current context, such as a course preview overlay, while a direct visit renders the destination’s full page.",
    [
      "The (.) and (..) conventions describe route-segment relationships, not a simple count of filesystem folders. Slot folders do not count as URL segments.",
      "Combine interception with a parallel slot when the background page should remain visible. Keep a canonical full-page route for refresh, sharing, and direct navigation.",
      "Interception provides route behavior, not a complete accessible dialog. The overlay still needs focus handling, keyboard dismissal, a name, and a reliable close navigation path.",
    ],
    `app/
  layout.tsx                    # renders children and modal slot
  page.tsx                      # catalog with Link to /courses/next
  courses/
    [slug]/page.tsx              # canonical full detail page
  @modal/
    default.tsx                 # returns null on unmatched hard loads
    [...catchAll]/page.tsx       # returns null when navigating elsewhere
    (.)courses/
      [slug]/page.tsx            # intercepted preview for soft navigation

# The root layout receives { children, modal }.
# Use an accessible dialog component inside the intercepted page.`,
    "Clicking a course from the current application context can fill the modal slot. Pasting /courses/next or refreshing it renders the canonical detail route. The catch-all slot route helps clear a previously open overlay on other navigations.",
    [
      "Soft navigation from catalog",
      "Intercept into preview slot",
      "Direct load uses canonical page",
    ],
    "Do not ship only the overlay route. A shared link or refresh needs a complete destination, and a visually drawn overlay is not automatically an accessible modal.",
    "Why does (.)courses work beneath @modal in this tree?",
    "The @modal slot does not add a route segment, so courses is at the same route level as the slot’s parent context.",
    "https://nextjs.org/docs/app/api-reference/file-conventions/intercepting-routes",
  ),
  "routing--middleware": lesson(
    "In Next.js 16, the middleware file convention was renamed to Proxy. This lesson keeps the existing course title while teaching proxy.ts for early request routing and response decisions.",
    [
      "Place proxy.ts beside app, or under src when app is under src. Export proxy and a static matcher that limits which paths invoke it.",
      "Use this boundary for redirects, rewrites, or request metadata. A redirect changes the browser-visible location; a rewrite serves another destination without the same visible URL change.",
      "Proxy is not the final authorization boundary for private data. Verify identity and permissions in data access, Route Handlers, and Server Actions even if an early redirect improves navigation.",
    ],
    `// FILE: proxy.ts
import { NextRequest, NextResponse } from 'next/server';
export function proxy(request: NextRequest) {
  const destination = new URL('/courses', request.url);
  destination.searchParams.set('from', 'legacy');
  return NextResponse.redirect(destination);
}
export const config = { matcher: '/old-courses' };`,
    "A request to /old-courses redirects to /courses?from=legacy. The matcher prevents this example from redirecting assets or unrelated routes. Static redirect configuration is another option for a fixed mapping; Proxy is useful when request logic is actually needed.",
    ["Matched incoming request", "Early routing decision", "Continue, rewrite, or redirect"],
    "Do not copy middleware.ts examples without checking the installed framework version. Avoid expensive application queries in an early request boundary when the destination already owns them.",
    "Can this redirect protect the course API from unauthorized calls?",
    "No. It only changes navigation for its matched path. The API must authenticate and authorize independently.",
    "https://nextjs.org/docs/app/api-reference/file-conventions/proxy",
  ),
};
