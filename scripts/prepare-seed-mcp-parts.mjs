import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const parts = [];

const kelly = fs
  .readdirSync(path.join(root, "supabase/seed-chunks"))
  .filter((f) => f.startsWith("kelly-") && f !== "kelly-1.sql")
  .sort()
  .map((f) => fs.readFileSync(path.join(root, "supabase/seed-chunks", f), "utf8"));

parts.push(...kelly);

const words = fs.readFileSync(path.join(root, "supabase/seed-arabic-words.sql"), "utf8");
parts.push(
  ...[...words.matchAll(/INSERT INTO[\s\S]*?ON CONFLICT[\s\S]*?;/g)].map((m) => m[0].trim()),
);

const outDir = path.join(root, "supabase/seed-mcp-parts");
fs.mkdirSync(outDir, { recursive: true });

const chunkSize = 4;
for (let i = 0; i < parts.length; i += chunkSize) {
  const chunk = parts.slice(i, i + chunkSize).join("\n\n");
  const idx = Math.floor(i / chunkSize) + 1;
  fs.writeFileSync(path.join(outDir, `part-${idx}.sql`), chunk);
  fs.writeFileSync(
    path.join(outDir, `part-${idx}.json`),
    JSON.stringify({ query: chunk }),
  );
}

console.log(`Wrote ${Math.ceil(parts.length / chunkSize)} MCP parts from ${parts.length} statements`);
