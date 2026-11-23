// Static "image" of the JavaScript runtime at one moment: memory, call stack, queues, scopes.
// Rows that start with "*" are highlighted (the current frame, the value that matters...).
const WIDTH = 640;
const GAP = 14;
const HEAD = 30;
const ROW = 28;

export default function JsSnapshot({ snapshot }) {
  const count = snapshot.panes.length;
  const paneWidth = (WIDTH - GAP * (count + 1)) / count;
  const maxRows = Math.max(...snapshot.panes.map((pane) => pane.rows.length));
  const paneHeight = HEAD + maxRows * ROW + 12;
  const height = paneHeight + GAP * 2;
  return (
    <figure className="njsSnapshot">
      <figcaption>
        <small>RUNTIME SNAPSHOT</small>
        <strong>{snapshot.title}</strong>
      </figcaption>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} role="img" aria-label={snapshot.caption}>
        {snapshot.panes.map((pane, index) => {
          const x = GAP + index * (paneWidth + GAP);
          return (
            <g key={pane.heading} transform={`translate(${x} ${GAP})`}>
              <rect className="njsPane" width={paneWidth} height={paneHeight} rx="8" />
              <text className="njsPaneHead" x={paneWidth / 2} y={20}>
                {pane.heading}
              </text>
              {pane.rows.map((raw, row) => {
                const hot = raw.startsWith("*");
                const text = hot ? raw.slice(1) : raw;
                return (
                  <g key={`${row}-${raw}`} transform={`translate(8 ${HEAD + row * ROW})`}>
                    <rect
                      className={hot ? "njsRow isHot" : "njsRow"}
                      width={paneWidth - 16}
                      height={ROW - 5}
                      rx="4"
                    />
                    <text className="njsRowText" x={8} y={16}>
                      {text}
                    </text>
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
      <p className="njsCaption">{snapshot.caption}</p>
    </figure>
  );
}
