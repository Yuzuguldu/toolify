"use client";

import { useState, useRef, useCallback } from "react";

type Format = "jpeg" | "png" | "webp" | "gif";

const FORMAT_INFO: Record<Format, { label: string; desc: string; mime: string }> = {
  jpeg: { label: "JPG", desc: "Smallest size", mime: "image/jpeg" },
  png:  { label: "PNG", desc: "Lossless", mime: "image/png" },
  webp: { label: "WEBP", desc: "Best for web", mime: "image/webp" },
  gif:  { label: "GIF", desc: "Animated", mime: "image/gif" },
};

const faqItems = [
  {
    q: "Which image format should I use?",
    a: "JPG is best for photos and produces the smallest files. PNG is lossless — perfect for logos, screenshots, and images with transparency. WEBP is Google's modern format offering better compression than both JPG and PNG. GIF supports simple animations but has a limited 256-color palette.",
  },
  {
    q: "Will converting change the image quality?",
    a: "Converting to JPG or WEBP uses lossy compression, which may cause a slight quality reduction — usually unnoticeable. Converting to PNG is lossless, so no quality is lost. Converting from JPG to PNG does not recover lost quality from the original JPG compression.",
  },
  {
    q: "Can I convert PNG with transparency to JPG?",
    a: "Yes, but JPG does not support transparency. Transparent areas will be filled with a white background. If you need to preserve transparency, use PNG or WEBP as the output format.",
  },
  {
    q: "Is my image uploaded to your servers?",
    a: "No. All conversions happen locally in your browser using the Canvas API. Your image never leaves your device, ensuring complete privacy and instant results.",
  },
  {
    q: "Why is my PNG larger after converting from JPG?",
    a: "PNG uses lossless compression, so it stores every pixel precisely. This results in larger files than JPG for photographs. Convert JPG to PNG only when you need lossless quality or transparency support.",
  },
  {
    q: "Does converting to WEBP maintain quality?",
    a: "Yes. WEBP at 90% quality is visually identical to the original while being 25-35% smaller than JPG. It is the best format for web images and is supported by all modern browsers.",
  },
];

export default function ConvertImage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [outputSize, setOutputSize] = useState(0);
  const [targetFormat, setTargetFormat] = useState<Format>("webp");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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

  const convert = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((res) => { img.onload = res; });
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error();
      if (targetFormat === "jpeg") {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      ctx.drawImage(img, 0, 0);
      const fmt = FORMAT_INFO[targetFormat];
      const q = targetFormat === "png" || targetFormat === "gif" ? 1 : 0.92;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(), fmt.mime, q);
      });
      setOutputSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setPreview(null); setOutputUrl(null);
    setStatus("idle"); setOriginalSize(0); setOutputSize(0);
  };

  const sourceExt = file?.name.split(".").pop()?.toUpperCase() || "";
  const outputFileName = file ? file.name.replace(/\.[^.]+$/, `.${targetFormat === "jpeg" ? "jpg" : targetFormat}`) : `converted.${targetFormat}`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Image Converter – Toolify",
    "url": "https://gettoolify.app/convert-image",
    "description": "Free online image converter. Convert between JPG, PNG, WEBP and GIF formats instantly in your browser.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">🔄</div>
            <h1 className="text-4xl font-black text-white mb-3">Convert Image Online Free</h1>
            <p className="text-white/40 max-w-md mx-auto">Convert between JPG, PNG, WEBP and GIF formats instantly. No uploads, no signup — 100% private.</p>
          </div>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging ? "border-violet-500 bg-violet-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
                  ${file ? "cursor-default" : "cursor-pointer"}`}
              >
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {!file ? (
                  <>
                    <div className="text-5xl mb-4">🖼️</div>
                    <p className="text-white font-bold text-lg mb-2">Drop your image here</p>
                    <p className="text-white/40 text-sm">or click to browse · JPG, PNG, WEBP, GIF supported</p>
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
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-center">
                  <img src={preview} alt="Original" className="max-h-48 rounded-xl object-contain" />
                </div>
              )}

              {file && (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                  <p className="text-white font-bold mb-4">Convert to</p>
                  <div className="grid grid-cols-4 gap-3">
                    {(Object.keys(FORMAT_INFO) as Format[]).map((fmt) => (
                      <button key={fmt} onClick={() => setTargetFormat(fmt)}
                        className={`p-4 rounded-xl border text-center transition-all ${targetFormat === fmt ? "border-violet-500 bg-violet-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                        <div className="font-black">{FORMAT_INFO[fmt].label}</div>
                        <div className="text-xs mt-1 opacity-60">{FORMAT_INFO[fmt].desc}</div>
                      </button>
                    ))}
                  </div>
                  {file && (
                    <div className="flex items-center justify-center gap-4 mt-5 bg-white/5 rounded-xl py-3">
                      <span className="text-white/40 text-sm font-bold">{sourceExt || "SOURCE"}</span>
                      <span className="text-violet-400 text-xl">→</span>
                      <span className="text-violet-400 font-black">{FORMAT_INFO[targetFormat].label}</span>
                    </div>
                  )}
                </div>
              )}

              {file && (
                <button onClick={convert}
                  className="w-full bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Convert to {FORMAT_INFO[targetFormat].label} →
                </button>
              )}
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Converting image...</p>
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
                  <p className="text-white/40 text-xs mb-1">Converted</p>
                  <p className="text-white font-black text-xl">{formatSize(outputSize)}</p>
                </div>
                <div className="bg-gradient-to-br from-violet-500/20 to-purple-600/20 border border-violet-500/30 rounded-2xl p-5 text-center">
                  <p className="text-violet-400/60 text-xs mb-1">Format</p>
                  <p className="text-violet-400 font-black text-xl">{FORMAT_INFO[targetFormat].label}</p>
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
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download {FORMAT_INFO[targetFormat].label}
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
              <h2 className="text-white font-black text-2xl mb-4">Why Convert Image Formats?</h2>
              <p>Different platforms, devices, and applications support different image formats. A PNG file with transparency may not display correctly in all email clients. A large JPG may need to be converted to WEBP for faster website loading. Converting to the right format ensures maximum compatibility and performance for your specific use case.</p>
              <p className="mt-3">Toolify converts images instantly in your browser — no file uploads, no waiting, and no privacy concerns. The entire conversion process uses the browser's built-in Canvas API, which means your images stay on your device at all times.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">JPG vs PNG vs WEBP vs GIF</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">JPG:</strong> Best for photos. Small file size, lossy compression. Doesn't support transparency. Use for social media, email, and general sharing.</li>
                <li><strong className="text-white">PNG:</strong> Lossless quality, supports transparency. Larger files than JPG. Best for logos, icons, screenshots, and UI elements.</li>
                <li><strong className="text-white">WEBP:</strong> Modern format by Google. 25-35% smaller than JPG at same quality. Supports transparency. Best choice for websites.</li>
                <li><strong className="text-white">GIF:</strong> Supports simple animations. Limited to 256 colors. Best for short animated clips and reaction images.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & Security</h2>
              <p>Your images never leave your device. Unlike most online converters that upload files to remote servers, Toolify processes everything locally using the Canvas API. This means zero privacy risk for sensitive images, instant results, and no dependence on internet speed for the conversion itself.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Convert an Image — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Image", desc: "Drop your image or click to browse" },
                { step: "2", title: "Choose Format", desc: "Select JPG, PNG, WEBP or GIF" },
                { step: "3", title: "Convert", desc: "Click the convert button" },
                { step: "4", title: "Download", desc: "Compare before/after and download" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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