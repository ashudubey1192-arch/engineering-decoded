import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import {
  javaAlgorithmTechniques,
  javaTechniqueSource,
} from "../src/data/javaAlgorithmTechniques.js";

// Compile as Java 8 to verify the documented minimum language/API level.
const directory = await mkdtemp(join(tmpdir(), "java-techniques-"));
function run(command, args) {
  const result = spawnSync(command, args, { cwd: directory, encoding: "utf8", timeout: 30000 });
  if (result.error) throw result.error;
  assert.equal(result.status, 0, `${command}: ${result.stderr}\n${result.stdout}`);
  return result.stdout.trim();
}
try {
  assert.equal(
    new Set(javaAlgorithmTechniques.map((item) => item.id)).size,
    javaAlgorithmTechniques.length,
  );
  for (const item of javaAlgorithmTechniques) {
    assert.ok(item.steps.length >= 3 && item.checks.length >= 2, item.id);
    for (const field of ["signal", "invariant", "complexity", "project", "pitfall", "practice"])
      assert.ok(item[field].length > 0, `${item.id}: ${field}`);
    await writeFile(join(directory, "Main.java"), javaTechniqueSource(item, true));
    run("javac", ["--release", "8", "Main.java"]);
    assert.equal(run("java", ["-cp", directory, "Main"]), item.expected, `${item.id}: output`);
    console.log(`PASS ${item.id}: example and ${item.checks.length} boundary checks`);
  }
} finally {
  // directory is created by mkdtemp directly under the operating-system temp root.
  await rm(directory, { recursive: true, force: true });
}
console.log(`Verified ${javaAlgorithmTechniques.length} Java techniques.`);
