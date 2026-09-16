export default function ConcurrencyPatternsProducerConsumerArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Producer-Consumer decouples the code that generates work from the code that performs
          it, connecting them through a bounded queue &mdash; producers add items without waiting
          for a consumer to be free, consumers take items without knowing who produced them, and
          the queue's bound applies backpressure when production outpaces consumption.
        </p>
        <p>
          Intent: decouple producers and consumers running at different, unpredictable rates by
          buffering work between them. Applicability: one or more threads generate units of work
          at a rate that doesn't match the rate one or more threads can process them, and
          production should not have to block on consumption completing.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Buffering between rates, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Put a bounded, thread-safe queue between the two sides.</b> A{" "}
            <code>BlockingQueue&lt;Job&gt;</code> with a fixed capacity, shared by producers and
            consumers.
          </li>
          <li>
            <b>Producers add without knowing who consumes.</b> A producer thread calls{" "}
            <code>queue.put(job)</code>, which blocks only if the queue is full &mdash; it never
            references a specific consumer.
          </li>
          <li>
            <b>Consumers take without knowing who produced.</b> A consumer thread loops on{" "}
            <code>queue.take()</code>, blocking only when the queue is empty.
          </li>
          <li>
            <b>Let the bound apply backpressure automatically.</b> When the queue is full,{" "}
            <code>put()</code> blocks the producer &mdash; slowing production down to match
            consumption instead of buffering unboundedly in memory.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="45" width="90" height="30" rx="5" />
            <text className="boxText" x="65" y="64" fontSize="8">Producer</text>
            <line className="flow" x1="110" y1="60" x2="180" y2="60" />
            <rect className="boxAccent" x="180" y="35" width="130" height="50" rx="6" />
            <text className="boxText" x="245" y="64" fontSize="8">bounded queue</text>
            <line className="flow" x1="310" y1="60" x2="380" y2="60" />
            <rect className="box" x="380" y="45" width="90" height="30" rx="5" />
            <text className="boxText" x="425" y="64" fontSize="8">Consumer</text>
            <text className="figHint" x="200" y="105">full queue blocks put() --</text>
            <text className="figHint" x="200" y="118">producer slows automatically</text>
          </svg>
          <figcaption>The bounded queue lets producer and consumer run at different speeds, blocking the producer only when the buffer is full.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A bounded queue decoupling producer and consumer rates</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class ImageResizeJob { final String path; ImageResizeJob(String path) { this.path = path; } }

class ImageProducer implements Runnable {
    private final BlockingQueue<ImageResizeJob> queue;
    ImageProducer(BlockingQueue<ImageResizeJob> queue) { this.queue = queue; }
    public void run() {
        for (String path : scanIncomingImages()) {
            try {
                queue.put(new ImageResizeJob(path)); // blocks if queue is full -- backpressure
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        }
    }
    private List<String> scanIncomingImages() { return List.of("a.jpg", "b.jpg"); }
}

class ImageConsumer implements Runnable {
    private final BlockingQueue<ImageResizeJob> queue;
    ImageConsumer(BlockingQueue<ImageResizeJob> queue) { this.queue = queue; }
    public void run() {
        while (true) {
            try {
                ImageResizeJob job = queue.take(); // blocks if queue is empty
                resize(job.path);
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
    }
    private void resize(String path) { /* CPU-heavy resize work */ }
}

BlockingQueue<ImageResizeJob> queue = new ArrayBlockingQueue<>(100); // bounded at 100
new Thread(new ImageProducer(queue)).start();
new Thread(new ImageConsumer(queue)).start();
new Thread(new ImageConsumer(queue)).start(); // multiple consumers can share one queue`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Using an unbounded queue "to be safe."</b> An unbounded queue removes backpressure
            entirely &mdash; a fast producer and a slow consumer just means unlimited memory
            growth until the process runs out of heap.
          </li>
          <li>
            <b>Letting a consumer's exception kill its thread silently.</b> An uncaught exception
            inside the consumer loop should be caught and logged per job, or the consumer thread
            dies and jobs pile up in the queue with nothing draining it.
          </li>
          <li>
            <b>Forgetting that <code>put()</code> and <code>take()</code> can block indefinitely.</b>{" "}
            Code that assumes they return immediately can deadlock a shutdown sequence that's
            waiting on threads that are themselves blocked on the queue.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>In the example, what happens when <code>ImageProducer</code> scans images faster than the two <code>ImageConsumer</code> threads can resize them, given the queue is bounded at 100?</p>
          <p>
            <b>Answer:</b> Once the queue fills to 100 pending jobs, <code>queue.put()</code>{" "}
            blocks the producer thread until a consumer calls <code>take()</code> and frees a
            slot. The producer is automatically slowed to match consumption speed, and memory
            usage stays bounded at 100 pending jobs instead of growing without limit.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Producer-Consumer decouples generation from processing through a bounded queue &mdash;
        the bound isn't incidental, it's what turns a runaway producer into automatic
        backpressure instead of unbounded memory growth.
      </p>
    </div>
  );
}
