# Reference Site before Remediation

Harbour Notes is a fictional, standalone Next.js site used to preserve evidence for ticket 01. Its publication bodies are hardcoded JSX. It has no database, Harness dependency, Client material, credentials, or external media requests. This is an evaluation fixture, not a product template.

Use Node **24.15.0** and npm **10.8.2**. From this directory:

```sh
npm ci
npm run build
npm run typecheck
npm test
npm run baseline:reproduce
```

`npm ci` installs the exact lockfile. `npm run build` invokes the actual Next.js renderer with `next build --webpack` and writes static HTML, browser JavaScript, styles, and media to `out/`. No separate Markdown renderer exists. For interactive development, run `npm run dev`. To inspect the built output, serve `out/` with any local static server supporting directory indexes. `next start` does not serve an exported site.

The production-shaped origin is the reserved `https://reference.example`. Local serving changes only the origin. Publication paths and trailing slashes are permanent fixture values; title edits must not derive new paths.

| Stable identity | Collection | Public path |
| --- | --- | --- |
| `ref-article-001` | articles | `/journal/2025/04/12/harbour-reopens/` |
| `ref-article-002` | articles | `/journal/2025/05/03/seed-exchange/` |
| `ref-guide-001` | guides | `/guides/visiting/` |
| `ref-guide-002` | guides | `/guides/seed-calculator/` |

`app/publications.ts` defines typed metadata, including strings, date strings, boolean featured flags, string-array tags, and numeric reading time or ordering. `PublicationPage` places those exact values and the stable identity in the actual rendered article. The home page links both collections. Supplied PNG illustrations live in `public/media/`; their original CC0 artwork can be reproduced with `node scripts/create-media.mjs`.

## Saved baseline

`baseline/manifest.json` records the source Git commit, renderer input checksums, runtime and package versions, complete emitted HTML route inventory, publication identities, typed fields, canonical URLs, normalized rendered body and page text, links, and image URLs, dimensions, alternative text, byte lengths, and SHA-256 checksums. Framework not-found output is included in the inventory and has no publication identity.

`baseline/rendered-output.json.gz` retains **every byte of the original static export**, including HTML, CSS, hydration scripts, RSC data, and PNGs. It is a gzip-compressed JSON object mapping relative output paths to base64 bytes. The manifest records both the archive checksum and each file checksum. This permits inspecting or serving the original output after the source has been remediated.

`npm run baseline:verify` compares `out/` with the saved projection and validates the retained archive checksums. For a later candidate, use `npm run baseline:verify -- --output <candidate-export-directory>`. Verification never overwrites the baseline. Text comparison normalizes whitespace and excludes script, style, template, and HTML-hidden content. It is a deterministic rendered-content check, not a claim of browser pixel equality or arbitrary CSS visibility detection. Exact original HTML and all assets remain in the archive for structural or visual checks. Generated framework chunks are retained but their names and bytes are not required to remain equal across rebuilt environments or Remediation.

`npm run baseline:reproduce` extracts the **recorded source commit** into a new OS temporary directory using Git and tar, installs from its lockfile with a new npm cache, builds, typechecks, and runs the full fixture test suite against the saved baseline. It shares neither `node_modules`, `.next`, nor `out` with this checkout. The temporary directory is removed afterwards. Git, tar, network access to the npm registry, and the pinned runtime are required. This proves a fresh local build on the current OS; it does not claim a container security boundary or Railway deployment proof.

The initial baseline is created with `npm run baseline:capture` after committing the fixture source. Capture performs a fresh Next.js build, refuses uncommitted renderer inputs, and refuses to replace an existing baseline. The source commit is separate from the evidence commit to avoid a self-referential source hash. Keep this baseline when implementing later tickets.

## Deliberate conversion failure

`/guides/seed-calculator/` contains a stateful React calculator inside its publication body. Its initial value is 2 square metres and 60 seeds. Changing the area to 4 yields 120 seeds. Plain Markdown cannot preserve this interactive behavior, and executable MDX is outside the publication contract.

```sh
npm run baseline:conversion-check
```

The command reads the actual exported HTML, reports `ref-guide-002` with `requires-manual-conversion` and reason `interactive-seed-estimate`, and exits **2**. This is the fixture's conversion expectation, not a Remediation implementation or persisted application Hold. It succeeds in reproducing the deliberate failure without breaking the site's build or removing the page. Future Remediation must retain this page and establish an agreed site-owned component/content boundary before import cutover. Removing the marker alone is not a correction; the behavior must remain.

The test suite checks the real build, this conversion expectation, and refusal of changed visible content, lost URLs, changed typed metadata, and media replacement. It does not simulate GitHub, database imports, or deployment. Those belong to later tickets.

Version research and the recorded verification results are in [the ticket 01 research note](../../docs/research/reference-site-baseline.md).
