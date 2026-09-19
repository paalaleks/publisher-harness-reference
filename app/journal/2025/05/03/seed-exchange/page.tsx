import { PublicationDocument, PublicationPage } from "../../../../../components/publication";
import { pageMetadata, publications } from "../../../../../publications";

import documents from "../../../../../publication-documents.json";

export const metadata = pageMetadata(publications.seedExchange);

export default function SeedExchange() {
  return <PublicationPage publication={publications.seedExchange}>
    <PublicationDocument body={documents["ref-article-002"].body} />
  </PublicationPage>;
}
