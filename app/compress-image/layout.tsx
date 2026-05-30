import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress Image Online Free – JPG, PNG, WEBP | Get Toolify",
  description:
    "Compress JPG, PNG and WEBP images online for free. Reduce image file size without losing quality. No upload required — processed instantly in your browser.",
  keywords: [
    "compress image online free",
    "reduce image file size",
    "compress jpg online",
    "compress png online",
    "image compressor",
    "shrink image file size",
    "optimize image online",
    "compress webp online",
  ],
  alternates: {
    canonical: "https://gettoolify.app/compress-image",
  },
  openGraph: {
    title: "Compress Image Online Free – JPG, PNG, WEBP | Get Toolify",
    description: "Reduce image file size instantly in your browser. No uploads, no signup, 100% free.",
    url: "https://gettoolify.app/compress-image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}