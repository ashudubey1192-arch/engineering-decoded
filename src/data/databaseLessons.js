import { databaseCourses } from "./databaseCourses.js";
import { databaseLessonTopics } from "./databaseLessonTopics.js";
import { databaseLessonProfiles } from "./databaseLessonProfiles.js";
import { databaseNoSqlProfiles } from "./databaseNoSqlProfiles.js";
import { databaseHybridProfiles } from "./databaseHybridProfiles.js";
import { databaseVectorProfiles } from "./databaseVectorProfiles.js";
import { databaseScalingProfiles } from "./databaseScalingProfiles.js";

export const databaseProfiles = {
  ...databaseLessonProfiles,
  ...databaseNoSqlProfiles,
  ...databaseHybridProfiles,
  ...databaseVectorProfiles,
  ...databaseScalingProfiles,
};

export const databaseLessons = Object.fromEntries(
  Object.entries(databaseCourses).map(([courseSlug, course]) => {
    const profile = databaseProfiles[courseSlug];
    if (
      !profile ||
      profile.notes.length !== course.articles.length ||
      profile.labs.length !== course.sections.length
    ) {
      throw new Error(`Incomplete database content: ${courseSlug}`);
    }
    let topicIndex = 0;
    const lessons = course.sections.flatMap((section, sectionIndex) =>
      section.lessons.map((article) => {
        const index = topicIndex++;
        const topic = databaseLessonTopics[index];
        if (!topic) throw new Error(`Missing database topic: ${courseSlug}/${article.slug}`);
        return [
          article.slug,
          {
            ...topic,
            title: article.title,
            course: course.name,
            section: section.title,
            context: profile.context,
            specific: profile.notes[index],
            lab: profile.labs[sectionIndex],
            reference: profile.reference,
            position: index + 1,
            // Lab steps build on the earlier sections. Link the actual prerequisite routes.
            prerequisites: course.sections.slice(0, sectionIndex).map((item) => ({
              title: item.title,
              href: `/learn/databases/${courseSlug}/${item.lessons[0].slug}`,
            })),
          },
        ];
      }),
    );
    return [courseSlug, Object.fromEntries(lessons)];
  }),
);
