export default function EnterprisePatternsSpecificationArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Specification packages a business rule into a reusable object with a single{" "}
          <code>isSatisfiedBy(candidate)</code> method, so the same rule can be used to validate an
          object in memory, filter a collection, or (with translation) build a database query
          &mdash; without duplicating the rule's logic in each of those three places.
        </p>
        <p>
          Intent: express a business rule as a standalone, combinable object rather than scattered
          if-conditions. Applicability: the same selection or validation rule needs to be reused
          across contexts (in-memory filtering, form validation, query building), or several rules
          need to be combined in different combinations at different call sites.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Packaging a rule, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Define a single-method interface for the rule.</b> A{" "}
            <code>Specification&lt;T&gt;</code> with one method,{" "}
            <code>boolean isSatisfiedBy(T candidate)</code>.
          </li>
          <li>
            <b>Implement one specification per rule.</b> An{" "}
            <code>OverdueSpecification</code> checking whether an invoice's due date has passed;
            a <code>HighValueSpecification</code> checking whether its amount exceeds a
            threshold.
          </li>
          <li>
            <b>Combine specifications instead of writing compound conditionals.</b> Default{" "}
            <code>and()</code>/<code>or()</code>/<code>not()</code> methods on the interface let{" "}
            <code>overdue.and(highValue)</code> build a new specification out of two existing
            ones.
          </li>
          <li>
            <b>Reuse the same specification for validation and for filtering.</b> The identical{" "}
            <code>OverdueSpecification</code> checks a single invoice before sending a reminder,
            and filters a whole list of invoices for a collections report.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="20" y="20" width="120" height="30" rx="5" />
            <text className="boxText" x="80" y="40" fontSize="9">OverdueSpec</text>
            <rect className="box" x="20" y="60" width="120" height="30" rx="5" />
            <text className="boxText" x="80" y="80" fontSize="9">HighValueSpec</text>
            <line className="flow" x1="140" y1="35" x2="200" y2="55" />
            <line className="flow" x1="140" y1="75" x2="200" y2="60" />
            <rect className="boxAccent" x="200" y="45" width="140" height="35" rx="6" />
            <text className="boxText" x="270" y="67" fontSize="8">overdue.and(highValue)</text>
            <line className="flow" x1="340" y1="62" x2="400" y2="62" />
            <text className="figHint" x="405" y="58">used for both</text>
            <text className="figHint" x="405" y="72">filter and validate</text>
          </svg>
          <figcaption>Small specifications combine into compound rules, reused wherever the rule needs to be checked.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Combinable rules, reused two ways</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`interface Specification<T> {
    boolean isSatisfiedBy(T candidate);
    default Specification<T> and(Specification<T> other) {
        return candidate -> this.isSatisfiedBy(candidate) && other.isSatisfiedBy(candidate);
    }
}

class OverdueSpecification implements Specification<Invoice> {
    public boolean isSatisfiedBy(Invoice invoice) { return invoice.dueDate().isBefore(LocalDate.now()); }
}
class HighValueSpecification implements Specification<Invoice> {
    private final BigDecimal threshold;
    HighValueSpecification(BigDecimal threshold) { this.threshold = threshold; }
    public boolean isSatisfiedBy(Invoice invoice) { return invoice.amount().compareTo(threshold) > 0; }
}

// Reuse 1: validate a single invoice before sending an urgent reminder
Specification<Invoice> urgent = new OverdueSpecification().and(new HighValueSpecification(new BigDecimal("10000")));
if (urgent.isSatisfiedBy(invoice)) sendUrgentReminder(invoice);

// Reuse 2: filter a whole collection for a collections report -- same specification, no duplicated logic
List<Invoice> urgentInvoices = allInvoices.stream().filter(urgent::isSatisfiedBy).toList();`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Re-writing the same condition as a raw if-statement in several places.</b> Once{" "}
            <code>invoice.dueDate().isBefore(LocalDate.now())</code> appears in three different
            methods, a change to what "overdue" means has to be found and fixed in all three.
          </li>
          <li>
            <b>Building one specification per screen instead of per business rule.</b> A{" "}
            <code>ReportPageSpecification</code> combining unrelated conditions is harder to
            reuse than several small, independently meaningful specifications combined at the
            call site.
          </li>
          <li>
            <b>Using Specification for a rule that's genuinely only checked in one place.</b> A
            single-use, single-site condition doesn't need the interface and combinator
            machinery &mdash; a plain if-statement is clearer.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does reusing <code>OverdueSpecification</code> for both the single-invoice reminder check and the collections-report filter matter more than writing the due-date comparison inline in each place?</p>
          <p>
            <b>Answer:</b> The rule "what counts as overdue" is business logic that can change
            (a grace period added, say). With one <code>OverdueSpecification</code> used in both
            places, that change is made once and both the reminder check and the report filter
            pick it up automatically. Inline conditionals in each place would need the same edit
            made twice, with the risk of the two definitions drifting apart.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Specification turns a business rule into a reusable, combinable object &mdash; worth it
        once a rule needs to be checked in more than one context, or several rules need to be
        combined differently at different call sites.
      </p>
    </div>
  );
}
