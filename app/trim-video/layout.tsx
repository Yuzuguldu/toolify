import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trim Video Online Free – Cut & Remove Sections | Get Toolify",
  description:
    "Trim video online for free. Cut the start/end or remove any middle section from your video. No upload required — processed instantly in your browser.",
  keywords: [
    "trim video online free",
    "cut video online",
    "video trimmer",
    "remove part of video",
    "cut video clip",
    "video cutter online",
    "trim mp4 online",
    "cut middle of video",
  ],
  alternates: {
    canonical: "https://gettoolify.app/trim-video",
  },
  openGraph: {
    title: "Trim Video Online Free – Cut & Remove Sections | Get Toolify",
    description: "Trim or cut any section from your video instantly in your browser. No upload, no signup, 100% free.",
    url: "https://gettoolify.app/trim-video",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}