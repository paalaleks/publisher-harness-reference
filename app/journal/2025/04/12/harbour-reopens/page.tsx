import Link from "next/link";
import { HarbourImage, PublicationPage } from "../../../../../components/publication";
import { pageMetadata, publications } from "../../../../../publications";

export const metadata = pageMetadata(publications.reopening);

export default function Reopening() {
  return <PublicationPage publication={publications.reopening}>
    <HarbourImage />
    <p>The reading room on the east quay opened its doors again on 12 April 2025. Volunteers repaired the shelves and brought the long oak table back into use.</p>
    <h2>A room for everyone</h2>
    <p>There is no membership fee. Bring a book, borrow one from the shelf, or sit beside the window with a cup of tea.</p>
    <blockquote><p>We wanted a quiet place that still belongs to everyone.</p><cite>Mara Holm, volunteer</cite></blockquote>
    <p>Find opening hours in our <Link href="/guides/visiting/">guide to visiting</Link>.</p>
  </PublicationPage>;
}
