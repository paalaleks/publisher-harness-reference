import { PublicationDocument, PublicationPage } from "../../../../../components/publication";
import { pageMetadata, publications } from "../../../../../publications";

import documents from "../../../../../publication-documents.json";

export const metadata = pageMetadata(publications.reopening);

export default function Reopening() {
  return <PublicationPage publication={publications.reopening}>
    <PublicationDocument body={documents["ref-article-001"].body} />
  </PublicationPage>;
}
