import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video to GIF Converter – Free Online | Get Toolify",
  description:
    "Convert any video to GIF online for free. Choose FPS, width, and create high-quality animated GIFs instantly in your browser. No upload, no signup.",
  keywords: [
    "video to gif",
    "convert video to gif online free",
    "mp4 to gif",
    "make gif from video",
    "animated gif maker",
    "video to animated gif",
    "free gif converter",
  ],
  alternates: {
    canonical: "https://gettoolify.app/video-to-gif",
  },
  openGraph: {
    title: "Video to GIF Converter – Free Online | Get Toolify",
    description: "Turn any video clip into a high-quality animated GIF. Customize FPS and size. 100% free, no upload.",
    url: "https://gettoolify.app/video-to-gif",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}