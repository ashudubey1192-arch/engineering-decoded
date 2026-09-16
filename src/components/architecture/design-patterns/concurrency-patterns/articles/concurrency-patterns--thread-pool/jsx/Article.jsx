export default function ConcurrencyPatternsThreadPoolArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Thread Pool maintains a fixed set of reusable worker threads that pull tasks from a
          shared queue, instead of creating a brand new thread for every unit of work &mdash;
          bounding how many threads exist at once and reusing them across thousands of short
          tasks.
        </p>
        <p>
          Intent: decouple task submission from task execution by reusing a fixed set of worker
          threads, avoiding the cost of creating and destroying a thread per task. Applicability:
          an application handles many short-lived tasks (HTTP requests, background jobs) and
          spawning a new OS thread per task would exhaust memory or scheduler overhead.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Reusing threads, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Create a fixed number of worker threads up front.</b> A pool of, say, 8 threads,
            sized to the machine's core count or the workload's characteristics.
          </li>
          <li>
            <b>Put a shared, thread-safe queue between submitters and workers.</b> Submitting
            code calls <code>pool.submit(task)</code>, which places the task on the queue and
            returns immediately.
          </li>
          <li>
            <b>Have each worker loop: take a task, run it, take the next.</b> A worker thread
            never exits after one task &mdash; it blocks on the queue, executes whatever arrives,
            and loops back for more.
          </li>
          <li>
            <b>Let the pool absorb bursts without spawning new threads.</b> A hundred tasks
            submitted at once queue up behind the fixed 8 workers rather than becoming a hundred
            competing OS threads.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="50" width="100" height="40" rx="6" />
            <text className="boxText" x="70" y="73" fontSize="9">Task queue</text>
            <line className="flow" x1="120" y1="55" x2="190" y2="30" />
            <line className="flow" x1="120" y1="70" x2="190" y2="70" />
            <line className="flow" x1="120" y1="85" x2="190" y2="110" />
            <rect className="boxAccent" x="190" y="15" width="90" height="30" rx="5" />
            <text className="boxText" x="235" y="34" fontSize="8">Worker 1</text>
            <rect className="boxAccent" x="190" y="55" width="90" height="30" rx="5" />
            <text className="boxText" x="235" y="74" fontSize="8">Worker 2</text>
            <rect className="boxAccent" x="190" y="95" width="90" height="30" rx="5" />
            <text className="boxText" x="235" y="114" fontSize="8">Worker 3</text>
            <text className="figHint" x="300" y="34">fixed count,</text>
            <text className="figHint" x="300" y="48">reused forever</text>
          </svg>
          <figcaption>A fixed set of workers pulls from one queue instead of one thread being created per task.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A minimal fixed-size thread pool</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class FixedThreadPool {
    private final BlockingQueue<Runnable> queue = new LinkedBlockingQueue<>();
    private final List<Thread> workers = new ArrayList<>();
    private volatile boolean running = true;

    FixedThreadPool(int size) {
        for (int i = 0; i < size; i++) {
            Thread worker = new Thread(this::workLoop, "worker-" + i);
            worker.start();
            workers.add(worker);
        }
    }

    void submit(Runnable task) { queue.offer(task); }

    private void workLoop() {
        while (running) {
            try {
                Runnable task = queue.take(); // blocks until a task is available
                task.run();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    void shutdown() { running = false; workers.forEach(Thread::interrupt); }
}

// Usage: 8 reusable workers absorb a burst of 1000 short tasks
FixedThreadPool pool = new FixedThreadPool(8);
for (int i = 0; i < 1000; i++) {
    int taskId = i;
    pool.submit(() -> processImage(taskId)); // queues, never spawns a 1001st thread
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Sizing the pool without regard to the work's nature.</b> A pool sized for
            CPU-bound work (roughly the core count) starves under I/O-bound tasks that spend most
            of their time blocked waiting, not computing.
          </li>
          <li>
            <b>Submitting a task that blocks forever.</b> One worker stuck waiting on a task that
            never completes permanently shrinks the effective pool size by one.
          </li>
          <li>
            <b>Using an unbounded queue in front of a pool under sustained overload.</b> If
            submissions consistently outpace what the workers can drain, an unbounded queue just
            delays an out-of-memory error instead of applying backpressure.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does submitting 1000 tasks to an 8-worker <code>FixedThreadPool</code> never create more than 8 threads, even though all 1000 tasks eventually run?</p>
          <p>
            <b>Answer:</b> The 8 worker threads are created once, in the constructor, and never
            exit their loop. Each <code>submit()</code> call only adds a <code>Runnable</code> to
            the shared queue; the workers pull from that queue one task at a time and reuse
            themselves for the next one, so the thread count stays fixed regardless of how many
            tasks are submitted.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Thread Pool bounds concurrency to a fixed, reusable set of workers pulling from a shared
        queue &mdash; the win is avoiding per-task thread creation cost, but the pool's size has
        to match whether the work is CPU-bound or I/O-bound to actually help.
      </p>
    </div>
  );
}
