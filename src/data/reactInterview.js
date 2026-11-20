import questions from './reactInterviewQuestions.json' with { type: 'json' };

export const interviewCategories = [...new Set(questions.map(q => q.category))];
export const interviewSection = {
  slug: 'interview-200',
  title: 'Top 200 React Interview Questions',
  lessons: [{ title: 'All 200 Questions: Search and Practice', category: null },
    ...interviewCategories.map(category => ({ title: category, category }))].map((item, index) => ({
      ...item,
      slug: `interview-200--${index === 0 ? 'all-questions' : `part-${index}`}`,
      sectionSlug: 'interview-200',
      time: index === 0 ? 'Practice bank' : `${questions.filter(q => q.category === item.category).length} questions`,
      interview: true,
    })),
};
export { questions as reactInterviewQuestions };
