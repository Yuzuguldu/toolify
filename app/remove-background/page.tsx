"use client";

import { useState, useRef, useCallback } from "react";
import { removeBackground } from "@imgly/background-removal";

type BgOption = "transparent" | "white" | "black";

const faqItems = [
  {
    q: "How does the background removal work?",
    a: "Toolify uses an AI model (@imgly/background-removal) that runs entirely in your browser. The model analyzes the image and separates the subject from the background using deep learning — the same technology used by professional tools like remove.bg, but running locally on your device.",
  },
  {
    q: "What types of images work best?",
    a: "The AI works best on images with a clear subject — people, products, animals, and objects with distinct edges. It may struggle with complex backgrounds that have similar colors to the subject, very fine details like hair in low resolution, or heavily blurred images.",
  },
  {
    q: "Is my image uploaded to your servers?",
    a: "No. The AI model runs entirely in your browser using WebAssembly and ONNX Runtime. Your image never leaves your device. This is different from most background removers that send your photos to remote servers.",
  },
  {
    q: "Why does it take longer than other tools?",
    a: "Most background removal tools upload your image to a powerful remote server for processing. Toolify runs the AI model locally in your browser, which is slower on first use but completely private. The model is cached after the first use, making subsequent removals faster.",
  },
  {
    q: "What output formats are available?",
    a: "The output is always a PNG file, because PNG supports transparency. If you choose white or black background, the result is a PNG with that color behind your subject. PNG is the correct format for any image with transparency or a solid color background.",
  },
  {
    q: "Can I use the result commercially?",
    a: "Yes. The background removal is performed by an open-source AI model. The resulting image belongs to you and can be used for any purpose — personal or commercial. Always ensure you have the rights to the original image.",
  },
];

