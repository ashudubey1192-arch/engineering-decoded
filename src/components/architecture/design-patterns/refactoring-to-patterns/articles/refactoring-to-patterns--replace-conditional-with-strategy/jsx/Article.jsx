export default function RefactoringToPatternsReplaceConditionalWithStrategyArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Replace Conditional with Strategy takes a method with a growing if/else or switch chain
          selecting behavior by type or mode, and extracts each branch into its own class
          implementing a shared interface &mdash; turning "add a case" into "add a class" instead
          of editing a method that keeps growing.
        </p>
        <p>
          This is the same transformation the course introduction promised for{" "}
          <code>discountFor(Order, MembershipTier)</code>, and the same shape covered in
          Behavioral Patterns' Strategy article &mdash; this section is about recognizing the
          refactoring opportunity in existing code, not the pattern's structure itself.
        </p>
      </section>
      <section id="concepts">
        <h2>1. The refactoring, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify the conditional selecting behavior by type.</b> A chain of{" "}
            <code>if (tier == GOLD) ... else if (tier == SILVER) ...</code> where each branch
            computes something differently based on the same discriminator.
          </li>
          <li>
            <b>Define an interface with one method matching the conditional's job.</b> A{" "}
            <code>DiscountPolicy</code> interface with{" "}
            <code>BigDecimal apply(Order order)</code>.
          </li>
          <li>
            <b>Move each branch's logic into its own implementing class.</b> The{" "}
            <code>GOLD</code> branch becomes <code>GoldDiscountPolicy.apply()</code>, and so on
            for every other branch.
          </li>
          <li>
            <b>Replace the conditional with a lookup, and delete the old branches.</b> A map from{" "}
            <code>MembershipTier</code> to <code>DiscountPolicy</code> replaces the if/else
            entirely; the calling code just calls <code>policy.apply(order)</code>.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 480 130" xmlns="http://www.w3.org/2000/svg">
            <rect className="boxWarn" x="20" y="40" width="150" height="50" rx="6" />
            <text className="boxText" x="95" y="62" fontSize="8">growing if/else chain</text>
            <text className="boxText" x="95" y="78" fontSize="7">one method, many branches</text>
            <line className="flow" x1="170" y1="65" x2="240" y2="65" />
            <rect className="box" x="240" y="15" width="120" height="25" rx="5" />
            <text className="boxText" x="300" y="32" fontSize="8">GoldDiscountPolicy</text>
            <rect className="box" x="240" y="50" width="120" height="25" rx="5" />
            <text className="boxText" x="300" y="67" fontSize="8">SilverDiscountPolicy</text>
            <rect className="box" x="240" y="85" width="120" height="25" rx="5" />
            <text className="boxText" x="300" y="102" fontSize="8">StandardDiscountPolicy</text>
          </svg>
          <figcaption>Each branch becomes its own class implementing the same interface; a new tier is a new class, not a new branch.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. Before and after</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`// Before: every new tier means editing this method again
BigDecimal discountFor(Order order, MembershipTier tier) {
    if (tier == MembershipTier.GOLD) return order.total().multiply(new BigDecimal("0.20"));
    else if (tier == MembershipTier.SILVER) return order.total().multiply(new BigDecimal("0.10"));
    else return BigDecimal.ZERO;
}

// After: the conditional is gone, replaced by polymorphism
interface DiscountPolicy { BigDecimal apply(Order order); }

class GoldDiscountPolicy implements DiscountPolicy {
    public BigDecimal apply(Order order) { return order.total().multiply(new BigDecimal("0.20")); }
}
class SilverDiscountPolicy implements DiscountPolicy {
    public BigDecimal apply(Order order) { return order.total().multiply(new BigDecimal("0.10")); }
}
class StandardDiscountPolicy implements DiscountPolicy {
    public BigDecimal apply(Order order) { return BigDecimal.ZERO; }
}

Map<MembershipTier, DiscountPolicy> policies = Map.of(
    MembershipTier.GOLD, new GoldDiscountPolicy(),
    MembershipTier.SILVER, new SilverDiscountPolicy(),
    MembershipTier.STANDARD, new StandardDiscountPolicy()
);
BigDecimal discount = policies.get(tier).apply(order); // no conditional at the call site`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Refactoring a conditional with only two stable branches that will never grow.</b>{" "}
            A simple, permanent two-way if/else doesn't need an interface and two classes; the
            refactoring earns its cost once branches multiply or change independently.
          </li>
          <li>
            <b>Leaving the old conditional in place "just in case" alongside the new classes.</b>{" "}
            A half-finished refactor with both the conditional and the strategy classes doubles
            the places a bug can hide.
          </li>
          <li>
            <b>Forgetting to move shared logic that isn't part of the differing behavior.</b> If
            every branch also logs or validates identically, that shared step belongs in the
            calling code or a common base, not duplicated across every new strategy class.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>After this refactoring, what changes are needed to add a new <code>PLATINUM</code> tier with its own discount rate?</p>
          <p>
            <b>Answer:</b> Add one new class, <code>PlatinumDiscountPolicy</code>, implementing{" "}
            <code>DiscountPolicy</code>, and add one entry to the <code>policies</code> map.
            Nothing in <code>GoldDiscountPolicy</code>, <code>SilverDiscountPolicy</code>, or any
            other existing class needs to change &mdash; compare that to the original version,
            where adding a tier meant editing the <code>discountFor()</code> method itself and
            risking every existing branch in the process.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Replace Conditional with Strategy turns a growing if/else chain into one class per
        branch &mdash; worth doing once the branches multiply or change independently, not for a
        conditional that's small and genuinely stable.
      </p>
    </div>
  );
}
