import "../css/Article.css";
export default function LoadBalancingArticle({ article }) {
  return <div className="fundamentalsLesson"><section id="overview"><p className="lead">Learn how {article.title} distributes traffic safely and efficiently.</p><p>This is placeholder content for the load balancing section.</p></section><section id="concepts"><h2>Routing decisions</h2><p>Explain algorithms, health signals, failure handling, and trade-offs.</p></section><section id="example"><h2>Traffic example</h2><p>Add a multi-server traffic distribution example here.</p></section></div>;
}
