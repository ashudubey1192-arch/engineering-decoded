export default function ConcurrencyPatternsReactorArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Reactor handles many concurrent I/O sources with a single thread (or a small handful)
          by waiting on all of them at once and dispatching each ready event to its handler, in
          contrast to the thread-per-connection model of spinning up a dedicated thread for every
          client.
        </p>
        <p>
          Intent: demultiplex and dispatch events from multiple sources to their handlers using a
          single-threaded (or small, fixed-thread) event loop, avoiding one thread per connection.
          Applicability: an application handles a large number of mostly-idle connections (chat
          servers, API gateways) where a thread per connection would waste memory on threads that
          spend nearly all their time blocked waiting for input.
        </p>
      </section>
      <section id="concepts">
        <h2>1. One loop, many sources, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Register each event source with a handler.</b> A socket connection is registered
            with a <code>ConnectionHandler</code> that knows how to process data arriving on it.
          </li>
          <li>
            <b>Run a single loop that waits for any source to become ready.</b> The reactor calls
            an OS-level select/poll mechanism that blocks until at least one registered source
            has data.
          </li>
          <li>
            <b>Dispatch each ready event to its handler, then loop again.</b> The reactor never
            blocks on one connection's handler taking too long &mdash; it dispatches and returns
            immediately to waiting on all sources.
          </li>
          <li>
            <b>Keep handlers non-blocking and fast.</b> Since one thread serves every connection,
            a single slow handler stalls every other connection waiting on the same loop.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="15" width="90" height="28" rx="5" />
            <text className="boxText" x="65" y="33" fontSize="8">Conn A</text>
            <rect className="box" x="20" y="55" width="90" height="28" rx="5" />
            <text className="boxText" x="65" y="73" fontSize="8">Conn B</text>
            <rect className="box" x="20" y="95" width="90" height="28" rx="5" />
            <text className="boxText" x="65" y="113" fontSize="8">Conn C</text>
            <line className="flow" x1="110" y1="29" x2="190" y2="65" />
            <line className="flow" x1="110" y1="69" x2="190" y2="70" />
            <line className="flow" x1="110" y1="109" x2="190" y2="75" />
            <rect className="boxAccent" x="190" y="50" width="140" height="40" rx="6" />
            <text className="boxText" x="260" y="74" fontSize="8">Reactor (1 thread)</text>
            <text className="figHint" x="345" y="60">dispatches to</text>
            <text className="figHint" x="345" y="74">the ready handler</text>
            <text className="figHint" x="345" y="88">only</text>
          </svg>
          <figcaption>One thread waits on every connection at once, dispatching only to whichever source actually has data ready.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A minimal single-threaded event loop</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface EventHandler { void onReadable(SelectionKey key) throws IOException; }

class Reactor {
    private final Selector selector = Selector.open();

    Reactor() throws IOException {}

    void register(SelectableChannel channel, EventHandler handler) throws IOException {
        channel.configureBlocking(false);
        channel.register(selector, SelectionKey.OP_READ, handler);
    }

    void run() throws IOException { // single thread serves every registered connection
        while (true) {
            selector.select(); // blocks until at least one channel is ready
            Iterator<SelectionKey> keys = selector.selectedKeys().iterator();
            while (keys.hasNext()) {
                SelectionKey key = keys.next();
                keys.remove();
                if (key.isReadable()) {
                    EventHandler handler = (EventHandler) key.attachment();
                    handler.onReadable(key); // must stay fast -- one thread serves everyone
                }
            }
        }
    }
}

class ChatConnectionHandler implements EventHandler {
    public void onReadable(SelectionKey key) throws IOException {
        SocketChannel channel = (SocketChannel) key.channel();
        ByteBuffer buffer = ByteBuffer.allocate(256);
        int read = channel.read(buffer); // non-blocking read of whatever is available now
        if (read > 0) broadcastToOtherClients(buffer);
    }
    private void broadcastToOtherClients(ByteBuffer data) { /* forward to other connections */ }
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Running blocking work inside a handler.</b> A handler that makes a blocking
            database call stalls the single reactor thread, freezing every other connection
            until that call returns.
          </li>
          <li>
            <b>Using Reactor for a small number of connections doing heavy CPU work each.</b>{" "}
            Reactor's advantage is many idle connections sharing one thread cheaply; a handful of
            CPU-bound connections are often better served by one thread each.
          </li>
          <li>
            <b>Forgetting to remove a processed key from the selected-keys set.</b> Leaving a key
            in the set causes it to be processed again on the next iteration even if nothing new
            has arrived.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does <code>Reactor.run()</code> require every <code>EventHandler.onReadable()</code> implementation to stay fast and non-blocking?</p>
          <p>
            <b>Answer:</b> A single thread runs the entire event loop and serves every registered
            connection. If one handler blocks &mdash; on a slow database call, say &mdash; that
            same thread can't return to <code>selector.select()</code> to service any other
            connection, so every other client stalls until the slow handler finishes. Reactor's
            efficiency depends entirely on handlers completing quickly and yielding back to the
            loop.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reactor serves many mostly-idle connections from one thread by waiting on all of them at
        once and dispatching only ready events &mdash; it trades per-connection threads for a
        strict requirement that every handler stay fast and non-blocking.
      </p>
    </div>
  );
}
