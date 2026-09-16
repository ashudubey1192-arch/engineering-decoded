export default function BehavioralPatternsMediatorArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Mediator centralizes communication between a set of objects into one coordinating object,
          so those objects reference the mediator instead of referencing each other directly. Each
          participant's dependency count drops from "every other participant" to "just the
          mediator" &mdash; a direct, deliberate application of Loose Coupling to a many-to-many
          relationship.
        </p>
        <p>
          Intent: define an object that encapsulates how a set of objects interact, so they don't
          need direct references to each other. Applicability: a group of objects communicates in
          complex, many-to-many ways, and that web of direct references has become hard to follow
          or change.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Centralizing communication, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the direct references forming a tangled web.</b> A chat room where every{" "}
            <code>User</code> holds a reference to every other <code>User</code> to send messages
            directly &mdash; N users means each one tracking N-1 references.
          </li>
          <li>
            <b>Introduce a mediator that each participant knows about instead.</b>{" "}
            <code>ChatRoom</code>, with a <code>broadcast(User sender, String message)</code>{" "}
            method.
          </li>
          <li>
            <b>Have participants send through the mediator, not to each other.</b> A{" "}
            <code>User.send()</code> calls <code>chatRoom.broadcast(this, message)</code>, never
            reaching for another <code>User</code> directly.
          </li>
          <li>
            <b>Let the mediator own the coordination logic.</b> Deciding who receives a message,
            in what order, with what filtering, lives entirely in <code>ChatRoom</code> &mdash;
            no participant needs to know about any other participant's existence.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 460 160" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxAccent" x="180" y="60" width="100" height="40" rx="6" />
            <text className="boxText" x="230" y="83" fontSize="10">ChatRoom</text>
            <rect className="box" x="20" y="10" width="90" height="35" rx="6" />
            <text className="boxText" x="65" y="32" fontSize="9">Alice</text>
            <rect className="box" x="350" y="10" width="90" height="35" rx="6" />
            <text className="boxText" x="395" y="32" fontSize="9">Bob</text>
            <rect className="box" x="20" y="115" width="90" height="35" rx="6" />
            <text className="boxText" x="65" y="137" fontSize="9">Carol</text>
            <rect className="box" x="350" y="115" width="90" height="35" rx="6" />
            <text className="boxText" x="395" y="137" fontSize="9">Dave</text>
            <line className="flow" x1="110" y1="30" x2="180" y2="70" />
            <line className="flow" x1="350" y1="30" x2="280" y2="70" />
            <line className="flow" x1="110" y1="130" x2="180" y2="90" />
            <line className="flow" x1="350" y1="130" x2="280" y2="90" />
          </svg>
          <figcaption>Four participants, zero direct references between them &mdash; every message routes through the mediator.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Replacing a web of references with one mediator</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface ChatMediator { void broadcast(User sender, String message); void register(User user); }

class ChatRoom implements ChatMediator {
    private final List<User> users = new ArrayList<>();
    public void register(User user) { users.add(user); }
    public void broadcast(User sender, String message) {
        for (User user : users) {
            if (user != sender) user.receive(sender.name(), message); // coordination lives here
        }
    }
}

class User {
    private final String name;
    private final ChatMediator mediator; // the only reference this class needs
    User(String name, ChatMediator mediator) { this.name = name; this.mediator = mediator; mediator.register(this); }
    void send(String message) { mediator.broadcast(this, message); }
    void receive(String from, String message) { System.out.println(from + ": " + message); }
    String name() { return name; }
}

ChatRoom room = new ChatRoom();
User alice = new User("Alice", room);
User bob = new User("Bob", room);
alice.send("Hi Bob!"); // Alice never holds a reference to Bob directly`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting the mediator grow into a god class holding all the system's logic.</b>{" "}
            Mediator centralizes coordination between a specific group of collaborators, not every
            piece of business logic in the application.
          </li>
          <li>
            <b>Applying Mediator to a small, stable set of two or three participants with a
            simple relationship.</b> The tangled-web problem this pattern solves needs to actually
            exist; two objects talking to each other rarely need a mediator between them.
          </li>
          <li>
            <b>Letting participants bypass the mediator "just this once" for a direct
            reference.</b> One direct reference reintroduces the coupling the whole pattern was
            meant to eliminate.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does adding a fifth user to the chat room require zero changes to <code>Alice</code>, <code>Bob</code>, <code>Carol</code>, or <code>Dave</code>'s classes?</p>
          <p>
            <b>Answer:</b> None of the <code>User</code> instances hold references to each other
            &mdash; each one only knows about the <code>ChatMediator</code>. Registering a new
            user is handled entirely inside <code>ChatRoom.register()</code>; existing users'
            classes never referenced the set of other participants directly, so there's nothing
            in them that a new participant could invalidate.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Mediator when a group of objects communicates in a tangled, many-to-many way
        &mdash; centralize that coordination into one object, so each participant depends only on
        the mediator, never on each other.
      </p>
    </div>
  );
}
