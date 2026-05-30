"use client";

import { useState, useRef, useCallback } from "react";

const PRESETS = [
  { label: "HD", w: 1280, h: 720 },
  { label: "Full HD", w: 1920, h: 1080 },
  { label: "4K", w: 3840, h: 2160 },
  { label: "Instagram", w: 1080, h: 1080 },
  { label: "Twitter", w: 1200, h: 675 },
  { label: "Thumbnail", w: 1280, h: 720 },
];

const faqItems = [
  {
    q: "Does resizing an image reduce its quality?",
    a: "Reducing an image size (downscaling) has minimal quality impact and is generally safe. Increasing size (upscaling) can reduce sharpness since the tool needs to create new pixels. For best results, always start with the highest resolution original.",
  },
  {
    q: "What is aspect ratio lock and when should I use it?",
    a: "Aspect ratio lock keeps the width-to-height ratio constant as you change dimensions. This prevents your image from looking stretched or squashed. Unlock it only when you need a specific size that doesn't match the original proportions, such as a social media banner.",
  },
  {
    q: "What image formats are supported?",
    a: "You can upload JPG, PNG, WEBP, and most common image formats. You can also choose the output format — JPG for smallest file size, WEBP for best web performance, or PNG for lossless quality.",
  },
  {
    q: "Is my image uploaded to your servers?",
    a: "No. All resizing happens locally in your browser using the Canvas API. Your image never leaves your device, ensuring complete privacy and instant processing with no upload wait time.",
  },
  {
    q: "What size should I use for Instagram, Twitter, or YouTube?",
    a: "Instagram posts: 1080x1080px (square). Twitter header: 1500x500px. YouTube thumbnail: 1280x720px. Facebook cover: 820x312px. Use our presets for common sizes or enter custom dimensions for your specific platform.",
  },
  {
    q: "Can I resize multiple images at once?",
    a: "Currently, images are processed one at a time. Batch resizing is coming soon as a Pro feature. You can quickly resize multiple images by using the New button after each one.",
  },
];

