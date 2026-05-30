import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Text to PDF Converter Free Online – Convert Text to PDF | Get Toolify",
  description:
    "Convert any text to PDF online for free. Type or paste text, choose font size and page size, and download a clean PDF instantly. No upload, no signup required.",
  keywords: [
    "text to pdf online free",
    "convert text to pdf",
    "txt to pdf converter",
    "create pdf from text",
    "plain text to pdf",
    "text to pdf maker",
    "online pdf creator",
  ],
  alternates: {
    canonical: "https://gettoolify.app/text-to-pdf",
  },
  openGraph: {
    title: "Text to PDF Converter Free Online | Get Toolify",
    description: "Type or paste any text and convert to a clean PDF instantly. Choose font size and page size. No upload, no signup.",
    url: "https://gettoolify.app/text-to-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}