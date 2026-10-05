import { technicalTopics } from "./tutorialTopics";
import { aiTopics, peopleTopics, wellbeingTopics } from "./tutorialPractice";
import { courseFocus, tutorialProfiles } from "./tutorialProfiles";
import { platformTopics } from "./tutorialPlatforms";

const peopleModules = new Set([
  "communication", "leadership", "interviews", "mock-interviews", "roadmaps",
  "career", "blogs", "marketing", "video",
]);
const collaborationTools = new Set(["notion", "confluence", "slack", "teams", "microsoft-office"]);

export function getTutorialLesson(module, track, article) {
  const profile = tutorialProfiles[module.id];
  if (!profile) throw new Error(`Missing tutorial profile: ${module.id}/${track.slug}`);
  const focus = courseFocus[`${module.id}/${track.slug}`] || profile.intro;
  let topics = technicalTopics;
  if (module.id === "ai") topics = [...aiTopics, ...technicalTopics];
  if (module.id === "mobile" || module.id === "desktop") topics = [...platformTopics, ...technicalTopics];
  if (peopleModules.has(module.id) || (module.id === "misc-tools" && collaborationTools.has(track.slug))) {
    topics = peopleTopics;
  }
  if (module.id === "wellbeing") topics = wellbeingTopics;
  const subject = module.id === "wellbeing" ? `${track.name} ${article.title}` : article.title;
  const mechanism = topics.find((item) => item.match.test(subject))
    || topics.find((item) => item.match.test(track.name))
    || {
      title: `${track.name}: connect the concept to a complete workflow`,
      explanation: focus,
      example: profile.example,
      mistake: "Treating one successful demonstration as complete evidence leaves boundary conditions unexamined. Record the starting conditions and check what happens when a required input or dependency is missing.",
      question: `What evidence would demonstrate that the ${track.name} workflow is ready for another person to use?`,
      answer: profile.expected,
    };
  return { ...profile, focus, mechanism };
}
