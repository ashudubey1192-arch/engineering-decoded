import ConceptQuiz from './ConceptQuiz';
import quizzes from '../../data/systemDesignQuizzes.json';
import { scalabilityQuiz } from '../../data/systemDesignQuizOverrides';

export default function SystemDesignQuiz({ lessonKey, title }) {
  const questions = lessonKey === 'system-design-fundamentals/core-concepts--scalability' ? scalabilityQuiz : quizzes[lessonKey];
  return questions ? <ConceptQuiz title={title} questions={questions} /> : null;
}
