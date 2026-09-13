import "../css/Article.css";

export default function HldCaseStudiesChatSystemArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          &ldquo;Two users should be able to exchange messages in real time.&rdquo; What sets this
          apart from a typical CRUD service is that the server has to push data to one specific,
          already-connected client &mdash; not just answer whichever request happens to arrive.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: send and receive messages with low latency, store history so a user can
          scroll back, track delivery state, and still work when the recipient is offline. A plain
          request/response cycle can&rsquo;t push a message to a client that isn&rsquo;t currently
          asking for one, so clients hold open a persistent connection (a WebSocket) to a chat
          server, and that server keeps track of which of its open connections belongs to which
          user.
        </p>
        <p>
          That creates a routing problem: with many chat servers behind a load balancer, a sender
          and recipient&rsquo;s connections are very often held by two different servers. Something
          has to answer &ldquo;which server currently holds this user&rsquo;s socket&rdquo; &mdash;
          a fast connection registry mapping user ID to server ID &mdash; and chat servers need a
          way to hand messages to each other, typically an internal pub/sub layer between them.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Alice's client opens a persistent connection</b> to whichever chat server the load
            balancer assigns her to; that server records &ldquo;Alice &rarr; this server&rdquo; in
            the connection registry.</li>
          <li><b>Alice sends a message to Bob.</b> Her server persists the message first &mdash; so
            it&rsquo;s never lost even if delivery stalls &mdash; then looks up Bob&rsquo;s server
            in the registry.</li>
          <li><b>If Bob is online,</b> the message is handed to Bob&rsquo;s server over the
            internal bus and pushed down his open socket right away.</li>
          <li><b>If Bob is offline,</b> there's no entry for him in the registry, so the message
            simply waits in storage and a push notification is triggered instead.</li>
          <li><b>When Bob reconnects,</b> his client first asks for anything since its last sync
            &mdash; pulling the backlog from storage &mdash; before real-time delivery resumes.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 150" role="img" aria-label="Diagram of two chat servers, each holding one user's socket, both consulting a shared connection registry and exchanging messages over an internal bus, with everything also persisted to a message store." >
          <rect className="box" x="20" y="20" width="110" height="32" rx="6" /><text x="75" y="40" className="boxText" style={{fontSize:"8px"}}>Alice's server</text>
          <rect className="box" x="310" y="20" width="110" height="32" rx="6" /><text x="365" y="40" className="boxText" style={{fontSize:"8px"}}>Bob's server</text>
          <rect className="boxAccent" x="165" y="20" width="110" height="32" rx="6" /><text x="220" y="40" className="boxText" style={{fontSize:"7.5px"}}>Connection registry</text>
          <line className="flowMuted" x1="130" y1="36" x2="165" y2="36" /><line className="flowMuted" x1="275" y1="36" x2="310" y2="36" />
          <line className="flow" x1="130" y1="60" x2="310" y2="60" /><text x="220" y="72" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>internal bus</text>
          <line className="flowMuted" x1="75" y1="52" x2="75" y2="105" /><line className="flowMuted" x1="365" y1="52" x2="365" y2="105" />
          <rect className="box" x="140" y="105" width="160" height="32" rx="6" /><text x="220" y="125" className="boxText" style={{fontSize:"8px"}}>Message store</text>
        </svg>
        <figcaption>Two chat servers consult a shared registry to find each other and exchange messages over an internal bus, while every message is persisted regardless of whether the recipient is online.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Assuming the load balancer alone can route a message to &ldquo;wherever Bob is&rdquo;
          &mdash; a stateless load balancer has no idea which backend instance holds a specific
          open socket, so that mapping has to be tracked explicitly. Treating &ldquo;sent&rdquo;
          and &ldquo;delivered&rdquo; as the same event is another common slip &mdash; a message
          can be safely persisted and considered sent well before it&rsquo;s actually pushed to a
          connected client. Skipping the reconnection step is the third: without a backlog sync, a
          client that briefly drops its connection silently misses everything sent in between.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can't a standard load balancer alone deliver a message to the right recipient here, and what component fills that gap?</p>
        </div>
      </section>
      <p className="takeaway">
        Real-time delivery is a routing and state-tracking problem sitting on top of ordinary
        storage &mdash; get the connection registry right and both the online and offline paths
        follow from it.
      </p>
    </div>
  );
}
