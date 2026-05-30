import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Split PDF Online Free – Extract & Separate PDF Pages | Get Toolify",
  description:
    "Split PDF files online for free. Extract specific pages, split by page range, or separate every page. No upload required — processed instantly in your browser.",
  keywords: [
    "split pdf online free",
    "split pdf pages",
    "extract pages from pdf",
    "separate pdf pages",
    "pdf splitter online",
    "divide pdf file",
    "pdf page extractor",
  ],
  alternates: {
    canonical: "https://gettoolify.app/split-pdf",
  },
  openGraph: {
    title: "Split PDF Online Free – Extract Pages | Get Toolify",
    description: "Split PDF by page range, extract specific pages, or separate every page. Free, no upload, instant results.",
    url: "https://gettoolify.app/split-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}