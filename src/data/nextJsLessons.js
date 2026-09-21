import { lesson } from "./nextJsLessonSchema.js";
import { nextJsDataLessons } from "./nextJsLessonsData.js";
import { nextJsFeatureLessons } from "./nextJsLessonsFeatures.js";
import { nextJsProductionLessons } from "./nextJsLessonsProduction.js";

export const nextJsLessons = {
  ...nextJsDataLessons,
  ...nextJsFeatureLessons,
  ...nextJsProductionLessons,
  "foundations--why-next-js": lesson(
    "Next.js adds application structure and server capabilities to React. Use it when a product needs coordinated routing, rendering, data access, and production tooling rather than only a client-rendered component tree.",
    [
      "React describes UI; Next.js supplies conventions for URLs, layouts, server rendering, mutations, assets, and deployment. A course catalog can serve readable initial HTML while a small interactive planner runs in the browser.",
      "This course uses the App Router and Next.js 16-era APIs: asynchronous request values, small Client Component boundaries, and Proxy terminology. Cache Components examples explicitly require cacheComponents: true; do not mix those examples with older route-cache settings.",
      "Run examples in a separate Next.js practice workspace. The learning site remains its existing React application. Interactive models illustrate behavior and do not execute a Next.js server inside the article.",
    ],
    `// FILE: app/page.tsx
import Link from 'next/link';
export default function Home() {
  return <main>
    <h1>Engineering course planner</h1>
    <p>Learn a concept, build a feature, check the result.</p>
    <Link href="/courses">Browse courses</Link>
  </main>;
}
// FILE: app/courses/page.tsx
export default function Courses() {
  return <main><h1>Your courses</h1><p>React, Angular, and Next.js</p></main>;
}`,
    "In a generated App Router project, these two files expose / and /courses. Link connects them through framework navigation. The root layout from project setup supplies the document structure.",
    ["React components", "Framework routing and rendering", "Deployable web application"],
    "Do not assume every project needs a server framework. A static widget may need only React; choose Next.js when its application capabilities address real requirements.",
    "Which work belongs to React, and which does Next.js add in this example?",
    "React describes the headings and links as a component tree. Next.js maps files to URLs, renders the route, and coordinates navigation and build output.",
  ),
  "foundations--creating-a-project": lesson(
    "Create an isolated practice application with create-next-app so the examples share a compatible toolchain. Keep the generated configuration understandable before adding libraries or deployment integrations.",
    [
      "Choose TypeScript and the App Router. The examples use the @/* alias pointing at the project source root; adapt paths if you choose a src directory or a different alias.",
      "Check the installed Next.js version and its supported Node.js runtime. Keep the lockfile committed so development and CI install the same resolved dependencies.",
      "Development, production compilation, and production serving are distinct steps. A route that works under the development server still needs a production build and runtime check.",
    ],
    `# Terminal: create a NEW practice folder
npx create-next-app@latest next-planner --ts --eslint --app --use-npm
cd next-planner
npm run dev

# Later: stop the development server before reusing its port
npm run build
npm run start

# Inspect the installed framework version
npm ls next react react-dom`,
    "Follow the CLI prompts, open its printed local URL, and edit app/page.tsx. Preserve the generated root layout. Cache Components is introduced explicitly in the caching chapter rather than assumed for every example.",
    ["Scaffold a new workspace", "Edit with the dev server", "Build and serve production output"],
    "Do not scaffold into this learning site or an existing application you want to preserve. Also do not treat public frontend environment variables as secret storage.",
    "Why run both development and production checks?",
    "They exercise different compilation and rendering paths. Production can reveal prerendering errors, missing environment values, and deployment assumptions not exposed by a visited development route.",
    "https://nextjs.org/docs/app/getting-started/installation",
  ),
  "foundations--app-router": lesson(
    "The App Router maps folders to route segments and special files to rendering responsibilities. A folder can organize code without exposing a screen until a page or route handler is present.",
    [
      "page.tsx defines a navigable UI at its segment. layout.tsx wraps descendant routes. loading.tsx, error.tsx, and not-found.tsx provide specific waiting and recovery boundaries.",
      "route.ts implements an HTTP endpoint rather than a React screen. Do not place a page and a route handler at the same resolved path.",
      "Keep feature helpers near the route or in a separate library folder. Only framework conventions define public route behavior; ordinary helper files do not automatically become endpoints.",
    ],
    `app/
  layout.tsx              # document and shared shell
  page.tsx                # /
  courses/
    page.tsx              # /courses
    loading.tsx           # segment loading UI
    [slug]/
      page.tsx            # /courses/angular, /courses/react
      not-found.tsx       # unavailable course UI
  api/
    courses/
      route.ts            # /api/courses HTTP endpoint
lib/
  courses.ts              # domain/data helpers`,
    "A request to /courses/react resolves the root layout and the dynamic course page. The page determines whether react identifies an existing course; the folder name alone does not validate the resource.",
    ["URL segments", "Special-file conventions", "Nested route tree"],
    "Do not mix Pages Router APIs such as getServerSideProps into an App Router page. Follow one router’s data and rendering model within that route.",
    "Does app/courses/helpers.ts create a /courses/helpers page?",
    "No. It is an ordinary module. The segment needs a page file for a UI route or a route file for an HTTP handler.",
    "https://nextjs.org/docs/app/getting-started/project-structure",
  ),
  "foundations--layouts-and-pages": lesson(
    "Layouts provide shared structure around pages. Keeping the shell in a layout lets navigation replace the page region while preserving appropriate shared UI and state.",
    [
      "The root layout contains html and body and accepts children. Nested layouts add feature-specific navigation or structure without repeating the entire document.",
      "Layouts are reused during client navigation. Put frequently changing URL-derived information in a suitable page or Client Component rather than assuming a shared layout reruns for every navigation.",
      "A template creates a different lifecycle boundary and can remount its children. Use it when a reset is intentional, not as an interchangeable spelling of layout.",
    ],
    `// FILE: app/layout.tsx
import type { ReactNode } from 'react';
import Link from 'next/link';
export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>
    <header><Link href="/courses">Course planner</Link></header>
    {children}
  </body></html>;
}
// FILE: app/courses/layout.tsx
import type { ReactNode } from 'react';
export default function CourseLayout({ children }: { children: ReactNode }) {
  return <section aria-label="Course workspace">{children}</section>;
}`,
    "The root header surrounds every route beneath it, while the course layout adds a feature boundary. Pages provide their own main content and appropriate heading hierarchy.",
    ["Root document layout", "Feature layout", "Active page content"],
    "Do not duplicate html and body in every nested layout or use a layout as the sole place to enforce data authorization. Data access must verify its own permissions.",
    "Where should a search result dependent on searchParams usually be calculated?",
    "In the page or an appropriate child that receives current search parameters. Shared layouts are not a reliable source of freshly changing query values.",
    "https://nextjs.org/docs/app/getting-started/layouts-and-pages",
  ),
  "foundations--navigation": lesson(
    "Link provides framework-aware navigation while retaining anchor semantics. Use programmatic routing when an action needs navigation as part of its outcome.",
    [
      "Import Link from next/link for internal destinations. Next.js can prefetch route information and preserve shared layouts; the exact prefetch behavior depends on route and framework configuration.",
      "Client navigation APIs come from next/navigation in the App Router. Server redirects use redirect; it ends the current rendering or action control flow by throwing a framework signal.",
      "Keep destinations trusted. Encode path segments and validate user-controlled redirect targets rather than passing arbitrary strings to router.push.",
    ],
    `// FILE: app/courses/page.tsx
import Link from 'next/link';
const courses = [{ slug: 'react', title: 'React' }, { slug: 'angular', title: 'Angular' }];
export default function Courses() {
  return <main><h1>Your courses</h1><ul>
    {courses.map(course => <li key={course.slug}>
      <Link href={'/courses/' + encodeURIComponent(course.slug)}>{course.title}</Link>
    </li>)}
  </ul></main>;
}
// Implement app/courses/[slug]/page.tsx in Dynamic Segments.`,
    "Each anchor points to a stable, shareable course URL. Test clicking, browser Back, and pasting a deep link. Prefetch behavior is best inspected against a production build rather than inferred from development alone.",
    ["Anchor destination", "Framework navigation", "Updated page with shared layout"],
    "Do not use a clickable div for navigation. It loses keyboard, context-menu, and link-opening behavior supplied by an anchor.",
    "When is redirect preferable to a client router call?",
    "When the decision happens in server rendering or a Server Action, such as after a successful authenticated mutation.",
    "https://nextjs.org/docs/app/getting-started/linking-and-navigating",
  ),
  "rendering--server-components": lesson(
    "App Router pages and layouts are Server Components by default. They can prepare UI near server data without shipping their component implementation and server dependencies to the browser.",
    [
      "A Server Component may be async and read server-side resources. It cannot use browser event handlers, useState, or browser-only globals as if it were a Client Component.",
      "Server Components and server-rendered HTML are related but distinct. A Client Component can also contribute initial HTML; the important boundary includes what code and data the browser receives.",
      "Only pass necessary serializable public values into Client Components. Keeping a query on the server does not protect a secret that you then include in props or rendered output.",
    ],
    `// FILE: app/courses/page.tsx
import 'server-only';
type Course = { id: string; title: string };
async function readCatalog(): Promise<Course[]> {
  return [{ id: 'next', title: 'Next.js' }]; // Replace with a server data adapter.
}
export default async function Courses() {
  const courses = await readCatalog();
  return <main><h1>Your courses</h1><ul>
    {courses.map(course => <li key={course.id}>{course.title}</li>)}
  </ul></main>;
}`,
    "This self-contained stub returns public course data. A real adapter could query a database after authorization. With Cache Components enabled, uncached asynchronous work needs an appropriate cache scope or Suspense boundary.",
    ["Server data access", "Server component output", "Public UI payload"],
    "Do not fetch your own Route Handler from a Server Component just to reach the same database. A direct server data function avoids an unnecessary internal HTTP round trip.",
    "Can a Server Component render an interactive Client Component?",
    "Yes. It can render a Client Component with suitable props, keeping the interactive boundary smaller than the whole page.",
    "https://nextjs.org/docs/app/getting-started/server-and-client-components",
  ),
  "rendering--client-components": lesson(
    "A Client Component owns browser interaction, state, and Effects. The use client directive establishes a module boundary; it does not mean the component is rendered only in the browser.",
    [
      "Put the directive before imports in the client entry module. Modules imported beneath that boundary become part of its client dependency graph, so avoid pulling server-only libraries into it.",
      "Initial HTML can still be rendered on the server and then hydrated. Keep the initial render compatible across environments and access browser-only APIs in suitable handlers or Effects.",
      "Keep interactive islands small. A bookmark button can be client-side while its surrounding course title and description remain server-rendered components.",
    ],
    `// FILE: app/courses/Bookmark.tsx
'use client';
import { useState } from 'react';
export default function Bookmark({ title }: { title: string }) {
  const [saved, setSaved] = useState(false);
  return <button aria-pressed={saved} onClick={() => setSaved(value => !value)}>
    {saved ? 'Saved ' : 'Save '}{title}
  </button>;
}
// FILE: app/courses/page.tsx
import Bookmark from './Bookmark';
export default function Courses() {
  return <main><h1>Next.js</h1><Bookmark title="Next.js" /></main>;
}`,
    "The page composes the interactive button without becoming a client module itself. The saved state lasts for this mounted button; it is not persisted to an account or database.",
    ["Server page", "Small client boundary", "Hydrated event handlers"],
    "Adding use client to the root layout to enable one button sends a much broader dependency graph toward the client. Move the boundary to the interactive component.",
    "Is window.localStorage safe in a Client Component’s initial render?",
    "Not automatically. That render may execute during server prerendering. Read browser-only storage at the appropriate browser lifecycle point and plan a stable initial UI.",
    "https://nextjs.org/docs/app/getting-started/server-and-client-components",
  ),
  "rendering--static-rendering": lesson(
    "Static rendering prepares reusable output before a particular user request needs it. It works well for public content with an explicit freshness policy.",
    [
      "A page with fixed public content can be prerendered. Dynamic route segments can provide known values through generateStaticParams so their pages can be prepared ahead of time.",
      "Static does not mean permanently frozen. Cached content can be revalidated, while client interactivity can still hydrate onto the initial output.",
      "Cache Components can combine a static shell with request-time regions. Do not treat static versus dynamic as an absolute description of every part of a modern page.",
    ],
    `// FILE: app/courses/[slug]/page.tsx
import { notFound } from 'next/navigation';
const catalog: Record<string, string> = { react: 'React', angular: 'Angular' };
export function generateStaticParams() {
  return Object.keys(catalog).map(slug => ({ slug }));
}
export default async function Course({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const title = Object.hasOwn(catalog, slug) ? catalog[slug] : undefined;
  if (!title) notFound();
  return <main><h1>{title}</h1><p>Public course introduction.</p></main>;
}`,
    "The build knows the react and angular paths. Requests for unknown data still need an explicit policy; this page returns not-found behavior. Inspect build output rather than guessing rendering mode from an async keyword.",
    ["Known public inputs", "Build-time reusable output", "Serve and revalidate deliberately"],
    "Do not embed one user’s private profile in shared static output. User-specific access needs a request-aware boundary and a privacy-safe cache design.",
    "Does async automatically make this page request-rendered?",
    "No. Async syntax alone does not determine when its output is generated. The data, request APIs, and caching configuration determine the rendering work.",
    "https://nextjs.org/docs/app/api-reference/functions/generate-static-params",
  ),
  "rendering--dynamic-rendering": lesson(
    "Dynamic rendering handles information that depends on the incoming request, such as cookies, authorization, or a current uncached result. Keep request-specific work at an intentional boundary.",
    [
      "Request APIs such as cookies and headers are asynchronous. Await them where the actual request data is needed rather than reading them at module scope.",
      "With Cache Components, place request-time work behind Suspense so the static shell can be prepared independently. Without that configuration, request APIs still affect route rendering behavior.",
      "A dynamic region can consume reusable cached public data. Request-time rendering does not imply that every database query must be repeated without a cache.",
    ],
    `// FILE: app/page.tsx
import { Suspense } from 'react';
import { cookies } from 'next/headers';
async function Preference() {
  const cookieStore = await cookies();
  const theme = cookieStore.get('theme')?.value === 'dark' ? 'dark' : 'light';
  return <p>Your chosen theme: {theme}</p>;
}
export default function Home() {
  return <main><h1>Course planner</h1>
    <Suspense fallback={<p>Loading preference…</p>}><Preference /></Suspense>
  </main>;
}`,
    "The heading is independent of the visitor. Preference reads the current request’s cookie and restricts it to known display values. This preference cookie is not authentication evidence.",
    ["Incoming request", "Await request-bound data", "Render personalized region"],
    "Do not read cookies inside a shared use cache function. Resolve request information outside the cache scope and design any resulting cache key and privacy boundary explicitly.",
    "Should a theme cookie authorize access to paid lessons?",
    "No. It is user-controlled preference data. Verify identity and permissions through a trusted server-side authentication flow.",
    "https://nextjs.org/docs/app/api-reference/functions/cookies",
  ),
  "rendering--streaming": lesson(
    "Streaming lets ready content reach the browser while slower regions are still preparing. Suspense boundaries express which parts can display a useful fallback independently.",
    [
      "Place the slow asynchronous operation inside the component beneath Suspense. Awaiting it in the parent before returning the boundary prevents that boundary from helping.",
      "Choose boundaries by user experience: keep navigation and the main heading available, and reveal optional recommendations or reports when ready.",
      "Streaming is not faster data access. It improves when useful output appears; proxies, compression, and hosting buffers can affect whether progressive delivery is visible.",
    ],
    `// FILE: app/page.tsx
import { Suspense } from 'react';
import { connection } from 'next/server';
async function Recommendation() {
  await connection();
  await new Promise(resolve => setTimeout(resolve, 1200)); // Teaching delay only.
  return <p>Recommended next: build a routed course planner.</p>;
}
export default function Home() {
  return <main><h1>Keep learning</h1>
    <Suspense fallback={<p role="status">Finding your next lesson…</p>}>
      <Recommendation />
    </Suspense>
  </main>;
}`,
    "connection makes the example wait for a request, and the deliberate delay exposes the fallback. The heading can appear first. Remove the artificial delay from real features and measure actual slow operations.",
    ["Ready shell", "Fallback while region waits", "Reveal resolved content"],
    "Do not wrap the entire application in one boundary unless an all-or-nothing loading experience is intended. Independently useful regions deserve separate boundaries.",
    "Why would awaiting Recommendation’s data above Suspense defeat this example?",
    "The parent would wait before producing any boundary or fallback. Put the waiting work inside the suspended subtree.",
    "https://nextjs.org/docs/app/getting-started/fetching-data",
  ),
};
