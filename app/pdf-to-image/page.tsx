"use client";

import { useState, useRef, useCallback } from "react";
import JSZip from "jszip";

const faqItems = [
  {
    q: "What quality setting should I use?",
    a: "1x (standard) is good for web use and general purposes. 2x gives sharper images suitable for presentations and printing at small sizes. 3x produces high-resolution images ideal for printing, detailed analysis, or when you need to zoom into specific content.",
  },
  {
    q: "What is the difference between JPG and PNG output?",
    a: "JPG produces smaller files and works well for PDFs with photos or complex graphics. PNG is lossless and produces larger but sharper files — ideal for PDFs with text, charts, or any content where precise detail matters.",
  },
  {
    q: "Is my PDF uploaded to your servers?",
    a: "No. All conversion happens locally in your browser using PDF.js, Mozilla's open-source PDF rendering engine. Your PDF never leaves your device, ensuring complete privacy.",
  },
  {
    q: "Can I convert only specific pages?",
    a: "Currently, all pages are converted. You can then download only the individual page images you need. Selective page conversion is coming soon as a Pro feature.",
  },
  {
    q: "Why do my images look blurry?",
    a: "Try using 2x or 3x quality setting for sharper results. The 1x setting renders at screen resolution (72-96 DPI), while 2x and 3x render at higher resolutions suitable for printing and zooming.",
  },
  {
    q: "What types of PDFs convert best?",
    a: "All PDFs convert to images, but text-heavy PDFs look sharpest at 2x-3x quality. Scanned PDFs (which are already images inside a PDF) may look the same at all quality settings since the source resolution is fixed.",
  },
];

