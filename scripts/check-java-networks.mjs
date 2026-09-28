import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createServer } from "vite";
import { javaNetworkLessons, javaNetworkSections } from "../src/data/javaNetworkLessons.js";
import { javaNetworkPrograms } from "../src/data/javaNetworkPrograms.js";
import { javaArticles } from "../src/data/java.js";

const folder = await mkdtemp(path.join(tmpdir(), "java-networks-"));
const normalize = (text) => text.trim().replaceAll("\r\n", "\n");
function run(source) {
  execFileSync("javac", ["--release", "21", source], {
    cwd: folder,
    timeout: 30000,
    encoding: "utf8",
  });
  return normalize(
    execFileSync("java", ["-cp", folder, "Main"], { timeout: 15000, encoding: "utf8" }),
  );
}
assert.equal(new Set(javaNetworkLessons.map((l) => l.slug)).size, javaNetworkLessons.length);
assert.equal(javaNetworkSections.flatMap((s) => s.lessons).length, javaNetworkLessons.length);
const vite = await createServer({ server: { middlewareMode: true }, appType: "custom" });
try {
  for (const lesson of javaNetworkLessons) {
    assert.ok(
      javaArticles.some((a) => a.slug === lesson.slug),
      `Missing catalog entry ${lesson.id}`,
    );
    const route = `src/components/backend/java/${lesson.sectionSlug}/articles/${lesson.slug}/jsx/Article.jsx`;
    await readFile(route, "utf8");
    const { default: Article } = await vite.ssrLoadModule(`/${route}`);
    const html = renderToStaticMarkup(createElement(Article));
    for (const marker of [
      "Reason about correctness",
      "Expected output",
      "Next step",
      "Interview practice",
      "Apply it in a project",
    ])
      assert.ok(html.includes(marker), `${lesson.id}: ${marker}`);
    assert.equal(lesson.steps.length, 3);
    await writeFile(path.join(folder, "Main.java"), javaNetworkPrograms[lesson.id]);
    assert.equal(run("Main.java"), normalize(lesson.expected), lesson.id);
    console.log(`PASS ${lesson.id}: route renders; Java 21 compiles; output matches`);
  }
} finally {
  await vite.close();
}

const boundary = {
  model: "if(size(null)!=0 || size(new Node(1))!=1) throw new AssertionError();",
  dfs: "List<Integer> out=new ArrayList<>(); inorder(null,out); if(!out.isEmpty()) throw new AssertionError();",
  levels: "if(!levels(null).isEmpty()) throw new AssertionError();",
  bst: "if(!valid(new Node(Integer.MIN_VALUE),Long.MIN_VALUE,Long.MAX_VALUE)) throw new AssertionError(); if(valid(new Node(10,new Node(5,null,new Node(12)),null),Long.MIN_VALUE,Long.MAX_VALUE)) throw new AssertionError(); if(delete(new Node(1),1)!=null) throw new AssertionError();",
  balance: "if(height(null)!=0 || height(new Node(1))!=1) throw new AssertionError();",
  paths:
    "int[] d={0}; depth(new Node(5),d); if(d[0]!=0 || pathSum(new Node(5,new Node(1),null),5)) throw new AssertionError();",
  lca: "Node n=tree(); if(lca(n,n.left,n.left.right)!=n.left) throw new AssertionError();",
  codec:
    'if(decode(new ArrayDeque<>(List.of("#")))!=null) throw new AssertionError(); try { decode(new ArrayDeque<>(List.of("1","#"))); throw new AssertionError(); } catch(IllegalArgumentException expected) {}',
  trie: 'Trie t=new Trie(); t.add(""); if(!t.end || t.walk("x")!=null) throw new AssertionError();',
  indexes:
    "Fenwick f=new Fenwick(1); f.add(1,-3); if(f.prefix(0)!=0 || f.prefix(1)!=-3) throw new AssertionError(); try { f.add(0,1); throw new AssertionError(); } catch(IllegalArgumentException expected) {}",
  graph: "if(graph(2,new int[][]{},false).size()!=2) throw new AssertionError();",
  bfs: "var g=List.of(List.<Integer>of(),List.<Integer>of()); if(!shortest(g,0,1).isEmpty() || !shortest(g,0,0).equals(List.of(0))) throw new AssertionError();",
  components:
    "if(islands(new int[0][0])!=0 || islands(new int[][]{{0}})!=0) throw new AssertionError();",
  topo: "try { order(List.of(List.of(1),List.of(0))); throw new AssertionError(); } catch(IllegalArgumentException expected) {}",
  bipartite:
    "if(bipartite(List.of(List.of(),List.of(2,3),List.of(1,3),List.of(1,2)))) throw new AssertionError();",
  dijkstra:
    "if(distances(List.of(List.<Edge>of(),List.<Edge>of()),0)[1]!=Long.MAX_VALUE) throw new AssertionError(); try { distances(List.of(List.of(new Edge(0,-1))),0); throw new AssertionError(); } catch(IllegalArgumentException expected) {}",
  bellman:
    "try { bellman(2,new int[][]{{0,1,-2},{1,0,1}},0); throw new AssertionError(); } catch(IllegalArgumentException expected) {}",
  mst: "try { mst(2,new int[][]{}); throw new AssertionError(); } catch(IllegalArgumentException expected) {} if(mst(1,new int[][]{})!=0) throw new AssertionError();",
  scc: "if(scc(List.of(List.of(1),List.of(2),List.of(0))).size()!=1) throw new AssertionError();",
  flow: "if(flow(new int[][]{{0,0},{0,0}},0,1)!=0) throw new AssertionError();",
  reliability: 'if(retryable("GET",503,4) || retryable("GET",400,0)) throw new AssertionError();',
  capstone:
    'for(var rows:List.of(List.of(new Category("a","b"),new Category("b","a")),List.of(new Category("a","missing")),List.of(new Category("a",null),new Category("a",null)))) { try { hierarchy(rows); throw new AssertionError(); } catch(IllegalArgumentException expected) {} }',
};
for (const [id, body] of Object.entries(boundary)) {
  const source =
    javaNetworkPrograms[id].split("  public static void main")[0] +
    `  public static void main(String[] args) throws Exception { ${body}\nSystem.out.println("ok"); }\n}`;
  await writeFile(path.join(folder, "Main.java"), source);
  assert.equal(run("Main.java"), "ok", `${id} boundaries`);
}
console.log(
  `Validated ${javaNetworkLessons.length} rendered routes and runnable programs, plus ${Object.keys(boundary).length} boundary suites. TCP/HTTP tests use loopback only.`,
);
