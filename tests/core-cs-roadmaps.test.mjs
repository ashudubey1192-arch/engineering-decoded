import test from "node:test";
import assert from "node:assert/strict";
import { coreCsRoadmaps, coreCsRoadmapSections } from "../src/data/coreCsCourses.js";
import { interviewLessons, makeInterviewCourse } from "../src/data/interviewCourses.js";
import { osRoadmapContent } from "../src/data/osRoadmapContent.js";
import { networkRoadmapContent } from "../src/data/networkRoadmapContent.js";

// Independent totals and section sizes from the public roadmaps checked 2026-10-18.
const expected = {
  "core-cs/operating-systems": { total:153, sizes:[2,6,5,7,10,11,8,8,7,11,9,14,14,10,9,11,11], content:osRoadmapContent },
  "core-cs/computer-networks": { total:111, sizes:[2,2,5,7,9,11,9,12,8,9,8,10,10,9], content:networkRoadmapContent },
};
for (const [key, spec] of Object.entries(expected)) {
  test(`${key}: every source chapter has one rendered lesson in its original section`, () => {
    const manifest = coreCsRoadmaps[key];
    assert.deepEqual(manifest.sections.map(s=>s.chapters.length),spec.sizes);
    const chapters = manifest.sections.flatMap(s=>s.chapters);
    assert.equal(chapters.length,spec.total);
    assert.equal(new Set(chapters.map(c=>c.id)).size,spec.total);
    const course = makeInterviewCourse(key,interviewLessons[key]);
    assert.equal(course.articles.length,spec.total+12);
    assert.equal(new Set(course.articles.map(a=>a.slug)).size,course.articles.length);
    for (const section of manifest.sections) {
      const rendered = course.sections.find(s=>s.slug===section.slug);
      assert.equal(rendered.title,section.title);
      assert.deepEqual(rendered.lessons.map(a=>a.roadmap.id),section.chapters.map(c=>c.id));
      for (const source of section.chapters) {
        const article=rendered.lessons.find(a=>a.roadmap.id===source.id);
        assert.equal(article.title,source.title);
        assert.equal(article.roadmap.source,source.source);
        assert.ok(article.lab.visual);
        assert.ok(article.lab.concept.length>200,source.id);
        for (const field of ["scenario","mistake","question","answer","challenge"]) assert.ok(article.lab[field].length>20,`${source.id}: ${field}`);
        assert.equal(article.lab.states.length,3);
        assert.ok(article.lab.states.every(s=>s.length===4&&s.every(v=>typeof v==="string"&&v.trim())));
      }
    }
    const technical=chapters.filter(c=>!c.id.endsWith("interview-questions")&&!['course-roadmap','join-community'].includes(c.id));
    assert.deepEqual(Object.keys(spec.content).sort(),technical.map(c=>c.id).sort());
    // Do not inflate topic coverage by sharing the same generic explanation or scenario.
    for (const field of ['concept','scenario','trace','question']) assert.equal(new Set(Object.values(spec.content).map(d=>d[field])).size,technical.length,field);
    for (const section of coreCsRoadmapSections[key]) {
      const review=section.lessons.find(a=>a.lab.questions);
      if(review) assert.deepEqual(review.lab.questions.map(q=>q.topic),section.lessons.filter(a=>!a.lab.questions).map(a=>a.title));
    }
    const urls=new Set(course.articles.map(a=>`/learn/${key}/${a.slug}`));
    for(const a of course.articles) for(const link of [...(a.lab.links||[]),...(a.lab.questions||[])]) {
      if(link.href.startsWith('/')) assert.ok(urls.has(link.href),`Broken link: ${link.href}`);
    }
    assert.match(course.articles.at(-1).title,/Capstone/);
  });
}
