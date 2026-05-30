import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Remove Background from Image Free – AI Powered | Get Toolify",
  description:
    "Remove image background automatically with AI. Free online background remover — no upload, no signup. Get transparent, white or black background instantly.",
  keywords: [
    "remove background from image",
    "background remover free",
    "remove image background online",
    "transparent background maker",
    "ai background remover",
    "remove background free",
    "photo background remover",
    "cut out background online",
  ],
  alternates: {
    canonical: "https://gettoolify.app/remove-background",
  },
  openGraph: {
    title: "Remove Background from Image Free – AI Powered | Get Toolify",
    description: "Automatically remove image backgrounds with AI. Choose transparent, white, or black background. 100% free, no upload.",
    url: "https://gettoolify.app/remove-background",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}