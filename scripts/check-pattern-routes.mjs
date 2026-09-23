import assert from "node:assert/strict";
import { createServer } from "vite";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
const server=await createServer({server:{middlewareMode:true,hmr:false},appType:"custom"});
let count=0;
try{
  const {modules,getModule,getTrack}=await server.ssrLoadModule("/src/data/catalog.js");
  const {getStructuredCourse}=await server.ssrLoadModule("/src/data/structuredCourses.js");
  assert.equal(modules.at(-1).id,"social-media");
  assert.equal(modules.findIndex(m=>m.id==="ai"),modules.findIndex(m=>m.id==="architecture")+1);
  for(const moduleId of ["coding-patterns","social-media"]){
    const module=getModule(moduleId),tracks=module.groups.flatMap(g=>g.tracks);
    assert.equal(tracks.length,moduleId==="coding-patterns"?50:8);
    for(const track of tracks){
      await server.ssrLoadModule(`/src/components/${moduleId}/${track.slug}/jsx/Course.jsx`);
      const course=getStructuredCourse(moduleId,track.slug);
      assert(course&&course.articles.length>=2);
      assert.equal(new Set(course.articles.map(a=>a.slug)).size,course.articles.length);
      for(const article of course.articles){
        const path=`/src/components/${course.componentPath}/${article.sectionSlug}/articles/${article.slug}/jsx/Article.jsx`;
        const {default:Article}=await server.ssrLoadModule(path);
        const html=renderToStaticMarkup(createElement(Article));
        for(const id of ["overview","concepts","example","mistakes","check"])assert(html.includes(`id="${id}"`),path);
        assert(!/Replace this placeholder|ready for your technical content|Add a focused implementation/.test(html),path);
        if(article.sectionSlug==="problems")for(const label of ["Previous","Play","Next","Download Solution.java","Verified examples","Brute force / baseline"])assert(html.includes(label),`${path}: ${label}`);
        count++;
      }
      for(const target of Object.values(course.aliases||{}))assert(course.articles.some(a=>a.slug===target));
    }
  }
  for(const legacy of ["divide-and-conquer","oop-patterns","two-pointers","prefix-sum","concurrency-patterns"]){
    assert(getTrack(getModule("coding-patterns"),legacy));
    const course=getStructuredCourse("coding-patterns",legacy);assert(course);
    for(const target of Object.values(course.aliases))assert(course.articles.some(a=>a.slug===target));
  }
}finally{await server.close();}
console.log(`Rendered ${count} Coding Patterns and Social Media article routes; catalog order, controls, aliases, and content checks passed.`);
