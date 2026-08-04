import "../css/Article.css";
export default function CommunicationPatternArticle({ article }) {
  return <div className="fundamentalsLesson"><section id="overview"><p className="lead">{article.title} defines how components exchange information.</p><p>This is placeholder content for the communication patterns section.</p></section><section id="concepts"><h2>Interaction model</h2><p>Explain message flow, coupling, delivery behavior, and failure modes.</p></section><section id="example"><h2>Sequence example</h2><p>Add a service-to-service interaction sequence here.</p></section></div>;
}
