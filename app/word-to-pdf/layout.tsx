import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word to PDF Converter Free Online – Convert DOCX to PDF | Get Toolify",
  description:
    "Convert Word documents to PDF online for free. Upload DOCX or DOC files and download as PDF instantly. No upload to servers — processed in your browser.",
  keywords: [
    "word to pdf",
    "convert word to pdf online free",
    "docx to pdf",
    "doc to pdf converter",
    "word document to pdf",
    "free word to pdf",
    "convert docx to pdf online",
  ],
  alternates: {
    canonical: "https://gettoolify.app/word-to-pdf",
  },
  openGraph: {
    title: "Word to PDF Converter Free Online | Get Toolify",
    description: "Convert Word DOCX files to PDF instantly in your browser. No upload, no signup, 100% free.",
    url: "https://gettoolify.app/word-to-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}