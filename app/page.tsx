import Link from "next/link";
import { HarbourImage } from "./components/publication";
import { publications } from "./publications";

export default function Home() {
  return <>
    <p className="eyebrow">Life by the water</p>
    <h1>A place to read.<br />A place to grow.</h1>
    <p className="standfirst">Stories from our neighbourhood, and useful notes for your next visit.</p>
    <HarbourImage />
    <section id="journal"><h2>The journal</h2><ul className="publications">
      {[publications.reopening, publications.seedExchange].map((publication) => <li key={publication.id}>
        <time dateTime={publication.publishedOn}>{publication.publishedOn}</time>
        <h3><Link href={publication.url}>{publication.title}</Link></h3><p>{publication.description}</p>
      </li>)}
    </ul></section>
    <section id="guides"><h2>Useful notes</h2><ul className="publications">
      {[publications.visiting, publications.calculator].map((publication) => <li key={publication.id}>
        <h3><Link href={publication.url}>{publication.title}</Link></h3><p>{publication.description}</p>
      </li>)}
    </ul></section>
  </>;
}
