import sections from './aiEngineeringOutline.json' with { type: 'json' };
export const aiEngineeringCourse = {
  moduleId: 'ai', name: 'AI Engineering', sections,
  articles: sections.flatMap(section => section.lessons),
  componentPath: 'ai/ai-engineering',
  aliases: { 'course-roadmap': 'welcome--course-roadmap' },
};
