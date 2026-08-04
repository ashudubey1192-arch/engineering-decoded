import "../css/Article.css";
export default function WelcomeArticle({ article }) {
  return <div className="fundamentalsLesson"><section id="overview"><p className="lead">Welcome to {article.title}.</p><p>This is placeholder content for the welcome section. Replace it with the final lesson when ready.</p></section><section id="concepts"><h2>What you will learn</h2><p>Use this space to introduce the lesson goals, important context, and expected outcomes.</p></section><section id="example"><h2>Getting started</h2><p>Add links, examples, or course instructions here.</p></section></div>;
}
