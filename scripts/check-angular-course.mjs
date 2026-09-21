import assert from "node:assert/strict";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer, transformWithOxc } from "vite";
import { angularArticles } from "../src/data/angular.js";
import { angularLessons } from "../src/data/angularLessons.js";

// Optional isolated tooling directory: npm install --prefix <directory>
// --ignore-scripts @angular/compiler@22.1.7 typescript@6.0.2
// This validates lesson snippets without adding Angular to the React learning site.
const toolingRoot = process.argv[2];
let typescript;
let parseTemplate;
if (toolingRoot) {
  const modules = path.resolve(toolingRoot, "node_modules");
  typescript = (await import(pathToFileURL(path.join(modules, "typescript/lib/typescript.js"))))
    .default;
  ({ parseTemplate } = await import(
    pathToFileURL(path.join(modules, "@angular/compiler/fesm2022/compiler.mjs"))
  ));
}

assert.equal(Object.keys(angularLessons).length, angularArticles.length);
const server = await createServer({ server: { middlewareMode: true }, appType: "custom" });
let parsedSnippets = 0;
let parsedTemplates = 0;
try {
  for (const article of angularArticles) {
    const content = angularLessons[article.slug];
    assert.ok(content, `Missing lesson: ${article.slug}`);
    for (const field of ["intro", "code", "walkthrough", "mistake", "exercise", "answer"]) {
      assert.ok(
        content[field]?.length > (field === "exercise" ? 15 : 30),
        `${article.slug}: incomplete ${field}`,
      );
    }
    assert.equal(content.concepts.length, 3, `${article.slug}: missing concepts`);
    assert.equal(content.flow.length, 3, `${article.slug}: missing visual`);
    assert.ok(content.reference.startsWith("https://"));
    const entry = `/src/components/frontend/angular/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
    const { default: Article } = await server.ssrLoadModule(entry);
    const markup = renderToStaticMarkup(createElement(Article));
    for (const section of ["overview", "concepts", "example", "mistakes", "check"]) {
      assert.ok(markup.includes(`id="${section}"`), `${article.slug}: missing ${section}`);
    }
    assert.ok(!markup.includes("Replace this placeholder"));
    assert.ok(markup.includes("Visual model"));
    assert.ok(markup.includes("Reveal explanation"));

    let code = content.code;
    // SSR lesson explicitly separates shell commands from a TypeScript component.
    if (article.slug === "production-angular--server-side-rendering")
      code = code.slice(code.indexOf("import "));
    if (/^(?:import |const |\/\/)/.test(code) && !code.includes("<!--")) {
      await transformWithOxc(code, article.slug + ".ts", { lang: "ts" });
      parsedSnippets += 1;
      if (typescript) {
        const source = typescript.createSourceFile(
          article.slug + ".ts",
          code,
          typescript.ScriptTarget.Latest,
          true,
        );
        assert.equal(source.parseDiagnostics.length, 0, `${article.slug}: TypeScript parse error`);
        const visit = (node) => {
          if (
            typescript.isPropertyAssignment(node) &&
            node.name.getText(source) === "template" &&
            typescript.isStringLiteralLike(node.initializer)
          ) {
            const result = parseTemplate(node.initializer.text, article.slug + ".html");
            assert.ok(!result.errors?.length, `${article.slug}: ${result.errors?.join("; ")}`);
            parsedTemplates += 1;
          }
          typescript.forEachChild(node, visit);
        };
        visit(source);
      }
    } else if (parseTemplate && code.startsWith("<!--")) {
      const result = parseTemplate(code, article.slug + ".html");
      assert.ok(!result.errors?.length, `${article.slug}: ${result.errors?.join("; ")}`);
      parsedTemplates += 1;
    }
  }
  console.log(
    `PASS: ${angularArticles.length} Angular route entries rendered; ${parsedSnippets} TypeScript snippets parsed${parseTemplate ? `; ${parsedTemplates} Angular templates parsed` : ""}.`,
  );
  console.log(
    "Syntax checks do not replace compiling complete examples in an Angular practice workspace.",
  );
} finally {
  await server.close();
}
