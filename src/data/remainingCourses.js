import { modules } from "./catalog.js";

const completedModules = new Set(["architecture", "frontend", "backend", "databases", "messaging", "dsa"]);
const slugify = (value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const section = (slug, title, lessons) => ({
  slug,
  title,
  lessons: lessons.map((lesson) => ({
    title: lesson,
    slug: `${slug}--${slugify(lesson)}`,
    time: "10 min",
    sectionSlug: slug,
  })),
});

const buildSections = (courseName, groupName, moduleName) => [
  section("foundations", `${courseName} Foundations`, [
    `Introduction to ${courseName}`, `Why ${courseName} Matters`, `${courseName} Terminology`,
    `Setting Up for ${courseName}`, `${courseName} Learning Roadmap`,
  ]),
  section("core-concepts", "Core Concepts", [
    `${courseName} Mental Models`, `${groupName} Fundamentals`, "Essential Building Blocks",
    "Common Workflows", "Trade-offs and Constraints",
  ]),
  section("practical-skills", "Practical Skills", [
    `Your First ${courseName} Exercise`, "Working Step by Step", "Debugging and Troubleshooting",
    "Reusable Techniques", "Applied Practice",
  ]),
  section("advanced-topics", "Advanced Topics", [
    `Advanced ${courseName}`, "Performance and Scale", "Reliability", "Security Considerations",
    "Integration Patterns",
  ]),
  section("real-world", "Real-World Application", [
    `${moduleName} Case Study`, "Architecture and Organization", "Team Workflow", "Common Failure Modes",
    "Review and Improvement",
  ]),
  section("mastery", "Production and Mastery", [
    "Testing and Validation", "Observability and Measurement", "Production Readiness",
    `${courseName} Best Practices`, `${courseName} Interview Questions`,
  ]),
];

export const remainingCourses = Object.fromEntries(
  modules
    .filter((module) => !completedModules.has(module.id))
    .flatMap((module) =>
      module.groups.flatMap((group) =>
        group.tracks.map((track) => {
          const sections = buildSections(track.name, group.name, module.name);
          return [`${module.id}/${track.slug}`, {
            moduleId: module.id,
            name: track.name,
            sections,
            articles: sections.flatMap((item) => item.lessons),
            componentPath: `${module.id}/${track.slug}`,
          }];
        }),
      ),
    ),
);
