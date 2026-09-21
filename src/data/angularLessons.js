import { lesson } from "./angularLessonSchema.js";
import { angularServicesLessons } from "./angularLessonsServices.js";
import { angularFormsLessons } from "./angularLessonsForms.js";
import { angularProductionLessons } from "./angularLessonsProduction.js";

export const angularLessons = {
  ...angularServicesLessons,
  ...angularFormsLessons,
  ...angularProductionLessons,
  "welcome--course-introduction": lesson(
    "Build a course planner while learning how Angular connects templates, components, dependency injection, and reactive data. The course moves from a static card to a routed, validated, tested application.",
    [
      "Begin with semantic HTML, CSS, JavaScript functions and collections, and basic TypeScript types. Angular templates are HTML-based expressions, not React JSX; component classes provide their data and behavior.",
      "Examples use modern standalone Angular, signal-based state, and built-in template control flow. Traditional template-driven and reactive forms are covered because existing applications and libraries widely use them.",
      "Run the code in a separate Angular CLI practice workspace. Each lesson identifies partial excerpts or supporting files. The interactive diagrams on this learning site simulate the concept; they are not an Angular code execution sandbox.",
    ],
    `import { Component } from '@angular/core';
@Component({
  selector: 'app-root',
  standalone: true,
  template: '<h1>My course planner</h1><p>{{ course.title }}: {{ course.status }}</p>'
})
export class App {
  course = { id: 'angular', title: 'Angular', status: 'In progress' };
}`,
    "Use this as the root component after the environment setup lesson. The template reads the course object and displays its title and status. Change the status and rebuild to see how data determines the output.",
    ["Describe a course", "Add interactive behavior", "Deliver a tested planner"],
    "Do not paste Angular decorators into this site’s React source or install Angular into the learning site. The examples belong in the separate practice application.",
    "Which parts of the planner should become reusable components?",
    "A course card, a search input, and a progress summary have clear responsibilities. Start with the card and introduce the others when the page needs them.",
  ),
  "welcome--angular-learning-roadmap": lesson(
    "Learn Angular in layers: render data, handle interaction, coordinate dependencies, navigate between screens, and manage asynchronous work. Each layer should solve a problem you can demonstrate.",
    [
      "First build a standalone component with inputs and a template. Then practice bindings and control flow until you can predict what appears for empty and populated data.",
      "Add a service when multiple components need one behavior or state owner. Learn injector scope before assuming every service is a single global instance.",
      "Forms, routing, HTTP, and RxJS introduce lifetimes and failure paths. Finish with signals, tests, change detection, accessibility, and deployment checks using the same planner domain.",
    ],
    `const milestones = [
  { id: 'render', result: 'A reusable course card' },
  { id: 'interact', result: 'An editable study goal' },
  { id: 'coordinate', result: 'A routed course catalog' },
  { id: 'connect', result: 'Validated forms and HTTP data' },
  { id: 'deliver', result: 'Tests and a production build' }
];`,
    "Treat each result as a checkpoint. Keep the previous checkpoint working while adding the next feature. For the HTTP milestone, test both a successful response and a failed one before moving on.",
    ["Components and bindings", "Services, routes, and data", "Verification and release"],
    "Learning operators or decorators by name without using them in a feature leaves their lifecycle rules unclear. Explain who creates, updates, and destroys each resource.",
    "What should you understand before adopting a global state library?",
    "Understand local component state, service scope, signals, immutable updates, and one-way data flow. Introduce a store when coordination requirements justify it.",
  ),
  "welcome--development-environment-setup": lesson(
    "Create an isolated Angular practice project with the CLI. Let the generated workspace establish compatible tooling rather than manually combining unrelated package versions.",
    [
      "Check Angular’s compatibility table for supported Node.js, TypeScript, and RxJS versions. The CLI version determines available features and generated defaults.",
      "A new standalone workspace contains application bootstrap, configuration, routes, and tests. Keep its generated configuration until you understand the responsibility of each file.",
      "The development server supports editing feedback. Production output, tests, and deployment are separate checks, and the lockfile makes dependency installation reproducible.",
    ],
    `# Terminal: create a NEW practice directory
npx @angular/cli@latest new angular-planner --standalone --routing --style=css
cd angular-planner
npx ng serve

# Verify the workspace
npx ng version
npx ng test --no-watch
npx ng build`,
    "Open the local URL printed by ng serve and edit the generated root template. If prompted about server rendering, a client-rendered setup is enough for the early lessons; the SSR chapter explains when to add it.",
    ["Compatible runtime", "CLI workspace", "Serve, test, build"],
    "Do not scaffold over an existing repository. Also do not assume a system-wide ng executable matches the project; npx ng uses the installed workspace tooling.",
    "Why commit package-lock.json with the practice app?",
    "It records resolved dependency versions so CI and other machines can use npm ci to reproduce the installation.",
    "https://angular.dev/installation",
  ),
  "angular-foundations--what-is-angular": lesson(
    "Angular is a web application framework with an integrated component model, compiler, dependency injection system, router, and forms and HTTP libraries. These pieces provide common conventions for application teams.",
    [
      "A component combines a TypeScript class with metadata and an HTML template. Angular evaluates template bindings against the component instance and renders the resulting view.",
      "The compiler understands Angular template syntax and can check types across component inputs and template expressions. TypeScript types still do not validate network data at runtime.",
      "Framework services support shared capabilities, but the architecture still needs intentional boundaries. A component should not own every request, transformation, and business rule in the application.",
    ],
    `import { Component, signal } from '@angular/core';
@Component({
  selector: 'app-root', standalone: true,
  template: '<h1>{{ title() }}</h1><button (click)="rename()">Rename planner</button>'
})
export class App {
  title = signal('Course planner');
  rename() { this.title.set('Angular study planner'); }
}`,
    "The title signal supplies text to the template. Clicking calls a class method, which updates the signal and notifies Angular that the displayed value has changed.",
    ["Component class", "Compiled template bindings", "Rendered browser view"],
    "Angular and AngularJS are different frameworks. AngularJS examples using controllers and scope do not teach the modern component and standalone application model.",
    "What extra value does Angular provide beyond a templating library?",
    "It supplies coordinated application facilities such as dependency injection, routing, forms, compilation, and tooling. Teams still choose how to organize their domain features.",
  ),
  "angular-foundations--angular-cli": lesson(
    "The Angular CLI manages workspace creation, code generation, serving, testing, and building. Learn what each command changes so generated code remains understandable.",
    [
      "ng generate creates files using workspace schematics and defaults. Inspect the generated component instead of assuming its file names match an older tutorial.",
      "ng serve builds for development and watches for changes. ng build creates deployment artifacts according to the selected builder and configuration in angular.json.",
      "Use ng update for framework migrations with a clean, backed-up working tree. Review migration diffs and run tests; an automated migration is not proof of behavior compatibility.",
    ],
    `# From the Angular practice workspace
npx ng generate component features/courses/course-card
npx ng generate service features/courses/course-catalog
npx ng serve
npx ng test --no-watch
npx ng build --configuration production

# Inspect supported options before generating
npx ng generate component --help`,
    "Generate a course card and service, then inspect their imports and metadata. Serving checks local behavior, tests check expected results, and the production build checks the configured deployment compilation.",
    ["Command and workspace config", "Generate or compile", "Inspect resulting files"],
    "Do not add arbitrary Vite plugins to an Angular CLI workspace because its development server uses Vite internally. Configure the supported Angular builder surface.",
    "Where do you investigate a build output path?",
    "Read the project’s build target and its options in angular.json, then compare them with the CLI build output.",
    "https://angular.dev/tools/cli",
  ),
  "angular-foundations--workspace-and-project-structure": lesson(
    "A workspace separates application source from build and tool configuration. Organize feature files so related components, data access, and tests can evolve together.",
    [
      "main.ts starts the browser application. Root application configuration provides capabilities such as routing and HTTP; route definitions describe navigation paths.",
      "Component classes, templates, styles, and specs may be separate files or use inline templates for small examples. Generated naming conventions depend on the CLI version.",
      "Feature folders provide an ownership boundary. Shared UI should stay independent of feature-specific API services, while feature containers assemble data and presentation.",
    ],
    `src/
  main.ts
  app/
    app.ts
    app.html
    app.config.ts
    app.routes.ts
    features/
      courses/
        course-card.ts
        course-card.html
        course-catalog.ts
        course-card.spec.ts
angular.json
tsconfig.json`,
    "The tree is an illustrative layout, not a requirement to rename generated files. A course container can inject CourseCatalog and pass course data into CourseCard; the card need not know the endpoint URL.",
    ["Workspace configuration", "Application entry", "Feature-owned modules"],
    "Avoid putting every service into an unstructured global folder or creating circular imports between features. A shared folder is not a substitute for clear ownership.",
    "Where should a course API response be converted into a display model?",
    "At a feature data boundary or adapter. Converting once avoids repeating transport-specific field handling in every template.",
    "https://angular.dev/reference/configs/file-structure",
  ),
  "angular-foundations--bootstrapping-an-application": lesson(
    "Bootstrapping creates the root application environment and attaches the root component to its host element. In a standalone application, bootstrapApplication receives the component and application-level providers.",
    [
      "The root selector must match an element in index.html. If the selector is app-root, the document needs an app-root host.",
      "Application providers configure services available to the application environment. Template imports belong in component imports; importing RouterOutlet does not itself configure routes.",
      "Keep startup failures observable. A rejected bootstrap promise should be reported rather than hidden behind a blank page.",
    ],
    `// main.ts; index.html contains <app-root></app-root>
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { App } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [provideRouter(routes), provideHttpClient()]
}).catch(error => console.error('Application startup failed', error));`,
    "App must be a standalone component and routes must export a Routes array. Angular creates the environment injector, resolves configured services, and renders App into the matching host.",
    ["Host element", "Application providers", "Root component"],
    "Do not bootstrap each card separately. Normal components live within the root application tree and share its configured environment.",
    "Why can a component import RouterOutlet yet still need provideRouter?",
    "The import makes the directive available in the template. provideRouter installs routing services and route configuration into dependency injection.",
    "https://angular.dev/api/platform-browser/bootstrapApplication",
  ),
  "angular-foundations--standalone-components": lesson(
    "Standalone components declare their own template dependencies. They can be imported directly by other standalone components without being declared in an NgModule.",
    [
      "The imports array contains components, directives, pipes, or compatible NgModules used by the template. A TypeScript import alone does not make a component selector usable in HTML.",
      "Providers describe injectable dependencies and their scope; imports describe template capabilities. They solve separate problems even when both appear in component metadata.",
      "Examples explicitly use standalone: true for clarity. Existing NgModule applications can interoperate with standalone components and migrate incrementally.",
    ],
    `import { Component, input } from '@angular/core';
@Component({ selector: 'course-card', standalone: true,
  template: '<h2>{{ title() }}</h2>' })
export class CourseCard { title = input.required<string>(); }

@Component({ selector: 'app-root', standalone: true,
  imports: [CourseCard],
  template: '<course-card title="Angular" />' })
export class App {}`,
    "App imports the card in metadata and supplies its required title. The card reads the input signal with title(). Leaving out the required input is a template-checking error.",
    ["Import dependency", "List in component imports", "Use selector in template"],
    "Do not put a standalone component in an NgModule declarations array. Import it where it is needed.",
    "Does importing a component create a global service instance?",
    "No. Template availability and DI provider scope are separate. Inspect provider declarations to determine service ownership.",
    "https://angular.dev/guide/components/importing",
  ),
  "angular-foundations--angular-developer-tools": lesson(
    "Angular DevTools connects rendered UI to component instances, injector relationships, and change-detection activity. Use it alongside browser network and performance panels.",
    [
      "Inspect the component tree to locate the owner of a displayed value. The DOM tree alone cannot explain which component input or service supplies that value.",
      "Use injector inspection to investigate service scope. Two components showing independent values may have separate local providers rather than a broken global store.",
      "Profile a short repeatable interaction. Development overhead affects timings, so confirm improvements with representative builds and data rather than optimizing every detected check.",
    ],
    `import { Component, signal } from '@angular/core';
@Component({ selector: 'app-root', standalone: true,
  template: '<button (click)="add()">Sessions: {{ sessions() }}</button>' })
export class App {
  sessions = signal(0);
  add() { this.sessions.update(value => value + 1); }
}`,
    "Select App in DevTools, click the button, and inspect sessions. Record the click in the profiler and compare the component update with the changed DOM text. Use a development build compatible with the extension.",
    ["Select component", "Inspect state and injectors", "Profile interaction"],
    "Do not interpret every component check as a full DOM replacement. A check can determine that no visible value changed.",
    "Which browser panel helps when a slow screen is waiting on the API?",
    "The Network panel reveals request timing and responses. Angular profiling covers framework work, so use both to distinguish waiting from rendering cost.",
    "https://angular.dev/tools/devtools",
  ),
  "components-and-templates--creating-components": lesson(
    "A component defines a focused UI boundary with a selector, template, and class. Inputs accept data, outputs report intent, and internal state supports the component’s own interaction.",
    [
      "Choose a selector and input API that explain the component’s purpose. A card should receive course information rather than reaching into an unrelated global object.",
      "Signal inputs are read-only to the child. Use an output event to ask the owner to change shared state instead of mutating an input object.",
      "Component styles normally use Angular’s encapsulation behavior. Keep layout responsibility clear between the parent container and the child’s internal content.",
    ],
    `import { Component, input, output } from '@angular/core';
@Component({ selector: 'course-card', standalone: true,
  template: '<article><h2>{{ title() }}</h2><button (click)="selected.emit()">Select</button></article>' })
export class CourseCard {
  title = input.required<string>();
  selected = output<void>();
}
// Parent imports CourseCard and uses:
// <course-card title="Angular" (selected)="openCourse()" />`,
    "The parent supplies a title and decides what selecting means. CourseCard emits an event without knowing whether its owner opens a dialog, changes selection, or navigates.",
    ["Input data", "Component view", "Output intent"],
    "Avoid an all-purpose component with many unrelated flags. Extract separate responsibilities or use content projection when the caller should supply markup.",
    "How would the card report which course was selected?",
    "Accept an ID input and declare selected = output<string>(). Emit the ID from the click handler; the parent receives it through $event.",
    "https://angular.dev/guide/components/outputs",
  ),
  "components-and-templates--template-syntax": lesson(
    "Angular templates extend HTML with expressions, bindings, control flow, and local variables. Expressions read from the component instance and the current template context.",
    [
      "Interpolation uses double braces for text. Signals are getter functions, so read a signal with title(), while a plain string property is read as title.",
      "Bindings are expressions rather than a place for arbitrary statements or expensive business logic. Move complex transformations into a computed value or a pure domain function.",
      "Templates have limited expression syntax and special variables such as $event in event handlers. Use the compiler and language service to catch invalid property access early.",
    ],
    `import { Component, computed, signal } from '@angular/core';
@Component({ selector: 'app-root', standalone: true,
  template: '<h1>{{ title }}</h1><p>{{ completed() }} of {{ total }} complete</p><p>{{ percent() }}%</p>' })
export class App {
  title = 'Angular planner';
  total = 8;
  completed = signal(2);
  percent = computed(() => Math.round(this.completed() / this.total * 100));
}`,
    "title is a plain property, completed is a signal, and percent is derived state. The template displays 2 of 8 complete and 25% without containing the calculation itself.",
    ["Component values", "Template expressions", "Rendered text"],
    "Writing {{ completed }} for a signal references the function rather than its current value. Use {{ completed() }}.",
    "Where should a complicated course eligibility rule live?",
    "In a class method, computed state, or a domain function with tests. Keep the template focused on displaying its result.",
    "https://angular.dev/guide/templates/expression-syntax",
  ),
  "components-and-templates--property-binding": lesson(
    "Property binding sends a component expression into an element property or a child input. Brackets evaluate the expression instead of passing literal text.",
    [
      '[disabled] controls the button’s boolean property. A literal disabled="false" still represents a present HTML boolean attribute and does not mean enabled.',
      "Use [attr.name] when explicitly binding an attribute such as an ARIA value. Use [class.name] or style bindings for focused visual state.",
      "Child input bindings use the same bracket syntax. The child declares its public input, and the parent remains the owner of the supplied value.",
    ],
    `import { Component, signal } from '@angular/core';
@Component({ selector: 'app-root', standalone: true,
  template: '<button [disabled]="saving()" [attr.aria-busy]="saving()">Save plan</button><button (click)="toggle()">Toggle pending</button>' })
export class App {
  saving = signal(false);
  toggle() { this.saving.update(value => !value); }
}`,
    "Toggle pending changes the saving signal. The first button becomes disabled and reports its busy state. This is a binding demonstration, not an actual save request.",
    ["Parent expression", "Bound property/input", "Updated element behavior"],
    'Do not interpolate a boolean into an attribute when the native property is what you mean. Prefer [disabled]="saving()".',
    'What is the difference between title="course.title" and [title]="course.title"?',
    "The first supplies the literal characters course.title. The second evaluates the property and supplies its value.",
    "https://angular.dev/guide/templates/binding",
  ),
  "components-and-templates--event-binding": lesson(
    "Event binding connects a DOM event or component output to an action. Parentheses name the event; the expression describes the handler to run when it occurs.",
    [
      "Use native button and form events to preserve keyboard behavior. A click handler on a non-interactive element does not automatically supply button semantics.",
      "$event contains the event or emitted output payload. Type DOM handlers explicitly and narrow event.target before reading input-specific properties.",
      "Keep asynchronous failures inside the handler’s error path or a dedicated service. A template event expression should delegate substantial work to a method.",
    ],
    `import { Component, signal } from '@angular/core';
@Component({ selector: 'app-root', standalone: true,
  template: '<label>Search <input (input)="onInput($event)" /></label><p>Searching: {{ query() }}</p>' })
export class App {
  query = signal('');
  onInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.query.set(input.value);
  }
}`,
    "Typing emits an input event, the method reads the input value, and the signal updates the preview. The cast is valid for this known input target; reusable handlers should check uncertain targets.",
    ["DOM event", "Typed handler", "State update"],
    'Do not confuse (click)="save()" with property binding. It runs on the event, not while Angular is evaluating ordinary display bindings.',
    "How do you listen for Enter specifically?",
    'Use a key modifier such as (keyup.enter)="submit()", or preferably a semantic form submission for a form workflow.',
    "https://angular.dev/guide/templates/event-listeners",
  ),
  "components-and-templates--two-way-binding": lesson(
    "Two-way binding combines a value flowing into a control with a change flowing back to its owner. The bracket-parenthesis syntax is a compact form of that pair.",
    [
      "For ngModel, import FormsModule in the standalone component. The directive synchronizes a supported form control with its model value.",
      "Inside a form, give an ngModel control a name so it registers with the form. For reusable components, model inputs support an input and associated change event.",
      "Two-way syntax does not remove ownership decisions. Avoid multiple competing writers that independently modify the same value without a defined flow.",
    ],
    `import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
@Component({ selector: 'app-root', standalone: true,
  imports: [FormsModule],
  template: '<label>Study topic <input [(ngModel)]="topic" /></label><p>{{ topic }}</p><button (click)="reset()">Reset</button>' })
export class App {
  topic = 'Angular';
  reset() { this.topic = 'Angular'; }
}`,
    "Typing updates topic, and assigning topic through Reset updates the input. Both directions refer to the same model. This small example is outside a form, so it does not need form registration.",
    ["Model value", "Control displays value", "Change updates model"],
    "Missing FormsModule makes ngModel unavailable to the template. A TypeScript import that is never listed in imports is insufficient.",
    'What is the longer form of [(ngModel)]="topic"?',
    'It is [ngModel]="topic" together with (ngModelChange)="topic = $event". The value and change event form the two directions.',
    "https://angular.dev/guide/templates/two-way-binding",
  ),
  "components-and-templates--template-variables": lesson(
    "Template reference variables give a name to an element, component, or exported directive within a template scope. They are useful for focused UI operations and reading directive state.",
    [
      "A reference such as #notes on an input normally refers to the native element. A reference on a component refers to its component instance.",
      'A directive can expose an exportAs name. #form="ngForm" refers to the form directive, making validity and submission state available to the template.',
      "References are scoped to their template view. A variable declared inside a control-flow block is not automatically available outside that block.",
    ],
    `import { Component } from '@angular/core';
@Component({ selector: 'app-root', standalone: true,
  template: '<label>Notes <input #notes /></label><button (click)="notes.focus()">Focus notes</button>' })
export class App {}`,
    "The reference points to the input. The button invokes its focus method when clicked. This focused browser action does not require querying the document by a hardcoded ID.",
    ["Local reference", "Element or directive instance", "Template interaction"],
    "Do not use a template reference as a substitute for reactive state across the whole application. References identify view objects, not a global data store.",
    "Why can a reference inside @if disappear?",
    "The conditional view may be destroyed. Its local reference exists only while that view is present, so access must respect that lifetime.",
    "https://angular.dev/guide/templates/variables",
  ),
  "components-and-templates--content-projection": lesson(
    "Content projection lets a wrapper define layout while its caller supplies content. ng-content marks where caller-owned markup appears in the component’s view.",
    [
      "A default ng-content slot receives unmatched content. Selectors can define named placement areas using attributes or element selectors.",
      "Projected expressions are evaluated in the caller’s context, not the wrapper’s class. The wrapper should not assume ownership of the caller’s state.",
      "ng-content is a compiler placeholder, not an ordinary DOM element. Use template fragments when content needs conditional instantiation rather than assuming conditional projection defers its creation.",
    ],
    `import { Component } from '@angular/core';
@Component({ selector: 'study-panel', standalone: true,
  template: '<section><header><ng-content select="[panel-title]" /></header><ng-content /></section>' })
export class StudyPanel {}

@Component({ selector: 'app-root', standalone: true, imports: [StudyPanel],
  template: '<study-panel><h2 panel-title>Today</h2><p>Complete the Angular lesson.</p></study-panel>' })
export class App {}`,
    "The heading matches the selected title slot, and the paragraph goes into the default slot. StudyPanel provides structure while the parent decides the exact content.",
    ["Caller-owned content", "Matching projection slots", "Reusable wrapper layout"],
    "Do not put every possible panel body behind boolean flags. Projection keeps the wrapper independent of course-specific markup.",
    "Which component owns an interpolated variable inside the projected paragraph?",
    "The component whose template declares the paragraph. Projection moves where the content appears, not the expression’s owner.",
    "https://angular.dev/guide/components/content-projection",
  ),
  "directives-and-pipes--built-in-control-flow": lesson(
    "Built-in template blocks choose, repeat, or switch content without importing legacy structural directives. Use @if, @for, and @switch to make display states explicit.",
    [
      "@if selects a branch and destroys inactive views. Use @else to make the alternative visible, especially for loading, empty, and error conditions.",
      "@for needs a tracking expression that identifies items. Prefer a stable domain ID over an index when items can move or be removed.",
      "@empty belongs with @for and describes a successfully empty collection. It is not a substitute for separately modeled loading state.",
    ],
    `<!-- Template excerpt; courses is an array of { id, title } -->
@if (loading()) {
  <p role="status">Loading courses…</p>
} @else {
  <ul>
    @for (course of courses(); track course.id) {
      <li>{{ course.title }}</li>
    } @empty {
      <li>No courses yet.</li>
    }
  </ul>
}`,
    "The loading signal controls the outer branch. Once false, Angular repeats items and associates each row with its course ID. An empty array displays the empty message rather than an indefinite loading indicator.",
    ["Evaluate condition", "Track item identity", "Render matching views"],
    "Tracking a mutable list by $index can associate existing DOM state with a different item after reordering. Track the item’s stable ID.",
    "Does @if merely hide its inactive content with CSS?",
    "No. It removes the inactive view, so child component state and subscriptions tied to that view can be destroyed.",
    "https://angular.dev/guide/templates/control-flow",
  ),
  "directives-and-pipes--attribute-directives": lesson(
    "An attribute directive attaches behavior or presentation to an existing element. It does not require a new component template or create an independent region of markup.",
    [
      "Use a directive when the same element behavior is reused across different components, such as a consistent visual emphasis or keyboard interaction.",
      "Host bindings describe properties, classes, styles, and events on the element hosting the directive. They keep DOM behavior in Angular’s binding model.",
      "Import a standalone directive in every standalone component template that uses it. The attribute selector must match the markup.",
    ],
    `import { Directive, input } from '@angular/core';
@Directive({ selector: '[studyHighlight]', standalone: true,
  host: { '[style.backgroundColor]': 'studyHighlight()', '[style.color]': '"#111"' } })
export class StudyHighlight {
  studyHighlight = input('#fff2b3');
}
// Import StudyHighlight in the consuming component.
// <p studyHighlight="#d4f5dd">Recommended next lesson</p>`,
    "The directive changes the host paragraph’s styling without wrapping it. Its input controls the color, while the paragraph content still belongs to the consuming component.",
    ["Existing host element", "Directive bindings", "Reusable element behavior"],
    "Do not add an attribute directive when a normal class binding solves a one-off styling need. Abstraction should serve reuse or meaningful behavior.",
    "Why is a directive preferable to a component for this example?",
    "It enhances the existing paragraph and has no independent template. A wrapper component would introduce unnecessary structure.",
    "https://angular.dev/guide/directives/attribute-directives",
  ),
  "directives-and-pipes--structural-directives": lesson(
    "Structural directives create or remove embedded views. Modern built-in control flow covers common conditions and loops, but understanding TemplateRef and ViewContainerRef helps when reading custom or older applications.",
    [
      "A template is a blueprint that can be instantiated as an embedded view. TemplateRef identifies that blueprint; ViewContainerRef manages where its instances live.",
      "The star syntax is shorthand that Angular expands into an ng-template. Only one shorthand structural directive fits on one element; use nested containers for multiple structural layers.",
      "Prefer @if and @for for new ordinary control flow. Custom structural directives make sense when they encapsulate a distinct view-instantiation policy.",
    ],
    `<!-- Equivalent custom-directive forms; studyWhen is implemented next -->
<p *studyWhen="ready()">Start studying</p>

<ng-template [studyWhen]="ready()">
  <p>Start studying</p>
</ng-template>`,
    "Both forms pass a condition and a paragraph blueprint to studyWhen. The directive decides when to instantiate that blueprint. It does not change the browser’s CSS display property to simulate removal.",
    ["Template blueprint", "Directive decides lifetime", "Embedded view instance"],
    "Do not place two star-prefixed directives on the same element. Also avoid treating a display condition as authorization; protected data requires server enforcement.",
    "What happens to an input’s local DOM state when its embedded view is destroyed?",
    "That DOM instance is removed. Preserve any draft that must survive in a state owner outside the removed view.",
    "https://angular.dev/guide/directives/structural-directives",
  ),
  "directives-and-pipes--creating-custom-directives": lesson(
    "A custom structural directive can translate a boolean into the lifetime of an embedded view. The implementation must avoid duplicating views and remove them when the condition becomes false.",
    [
      "Inject TemplateRef for the caller’s template and ViewContainerRef for the insertion point. Structural shorthand supplies the template context.",
      "An input setter can reconcile each incoming value with whether a view already exists. Create only on a false-to-true transition and clear on a true-to-false transition.",
      "Keep the directive’s contract narrow. If it starts owning requests, navigation, and unrelated state, move those responsibilities to a feature service or component.",
    ],
    `import { Directive, inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';
@Directive({ selector: '[studyWhen]', standalone: true })
export class StudyWhen {
  private template = inject(TemplateRef<unknown>);
  private container = inject(ViewContainerRef);
  private visible = false;
  @Input() set studyWhen(value: boolean) {
    if (value && !this.visible) this.container.createEmbeddedView(this.template);
    if (!value && this.visible) this.container.clear();
    this.visible = value;
  }
}
// Import StudyWhen and use <p *studyWhen="ready()">Ready</p>.`,
    "A repeated true value does not append another paragraph because visible already records an existing view. A false value clears it. For ordinary conditionals, @if remains simpler.",
    ["Input condition changes", "Compare view existence", "Create once or clear"],
    "Calling createEmbeddedView on every true assignment duplicates content. Reconcile the desired state with the existing view.",
    "Why does this directive use an input setter rather than only ngOnInit?",
    "The condition can change after initialization. The setter responds to subsequent input assignments and updates the view accordingly.",
    "https://angular.dev/guide/directives/structural-directives",
  ),
  "directives-and-pipes--built-in-pipes": lesson(
    "Pipes transform values for display without changing the underlying model. Angular supplies common formatting tools for dates, numbers, currency, casing, and asynchronous values.",
    [
      "Import each standalone pipe used by a standalone template, or a module that exports it. Pipe parameters follow colons, and pipes can be chained.",
      "Locale and timezone affect output. Specify them deliberately when teaching or testing dates rather than assuming every machine produces the same string.",
      "Most formatting pipes are pure: Angular reruns them when their primitive value or object reference changes. Mutating an existing object can leave a pure pipe’s result unchanged.",
    ],
    `import { Component } from '@angular/core';
import { CurrencyPipe, DatePipe, PercentPipe } from '@angular/common';
@Component({ selector: 'app-root', standalone: true,
  imports: [CurrencyPipe, DatePipe, PercentPipe],
  template: '<p>{{ price | currency:"USD" }}</p><p>{{ progress | percent }}</p><p>{{ date | date:"yyyy-MM-dd":"UTC" }}</p>' })
export class App {
  price = 29;
  progress = 0.5;
  date = '2026-09-21T00:00:00Z';
}`,
    "The model retains a numeric price and fraction. The template formats the fraction as 50% and the date as 2026-09-21 in UTC. Currency formatting follows the configured locale.",
    ["Raw model value", "Pipe plus parameters", "Localized display text"],
    "Do not store formatted currency text as the authoritative amount for calculations. Format only at the presentation boundary.",
    "Why is progress 0.5 rather than 50 for PercentPipe?",
    "The pipe formats a fraction as a percentage. Supplying 50 would represent 5000%, not 50%.",
    "https://angular.dev/guide/templates/pipes",
  ),
  "directives-and-pipes--creating-custom-pipes": lesson(
    "A custom pipe names a reusable display transformation. Keep its transform method deterministic, inexpensive, and independent of side effects.",
    [
      "Implement PipeTransform and return the formatted value from transform. Parameters after the first argument correspond to colon-separated template parameters.",
      "Pure pipes are the default and suit immutable inputs. If a transformation depends on changing external state, make that dependency explicit instead of hiding it inside a pipe.",
      "Avoid expensive filtering of large collections in an impure pipe. Derived state or a dedicated data transformation can provide clearer performance behavior.",
    ],
    `import { Pipe, PipeTransform } from '@angular/core';
@Pipe({ name: 'studyDuration', standalone: true })
export class StudyDuration implements PipeTransform {
  transform(minutes: number): string {
    if (!Number.isFinite(minutes) || minutes < 0) return 'Unknown duration';
    const whole = Math.floor(minutes);
    return Math.floor(whole / 60) + 'h ' + (whole % 60) + 'm';
  }
}
// Import StudyDuration in the component.
// <p>{{ 95 | studyDuration }}</p>`,
    "The output for 95 is 1h 35m. Invalid or negative input has an explicit fallback. The method can be unit tested directly without rendering an Angular component.",
    ["Input minutes", "Pure transformation", "Readable duration"],
    "Do not send HTTP requests from transform. Angular controls evaluation timing, and repeated template checks should not create external work.",
    "Which boundary cases should this pipe’s tests include?",
    "Zero, exactly 60, a value above an hour, a fractional minute, and invalid or negative numbers establish the intended rounding and fallback contract.",
    "https://angular.dev/guide/templates/pipes",
  ),
};
