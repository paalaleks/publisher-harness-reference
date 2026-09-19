import Image from "next/image";
import type { ReactNode } from "react";
import type { Publication } from "../publications";

export function PublicationPage({ publication, children }: {
  publication: Publication;
  children: ReactNode;
}) {
  return (
    <article data-publication-id={publication.id} data-publication-fields={JSON.stringify(publication)}>
      <header>
        <p className="eyebrow">{publication.collection === "articles" ? "From the journal" : "A practical guide"}</p>
        <h1>{publication.title}</h1>
        <p className="standfirst">{publication.description}</p>
        <p className="byline">{publication.author} · {publication.collection === "articles"
          ? <time dateTime={publication.publishedOn}>{publication.publishedOn}</time>
          : <>Reviewed <time dateTime={publication.reviewedOn}>{publication.reviewedOn}</time></>}</p>
      </header>
      <div data-publication-body="">{children}</div>
    </article>
  );
}

export function HarbourImage() {
  return <figure>
    <Image src="/media/harbour.png" width={720} height={360} alt="An illustrated harbour with a red reading room beside the water" />
    <figcaption>East quay, Harbour Notes. Original fixture illustration, CC0.</figcaption>
  </figure>;
}

export function GardenImage() {
  return <figure>
    <Image src="/media/garden.png" width={720} height={360} alt="An illustrated garden with three planted beds" />
    <figcaption>The shared garden. Original fixture illustration, CC0.</figcaption>
  </figure>;
}
