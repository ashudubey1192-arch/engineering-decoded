import { lesson } from "./angularLessonSchema.js";

export const angularServicesLessons = {
  "services-and-di--creating-services": lesson(
    "A service gives reusable behavior or state an explicit owner outside a component’s template. Components request the service through dependency injection instead of constructing its dependencies themselves.",
    [
      "Use @Injectable to attach DI metadata. providedIn: root makes the service available from the application environment and supports tree shaking when unused.",
      "Keep the public API focused on the domain: completeCourse is more expressive than exposing a writable array to every caller. Protect mutable implementation details.",
      "Services do not need to be stateful. Formatting policies, API adapters, and pure domain operations can also live behind a service when injection or configuration adds value.",
    ],
    `import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class StudySessions {
  private readonly count = signal(0);
  readonly total = this.count.asReadonly();
  add() { this.count.update(value => value + 1); }
}
// In a component class, within its injection context:
// readonly sessions = inject(StudySessions);
// Template: <button (click)="sessions.add()">{{ sessions.total() }}</button>`,
    "Consumers can read the total but must use add to change it. Components sharing the same injected service instance observe the same count. A locally provided instance creates a different owner.",
    ["Component requests capability", "Service owns behavior", "Readonly state returns"],
    "Do not use new StudySessions() in a component when you intend shared DI ownership. That manually constructed instance bypasses provider configuration.",
    "Why expose asReadonly instead of the writable signal?",
    "It prevents consumers from calling set or update directly and centralizes valid transitions in service methods. It does not deeply freeze object values.",
    "https://angular.dev/guide/di/creating-injectable-service",
  ),
  "services-and-di--dependency-injection-fundamentals": lesson(
    "Dependency injection resolves a token into a value using the active injector hierarchy. It separates the code that needs a capability from the configuration that creates it.",
    [
      "A class can be an injection token. A provider describes how that token is resolved, and a consumer requests it using inject or constructor injection.",
      "inject must run in an injection context, such as a constructed injectable’s field initializer or a provider factory. An arbitrary later event callback is not such a context.",
      "The injector caches instances according to provider scope. Injecting the same root-provided token usually returns the same instance within that application, unless a nearer provider overrides it.",
    ],
    `import { Component, Injectable, inject } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class CourseCatalog { readonly title = 'Angular fundamentals'; }
@Component({ selector: 'app-root', standalone: true,
  template: '<h1>{{ catalog.title }}</h1>' })
export class App {
  readonly catalog = inject(CourseCatalog);
}`,
    "Angular creates App in an injection context and resolves CourseCatalog. The field keeps the resolved object for later use. Template evaluation reads the existing reference rather than reinjecting it.",
    ["Requested token", "Injector searches providers", "Resolved instance"],
    "Calling inject inside a button handler can fail because the handler runs outside construction. Inject the dependency into a field and call that field’s methods later.",
    "What does a missing-provider error indicate?",
    "The requested token could not be resolved through the active hierarchy. Check the token identity and whether its provider is configured in the correct scope.",
    "https://angular.dev/guide/di",
  ),
  "services-and-di--provider-configuration": lesson(
    "Provider configuration chooses how a token obtains its value. Class providers, fixed values, factories, and aliases solve different construction and substitution needs.",
    [
      "useClass constructs the specified implementation for the token. useValue returns a configured value, useful for immutable settings or test doubles.",
      "useFactory computes a value and can resolve dependencies in its factory injection context. Keep initialization predictable and avoid hidden asynchronous assumptions.",
      "useExisting aliases another token to its existing instance. It differs from useClass, which can create a second instance when both tokens are provided separately.",
    ],
    `import { Injectable, InjectionToken } from '@angular/core';
export interface Reporter { record(message: string): void; }
export const REPORTER = new InjectionToken<Reporter>('reporter');
@Injectable({ providedIn: 'root' })
export class ConsoleReporter implements Reporter {
  record(message: string) { console.info(message); }
}
export const reporterProviders = [
  { provide: REPORTER, useExisting: ConsoleReporter }
];
// Include reporterProviders in application providers.`,
    "A consumer injecting REPORTER receives the same ConsoleReporter instance as a consumer requesting the class token. Tests can replace REPORTER with a fake implementing record.",
    ["Token contract", "Provider strategy", "Concrete value"],
    "Do not replace useExisting with useClass casually when identity matters. Two service instances can carry independent mutable state.",
    "Which provider fits a fixed API base URL?",
    "A typed InjectionToken with useValue is appropriate for a fixed public URL. It is configuration, not a secret storage mechanism.",
    "https://angular.dev/guide/di/dependency-injection-providers",
  ),
  "services-and-di--injection-tokens": lesson(
    "InjectionToken gives runtime identity to a dependency that has no injectable class, such as a configuration object or TypeScript interface.",
    [
      "TypeScript interfaces are erased at runtime, so an interface cannot itself be used as the DI lookup key. A typed token connects runtime identity to compile-time expectations.",
      "Export one token instance and import it everywhere. Two InjectionToken objects with the same description are still different keys.",
      "Tokens can have a factory for a default value or be explicitly provided in application, route, or component providers. Choose the narrowest scope appropriate for the setting.",
    ],
    `import { InjectionToken, Injectable, inject } from '@angular/core';
export const API_BASE = new InjectionToken<string>('API base URL');
@Injectable({ providedIn: 'root' })
export class CourseEndpoint {
  private readonly base = inject(API_BASE);
  readonly url = this.base + '/courses';
}
// Application providers:
// { provide: API_BASE, useValue: '/api' }`,
    "With /api provided, CourseEndpoint exposes /api/courses. A test can replace the same token with a test endpoint without changing the service implementation.",
    ["Export one token", "Provide configuration", "Inject typed value"],
    'Recreating new InjectionToken("API base URL") in a consumer does not refer to the exported token, even though the description matches.',
    "Can an API key be made secret by placing it behind an InjectionToken?",
    "No. Client configuration and bundles are inspectable. Private credentials belong on a trusted server.",
    "https://angular.dev/api/core/InjectionToken",
  ),
  "services-and-di--hierarchical-injectors": lesson(
    "Angular resolves dependencies through a hierarchy. A nearby component provider can intentionally create a local instance that differs from a root-provided service.",
    [
      "Environment injectors provide application and route-level capabilities. Element injectors follow the component tree and can supply per-component instances.",
      "A consumer normally searches from its local context outward. The nearest matching provider determines which instance it receives.",
      "Use local providers for isolated drafts or independent widgets. Use broader providers for state that truly must be shared, and understand that a root service’s own dependencies resolve from its creation context.",
    ],
    `import { Component, Injectable, inject, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class Draft { readonly title = signal('Untitled'); }
@Component({ selector: 'draft-editor', standalone: true,
  providers: [Draft],
  template: '<p>{{ draft.title() }}</p><button (click)="rename()">Rename this draft</button>' })
export class DraftEditor {
  readonly draft = inject(Draft);
  rename() { this.draft.title.set('My local plan'); }
}
// Render two <draft-editor /> instances in a parent that imports DraftEditor.`,
    "Each editor’s element injector provides its own Draft. Renaming one does not change the other, even though Draft also has a root registration. Remove the local provider to compare shared root ownership.",
    ["Request in component", "Nearest provider wins", "Local or shared instance"],
    "Accidentally repeating providers: [Draft] on every component defeats intended shared state. Inspect provider placement when values unexpectedly diverge.",
    "Where would you provide an isolated state service for a single routed feature?",
    "A route-level provider can scope the feature’s dependency environment. Verify its lifecycle against your routing and reuse configuration.",
    "https://angular.dev/guide/di/hierarchical-dependency-injection",
  ),
  "services-and-di--service-design-patterns": lesson(
    "Good services expose a small domain contract and hide transport or storage details. Separate data access, state coordination, and presentation when their responsibilities differ.",
    [
      "An API adapter handles endpoints and response interpretation. A feature facade can expose loading state and domain actions; components bind to that contract.",
      "Keep business transformations pure where possible so they can be tested without an injector. Use DI where substituting dependencies or sharing ownership is useful.",
      "Do not create a facade merely to forward every method from another service. Add a boundary when it simplifies consumers or centralizes real coordination rules.",
    ],
    `import { Injectable, computed, signal } from '@angular/core';
interface Course { id: string; title: string; complete: boolean; }
@Injectable({ providedIn: 'root' })
export class PlannerState {
  private readonly items = signal<Course[]>([]);
  readonly courses = this.items.asReadonly();
  readonly completed = computed(() => this.items().filter(c => c.complete).length);
  replace(courses: Course[]) { this.items.set(courses.map(c => ({ ...c }))); }
  complete(id: string) {
    this.items.update(items => items.map(c => c.id === id ? { ...c, complete: true } : c));
  }
}`,
    "The service centralizes immutable completion updates and derives the completed count. A separate API adapter could call replace after loading validated data; the template need not know transport details.",
    ["UI reports intent", "Feature service applies rule", "Derived state updates view"],
    "A readonly signal prevents setter access but does not freeze nested objects. Consumers must still treat returned objects as read-only.",
    "Should this service format the completed count as a localized sentence?",
    "Usually leave presentation formatting to the view layer. The service supplies domain values that different screens can format differently.",
    "https://angular.dev/style-guide",
  ),
  "routing--router-configuration": lesson(
    "The router maps URLs to components and coordinates navigation. A route configuration defines matching rules, while RouterOutlet marks where the active screen appears.",
    [
      "Provide the router once at the application level with provideRouter(routes). Import RouterOutlet into the standalone shell that renders the active route.",
      "Routes are tested in order, so place specific paths before a wildcard. An empty redirect should use pathMatch: full when it is intended only for the empty URL.",
      "A route configuration is not a server rewrite rule. A deployed client application still needs the host to serve its entry document for valid deep links.",
    ],
    `import { Component } from '@angular/core';
import { Routes, RouterOutlet } from '@angular/router';
@Component({ standalone: true, template: '<h1>Your courses</h1>' })
export class CoursesPage {}
@Component({ standalone: true, template: '<h1>Page not found</h1>' })
export class NotFoundPage {}
export const routes: Routes = [
  { path: '', redirectTo: 'courses', pathMatch: 'full' },
  { path: 'courses', component: CoursesPage },
  { path: '**', component: NotFoundPage }
];
@Component({ selector: 'app-root', standalone: true, imports: [RouterOutlet],
  template: '<router-outlet />' })
export class App {}
// Bootstrap App with provideRouter(routes).`,
    "The empty URL redirects to /courses. A matching route renders CoursesPage in the outlet. Unknown paths render NotFoundPage without relying on a missing component exception.",
    ["Browser URL", "Ordered route matching", "Component in outlet"],
    "Putting ** first captures all navigation. Forgetting RouterOutlet leaves matched route content with nowhere to render.",
    "Why use pathMatch: full on the empty redirect?",
    "An empty path can prefix every URL. Full matching restricts this redirect to the intended empty path.",
    "https://angular.dev/guide/routing/define-routes",
  ),
  "routing--router-links": lesson(
    "RouterLink builds navigable links that integrate with Angular’s router and browser history. Use anchors for navigation so users retain link semantics and browser affordances.",
    [
      "Import RouterLink into the component. A string works for a simple path, while an array expresses path segments and dynamic values clearly.",
      "RouterLinkActive marks matching navigation state. Configure exact matching when a parent link should not remain active for every descendant.",
      "Query parameters can represent shareable filters. Decide whether to replace, preserve, or merge parameters rather than accidentally discarding relevant URL state.",
    ],
    `import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
@Component({ selector: 'course-nav', standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: '<nav><a routerLink="/courses" routerLinkActive="active" ariaCurrentWhenActive="page" [routerLinkActiveOptions]="{exact: true}">Courses</a> <a [routerLink]="detailLink" [queryParams]="notesTab">Course notes</a></nav>' })
export class CourseNav {
  detailLink = ['/courses', 'angular'];
  notesTab = { tab: 'notes' };
}`,
    "The first anchor marks the course index as the current page when the URL matches exactly. The second creates a detail URL with a notes query parameter. The detail screen decides how that parameter affects its content.",
    ["Link commands", "Generated URL", "Router navigation and history"],
    "A button that only assigns window.location loses router integration and often causes a full reload. Use RouterLink for internal navigation.",
    "When should navigation still use an ordinary external href?",
    "For a destination outside the Angular application. RouterLink describes routes managed by this application’s router.",
    "https://angular.dev/guide/routing/navigate-to-routes",
  ),
  "routing--route-parameters": lesson(
    "Route parameters identify resources within a path. Read them as changing navigation data rather than assuming a component is recreated for every parameter value.",
    [
      "A route such as courses/:courseId exposes courseId through ActivatedRoute. Parameters arrive as strings or null and need validation before use.",
      "snapshot is useful for a one-time read, but reused components can receive a new parameter without being reconstructed. Observe paramMap for ongoing changes.",
      "Use switchMap when a changed ID should replace an in-flight read. Distinguish an invalid ID, a missing resource, and a failed network request.",
    ],
    `import { Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { map } from 'rxjs';
@Component({ standalone: true, imports: [AsyncPipe],
  template: '<h1>Course: {{ courseId$ | async }}</h1>' })
export class CourseDetail {
  private readonly route = inject(ActivatedRoute);
  readonly courseId$ = this.route.paramMap.pipe(map(params => params.get('courseId')));
}
// Configure { path: 'courses/:courseId', component: CourseDetail }.`,
    "Navigating between /courses/angular and /courses/css updates the stream. AsyncPipe displays the current ID and manages its subscription lifetime.",
    ["Dynamic URL segment", "paramMap stream", "Current resource identity"],
    "Do not trust a URL parameter as proof of access rights. The server must authorize requests for the identified resource.",
    "Why might snapshot show a stale ID after internal navigation?",
    "A reused component may keep the value read during construction. Observing paramMap handles later parameter changes.",
    "https://angular.dev/guide/routing/read-route-state",
  ),
  "routing--nested-routes": lesson(
    "Nested routes represent screens that share a persistent layout. A parent route displays shared structure and a child outlet displays the active nested page.",
    [
      "Child paths are relative to their parent. An empty child route can provide the parent URL’s default view, while named children select tabs or subpages.",
      "The parent component needs its own RouterOutlet import and outlet element. The application shell’s outlet only hosts the parent.",
      "Keep resource-level state in the appropriate owner so switching child tabs does not recreate unrelated state unnecessarily. Understand route reuse before depending on persistence.",
    ],
    `import { Component } from '@angular/core';
import { Routes, RouterOutlet, RouterLink } from '@angular/router';
@Component({ standalone: true, imports: [RouterOutlet, RouterLink],
  template: '<h1>Course workspace</h1><a routerLink="notes">Notes</a><router-outlet />' })
export class CourseLayout {}
@Component({ standalone: true, template: '<p>Course overview</p>' })
export class Overview {}
@Component({ standalone: true, template: '<p>Your notes</p>' })
export class Notes {}
export const routes: Routes = [{ path: 'courses/:courseId', component: CourseLayout,
  children: [{ path: '', component: Overview }, { path: 'notes', component: Notes }]
}];`,
    "At /courses/angular, the parent outlet shows Overview. At /courses/angular/notes, it shows Notes while retaining the workspace heading.",
    ["Parent path", "Shared layout and outlet", "Matched child screen"],
    "Repeating the entire workspace shell in each child defeats the purpose of nested layout ownership. Put shared structure in the parent route component.",
    "Where does the URL /courses/angular/notes obtain courseId?",
    "It is declared on the parent route. A child should read the appropriate parent route or deliberately use configured parameter inheritance.",
    "https://angular.dev/guide/routing/define-routes",
  ),
  "routing--route-guards": lesson(
    "Guards decide whether navigation can proceed, redirect, or be blocked. They improve navigation flow but cannot enforce server-side authorization.",
    [
      "Functional guards run in an injection context and can return a boolean, UrlTree, RedirectCommand, promise, or observable supported by the guard contract.",
      "Return a redirect result when access should lead elsewhere. Do not return false and separately launch a competing navigation as a substitute for a redirect.",
      "CanDeactivate can protect an unsaved editing flow. CanMatch affects route matching; returning false may allow another route definition to match instead.",
    ],
    `import { Injectable, inject, signal } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
@Injectable({ providedIn: 'root' })
export class Session { readonly signedIn = signal(false); }
export const signedInGuard: CanActivateFn = (_route, state) => {
  const session = inject(Session);
  const router = inject(Router);
  return session.signedIn() || router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  });
};
// Attach canActivate: [signedInGuard] to the protected route.
// Configure /login and validate any return URL before using it.`,
    "An authenticated navigation returns true. Otherwise the router receives a redirect to login. This local Session is illustrative; real authentication must come from an appropriate trusted flow.",
    ["Navigation requested", "Guard evaluates policy", "Activate or redirect"],
    "A user can modify client state or call an API directly. Every protected server operation must authenticate and authorize independently.",
    "Why return a UrlTree instead of calling navigate and returning false?",
    "It gives the router one explicit redirect decision as part of the current navigation, avoiding unnecessary competing navigation logic.",
    "https://angular.dev/guide/routing/route-guards",
  ),
  "routing--resolvers": lesson(
    "A resolver loads required data before a route activates. It is useful when the destination cannot meaningfully render without a specific resource.",
    [
      "A ResolveFn runs in an injection context and receives route information. Return the data or an asynchronous source that resolves the route’s required value.",
      "Resolved values are available through ActivatedRoute.data. Keep loading feedback at a navigation or shell level because the destination may not be active yet.",
      "A failed resolver can cancel navigation. Define application navigation-error handling or a redirect policy; do not silently replace a missing course with unrelated data.",
    ],
    `import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ResolveFn } from '@angular/router';
interface Course { id: string; title: string; }
export const courseResolver: ResolveFn<Course> = route => {
  const id = route.paramMap.get('courseId');
  if (!id) throw new Error('Missing course ID');
  return inject(HttpClient).get<Course>('/api/courses/' + encodeURIComponent(id));
};
// Route excerpt:
// { path: 'courses/:courseId', component: CourseDetail,
//   resolve: { course: courseResolver } }
// Provide HttpClient and implement the endpoint and CourseDetail.`,
    "The router waits for the course result before activating the detail page. The response type is a compile-time expectation, not runtime validation; validate external data at the boundary in a production adapter.",
    ["Navigation begins", "Required data resolves", "Destination activates"],
    "Resolving every optional dashboard widget blocks navigation unnecessarily. Load optional panels after activation when progressive display is better.",
    "Where should the user see progress while a resolver waits?",
    "In a surviving shell or navigation indicator. The unresolved destination may not yet exist to display its own spinner.",
    "https://angular.dev/guide/routing/data-resolvers",
  ),
  "routing--lazy-loaded-routes": lesson(
    "Lazy routing defers feature code until navigation needs it. Use loadComponent for a standalone screen and loadChildren for a route collection.",
    [
      "Dynamic imports establish asynchronous bundle boundaries. A standalone component can be loaded by selecting its exported class from the imported module.",
      "Keep the initial shell small and choose boundaries around meaningful features. Lazy loading adds first-visit latency, so consider preloading for likely next destinations.",
      "Loading a chunk can fail after network loss or an inconsistent deployment. Define a navigation recovery path and keep released assets compatible with open clients.",
    ],
    `// app.routes.ts
import { Routes } from '@angular/router';
export const routes: Routes = [
  { path: 'courses', loadComponent: () =>
      import('./features/courses/courses-page').then(module => module.CoursesPage) },
  { path: 'reports', loadChildren: () =>
      import('./features/reports/reports.routes').then(module => module.routes) }
];
// courses-page.ts exports standalone CoursesPage.
// reports.routes.ts exports a Routes array named routes.`,
    "Navigating to courses requests its component chunk. Reports loads a separate route configuration. Create the referenced modules before compiling the practice app, then inspect production network requests to confirm the split.",
    ["Navigate to feature", "Load matching code chunk", "Activate standalone screen"],
    "A static import of a supposedly deferred feature elsewhere can bring code back into an earlier bundle. Inspect build output instead of assuming folder boundaries control loading.",
    "How do loadComponent and loadChildren differ here?",
    "One resolves a component type for a route; the other resolves additional route definitions, which can describe an entire feature hierarchy.",
    "https://angular.dev/guide/routing/define-routes",
  ),
};
