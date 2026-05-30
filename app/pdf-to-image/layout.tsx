import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF to Image Converter Free – Convert PDF to JPG, PNG | Get Toolify",
  description:
    "Convert PDF pages to JPG or PNG images online for free. Choose quality, preview all pages, and download as ZIP. No upload required — processed in your browser.",
  keywords: [
    "pdf to image online free",
    "pdf to jpg converter",
    "pdf to png converter",
    "convert pdf to image",
    "pdf page to image",
    "pdf screenshot online",
    "pdf to jpg free",
  ],
  alternates: {
    canonical: "https://gettoolify.app/pdf-to-image",
  },
  openGraph: {
    title: "PDF to Image Converter Free – JPG & PNG | Get Toolify",
    description: "Convert PDF pages to JPG or PNG images instantly. Preview, download individually or as ZIP. No upload, no signup.",
    url: "https://gettoolify.app/pdf-to-image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}