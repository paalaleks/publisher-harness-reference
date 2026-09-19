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

// Plain Markdown policy v1: paragraphs, h2, lists, local links, approved figures, attributed quotations.
// Unsupported syntax fails the build; publication text is never interpreted as HTML or code.
export function PublicationDocument({ body }: { body: string }) {
  if (body.length > 65536 || /[<`{}]/.test(body)) throw new Error("Unsupported Publication Document");
  function inline(value: string): ReactNode[] {
    return value.split(/(\[[^\]]+\]\(\/[^\s)]*\))/g).map((part, i) => {
      const link = part.match(/^\[([^\]]+)\]\((\/[^\s)]*)\)$/);
      if (link) {
        const href = link[2];
        if (!href || href.startsWith("//") || href.includes("\\")) throw new Error("Unsafe publication link");
        return <a key={i} href={href}>{link[1]}</a>;
      }
      if (/[\[\]*_!#<>]/.test(part)) throw new Error("Unsupported inline Markdown");
      return part;
    });
  }
  return body.split(/\n\s*\n/).map((block, i) => {
    if (block === "![harbour](/media/harbour.png)") return <HarbourImage key={i} />;
    if (block === "![garden](/media/garden.png)") return <GardenImage key={i} />;
    if (block.startsWith("## ")) return <h2 key={i}>{inline(block.slice(3))}</h2>;
    if (block.startsWith("- ")) {
      const lines = block.split("\n");
      if (lines.some(line => !line.startsWith("- "))) throw new Error("Unsupported list");
      return <ul key={i}>{lines.map((line, j) => <li key={j}>{inline(line.slice(2))}</li>)}</ul>;
    }
    if (block.startsWith("> ")) {
      const quote = block.match(/^> ([^\n]+)\n>\n> ([^\n]+)$/);
      if (!quote) throw new Error("Unsupported quotation");
      return <blockquote key={i}><p>{inline(quote[1] ?? "")}</p><cite>{inline(quote[2] ?? "")}</cite></blockquote>;
    }
    if (block.includes("\n")) throw new Error("Unsupported paragraph");
    return <p key={i}>{inline(block)}</p>;
  });
}
