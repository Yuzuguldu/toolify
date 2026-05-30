import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://gettoolify.app";

  const tools = [
    { url: "/compress-video", priority: 1.0 },
    { url: "/video-to-mp3", priority: 1.0 },
    { url: "/video-to-gif", priority: 0.9 },
    { url: "/convert-video", priority: 0.9 },
    { url: "/trim-video", priority: 0.9 },
    { url: "/compress-image", priority: 1.0 },
    { url: "/resize-image", priority: 0.9 },
    { url: "/convert-image", priority: 0.9 },
    { url: "/remove-background", priority: 0.9 },
    { url: "/pdf-to-word", priority: 1.0 },
    { url: "/merge-pdf", priority: 0.9 },
    { url: "/split-pdf", priority: 0.9 },
    { url: "/compress-pdf", priority: 0.9 },
    { url: "/pdf-to-image", priority: 0.9 },
    { url: "/word-to-pdf", priority: 0.9 },
    { url: "/text-to-pdf", priority: 0.8 },
  ];

  const pages = [
    { url: "/", priority: 1.0 },
    { url: "/about", priority: 0.7 },
    { url: "/contact", priority: 0.6 },
    { url: "/privacy", priority: 0.5 },
    { url: "/terms", priority: 0.5 },
  ];

  const allPages = [...pages, ...tools].map((page) => ({
    url: `${baseUrl}${page.url}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: page.priority,
  }));

  return allPages;
}