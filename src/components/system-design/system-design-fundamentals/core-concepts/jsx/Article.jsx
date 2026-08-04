import "../css/Article.css";
export default function CoreConceptArticle({ article }) {
  return <div className="fundamentalsLesson"><section id="overview"><p className="lead">Understand {article.title} and how it influences system architecture.</p><p>This is dummy content for the core concepts section.</p></section><section id="concepts"><h2>Key concepts</h2><p>Define the concept, its measurement, and its most important trade-offs.</p></section><section id="example"><h2>Design example</h2><p>Demonstrate the concept using a scalable application.</p></section></div>;
}
