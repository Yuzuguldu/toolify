import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Get Toolify – Free Online File Tools",
    template: "%s | Get Toolify",
  },
  description:
    "Free online tools to compress, convert, and edit videos, images, and PDFs. No uploads, no signup — everything processed in your browser.",
  keywords: [
    "compress video online",
    "compress image online",
    "compress pdf online",
    "video to mp3",
    "pdf to word",
    "merge pdf",
    "split pdf",
    "resize image",
    "remove background",
    "free online tools",
    "convert video online",
    "image converter",
  ],
  authors: [{ name: "Murat Yüzügüldü" }],
  creator: "Murat Yüzügüldü",
  metadataBase: new URL("https://gettoolify.app"),

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://gettoolify.app",
    siteName: "Get Toolify",
    title: "Get Toolify – Free Online File Tools",
    description:
      "Compress, convert, and edit videos, images, and PDFs for free. No uploads, no signup — 100% private.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Get Toolify – Free Online File Tools",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Toolify – Free Online File Tools",
    description:
      "Compress, convert, and edit videos, images, and PDFs for free. No uploads, no signup.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
    lang="en"
    className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
  >
   <head>
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-CRS7C2GPZP"></script>

   <script dangerouslySetInnerHTML={{__html: `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-CRS7C2GPZP');
   `}} />
   <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2708775034200569" crossOrigin="anonymous"></script>
  </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}