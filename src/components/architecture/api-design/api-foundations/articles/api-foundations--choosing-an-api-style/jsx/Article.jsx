import "../css/Article.css";

export default function ApiFoundationsChoosingAnApiStyleArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          Most "REST vs. GraphQL vs. gRPC" debates skip the only question that actually decides it:
          who is calling this API, how often, and what do they need back &mdash; the style follows
          from those answers, not the other way around.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <p>Four questions narrow the choice fast:</p>
        <ul className="stepList">
          <li><b>Who calls it?</b> Many external, loosely-coupled consumers point toward REST; a small number of services you also control point toward gRPC.</li>
          <li><b>How flexible does the response need to be?</b> If different callers need very different slices of related data, GraphQL avoids either over- or under-fetching for all of them.</li>
          <li><b>How latency-sensitive is it?</b> High call volume between trusted internal services favors gRPC's binary format and HTTP/2 multiplexing.</li>
          <li><b>Is this a request or a notification?</b> If the caller needs to react to something happening rather than ask for current state, that's a webhook or event, not a request/response style at all.</li>
        </ul>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Consider three real requests Parcelly had to make this call on. A partner e-commerce
          platform needs to create shipments and check their status: many external callers, simple
          per-resource operations, a need for caching and broad client-library support &mdash;
          <b>REST</b>. Parcelly's own mobile app needs a shipment's status, its package contents,
          and the last three tracking events in one screen, without three round trips or
          over-fetching fields the screen doesn't use &mdash; <b>GraphQL</b>, or a purpose-built
          REST endpoint that composes the same data server-side. Parcelly's rating engine gets
          called by four internal services tens of thousands of times a minute to price a shipment
          &mdash; <b>gRPC</b>, because the latency and serialization overhead of REST/JSON would add
          up fast at that call volume, and every caller is a service Parcelly itself owns and can
          keep in sync with a shared contract.
        </p>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 440 190" role="img" aria-label="Decision tree: start by asking who calls the API. Many external callers with simple per-resource needs leads to REST. Varied nested data needs from one client leads to GraphQL. Few high-volume internal callers leads to gRPC. Reacting to a change rather than asking leads to webhooks or events.">
          <rect className="boxAccent" x="170" y="10" width="100" height="30" rx="6" />
          <text x="220" y="29" className="boxText" style={{fontSize:"6.5px"}}>Who calls it, and why?</text>
          {[
            {label:"Many external,\nsimple per-resource", style:"REST", x:10},
            {label:"One client, varied\nnested data needs", style:"GraphQL", x:120},
            {label:"Few internal,\nhigh volume", style:"gRPC", x:230},
            {label:"Reacting to a\nchange, not asking", style:"Webhook/Event", x:340},
          ].map((n,i) => (
            <g key={i}>
              <line className="flowMuted" x1="220" y1="40" x2={n.x + 45} y2="70" />
              <rect className="box" x={n.x} y="70" width="90" height="34" rx="6" />
              {n.label.split("\n").map((line,li) => (
                <text key={li} x={n.x + 45} y={83 + li*11} className="figHint" style={{fontSize:"5px"}}>{line}</text>
              ))}
              <line className="flow" x1={n.x + 45} y1="104" x2={n.x + 45} y2="118" />
              <rect className="boxAccent" x={n.x + 5} y="118" width="80" height="24" rx="5" />
              <text x={n.x + 45} y="134" className="boxText" style={{fontSize:"6px"}}>{n.style}</text>
            </g>
          ))}
        </svg>
        <figcaption>The style follows from who's calling and why &mdash; not from which one is newest or most discussed.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Choosing a style for the whole company rather than per-API is a common mistake &mdash;
          Parcelly's partner-facing REST API and its internal gRPC calls aren't in tension; they're
          both correct, for different callers. The other common mistake is picking GraphQL to
          "future-proof" an API against needs nobody has yet, paying its complexity cost (schema
          design, resolver performance, query cost limiting) upfront for flexibility that may never
          get used.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>Why can REST and gRPC both be the "right" choice inside the same company, for the same general purpose of moving shipment data around?</p>
        </div>
      </section>
      <p className="takeaway">
        Ask who's calling and why before asking which style is best &mdash; a style is a good fit
        for a caller, not an objectively superior technology, and most systems end up correctly
        using more than one.
      </p>
    </div>
  );
}
