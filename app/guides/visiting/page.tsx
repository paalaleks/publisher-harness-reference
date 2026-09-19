import { HarbourImage, PublicationPage } from "../../components/publication";
import { pageMetadata, publications } from "../../publications";

export const metadata = pageMetadata(publications.visiting);

export default function Visiting() {
  return <PublicationPage publication={publications.visiting}>
    <p>The reading room is at 8 East Quay in our fictional harbour neighbourhood.</p>
    <h2>Opening hours</h2>
    <ul><li>Tuesday and Thursday: 10:00 to 17:00.</li><li>Saturday: 10:00 to 14:00.</li><li>Closed on other days.</li></ul>
    <h2>Access</h2><p>The quay entrance has step-free access. A quiet table and an accessible toilet are on the ground floor. Assistance dogs are welcome.</p>
    <HarbourImage />
  </PublicationPage>;
}
