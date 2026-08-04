import "../css/Article.css";
export default function CachingArticle({ article }) {
  return <div className="fundamentalsLesson"><section id="overview"><p className="lead">{article.title} can reduce latency and protect downstream systems.</p><p>This dummy page is ready for the final caching lesson.</p></section><section id="concepts"><h2>Cache behavior</h2><p>Explain reads, writes, expiration, consistency, and invalidation trade-offs.</p></section><section id="example"><h2>Cache flow</h2><p>Add a cache hit and cache miss example here.</p></section></div>;
}
