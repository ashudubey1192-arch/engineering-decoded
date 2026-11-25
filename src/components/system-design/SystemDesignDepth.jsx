import { useEffect, useState } from "react";
import RichText from "./RichText";
import SystemDesignMotion from "./SystemDesignMotion";

const loaders = import.meta.glob("../../data/systemDesign/deep/*.js");
const cache = new Map();

async function loadDepth(article) {
  const path = `../../data/systemDesign/deep/${article.sectionSlug}.js`;
  if (!cache.has(path)) cache.set(path, (await loaders[path]()).default);
  return cache.get(path)[article.slug];
}

export function Choice({ use, avoid }) {
  return (
    <div className="sdChoice">
      <div>
        <h3>Reach for it when</h3>
        <p>
          <RichText text={use} />
        </p>
      </div>
      <div>
        <h3>Think twice when</h3>
        <p>
          <RichText text={avoid} />
        </p>
      </div>
    </div>
  );
}

export function Answers({ items }) {
  return (
    <div className="sdAnswers">
      {items.map(([question, answer]) => (
        <details key={question}>
          <summary>
            <RichText text={question} />
          </summary>
          <p>
            <RichText text={answer} />
          </p>
        </details>
      ))}
    </div>
  );
}

export function DepthContent({ depth }) {
  return (
    <div className="sdConcept">
      <section id="go-deeper">
        <h2>Go deeper</h2>
        <div className="sdDepthGrid">
          {depth.more.map(([heading, text]) => (
            <div key={heading}>
              <h3>{heading}</h3>
              <p>
                <RichText text={text} />
              </p>
            </div>
          ))}
        </div>
        <Choice use={depth.use} avoid={depth.avoid} />
      </section>
      <section id="check-answer">
        <h2>Knowledge check: model answer</h2>
        <Answers items={[["Try the question above first, then compare", depth.answer]]} />
      </section>
      <section id="interview">
        <h2>Interview questions</h2>
        <Answers items={depth.qa} />
      </section>
    </div>
  );
}

/** Extra depth for a lesson with its own article: mode "motion" or "content". */
export default function SystemDesignDepth({ article, mode }) {
  const [depth, setDepth] = useState(null);
  useEffect(() => {
    let current = true;
    loadDepth(article).then((value) => current && setDepth(value));
    return () => {
      current = false;
    };
  }, [article]);
  if (!depth) return <p>Loading…</p>;
  return mode === "motion" ? (
    <SystemDesignMotion id="concept-animation" animation={depth.anim} />
  ) : (
    <DepthContent depth={depth} />
  );
}
