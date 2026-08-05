export default function StructuredDummyArticle({ article, area }) {
  return (
    <div className="structuredDummyArticle">
      <section id="overview"><p className="lead">{article.title} is part of {area}.</p><p>This dummy page is ready for your complete article content.</p></section>
      <section id="concepts"><h2>Key concepts</h2><p>Explain the terminology, responsibilities, constraints, and design trade-offs for this topic.</p></section>
      <section id="example"><h2>Practical design</h2><p>Add a diagram, implementation walkthrough, or real-world example here.</p></section>
      <section id="mistakes"><h2>Common mistakes</h2><p>Document common failure modes and how an engineer should avoid them.</p></section>
      <section id="check"><h2>Knowledge check</h2><div className="quiz"><p>What decisions would change when scale, reliability, or maintainability requirements change?</p></div></section>
    </div>
  );
}
