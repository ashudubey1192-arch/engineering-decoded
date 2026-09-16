export default function PatternCaseStudiesDesignAnEventDispatcherArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          An event dispatcher needs to let many independent parts of a system react to the same
          event without knowing about each other, support handlers that run slow, unrelated work
          without blocking event publication, and let a handler's own failure be isolated from
          the rest &mdash; the closing case study of this course, and a fitting one: it pulls
          together patterns from across nearly every section covered.
        </p>
        <p>
          As with every case study in this section, the discipline is the same as Identify the
          Design Problem: name each requirement precisely before reaching for a pattern, and only
          combine patterns that are each solving something the others don't.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Working through the design, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Many independent reactions to the same event.</b> A <code>UserRegistered</code>{" "}
            event might trigger a welcome email, an analytics record, and a CRM sync, each
            unaware of the others &mdash; <code>Observer</code>'s exact structure.
          </li>
          <li>
            <b>Slow handlers shouldn't block publication.</b> If the CRM sync handler takes two
            seconds, the caller publishing the event shouldn't wait &mdash; dispatching each
            handler through a <code>Thread Pool</code> lets publication return immediately while
            handlers run independently.
          </li>
          <li>
            <b>One handler's failure shouldn't affect the others.</b> The same per-handler
            isolation used in the plugin system case study applies here: each handler invocation
            is guarded individually, so one exception doesn't stop the rest from running.
          </li>
          <li>
            <b>Confirm the combination, not overlap.</b> Observer defines who gets notified;
            Thread Pool defines how each notification actually executes; the guard defines what
            happens when one fails &mdash; three distinct concerns addressing three distinct
            requirements.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="50" width="110" height="30" rx="5" />
            <text className="boxText" x="75" y="69" fontSize="7">EventDispatcher</text>
            <line className="flow" x1="130" y1="55" x2="190" y2="30" />
            <line className="flow" x1="130" y1="65" x2="190" y2="65" />
            <line className="flow" x1="130" y1="75" x2="190" y2="105" />
            <rect className="boxAccent" x="190" y="15" width="130" height="30" rx="5" />
            <text className="boxText" x="255" y="34" fontSize="7">ThreadPool worker 1</text>
            <rect className="boxAccent" x="190" y="50" width="130" height="30" rx="5" />
            <text className="boxText" x="255" y="69" fontSize="7">ThreadPool worker 2</text>
            <rect className="boxAccent" x="190" y="85" width="130" height="30" rx="5" />
            <text className="boxText" x="255" y="104" fontSize="7">ThreadPool worker 3</text>
          </svg>
          <figcaption>The dispatcher notifies every handler; the thread pool runs each one without blocking the publisher or the other handlers.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Observer dispatched through a guarded thread pool</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface EventHandler<E> { void handle(E event); } // Observer's observer role

class EventDispatcher<E> {
    private final List<EventHandler<E>> handlers = new ArrayList<>();
    private final ExecutorService pool = Executors.newFixedThreadPool(8); // Thread Pool

    void subscribe(EventHandler<E> handler) { handlers.add(handler); } // Observer's registration

    void publish(E event) {
        for (EventHandler<E> handler : handlers) {
            pool.submit(() -> { // publication returns immediately, handlers run on pool workers
                try {
                    handler.handle(event);
                } catch (RuntimeException e) {
                    log("handler failed on event " + event, e); // isolation: one failure, contained
                }
            });
        }
    }
    private void log(String message, Exception e) { /* structured logging */ }
}

EventDispatcher<UserRegistered> dispatcher = new EventDispatcher<>();
dispatcher.subscribe(event -> sendWelcomeEmail(event.user()));
dispatcher.subscribe(event -> recordAnalytics(event.user()));
dispatcher.subscribe(event -> syncToCrm(event.user())); // slow, but never blocks the other two

dispatcher.publish(new UserRegistered(newUser)); // returns immediately`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Calling handlers synchronously and only later discovering one is slow.</b>{" "}
            Without the thread pool from the start, a single slow handler silently makes every
            event publication as slow as its slowest handler.
          </li>
          <li>
            <b>Sharing one unbounded thread pool across every event type in a large system.</b>{" "}
            A burst of one event type can starve handlers for an unrelated, more urgent event
            &mdash; the same problem Bulkhead addresses, worth considering once the dispatcher
            serves many unrelated event types.
          </li>
          <li>
            <b>Letting an exception in one handler propagate and cancel the others' submitted tasks.</b>{" "}
            Without the try/catch inside each submitted task, one handler's exception is isolated
            to its own thread pool task and never touches the others regardless &mdash; but
            omitting it still loses the error silently unless it's logged explicitly.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>In this design, why does <code>dispatcher.publish()</code> return immediately even though <code>syncToCrm()</code> takes two full seconds to run?</p>
          <p>
            <b>Answer:</b> <code>publish()</code> only submits each handler's invocation to the
            thread pool via <code>pool.submit()</code>, which returns immediately once the task
            is queued &mdash; it does not wait for the task to actually execute. The pool's
            worker threads run each handler independently in the background. So the caller of{" "}
            <code>publish()</code> only pays the cost of looping over the handler list and
            submitting three tasks, not the cost of any handler's actual work, however slow.
          </p>
        </div>
      </section>
      <p className="takeaway">
        An event dispatcher's three requirements &mdash; independent reactions, non-blocking
        publication, and per-handler failure isolation &mdash; are Observer, Thread Pool, and a
        guarded call combined, closing this course the way it opened: start from the actual
        problem, and let the patterns that genuinely fit follow from there.
      </p>
    </div>
  );
}
