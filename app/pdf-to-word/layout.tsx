import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Word Converter Free Online – Convert PDF to DOCX | Get Toolify",
  description:
    "Convert PDF to Word documents online for free. Extract text from PDF and download as DOCX instantly. No upload required — processed in your browser.",
  keywords: [
    "pdf to word",
    "convert pdf to word online free",
    "pdf to docx",
    "pdf to word converter",
    "extract text from pdf",
    "pdf converter online",
    "free pdf to word",
  ],
  alternates: {
    canonical: "https://gettoolify.app/pdf-to-word",
  },
  openGraph: {
    title: "PDF to Word Converter Free Online | Get Toolify",
    description: "Convert PDF to Word documents instantly in your browser. Extract text and download as DOCX. No upload, no signup.",
    url: "https://gettoolify.app/pdf-to-word",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}