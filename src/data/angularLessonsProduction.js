import { lesson } from "./angularLessonSchema.js";

export const angularProductionLessons = {
  "state-management--component-state": lesson(
    "Component state belongs to one view instance and supports its interactions. Keep state local until another part of the application has a concrete need to share it.",
    [
      "Use writable signals for local reactive values that the template reads. Call the signal to read it, set for a replacement, and update for a transformation based on its current value.",
      "Keep the smallest source of truth. Remaining lessons and completion percentage can be derived from completed and total instead of maintained through separate setters.",
      "Component destruction ends that instance’s state lifetime. Lift a draft to a surviving owner when the product requires it to persist across route or conditional view changes.",
    ],
    `import { Component, computed, signal } from '@angular/core';
@Component({ selector: 'study-progress', standalone: true,
  template: '<p>{{ done() }} complete; {{ remaining() }} remaining</p><button [disabled]="remaining() === 0" (click)="complete()">Complete lesson</button>' })
export class StudyProgress {
  readonly total = 5;
  readonly done = signal(0);
  readonly remaining = computed(() => this.total - this.done());
  complete() { this.done.update(value => Math.min(this.total, value + 1)); }
}`,
    "The count stops at five, and the remaining value follows automatically. Two StudyProgress instances have independent signals unless their state is deliberately moved into a shared owner.",
    ["Local signal", "User action updates value", "Derived view refreshes"],
    "Do not put a temporary disclosure toggle or single-field draft into a global store merely because a store exists. Local ownership reduces coupling.",
    "How would you reset this component’s progress?",
    "Call done.set(0). remaining is computed, so it does not need a reset operation of its own.",
    "https://angular.dev/guide/signals",
  ),
  "state-management--shared-service-state": lesson(
    "Shared service state gives multiple consumers one coordinated owner. The state is shared only among consumers resolving the same provider instance.",
    [
      "A root-provided service is a common place for application-wide client state. A component or route provider can intentionally create a narrower owner.",
      "Expose readonly signals and meaningful mutation methods. This keeps validation and immutable update rules in one place instead of distributing them among templates.",
      "Persistence and remote synchronization are separate concerns. An in-memory service resets on a browser reload unless the application explicitly restores its data.",
    ],
    `import { Injectable, signal } from '@angular/core';
@Injectable({ providedIn: 'root' })
export class StudyGoal {
  private readonly hoursState = signal(3);
  readonly hours = this.hoursState.asReadonly();
  setHours(value: number) {
    if (!Number.isInteger(value) || value < 1 || value > 20) return;
    this.hoursState.set(value);
  }
}
// Both an editor and a summary inject StudyGoal.
// The editor calls setHours; the summary reads hours().`,
    "Both views observe one value when they share the root instance. Adding providers: [StudyGoal] to the editor creates a local instance and breaks that intentional sharing.",
    ["One provider instance", "Commands update state", "Multiple readonly consumers"],
    "Exposing a mutable object through a readonly signal does not make the object immutable. Avoid in-place nested updates and expose domain methods for changes.",
    "Why might two components inject the same class yet show different values?",
    "A nearer provider can create separate instances. Inspect component and route providers before assuming signal updates failed.",
    "https://angular.dev/guide/di/hierarchical-dependency-injection",
  ),
  "state-management--signals": lesson(
    "Signals hold values and notify tracked consumers when those values change. Angular can track a signal read in a template or computed calculation to connect changes with the relevant consumers.",
    [
      "A writable signal exposes set and update. Reading it uses function-call syntax, making reactive reads explicit.",
      "Default equality uses Object.is. Replacing an object or array creates a new identity; mutating its existing contents without a meaningful signal update can leave consumers stale.",
      "Signals model current values rather than the full history of events. Use RxJS when time, cancellation, or complex stream composition is central, and bridge the models deliberately.",
    ],
    `import { signal } from '@angular/core';
const courses = signal([{ id: 'angular', complete: false }]);
courses.update(items => items.map(course =>
  course.id === 'angular' ? { ...course, complete: true } : course
));
console.info(courses()[0].complete); // true
// Template reading a class field named courses:
// @for (course of courses(); track course.id) { ... }`,
    "update receives the current array and returns a replacement with a new matching course object. Consumers see an updated value without mutating the data retained by previous references.",
    ["Read current value", "Set or immutably update", "Notify tracked consumers"],
    "Calling courses().push(...) changes an array without notifying through the signal API. Return a new array from update instead.",
    "Does a signal replace every observable in an Angular application?",
    "No. A signal is useful for current state, while observables express asynchronous streams and operators such as debouncing and cancellation.",
    "https://angular.dev/guide/signals",
  ),
  "state-management--computed-state": lesson(
    "computed derives a readonly signal from other reactive values. It keeps related display values consistent without manually synchronizing additional writable state.",
    [
      "Computed values are lazy and memoized. Angular tracks the signals actually read during the calculation and invalidates the result when those dependencies change.",
      "Conditional calculations can have dynamic dependencies. A signal only read in one branch is tracked when that branch executes.",
      "Keep computations pure. They should calculate a value, not submit requests, update other signals, or mutate their inputs.",
    ],
    `import { computed, signal } from '@angular/core';
const hoursPerDay = signal(2);
const days = signal(5);
const weeklyHours = computed(() => hoursPerDay() * days());
const message = computed(() => weeklyHours() >= 10 ? 'Goal reached' : 'Keep planning');
console.info(weeklyHours(), message()); // 10, Goal reached
days.set(3);
console.info(weeklyHours(), message()); // 6, Keep planning`,
    "Changing days invalidates the derived total. The next read obtains six hours, and the message follows that total. No Effect copies the total into another writable signal.",
    ["Source signals", "Cached pure derivation", "Consistent summary"],
    "Using an Effect to write weeklyHours creates avoidable synchronization. Prefer computed when one value is fully determined by others.",
    "Can the consumer call weeklyHours.set(20)?",
    "No. A computed signal is readonly. Change the source signals or redesign ownership if the total needs to be independently editable.",
    "https://angular.dev/guide/signals",
  ),
  "state-management--effects": lesson(
    "An Effect performs side work in response to tracked signal changes. Use it to synchronize with an external system when a pure computed value is not enough.",
    [
      "An Effect tracks the signal reads made during its synchronous execution. Reads after an async boundary are not automatically tracked by that earlier execution.",
      "Create Effects in an injection context or provide the required injector explicitly. Component-owned Effects are cleaned up with their owner; register cleanup for resources each run creates.",
      "Effects are not the default mechanism for copying state. Prefer computed for derivations and event handlers for actions caused by a specific user event.",
    ],
    `import { Component, effect, signal } from '@angular/core';
@Component({ selector: 'app-root', standalone: true,
  template: '<button (click)="add()">Sessions: {{ sessions() }}</button>' })
export class App {
  readonly sessions = signal(0);
  constructor() {
    effect(onCleanup => {
      const current = this.sessions();
      const timer = setTimeout(() => console.info('Session count:', current), 300);
      onCleanup(() => clearTimeout(timer));
    });
  }
  add() { this.sessions.update(value => value + 1); }
}`,
    "The Effect schedules a delayed diagnostic log. A rerun or destruction clears the previous timer, preventing obsolete pending logs. This teaches cleanup; it is not a production analytics policy.",
    ["Tracked signal changes", "Run side work", "Clean up before replacement"],
    "Do not update a dependency in an Effect without a carefully justified model; feedback loops and extra work can result. Keep derived state computed.",
    "Why capture sessions() before starting the timer?",
    "The synchronous read establishes the Effect dependency and captures that run’s value. Reading only inside the later callback would not establish the same tracking relationship.",
    "https://angular.dev/guide/signals/effect",
  ),
  "state-management--ngrx-fundamentals": lesson(
    "NgRx Store coordinates application state through actions, reducers, and selectors. It can make complex cross-feature transitions explicit, but adds structure that a small local feature may not need.",
    [
      "An action names an event and carries its data. A reducer is a pure function that calculates the next state; it must not perform HTTP requests or mutate the current state.",
      "Selectors derive values from the store. Side effects belong in an Effects layer that can dispatch success and failure actions after asynchronous work.",
      "Install an NgRx version compatible with the practice workspace. Register reducers through provideStore; do not assume the Store becomes configured by importing its TypeScript symbols.",
    ],
    `import { createAction, createReducer, on, props } from '@ngrx/store';
export const lessonCompleted = createAction('[Planner] Lesson completed', props<{ id: string }>());
interface State { completedIds: string[]; }
const initialState: State = { completedIds: [] };
export const plannerReducer = createReducer(initialState,
  on(lessonCompleted, (state, { id }) => ({
    ...state,
    completedIds: state.completedIds.includes(id)
      ? state.completedIds : [...state.completedIds, id]
  }))
);
// After installing compatible @ngrx/store, add to app providers:
// provideStore({ planner: plannerReducer })`,
    "Dispatching lessonCompleted adds a previously unseen ID. The reducer preserves the original state and avoids duplicate completion entries. A selector can derive the count from completedIds.length.",
    ["Dispatch domain action", "Pure reducer transition", "Selectors feed components"],
    "Do not put every keystroke into Store by default. Keep transient local form state local unless cross-feature coordination requires otherwise.",
    "Where should saving completion to an API happen?",
    "In a side-effect layer that reacts to an action and reports success or failure through further actions. The reducer remains deterministic.",
    "https://ngrx.io/guide/store",
  ),
  "testing--unit-testing-fundamentals": lesson(
    "Unit tests verify a focused behavior with controlled inputs. Use pure tests for domain calculations and Angular’s TestBed when dependency injection or component rendering is part of the behavior.",
    [
      "This course uses the Vitest setup generated by current Angular CLI projects. Existing Karma/Jasmine workspaces have different setup conventions; do not mix assertion and mocking APIs accidentally.",
      "Arrange a known input, perform one meaningful action, and assert an observable result. Include boundary cases that can reveal incorrect rules.",
      "Keep tests independent and deterministic. Mock the narrow external boundary rather than replacing all the code whose behavior the test should verify.",
    ],
    `// progress.spec.ts in a CLI workspace configured for Vitest
import { describe, expect, it } from 'vitest';
function remaining(total: number, done: number) {
  return Math.max(0, total - done);
}
describe('remaining lessons', () => {
  it('subtracts completed lessons', () => { expect(remaining(5, 2)).toBe(3); });
  it('does not show a negative remainder', () => { expect(remaining(5, 8)).toBe(0); });
});
// Run with: npx ng test --no-watch`,
    "The first assertion checks normal behavior, while the second protects the lower bound. No DOM or injector is needed for this pure calculation. Move the function into a production module and import it when integrating the example.",
    ["Known input", "Focused behavior", "Observable assertion"],
    "A test that only checks a service or component exists rarely protects its useful behavior. Assert the outcome of a meaningful operation.",
    "When does a test need TestBed?",
    "When Angular facilities such as injected dependencies, compiled templates, or lifecycle-managed behavior are relevant. Pure functions can be tested directly.",
    "https://angular.dev/guide/testing",
  ),
  "testing--testing-components": lesson(
    "A component test verifies both class behavior and its template wiring. TestBed creates a fixture that lets the test interact with the rendered DOM.",
    [
      "Import a standalone component in the testing module rather than declaring it. The fixture exposes the instance, native element, and view-checking utilities.",
      "Trigger real DOM events to exercise event binding. Updating the class alone does not prove that the button is connected to the expected handler.",
      "Wait for scheduled work to settle when necessary. Explicit detectChanges can establish initial rendering; avoid masking missing production notifications by forcing every update in a test.",
    ],
    `import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expect, it } from 'vitest';
@Component({ standalone: true,
  template: '<button (click)="add()">Sessions: {{ count() }}</button>' })
class Counter {
  readonly count = signal(0);
  add() { this.count.update(value => value + 1); }
}
it('updates the rendered count after a click', async () => {
  await TestBed.configureTestingModule({ imports: [Counter] }).compileComponents();
  const fixture = TestBed.createComponent(Counter);
  fixture.detectChanges();
  const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
  button.click();
  await fixture.whenStable();
  expect(button.textContent).toContain('Sessions: 1');
});`,
    "The test clicks the same button a user would use. The assertion checks rendered text after Angular processes the signal update, so a disconnected click binding would fail the test.",
    ["Create fixture", "Interact with DOM", "Assert rendered result"],
    "Do not assert only fixture.componentInstance.count() when the requirement concerns visible text. Template wiring can be broken even when a method works.",
    "What extra test would protect a disabled-at-limit behavior?",
    "Click until the limit, wait for the view update, and assert both the count and the native button.disabled property.",
    "https://angular.dev/guide/testing/components-basics",
  ),
  "testing--testing-services": lesson(
    "Service tests verify domain behavior while controlling dependencies. TestBed can provide the real service and replace an external collaborator with a focused fake.",
    [
      "Configure providers before injecting the service so the correct dependency graph is created. A replacement must use the same token the service requests.",
      "A fake should implement the behavior needed for the test and expose useful observations. It need not imitate an entire production backend or framework.",
      "Assert the service’s public contract, including validation and failure behavior. Avoid reaching into private fields just to match an implementation detail.",
    ],
    `import { Injectable, InjectionToken, inject } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { expect, it, vi } from 'vitest';
const SAVE = new InjectionToken<(title: string) => void>('save');
@Injectable()
class Planner {
  private readonly save = inject(SAVE);
  submit(title: string) { if (title.trim()) this.save(title.trim()); }
}
it('normalizes the title before saving', () => {
  const save = vi.fn();
  TestBed.configureTestingModule({ providers: [Planner, { provide: SAVE, useValue: save }] });
  TestBed.inject(Planner).submit(' Angular ');
  expect(save).toHaveBeenCalledWith('Angular');
});`,
    "The real Planner runs its normalization rule, while the fake records the boundary call. Add a second case for whitespace-only input and assert that save is not called.",
    ["Provide controlled collaborator", "Invoke real service", "Check boundary behavior"],
    "Providing a fake under a different InjectionToken does not replace the dependency. Token identity must match exactly.",
    "Why is this preferable to mocking Planner.submit itself?",
    "Mocking the method under test would bypass its normalization rule. Replacing only the external save dependency preserves the behavior being verified.",
    "https://angular.dev/guide/testing/services",
  ),
  "testing--testing-http-requests": lesson(
    "Angular’s HTTP testing backend intercepts HttpClient requests and lets tests assert their shape and deliver controlled responses. It exercises request code without contacting a real server.",
    [
      "Provide HttpClient before provideHttpClientTesting so the testing provider replaces the transport backend correctly. Inject HttpTestingController to inspect pending requests.",
      "A request must be subscribed before expectOne can find it. Use firstValueFrom or a normal managed subscription, then flush the expected response.",
      "Verify there are no outstanding requests at the end of each test. Add separate cases for HTTP failures and response validation, not only a successful payload.",
    ],
    `import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { afterEach, expect, it } from 'vitest';
afterEach(() => TestBed.inject(HttpTestingController).verify());
it('loads the course list', async () => {
  TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
  const result = firstValueFrom(TestBed.inject(HttpClient).get('/api/courses'));
  const request = TestBed.inject(HttpTestingController).expectOne('/api/courses');
  expect(request.request.method).toBe('GET');
  request.flush([{ id: 'angular', title: 'Angular' }]);
  expect(await result).toEqual([{ id: 'angular', title: 'Angular' }]);
});`,
    "The testing controller receives the request, asserts its method, and returns a known list. In application tests, invoke the real CourseApi service instead of HttpClient directly to protect endpoint and mapping logic too.",
    ["Subscribe to request", "Assert intercepted request", "Flush and verify"],
    "Awaiting firstValueFrom before flushing leaves the promise waiting on the test itself. Start the promise, flush the request, then await the result.",
    "How do you simulate an HTTP 503 response?",
    'Use request.flush with a failure body and { status: 503, statusText: "Service Unavailable" }, then assert the service or UI’s intended error behavior.',
    "https://angular.dev/guide/http/testing",
  ),
  "testing--testing-routes": lesson(
    "RouterTestingHarness drives navigation through an Angular router configuration and exposes routed content. It helps verify parameter handling, redirects, and component activation.",
    [
      "Configure real route definitions with provideRouter and use standalone components as route targets. Keep the test’s routes focused on the behavior being checked.",
      "Await navigation before asserting routed DOM. Guards and resolvers can delay or redirect the requested navigation.",
      "Use integration-style tests for important route behavior, and pure tests for standalone policy functions where suitable. Do not duplicate the router implementation in mocks.",
    ],
    `import { Component, inject } from '@angular/core';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { RouterTestingHarness } from '@angular/router/testing';
import { expect, it } from 'vitest';
@Component({ standalone: true, template: '<h1>Course: {{ id }}</h1>' })
class Detail { id = inject(ActivatedRoute).snapshot.paramMap.get('id'); }
it('renders the requested course on initial navigation', async () => {
  TestBed.configureTestingModule({ providers: [provideRouter([
    { path: 'courses/:id', component: Detail }
  ])] });
  const harness = await RouterTestingHarness.create();
  await harness.navigateByUrl('/courses/angular', Detail);
  expect(harness.routeNativeElement?.textContent).toContain('Course: angular');
});`,
    "This test covers initial activation with an ID. To protect navigation between IDs while reusing the same component, change Detail to observe paramMap and add a second navigation assertion.",
    ["Configure routes", "Await harness navigation", "Inspect active route view"],
    "Asserting only that navigateByUrl was called does not prove that the destination activated or rendered the correct parameter.",
    "What should a guard redirect test assert?",
    "Assert the final activated page or URL and its visible result, not only the attempted protected URL.",
    "https://angular.dev/guide/routing/testing",
  ),
  "testing--end-to-end-testing": lesson(
    "End-to-end tests exercise an actual browser and running application. Keep a small set around critical flows that cross routing, templates, data, and deployment behavior.",
    [
      "Use a tool such as Playwright in the Angular practice workspace. Install its package and browser binaries, then configure a base URL and a server lifecycle.",
      "Prefer role-based locators and assertions that wait for visible outcomes. Hardcoded sleeps make tests slow and still fail under variable network or machine speed.",
      "Isolate test data and avoid dependencies on previous tests. Cover keyboard interactions and direct deep links in addition to pointer navigation.",
    ],
    `// tests/courses.spec.ts; requires @playwright/test and installed browsers
import { test, expect } from '@playwright/test';
test('the course index survives refresh', async ({ page }) => {
  await page.goto('http://localhost:4200/courses');
  await expect(page.getByRole('heading', { name: 'Your courses' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Your courses' })).toBeVisible();
});
// Run the Router Configuration example with npx ng serve first.
// Install tooling: npm install -D @playwright/test
// Install browsers: npx playwright install
// Run: npx playwright test`,
    "The test uses the earlier routing lesson’s heading and assumes its application is running on port 4200. A configured webServer in playwright.config.ts can automate startup for repeatable CI runs.",
    ["Real browser", "Navigate and refresh", "Assert visible workflow"],
    "A development server deep-link test does not validate production rewrite rules. Run a corresponding smoke check against the actual staging host.",
    "Why not test every pure pipe case through a browser?",
    "Pure unit tests are faster and more precise for formatting rules. Browser tests should concentrate on integration risks that smaller tests cannot detect.",
    "https://playwright.dev/docs/intro",
  ),
  "production-angular--application-architecture": lesson(
    "Organize an Angular application around feature ownership and clear dependency direction. Keep templates focused on presentation and isolate transport and domain rules behind meaningful APIs.",
    [
      "Feature folders can own their routes, components, services, and tests. Shared UI should not import feature-specific APIs or assume one route’s state model.",
      "Validate and normalize external data at a boundary. Downstream components should not repeatedly interpret raw response fields or HTTP status codes.",
      "Use provider scope as an architectural tool. A route-level state owner can isolate a workflow, while application-wide services should represent genuinely shared concerns.",
    ],
    `features/courses/
  courses.routes.ts
  courses-page.ts
  course-card.ts
  course-api.ts
  course-state.ts
  course-api.spec.ts
shared/ui/
  loading-indicator.ts
  empty-state.ts

# Dependency direction
# Page -> feature state / API -> HttpClient
# Page -> reusable UI
# Reusable UI must not import course-specific state`,
    "CoursesPage assembles the feature, CourseApi owns transport, and CourseCard accepts data and emits intent. Do not split all of these into separate files for a tiny prototype until the responsibility boundary is useful.",
    ["Feature entry and routes", "Domain and data boundary", "Reusable presentation"],
    "A shared folder can become a dependency tangle if everything is placed there by default. Share code because it has independent consumers and a coherent contract.",
    "Where would a backend field course_title become title?",
    "In a feature API adapter or domain mapper. Mapping once prevents transport naming from leaking through all templates.",
    "https://angular.dev/style-guide",
  ),
  "production-angular--change-detection": lesson(
    "Change detection checks whether template bindings need to update the view. Learn which changes notify Angular and how component boundaries affect the work performed.",
    [
      "Signals read in templates notify Angular when their values change. Template events, input changes, AsyncPipe, and explicit marking are also relevant update mechanisms.",
      "OnPush allows Angular to skip eligible subtrees, but it does not freeze a component. Its own notifications and changed inputs can still cause checking.",
      "Zoneless applications rely on supported notifications rather than assuming every asynchronous callback triggers a global check. Use reactive values and supported APIs instead of relying on incidental Zone.js behavior.",
    ],
    `import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
@Component({ selector: 'app-root', standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<button (click)="add()">Sessions: {{ count() }}</button>' })
export class App {
  readonly count = signal(0);
  add() { this.count.update(value => value + 1); }
}`,
    "The template reads count, and the event updates that signal. Angular can schedule the relevant view work even with OnPush. A plain field changed from an unmanaged asynchronous callback may need an explicit notification strategy.",
    ["Supported update notification", "Check affected views", "Commit changed bindings"],
    "Mutating an input object while retaining its reference can undermine expected OnPush updates. Prefer immutable replacement and explicit ownership.",
    "Does OnPush mean Angular never checks a component after its first render?",
    "No. It changes when subtrees are eligible to be skipped. Signals, events, input changes, and other supported notifications still drive updates.",
    "https://angular.dev/guide/zoneless",
  ),
  "production-angular--performance-optimization": lesson(
    "Optimize a measured user-visible bottleneck rather than adding complexity preemptively. Loading, computation, DOM size, and browser layout can all dominate a screen’s performance.",
    [
      "Measure a repeatable interaction with realistic data. Angular DevTools shows framework work, while browser tools reveal network, scripting, layout, and paint.",
      "Use stable @for tracking to preserve row identity, lazy routes to defer feature code, and computed values for appropriate derivations. Large lists may need virtualization.",
      "Defer optional below-the-fold content with @defer when its dependencies are eligible. Define accessible placeholders and loading states so waiting is understandable.",
    ],
    `<!-- Template excerpt: import a standalone ProgressChart component -->
<h1>Study dashboard</h1>
@defer (on viewport) {
  <progress-chart />
} @placeholder {
  <div class="chart-placeholder">Progress chart appears when you reach this section.</div>
} @loading (after 100ms; minimum 300ms) {
  <p role="status">Loading chart…</p>
} @error {
  <p>Chart could not load. Refresh to retry.</p>
}`,
    "The single-root placeholder provides the viewport trigger target. Eligible standalone chart code can load when that region approaches visibility. Keep placeholder dimensions stable to reduce layout shift.",
    ["Measure slow path", "Defer or reduce actual work", "Compare user-visible result"],
    "Do not defer essential first-screen content merely to lower an initial bundle number. A faster shell that delays the primary task can feel slower.",
    "Why might a large template filter still be slow with OnPush?",
    "OnPush does not make expensive work cheap when a check is necessary. Reduce or cache the computation and consider reducing the rendered item count.",
    "https://angular.dev/guide/templates/defer",
  ),
  "production-angular--accessibility": lesson(
    "Accessible Angular interfaces retain semantic HTML and handle dynamic changes intentionally. Native controls, clear names, keyboard behavior, and visible focus are core requirements.",
    [
      "Prefer buttons for actions and anchors for navigation. ARIA can describe semantics but does not implement keyboard behavior or focus management by itself.",
      "Link labels and descriptions with unique IDs. Errors should explain a correction and be understandable without relying only on color.",
      "When navigation or dialogs replace content, decide where focus should move and return. Test with a keyboard and assistive technology alongside automated checks.",
    ],
    `import { Component, signal } from '@angular/core';
@Component({ selector: 'app-root', standalone: true,
  template: '<button [attr.aria-expanded]="open()" aria-controls="study-help" (click)="toggle()">Study help</button><div id="study-help" [hidden]="!open()"><p>Start with one lesson and write a short summary.</p></div>' })
export class App {
  readonly open = signal(false);
  toggle() { this.open.update(value => !value); }
}`,
    "The native button is keyboard operable. aria-expanded reports its state, and aria-controls points to the help region. For reusable repeated instances, supply unique IDs instead of repeating study-help.",
    ["Semantic control", "Keyboard action", "Accurate accessible state"],
    "Do not remove focus outlines without a clear replacement. A visually hidden or collapsed region must also have the intended keyboard and assistive-technology behavior.",
    "Does aria-expanded open the help region by itself?",
    "No. It communicates state. The component’s open signal and hidden binding implement the actual visibility behavior.",
    "https://angular.dev/best-practices/a11y",
  ),
  "production-angular--security": lesson(
    "Angular’s template protections are one part of application security. Safe data handling, server authorization, dependency maintenance, and deployment policies still matter.",
    [
      "Prefer interpolation for untrusted text. Angular sanitizes certain bound values according to their context, but a deliberately trusted bypass removes important protections.",
      "Never build executable Angular templates from user input. Avoid direct DOM insertion and review every use of bypassSecurityTrust APIs with a clear trust boundary.",
      "Frontend code, configuration, and route guards are inspectable and modifiable by users. Keep secrets and permission enforcement on the server; consider CSP and Trusted Types in the deployment policy.",
    ],
    `import { Component, input } from '@angular/core';
@Component({ selector: 'course-note', standalone: true,
  template: '<h2>Student note</h2><p>{{ text() }}</p>' })
export class CourseNote {
  readonly text = input('');
}
// A caller can pass untrusted note text as data.
// Text resembling HTML is displayed as text, not compiled as a template.`,
    "The note is interpolated into a text context. It does not become a script or a dynamically compiled component. If rich content is required, define and enforce a narrow, reviewed content policy.",
    ["Untrusted data", "Context-aware safe binding", "Server-enforced permissions"],
    "Do not call bypassSecurityTrustHtml simply to silence sanitization or to make arbitrary HTML work. The bypass is a trust assertion, not a sanitizer.",
    "Can hiding a delete button prevent unauthorized deletion?",
    "No. The backend must authorize the deletion request independently, because the user can call the endpoint without using that button.",
    "https://angular.dev/best-practices/security",
  ),
  "production-angular--server-side-rendering": lesson(
    "Server-side rendering creates initial HTML on the server, while hydration connects client behavior to compatible markup. Choose rendering modes according to content, personalization, and hosting needs.",
    [
      "Prerendering generates pages at build time, SSR generates them at request time, and client rendering builds them in the browser. Angular supports combining modes by route in suitable configurations.",
      "Server execution has no browser window, document, or localStorage. Keep browser-only work behind appropriate platform APIs or browser render callbacks.",
      "Hydration depends on consistent server and client structure. Avoid direct DOM rewrites and unstable initial values that cause mismatched markup.",
    ],
    `# In the Angular practice workspace
npx ng add @angular/ssr
npx ng build

// Browser-only enhancement in a component:
import { Component, afterNextRender } from '@angular/core';
@Component({ selector: 'app-root', standalone: true, template: '<h1>Course planner</h1>' })
export class App {
  constructor() {
    afterNextRender(() => {
      console.info('Browser viewport:', window.innerWidth);
    });
  }
}`,
    "The CLI adds framework-supported rendering configuration. The callback performs browser work after rendering and does not run as ordinary server rendering work. Inspect the generated scripts and output to select the correct server or static hosting approach.",
    ["Server or prerendered HTML", "Client hydration", "Browser interactions"],
    "Do not assume a client-only storage read is safe in a class initializer. That initializer can execute on the server when SSR is enabled.",
    "Why can Date.now() in initial markup cause trouble during hydration?",
    "The server and client may compute different values. Transfer a stable initial value or defer browser-specific display until after hydration as appropriate.",
    "https://angular.dev/guide/ssr",
  ),
  "production-angular--build-and-deployment": lesson(
    "A release needs a reproducible build, correct hosting behavior, and checks against the actual deployed artifact. The appropriate host depends on whether the application is static, server-rendered, or hybrid.",
    [
      "Use the committed lockfile in CI and run tests and production compilation. Read angular.json and the build summary to identify the actual browser and server output paths.",
      "Configure deep-link handling for a client app, base paths for subdirectory deployment, and API routing separately. A successful click does not prove a pasted nested URL works.",
      "Review bundle budgets and cache policy. Keep deployment artifacts consistent so open clients can still load required chunks, and prepare a tested rollback path.",
    ],
    `# CI from a clean checkout
npm ci
npx ng test --no-watch
npx ng build --configuration production

# Verify the deployed environment
# - Open /courses directly and refresh a nested course URL.
# - Check asset paths, HTTPS, and API configuration.
# - Exercise one successful and one failed request.
# - Check keyboard navigation and narrow-screen layout.
# - Confirm the previous release can be restored.`,
    "Serve the generated browser output for a static app, or deploy the required server runtime for SSR. Output directories differ by builder and project settings, so use the actual build configuration rather than copying an assumed dist path.",
    ["Reproducible build", "Mode-appropriate hosting", "Smoke checks and monitoring"],
    "Do not deploy ng serve as a production architecture or put secrets in client environment files. Client configuration is part of the public application.",
    "A deep link returns 404 only after refresh. What should you inspect?",
    "Inspect host fallback or server rendering routes. The first request reaches the host before Angular can match the route in the browser.",
    "https://angular.dev/tools/cli/deployment",
  ),
};
