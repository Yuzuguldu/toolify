import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert Video Online Free – MP4, AVI, MOV | Get Toolify",
  description:
    "Convert video files between MP4, AVI, and MOV formats online for free. Fast, private, no upload required. Processed entirely in your browser.",
  keywords: [
    "convert video online free",
    "mp4 to avi",
    "mp4 to mov",
    "avi to mp4",
    "mov to mp4",
    "video format converter",
    "online video converter",
    "free video converter",
  ],
  alternates: {
    canonical: "https://gettoolify.app/convert-video",
  },
  openGraph: {
    title: "Convert Video Online Free – MP4, AVI, MOV | Get Toolify",
    description: "Convert between MP4, AVI, and MOV formats instantly in your browser. No upload, no signup, 100% free.",
    url: "https://gettoolify.app/convert-video",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}