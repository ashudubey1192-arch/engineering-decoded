import "../css/Article.css";
export default function NetworkingArticle({ article }) {
  return <div className="fundamentalsLesson"><section id="overview"><p className="lead">{article.title} is a key part of networking for distributed systems.</p><p>This dummy page is ready for networking diagrams and explanations.</p></section><section id="concepts"><h2>How it works</h2><p>Describe the protocol, request flow, and operational characteristics.</p></section><section id="example"><h2>Request flow</h2><p>Add a step-by-step request example here.</p></section></div>;
}
