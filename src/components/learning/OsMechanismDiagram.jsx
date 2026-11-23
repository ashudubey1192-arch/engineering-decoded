import { useId } from "react";
import "./OsConceptLab.css";

function wrap(text, length = 48) {
  const lines = [""];
  for (const word of text.split(/\s+/)) {
    if (lines.at(-1) && lines.at(-1).length + word.length + 1 > length) lines.push(word);
    else lines[lines.length - 1] += `${lines.at(-1) ? " " : ""}${word}`;
  }
  return lines;
}

export default function OsMechanismDiagram({ title, states }) {
  const id = useId();
  let y = 12;
  const boxes = states.map(([, actor, action, result]) => {
    const lines = [...wrap(action), ...wrap(`Observe: ${result}`)];
    const box = { y, height: 52 + lines.length * 20, actor, lines };
    y += box.height + 30;
    return box;
  });
  return <figure className="osMechanism">
    <svg viewBox={`0 0 440 ${y}`} role="img" aria-labelledby={`${id}-title ${id}-desc`}>
      <title id={`${id}-title`}>{title}: illustrated scenario</title>
      <desc id={`${id}-desc`}>{states.map(([, actor, action, result], index) => `${index + 1}. ${actor}: ${action}. ${result}.`).join(" ")}</desc>
      {boxes.map((box, index) => <g key={index}>
        <rect x="10" y={box.y} width="420" height={box.height} rx="12" fill="var(--surface-2, #17212b)" stroke="var(--lab-accent, #38bdf8)" />
        <text x="26" y={box.y + 27} fontSize="16" fontWeight="700" fill="var(--text, #e2e8f0)">{index + 1}. {box.actor}</text>
        {box.lines.map((line, i) => <text key={i} x="26" y={box.y + 53 + i * 20} fontSize="14" fill="var(--text, #e2e8f0)">{line}</text>)}
        {index < boxes.length - 1 && <path d={`M220 ${box.y + box.height + 4} v18 m-5 -5 l5 5 5 -5`} fill="none" stroke="var(--lab-accent, #38bdf8)" strokeWidth="2" />}
      </g>)}
    </svg>
    <figcaption>Read the complete scenario from top to bottom, then use the animated walkthrough below to inspect each transition. This illustration models the example, not every possible execution.</figcaption>
  </figure>;
}
