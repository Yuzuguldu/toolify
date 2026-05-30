import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress PDF Online Free – Reduce PDF File Size | Get Toolify",
  description:
    "Compress PDF files online for free. Reduce PDF file size without losing quality. No upload required — processed instantly in your browser. Fast and private.",
  keywords: [
    "compress pdf online free",
    "reduce pdf file size",
    "pdf compressor online",
    "shrink pdf file",
    "compress pdf without losing quality",
    "make pdf smaller",
    "pdf size reducer",
  ],
  alternates: {
    canonical: "https://gettoolify.app/compress-pdf",
  },
  openGraph: {
    title: "Compress PDF Online Free | Get Toolify",
    description: "Reduce PDF file size instantly in your browser. No upload, no signup, 100% free and private.",
    url: "https://gettoolify.app/compress-pdf",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}