import "../css/Article.css";

export default function CommentsAndFormattingMisleadingCommentsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Unlike code, a comment is never checked by a compiler or a test. When the code
          changes and the comment does not, the comment becomes a lie that looks exactly as
          confident as the truth did a moment ago.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <ul className="stepList">
          <li><b>Comments do not update themselves</b> &mdash; every comment describing behavior is a maintenance liability that has to be remembered and kept in sync by hand, forever.</li>
          <li><b>Stale comments are worse than none</b> &mdash; a missing comment leaves a reader to figure things out from the code; a wrong comment actively sends them in the wrong direction, and they usually trust it at first.</li>
          <li><b>Comments near frequently changed code are highest risk</b> &mdash; a comment sitting next to logic that gets edited often has the most opportunities to drift out of sync.</li>
          <li><b>Redundant comments are a milder version of the same problem</b> &mdash; <code>// increment i</code> above <code>i++</code> adds no information today, but still has to be maintained, and eventually will drift too.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          A comment in Ledgerly's discount logic survived three code changes without being
          updated:
        </p>
        <span className="codeLabel">STALE, ACTIVELY WRONG</span>
        <div className="codeBlock">
          <pre>{`// Applies a 10% discount for customers with 2+ years of loyalty.
function applyLoyaltyDiscount(invoice) {
  const tier = getLoyaltyTier(invoice.customer);
  invoice.discountRate = tier === "gold" ? 0.15 : tier === "silver" ? 0.10 : 0;
}`}</pre>
        </div>
        <p>
          The discount logic was rewritten twice since that comment was written &mdash; first to
          add a tier system, then to change the top tier's rate from 10% to 15%. The comment
          still describes the original, single-rate version. An engineer trusting the comment
          alone would misreport the gold-tier discount as 10% in a customer support reply.
        </p>
        <span className="codeLabel">FIXED: LET THE CODE SPEAK</span>
        <div className="codeBlock">
          <pre>{`function applyLoyaltyDiscount(invoice) {
  const tier = getLoyaltyTier(invoice.customer);
  invoice.discountRate = LOYALTY_DISCOUNT_RATES[tier] ?? 0;
}
const LOYALTY_DISCOUNT_RATES = { gold: 0.15, silver: 0.10 };`}</pre>
        </div>
        <p>
          Removing the comment and naming the constant clearly means there is no separate
          description to fall out of sync &mdash; the rates are visible, in one place, and cannot
          disagree with themselves.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Timeline showing a comment written once staying frozen while the code beneath it changes twice, opening a growing gap between what the comment claims and what the code actually does.">
          <line className="divider" x1="30" y1="30" x2="390" y2="30" />
          <text x="30" y="20" className="figLabel" style={{fontSize:"5px"}}>Comment written</text>
          <circle className="ringNode" cx="30" cy="30" r="5" />
          <circle className="ringKey" cx="180" cy="30" r="5" /><text x="180" y="50" className="figLabel" style={{fontSize:"4.5px"}}>Code changes (tiers added)</text>
          <circle className="ringKey" cx="330" cy="30" r="5" /><text x="330" y="50" className="figLabel" style={{fontSize:"4.5px"}}>Code changes (rate updated)</text>
          <line className="flowMuted" x1="30" y1="70" x2="390" y2="70" />
          <text x="30" y="85" className="figHint" style={{fontSize:"4.5px"}}>Comment: still says "10%, 2+ years"</text>
        </svg>
        <figcaption>The code changed twice; the comment, with no mechanism to stay in sync, still describes a version that no longer exists.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating comment maintenance as optional during a code review &mdash; approving a pull
          request that changes behavior a comment describes, without flagging the now-outdated
          comment &mdash; is how staleness accumulates. If a review changes what a commented block
          does, the comment is part of the diff that needs reviewing too.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a stale comment often more dangerous to a reader than having no comment at all?</p>
        </div>
      </section>
      <p className="takeaway">
        A comment that describes behavior has to be maintained forever, by hand, with nothing
        enforcing that it stays accurate &mdash; where possible, let a clear name or a named
        constant carry that information instead, so there is nothing separate to go stale.
      </p>

    </div>
  );
}
