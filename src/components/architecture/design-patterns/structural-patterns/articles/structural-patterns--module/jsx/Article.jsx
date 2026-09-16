export default function StructuralPatternsModuleArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Module groups related functionality behind a small, deliberate public surface, hiding
          its internal classes and helper logic from everything outside. Unlike the other
          structural patterns in this section, Module isn't about relating a handful of objects to
          each other &mdash; it's about drawing one boundary around a whole cluster of them, so
          the cluster can be understood, changed, and tested as a unit.
        </p>
        <p>
          Intent: encapsulate a related group of classes behind a minimal public interface.
          Applicability: a set of classes collaborates closely to provide one capability, and
          nothing outside that capability should depend on their internal structure.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Drawing a module boundary, step by step</h2>
        <ol className="stepList">
          <li>
            <b>Identify a cluster of classes that only make sense together.</b> Tax calculation
            might involve a <code>TaxRateTable</code>, a <code>JurisdictionResolver</code>, and a{" "}
            <code>TaxRuleEngine</code> &mdash; three classes that only ever collaborate with each
            other.
          </li>
          <li>
            <b>Decide the smallest public surface the rest of the codebase actually needs.</b> One
            method: <code>TaxModule.calculate(Order order)</code> &mdash; nothing about rate
            tables or jurisdiction resolution needs to be visible outside.
          </li>
          <li>
            <b>Make everything else package-private (or the language's equivalent
            visibility).</b> <code>TaxRateTable</code>, <code>JurisdictionResolver</code>, and{" "}
            <code>TaxRuleEngine</code> become invisible outside the module's package.
          </li>
          <li>
            <b>Let the compiler, not a naming convention, enforce the boundary.</b> Code outside
            the module that tries to import <code>TaxRateTable</code> directly should fail to
            compile, not just violate an unenforced guideline.
          </li>
        </ol>
        <figure className="fig">
          <svg viewBox="0 0 460 150" xmlns="http://www.w3.org/2000/svg">
            <rect className="box" x="30" y="20" width="260" height="110" rx="8" />
            <text className="figLabel" x="160" y="14">tax module (package)</text>
            <rect className="boxAccent" x="50" y="35" width="100" height="30" rx="5" />
            <text className="boxText" x="100" y="55" fontSize="9">TaxModule</text>
            <text className="figHint" x="100" y="30">public</text>
            <text className="boxText" x="220" y="55" fontSize="8">TaxRateTable</text>
            <text className="boxText" x="220" y="75" fontSize="8">JurisdictionResolver</text>
            <text className="boxText" x="220" y="95" fontSize="8">TaxRuleEngine</text>
            <text className="figHint" x="220" y="112">package-private</text>
            <line className="flow" x1="350" y1="60" x2="290" y2="50" />
            <text className="figHint" x="400" y="55">rest of codebase</text>
          </svg>
          <figcaption>Only TaxModule is visible outside the package &mdash; every collaborator behind it is invisible by construction, not convention.</figcaption>
        </figure>
      </section>
      <section id="example">
        <h2>2. One public entry point, everything else hidden</h2>
        <span className="codeLabel">JAVA</span>
        <div className="codeBlock">
          <pre>{`package com.shop.tax; // the module boundary is the package boundary

class TaxRateTable { double rateFor(Jurisdiction j) { return 0.0725; } } // package-private
class JurisdictionResolver { Jurisdiction resolve(Address a) { return Jurisdiction.CA; } } // package-private

public class TaxModule { // the module's only public class
    private final TaxRateTable rates = new TaxRateTable();
    private final JurisdictionResolver resolver = new JurisdictionResolver();

    public double calculate(Order order) {
        Jurisdiction jurisdiction = resolver.resolve(order.shippingAddress());
        return order.subtotal() * rates.rateFor(jurisdiction);
    }
}

// package com.shop.checkout -- cannot do this, TaxRateTable is invisible here:
// TaxRateTable rates; // compile error
// must instead depend only on:
double tax = new TaxModule().calculate(order);`}</pre>
        </div>
      </section>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <ul>
          <li>
            <b>Making every class public "to be safe."</b> That's the single most common way a
            module boundary erodes &mdash; once one internal class is reachable from outside,
            some caller will eventually depend on it directly.
          </li>
          <li>
            <b>Drawing the module boundary around a technical layer instead of a capability.</b> A
            "controllers module" and a "repositories module" spanning many unrelated features
            recreates the tangled dependencies Module is meant to prevent.
          </li>
          <li>
            <b>Growing the public surface reactively, one method at a time, without reconsidering
            the boundary.</b> Each new public method on <code>TaxModule</code> should be a
            deliberate decision, not a quick fix for whatever the calling code currently needs.
          </li>
        </ul>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <small>KNOWLEDGE CHECK</small>
          <p>Why does code in <code>com.shop.checkout</code> get a compile error when it tries to reference <code>TaxRateTable</code> directly, even though both packages are in the same codebase?</p>
          <p>
            <b>Answer:</b> <code>TaxRateTable</code> is declared with package-private (default)
            visibility, so only code inside <code>com.shop.tax</code> can see it. Being in the
            same overall codebase doesn't grant access &mdash; the module boundary is enforced by
            the language's visibility rules, not by a convention that could be silently violated.
          </p>
        </div>
      </section>
      <p className="takeaway">
        Reach for Module when a cluster of classes only makes sense together &mdash; decide the
        smallest public surface the rest of the codebase actually needs, and let the compiler
        enforce that nothing else is reachable.
      </p>
    </div>
  );
}
