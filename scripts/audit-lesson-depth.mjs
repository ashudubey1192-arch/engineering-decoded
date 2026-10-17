import { createServer } from "vite";
import { writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { authoredArticleFiles } from "./tutorial-articles-plugin.mjs";
const server=await createServer({logLevel:"error",optimizeDeps:{noDiscovery:true,include:[]},server:{middlewareMode:true,hmr:false},appType:"custom"});
try {
  const {modules}=await server.ssrLoadModule("/src/data/catalog.js");
  const {getStructuredCourse}=await server.ssrLoadModule("/src/data/structuredCourses.js");
  const {getTutorialLesson}=await server.ssrLoadModule("/src/data/tutorialLessons.js");
  const authored=new Set(authoredArticleFiles(process.cwd()));
  const rows=[];
  for(const module of modules)for(const track of module.groups.flatMap(g=>g.tracks)){
    const course=getStructuredCourse(module.id,track.slug);
    for(const article of course.articles){
      const file=`${course.componentPath}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
      let coverage="authored-component",mechanism="";
      if(article.lab)coverage="authored-interview-lab";
      else if(!authored.has(file)){const lesson=getTutorialLesson(module,track,article);coverage=lesson.coverage;mechanism=lesson.mechanism.title;}
      rows.push({course:`${module.id}/${track.slug}`,slug:article.slug,title:article.title,coverage,mechanism});
    }
  }
  const counts={};for(const row of rows)counts[row.coverage]=(counts[row.coverage]||0)+1;
  writeFileSync("LESSON_DEPTH_AUDIT.json",JSON.stringify({reviewDate:"2026-10-18",note:"Automated classification of content paths; not an expert factual review. Shared mechanisms may be appropriate, but course-matched and general-workflow entries require editorial attention.",counts,lessons:rows},null,2)+"\n");
  console.log(JSON.stringify(counts));
  const gaps=rows.filter(r=>r.coverage==="general-workflow");
  const grouped={};for(const row of gaps)(grouped[row.course]??=[]).push(row.title);
  console.log(JSON.stringify(grouped,null,2));
  assert.equal(counts["general-workflow"]||0,0,"Lessons still use a general workflow fallback; inspect LESSON_DEPTH_AUDIT.json.");
  assert.equal(counts["course-matched"]||0,0,"Lessons still rely on course-name matching; inspect LESSON_DEPTH_AUDIT.json.");
}finally{await server.close();}
