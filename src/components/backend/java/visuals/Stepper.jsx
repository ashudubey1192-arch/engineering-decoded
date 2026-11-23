import { useEffect, useId, useState } from "react";

// Shared pieces for every Java visual: a step player (play / pause / back / next / reset)
// and the figure frame. Nothing here touches `window` during render, so the visuals
// render on the server too (the course checks SSR-render every lesson).

export function useStepper(count, delay = 1500) {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    if (!playing) return undefined;
    if (index >= count - 1) {
      setPlaying(false);
      return undefined;
    }
    const timer = setTimeout(() => setIndex((value) => Math.min(value + 1, count - 1)), delay);
    return () => clearTimeout(timer);
  }, [playing, index, count, delay]);
  return {
    index: Math.min(index, count - 1),
    count,
    playing,
    go: (next) => {
      setPlaying(false);
      setIndex(Math.max(0, Math.min(count - 1, next)));
    },
    play: () => {
      if (index >= count - 1) setIndex(0);
      setPlaying(true);
    },
    pause: () => setPlaying(false),
  };
}

// SVG ids must be unique per figure and valid inside url(#...).
export function useSvgId(prefix) {
  return `${prefix}${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
}

export function Controls({ stepper, onInteract }) {
  const { index, count, playing } = stepper;
  const act = (fn) => () => {
    onInteract?.();
    fn();
  };
  return (
    <div className="jvControls">
      <button type="button" onClick={act(() => stepper.go(0))} disabled={index === 0} aria-label="Reset to the first step">
        ⟲
      </button>
      <button type="button" onClick={act(() => stepper.go(index - 1))} disabled={index === 0}>
        ‹ Back
      </button>
      <button type="button" className="jvPlay" onClick={act(playing ? stepper.pause : stepper.play)}>
        {playing ? "❚❚ Pause" : index === count - 1 ? "↻ Replay" : "▶ Play"}
      </button>
      <button type="button" onClick={act(() => stepper.go(index + 1))} disabled={index === count - 1}>
        Next ›
      </button>
      <span className="jvDots" aria-hidden="true">
        {Array.from({ length: count }, (_, dot) => (
          <i key={dot} className={dot === index ? "on" : dot < index ? "done" : ""} onClick={act(() => stepper.go(dot))} />
        ))}
      </span>
      <span className="jvCount">
        Step {index + 1} / {count}
      </span>
    </div>
  );
}

export function Frame({ title, kicker = "VISUAL", tabs, tab, onTab, legend, controls, note, wide, children }) {
  return (
    <figure className={`jv${wide ? " jvWide" : ""}`}>
      <figcaption>
        <small>{kicker}</small>
        <strong>{title}</strong>
      </figcaption>
      {tabs && (
        <div className="jvTabs" role="tablist" aria-label={`${title} views`}>
          {tabs.map((item) => (
            <button
              type="button"
              role="tab"
              key={item.id}
              aria-selected={item.id === tab}
              className={item.id === tab ? "on" : ""}
              onClick={() => onTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
      <div className="jvCanvas">{children}</div>
      {legend && <div className="jvLegend">{legend}</div>}
      {controls}
      {note && (
        <p className="jvNote" aria-live="polite">
          {note}
        </p>
      )}
    </figure>
  );
}

// Inline `code` in notes.
export function Rich({ text }) {
  // `code` and **bold**
  return String(text)
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/)
    .map((part, index) => {
      if (part.length > 1 && part.startsWith("`") && part.endsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
      if (part.length > 4 && part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
      return part;
    });
}

export const textWidth = (label, size = 12) => Math.round(label.length * size * 0.62 + 22);

// Java's String.hashCode, HashMap's spread step and the bucket index for a table of `capacity`.
export function javaHash(text, capacity = 16) {
  let hash = 0;
  for (const char of text) hash = (Math.imul(31, hash) + char.charCodeAt(0)) | 0;
  const spread = hash ^ (hash >>> 16);
  return { hash, spread, index: spread & (capacity - 1) };
}
