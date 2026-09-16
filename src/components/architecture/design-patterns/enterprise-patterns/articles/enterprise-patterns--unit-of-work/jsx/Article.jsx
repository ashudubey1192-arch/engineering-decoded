export default function EnterprisePatternsUnitOfWorkArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Unit of Work tracks every object read or changed during a business transaction, then
          coordinates writing out those changes as a single, consistent batch &mdash; deciding
          what to insert, update, and delete, and running it all in one database transaction so
          nothing is written halfway.
        </p>
        <p>
          Intent: maintain a list of objects affected by a business transaction and coordinate
          the writing out of changes and the resolution of concurrency problems. Applicability: a
          single business operation touches several objects, and each object's repository saving
          itself independently risks partial writes if something fails midway.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Tracking changes, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Register every object touched during the transaction.</b> A{" "}
            <code>UnitOfWork</code> keeps three lists: <code>newObjects</code>,{" "}
            <code>dirtyObjects</code>, <code>removedObjects</code>.
          </li>
          <li>
            <b>Let domain code mark objects, not save them.</b> Calling{" "}
            <code>unitOfWork.registerDirty(order)</code> after changing an{" "}
            <code>Order</code>, instead of calling <code>orderRepository.save(order)</code>{" "}
            immediately.
          </li>
          <li>
            <b>Commit once, at the end of the business operation.</b>{" "}
            <code>unitOfWork.commit()</code> opens one database transaction, applies every
            registered insert, update, and delete, then commits or rolls back as a whole.
          </li>
          <li>
            <b>Let it order the writes correctly.</b> Inserts for new objects happen before
            updates that reference them; deletes happen last, so foreign-key constraints aren't
            violated mid-commit.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="120" height="30" rx="5" />
            <text className="boxText" x="80" y="40" fontSize="9">register new/dirty</text>
            <rect className="box" x="20" y="60" width="120" height="30" rx="5" />
            <text className="boxText" x="80" y="80" fontSize="9">register removed</text>
            <line className="flow" x1="140" y1="35" x2="200" y2="70" />
            <line className="flow" x1="140" y1="75" x2="200" y2="80" />
            <rect className="boxAccent" x="200" y="55" width="130" height="40" rx="6" />
            <text className="boxText" x="265" y="79" fontSize="9">UnitOfWork.commit()</text>
            <line className="flow" x1="330" y1="75" x2="400" y2="75" />
            <text className="figHint" x="405" y="70">one DB</text>
            <text className="figHint" x="405" y="85">transaction</text>
          </svg>
          <figcaption>Changes accumulate on the unit of work; nothing hits the database until commit runs them as one transaction.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Batching three changes into one commit</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class UnitOfWork {
    private final List<Object> newObjects = new ArrayList<>();
    private final List<Object> dirtyObjects = new ArrayList<>();
    private final List<Object> removedObjects = new ArrayList<>();

    void registerNew(Object o) { newObjects.add(o); }
    void registerDirty(Object o) { if (!newObjects.contains(o)) dirtyObjects.add(o); }
    void registerRemoved(Object o) { removedObjects.add(o); }

    void commit(Connection connection) throws SQLException {
        connection.setAutoCommit(false);
        try {
            for (Object o : newObjects) insert(connection, o);
            for (Object o : dirtyObjects) update(connection, o);
            for (Object o : removedObjects) delete(connection, o);
            connection.commit();
        } catch (SQLException e) {
            connection.rollback(); // partial writes never reach the database
            throw e;
        }
    }
    private void insert(Connection c, Object o) { /* INSERT statement */ }
    private void update(Connection c, Object o) { /* UPDATE statement */ }
    private void delete(Connection c, Object o) { /* DELETE statement */ }
}

// Usage: transferring loyalty points between two accounts
UnitOfWork uow = new UnitOfWork();
sender.deductPoints(500);
receiver.addPoints(500);
uow.registerDirty(sender);
uow.registerDirty(receiver);
uow.commit(connection); // both updates succeed together, or neither does`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Saving each object through its own repository as soon as it changes.</b> That
            reintroduces the exact problem Unit of Work solves: if the second save fails, the
            first has already committed, leaving the database in an inconsistent state.
          </li>
          <li>
            <b>Sharing one Unit of Work across unrelated business operations.</b> A unit of work
            should map to a single transaction's lifetime &mdash; typically one request or one
            use case, not the whole application's uptime.
          </li>
          <li>
            <b>Registering the same object as both dirty and new.</b> A freshly created object
            only needs an insert; tracking it as dirty too risks issuing a pointless or incorrect
            update right after the insert.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>In the loyalty-points example, why is it wrong for <code>sender.deductPoints()</code> and <code>receiver.addPoints()</code> to each call their own repository's <code>save()</code> immediately, instead of registering with a shared <code>UnitOfWork</code>?</p>
          <p>
            <b>Answer:</b> If each save runs independently and the second one fails (a lost
            connection, a constraint violation), the first has already committed &mdash; points
            vanish from the sender without appearing for the receiver. Registering both with one
            <code>UnitOfWork</code> and committing once means the database transaction guarantees
            both updates land together or neither does.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Unit of Work collects every change from a business operation and commits them as one
        transaction &mdash; the win isn't convenience, it's guaranteeing that related writes
        succeed or fail together instead of leaving the database half-updated.
      </p>
    </div>
  );
}
