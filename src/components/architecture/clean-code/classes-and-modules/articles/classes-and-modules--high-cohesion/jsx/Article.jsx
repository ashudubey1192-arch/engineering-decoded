import "../css/Article.css";

export default function ClassesAndModulesHighCohesionArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Cohesion measures how tightly a class's methods and fields relate to each other. In a
          highly cohesive class, most methods use most of the fields; in a low-cohesion class,
          methods cluster into groups that barely touch each other's data.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Method-field usage is the concrete signal</b> &mdash; for each method, note which fields it reads or writes; cohesive classes show heavy overlap, low-cohesion classes show separate clusters.</li>
          <li><b>Low cohesion is a split waiting to happen</b> &mdash; when two clusters of methods never touch the same fields, they are quietly acting like two separate classes sharing one file.</li>
          <li><b>Cohesion looks inward, SRP looks outward</b> &mdash; cohesion is traced through field usage inside the class; SRP is judged by who outside the class asks for changes.</li>
          <li><b>High cohesion tends to follow good naming</b> &mdash; if you can't describe what a class's fields and methods have in common in one sentence, cohesion is probably low.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Ledgerly's <code>ReportGenerator</code> held two clusters of fields that never overlapped:
        </p>
        <span className="codeLabel">LOW COHESION: TWO CLUSTERS, ONE CLASS</span>
        <div className="codeBlock">
          <pre>{`class ReportGenerator {
  pdfMargin = 36;
  pdfFontSize = 10;
  smtpHost = "smtp.ledgerly.io";
  fromAddress = "reports@ledgerly.io";

  generatePdf(report) {
    return renderPdf(report, this.pdfMargin, this.pdfFontSize); // never touches smtp fields
  }
  sendReport(report, to) {
    return smtpSend(this.smtpHost, this.fromAddress, to, report); // never touches pdf fields
  }
}`}</pre>
        </div>
        <span className="codeLabel">HIGH COHESION: SPLIT ALONG THE CLUSTERS</span>
        <div className="codeBlock">
          <pre>{`class PdfReportRenderer {
  margin = 36;
  fontSize = 10;
  render(report) { return renderPdf(report, this.margin, this.fontSize); }
}
class ReportMailer {
  smtpHost = "smtp.ledgerly.io";
  fromAddress = "reports@ledgerly.io";
  send(report, to) { return smtpSend(this.smtpHost, this.fromAddress, to, report); }
}
// every field in each class is now used by every method in that class`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 100" role="img" aria-label="Grid showing which fields each method uses: generatePdf uses only pdfMargin and pdfFontSize, sendReport uses only smtpHost and fromAddress, forming two separate clusters with no overlap.">
          <text x="140" y="12" className="figLabel" style={{fontSize:"4.5px"}}>pdfMargin</text>
          <text x="220" y="12" className="figLabel" style={{fontSize:"4.5px"}}>pdfFontSize</text>
          <text x="300" y="12" className="figLabel" style={{fontSize:"4.5px"}}>smtpHost</text>
          <text x="380" y="12" className="figLabel" style={{fontSize:"4.5px"}}>fromAddress</text>
          <text x="55" y="42" className="figHint" style={{fontSize:"4.5px"}}>generatePdf()</text>
          <rect className="boxAccent" x="110" y="28" width="60" height="24" rx="3" /><text x="140" y="43" className="boxText" style={{fontSize:"4.2px"}}>used</text>
          <rect className="boxAccent" x="190" y="28" width="60" height="24" rx="3" /><text x="220" y="43" className="boxText" style={{fontSize:"4.2px"}}>used</text>
          <rect className="box" x="270" y="28" width="60" height="24" rx="3" />
          <rect className="box" x="350" y="28" width="60" height="24" rx="3" />
          <text x="55" y="80" className="figHint" style={{fontSize:"4.5px"}}>sendReport()</text>
          <rect className="box" x="110" y="66" width="60" height="24" rx="3" />
          <rect className="box" x="190" y="66" width="60" height="24" rx="3" />
          <rect className="boxAccent" x="270" y="66" width="60" height="24" rx="3" /><text x="300" y="81" className="boxText" style={{fontSize:"4.2px"}}>used</text>
          <rect className="boxAccent" x="350" y="66" width="60" height="24" rx="3" /><text x="380" y="81" className="boxText" style={{fontSize:"4.2px"}}>used</text>
        </svg>
        <figcaption>Two clusters that never share a field are two classes hiding inside one.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Judging cohesion by whether methods happen to sit in the same file, rather than by
          whether they actually share fields, misses classes that have been low-cohesion all
          along simply because nobody traced the usage.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does the fact that generatePdf never reads smtpHost, and sendReport never reads pdfMargin, indicate that ReportGenerator has low cohesion?</p>
        </div>
      </section>
      <p className="takeaway">
        Trace which fields each method actually touches &mdash; clusters that never overlap are two
        classes already, just sharing one name and one file.
      </p>

    </div>
  );
}
