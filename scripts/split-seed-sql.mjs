import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(__dirname, "..", "supabase", "seed-arabic-kelly.sql"), "utf8");
const parts = src.split(/(?=INSERT INTO)/).filter((p) => p.trim());
const outDir = join(__dirname, "..", "supabase", "seed-chunks");
mkdirSync(outDir, { recursive: true });
parts.forEach((part, i) => {
  writeFileSync(join(outDir, `kelly-${i + 1}.sql`), part.trim() + "\n", "utf8");
});
console.log(`Split into ${parts.length} chunks in supabase/seed-chunks/`);
