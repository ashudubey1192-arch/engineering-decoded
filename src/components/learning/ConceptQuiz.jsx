import { useEffect, useRef, useState } from 'react';
import './ConceptQuiz.css';

export default function ConceptQuiz({ title, questions }) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [finished, setFinished] = useState(false);
  const heading = useRef(null);
  const question = questions[current];
  const score = questions.filter((item, index) => answers[index] === item.answer).length;
  useEffect(() => {
    if (started) heading.current?.focus();
  }, [started, current, finished]);
  const move = (index) => setCurrent(index);
  const retry = () => { setAnswers({}); setChecked({}); setCurrent(0); setFinished(false); };

  return <section id="concept-quiz" className="conceptQuiz" aria-label={`${title} quiz`}>
    <h2>Quiz</h2>
    {!started ? <div className="quizLaunch">
      <span className="quizBulb" aria-hidden="true">✧</span>
      <div><h3>{title} Quiz</h3><small>{questions.length} {questions.length === 1 ? 'question' : 'questions'} · Multiple choice</small></div>
      <button className="quizPrimary" onClick={() => setStarted(true)}>Start <span aria-hidden="true">→</span></button>
    </div> : <div className="quizPanel">
      <div className="quizProgress" role="progressbar" aria-label="Questions answered" aria-valuemin={0} aria-valuemax={questions.length} aria-valuenow={Object.keys(checked).length}><span style={{ width: `${Object.keys(checked).length / questions.length * 100}%` }} /></div>
      <div className="quizPanelTitle"><h3>{title} Quiz</h3><span>{finished ? 'Results' : `${current + 1} / ${questions.length}`}</span></div>
      {finished ? <div className="quizResults" aria-live="polite">
        <h3 ref={heading} tabIndex={-1}>You scored {score} / {questions.length}</h3>
        <p>{score === questions.length ? 'Well done! You understood the key ideas.' : 'Review the explanations below, then try again.'}</p>
        {questions.map((item, index) => <details key={item.prompt}><summary>{answers[index] === item.answer ? '✓' : '✕'} {item.prompt}</summary><p><strong>Correct answer:</strong> {item.options[item.answer]}</p><p>{item.explanation}</p></details>)}
        <button className="quizPrimary" onClick={retry}>Try again</button>
      </div> : <>
        <small className="quizType">◉ Multiple choice · Select one answer</small>
        <h4 ref={heading} tabIndex={-1}>{question.prompt}</h4>
        <div className="quizOptions" role="group" aria-label={question.prompt}>
          {question.options.map((option, index) => <button key={option} aria-pressed={answers[current] === index} disabled={checked[current]} className={[answers[current] === index ? 'selected' : '', checked[current] && index === question.answer ? 'correct' : '', checked[current] && answers[current] === index && index !== question.answer ? 'incorrect' : ''].join(' ')} onClick={() => setAnswers(previous => ({ ...previous, [current]: index }))}>
            <span className="quizLetter">{'ABCD'[index]}</span><span>{option}</span>{checked[current] && index === question.answer && <b aria-label="Correct answer">✓</b>}
          </button>)}
        </div>
        {checked[current] && <div className="quizFeedback" role="status"><strong>{answers[current] === question.answer ? 'Correct.' : 'Not quite.'}</strong> {question.explanation}</div>}
        <footer><button disabled={current === 0} onClick={() => move(current - 1)}>‹ Previous</button>
          {!checked[current] ? <button className="quizPrimary" disabled={answers[current] === undefined} onClick={() => setChecked(previous => ({ ...previous, [current]: true }))}>Check answer</button> : <button className="quizPrimary" onClick={() => current === questions.length - 1 ? setFinished(true) : move(current + 1)}>{current === questions.length - 1 ? 'See results' : 'Next →'}</button>}
        </footer>
      </>}
    </div>}
  </section>;
}
