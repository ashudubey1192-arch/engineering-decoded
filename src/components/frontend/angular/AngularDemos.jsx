import { useId, useState } from "react";
import "./css/AngularLesson.css";

function BindingDemo() {
  const [title, setTitle] = useState("Angular planner");
  const [pending, setPending] = useState(false);
  return (
    <div className="reactLab">
      <h3>Explore template bindings</h3>
      <p>
        Edit the model and inspect how interpolation and a boolean property binding affect the view.
      </p>
      <label>
        Planner title
        <input value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label>
        <input
          type="checkbox"
          checked={pending}
          onChange={(event) => setPending(event.target.checked)}
        />{" "}
        Saving in progress
      </label>
      <pre tabIndex={0} aria-label="Binding model">
        <code>{`title = ${JSON.stringify(title)};\nsaving = ${pending};\n\n<h2>{{ title }}</h2>\n<button [disabled]="saving">Save plan</button>`}</code>
      </pre>
      <div className="reactPreview">
        <small>RESULTING VIEW</small>
        <h3>{title || "(Empty title)"}</h3>
        <button disabled={pending} onClick={() => setPending(true)}>
          Save plan
        </button>
        <p role="status">
          {pending
            ? "Disabled by the saving model. Clear the checkbox to enable it."
            : "Enabled: saving is false."}
        </p>
      </div>
    </div>
  );
}

function InjectorDemo() {
  const [local, setLocal] = useState(false);
  const [counts, setCounts] = useState([0, 0]);
  function increment(index) {
    setCounts((current) =>
      local
        ? current.map((value, i) => (i === index ? value + 1 : value))
        : current.map((value) => value + 1),
    );
  }
  return (
    <div className="reactLab">
      <h3>Which service instance do the editors receive?</h3>
      <label>
        <input
          type="checkbox"
          checked={local}
          onChange={(event) => {
            setLocal(event.target.checked);
            setCounts([0, 0]);
          }}
        />{" "}
        Provide a local service in each editor
      </label>
      <div className="angularDemoGrid">
        {["Editor A", "Editor B"].map((name, index) => (
          <div className="reactPreview" key={name}>
            <small>{local ? `LOCAL INSTANCE ${index + 1}` : "SHARED ROOT INSTANCE"}</small>
            <h3>{name}</h3>
            <p>
              Sessions: <strong>{counts[index]}</strong>
            </p>
            <button onClick={() => increment(index)}>Add in {name}</button>
          </div>
        ))}
      </div>
      <p role="status">
        {local
          ? "Each editor resolves its own provider. Updating A does not update B."
          : "Both editors resolve the root provider. They observe the same service state."}
      </p>
      <p>
        Changing provider mode resets this model so the ownership difference is easy to compare.
      </p>
    </div>
  );
}

function SignalDemo() {
  const [hours, setHours] = useState(2);
  const [days, setDays] = useState(5);
  const weekly = hours * days;
  return (
    <div className="reactLab">
      <h3>Trace a computed dependency graph</h3>
      <div className="reactLabFields">
        <label>
          Hours per day
          <input
            type="range"
            min="1"
            max="6"
            value={hours}
            onChange={(event) => setHours(Number(event.target.value))}
          />
          {hours} hours
        </label>
        <label>
          Days per week
          <input
            type="range"
            min="1"
            max="7"
            value={days}
            onChange={(event) => setDays(Number(event.target.value))}
          />
          {days} days
        </label>
      </div>
      <figure className="reactFlow">
        <figcaption>Source → derivation → display</figcaption>
        <ol>
          <li>
            <small>SIGNALS</small>
            <strong>
              {hours} hours × {days} days
            </strong>
          </li>
          <li>
            <small>COMPUTED</small>
            <strong>{weekly} hours per week</strong>
          </li>
          <li>
            <small>DERIVED MESSAGE</small>
            <strong>{weekly >= 10 ? "Goal reached" : "Keep planning"}</strong>
          </li>
        </ol>
      </figure>
      <p role="status">
        Weekly plan: {weekly} hours.{" "}
        {weekly >= 10
          ? "Your ten-hour goal is reached."
          : `${10 - weekly} more hours to reach your goal.`}
      </p>
      <button
        onClick={() => {
          setHours(2);
          setDays(5);
        }}
      >
        Reset plan
      </button>
      <p>
        The total is derived from the two inputs. There is no separate total setter to synchronize.
      </p>
    </div>
  );
}

function FormDemo() {
  const id = useId();
  const [title, setTitle] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState("");
  const error = !title.trim()
    ? "A plan title is required."
    : title.trim().length < 3
      ? "Use at least three characters."
      : title.trim().toLowerCase() === "admin"
        ? "This title is reserved. Choose another title."
        : "";
  const showError = (touched || submitted) && Boolean(error);
  return (
    <div className="reactLab">
      <h3>Explore control value, interaction, and validity</h3>
      <p>
        Try an empty value, “ab”, and “admin”, then enter a valid title. Feedback appears after blur
        or submit.
      </p>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
          if (!error) setSaved(title.trim());
        }}
      >
        <label htmlFor={id}>Plan title</label>
        <input
          id={id}
          value={title}
          onBlur={() => setTouched(true)}
          onChange={(event) => {
            setTitle(event.target.value);
            setSaved("");
          }}
          aria-invalid={showError}
          aria-describedby={showError ? `${id}-error` : undefined}
        />
        {showError && (
          <p id={`${id}-error`} role="alert">
            {error}
          </p>
        )}
        <div className="angularStateTags">
          <span>Value: {title || "(empty)"}</span>
          <span>{touched ? "Touched" : "Untouched"}</span>
          <span>{error ? "INVALID" : "VALID"}</span>
        </div>
        <div className="reactLabActions">
          <button type="submit">Validate plan</button>
          <button
            type="button"
            onClick={() => {
              setTitle("");
              setTouched(false);
              setSubmitted(false);
              setSaved("");
            }}
          >
            Reset form
          </button>
        </div>
        <p role="status">
          {saved ? `Valid plan: ${saved}. Demo only; no data was sent.` : "No plan submitted."}
        </p>
      </form>
    </div>
  );
}

