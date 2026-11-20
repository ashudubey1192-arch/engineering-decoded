import { tokenizeJava } from "../../../../data/javaSyntax.js";
import "../css/JavaCode.css";
export default function JavaCode({ children, output = false }) {
  const text = String(children ?? "");
  return <code className={output ? "javaCode javaOutput" : "javaCode"}>{output
    ? text.split(/(\n)/).map((line, i) => <span key={i} className={/Exception|Error|\bat [\w.$]+\(|Caused by:|\berror:/i.test(line) ? "java-error" : "java-output"}>{line}</span>)
    : tokenizeJava(text).map(([kind, value], i) => <span key={i} className={`java-${kind}`}>{value}</span>)}</code>;
}
