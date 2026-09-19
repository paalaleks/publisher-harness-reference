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

import { publications } from "./publication-data";
export { publications };

export function pageMetadata(publication: Publication): Metadata {
  return {
    title: publication.title,
    description: publication.description,
    alternates: { canonical: publication.url },
  };
}
