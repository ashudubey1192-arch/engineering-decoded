import test from 'node:test';
import assert from 'node:assert/strict';
import { tokenizeJava } from '../src/data/javaSyntax.js';
import { futureTopics, customLesson, completableLesson } from '../src/data/coreJava/enrichment.js';
test('Java highlighting preserves source and keeps comments and literals intact', () => {
  const source = 'String s = "throw Error // literal"; // green?\n/* class X */ throw new IOException("bad");\nchar c = \'x\';';
  const tokens = tokenizeJava(source);
  assert.equal(tokens.map(t => t[1]).join(''), source);
  assert.ok(tokens.some(([k,v]) => k === 'string' && v === '"throw Error // literal"'));
  assert.ok(tokens.some(([k,v]) => k === 'comment' && v === '/* class X */'));
  assert.ok(tokens.some(([k,v]) => k === 'error' && v === 'IOException'));
});
test('CompletableFuture reference checklist and runnable examples remain available', () => {
  const text = JSON.stringify(futureTopics);
  for (const method of ['runAsync','supplyAsync','completedFuture','thenApply','thenCompose','thenAccept','thenRun','thenCombine','thenAcceptBoth','allOf','anyOf','get','join','cancel','exceptionally','handle','whenComplete','completeExceptionally','defaultExecutor','newIncompleteFuture','copy','minimalCompletionStage','completeAsync','orTimeout','completeOnTimeout','delayedExecutor','completedStage','failedStage','failedFuture','newVirtualThreadPerTaskExecutor']) assert.ok(text.includes(method), method);
  assert.equal(completableLesson.references.length, 3);
  for (const name of ['TinyList','TinyVector','TinyMap','TinyLinkedMap','TinySet','TinyLinkedSet']) assert.ok(customLesson.code.includes('class ' + name));
});