function RequestDemo() {
  const [requests, setRequests] = useState([]);
  const [visible, setVisible] = useState("No response yet.");
  const [notice, setNotice] = useState(
    "Start a request, then start another before delivering the first.",
  );
  function start() {
    const id = requests.length + 1;
    setRequests((items) => [
      ...items.map((item) =>
        item.status === "pending" ? { ...item, status: "unsubscribed" } : item,
      ),
      { id, status: "pending" },
    ]);
    setNotice(`Request ${id} is current. Any earlier pending subscription is canceled.`);
  }
  function deliver(id) {
    const request = requests.find((item) => item.id === id);
    if (request.status !== "pending") {
      setNotice(`Late response ${id} ignored: its subscription is no longer current.`);
      return;
    }
    setVisible(`Results from request ${id}`);
    setRequests((items) =>
      items.map((item) => (item.id === id ? { ...item, status: "complete" } : item)),
    );
    setNotice(`Request ${id} updates the visible result.`);
  }
  return (
    <div className="reactLab">
      <h3>Control response order with a switchMap model</h3>
      <p>
        This step-through simulation makes no network calls. Deliver responses in any order to see
        which subscription can update the view.
      </p>
      <div className="reactLabActions">
        <button disabled={requests.length >= 4} onClick={start}>
          Start next search
        </button>
        <button
          onClick={() => {
            setRequests([]);
            setVisible("No response yet.");
            setNotice("Simulation reset.");
          }}
        >
          Reset requests
        </button>
      </div>
      <ul className="reactLabList">
        {requests.map((request) => (
          <li key={request.id}>
            <span>
              Request {request.id}: <strong>{request.status}</strong>
            </span>
            <button disabled={request.status === "complete"} onClick={() => deliver(request.id)}>
              Deliver response {request.id}
            </button>
          </li>
        ))}
      </ul>
      <div className="reactPreview">
        <small>VISIBLE RESULT</small>
        <p>{visible}</p>
      </div>
      <p role="status">{notice}</p>
      <p>
        Unsubscription prevents obsolete results here; it does not guarantee that a server stops
        processing or rolls back a write.
      </p>
    </div>
  );
}

function RouteDemo() {
  const [path, setPath] = useState("/courses/angular/notes");
  const segments = path.split("/").filter(Boolean);
  const matches =
    segments[0] === "courses" &&
    segments.length >= 2 &&
    segments.length <= 3 &&
    (!segments[2] || segments[2] === "notes");
  return (
    <div className="reactLab">
      <h3>Match a nested URL</h3>
      <label>
        Example path
        <input value={path} onChange={(event) => setPath(event.target.value)} />
      </label>
      <pre tabIndex={0}>
        <code>{"path: 'courses/:courseId'\nchildren: ['', 'notes']"}</code>
      </pre>
      <div className="reactPreview">
        <small>MATCH RESULT</small>
        <p role="status">
          {matches
            ? `CourseLayout → courseId: ${segments[1]} → ${segments[2] ? "Notes" : "Overview"}`
            : "No match in this example route configuration."}
        </p>
      </div>
      <p>
        Try /courses/css, /courses/angular/notes, and /unknown. This illustrates path matching
        without navigating away from the lesson.
      </p>
    </div>
  );
}

export default function AngularDemos({ slug }) {
  if (
    [
      "state-management--signals",
      "state-management--computed-state",
      "state-management--component-state",
      "production-angular--change-detection",
    ].includes(slug)
  )
    return <SignalDemo />;
  if (
    [
      "services-and-di--dependency-injection-fundamentals",
      "services-and-di--hierarchical-injectors",
      "services-and-di--provider-configuration",
      "state-management--shared-service-state",
    ].includes(slug)
  )
    return <InjectorDemo />;
  if (
    [
      "forms--template-driven-forms",
      "forms--reactive-forms",
      "forms--form-validation",
      "forms--custom-validators",
    ].includes(slug)
  )
    return <FormDemo />;
  if (
    [
      "http-and-rxjs--canceling-requests",
      "http-and-rxjs--rxjs-operators",
      "http-and-rxjs--observables",
    ].includes(slug)
  )
    return <RequestDemo />;
  if (
    [
      "routing--router-configuration",
      "routing--route-parameters",
      "routing--nested-routes",
    ].includes(slug)
  )
    return <RouteDemo />;
  if (
    [
      "components-and-templates--template-syntax",
      "components-and-templates--property-binding",
      "components-and-templates--event-binding",
      "components-and-templates--two-way-binding",
      "angular-foundations--what-is-angular",
    ].includes(slug)
  )
    return <BindingDemo />;
  return null;
}
