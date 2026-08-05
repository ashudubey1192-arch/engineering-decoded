import "../css/Article.css";

export default function RoutingNestedRoutesArticle() {
  return (
    <div className="dedicatedStructuredArticle">
      <section id="overview">
        <p className="lead">Nested Routes</p>
        <p>This dedicated article belongs to Angular / Angular Routing. Replace this placeholder with the final article content.</p>
      </section>
      <section id="concepts">
        <h2>Key concepts</h2>
        <p>Explain the terminology, responsibilities, constraints, and trade-offs for Nested Routes.</p>
      </section>
      <section id="example">
        <h2>Practical example</h2>
        <p>Add a focused implementation, diagram, or walkthrough for this article.</p>
      </section>
      <section id="mistakes">
        <h2>Common mistakes</h2>
        <p>Document common failure modes and how to avoid them.</p>
      </section>
      <section id="check">
        <h2>Knowledge check</h2>
        <div className="quiz"><p>What are the most important decisions and trade-offs in Nested Routes?</p></div>
      </section>
    </div>
  );
}
