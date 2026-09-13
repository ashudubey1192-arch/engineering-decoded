import "../css/Article.css";

export default function StructuralPatternsDecoratorPatternArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          Decorator attaches additional responsibilities to an object dynamically by wrapping it in
          another object that implements the same interface &mdash; an alternative to subclassing
          that lets behaviors stack and combine at runtime.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Each decorator implements the same interface as the object it wraps, and forwards calls
          to the wrapped object while adding its own behavior before or after. Because a decorator
          is itself the same interface, decorators can be layered on top of each other, each one
          adding its own piece.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A <code>Coffee</code> interface with a <code>cost()</code> method: a
          <code>MilkDecorator</code> wraps any <code>Coffee</code> and adds milk's price on top of
          whatever the wrapped coffee already costs; a <code>MochaDecorator</code> can then wrap
          that combination and add mocha's price on top of that. Building
          <code>new MochaDecorator(new MilkDecorator(new SimpleCoffee()))</code> avoids needing a
          separate hardcoded class for every possible combination of add-ons.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 400 130" role="img" aria-label="Diagram of a SimpleCoffee object wrapped first in a MilkDecorator and then in a MochaDecorator, each layer adding its own cost on top of the one inside it." >
          <rect className="box" x="140" y="70" width="120" height="40" rx="8" /><text x="200" y="94" className="boxText" style={{fontSize:"7.5px"}}>SimpleCoffee</text>
          <rect className="boxAccent" x="110" y="45" width="180" height="70" rx="10" style={{fill:"none"}} /><text x="200" y="55" className="figLabel" textAnchor="middle" style={{fontSize:"7px"}}>MilkDecorator</text>
          <rect className="boxAccent" x="80" y="20" width="240" height="95" rx="12" style={{fill:"none"}} /><text x="200" y="32" className="figLabel" textAnchor="middle" style={{fontSize:"7px"}}>MochaDecorator</text>
        </svg>
        <figcaption>Each decorator wraps the layer inside it, adding its own cost without a hardcoded class for every combination.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Subclassing for every combination of features &mdash; a
          <code>CoffeeWithMilkAndMocha</code> class, then <code>CoffeeWithMilkAndMochaAndWhip</code>
          &mdash; explodes combinatorially as add-ons grow, which is exactly what Decorator avoids.
          Stacking so many decorators that it becomes difficult to tell which layer contributed
          which behavior is a real cost worth naming, not a hidden flaw to discover later.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does Decorator avoid the combinatorial class explosion that subclassing for every add-on combination would cause?</p>
        </div>
      </section>
      <p className="takeaway">
        Decorator trades a combinatorial explosion of subclasses for a small set of composable
        wrappers &mdash; each one focused on adding exactly one behavior.
      </p>
    </div>
  );
}
