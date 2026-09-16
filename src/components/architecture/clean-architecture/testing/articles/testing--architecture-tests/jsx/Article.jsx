export default function TestingArchitectureTestsArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Code review catches Dependency Rule violations when a reviewer happens to notice — architecture tests catch every single one, automatically, on every build.</p>
        <p>Every earlier lesson in this course has argued that the Dependency Rule is checkable, not aspirational: it's a fact about the import graph. This lesson makes that literal by writing a test — a real, runnable JUnit test backed by ArchUnit — that fails the build the moment an entity class imports an adapter class, with no human required to notice.</p>
      </section>

      <section id="concepts">
        <h2>Key concepts</h2>
        <h3>Why code review isn't enough on its own</h3>
        <p>A human reviewer catches a stray <code>import com.engineeringdecoded.orders.adapter.persistence.JpaOrderRepository;</code> inside an entity class only if they happen to scroll past it, know to look for it, and aren't rushing to approve a large diff before a deadline. Under real-world pressure, all three of those conditions fail regularly. Discipline that depends entirely on human vigilance erodes — not because engineers are careless, but because attention is a limited resource and architecture violations don't announce themselves.</p>
        <h3>ArchUnit: architecture rules as executable tests</h3>
        <p>ArchUnit is a Java library that lets you write assertions about your codebase's structure — which packages may depend on which, which classes must implement which interfaces, naming conventions — and run them as ordinary JUnit tests. It works by scanning compiled bytecode, building the actual class dependency graph (the same graph discussed in the Compile-Time Dependencies lesson), and checking it against rules you declare in code.</p>
        <h3>Encoding the Dependency Rule directly</h3>
        <p>The core Clean Architecture rule translates almost word-for-word into an ArchUnit rule: classes residing in a package matching <code>..entity..</code> must not depend on classes residing in a package matching <code>..adapter..</code>. The same shape of rule extends naturally: use cases must not depend on adapters; nothing inward may depend on <code>..framework..</code> or on Spring/JPA packages directly. Each of these becomes one <code>ArchRule</code>, and once written, it runs on every single build — pull request, merge, nightly job — forever, without anyone having to remember to check.</p>
        <h3>What this buys you that review can't</h3>
        <p>An architecture test is exhaustive (it checks the whole codebase's import graph, not just the files a reviewer opened), immediate (it fails the build the moment the violation is introduced, not weeks later when someone notices in passing), and self-documenting (the rule itself, written as code, is the specification — new team members can read the architecture test suite to learn the constraints instead of relying on tribal knowledge or a wiki page that's gone stale).</p>
        <h3>Where architecture tests fit relative to the rest of the suite</h3>
        <p>They're a different kind of test from anything earlier in this section — not testing behavior of a single class, but testing a structural property of the whole codebase. They're typically fast (bytecode scanning, no I/O) and belong in the same fast feedback loop as unit tests, run on every commit rather than reserved for a slow nightly job. A healthy Clean Architecture codebase runs a handful of these rules continuously, turning what would otherwise be a review-time judgment call into a hard build failure.</p>

        <div className="svgDiagram">
          <svg viewBox="0 0 640 260" role="img" aria-label="An entity package box and an adapter package box with a red forbidden arrow crossed out between them, guarded by an ArchUnit shield icon that fails the build when the rule is violated">
            <rect x="70" y="90" width="180" height="60" rx="6" className="accentStroke" fill="none" strokeWidth="2" />
            <text x="160" y="115" textAnchor="middle" fontSize="10" className="accentFill">..entity..</text>
            <text x="160" y="132" textAnchor="middle" fontSize="8" className="mutedFill">Order, OrderLine</text>

            <rect x="390" y="90" width="180" height="60" rx="6" className="mutedStroke" fill="none" strokeWidth="1.5" />
            <text x="480" y="115" textAnchor="middle" fontSize="10" className="mutedFill">..adapter..</text>
            <text x="480" y="132" textAnchor="middle" fontSize="8" className="mutedFill">JpaOrderRepository</text>

            <line x1="250" y1="120" x2="386" y2="120" className="mutedStroke" strokeWidth="2" strokeDasharray="4 3" />
            <line x1="300" y1="105" x2="336" y2="135" className="mutedStroke" strokeWidth="2.5" />
            <line x1="336" y1="105" x2="300" y2="135" className="mutedStroke" strokeWidth="2.5" />
            <text x="318" y="95" textAnchor="middle" fontSize="8" className="mutedFill">forbidden</text>

            <polygon points="320,175 300,195 300,215 320,230 340,215 340,195" fill="none" className="accentStroke" strokeWidth="2" />
            <text x="320" y="200" textAnchor="middle" fontSize="8" className="accentFill">ArchUnit</text>
            <text x="320" y="212" textAnchor="middle" fontSize="7" className="accentFill">rule</text>

            <defs>
              <marker id="atArrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                <path d="M0,0 L8,4 L0,8 Z" className="accentFill" />
              </marker>
            </defs>
            <line x1="320" y1="175" x2="320" y2="155" className="accentStroke" strokeWidth="1.5" markerEnd="url(#atArrow)" />

            <text x="320" y="25" textAnchor="middle" fontSize="12" className="accentFill">The rule enforced in CI, not just in review</text>
          </svg>
          <p className="diagramCaption">An ArchUnit rule scans the compiled bytecode and fails the build if entity code ever depends on adapter code.</p>
        </div>
      </section>

      <section id="example">
        <h2>Practical example</h2>
        <p>An ArchUnit test asserting the core Dependency Rule for the order-management codebase, runnable as a normal JUnit test.</p>
        <pre><code>{`package com.engineeringdecoded.orders.architecture;

import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "com.engineeringdecoded.orders")
class DependencyRuleTest {

    @ArchTest
    static final ArchRule entities_must_not_depend_on_adapters =
        noClasses().that().resideInAPackage("..entity..")
            .should().dependOnClassesThat().resideInAPackage("..adapter..");

    @ArchTest
    static final ArchRule entities_must_not_depend_on_use_cases =
        noClasses().that().resideInAPackage("..entity..")
            .should().dependOnClassesThat().resideInAPackage("..usecase..");

    @ArchTest
    static final ArchRule use_cases_must_not_depend_on_adapters =
        noClasses().that().resideInAPackage("..usecase..")
            .should().dependOnClassesThat().resideInAPackage("..adapter..");

    @ArchTest
    static final ArchRule use_cases_must_not_depend_on_spring =
        noClasses().that().resideInAPackage("..usecase..")
            .should().dependOnClassesThat().resideInAPackage("org.springframework..");
}

// Running this suite against a codebase where someone added:
//   package com.engineeringdecoded.orders.entity;
//   import com.engineeringdecoded.orders.adapter.persistence.OrderJpaEntity;
// produces a build failure with a message naming the exact offending class
// and the exact forbidden dependency — no human had to notice it first.`}</code></pre>
        <p>Each <code>ArchRule</code> reads almost like the English statement of the constraint it enforces — that readability is deliberate, and it's what makes the rule suite double as living documentation.</p>
      </section>

      <section id="mistakes">
        <h2>Common mistakes</h2>
        <div className="mistakeGrid">
          <div><b>MISTAKE</b><h3>Writing architecture tests once and never running them in CI</h3><p>An ArchUnit suite that only runs when someone remembers to run it locally provides none of the "automatic, exhaustive, immediate" value this lesson describes — it has to be wired into the same pipeline that gates merges.</p></div>
          <div><b>MISTAKE</b><h3>Rules so loose they never actually catch anything</h3><p>A rule like "entities should generally avoid adapters" written loosely, or scoped to the wrong package glob, can pass every build while real violations slip through — the rule needs to name the exact packages and be verified against a deliberately broken example at least once.</p></div>
          <div><b>MISTAKE</b><h3>Treating a passing architecture-test suite as proof the whole architecture is sound</h3><p>ArchUnit rules catch dependency-direction violations; they don't catch a use case with poor cohesion, an entity with leaky validation, or a controller doing too much. They're one layer of a larger testing strategy, not a substitute for the rest of this section.</p></div>
        </div>
      </section>

      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz">
          <small>THINK IT THROUGH</small>
          <p>A new engineer adds a utility class, <code>OrderFormattingUtils</code>, inside the <code>entity</code> package that imports <code>org.springframework.util.StringUtils</code> for a convenience method. Which of the four <code>ArchRule</code>s in the example would catch this, and why might it be worth adding a fifth rule specifically naming Spring packages under entities too?</p>
        </div>
      </section>
    </div>
  );
}
