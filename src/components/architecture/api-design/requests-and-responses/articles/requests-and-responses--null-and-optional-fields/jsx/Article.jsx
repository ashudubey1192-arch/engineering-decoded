import "../css/Article.css";

export default function RequestsAndResponsesNullAndOptionalFieldsArticle() {
  return (
    <div className="sdConcept">

      <section id="overview">
        <p className="lead">
          "Optional" and "nullable" sound like the same idea and aren't &mdash; and the difference
          between a field that's absent, a field that's explicitly null, and a field with a real
          value is exactly what makes partial updates work correctly or corrupt data quietly.
        </p>
      </section>
      <section id="concepts">
        <h2>1. Core concepts</h2>
        <div className="twoCol">
          <div>
            <h3>Optional</h3>
            <p>The field may be left out of the request entirely. Absence means "don't change this" on an update, or "use the default" on creation.</p>
          </div>
          <div>
            <h3>Nullable</h3>
            <p>The field may be explicitly set to null. Presence with a null value means "clear this out," a specific instruction distinct from leaving it out.</p>
          </div>
        </div>
        <p>
          The hard case is <code>PATCH</code>: if a field is optional and nullable, a client
          absolutely must be able to distinguish "I didn't mention this field" from "I'm setting
          this field to null," and the server has to preserve that distinction rather than
          collapsing both into the same behavior.
        </p>
      </section>
      <section id="example">
        <h2>2. Practical example</h2>
        <p>
          Parcelly's <code>delivery_instructions</code> field is optional and nullable. A partner
          who wants to add courier instructions sends the field with a value. A partner updating an
          unrelated field, like the destination address, simply omits
          <code>delivery_instructions</code> &mdash; and it must stay exactly what it was. A
          partner who wants to remove instructions the recipient just canceled sends the field
          explicitly set to <code>null</code>.
        </p>
        <span className="codeLabel">THREE DIFFERENT PATCH REQUESTS</span>
        <div className="codeBlock">
          <pre>{`PATCH /v1/shipments/shp_9f8a
{ "delivery_instructions": "Leave at back door" }   // sets a value

PATCH /v1/shipments/shp_9f8a
{ "destination_address_id": "addr_5e6f" }           // omitted -> unchanged

PATCH /v1/shipments/shp_9f8a
{ "delivery_instructions": null }                   // explicit -> cleared`}</pre>
        </div>
      </section>
      <figure className="fig">
        <svg viewBox="0 0 420 110" role="img" aria-label="Diagram of three PATCH outcomes for one field: field absent leaves the stored value unchanged, field present with a value overwrites it, field present as null clears it to empty.">
          {[
            {t:"absent", h:"unchanged", cls:"box"},
            {t:"present, value", h:"overwritten", cls:"boxAccent"},
            {t:"present, null", h:"cleared", cls:"boxWarn"},
          ].map((n,i) => (
            <g key={n.t}>
              <rect className={n.cls} x={20 + i*135} y="20" width="115" height="34" rx="6" />
              <text x={77 + i*135} y="41" className="boxText" style={{fontSize:"6.5px"}}>{n.t}</text>
              <line className="flow" x1={77 + i*135} y1="54" x2={77 + i*135} y2="68" />
              <text x={77 + i*135} y="82" className="figHint" style={{fontSize:"6px"}}>{n.h}</text>
            </g>
          ))}
        </svg>
        <figcaption>Three distinct wire states for one field, and PATCH has to preserve all three, not collapse any two together.</figcaption>
      </figure>
      <section id="mistakes">
        <h2>3. Common mistakes</h2>
        <p>
          Treating "absent" and "null" as the same thing on the server side is the most damaging
          mistake &mdash; a naive implementation that falls back to the old value whenever the new
          one is missing <i>or</i> null looks reasonable but actually makes it impossible to ever
          clear the field, since an explicit null gets silently treated as "not provided." The
          opposite mistake is making every field always required on every update, which forces
          clients to resend the entire resource for a one-field change and defeats the point of
          <code>PATCH</code>.
        </p>
      </section>
      <section id="check">
        <h2>4. Knowledge check</h2>
        <div className="quiz">
          <p>A server implements PATCH by falling back to the old value whenever a field is missing or null in the request. Why does this make it impossible for a client to ever clear a nullable field back to null?</p>
        </div>
      </section>
      <p className="takeaway">
        Absent, null, and present-with-a-value are three different instructions, not two &mdash; a
        correct PATCH implementation has to tell all three apart, usually by checking key presence
        in the parsed body rather than just checking for a falsy value.
      </p>
    </div>
  );
}
