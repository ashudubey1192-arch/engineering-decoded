import { patternCurriculum } from "../../data/patternCurriculum";
import { patternCourses } from "../../data/patternCourses";
import "./PatternLessonArticle.css";
export default function PatternStudyGuide({number}){
  const course=patternCurriculum.find(item=>item.number===number);
  const [courseSlug,metadata]=Object.entries(patternCourses).find(([,item])=>item.number===number);
  return <div className="patternArticle">
    <section id="overview"><p className="patternEyebrow">COURSE {number} / 50 · {course.name}</p><p className="lead">{course.model}</p></section>
    <section id="concepts"><h2>The invariant to understand</h2><p>{course.rule}</p><div className="patternFlow"><span>State the contract</span><span>→</span><span>Build a baseline</span><span>→</span><span>Prove the improvement</span><span>→</span><span>Test boundaries</span></div></section>
    <section id="example"><h2>Worked Java problems</h2><p>Each lab includes two approaches, complexity analysis, runnable Java, verified examples, and a controllable animation. Related courses revisit the same problem through a different mental model.</p><ul>{metadata.articles.filter(a=>a.sectionSlug==="problems").map(a=><li key={a.slug}><a href={`/learn/coding-patterns/${courseSlug}/${a.slug}`}>{a.title}</a></li>)}</ul><h3>Guided practice</h3><p>{course.practice}</p></section>
    <section id="mistakes"><h2>Avoid pattern matching by keywords alone</h2><p>Before choosing a solution, record the input domain, output contract, mutation policy, and scale. Then explain why the invariant still holds on the example in this course. Compare the baseline and optimized animation at the point where they stop doing the same work.</p></section>
    <section id="check"><h2>Readiness check</h2><p>Can you explain the state, justify each transition, derive the time and space bounds, and name an input assumption that would invalidate the approach?</p><details><summary>Review the study method</summary><p>Start with the worked problem's contract. Trace the baseline first. Predict each optimized state before advancing the animation. Reimplement the Java method without looking, then run the listed examples and one counterexample to a tempting incorrect shortcut.</p></details></section>
  </div>;
}
