import "../css/Article.css";
export default function ApiFundamentalsArticle({ article }) {
  return <div className="fundamentalsLesson"><section id="overview"><p className="lead">{article.title} helps create clear and reliable service interfaces.</p><p>This dummy page is ready for the final API article.</p></section><section id="concepts"><h2>API design</h2><p>Cover contracts, compatibility, errors, security, and client expectations.</p></section><section id="example"><h2>Endpoint example</h2><pre><code>{`GET /api/v1/resources\n200 OK`}</code></pre></section></div>;
}
