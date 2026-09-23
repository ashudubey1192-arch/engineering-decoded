import { readFile, writeFile, mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import assert from "node:assert/strict";
import { linearProblems } from "../src/data/patternLinearProblems.js";
import { structureProblems } from "../src/data/patternStructureProblems.js";
import { graphProblems } from "../src/data/patternGraphProblems.js";
import { dpProblems } from "../src/data/patternDpProblems.js";
import { advancedProblems } from "../src/data/patternAdvancedProblems.js";
import { interviewProblems } from "../src/data/patternInterviewProblems.js";
import { patternCurriculum } from "../src/data/patternCurriculum.js";
import { slug } from "../src/data/patternLessonSchema.js";
import { javaSource } from "./pattern-java-support.mjs";

const root=resolve(dirname(fileURLToPath(import.meta.url)),"..");
const check=process.argv.includes("--check");
const lessons=[...linearProblems,...structureProblems,...graphProblems,...dpProblems,...advancedProblems,...interviewProblems];
const lessonMap=new Map(lessons.map(p=>[p.id,p]));
assert.equal(lessonMap.size,lessons.length,"Problem ids must be unique");
const temp=await mkdtemp(join(tmpdir(),"engineering-patterns-"));
async function save(path,content){
  path=join(root,path);let previous;
  try{previous=await readFile(path,"utf8");}catch(error){if(error.code!=="ENOENT")throw error;}
  if(previous===content)return;
  if(check)throw new Error(`Generated content is stale: ${relative(root,path)}. Run npm run generate:patterns.`);
  await mkdir(dirname(path),{recursive:true});await writeFile(path,content);
}
let totalRuns=0,totalFrames=0;
try{
  // Compile the very same standalone classes offered by the lesson reader.
  const sourceFiles=[];
  for(const [i,p] of lessons.entries())for(const mode of ["brute","optimal"]){
    const name=`Lab${i}${mode}`;
    const file=join(temp,`${name}.java`);
    await writeFile(file,javaSource(p,mode,name,true));sourceFiles.push(file);
  }
  const argsFile=join(temp,"sources.txt");
  await writeFile(argsFile,sourceFiles.map(f=>`"${f.replaceAll("\\","/")}"`).join("\n"));
  execFileSync("javac",["-encoding","UTF-8",`@${argsFile}`],{timeout:120000,stdio:"pipe"});
  for(const [i,p] of lessons.entries()){
    const runs={};
    for(const mode of ["brute","optimal"]){
      const output=execFileSync("java",["-cp",temp,`Lab${i}${mode}`],{encoding:"utf8",timeout:20000,maxBuffer:32*1024*1024});
      let current;
      runs[mode]=[];
      for(const line of output.split(/\r?\n/)){
        if(line.startsWith("CASE\t")){current={frames:[]};runs[mode].push(current);}
        else if(line.startsWith("FRAME\t"))current.frames.push(JSON.parse(line.slice(6)));
        else if(line.startsWith("RESULT\t"))current.result=line.slice(7);
      }
      assert.equal(runs[mode].length,p.tests.length,`${p.id} case count`);
      runs[mode].forEach((run,index)=>{
        assert.equal(run.result,p.tests[index].expected,`${p.id}/${mode}/${index}`);
        assert(run.frames.length>=2&&run.frames.length<12000,`${p.id} trace must be complete`);
        totalFrames+=run.frames.length;totalRuns++;
      });
    }
    await save(`src/data/patterns/generated/${p.id}.json`,JSON.stringify({...p,runs,source:{brute:javaSource(p,"brute"),optimal:javaSource(p,"optimal")}},null,2)+"\n");
  }
  const courses={},groups=new Map();
  const bands=["Foundation","Core interview patterns","Recursion and trees","Graphs","Optimization","Advanced techniques","Senior Java"];
  const bandFor=n=>n<=8?0:n<=14?1:n<=19?2:n<=26?3:n<=35?4:n<=45?5:6;
  // Keep established public URLs for existing courses.
  const legacySlugs={4:"two-pointers",5:"sliding-window",6:"prefix-sum",15:"recursion",36:"bit-manipulation",49:"concurrency-patterns"};
  for(const course of patternCurriculum){
    const courseSlug=legacySlugs[course.number]||slug(course.name);
    const guide={title:"Mental model, invariants, and study plan",slug:"guide--study-plan",sectionSlug:"guide",time:"12 min"};
    const problemArticles=course.problems.map(id=>{const p=lessonMap.get(id);assert(p,`Missing ${id}`);return {title:p.title,slug:p.slug,sectionSlug:p.sectionSlug,time:p.time};});
    const sections=[{slug:"guide",title:"Understand the pattern",lessons:[guide]},{slug:"problems",title:"Java solutions and animated walkthroughs",lessons:problemArticles}];
    const articles=[guide,...problemArticles];
    const aliases=Object.fromEntries(["introduction","core-concepts","architecture","practical-guide","best-practices","interview-questions"].map(x=>[x,guide.slug]));
    const directory=`src/components/coding-patterns/${courseSlug}`;
    // Existing generated skeleton routes remain navigable, now pointing to authored material.
    try{for(const section of await readdir(join(root,directory),{withFileTypes:true})){if(!section.isDirectory())continue;const articleDir=join(root,directory,section.name,"articles");try{for(const old of await readdir(articleDir)){if(!articles.some(a=>a.slug===old))aliases[old]=guide.slug;}}catch(error){if(error.code!=="ENOENT")throw error;}}}catch(error){if(error.code!=="ENOENT")throw error;}
    courses[courseSlug]={name:course.name,number:course.number,sections,articles,aliases,componentPath:`coding-patterns/${courseSlug}`};
    const band=bands[bandFor(course.number)];if(!groups.has(band))groups.set(band,[]);groups.get(band).push({name:course.name,slug:courseSlug});
    await save(`${directory}/jsx/Course.jsx`,`import CoursePage from "../../../learning/CoursePage";\nimport { getModule, getTrack } from "../../../../data/catalog";\nexport default function Course({navigate}) { const module=getModule("coding-patterns"); return <CoursePage module={module} track={getTrack(module,"${courseSlug}")} navigate={navigate} />; }\n`);
    await save(`${directory}/guide/articles/${guide.slug}/jsx/Article.jsx`,`import PatternStudyGuide from "../../../../../PatternStudyGuide.jsx";\nexport default function Article(){return <PatternStudyGuide number={${course.number}} />;}\n`);
    for(const id of course.problems){const p=lessonMap.get(id);await save(`${directory}/problems/articles/${p.slug}/jsx/Article.jsx`,`import PatternLessonArticle from "../../../../../PatternLessonArticle.jsx";\nimport lesson from "../../../../../../../data/patterns/generated/${id}.json";\nexport default function Article(){return <PatternLessonArticle lesson={lesson} />;}\n`);}
  }
  // Retain the two older track URLs without advertising extra courses in the 50-course syllabus.
  for(const [alias,number] of [["divide-and-conquer",7],["oop-patterns",46]]){
    const target=Object.entries(courses).find(([,v])=>v.number===number);
    const oldAliases={...target[1].aliases};
    const legacySections=["foundations","core-concepts","practical-skills","advanced-topics","real-world","mastery"];
    for(const section of legacySections){try{for(const name of await readdir(join(root,`src/components/coding-patterns/${alias}/${section}/articles`)))oldAliases[name]="guide--study-plan";}catch(error){if(error.code!=="ENOENT")throw error;}}
    courses[alias]={...target[1],aliases:oldAliases};
  }
  await save("src/data/patternCourses.js",`// Generated by npm run generate:patterns.\nexport const patternCourses = ${JSON.stringify(courses,null,2)};\nexport const patternGroups = ${JSON.stringify([...groups].map(([name,tracks])=>({name,tracks})),null,2)};\n`);
  console.log(`${check?"Verified":"Generated"} 50 courses, ${lessons.length} unique Java problems, ${totalRuns} executed examples and ${totalFrames} animation frames.`);
}catch(error){if(error.stderr)console.error(error.stderr.toString());throw error;}
finally{
  // Only remove the exact temporary directory created above, after containment validation.
  const resolved=resolve(temp),parent=resolve(tmpdir());
  assert(dirname(resolved)===parent&&resolved.split(/[\\/]/).at(-1).startsWith("engineering-patterns-"));
  await rm(resolved,{recursive:true,force:true});
}
