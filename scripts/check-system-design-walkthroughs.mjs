import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import { systemDesignFundamentalsSections } from '../src/data/systemDesignFundamentals.js';
import { getSystemDesignWalkthrough, systemDesignWalkthroughs } from '../src/data/systemDesignWalkthroughs.js';

const server = await createServer({ configFile: false, plugins: [react()], logLevel: 'error', optimizeDeps: { noDiscovery: true, include: [] }, server: { middlewareMode: true, hmr: false }, appType: 'custom' });
try {
  const { default: Walkthrough, WalkthroughDiagram } = await server.ssrLoadModule('/src/components/learning/SystemDesignWalkthrough.jsx');
  let frames = 0;
  for (const section of systemDesignFundamentalsSections) {
    const study = getSystemDesignWalkthrough(section.slug);
    assert.ok(study, `Missing case study for ${section.slug}`);
    assert.equal(study.actors.length, 4);
    assert.equal(new Set(study.actors).size, 4);
    assert.equal(study.steps.length, 4);
    for (const field of ['concept', 'scenario', 'tradeoff', 'question', 'answer']) {
      assert.ok(study[field].length > (field === 'question' ? 20 : 50), `${section.slug}: incomplete ${field}`);
    }
    let previousMarkup;
    study.steps.forEach((frame, index) => {
      assert.equal(frame.states.length, study.actors.length);
      assert.ok(frame.states.every(state => state.length > 0 && state.length <= 28), `${section.slug}: diagram state overflows`);
      assert.ok(frame.explanation.length > 80 && frame.why.length > 80 && frame.result.length > 20, `${section.slug}: incomplete step ${index + 1}`);
      assert.equal(frame.path.length, 2);
      assert.notEqual(frame.path[0], frame.path[1]);
      assert.ok(frame.path.every(actor => Number.isInteger(actor) && actor >= 0 && actor < study.actors.length));
      const diagram = renderToStaticMarkup(createElement(WalkthroughDiagram, { study, stepIndex: index }));
      assert.ok(diagram.includes('role="img"') && diagram.includes('marker-end="url(#'));
      assert.ok(!diagram.includes('NaN') && !diagram.includes('Infinity'));
      assert.notEqual(diagram, previousMarkup, `${section.slug}: the diagram must change at each step`);
      if (index) assert.notDeepEqual(frame.states, study.steps[index - 1].states, `${section.slug}: no system state change`);
      previousMarkup = diagram;
      frames++;
    });
    const html = renderToStaticMarkup(createElement(Walkthrough, { sectionSlug: section.slug, sectionTitle: section.title }));
    assert.ok(html.includes('id="system-design-walkthrough"'));
    assert.ok(html.includes('shared section case study'), 'Do not present a section example as a unique lesson simulation');
    assert.ok(html.includes('Read all steps together') && html.includes('Reveal the explanation'));
    assert.ok(html.includes('aria-label="Case study playback"'));
    assert.equal((html.match(/aria-pressed="true"/g) || []).length, 1, 'Only the first step is selected; playback starts paused');
    const markers = [...html.matchAll(/<marker id="([^"]+)"/g)].map(match => match[1]);
    assert.equal(new Set(markers).size, markers.length);
  }
  assert.equal(getSystemDesignWalkthrough('not-a-section'), null);
  assert.equal(renderToStaticMarkup(createElement(Walkthrough, { sectionSlug: 'not-a-section' })), '');
  const allCopy = JSON.stringify(systemDesignWalkthroughs);
  assert.ok(!/https?:\/\/(?![\w.-]+\.example[/:])|algomaster|reference:\s|source:\s/i.test(allCopy), 'Keep source names and reference links out of the authored case studies; illustrative .example URLs are allowed');
  console.log(`Verified ${systemDesignFundamentalsSections.length} section case studies, ${frames} changing diagram states, accessible controls, transcripts, and revealed explanations.`);
} finally {
  await server.close();
}
