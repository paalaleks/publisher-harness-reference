import { PublicationDocument, PublicationPage } from "../../components/publication";
import { SeedCalculator } from "../../components/seed-calculator";
import { pageMetadata, publications } from "../../publications";

import documents from "../../publication-documents.json";

export const metadata = pageMetadata(publications.calculator);

export default function CalculatorGuide() {
  return <PublicationPage publication={publications.calculator}>
    <PublicationDocument body={documents["ref-guide-002"].body.split("\n\n")[0] ?? ""} />
    <SeedCalculator />
    <PublicationDocument body={documents["ref-guide-002"].body.split("\n\n").slice(1).join("\n\n")} />
  </PublicationPage>;
}
