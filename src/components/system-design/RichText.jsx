// Inline `code` and **bold** for lesson prose.
export default function RichText({ text }) {
  return text.split(/(`[^`]+`|\*\*[^*]+\*\*)/).map((part, index) => {
    if (part.startsWith("`")) return <code key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**")) return <b key={index}>{part.slice(2, -2)}</b>;
    return part;
  });
}
