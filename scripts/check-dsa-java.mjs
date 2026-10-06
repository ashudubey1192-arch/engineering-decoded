import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync } from "node:child_process";
import { dsaJavaPractice } from "../src/data/dsaJavaPractice.js";
const directory = await mkdtemp(join(tmpdir(), "ed-authored-java-"));
try {
  for (const problem of dsaJavaPractice) {
    await writeFile(join(directory, "Main.java"), problem.solution);
    const compiled = spawnSync("javac", ["--release", "21", "Main.java"], {
      cwd: directory,
      encoding: "utf8",
      timeout: 20000,
    });
    assert.equal(compiled.status, 0, compiled.stderr || String(compiled.error));
    for (const test of problem.tests) {
      const run = spawnSync("java", ["-cp", directory, "Main"], {
        input: test.input,
        encoding: "utf8",
        timeout: 5000,
      });
      assert.equal(run.status, 0, `${problem.id}/${test.label}: ${run.stderr || run.error}`);
      assert.equal(run.stdout.trim(), test.expected, `${problem.id}/${test.label}`);
    }
  }
  console.log(
    `Compiled ${dsaJavaPractice.length} authored Java programs and checked all ${dsaJavaPractice.reduce((n, p) => n + p.tests.length, 0)} outputs.`,
  );
} finally {
  await rm(directory, { recursive: true, force: true });
}
