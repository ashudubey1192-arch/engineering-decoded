import { useEffect } from "react";
import DsaPracticeLab from "./DsaPracticeLab.jsx";
import DsaPlayground from "./DsaPlayground.jsx";
import DsaConceptDiagrams from "./DsaConceptDiagrams.jsx";
import DsaProgressPanel from "./DsaProgressPanel.jsx";
import DsaInterview from "./DsaInterview.jsx";
import DsaJavaLab from "./DsaJavaLab.jsx";
import DsaLearningPaths, { DsaRevisionQueue } from "./DsaLearningPaths.jsx";
import "./DsaLearningTools.css";

export default function DsaLearningTools({ courseSlug, lessonSlug }) {
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    let second;
    const first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() =>
        document.getElementById(id)?.scrollIntoView({ block: "start" }),
      );
    });
    return () => {
      window.cancelAnimationFrame(first);
      if (second) window.cancelAnimationFrame(second);
    };
  }, [courseSlug, lessonSlug]);
  return (
    <>
      <DsaLearningPaths />
      <DsaRevisionQueue />
      <DsaPracticeLab courseSlug={courseSlug} lessonSlug={lessonSlug} />
      <DsaInterview />
      <DsaJavaLab />
      <DsaPlayground />
      <DsaConceptDiagrams />
      <DsaProgressPanel />
    </>
  );
}
