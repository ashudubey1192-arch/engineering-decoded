export default function EnterprisePatternsDataMapperArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Data Mapper moves data between in-memory objects and a database while keeping them
          independent of each other and of the mapper itself &mdash; the domain object has no
          idea it's being persisted, and the database schema is free to differ from the object's
          shape entirely.
        </p>
        <p>
          Intent: separate an in-memory domain object from the database it's persisted to, with a
          mapper that handles all translation between them. Applicability: domain objects need to
          stay free of persistence concerns (no base class, no annotations, no database calls),
          especially when the object model and the table structure don't line up one-to-one.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Separating the object from its storage, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Write the domain object with zero persistence awareness.</b> A plain{" "}
            <code>Customer</code> class with fields, behavior, and no reference to SQL,
            connections, or a base <code>Entity</code> class.
          </li>
          <li>
            <b>Write a mapper that knows both shapes.</b> A <code>CustomerMapper</code> with{" "}
            <code>find(id)</code> and <code>save(customer)</code>, translating between the{" "}
            <code>Customer</code> object and a <code>customers</code> table row.
          </li>
          <li>
            <b>Let the mapper handle mismatches between object and table.</b> If{" "}
            <code>Customer</code> has an <code>Address</code> object but the table stores{" "}
            <code>street</code>, <code>city</code>, <code>zip</code> as separate columns, the
            mapper assembles and disassembles that difference &mdash; the domain object never
            knows.
          </li>
          <li>
            <b>Keep the domain object testable with no database at all.</b> Since{" "}
            <code>Customer</code> has no persistence code, it can be constructed and tested in
            plain unit tests with no database, no mocks of database calls, nothing.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 140" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="50" width="110" height="40" rx="6" />
            <text className="boxText" x="75" y="73" fontSize="9">Customer (plain)</text>
            <line className="flow" x1="130" y1="70" x2="190" y2="70" />
            <rect className="boxAccent" x="190" y="50" width="120" height="40" rx="6" />
            <text className="boxText" x="250" y="73" fontSize="9">CustomerMapper</text>
            <line className="flow" x1="310" y1="70" x2="370" y2="70" />
            <rect className="box" x="370" y="50" width="90" height="40" rx="6" />
            <text className="boxText" x="415" y="73" fontSize="9">customers table</text>
          </svg>
          <figcaption>Customer and the table never talk directly &mdash; the mapper is the only thing that knows both shapes.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. A mapper translating between object and row</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`class Customer { // no persistence code anywhere in this class
    private final String id;
    private String name;
    private Address address;
    Customer(String id, String name, Address address) {
        this.id = id; this.name = name; this.address = address;
    }
    String id() { return id; }
    Address address() { return address; }
}

record Address(String street, String city, String zip) {}

class CustomerMapper {
    private final Connection connection;
    CustomerMapper(Connection connection) { this.connection = connection; }

    Customer find(String id) {
        // SELECT name, street, city, zip FROM customers WHERE id = ?
        String name = "Ada Lovelace";
        Address address = new Address("12 Analytical St", "London", "SW1A"); // assembled from columns
        return new Customer(id, name, address);
    }

    void save(Customer customer) {
        Address a = customer.address();
        // UPDATE customers SET name = ?, street = ?, city = ?, zip = ? WHERE id = ?
        // customer.name, a.street(), a.city(), a.zip(), customer.id() -- disassembled into columns
    }
}`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Letting the domain object know its own table or column names.</b> The moment{" "}
            <code>Customer</code> references a column name or SQL fragment, the separation Data
            Mapper exists to provide is gone.
          </li>
          <li>
            <b>Adding a mapper when Active Record's simpler save() would do.</b> If the object
            model matches the table structure closely and persistence-awareness in the domain
            object isn't a real cost, a mapper adds indirection without buying anything back.
          </li>
          <li>
            <b>Putting business logic inside the mapper.</b> A mapper's only job is translating
            shapes; validation, calculations, and business rules belong on the domain object or
            in a service, not scattered across mapper methods.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why can <code>Customer</code> in this example be constructed and tested in a plain unit test with no database involved at all?</p>
          <p>
            <b>Answer:</b> <code>Customer</code> contains no persistence code &mdash; no SQL, no
            connection, no base entity class. All translation between the object and the{" "}
            <code>customers</code> table lives in <code>CustomerMapper</code>, so testing{" "}
            <code>Customer</code>'s behavior never requires a database, and testing the mapper's
            translation logic never requires exercising <code>Customer</code>'s business rules.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Data Mapper keeps domain objects free of persistence code by pushing all translation
        into a dedicated mapper &mdash; worth it when the object model and the table structure
        diverge, or when persistence-free domain objects matter more than a simpler save() call.
      </p>
    </div>
  );
}
