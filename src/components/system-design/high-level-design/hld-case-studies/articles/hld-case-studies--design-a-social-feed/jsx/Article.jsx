import "../css/Article.css";

export default function HldCaseStudiesSocialFeedArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          &ldquo;Show me posts from the people I follow, newest first.&rdquo; The storage side of
          this is easy &mdash; a table of posts and a table of follows. The actual design question
          is when the feed for each viewer gets assembled: at post time, at read time, or some
          mix of the two.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: users post content, follow other users, and open a feed made of posts from
          everyone they follow. The tradeoff that defines the system is <b>fan-out-on-write</b>
          versus <b>fan-out-on-read</b>.
        </p>
        <div className="twoCol">
          <div>
            <h3>Fan-out-on-write (push)</h3>
            <p>The moment someone posts, the system immediately pushes that post into a
              precomputed feed list for every follower. Reading a feed later is one fast lookup,
              but a single post now costs one write per follower.</p>
          </div>
          <div>
            <h3>Fan-out-on-read (pull)</h3>
            <p>Nothing happens at post time. When a viewer opens their feed, the system fetches
              recent posts from everyone they follow and merges them on the spot. Writes are
              cheap; a feed load now means fetching and merging many users&rsquo; recent posts.</p>
          </div>
        </div>
        <p>
          Neither wins outright: push turns one post from a hugely-followed account into a
          write storm, while pull turns every feed load into an expensive fan-out of reads. The
          answer most large feeds converge on is a <b>hybrid</b> &mdash; push for ordinary
          accounts, and an explicit exemption for accounts above some follower threshold, whose
          posts are merged in at read time instead.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>An ordinary account posts.</b> The post is saved, then a fan-out worker looks up
            its follower list and pushes the post&rsquo;s ID into each follower&rsquo;s precomputed
            feed.</li>
          <li><b>A celebrity account posts.</b> Fan-out is skipped entirely for this account
            &mdash; with millions of followers, pushing to every one of them at once is the write
            storm the design exists to avoid.</li>
          <li><b>A viewer opens their feed.</b> The feed service reads their precomputed feed list
            (already built, so this is fast) and separately fetches recent posts from any
            celebrity accounts they follow.</li>
          <li><b>The two are merged by recency</b> (and in most real feeds, re-ranked by predicted
            relevance) before being returned &mdash; the push/pull split happens underneath the
            ranking step, not instead of it.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram of an ordinary account's post fanning out to follower inboxes at write time, while a celebrity account's post skips fan-out and is merged into the feed at read time instead." >
          <rect className="box" x="20" y="15" width="130" height="30" rx="6" /><text x="85" y="34" className="boxText" style={{fontSize:"8px"}}>Ordinary post</text>
          <line className="flow" x1="150" y1="30" x2="195" y2="30" /><text x="172" y="20" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>fan-out now</text>
          {[0,1,2].map((i) => (<rect key={i} className="boxAccent" x="200" y={5 + i*30} width="90" height="22" rx="5" />))}
          {[0,1,2].map((i) => (<text key={i} x="245" y={19 + i*30} className="boxText" textAnchor="middle" style={{fontSize:"7px"}}>follower inbox</text>))}
          <rect className="box" x="20" y="105" width="130" height="30" rx="6" /><text x="85" y="124" className="boxText" style={{fontSize:"8px"}}>Celebrity post</text>
          <line className="flowMuted" x1="150" y1="120" x2="320" y2="70" /><text x="260" y="100" className="figHint" style={{fontSize:"6.5px"}}>no fan-out</text>
          <line className="flow" x1="290" y1="35" x2="330" y2="60" />
          <rect className="boxAccent" x="325" y="60" width="115" height="34" rx="6" /><text x="382" y="82" className="boxText" style={{fontSize:"7.5px"}}>Feed, merged at read</text>
        </svg>
        <figcaption>Ordinary accounts fan out at post time; a followed-by-millions account is merged in only when a viewer's feed is actually read.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Applying fan-out-on-write uniformly regardless of follower count turns a single post
          from a huge account into millions of writes fired at once. Treating the feed as a live
          query over the entire posts table on every load is the simplest thing to build, but
          doesn&rsquo;t survive a follow graph of any real size. And a precomputed inbox isn&rsquo;t
          a one-time build &mdash; new follows and unfollows have to keep reconciling against it,
          or a viewer's feed silently drifts from who they actually follow.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does fan-out-on-write break down for an account with millions of followers, and what's the usual fix?</p>
        </div>
      </section>
      <p className="takeaway">
        Match the fan-out strategy to the shape of the account, not the platform as a whole
        &mdash; that one hybrid decision is what keeps the feed both fast to read and survivable
        to write.
      </p>
    </div>
  );
}