export default function RemoveBackground() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [bgOption, setBgOption] = useState<BgOption>("transparent");
  const [originalSize, setOriginalSize] = useState(0);
  const [outputSize, setOutputSize] = useState(0);
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

  const process = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const resultBlob = await removeBackground(file);

      if (bgOption === "transparent") {
        setOutputSize(resultBlob.size);
        setOutputUrl(URL.createObjectURL(resultBlob));
      } else {
        const img = new Image();
        img.src = URL.createObjectURL(resultBlob);
        await new Promise((res) => { img.onload = res; });
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error();
        ctx.fillStyle = bgOption === "white" ? "#ffffff" : "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const finalBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((b) => b ? resolve(b) : reject(), "image/png");
        });
        setOutputSize(finalBlob.size);
        setOutputUrl(URL.createObjectURL(finalBlob));
      }
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setPreview(null); setOutputUrl(null);
    setStatus("idle"); setOriginalSize(0); setOutputSize(0);
  };

  const outputFileName = file ? file.name.replace(/\.[^.]+$/, "_no_bg.png") : "no_background.png";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Background Remover – Toolify",
    "url": "https://gettoolify.app/remove-background",
    "description": "Free AI-powered background remover. Remove image backgrounds instantly in your browser. No upload required.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-3xl mx-auto mb-4">🪄</div>
            <h1 className="text-4xl font-black text-white mb-3">Remove Image Background Free</h1>
            <p className="text-white/40 max-w-md mx-auto">AI-powered background removal. Get transparent, white, or black background instantly. No uploads, no signup.</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl px-5 py-4 mb-6 text-blue-300 text-sm">
            🤖 <b>AI-powered:</b> Uses a deep learning model running in your browser. First use may take 30-60 seconds to load the model.
          </div>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging ? "border-pink-500 bg-pink-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
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
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 flex items-center justify-center">
                  <img src={preview} alt="Original" className="max-h-48 rounded-xl object-contain" />
                </div>
              )}

              {file && (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                  <p className="text-white font-bold mb-4">Background</p>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: "transparent", label: "Transparent", icon: "◻️", desc: "PNG with no background" },
                      { value: "white", label: "White", icon: "⬜", desc: "White background" },
                      { value: "black", label: "Black", icon: "⬛", desc: "Black background" },
                    ] as const).map((bg) => (
                      <button key={bg.value} onClick={() => setBgOption(bg.value)}
                        className={`p-4 rounded-xl border text-center transition-all ${bgOption === bg.value ? "border-pink-500 bg-pink-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                        <div className="text-2xl mb-1">{bg.icon}</div>
                        <div className="font-bold text-sm">{bg.label}</div>
                        <div className="text-xs mt-1 opacity-60">{bg.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {file && (
                <button onClick={process}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Remove Background →
                </button>
              )}
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-pink-500/30 border-t-pink-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">AI is removing the background...</p>
              <p className="text-white/40 text-sm mt-2">This may take 30-60 seconds on first use</p>
              <p className="text-white/20 text-xs mt-2">Processing locally — no data sent to servers</p>
            </div>
          )}

          {status === "done" && outputUrl && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Original</p>
                  <p className="text-white font-black text-xl">{formatSize(originalSize)}</p>
                </div>
                <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-500/30 rounded-2xl p-5 text-center">
                  <p className="text-pink-400/60 text-xs mb-1">Result</p>
                  <p className="text-pink-400 font-black text-xl">{formatSize(outputSize)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 text-center">
                  <p className="text-white/40 text-xs mb-2">Before</p>
                  {preview && <img src={preview} alt="Before" className="max-h-40 mx-auto rounded-lg object-contain" />}
                </div>
                <div className={`rounded-2xl p-4 text-center border ${bgOption === "white" ? "bg-white border-white/20" : bgOption === "black" ? "bg-black border-white/10" : "bg-[repeating-conic-gradient(#808080_0%_25%,transparent_0%_50%)_0_0/20px_20px] border-white/10"}`}>
                  <p className={`text-xs mb-2 ${bgOption === "white" ? "text-black/40" : "text-white/40"}`}>After</p>
                  <img src={outputUrl} alt="After" className="max-h-40 mx-auto rounded-lg object-contain" />
                </div>
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={outputFileName}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download PNG
                </a>
                <button onClick={reset} className="px-6 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-colors">New</button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-white font-bold text-lg mb-2">Something went wrong</p>
              <p className="text-white/40 text-sm mb-6">Try a different image or check your internet connection</p>
              <button onClick={reset} className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">Try Again</button>
            </div>
          )}

          {/* SEO Content */}
          <div className="mt-20 space-y-8 text-white/60 leading-relaxed">
            <div>
              <h2 className="text-white font-black text-2xl mb-4">How AI Background Removal Works</h2>
              <p>Toolify uses a deep learning model to automatically detect and separate the subject from the background in any image. The AI analyzes millions of pixels, identifies edges between the subject and background, and creates a precise cutout — all in your browser without any server uploads.</p>
              <p className="mt-3">Unlike simple color-based removal tools, the AI understands the content of your image. It can distinguish hair strands from sky, separate a person from a complex patterned background, and handle semi-transparent objects like glasses.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">When to Use Each Background Option</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">Transparent:</strong> Best for product images, logos, and design assets that will be placed on different backgrounds. Saved as PNG with alpha channel.</li>
                <li><strong className="text-white">White background:</strong> Ideal for product photography, e-commerce listings (Amazon, eBay), and professional headshots. Clean and universal.</li>
                <li><strong className="text-white">Black background:</strong> Great for dramatic product shots, tech products, jewelry, and creative photography with a dark aesthetic.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & How It Works</h2>
              <p>The AI model runs entirely in your browser using WebAssembly and ONNX Runtime. Your images are never uploaded to any server. This makes Toolify one of the most private background removal tools available — your photos stay on your device from start to finish.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Remove Background — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Image", desc: "Drop your photo or browse files" },
                { step: "2", title: "Choose Background", desc: "Transparent, white, or black" },
                { step: "3", title: "Remove", desc: "AI processes your image" },
                { step: "4", title: "Download", desc: "Save your PNG with new background" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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
            🔒 Your files never leave your device · Powered by @imgly/background-removal
          </p>
        </div>
      </main>
    </>
  );
}