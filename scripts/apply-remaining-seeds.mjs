#!/usr/bin/env node
/**
 * Outputs remaining seed files as JSON lines for batch MCP apply_migration.
 * Usage: node scripts/apply-remaining-seeds.mjs
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "supabase/seed-remaining");

const files = [
  "stmt-4.sql",
  "stmt-5.sql",
  "bulk-6-10.sql",
  "bulk-11-13.sql",
];

for (const f of files) {
  const full = path.join(dir, f);
  const query = fs.readFileSync(full, "utf8");
  const name = f.replace(/[^a-z0-9]+/gi, "_").replace(/^_|_$/g, "").toLowerCase();
  console.log(JSON.stringify({ name: `seed_${name}`, query }));
}
