import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const dir = path.join(root, "supabase/seed-chunks");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.startsWith("kelly-") && f !== "kelly-1.sql")
  .sort();

for (const file of files) {
  const name = file.replace(".sql", "");
  const sql = fs.readFileSync(path.join(dir, file), "utf8");
  fs.writeFileSync(
    path.join(root, "supabase", `.seed-${name}.json`),
    JSON.stringify({ query: sql }),
  );
}

const words = fs.readFileSync(
  path.join(root, "supabase/seed-arabic-words.sql"),
  "utf8",
);
const batches = [...words.matchAll(/INSERT INTO[\s\S]*?ON CONFLICT[\s\S]*?;/g)].map(
  (m) => m[0].trim(),
);

batches.forEach((sql, i) => {
  fs.writeFileSync(
    path.join(root, "supabase", `.seed-batch-${i + 1}.json`),
    JSON.stringify({ query: sql }),
  );
});

console.log(`Prepared ${files.length} kelly chunks and ${batches.length} word batches`);
