import { mkdir,writeFile } from "node:fs/promises";
import { dirname,resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { socialMediaCourses } from "../src/data/socialMediaCourses.js";
const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
async function save(path,text){path=resolve(root,path);await mkdir(dirname(path),{recursive:true});await writeFile(path,text);}
for(const [slug,course] of Object.entries(socialMediaCourses)){
  await save(`src/components/social-media/${slug}/jsx/Course.jsx`,`import CoursePage from "../../../learning/CoursePage";\nimport { getModule, getTrack } from "../../../../data/catalog";\nexport default function Course({navigate}){const module=getModule("social-media");return <CoursePage module={module} track={getTrack(module,"${slug}")} navigate={navigate}/>;}\n`);
  for(const lesson of course.articles)await save(`src/components/social-media/${slug}/workflows/articles/${lesson.slug}/jsx/Article.jsx`,`import SocialLessonArticle from "../../../../../SocialLessonArticle.jsx";\nexport default function Article(){return <SocialLessonArticle courseSlug="${slug}" lessonSlug="${lesson.slug}"/>;}\n`);
}
console.log("Generated 8 Social Media courses and 24 workflow lessons.");
