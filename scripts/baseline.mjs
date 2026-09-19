import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync, gunzipSync } from "node:zlib";
import { parse } from "parse5";

const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const baseline = join(site, "baseline");
const manifestPath = join(baseline, "manifest.json");
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const json = (path) => JSON.parse(readFileSync(path, "utf8"));
const attr = (node, name) => node.attrs?.find((item) => item.name === name)?.value;
const walk = (node) => [node, ...(node.childNodes ?? []).flatMap(walk)];
const normalized = (value) => value.replace(/\s+/g, " ").trim();

function text(node) {
  if (["script", "style", "template"].includes(node.tagName) || attr(node, "hidden") !== undefined) return "";
  return node.nodeName === "#text" ? node.value : (node.childNodes ?? []).map(text).join(" ");
}

function files(directory, prefix = "") {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${prefix}${entry.name}`;
    return entry.isDirectory() ? files(join(directory, entry.name), `${path}/`) : [path];
  }).sort();
}

function outputFile(output, url) {
  assert(url.startsWith("/") && !url.startsWith("//"), `Expected local media URL: ${url}`);
  const path = resolve(output, `.${decodeURIComponent(url)}`);
  assert(path.startsWith(`${resolve(output)}${sep}`), `Media escapes output: ${url}`);
  return path;
}

function inspect(output) {
  const routes = files(output).filter((path) => path.endsWith(".html")).map((path) => {
    const html = readFileSync(join(output, path), "utf8");
    const nodes = walk(parse(html));
    const element = (tag) => nodes.find((node) => node.tagName === tag);
    const publication = nodes.find((node) => attr(node, "data-publication-id") !== undefined);
    const fields = publication ? JSON.parse(attr(publication, "data-publication-fields")) : null;
    const url = path === "index.html" ? "/" : `/${path.replace(/index\.html$/, "")}`;
    if (publication) {
      assert.equal(fields.id, attr(publication, "data-publication-id"));
      assert.equal(fields.url, url, `Publication URL differs from rendered route: ${path}`);
      assert(["articles", "guides"].includes(fields.collection));
      assert.equal(typeof fields.featured, "boolean");
      assert(Array.isArray(fields.tags) && fields.tags.every((tag) => typeof tag === "string"));
      assert.equal(typeof (fields.collection === "articles" ? fields.readingMinutes : fields.order), "number");
    }
    return {
      url, file: path,
      title: normalized(text(element("title"))),
      description: attr(nodes.find((node) => node.tagName === "meta" && attr(node, "name") === "description") ?? {}, "content") ?? null,
      canonical: attr(nodes.find((node) => node.tagName === "link" && attr(node, "rel") === "canonical") ?? {}, "href") ?? null,
      visibleText: normalized(text(element("body"))),
      publication: fields,
      bodyText: publication ? normalized(text(walk(publication).find((node) => attr(node, "data-publication-body") !== undefined))) : null,
      links: nodes.filter((node) => node.tagName === "a").map((node) => ({ href: attr(node, "href"), text: normalized(text(node)) })),
      media: nodes.filter((node) => node.tagName === "img").map((node) => {
        const src = attr(node, "src");
        const bytes = readFileSync(outputFile(output, src));
        return { src, alt: attr(node, "alt"), width: Number(attr(node, "width")), height: Number(attr(node, "height")), bytes: bytes.length, sha256: sha256(bytes) };
      }),
      conversionBlockers: nodes.flatMap((node) => {
        const blocker = attr(node, "data-conversion-blocker");
        return blocker ? [blocker] : [];
      }),
    };
  });
  const publications = routes.filter((route) => route.publication);
  assert.equal(new Set(publications.map((route) => route.publication.id)).size, publications.length, "Duplicate publication identity");
  return { routes };
}

function sourceEvidence() {
  const inputs = ["app", "public", "scripts", "test"].flatMap((directory) => files(join(site, directory)).map((path) => `${directory}/${path}`));
  inputs.push("package.json", "package-lock.json", "next.config.ts", "tsconfig.json", ".node-version", ".npmrc", ".gitattributes");
  const root = execFileSync("git", ["rev-parse", "--show-toplevel"], { cwd: site, encoding: "utf8" }).trim();
  const paths = inputs.sort().map((path) => relative(root, join(site, path)).replaceAll("\\", "/"));
  const status = execFileSync("git", ["status", "--porcelain", "--untracked-files=all", "--", ...paths], { cwd: root, encoding: "utf8" });
  assert.equal(status, "", "Commit all fixture source before capturing a baseline");
  const revision = execFileSync("git", ["rev-parse", "HEAD"], { cwd: root, encoding: "utf8" }).trim();
  const directory = relative(root, site).replaceAll("\\", "/");
  return {
    revision, directory,
    files: inputs.sort().map((path) => ({ path, sha256: sha256(execFileSync("git", ["show", `${revision}:${directory}/${path}`], { cwd: root })) })),
  };
}

function build() {
  for (const directory of [".next", "out"]) {
    const target = resolve(site, directory);
    assert(target.startsWith(`${site}${sep}`));
    rmSync(target, { recursive: true, force: true });
  }
  execFileSync(process.execPath, [join(site, "node_modules/next/dist/bin/next"), "build", "--webpack"], {
    cwd: site, stdio: "inherit", env: { ...process.env, NEXT_TELEMETRY_DISABLED: "1" },
  });
}

function readBaseline() {
  const manifest = json(manifestPath);
  const archive = readFileSync(join(baseline, "rendered-output.json.gz"));
  assert.equal(sha256(archive), manifest.artifact.sha256, "Baseline archive checksum mismatch");
  const entries = JSON.parse(gunzipSync(archive).toString("utf8"));
  assert.deepEqual(Object.keys(entries).sort(), manifest.artifact.files.map((entry) => entry.path));
  for (const entry of manifest.artifact.files) {
    assert.equal(sha256(Buffer.from(entries[entry.path], "base64")), entry.sha256, `Archived file changed: ${entry.path}`);
  }
  return manifest;
}

const [command, flag, directory] = process.argv.slice(2);
assert(command === "capture" || command === "verify" || command === "conversion-check", "Use capture, verify, or conversion-check");
assert(flag === undefined || (flag === "--output" && directory && command !== "capture"), "Only verify and conversion-check accept --output <directory>");
const output = directory ? resolve(directory) : join(site, "out");

if (command === "capture") {
  assert(!existsSync(baseline), "Baseline already exists. Preserve it; capture a new revision in a separately reviewed change.");
  const source = sourceEvidence();
  const pkg = json(join(site, "package.json"));
  assert.equal(process.versions.node, pkg.engines.node, "Use the pinned Node runtime");
  build();
  const projection = inspect(output);
  const entries = Object.fromEntries(files(output).map((path) => [path, readFileSync(join(output, path)).toString("base64")]));
  const archive = gzipSync(JSON.stringify(entries), { level: 9 });
  const manifest = {
    formatVersion: 1, siteId: "reference-harbour-notes", source,
    runtime: { node: process.versions.node, npm: pkg.engines.npm, platform: process.platform, architecture: process.arch },
    dependencies: pkg.dependencies, commands: ["npm ci", "npm run build"], projection,
    artifact: { path: "rendered-output.json.gz", encoding: "gzip-json-base64-files", sha256: sha256(archive), files: files(output).map((path) => ({ path, sha256: sha256(readFileSync(join(output, path))) })) },
  };
  mkdirSync(baseline);
  writeFileSync(join(baseline, "rendered-output.json.gz"), archive);
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`Captured ${projection.routes.length} rendered routes at ${source.revision}.`);
} else if (command === "verify") {
  const manifest = readBaseline();
  assert.deepEqual(inspect(output), manifest.projection, "Rendered routes, content, typed metadata, links, conversion blockers, or media differ from the baseline");
  console.log(`Verified ${manifest.projection.routes.length} routes against ${manifest.source.revision}.`);
} else {
  const blocked = inspect(output).routes.filter((route) => route.conversionBlockers.length);
  console.log(JSON.stringify(blocked.map((route) => ({
    publicationId: route.publication.id, url: route.url,
    outcome: "requires-manual-conversion", reasons: route.conversionBlockers,
    correction: "Preserve the interactive estimate in site-owned code and agree its content boundary before importing. Keep the existing page live.",
  })), null, 2));
  process.exitCode = blocked.length ? 2 : 0;
}