export default function ResizeImage() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [origW, setOrigW] = useState(0);
  const [origH, setOrigH] = useState(0);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [outputFormat, setOutputFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) { alert("Please upload an image file."); return; }
    setFile(f); setOriginalSize(f.size); setOutputUrl(null); setStatus("idle");
    const url = URL.createObjectURL(f);
    setPreview(url);
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setOrigW(img.naturalWidth); setOrigH(img.naturalHeight);
      setWidth(img.naturalWidth); setHeight(img.naturalHeight);
    };
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && origW && origH) setHeight(Math.round(val * origH / origW));
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && origW && origH) setWidth(Math.round(val * origW / origH));
  };

  const applyPreset = (w: number, h: number) => {
    setWidth(w); setHeight(h); setLockAspect(false);
  };

  const resize = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      await new Promise((res) => { img.onload = res; });
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error();
      ctx.drawImage(img, 0, 0, width, height);
      const mimeType = `image/${outputFormat}`;
      const q = outputFormat === "png" ? 1 : 0.92;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => b ? resolve(b) : reject(), mimeType, q);
      });
      setCompressedSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setPreview(null); setOutputUrl(null);
    setStatus("idle"); setOriginalSize(0); setCompressedSize(0);
    setOrigW(0); setOrigH(0); setWidth(0); setHeight(0);
  };

  const outputFileName = file ? file.name.replace(/\.[^.]+$/, `.${outputFormat}`) : `resized.${outputFormat}`;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Image Resizer – Toolify",
    "url": "https://gettoolify.app/resize-image",
    "description": "Free online image resizer. Change image dimensions to any size or use presets. No upload required.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-3xl mx-auto mb-4">📐</div>
            <h1 className="text-4xl font-black text-white mb-3">Resize Image Online Free</h1>
            <p className="text-white/40 max-w-md mx-auto">Change image dimensions to any size. Use presets or enter custom width and height. No uploads required.</p>
          </div>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging ? "border-green-500 bg-green-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
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
                        <p className="text-white/40 text-sm">{formatSize(file.size)} · {origW}×{origH}px</p>
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

              {file && origW > 0 && (
                <div className="space-y-4">
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                    <p className="text-white font-bold mb-3">Quick Presets</p>
                    <div className="grid grid-cols-3 gap-2">
                      {PRESETS.map((p) => (
                        <button key={p.label} onClick={() => applyPreset(p.w, p.h)}
                          className={`p-3 rounded-xl border text-center transition-all ${width === p.w && height === p.h ? "border-green-500 bg-green-500/20 text-white" : "border-white/10 hover:border-green-500 hover:bg-green-500/10"}`}>
                          <div className="text-white font-bold text-sm">{p.label}</div>
                          <div className="text-white/40 text-xs mt-0.5">{p.w}×{p.h}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-bold">Custom Size</p>
                      <button onClick={() => setLockAspect(!lockAspect)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all ${lockAspect ? "border-green-500 bg-green-500/20 text-green-400" : "border-white/10 text-white/40"}`}>
                        {lockAspect ? "🔒 Locked" : "🔓 Unlocked"}
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-white/40 text-xs mb-1 block">Width (px)</label>
                        <input type="number" value={width} min={1} max={10000}
                          onChange={(e) => handleWidthChange(Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-lg focus:border-green-500 focus:outline-none" />
                      </div>
                      <div>
                        <label className="text-white/40 text-xs mb-1 block">Height (px)</label>
                        <input type="number" value={height} min={1} max={10000}
                          onChange={(e) => handleHeightChange(Number(e.target.value))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-lg focus:border-green-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                    <p className="text-white font-bold mb-3">Output Format</p>
                    <div className="grid grid-cols-3 gap-3">
                      {([
                        { value: "jpeg", label: "JPG", desc: "Smallest" },
                        { value: "webp", label: "WEBP", desc: "Best ratio" },
                        { value: "png", label: "PNG", desc: "Lossless" },
                      ] as const).map((f) => (
                        <button key={f.value} onClick={() => setOutputFormat(f.value)}
                          className={`p-4 rounded-xl border text-center transition-all ${outputFormat === f.value ? "border-green-500 bg-green-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                          <div className="font-black">{f.label}</div>
                          <div className="text-xs mt-1 opacity-60">{f.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <button onClick={resize}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                    Resize Image →
                  </button>
                </div>
              )}
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Resizing image...</p>
            </div>
          )}

          {status === "done" && outputUrl && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Original</p>
                  <p className="text-white font-black">{origW}×{origH}</p>
                  <p className="text-white/40 text-xs mt-1">{formatSize(originalSize)}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Resized</p>
                  <p className="text-white font-black">{width}×{height}</p>
                  <p className="text-white/40 text-xs mt-1">{formatSize(compressedSize)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-5 text-center">
                  <p className="text-green-400/60 text-xs mb-1">Format</p>
                  <p className="text-green-400 font-black text-xl">{outputFormat.toUpperCase()}</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden flex items-center justify-center p-4">
                <img src={outputUrl} alt="Resized" className="max-h-64 rounded-xl object-contain" />
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={outputFileName}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download {width}×{height}
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
              <h2 className="text-white font-black text-2xl mb-4">What is Image Resizing?</h2>
              <p>Image resizing changes the pixel dimensions of an image — its width and height. This is one of the most fundamental image editing operations, needed for countless everyday tasks: preparing images for social media, reducing file size, creating thumbnails, or making images fit specific dimensions required by a platform or application.</p>
              <p className="mt-3">Toolify resizes images instantly in your browser using the Canvas API. Enter any custom dimensions, or choose from our presets for common platforms like Instagram, Twitter, and YouTube. The aspect ratio lock ensures your image doesn't get stretched or distorted.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Standard Image Sizes for Social Media</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">Instagram post:</strong> 1080×1080px (square), 1080×1350px (portrait)</li>
                <li><strong className="text-white">Twitter/X post:</strong> 1200×675px landscape</li>
                <li><strong className="text-white">YouTube thumbnail:</strong> 1280×720px (HD)</li>
                <li><strong className="text-white">Facebook cover:</strong> 820×312px</li>
                <li><strong className="text-white">LinkedIn banner:</strong> 1584×396px</li>
                <li><strong className="text-white">Website hero image:</strong> 1920×1080px (Full HD)</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & How It Works</h2>
              <p>All image resizing happens locally in your browser — your images never leave your device. This means no waiting for uploads, no privacy concerns, and instant results regardless of your internet connection speed. The tool uses the same Canvas API that powers professional web-based image editors.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Resize an Image — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Image", desc: "Drop your image or browse files" },
                { step: "2", title: "Choose Size", desc: "Use a preset or enter custom dimensions" },
                { step: "3", title: "Select Format", desc: "Choose JPG, WEBP or PNG" },
                { step: "4", title: "Download", desc: "Preview and save your resized image" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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