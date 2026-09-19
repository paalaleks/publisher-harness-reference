import type { Metadata } from "next";

type CommonFields = {
  id: string;
  url: string;
  title: string;
  description: string;
  author: string;
  featured: boolean;
  tags: string[];
};

export type Publication = CommonFields & (
  | { collection: "articles"; publishedOn: string; readingMinutes: number }
  | { collection: "guides"; reviewedOn: string; order: number }
);

export const publications = {
  reopening: {
    id: "ref-article-001", url: "/journal/2025/04/12/harbour-reopens/",
    title: "The harbour reading room reopens",
    description: "A new chapter for the reading room on the east quay.",
    author: "Mara Holm", featured: true, tags: ["harbour", "community"],
    collection: "articles", publishedOn: "2025-04-12", readingMinutes: 2,
  },
  seedExchange: {
    id: "ref-article-002", url: "/journal/2025/05/03/seed-exchange/",
    title: "Seeds for the next season",
    description: "Neighbours share seeds and the stories behind them.",
    author: "Jon Bell", featured: false, tags: ["garden", "community"],
    collection: "articles", publishedOn: "2025-05-03", readingMinutes: 3,
  },
  visiting: {
    id: "ref-guide-001", url: "/guides/visiting/",
    title: "Plan your visit", description: "Opening hours and access to the reading room.",
    author: "Harbour Notes", featured: true, tags: ["access"],
    collection: "guides", reviewedOn: "2025-05-01", order: 1,
  },
  calculator: {
    id: "ref-guide-002", url: "/guides/seed-calculator/",
    title: "How many seeds do you need?", description: "An interactive seed estimate for a garden bed.",
    author: "Jon Bell", featured: false, tags: ["garden", "interactive"],
    collection: "guides", reviewedOn: "2025-05-03", order: 2,
  },
} satisfies Record<string, Publication>;

export function pageMetadata(publication: Publication): Metadata {
  return {
    title: publication.title,
    description: publication.description,
    alternates: { canonical: publication.url },
  };
}
