import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compress Video Online Free – Reduce Video File Size | Get Toolify",
  description:
    "Compress MP4, AVI, MOV, and WEBM videos online for free. Reduce video file size without losing quality. No upload required — processed 100% in your browser.",
  keywords: [
    "compress video online",
    "reduce video file size",
    "compress mp4 online free",
    "video compressor",
    "shrink video file",
    "compress video without losing quality",
  ],
  alternates: {
    canonical: "https://gettoolify.app/compress-video",
  },
  openGraph: {
    title: "Compress Video Online Free | Get Toolify",
    description:
      "Reduce video file size instantly in your browser. No uploads, no signup, 100% free.",
    url: "https://gettoolify.app/compress-video",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}