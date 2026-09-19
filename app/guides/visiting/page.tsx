import { PublicationDocument, PublicationPage } from "../../components/publication";
import { pageMetadata, publications } from "../../publications";

import documents from "../../publication-documents.json";

export const metadata = pageMetadata(publications.visiting);

export default function Visiting() {
  return <PublicationPage publication={publications.visiting}>
    <PublicationDocument body={documents["ref-guide-001"].body} />
  </PublicationPage>;
}
