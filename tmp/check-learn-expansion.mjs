import {expansionSections,expansionLessons} from '../src/data/reactLearnExpansion.js';
import fs from 'node:fs';
import {transformWithOxc} from 'vite';
for (const a of expansionSections[0].lessons) {
  const d='src/components/frontend/react/'+a.sectionSlug+'/articles/'+a.slug+'/jsx';
  fs.mkdirSync(d,{recursive:true});
  fs.writeFileSync(d+'/Article.jsx',`import ReactLesson from "../../../../ReactLesson";\nexport default function Article() { return <ReactLesson slug="${a.slug}" />; }\n`);
  const code=expansionLessons[a.slug].code;
  const lang=a.slug.includes('typescript')?'tsx':'jsx';
  await transformWithOxc(code, a.slug+'.'+lang, {lang});
}
console.log('PASS: '+expansionSections[0].lessons.length+' workshops; examples parsed and route wrappers created.');
