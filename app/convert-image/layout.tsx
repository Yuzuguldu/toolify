import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Convert Image Online Free – JPG, PNG, WEBP, GIF | Get Toolify",
  description:
    "Convert images between JPG, PNG, WEBP and GIF formats online for free. No upload required — processed instantly in your browser. Fast, private, free.",
  keywords: [
    "convert image online free",
    "jpg to png",
    "png to jpg",
    "webp to jpg",
    "jpg to webp",
    "image format converter",
    "convert png to webp",
    "image converter online",
  ],
  alternates: {
    canonical: "https://gettoolify.app/convert-image",
  },
  openGraph: {
    title: "Convert Image Online Free – JPG, PNG, WEBP, GIF | Get Toolify",
    description: "Convert between JPG, PNG, WEBP and GIF formats instantly in your browser. No upload, no signup, 100% free.",
    url: "https://gettoolify.app/convert-image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}