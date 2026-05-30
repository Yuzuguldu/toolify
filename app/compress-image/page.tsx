"use client";

import { useState, useRef, useCallback } from "react";

const faqItems = [
  {
    q: "Does compressing an image reduce its quality?",
    a: "It depends on the format and quality setting. JPG and WEBP use lossy compression — at 80% quality, the difference is barely visible to the human eye while file size drops by 60-80%. PNG uses lossless compression, so there is zero quality loss but less size reduction.",
  },
  {
    q: "What image formats are supported?",
    a: "Toolify supports JPG, PNG, WEBP, and most common image formats. You can also choose the output format — convert to JPG for smallest size, WEBP for best quality-to-size ratio, or PNG for lossless compression.",
  },
  {
    q: "What is the difference between JPG, PNG, and WEBP?",
    a: "JPG is best for photos and produces the smallest files. PNG is lossless and ideal for logos, screenshots, and images with transparency. WEBP is a modern format that offers better compression than both JPG and PNG with excellent quality.",
  },
  {
    q: "Is my image uploaded to your servers?",
    a: "No. Toolify uses the browser's built-in Canvas API to compress images directly on your device. Your files never leave your computer, ensuring complete privacy and instant processing.",
  },
  {
    q: "What quality setting should I use?",
    a: "For most photos shared on social media or websites, 75-80% quality gives excellent results with 60-75% smaller file sizes. Use 90%+ for professional photos where detail matters. Use 60% or lower only when file size is the top priority.",
  },
  {
    q: "Can I compress multiple images at once?",
    a: "Currently, images are processed one at a time. Batch processing is coming soon as a Pro feature. For now, you can quickly process images one after another using the 'New' button after each compression.",
  },
  {
    q: "Why is my PNG file larger after compression?",
    a: "PNG uses lossless compression, so its file size is determined by image complexity, not quality settings. Converting a PNG to JPG or WEBP will give you much smaller files. If you need transparency, keep PNG format but the size reduction will be minimal.",
  },
  {
    q: "What is the maximum file size I can compress?",
    a: "There is no strict limit, but very large images (over 20MP or 50MB) may be slow to process depending on your device. For best performance, we recommend images under 20MB.",
  },
];

