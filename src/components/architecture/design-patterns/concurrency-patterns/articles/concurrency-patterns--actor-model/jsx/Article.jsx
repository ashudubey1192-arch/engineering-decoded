export default function ConcurrencyPatternsActorModelArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Actor Model wraps mutable state inside independent actors that communicate only by
          sending asynchronous messages, never by sharing memory directly &mdash; each actor
          processes its own mailbox one message at a time, so the state inside any single actor
          is never touched by two threads at once, without a single explicit lock anywhere.
        </p>
        <p>
          Intent: eliminate shared-memory race conditions by confining mutable state to
          independent actors that interact only through asynchronous message passing.
          Applicability: a system has many independent units of state (accounts, sessions, game
          entities) that need concurrent updates, and coordinating them with locks has become
          error-prone or is producing contention.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Isolating state behind messages, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Give each actor its own private state and a mailbox.</b> An{" "}
            <code>AccountActor</code> holds a <code>balance</code> field that no other actor or
            thread ever touches directly.
          </li>
          <li>
            <b>Let other code only send messages, never call methods on the state directly.</b>{" "}
            <code>accountActor.tell(new Deposit(100))</code> queues a message; nothing outside
            the actor reads or writes <code>balance</code> itself.
          </li>
          <li>
            <b>Process one message at a time, in order.</b> The actor's own single-threaded
            processing loop takes one message off its mailbox, applies it to its state, then
            takes the next &mdash; so no two messages ever mutate the state concurrently.
          </li>
          <li>
            <b>Let actors talk to each other only through messages too.</b> An{" "}
            <code>AccountActor</code> transferring funds sends a <code>Deposit</code> message to
            another <code>AccountActor</code> rather than reaching into its state.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="40" width="90" height="30" rx="5" />
            <text className="boxText" x="65" y="59" fontSize="8">Caller</text>
            <line className="flow" x1="110" y1="55" x2="170" y2="55" />
            <text className="figHint" x="115" y="45">tell(Deposit)</text>
            <rect className="boxAccent" x="170" y="30" width="130" height="50" rx="6" />
            <text className="boxText" x="235" y="50" fontSize="8">mailbox</text>
            <text className="boxText" x="235" y="66" fontSize="8">AccountActor state</text>
            <line className="flowMuted" x1="300" y1="55" x2="360" y2="55" />
            <text className="figHint" x="365" y="50">one message</text>
            <text className="figHint" x="365" y="64">at a time</text>
          </svg>
          <figcaption>State lives only inside the actor; callers send messages instead of touching it, and messages process strictly one at a time.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. An account actor processing its mailbox sequentially</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`sealed interface AccountMessage permits Deposit, Withdraw {}
record Deposit(int amount) implements AccountMessage {}
record Withdraw(int amount) implements AccountMessage {}

class AccountActor {
    private int balance = 0; // never touched outside this class's own processing thread
    private final BlockingQueue<AccountMessage> mailbox = new LinkedBlockingQueue<>();
    private final Thread processingThread;

    AccountActor() {
        processingThread = new Thread(this::processLoop);
        processingThread.start();
    }

    void tell(AccountMessage message) { mailbox.offer(message); } // only way in

    private void processLoop() {
        while (true) {
            try {
                AccountMessage message = mailbox.take(); // one message at a time, no locks needed
                if (message instanceof Deposit d) balance += d.amount();
                else if (message instanceof Withdraw w) {
                    if (w.amount() <= balance) balance -= w.amount();
                }
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; }
        }
    }
}

// Usage: many threads send messages concurrently -- balance is still never raced
AccountActor account = new AccountActor();
account.tell(new Deposit(500));   // from thread A
account.tell(new Withdraw(200));  // from thread B, processed strictly after the deposit above`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Exposing the actor's internal state through a getter.</b> A{" "}
            <code>getBalance()</code> method that returns the raw field reintroduces exactly the
            race condition actors are meant to eliminate &mdash; state should only be reported
            back through a response message.
          </li>
          <li>
            <b>Making a message handler block on another actor synchronously.</b> Waiting inside{" "}
            <code>processLoop()</code> for a reply from another actor can deadlock if that actor
            is, in turn, waiting on a reply from this one.
          </li>
          <li>
            <b>Using actors for state that's naturally shared and read by everyone constantly.</b>{" "}
            Actors shine for state owned by one clear entity; forcing every read of a
            widely-shared value through a message round-trip adds latency for little benefit.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why is <code>balance</code> in <code>AccountActor</code> safe from race conditions even though multiple threads call <code>tell()</code> on the same actor concurrently, with no lock anywhere in the class?</p>
          <p>
            <b>Answer:</b> Calling threads only ever place messages on the mailbox via{" "}
            <code>tell()</code>; they never read or write <code>balance</code> directly. The
            single <code>processingThread</code> is the only code that ever touches{" "}
            <code>balance</code>, and it processes messages one at a time from the queue, so
            there's never a moment where two threads mutate the field simultaneously &mdash; the
            isolation comes from confinement to one thread, not from locking.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Actor Model confines mutable state to one actor processing its mailbox sequentially
        &mdash; concurrency safety comes from isolation and message passing, not locks, but it
        only pays off when state naturally belongs to a single, clearly-owning entity.
      </p>
    </div>
  );
}
