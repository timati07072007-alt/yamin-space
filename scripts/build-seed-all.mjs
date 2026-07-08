import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const chunksDir = path.join(root, "supabase/seed-chunks");
const wordsFile = path.join(root, "supabase/seed-arabic-words.sql");

const files = fs
  .readdirSync(chunksDir)
  .filter((f) => /^kelly-(?!1\.sql)/.test(f) && f.endsWith(".sql"))
  .sort((a, b) => {
    const na = Number(a.match(/\d+/)?.[0] ?? 0);
    const nb = Number(b.match(/\d+/)?.[0] ?? 0);
    return na - nb;
  });

const statements = [
  ...files.map((f) => fs.readFileSync(path.join(chunksDir, f), "utf8").trim()),
  ...[...fs.readFileSync(wordsFile, "utf8").matchAll(/INSERT INTO[\s\S]*?ON CONFLICT[\s\S]*?;/g)].map(
    (m) => m[0].trim(),
  ),
];

const out = path.join(root, "supabase/seed-all.sql");
fs.writeFileSync(out, statements.join("\n\n"));
console.log(`Wrote ${statements.length} statements to ${out}`);