export default function CompressImage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(80);
  const [outputFormat, setOutputFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getSavings = () => {
    if (!originalSize || !compressedSize) return 0;
    return Math.round((1 - compressedSize / originalSize) * 100);
  };

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) { alert("Please upload an image file."); return; }
    setFile(f); setOriginalSize(f.size); setOutputUrl(null); setStatus("idle");
    setPreview(URL.createObjectURL(f));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const compress = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise((resolve) => { img.onload = resolve; });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");
      ctx.drawImage(img, 0, 0);
      const mimeType = `image/${outputFormat}`;
      const q = outputFormat === "png" ? 1 : quality / 100;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(), mimeType, q);
      });
      setCompressedSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
      URL.revokeObjectURL(url);
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setPreview(null); setOutputUrl(null);
    setStatus("idle"); setOriginalSize(0); setCompressedSize(0);
  };

  const outputFileName = file ? file.name.replace(/\.[^.]+$/, `.${outputFormat}`) : `compressed.${outputFormat}`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Image Compressor – Toolify",
    "url": "https://gettoolify.app/compress-image",
    "description": "Free online image compressor. Reduce JPG, PNG, and WEBP file sizes instantly in your browser.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqItems.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">GET TOOLIFY</span>
            <span className="text-white/20 text-xs font-mono mt-1">.app</span>
          </a>
          <a href="/" className="text-white/40 text-sm hover:text-white transition-colors">← All Tools</a>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl mx-auto mb-4">🖼️</div>
            <h1 className="text-4xl font-black text-white mb-3">Compress Image Online Free</h1>
            <p className="text-white/40 max-w-md mx-auto">Reduce JPG, PNG and WEBP image file sizes instantly. No uploads — processed 100% in your browser.</p>
          </div>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
                  ${file ? "cursor-default" : "cursor-pointer"}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {!file ? (
                  <>
                    <div className="text-5xl mb-4">🖼️</div>
                    <p className="text-white font-bold text-lg mb-2">Drop your image here</p>
                    <p className="text-white/40 text-sm">or click to browse · JPG, PNG, WEBP supported</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      {preview && <img src={preview} alt="preview" className="w-12 h-12 rounded-xl object-cover" />}
                      <div>
                        <p className="text-white font-bold truncate max-w-xs">{file.name}</p>
                        <p className="text-white/40 text-sm">{formatSize(file.size)}</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="text-white/30 hover:text-white/70 text-sm px-3 py-1 rounded-lg hover:bg-white/5">✕ Remove</button>
                  </div>
                )}
              </div>

              {preview && (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden flex items-center justify-center p-4">
                  <img src={preview} alt="Original" className="max-h-48 rounded-xl object-contain" />
                </div>
              )}

              {file && (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                  <div>
                    <p className="text-white font-bold mb-3">Output Format</p>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { value: "jpeg", label: "JPG", desc: "Smallest size" },
                        { value: "webp", label: "WEBP", desc: "Best quality/size" },
                        { value: "png", label: "PNG", desc: "Lossless" },
                      ] as const).map((f) => (
                        <button key={f.value} onClick={() => setOutputFormat(f.value)}
                          className={`p-4 rounded-xl border text-center transition-all ${outputFormat === f.value ? "border-blue-500 bg-blue-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                          <div className="font-black">{f.label}</div>
                          <div className="text-xs mt-1 opacity-60">{f.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  {outputFormat !== "png" && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-white font-bold">Quality</p>
                        <span className={`text-sm font-black ${quality >= 80 ? "text-green-400" : quality >= 60 ? "text-yellow-400" : "text-orange-400"}`}>
                          {quality >= 80 ? "High" : quality >= 60 ? "Medium" : "Low"} — {quality}%
                        </span>
                      </div>
                      <input type="range" min={10} max={100} step={5} value={quality}
                        onChange={(e) => setQuality(Number(e.target.value))}
                        className="w-full accent-blue-500" />
                      <div className="flex justify-between text-xs text-white/30 mt-1">
                        <span>Smallest file</span><span>Best quality</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {file && (
                <button onClick={compress}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Compress Image →
                </button>
              )}
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Compressing image...</p>
            </div>
          )}

          {status === "done" && outputUrl && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Original</p>
                  <p className="text-white font-black text-xl">{formatSize(originalSize)}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Compressed</p>
                  <p className="text-white font-black text-xl">{formatSize(compressedSize)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-5 text-center">
                  <p className="text-green-400/60 text-xs mb-1">Saved</p>
                  <p className="text-green-400 font-black text-xl">
                    {outputFormat === "png" ? "Lossless" : `${getSavings()}%`}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center">
                  <p className="text-white/40 text-xs mb-2">Before</p>
                  {preview && <img src={preview} alt="Before" className="max-h-40 mx-auto rounded-lg object-contain" />}
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center">
                  <p className="text-white/40 text-xs mb-2">After</p>
                  <img src={outputUrl} alt="After" className="max-h-40 mx-auto rounded-lg object-contain" />
                </div>
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={outputFileName}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download {outputFormat.toUpperCase()}
                </a>
                <button onClick={reset} className="px-6 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-colors">New</button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-white font-bold text-lg mb-2">Something went wrong</p>
              <button onClick={reset} className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">Try Again</button>
            </div>
          )}

          {/* SEO Content */}
         <div className="mt-20 space-y-8 text-white/60 leading-relaxed">
            <div>
              <h2 className="text-white font-black text-2xl mb-4">Why Compress Images?</h2>
              <p>Every second counts on the internet. Studies show that a 1-second delay in page load time can reduce conversions by 7% and page views by 11%. Images are typically the largest files on any webpage — they often account for 50-80% of total page weight. Compressing your images is the single most impactful thing you can do to speed up your website.</p>
              <p className="mt-3">But it's not just about websites. Compressed images load faster when shared on WhatsApp, Telegram, or email. They take up less storage on your phone and computer. They upload faster to Instagram, Twitter, and other social platforms. And they reduce your mobile data usage when viewed on cellular connections.</p>
              <p className="mt-3">Toolify uses the browser's built-in Canvas API to compress images, which means the entire process happens instantly on your device — no waiting for uploads, no server processing delays, and complete privacy for your files.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Choosing the Right Output Format</h2>
              <p>The output format you choose has a huge impact on file size and quality. Here's a detailed breakdown of each format:</p>
              <ul className="space-y-4 mt-4 list-disc list-inside">
                <li>
                  <strong className="text-white">JPG (JPEG):</strong> The most widely used image format for photos. JPG uses lossy compression — it discards some image data to achieve smaller file sizes. At 80% quality, most people cannot tell the difference from the original. JPG is ideal for photographs, product images, social media posts, and any image where file size matters more than perfect pixel accuracy. A 5MB photo can typically be reduced to 500KB-1MB with no visible quality loss.
                </li>
                <li>
                  <strong className="text-white">WEBP:</strong> Google's modern image format, designed specifically for the web. WEBP achieves 25-35% smaller file sizes than JPG at equivalent visual quality. It supports both lossy and lossless compression, as well as transparency like PNG. WEBP is supported by all modern browsers and is the recommended format for websites. If you're optimizing images for a website, WEBP is almost always the best choice.
                </li>
                <li>
                  <strong className="text-white">PNG:</strong> Uses lossless compression — every pixel is preserved exactly. This means zero quality loss, but also less file size reduction compared to JPG or WEBP. PNG is essential for logos, icons, screenshots, text-heavy images, and any image that requires a transparent background. If you convert a photo to PNG, the file will likely be larger than the original JPG — PNG is not designed for photographs.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Understanding Quality Settings</h2>
              <p>The quality slider controls how aggressively the image is compressed. Here's a practical guide to choosing the right quality level for your use case:</p>
              <ul className="space-y-3 mt-4 list-disc list-inside">
                <li><strong className="text-white">90-100%:</strong> Near-original quality. Minimal file size reduction (10-30%). Use for professional photography, print materials, or images where every detail matters.</li>
                <li><strong className="text-white">75-85%:</strong> The sweet spot for most uses. File size reduced by 50-70% with no visible quality difference to the human eye. Recommended for social media, websites, and general sharing.</li>
                <li><strong className="text-white">60-74%:</strong> Noticeable compression artifacts on close inspection. File size reduced by 70-80%. Good for thumbnails, previews, and background images.</li>
                <li><strong className="text-white">Below 60%:</strong> Visible quality loss. File size reduced by 80-90%+. Only use when file size is the absolute priority, such as messaging app thumbnails.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Common Use Cases for Image Compression</h2>
              <ul className="space-y-3 list-disc list-inside">
                <li><strong className="text-white">Website optimization:</strong> Compress all images before uploading to your website. Smaller images mean faster load times, better SEO rankings, and improved user experience.</li>
                <li><strong className="text-white">Email attachments:</strong> Gmail and most email providers limit attachments to 25MB. Compress your images to ensure they go through without issues.</li>
                <li><strong className="text-white">Social media:</strong> Instagram, Twitter, and Facebook have upload limits. Compressed images upload faster and avoid automatic platform re-compression which can degrade quality.</li>
                <li><strong className="text-white">Storage space:</strong> Free up gigabytes of space on your phone or computer by compressing your photo library without losing visible quality.</li>
                <li><strong className="text-white">Mobile data savings:</strong> Smaller images use less data when shared or viewed on mobile connections — especially important in areas with limited connectivity.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & Security</h2>
              <p>Most online image compressors work by uploading your file to their servers, processing it, then sending it back. This means your images — including personal photos, confidential documents, or sensitive screenshots — pass through a third-party server where they could potentially be stored, analyzed, or accessed.</p>
              <p className="mt-3">Toolify works completely differently. We use the browser's built-in Canvas API, which allows images to be processed entirely on your device without any network communication. Your image files never leave your computer — not even temporarily. There are no server logs of your files, no cloud storage, and no way for anyone to access your images.</p>
              <p className="mt-3">This makes Toolify the safest choice for compressing sensitive images, medical documents, legal documents, ID scans, or any personal content you wouldn't want stored on a third-party server.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Compress an Image — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Image", desc: "Drop your image or click to browse" },
                { step: "2", title: "Choose Format", desc: "Select JPG, WEBP, or PNG" },
                { step: "3", title: "Set Quality", desc: "Adjust the quality slider" },
                { step: "4", title: "Download", desc: "See before/after and download" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
                  <p className="text-white font-bold mb-1">{s.title}</p>
                  <p className="text-white/40 text-sm">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* FAQ */}
          <div className="mt-16">
            <h2 className="text-white font-black text-2xl mb-8">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map((item, i) => (
                <details key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 group">
                  <summary className="text-white font-bold cursor-pointer list-none flex items-center justify-between">
                    {item.q}
                    <span className="text-white/30 group-open:rotate-180 transition-transform text-lg">↓</span>
                  </summary>
                  <p className="text-white/50 mt-4 leading-relaxed">{item.a}</p>
                </details>
              ))}
            </div>
          </div>

          <p className="text-center text-white/20 text-xs mt-10">
            🔒 Your files never leave your device · Processed with Canvas API
          </p>
        </div>
      </main>
    </>
  );
}