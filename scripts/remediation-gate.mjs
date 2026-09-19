import { readFileSync, writeFileSync } from 'node:fs';

// The trusted build host materializes this accepted read-model snapshot before isolation.
// No database credentials enter the repository process, and absent data never falls back to Git.
const snapshot = JSON.parse(readFileSync('.publication-read-model.json', 'utf8'));
const aliases = { 'ref-article-001': 'reopening', 'ref-article-002': 'seedExchange', 'ref-guide-001': 'visiting', 'ref-guide-002': 'calculator' };
if (snapshot.formatVersion !== 1 || !Array.isArray(snapshot.publications) || snapshot.publications.length !== 4)
  throw new Error('Complete publication snapshot required.');
const metadata = {}, documents = {};
for (const publication of snapshot.publications) {
  const id = publication.metadata?.id;
  if (!Object.hasOwn(aliases, id) || Object.hasOwn(documents, id) || publication.state !== 'converted'
    || publication.document?.formatVersion !== 1 || typeof publication.document.body !== 'string')
    throw new Error('Invalid publication snapshot.');
  metadata[aliases[id]] = publication.metadata;
  documents[id] = publication.document;
}
writeFileSync('app/publication-data.ts', 'import type { Publication } from "./publications";\nexport const publications = '
  + JSON.stringify(metadata, null, 2) + ' satisfies Record<string, Publication>;\n');
writeFileSync('app/publication-documents.json', JSON.stringify(documents, null, 2) + '\n');