export default function PdfToImage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [images, setImages] = useState<{ url: string; name: string; size: number }[]>([]);
  const [format, setFormat] = useState<"png" | "jpeg">("jpeg");
  const [scale, setScale] = useState(2);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { alert("Please upload a PDF file."); return; }
    setFile(f); setImages([]); setStatus("idle"); setProgress(0);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const convert = async () => {
    if (!file) return;
    setStatus("processing"); setProgress(0); setImages([]);
    try {
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const ab = await file.arrayBuffer();
      const pdf = await pdfjs.getDocument({ data: ab }).promise;
      const results: { url: string; name: string; size: number }[] = [];
      const baseName = file.name.replace(/\.pdf$/i, "");

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(Math.round((i / pdf.numPages) * 100));
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error();
        await page.render({ canvasContext: ctx, viewport } as any).promise;
        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const q = format === "jpeg" ? 0.92 : 1;
        const blob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => b ? resolve(b) : reject(), mimeType, q);
        });
        const ext = format === "png" ? "png" : "jpg";
        results.push({ url: URL.createObjectURL(blob), name: `${baseName}_page${i}.${ext}`, size: blob.size });
      }
      setImages(results);
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    for (const img of images) {
      const res = await fetch(img.url);
      const blob = await res.blob();
      zip.file(img.name, blob);
    }
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement("a");
    a.href = url; a.download = `${file?.name.replace(/\.pdf$/i, "")}_images.zip`;
    a.click();
  };

  const reset = () => {
    setFile(null); setImages([]); setStatus("idle"); setProgress(0);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PDF to Image Converter – Toolify",
    "url": "https://gettoolify.app/pdf-to-image",
    "description": "Free online PDF to image converter. Convert PDF pages to JPG or PNG instantly in your browser.",
    "applicationCategory": "BusinessApplication",
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

      {lightboxIdx !== null && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxIdx(null)}>
          <div className="relative max-w-4xl w-full" onClick={(e) => e.stopPropagation()}>
            <img src={images[lightboxIdx]?.url} alt={`Page ${lightboxIdx + 1}`} className="w-full rounded-2xl" />
            <div className="flex items-center justify-between mt-4">
              <button onClick={() => setLightboxIdx(Math.max(0, lightboxIdx - 1))}
                disabled={lightboxIdx === 0}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white px-4 py-2 rounded-xl">← Prev</button>
              <span className="text-white/60 text-sm">Page {lightboxIdx + 1} of {images.length}</span>
              <button onClick={() => setLightboxIdx(Math.min(images.length - 1, lightboxIdx + 1))}
                disabled={lightboxIdx === images.length - 1}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white px-4 py-2 rounded-xl">Next →</button>
            </div>
            <button onClick={() => setLightboxIdx(null)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full text-white flex items-center justify-center">✕</button>
          </div>
        </div>
      )}

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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">🖼️</div>
            <h1 className="text-4xl font-black text-white mb-3">PDF to Image Converter</h1>
            <p className="text-white/40 max-w-md mx-auto">Convert each PDF page to a JPG or PNG image. Preview all pages, download individually or as a ZIP file.</p>
          </div>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging ? "border-indigo-500 bg-indigo-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
                  ${file ? "cursor-default" : "cursor-pointer"}`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {!file ? (
                  <>
                    <div className="text-5xl mb-4">📄</div>
                    <p className="text-white font-bold text-lg mb-2">Drop your PDF here</p>
                    <p className="text-white/40 text-sm">or click to browse · PDF files only</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl">📄</div>
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

              {file && (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                  <div>
                    <p className="text-white font-bold mb-3">Output Format</p>
                    <div className="grid grid-cols-2 gap-3">
                      {([
                        { value: "jpeg", label: "JPG", desc: "Smaller files, good for photos" },
                        { value: "png", label: "PNG", desc: "Lossless, sharp text" },
                      ] as const).map((f) => (
                        <button key={f.value} onClick={() => setFormat(f.value)}
                          className={`p-4 rounded-xl border text-center transition-all ${format === f.value ? "border-indigo-500 bg-indigo-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                          <div className="font-black">{f.label}</div>
                          <div className="text-xs mt-1 opacity-60">{f.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-bold mb-3">Quality / Resolution</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 1, label: "1x", desc: "Standard" },
                        { value: 2, label: "2x", desc: "Sharp" },
                        { value: 3, label: "3x", desc: "High-res" },
                      ].map((s) => (
                        <button key={s.value} onClick={() => setScale(s.value)}
                          className={`p-4 rounded-xl border text-center transition-all ${scale === s.value ? "border-indigo-500 bg-indigo-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                          <div className="font-black">{s.label}</div>
                          <div className="text-xs mt-1 opacity-60">{s.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {file && (
                <button onClick={convert}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Convert to Images →
                </button>
              )}
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-6">🖼️</div>
              <p className="text-white font-bold text-lg mb-6">Converting pages to images...</p>
              <div className="max-w-sm mx-auto bg-white/5 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-white/40 text-sm mt-3">{progress}% complete</p>
            </div>
          )}

          {status === "done" && images.length > 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Pages Converted</p>
                  <p className="text-white font-black text-xl">{images.length}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Format</p>
                  <p className="text-white font-black text-xl">{format.toUpperCase()}</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 rounded-2xl p-5 text-center">
                  <p className="text-indigo-400/60 text-xs mb-1">Quality</p>
                  <p className="text-indigo-400 font-black text-xl">{scale}x</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((img, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
                    <div className="cursor-pointer" onClick={() => setLightboxIdx(i)}>
                      <img src={img.url} alt={`Page ${i + 1}`} className="w-full object-cover hover:opacity-90 transition-opacity" style={{ maxHeight: "180px", objectFit: "contain", background: "#111" }} />
                    </div>
                    <div className="p-3 flex items-center justify-between">
                      <div>
                        <p className="text-white/60 text-xs font-bold">Page {i + 1}</p>
                        <p className="text-white/30 text-xs">{formatSize(img.size)}</p>
                      </div>
                      <a href={img.url} download={img.name}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-bold">⬇</a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button onClick={downloadAll}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download All as ZIP
                </button>
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
              <h2 className="text-white font-black text-2xl mb-4">Why Convert PDF to Images?</h2>
              <p>PDF files aren't always the best format for sharing visual content. Converting PDF pages to images makes them universally viewable — no PDF reader required. Images can be embedded in presentations, shared on social media, used in Word documents, or uploaded to platforms that don't support PDFs.</p>
              <p className="mt-3">Toolify converts each page of your PDF to a separate image using PDF.js, Mozilla's battle-tested PDF renderer. The result is pixel-perfect image representations of your PDF pages, processed entirely in your browser.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Choosing the Right Quality Setting</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">1x Standard:</strong> Suitable for web thumbnails and quick previews. Renders at screen resolution (~96 DPI).</li>
                <li><strong className="text-white">2x Sharp:</strong> Recommended for most uses — presentations, documents, and sharing. Good balance of quality and file size.</li>
                <li><strong className="text-white">3x High-res:</strong> Best for printing, detailed analysis, or zooming into specific content. Produces large, high-quality images.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & Security</h2>
              <p>All conversion happens locally in your browser — your PDF never leaves your device. This is especially important for confidential reports, legal documents, or any sensitive PDF content you need to convert to images.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Convert PDF to Images — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload PDF", desc: "Drop your PDF or browse files" },
                { step: "2", title: "Choose Format", desc: "Select JPG or PNG and quality" },
                { step: "3", title: "Convert", desc: "Click Convert to Images" },
                { step: "4", title: "Download", desc: "Download pages or all as ZIP" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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
            🔒 Your files never leave your device · Processed with PDF.js
          </p>
        </div>
      </main>
    </>
  );
}