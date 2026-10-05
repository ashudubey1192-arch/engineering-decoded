import { readdirSync, readFileSync } from "node:fs";
import { resolve, relative } from "node:path";

export const starterCopy = /Replace this placeholder|Replace this starter|Add a focused|ready for your technical content/;

// Only publish written articles. Historical scaffolds otherwise create thousands
// of empty chunks and hide the shared lessons behind starter copy.
export function authoredArticleFiles(root) {
  const directory = resolve(root, "src/components");
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && /^(Article|Introduction|CoreConcepts|Architecture|PracticalGuide|BestPractices|InterviewQuestions)\.jsx$/.test(entry.name))
    .map((entry) => resolve(entry.parentPath, entry.name))
    .filter((file) => !starterCopy.test(readFileSync(file, "utf8")))
    .map((file) => relative(directory, file).replaceAll("\\", "/"))
    .sort();
}

export default function tutorialArticlesPlugin() {
  let root;
  const id = "virtual:tutorial-articles";
  return {
    name: "tutorial-articles",
    configResolved(config) { root = config.root; },
    resolveId(source) { if (source === id) return `\0${id}`; },
    load(source) {
      if (source !== `\0${id}`) return;
      const entries = authoredArticleFiles(root).map((file) => {
        this.addWatchFile(resolve(root, "src/components", file));
        return `${JSON.stringify(`../${file}`)}: () => import(${JSON.stringify(`/src/components/${file}`)})`;
      });
      return `export default {${entries.join(",\n")}};`;
    },
  };
}
