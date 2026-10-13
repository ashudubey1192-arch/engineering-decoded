import { aiEngineeringLessons } from '../../data/aiEngineeringLessons';
import { aiEngineeringCourse } from '../../data/aiEngineeringCourse';
import { clean, questionsFor } from '../../data/aiEngineering/helpers';
import AiEngineeringAnimation from './AiEngineeringAnimation';
import ConceptQuiz from './ConceptQuiz';
import './AiEngineeringArticle.css';

export default function AiEngineeringArticle({ article }) {
  const lesson = aiEngineeringLessons[article.slug];
  if (!lesson) return <p>Chapter unavailable. Please return to the course outline.</p>;
  return <div className="aeLesson">
    <section id="overview"><p className="lead">{lesson.intro}</p><div className="aeGoal"><small>BUILD AND VERIFY</small><p>{lesson.exercise}</p></div>
      {article.slug === 'welcome--course-roadmap' && <div className="aeRoadmap"><h2>87 chapters · 16 sections</h2><p>Every chapter includes an original explanation, a worked example, an animated four-stage trace, practice, and five quiz questions.</p><ol>{aiEngineeringCourse.sections.map(section => <li key={section.slug}><a href={`/learn/ai/ai-engineering/${section.lessons[0].slug}`}>{section.title}</a><span>{section.lessons.length} chapters</span></li>)}</ol></div>}
    </section>
    <section id="concepts"><h2>How it works</h2><p>{clean(lesson.explanation)}</p><h3>Reason through the example</h3><p>{lesson.reasoning}</p><h3>Where it fits: {lesson.sectionTitle}</h3><p>{lesson.context}</p></section>
    <AiEngineeringAnimation key={article.slug} lesson={lesson} />
    <section id="example"><h2>Worked example and implementation</h2><p>Trace the inputs and state changes shown above, then inspect this compact example. Unless it includes complete Python imports and definitions, treat it as a workflow sketch; service names and helper functions stand for application-specific implementations.</p><pre><code>{lesson.code}</code></pre><div className="aeExpected"><strong>Final checkpoint in the walkthrough</strong><p>{lesson.steps[lesson.steps.length - 1].state}</p></div><h3>Verify the behavior</h3><p>{lesson.exercise}</p></section>
    <section id="mistakes"><h2>Failure mode and trade-off</h2><p>{lesson.pitfall}</p><p>Use the four-stage trace to locate the first point where the observed state differs from the expected state. Keep that input as a regression case, change the responsible component, and repeat the example before expanding the workflow.</p></section>
    <section id="check"><h2>Practice and review</h2><p>{lesson.exercise}</p><details><summary>Review criteria</summary><p>A complete explanation identifies the starting input, describes the state at each stage, and explains the failure boundary discussed above. Support your conclusion with the example’s observed result rather than assuming the operation succeeded.</p><p><strong>Remember:</strong> {clean(lesson.explanation)}</p></details>{lesson.reference && <><h3>References</h3><p><a href={lesson.reference} target="_blank" rel="noreferrer">Supporting documentation</a></p></>}</section>
    <ConceptQuiz key={`quiz/${article.slug}`} title={lesson.title} questions={questionsFor(lesson)} />
  </div>;
}
