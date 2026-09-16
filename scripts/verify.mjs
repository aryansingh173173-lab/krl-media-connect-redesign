import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (name) => fs.readFileSync(path.join(root, name), "utf8");
const html = read("index.html");
const app = read("app.js");
const ctx = vm.createContext({});
vm.runInContext(
  read("content.js") +
    "\n" +
    read("archive.js") +
    "\n" +
    read("editorial.js") +
    "\n" +
    app.split("// Copy is kept separate")[0] +
    "\nthis.copy = { en: {...T.en,...EXTRA_COPY.en,...EDITORIAL_COPY.en}, bn: {...T.bn,...EXTRA_COPY.bn,...EDITORIAL_COPY.bn} }; this.archive = ARCHIVE;",
  ctx,
);
const keys = [...html.matchAll(/data-(?:i18n|caption)="([^"]+)"/g)].map(
  (match) => match[1],
);
for (let i = 1; i <= 11; i++) keys.push("p" + i, "p" + i + "t");
for (const key of keys)
  for (const language of ["en", "bn"])
    assert.ok(
      ctx.copy[language][key],
      `Missing ${language} translation: ${key}`,
    );
assert.deepEqual(
  Object.keys(ctx.copy.en).sort(),
  Object.keys(ctx.copy.bn).sort(),
  "Language keys differ",
);
const refs = [
  ...html.matchAll(/(?:src|href|data-src|data-image)="([^"]+)"/g),
].map((match) => match[1]);
refs.push(...ctx.archive.map((item) => item.src));
for (let i = 1; i <= 7; i++) refs.push(`video/clip-${i}.mp4`);
for (const ref of refs) {
  if (/^(https?:|tel:|mailto:|#)/.test(ref)) continue;
  assert.ok(
    fs.existsSync(path.join(root, ref.split("?")[0])),
    `Missing asset: ${ref}`,
  );
}
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]);
assert.equal(new Set(ids).size, ids.length, "Duplicate HTML IDs");
for (const match of html.matchAll(/href="#([^"]+)"/g))
  assert.ok(ids.includes(match[1]), `Broken anchor: ${match[1]}`);
assert.ok(
  !/<video[^>]*\bcontrols\b/.test(html),
  "Unexpected native video player",
);
assert.ok(!/<iframe/.test(html), "Unexpected embedded player");
assert.equal(
  new Set(ctx.archive.map((item) => item.src)).size,
  ctx.archive.length,
  "Duplicate archive paths",
);
for (const item of ctx.archive)
  assert.ok(item.en && item.bn, `Missing archive caption: ${item.src}`);
// Guard the exact naming protocol and the complete approved committee roster.
const canonicalName = "MahAcharya Shri. sourabh J. sarkar";
for (const file of ["index.html", "content.js", "editorial.js", "archive.js", "app.js"]) {
  const text = read(file).replaceAll(canonicalName, "");
  assert.ok(!/MahAcharya|sourabh|Sourabh|মহাচার্য|সৌরভ/.test(text), `Non-canonical name in ${file}`);
}
const committee = ["Shri Ram Badrinathan", "Smt. Reena J. Sarkar", "Shri Akhilesh Kumar Singh", "Shri Rajiv Roy", "Shri Amit Bansal", "Dr. Swapan Chakravarty", "Shri Kalyan Mukherjee (Retd. IPS)", "Shri Apurba Bera", "Shri Kalyan Bhattacharya", "Shri Subhashis Ghosh"];
committee.forEach((name, index) => assert.equal(ctx.copy.en[`committee${index + 1}`], name));
assert.ok(html.includes('id="minister"'), "Ministerial feature missing");
assert.equal(ctx.copy.en.ministerQuote1, "“Farmers are the critical foundation of Bengal’s economic strength.”");
console.log(
  `Verified ${new Set(keys).size} bilingual content keys, ${new Set(refs).size} references, ${ctx.archive.length} archive records, and all section links.`,
);
