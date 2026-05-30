import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Merge PDF Files Online Free – Combine PDFs | Get Toolify",
  description:
    "Merge multiple PDF files into one online for free. Drag to reorder pages, combine PDFs instantly in your browser. No upload, no signup required.",
  keywords: [
    "merge pdf online free",
    "combine pdf files",
    "join pdf files",
    "merge pdf documents",
    "pdf merger online",
    "combine multiple pdfs",
    "pdf joiner free",
  ],
  alternates: {
    canonical: "https://gettoolify.app/merge-pdf",
  },
  openGraph: {
    title: "Merge PDF Files Online Free | Get Toolify",
    description: "Combine multiple PDF files into one instantly in your browser. Reorder pages, merge PDFs. No upload, no signup.",
    url: "https://gettoolify.app/merge-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}