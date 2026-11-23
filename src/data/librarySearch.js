import { modules, articleTemplates } from "./catalog";
import { getStructuredCourseArticles } from "./structuredCourses";

const normalize = (value) => value.toLowerCase().trim().replace(/\s+/g, " ");
let index;

export function searchLibrary(query) {
  if (!index) {
    index = modules.flatMap((module) => {
      const base = `/learn/${module.id}`;
      const entry = (title, type, path, context) => ({
        title,
        type,
        path,
        context,
        module,
        name: normalize(title),
        text: normalize(`${title} ${context}`),
      });
      return [
        entry(module.name, "Module", base, module.description),
        ...module.groups.flatMap((group) =>
          group.tracks.flatMap((track) => {
            const path = `${base}/${track.slug}`;
            const context = `${module.name} · ${group.name}`;
            const articles =
              getStructuredCourseArticles(module.id, track.slug) ||
              (track.outline ? [] : articleTemplates);
            return [
              entry(track.name, "Course", path, context),
              ...articles.map((article) =>
                entry(
                  article.title,
                  "Article",
                  `${path}/${article.slug}`,
                  `${track.name} · ${context}`,
                ),
              ),
            ];
          }),
        ),
      ];
    });
  }
  const term = normalize(query);
  if (!term) return index.filter((item) => item.type === "Course").slice(0, 12);
  const words = term.split(" ");
  const rank = (item) =>
    item.name === term ? 0 : item.name.startsWith(term) ? 1 : item.name.includes(term) ? 2 : 3;
  return index
    .filter((item) => words.every((word) => item.text.includes(word)))
    .sort((a, b) => rank(a) - rank(b));
}
