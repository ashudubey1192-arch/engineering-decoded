import "../css/Article.css";

export default function HldCaseStudiesRideSharingArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          &ldquo;Match a rider requesting a trip with a nearby available driver.&rdquo; Unlike most
          systems in this course, the state that matters most here &mdash; a driver&rsquo;s
          location &mdash; changes every few seconds and only the latest value is ever useful,
          which pushes several design choices in a different direction than usual.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: drivers continuously report their location, riders request a trip, the
          system finds and confirms a nearby available driver, and both sides see live position
          updates once the trip starts. A driver&rsquo;s position from thirty seconds ago is
          worthless the moment a new one arrives, so this data doesn&rsquo;t need the durability of,
          say, a payment record &mdash; it belongs in a fast, largely in-memory structure rather
          than a traditional write-heavy database path.
        </p>
        <p>
          That structure has to answer &ldquo;which drivers are near this rider&rdquo; without
          scanning every driver on every request, so locations are indexed by a coarse geographic
          cell &mdash; a grid or geohash &mdash; letting a query look only at the handful of cells
          around the rider. Matching is also a coordination problem on top of a lookup: once a
          candidate driver is found, something has to guarantee they aren&rsquo;t offered the same
          trip twice at once.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>Every few seconds, each driver's app reports its coordinates,</b> overwriting
            that driver's previous position in a geospatial index keyed by grid cell &mdash;
            there's no history to keep, only a current value.</li>
          <li><b>A rider requests a trip.</b> The matching service maps the rider's location to a
            cell and its immediate neighbors, and pulls the small set of available drivers indexed
            there.</li>
          <li><b>Candidates are ranked</b> by distance and estimated arrival time, and the top one
            is offered the trip. A short-lived lock marks that driver as pending so a second,
            concurrent request can't also offer them a ride.</li>
          <li><b>The driver accepts.</b> The lock becomes final, the driver is marked unavailable,
            and the rider is notified; both apps then receive live position pushes over a
            persistent connection for the rest of the trip.</li>
          <li><b>If the driver doesn't respond in time,</b> the lock expires and the offer moves
            to the next-ranked candidate.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 140" role="img" aria-label="Diagram of drivers streaming location updates into grid cells of a geospatial index, and a rider's request being matched only against the drivers in the nearby cells, ranked and locked before acceptance." >
          {[0,1,2,3,4].map((i) => (<rect key={i} className="box" x={20 + i*82} y="20" width="76" height="40" rx="5" />))}
          <circle className="ringNode" cx="58" cy="40" r="4" /><circle className="ringNode" cx="222" cy="35" r="4" /><circle className="ringNode" cx="222" cy="48" r="4" /><circle className="ringNode" cx="386" cy="42" r="4" />
          <text x="222" y="16" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>nearby cells hold the candidates</text>
          <line className="flow" x1="222" y1="60" x2="222" y2="90" />
          <rect className="boxAccent" x="140" y="95" width="165" height="32" rx="6" /><text x="222" y="115" className="boxText" style={{fontSize:"7.5px"}}>Ranked, locked, offered</text>
        </svg>
        <figcaption>Drivers update a grid-indexed store; a match only ever looks at the rider's nearby cells, then locks one candidate before offering the trip.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Scanning every driver's current location for each match request instead of indexing by
          region works for a demo and falls over as the driver population grows. Skipping the lock
          step and offering, or worse confirming, the same driver to more than one rider at once is
          a race condition waiting to happen under real concurrency. And durably persisting every
          single location ping as permanent history spends writes on data nobody ever queries back
          &mdash; only the latest position matters here.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why does a grid or geohash index matter here, compared to scanning every driver's current location on each match request?</p>
        </div>
      </section>
      <p className="takeaway">
        When the data that matters is &ldquo;the latest value, right now&rdquo; rather than a
        durable record, the storage and indexing choices look different from the rest of this
        course &mdash; and the matching step still needs its own concurrency guard on top.
      </p>
    </div>
  );
}
