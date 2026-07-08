import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const all = fs.readFileSync(path.join(root, "supabase/seed-all.sql"), "utf8");
const statements = all
  .split(/\n\n(?=INSERT INTO)/)
  .map((s) => s.trim())
  .filter(Boolean);

const outDir = path.join(root, "supabase/seed-remaining");
fs.mkdirSync(outDir, { recursive: true });

// kelly-2 and kelly-3 already applied (indices 0,1 in sorted seed-all)
const pending = statements.slice(2);
pending.forEach((sql, i) => {
  fs.writeFileSync(path.join(outDir, `stmt-${i + 1}.sql`), sql);
});

console.log(`Pending ${pending.length} statements in ${outDir}`);
