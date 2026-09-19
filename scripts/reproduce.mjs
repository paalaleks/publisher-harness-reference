import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const repository = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: site, encoding: "utf8" }).trim();
const manifest = JSON.parse(readFileSync(join(site, "baseline/manifest.json"), "utf8"));
assert.equal(process.versions.node, manifest.runtime.node, "Use the pinned Node version");
const npmCli = process.env.npm_execpath;
assert(npmCli, "Run this command through npm run baseline:reproduce");
const npmVersion = execFileSync(process.execPath, [npmCli, "--version"], { encoding: "utf8" }).trim();
assert.equal(npmVersion, manifest.runtime.npm, "Use the pinned npm version");
const temporary = mkdtempSync(join(tmpdir(), "reference-site-reproduction-"));
const cleanSite = join(temporary, manifest.source.directory);

try {
  execFileSync("git", ["archive", "--format=tar", `--output=${join(temporary, "source.tar")}`, manifest.source.revision, manifest.source.directory], { cwd: repository });
  execFileSync("tar", ["-xf", join(temporary, "source.tar"), "-C", temporary]);
  for (const file of manifest.source.files) {
    const checksum = createHash("sha256").update(readFileSync(join(cleanSite, file.path))).digest("hex");
    assert.equal(checksum, file.sha256, `Recorded source checksum differs: ${file.path}`);
  }
  cpSync(join(site, "baseline"), join(cleanSite, "baseline"), { recursive: true });
  const options = { cwd: cleanSite, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1", npm_config_cache: join(temporary, "npm-cache") } };
  for (const args of [["ci"], ["run", "build"], ["run", "typecheck"], ["test"]]) {
    execFileSync(process.execPath, [npmCli, ...args], options);
  }
  console.log(`Clean reproduction passed at ${manifest.source.revision} on ${process.platform}/${process.arch}; fresh dependencies and build, no shared npm cache.`);
} finally {
  assert(resolve(temporary).startsWith(`${resolve(tmpdir())}${sep}reference-site-reproduction-`));
  rmSync(temporary, { recursive: true, force: true });
}
