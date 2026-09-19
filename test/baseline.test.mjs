import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const cli = join(site, "scripts/baseline.mjs");
const visiting = "guides/visiting/index.html";
function run(command, output = join(site, "out")) {
  return spawnSync(process.execPath, [cli, command, "--output", output], { encoding: "utf8" });
}
function changedBuild(t, mutate) {
  const output = mkdtempSync(join(tmpdir(), "reference-site-test-"));
  t.after(() => {
    assert(resolve(output).startsWith(`${resolve(tmpdir())}${sep}reference-site-test-`));
    rmSync(output, { recursive: true, force: true });
  });
  cpSync(join(site, "out"), output, { recursive: true });
  mutate(output);
  const result = run("verify", output);
  assert.equal(result.status, 1, result.stdout + result.stderr);
  assert.match(result.stderr, /Rendered routes, content, typed metadata, links, conversion blockers, or media differ/);
}

test("the actual Next.js export preserves the recorded publication baseline", () => {
  const result = run("verify");
  assert.equal(result.status, 0, result.stdout + result.stderr);
});

test("the interactive publication requires manual conversion and remains rendered", () => {
  const result = run("conversion-check");
  assert.equal(result.status, 2, result.stderr);
  const [blocked, ...others] = JSON.parse(result.stdout);
  assert.equal(others.length, 0);
  assert.equal(blocked.publicationId, "ref-guide-002");
  assert.equal(blocked.url, "/guides/seed-calculator/");
  assert.deepEqual(blocked.reasons, ["interactive-seed-estimate"]);
  assert.match(readFileSync(join(site, "out/guides/seed-calculator/index.html"), "utf8"), /60<!-- --> seeds|60 seeds/);
});

test("comparison refuses changed visible publication content", (t) => changedBuild(t, (output) => {
  const path = join(output, visiting);
  const html = readFileSync(path, "utf8");
  assert(html.includes("Assistance dogs are welcome."));
  writeFileSync(path, html.replaceAll("Assistance dogs are welcome.", "Assistance dogs are not allowed."));
}));

test("comparison refuses loss of an existing publication URL", (t) => changedBuild(t, (output) => {
  rmSync(join(output, visiting));
}));

test("comparison refuses changed typed metadata", (t) => changedBuild(t, (output) => {
  const path = join(output, visiting);
  const html = readFileSync(path, "utf8");
  assert(html.includes("&quot;order&quot;:1"));
  writeFileSync(path, html.replace("&quot;order&quot;:1", "&quot;order&quot;:7"));
}));

test("comparison refuses media replacement at the same public URL", (t) => changedBuild(t, (output) => {
  writeFileSync(join(output, "media/harbour.png"), Buffer.from("changed bytes"));
}));
