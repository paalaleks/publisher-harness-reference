import Link from "next/link";
import { GardenImage, PublicationPage } from "../../../../../components/publication";
import { pageMetadata, publications } from "../../../../../publications";

export const metadata = pageMetadata(publications.seedExchange);

export default function SeedExchange() {
  return <PublicationPage publication={publications.seedExchange}>
    <GardenImage />
    <p>On 3 May 2025, neighbours brought 18 packets of seeds to the shared garden. Each packet carried the variety, harvest year, and a short note from its grower.</p>
    <h2>What to bring next time</h2>
    <ul><li>Dry seeds in a labelled paper envelope.</li><li>The year you collected them.</li><li>A note about the conditions they grew in.</li></ul>
    <p>Keep a small reserve for gaps in the beds. Our <Link href="/guides/seed-calculator/">seed calculator</Link> includes a 20% reserve.</p>
  </PublicationPage>;
}
