import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";
if (!process.env.DATABASE_URL) throw new Error("Set DATABASE_URL before running migrations");
const sql = neon(process.env.DATABASE_URL);
const source = await readFile(new URL("../db/migrations/001_neon.sql", import.meta.url), "utf8");
const statements = source
  .split(/;\r?\n(?=CREATE|-- Serialize)/)
  .map((s) => s.trim())
  .filter(Boolean);
await sql.transaction(statements.map((statement) => sql.query(statement)));
console.log("Neon application schema is ready.");
