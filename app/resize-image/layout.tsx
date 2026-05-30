import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resize Image Online Free – Change Image Dimensions | Get Toolify",
  description:
    "Resize images online for free. Change image dimensions to any custom size or use presets for HD, Instagram, Twitter and more. No upload required.",
  keywords: [
    "resize image online free",
    "change image size",
    "image resizer",
    "resize photo online",
    "reduce image dimensions",
    "resize jpg online",
    "resize image for instagram",
    "resize image for twitter",
  ],
  alternates: {
    canonical: "https://gettoolify.app/resize-image",
  },
  openGraph: {
    title: "Resize Image Online Free | Get Toolify",
    description: "Change image dimensions instantly in your browser. Custom size or presets for HD, Instagram, Twitter. No upload, no signup.",
    url: "https://gettoolify.app/resize-image",
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}