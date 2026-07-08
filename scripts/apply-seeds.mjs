#!/usr/bin/env node
/**
 * Reads seed SQL files and prints them for MCP execute_sql.
 * Usage: node scripts/apply-seeds.mjs kelly-2
 */
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const arg = process.argv[2];

if (!arg) {
  console.error("Usage: node scripts/apply-seeds.mjs <kelly-N|arabic-words>");
  process.exit(1);
}

let filePath;
if (arg === "arabic-words") {
  filePath = path.join(root, "supabase/seed-arabic-words.sql");
} else {
  filePath = path.join(root, "supabase/seed-chunks", `${arg}.sql`);
}

if (!fs.existsSync(filePath)) {
  console.error("Missing:", filePath);
  process.exit(1);
}

process.stdout.write(fs.readFileSync(filePath, "utf8"));
