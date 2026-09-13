import "../css/Article.css";

export default function HldCaseStudiesVideoPlatformArticle() {
  return (
    <div className="sdConcept">
      <section id="overview">
        <p className="lead">
          &ldquo;A creator uploads a video; viewers around the world watch it.&rdquo; Almost the
          entire design problem lives between those two events &mdash; what happens to a video
          after it&rsquo;s uploaded and before it&rsquo;s actually watchable.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>
          Requirements: accept large uploads, make each video watchable at whatever resolution a
          viewer&rsquo;s connection can handle, and serve viewing traffic globally without every
          request landing on one origin. Three splits do most of the work.
        </p>
        <table className="miniTable">
          <caption>The three splits that shape this design</caption>
          <thead><tr><th>Split</th><th>What's separated</th><th>Why</th></tr></thead>
          <tbody>
            <tr><td>Bytes vs. metadata</td><td>Object storage vs. a database</td><td>Big binary files and searchable fields need different stores</td></tr>
            <tr><td>Upload vs. processing</td><td>Upload finishes before the video is watchable</td><td>Transcoding into multiple renditions takes real time and shouldn't block the uploader</td></tr>
            <tr><td>Origin vs. edge</td><td>CDN vs. application servers</td><td>Viewer traffic at scale can't hit one origin per view</td></tr>
          </tbody>
        </table>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <ol className="stepList">
          <li><b>A creator uploads the raw file.</b> It's written to object storage, and an event
            is emitted &mdash; the upload request itself doesn't do any processing.</li>
          <li><b>Transcoding workers consume that event,</b> producing several renditions at
            different resolutions plus a manifest describing them, then mark the video &ldquo;ready&rdquo;
            in the metadata store.</li>
          <li><b>Only once marked ready</b> does the video appear as watchable; the creator sees a
            &ldquo;processing&rdquo; state in the meantime.</li>
          <li><b>A viewer opens the video.</b> The app fetches its metadata and manifest, and the
            player requests segments from the nearest CDN edge rather than the origin.</li>
          <li><b>The edge serves from its own cache</b> if a nearby viewer has already requested
            that segment, or fetches it from the origin once and caches it for everyone after.
            The player also watches its own buffering health and switches renditions to match the
            viewer's actual bandwidth.</li>
        </ol>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 460 150" role="img" aria-label="Diagram of an upload triggering an asynchronous transcoding pipeline that produces multiple renditions, above a separate viewing path where the CDN edge serves viewers directly and only reaches the origin on a cache miss." >
          <rect className="box" x="20" y="20" width="90" height="32" rx="6" /><text x="65" y="40" className="boxText" style={{fontSize:"8px"}}>Upload</text>
          <line className="flow" x1="110" y1="36" x2="150" y2="36" />
          <rect className="box" x="155" y="20" width="110" height="32" rx="6" /><text x="210" y="40" className="boxText" style={{fontSize:"7.5px"}}>Object storage</text>
          <line className="flow" x1="265" y1="36" x2="305" y2="36" /><text x="285" y="26" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>event</text>
          <rect className="boxAccent" x="310" y="20" width="130" height="32" rx="6" /><text x="375" y="40" className="boxText" style={{fontSize:"7.5px"}}>Transcode workers</text>
          <line className="divider" x1="20" y1="75" x2="440" y2="75" />
          <rect className="box" x="20" y="95" width="90" height="32" rx="6" /><text x="65" y="115" className="boxText" style={{fontSize:"8px"}}>Viewer</text>
          <line className="flow" x1="110" y1="111" x2="150" y2="111" />
          <rect className="boxAccent" x="155" y="95" width="110" height="32" rx="6" /><text x="210" y="115" className="boxText" style={{fontSize:"8px"}}>CDN edge</text>
          <line className="flowMuted" x1="265" y1="111" x2="305" y2="111" /><text x="285" y="101" className="figHint" textAnchor="middle" style={{fontSize:"6.5px"}}>miss only</text>
          <rect className="box" x="310" y="95" width="90" height="32" rx="6" /><text x="355" y="115" className="boxText" style={{fontSize:"8px"}}>Origin</text>
        </svg>
        <figcaption>Upload and transcoding run asynchronously above; viewer traffic below is served from the CDN edge, reaching the origin only on a cache miss.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Transcoding synchronously inside the upload request ties up the uploader for as long as
          processing takes and can&rsquo;t scale independently of upload traffic. Serving video
          bytes straight from application or origin servers on every view defeats the purpose of a
          CDN, whose entire job is to serve popular content from near the viewer instead of
          refetching it from origin each time. And treating a video as one fixed file, without
          multiple renditions or adaptive playback, leaves every viewer stuck with either poor
          quality or constant stalling.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why is a video marked "processing" instead of immediately watchable the moment the upload finishes?</p>
        </div>
      </section>
      <p className="takeaway">
        The whole design is a story of decoupling &mdash; bytes from metadata, upload from
        processing, and viewer traffic from the origin &mdash; with each split resolving a
        different bottleneck.
      </p>
    </div>
  );
}
