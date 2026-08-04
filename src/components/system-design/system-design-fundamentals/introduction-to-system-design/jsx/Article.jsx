import "../css/Article.css";
export default function IntroductionArticle({ article }) {
  return <div className="fundamentalsLesson"><section id="overview"><p className="lead">{article.title} introduces an essential system design foundation.</p><p>This dummy page is ready for your detailed article content.</p></section><section id="concepts"><h2>Core ideas</h2><p>Explain the terminology, constraints, and design trade-offs for this topic.</p></section><section id="example"><h2>Practical example</h2><p>Add a real-world system example and diagram here.</p></section></div>;
}
