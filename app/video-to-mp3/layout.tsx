import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Video to MP3 Converter – Extract Audio Free Online | Get Toolify",
  description:
    "Convert any video to MP3 online for free. Extract audio from MP4, AVI, MOV, WEBM files instantly. Choose 128k, 192k or 320k quality. No upload required.",
  keywords: [
    "video to mp3",
    "convert video to mp3 online free",
    "extract audio from video",
    "mp4 to mp3",
    "video to audio converter",
    "extract mp3 from video",
    "online audio extractor",
  ],
  alternates: {
    canonical: "https://gettoolify.app/video-to-mp3",
  },
  openGraph: {
    title: "Video to MP3 Converter – Extract Audio Free | Get Toolify",
    description:
      "Extract audio from any video file instantly. Choose quality, preview and download your MP3. 100% free, no upload.",
    url: "https://gettoolify.app/video-to-mp3",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}