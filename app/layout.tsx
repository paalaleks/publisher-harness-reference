import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "./style.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://reference.example"),
  title: { default: "Harbour Notes", template: "%s | Harbour Notes" },
  description: "Stories and useful notes from a fictional coastal neighbourhood.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>
    <a className="skip-link" href="#content">Skip to content</a>
    <header className="site-header">
      <Link className="wordmark" href="/">Harbour Notes<span>From the east quay</span></Link>
      <nav aria-label="Main navigation"><Link href="/#journal">Journal</Link><Link href="/#guides">Guides</Link></nav>
    </header>
    <main id="content">{children}</main>
    <footer>Harbour Notes is a fictional publication used as a Reference Site. No Client material is included.</footer>
  </body></html>;
}
