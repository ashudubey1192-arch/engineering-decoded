import { lesson } from "./angularLessonSchema.js";

export const angularFormsLessons = {
  "forms--template-driven-forms": lesson(
    "Template-driven forms declare controls and basic validation in HTML. They suit small forms whose structure is easy to understand directly from the template.",
    [
      "FormsModule supplies ngModel and NgForm. Each registered control inside a form needs a unique name, and ngModel synchronizes its value with the component model.",
      'NgForm aggregates validity and submission state. A template reference such as #plan="ngForm" exposes those values for messages and submit behavior.',
      "Keep submission on the form’s ngSubmit event so keyboard and button submission share the same path. Guard the save operation even if the button is disabled for invalid input.",
    ],
    `import { Component, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
@Component({ selector: 'app-root', standalone: true, imports: [FormsModule],
  template: '<form #plan="ngForm" (ngSubmit)="submit(plan)"><label>Title <input name="title" [(ngModel)]="title" required minlength="3" /></label><button [disabled]="plan.invalid">Create plan</button></form><p role="status">{{ message() }}</p>' })
export class App {
  title = '';
  message = signal('');
  submit(form: NgForm) {
    if (form.invalid) return;
    this.message.set('Demo plan created: ' + this.title);
  }
}`,
    "The form registers title and validates its length. A valid submission displays a local confirmation; no backend persistence is implied. Add field-level error messages when turning the example into a real feature.",
    ["Named template control", "NgForm aggregates state", "Validated submission"],
    "Do not mix ngModel and reactive form directives on the same control. Choose one ownership model for that control.",
    "What happens if the input inside the form has no name?",
    "ngModel cannot register normally with the parent form. Supply a name or explicitly configure the control as standalone when it should not participate.",
    "https://angular.dev/guide/forms/template-driven-forms",
  ),
  "forms--reactive-forms": lesson(
    "Reactive forms define a typed control model in the component class. The template binds to that model, making complex validation and programmatic updates explicit.",
    [
      "A FormControl owns a value and status. FormGroup combines named controls, and ReactiveFormsModule supplies the directives that connect those controls to HTML.",
      "Use nonNullable controls when reset should restore the initial value instead of null. Types describe expected values, while validators describe whether those values are acceptable.",
      "setValue expects the complete shape; patchValue updates a subset. getRawValue includes disabled controls, while a group’s ordinary value can omit them.",
    ],
    `import { Component } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({ selector: 'app-root', standalone: true, imports: [ReactiveFormsModule],
  template: '<form [formGroup]="plan" (ngSubmit)="submit()"><label>Title <input formControlName="title" /></label><button [disabled]="plan.invalid">Save</button></form>' })
export class App {
  readonly plan = new FormGroup({
    title: new FormControl('', { nonNullable: true, validators: [Validators.required] })
  });
  submit() {
    if (this.plan.invalid) { this.plan.markAllAsTouched(); return; }
    console.info(this.plan.getRawValue()); // Local practice output only
  }
}`,
    "The title control exists independently of the template. Typing updates it, and its validator controls form validity. In production, pass valid values to a service rather than logging user data.",
    ["Typed form model", "Directive connects control", "Value and status updates"],
    "Do not assume a typed FormGroup validates a server payload. Validate input at the server and normalize external data before patching the form.",
    "When would patchValue be appropriate?",
    "When updating only selected fields, such as restoring a saved title while keeping other edits. setValue is useful when the whole shape must be present.",
    "https://angular.dev/guide/forms/reactive-forms",
  ),
  "forms--form-validation": lesson(
    "Validation combines rules with useful feedback. A form should explain how to correct a field, preserve the draft, and validate again on the server.",
    [
      "Validators return an error map or null. A control’s invalid status reflects its rules; touched, dirty, and submitted state help decide when to show feedback.",
      "Link a visible error to its input with aria-describedby and set aria-invalid when the error is being exposed. Color alone is insufficient.",
      "Client validation improves usability but is bypassable. Server validation remains authoritative, and server errors should map back to fields or a clear form-level message.",
    ],
    `import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({ selector: 'app-root', standalone: true, imports: [ReactiveFormsModule],
  template: '<label for="email">Email</label><input id="email" type="email" [formControl]="email" [attr.aria-invalid]="showError" [attr.aria-describedby]="showError ? errorId : null" /> @if (showError) { <p id="email-error" role="alert">Enter a valid email address.</p> }' })
export class App {
  readonly email = new FormControl('', { nonNullable: true,
    validators: [Validators.required, Validators.email] });
  readonly errorId = 'email-error';
  get showError() { return this.email.invalid && (this.email.touched || this.email.dirty); }
}`,
    "The error appears after interaction rather than immediately on page load. A valid address clears it. In a reusable component, generate or accept unique IDs so repeated instances do not collide.",
    ["Apply rules", "Choose feedback timing", "Describe a correction"],
    "Disabling submit without explaining invalid fields leaves users guessing. Provide field-level feedback and handle submission as a final validation checkpoint.",
    "What should happen after a server rejects one field?",
    "Keep the draft, show a field-specific message linked to its control, and let the user correct it. Clear stale server errors when appropriate.",
    "https://angular.dev/guide/forms/form-validation",
  ),
  "forms--custom-validators": lesson(
    "A custom validator expresses a domain rule that built-in constraints do not capture. Keep synchronous validators pure and return structured error information.",
    [
      "A ValidatorFn receives an AbstractControl and returns ValidationErrors or null. Use a meaningful error key so the template can choose an accurate message.",
      "Let a separate required validator handle an empty value when the custom rule concerns only non-empty input. Compose rules instead of duplicating them.",
      "Cross-field rules belong on a group when they compare controls. Asynchronous validators should complete and must manage remote failure deliberately.",
    ],
    `import { ValidatorFn, FormControl, Validators } from '@angular/forms';
export const noReservedTitle: ValidatorFn = control => {
  const value = String(control.value ?? '').trim().toLowerCase();
  return value === 'admin' ? { reservedTitle: { value: control.value } } : null;
};
export const title = new FormControl('', {
  nonNullable: true,
  validators: [Validators.required, noReservedTitle]
});
// title.setValue(' Admin ');
// title.hasError('reservedTitle') === true`,
    "The comparison trims and normalizes case so superficial variations do not bypass the rule. The original value remains available in the error payload; the validator does not rewrite the control while validating it.",
    ["Control value", "Pure domain rule", "Error map or null"],
    "Calling setValue inside a validator can create recursive validation and surprising edits. Normalize at a deliberate input or submission boundary instead.",
    "Where should a password-confirmation match rule be attached?",
    "To the FormGroup containing both controls, because the rule concerns their relationship rather than one independent field.",
    "https://angular.dev/guide/forms/form-validation",
  ),
  "forms--dynamic-forms": lesson(
    "Dynamic forms turn trusted field metadata into controls and markup. They are useful for varying questionnaires, but the schema needs a clear contract and validation policy.",
    [
      "A field schema describes keys, labels, control types, and constraints. Keys must be unique so each rendered input connects to the intended control.",
      "Build controls from an allowlisted set of field types. Do not turn arbitrary server strings into executable templates or validators.",
      "When metadata changes, reconcile intentionally: preserve relevant drafts, remove obsolete controls, and decide what happens to errors and focus. Rebuilding everything on every render loses user work.",
    ],
    `import { FormControl, FormRecord, Validators } from '@angular/forms';
interface TextField { key: string; label: string; required: boolean; }
export const fields: TextField[] = [
  { key: 'topic', label: 'Study topic', required: true },
  { key: 'notes', label: 'Notes', required: false }
];
export function buildForm(schema: TextField[]) {
  const form = new FormRecord<FormControl<string>>({});
  for (const field of schema) {
    if (form.controls[field.key]) throw new Error('Duplicate field key');
    form.addControl(field.key, new FormControl('', {
      nonNullable: true, validators: field.required ? [Validators.required] : []
    }));
  }
  return form;
}`,
    "This model-building excerpt creates one text control per schema entry. A component can iterate fields with @for, render each label, and bind [formControlName] to field.key inside the form group.",
    ["Validated metadata", "Create typed controls", "Render matching fields"],
    "Do not confuse metadata-driven forms with trusted HTML injection. The application should own its templates and support only known control types.",
    "Why validate duplicate field keys before rendering?",
    "Duplicate keys can overwrite or misassociate controls and labels. Each schema field needs one unambiguous identity.",
    "https://angular.dev/guide/forms/dynamic-forms",
  ),
  "forms--form-arrays": lesson(
    "FormArray models an ordered collection of controls whose length can change. It is useful for repeated study topics, attendees, or checklist entries.",
    [
      "Use push, insert, removeAt, and clear to change the control collection. Keep the control model and rendered rows aligned rather than managing a separate unrelated array.",
      "Track control instances or stable domain IDs when rendering repeated rows. The displayed index can label a row but should not accidentally reassign its identity.",
      "Array-level validators can enforce collection rules, such as a minimum number of entries. Child validators enforce each row’s value independently.",
    ],
    `import { Component } from '@angular/core';
import { FormArray, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
@Component({ selector: 'app-root', standalone: true, imports: [ReactiveFormsModule],
  template: '@for (control of topics.controls; track control; let i = $index) { <label>Topic {{ i + 1 }} <input [formControl]="control" /></label><button type="button" (click)="topics.removeAt(i)">Remove topic {{ i + 1 }}</button> } <button type="button" (click)="add()">Add topic</button>' })
export class App {
  readonly topics = new FormArray<FormControl<string>>([]);
  add() { this.topics.push(new FormControl('', {
    nonNullable: true, validators: [Validators.required]
  })); }
}`,
    "Add two rows, fill both, and remove the first. The surviving control keeps its value because the row follows the control instance. Submission can read topics.getRawValue().",
    ["Add a control", "Bind one row per control", "Remove the matching instance"],
    'Inside a form, an add-row button without type="button" can submit accidentally. Explicitly distinguish structural controls from the submit action.',
    "How does a FormArray differ from a FormGroup?",
    "FormArray is an ordered, variable-length collection; FormGroup normally uses known named controls. FormRecord is useful for dynamically keyed controls.",
    "https://angular.dev/guide/forms/reactive-forms",
  ),
  "http-and-rxjs--httpclient": lesson(
    "HttpClient exposes typed observable-based requests and integrates with Angular’s DI and interceptor infrastructure. Configure it once and keep transport concerns at an API boundary.",
    [
      "provideHttpClient installs the service. A request observable is cold: subscribing starts a request, and separate subscriptions can start separate requests.",
      "A generic such as get<Course[]> describes the expected response to TypeScript. It does not validate the JSON returned by an untrusted or changing server.",
      "Model loading, success, empty, and failure states in the consumer. Use AsyncPipe or an explicit subscription lifetime rather than leaving subscriptions unmanaged.",
    ],
    `import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
export interface Course { id: string; title: string; }
@Injectable({ providedIn: 'root' })
export class CourseApi {
  private readonly http = inject(HttpClient);
  list() { return this.http.get<Course[]>('/api/courses'); }
}
// Application providers include provideHttpClient().
// The server must implement GET /api/courses.
// Subscribe through AsyncPipe or a deliberately managed pipeline.`,
    "Calling list creates an observable; it does not immediately send the request. A subscription begins the HTTP operation. Add runtime response validation in the adapter when crossing an external API boundary.",
    ["Configure HTTP provider", "Subscribe to request", "Receive response or error"],
    "Reading the same cold request through several independent async bindings can duplicate requests. Bind once with a template alias or use a deliberate sharing strategy.",
    "Why is get<Course[]> not enough to trust response fields?",
    "TypeScript types disappear at runtime. The server can still return malformed data, so validate the actual response when correctness requires it.",
    "https://angular.dev/guide/http/making-requests",
  ),
  "http-and-rxjs--http-interceptors": lesson(
    "Interceptors process HTTP requests and responses through a configured chain. They suit cross-cutting concerns such as request metadata, timing, and consistent transport policies.",
    [
      "Functional interceptors receive an immutable request and the next handler. Clone a request to modify headers; do not try to assign directly to immutable fields.",
      "Configured order matters. A request moves through the interceptors toward the backend, while response events return through the composed chain.",
      "Scope sensitive headers to trusted destinations. An interceptor that attaches credentials to every URL can leak them to an unrelated external endpoint.",
    ],
    `import { HttpInterceptorFn, provideHttpClient, withInterceptors } from '@angular/common/http';
export const plannerHeader: HttpInterceptorFn = (request, next) => {
  if (!request.url.startsWith('/api/')) return next(request);
  return next(request.clone({ setHeaders: { 'X-Planner-Client': 'web' } }));
};
export const httpProviders = [provideHttpClient(withInterceptors([plannerHeader]))];
// Merge httpProviders into application providers.
// This example adds public metadata, not authentication credentials.`,
    "Requests under the application’s relative /api/ path get the header. Other requests pass through unchanged. The server must still authenticate and authorize sensitive operations independently.",
    ["Outgoing request", "Ordered interceptor chain", "Backend and response chain"],
    "Do not subscribe inside an interceptor and detach the request from the returned observable. Return the composed next(request) pipeline.",
    "Why should a retry policy distinguish reads from writes?",
    "Retrying a write can duplicate a side effect unless the endpoint has suitable idempotency semantics. A blanket retry policy can change application behavior.",
    "https://angular.dev/guide/http/interceptors",
  ),
  "http-and-rxjs--observables": lesson(
    "An observable describes a stream of values over time. A subscriber receives next notifications and eventually completion or an error, and can release work by unsubscribing.",
    [
      "Observables can be synchronous or asynchronous and can emit zero, one, or many values. An HTTP read often emits once, while an interval continues until stopped.",
      "A cold observable starts its producer for each subscription. Hot sources share an external producer; Subjects are a common bridge discussed later.",
      "Teardown releases resources when a subscription ends. Use AsyncPipe for template consumption or takeUntilDestroyed for component-owned subscriptions.",
    ],
    `import { Observable } from 'rxjs';
const sessions$ = new Observable<number>(subscriber => {
  let count = 0;
  const id = setInterval(() => subscriber.next(++count), 1000);
  return () => clearInterval(id);
});
const subscription = sessions$.subscribe(value => console.info(value));
setTimeout(() => subscription.unsubscribe(), 3500);`,
    "Subscribing starts the timer and typically logs 1, 2, and 3 before the timeout unsubscribes. The returned teardown clears the interval. Timer scheduling is approximate, so tests should control time rather than depend on exact wall-clock timing.",
    ["Subscribe", "Receive stream values", "Unsubscribe and tear down"],
    "Creating an observable is not always enough to execute it. Conversely, forgetting teardown on a long-lived source can keep work alive after its UI disappears.",
    "How does this differ from an ordinary promise?",
    "A promise settles once and has no standard subscription teardown. An observable can emit multiple values and define cleanup for cancellation.",
    "https://rxjs.dev/guide/observable",
  ),
  "http-and-rxjs--rxjs-operators": lesson(
    "Operators compose stream behavior without nesting independent subscriptions. Choose transformations and flattening operators according to the meaning of your events.",
    [
      "map transforms each value, filter keeps selected values, and distinctUntilChanged suppresses equal consecutive values. debounceTime waits for a quiet interval before emitting.",
      "switchMap replaces an earlier inner subscription, concatMap queues inner work, mergeMap allows concurrent inner work, and exhaustMap ignores new inputs while inner work is active.",
      "Cancellation is a policy decision. Switching away from a read can be useful; switching away from a write does not guarantee that the server undoes that write.",
    ],
    `import { Subject, debounceTime, distinctUntilChanged, filter, map } from 'rxjs';
const query$ = new Subject<string>();
const subscription = query$.pipe(
  map(value => value.trim()),
  debounceTime(250),
  distinctUntilChanged(),
  filter(value => value.length >= 2)
).subscribe(value => console.info('Search:', value));
query$.next(' A ');
query$.next(' Angular ');
// Later, when the owner is destroyed:
// subscription.unsubscribe();`,
    "Rapid input collapses into the last normalized value after a quiet period. Angular is emitted, while a one-character value would be filtered out. The pipeline is reusable independently of a particular input element.",
    ["Normalize input", "Debounce and deduplicate", "Emit useful query"],
    "Nested subscribe calls make cancellation and errors difficult to coordinate. Flatten asynchronous work with an operator selected for the intended ordering.",
    "Which operator fits ordered saves that must not overlap?",
    "concatMap queues work and subscribes sequentially. Still design server-side ordering and failure handling explicitly.",
    "https://rxjs.dev/guide/operators",
  ),
  "http-and-rxjs--subjects": lesson(
    "A Subject is both an observable and an observer: it can receive values through next and multicast them to subscribers. Use it for explicit event streams, not as a default replacement for all state.",
    [
      "A plain Subject does not replay earlier values to late subscribers. BehaviorSubject holds an initial/current value and immediately sends it to a new subscriber.",
      "Expose an observable view with asObservable so consumers cannot emit arbitrary values into your source. Keep next calls behind meaningful methods.",
      "A replaying stream can retain data longer than expected. Choose buffer and lifetime policies deliberately, especially for large or sensitive values.",
    ],
    `import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({ providedIn: 'root' })
export class SelectedCourse {
  private readonly source = new BehaviorSubject<string | null>(null);
  readonly selected$ = this.source.asObservable();
  select(id: string) { this.source.next(id); }
  clear() { this.source.next(null); }
}`,
    "An early subscriber first sees null, then a selected ID. A later subscriber immediately receives the current ID. Consumers can observe selection but must call select or clear to change it.",
    ["Owner emits value", "Multicast current state", "Subscribers observe"],
    "Do not expose the writable Subject publicly if consumers should not control the event source. An asObservable view communicates a narrower contract.",
    "Would a plain Subject replay the current selection to a new subscriber?",
    "No. It only forwards emissions that occur while subscribed. BehaviorSubject supplies an initial and current value.",
    "https://rxjs.dev/guide/subject",
  ),
  "http-and-rxjs--error-handling": lesson(
    "An RxJS error terminates the stream segment that emits it. Place recovery at the right boundary so one failed request does not unnecessarily disable future user interactions.",
    [
      "catchError replaces a failed stream with another observable or rethrows the error. A fallback should preserve the distinction between failed data and a genuinely empty successful response.",
      "Put request-level recovery inside switchMap when later queries should still work after one request fails. Catching only outside can replace and complete the entire search pipeline.",
      "Use finalize for cleanup that must happen after completion, failure, or unsubscription. Do not put success-only messages there because cancellation also executes it.",
    ],
    `import { catchError, map, of, switchMap } from 'rxjs';
// Pipeline excerpt: query$ emits strings; http is an injected HttpClient.
const result$ = query$.pipe(
  switchMap(query => http.get('/api/courses', { params: { q: query } }).pipe(
    map(data => ({ status: 'success' as const, data })),
    catchError(() => of({ status: 'error' as const, data: null }))
  ))
);`,
    "A failed request produces an error state for that query. The outer query stream remains subscribed, so another search can start another request. Add a loading emission when the consumer needs a full request state machine.",
    ["Request fails", "Recover inner stream", "Accept future queries"],
    "Returning [] from catchError can make an outage look like no results. Use an explicit failure state or rethrow to an owner that can present one.",
    "Should finalize display “Saved successfully”?",
    "No. It runs for failure and unsubscription as well as success. Report success only from the confirmed successful result.",
    "https://rxjs.dev/api/operators/catchError",
  ),
  "http-and-rxjs--canceling-requests": lesson(
    "Cancellation prevents obsolete work from updating the current screen and can release network resources. switchMap is a useful policy for reads where only the newest request matters.",
    [
      "When a new source value arrives, switchMap unsubscribes the previous inner request. HttpClient cancellation can abort the underlying client request, but it cannot guarantee the server did no work.",
      "Tie explicit subscriptions to component lifetime with takeUntilDestroyed. AsyncPipe already manages its own subscription when used in a template.",
      "Debouncing reduces request frequency; switching controls which in-flight read remains observed. They solve different timing concerns and can be combined.",
    ],
    `import { Component, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AsyncPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, catchError, of } from 'rxjs';
@Component({ selector: 'app-root', standalone: true, imports: [AsyncPipe, ReactiveFormsModule],
  template: '<label>Search <input [formControl]="query" /></label><p>{{ result$ | async }}</p>' })
export class App {
  private readonly http = inject(HttpClient);
  readonly query = new FormControl('', { nonNullable: true });
  readonly result$ = this.query.valueChanges.pipe(
    debounceTime(250), distinctUntilChanged(),
    switchMap(q => this.http.get('/api/search-summary', { params: { q }, responseType: 'text' })
      .pipe(catchError(() => of('Search unavailable. Try another query.'))))
  );
}`,
    "Provide HttpClient and implement an endpoint returning a text summary. After a quiet typing interval, the new query replaces the previous request subscription. Until the user types, this example makes no initial request.",
    ["New search term", "Unsubscribe obsolete read", "Observe newest response"],
    "Do not use switchMap for writes that must all finish merely because it is familiar. Unsubscribing does not roll back a server mutation.",
    "How would you trigger the initial empty search too?",
    "Add startWith(this.query.value) to the source pipeline before debouncing, and decide whether an empty query should actually reach the server.",
    "https://angular.dev/guide/http/making-requests",
  ),
  "http-and-rxjs--async-pipe": lesson(
    "AsyncPipe connects a template to an observable or promise and updates the view when a value arrives. It owns the subscription lifecycle for the bound source.",
    [
      "Import AsyncPipe in a standalone component. It subscribes to the source, marks the view for updates, and unsubscribes when destroyed or when the source reference changes.",
      "Before a first observable emission, the displayed value can be null. Model the initial state and avoid assuming data is immediately available.",
      "Use a template alias to consume one stream value in several places. Repeated bindings to a cold HTTP observable can create repeated subscriptions and requests.",
    ],
    `import { Component } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { of } from 'rxjs';
@Component({ selector: 'app-root', standalone: true, imports: [AsyncPipe],
  template: '@if (course$ | async; as course) { <h1>{{ course.title }}</h1><p>{{ course.lessons }} lessons</p> } @else { <p role="status">Loading…</p> }' })
export class App {
  readonly course$ = of({ title: 'Angular', lessons: 68 });
}`,
    "The alias course is reused for both fields. of emits synchronously, so the loading branch may never visibly appear; replace the source with a real request to explore waiting behavior.",
    ["Observable source", "AsyncPipe subscription", "Template alias and cleanup"],
    "A truthiness-based @if can hide valid values such as zero or false. Use an object view model or explicit null checks when those values are meaningful.",
    "Why keep the observable in a field rather than call a new request method from the template?",
    "A method that creates a new observable on each evaluation changes source identity, causing resubscription and potentially repeated requests.",
    "https://angular.dev/api/common/AsyncPipe",
  ),
};
