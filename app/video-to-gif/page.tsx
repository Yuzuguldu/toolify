"use client";

import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const faqItems = [
  {
    q: "What video formats can I convert to GIF?",
    a: "Toolify supports all major video formats including MP4, AVI, MOV, WEBM, and more. Short video clips under 30 seconds work best for GIF conversion.",
  },
  {
    q: "Why is my GIF file larger than the original video?",
    a: "GIF is an older format that uses a limited 256-color palette and less efficient compression than modern video codecs. A GIF can be 5-10x larger than an equivalent MP4 clip. To reduce GIF size, use lower FPS (10) and smaller width (320px).",
  },
  {
    q: "What FPS should I choose for my GIF?",
    a: "10 FPS is great for simple animations and gives the smallest file size. 15 FPS is the standard for most GIFs — smooth enough for most content. 24 FPS gives cinema-quality smoothness but produces larger files.",
  },
  {
    q: "Is there a length limit for video to GIF conversion?",
    a: "There is no strict limit, but we recommend using clips under 30 seconds. Longer videos produce very large GIF files that may be too big to share on social media or messaging apps.",
  },
  {
    q: "Can I use GIFs on WhatsApp and social media?",
    a: "Yes! GIFs are widely supported on WhatsApp, Telegram, Twitter, Reddit, and most social media platforms. For WhatsApp, keep GIFs under 5MB by choosing 10 FPS and 320px width.",
  },
  {
    q: "Is my video uploaded anywhere?",
    a: "No. The entire conversion process happens locally in your browser. Your video never leaves your device, ensuring complete privacy and fast processing.",
  },
];

export default function VideoToGif() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [fps, setFps] = useState("15");
  const [width, setWidth] = useState("480");
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const loadFFmpeg = async () => {
    if (ffmpegRef.current) return ffmpegRef.current;
    const ffmpeg = new FFmpeg();
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });
    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  };

  const handleFile = (f: File) => {
    if (!f.type.startsWith("video/")) { alert("Please upload a video file."); return; }
    setFile(f);
    setOutputUrl(null);
    setStatus("idle");
    setProgress(0);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const convert = async () => {
    if (!file) return;
    setStatus("loading");
    setProgress(0);
    try {
      const ffmpeg = await loadFFmpeg();
      setStatus("processing");
      ffmpeg.on("progress", ({ progress: p }) => { setProgress(Math.round(p * 100)); });
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));
      await ffmpeg.exec(["-i", "input.mp4", "-vf", `fps=${fps},scale=${width}:-1:flags=lanczos,palettegen`, "palette.png"]);
      await ffmpeg.exec(["-i", "input.mp4", "-i", "palette.png", "-filter_complex", `fps=${fps},scale=${width}:-1:flags=lanczos[x];[x][1:v]paletteuse`, "output.gif"]);
      const data = await ffmpeg.readFile("output.gif");
      const blob = new Blob([data as unknown as BlobPart], { type: "image/gif" });
      setOutputSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setOutputUrl(null); setStatus("idle");
    setProgress(0); setOutputSize(0);
  };

  const outputFileName = file ? file.name.replace(/\.[^.]+$/, ".gif") : "output.gif";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Video to GIF Converter – Toolify",
    "url": "https://gettoolify.app/video-to-gif",
    "description": "Free online video to GIF converter. Create high-quality animated GIFs from any video instantly in your browser.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-3xl mx-auto mb-4">🎞️</div>
            <h1 className="text-4xl font-black text-white mb-3">Video to GIF Converter</h1>
            <p className="text-white/40 max-w-md mx-auto">
              Convert any video clip into a high-quality animated GIF. Perfect for social media, messaging, and the web. Free, no signup required.
            </p>
          </div>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging ? "border-yellow-500 bg-yellow-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
                  ${file ? "cursor-default" : "cursor-pointer"}`}
              >
                <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {!file ? (
                  <>
                    <div className="text-5xl mb-4">🎬</div>
                    <p className="text-white font-bold text-lg mb-2">Drop your video here</p>
                    <p className="text-white/40 text-sm">or click to browse · Short clips work best (under 30s)</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl">🎬</div>
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
                    <p className="text-white font-bold mb-3">Frame Rate (FPS)</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ value: "10", label: "10 FPS", desc: "Smaller file" }, { value: "15", label: "15 FPS", desc: "Balanced" }, { value: "24", label: "24 FPS", desc: "Smooth" }].map((f) => (
                        <button key={f.value} onClick={() => setFps(f.value)}
                          className={`p-4 rounded-xl border text-center transition-all ${fps === f.value ? "border-yellow-500 bg-yellow-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                          <div className="font-bold text-sm">{f.label}</div>
                          <div className="text-xs mt-1 opacity-60">{f.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-bold mb-3">GIF Width</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[{ value: "320", label: "320px", desc: "Tiny" }, { value: "480", label: "480px", desc: "Medium" }, { value: "640", label: "640px", desc: "Large" }].map((w) => (
                        <button key={w.value} onClick={() => setWidth(w.value)}
                          className={`p-4 rounded-xl border text-center transition-all ${width === w.value ? "border-yellow-500 bg-yellow-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                          <div className="font-bold text-sm">{w.label}</div>
                          <div className="text-xs mt-1 opacity-60">{w.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {file && (
                <button onClick={convert}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Convert to GIF →
                </button>
              )}
            </div>
          )}

          {status === "loading" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Loading converter...</p>
              <p className="text-white/40 text-sm mt-2">This only happens once</p>
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-6">🎞️</div>
              <p className="text-white font-bold text-lg mb-6">Creating your GIF...</p>
              <div className="max-w-sm mx-auto bg-white/5 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-white/40 text-sm mt-3">{progress}% complete</p>
            </div>
          )}

          {status === "done" && outputUrl && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">GIF Size</p>
                  <p className="text-white font-black text-xl">{formatSize(outputSize)}</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-5 text-center">
                  <p className="text-yellow-400/60 text-xs mb-1">Settings</p>
                  <p className="text-yellow-400 font-black text-xl">{fps}fps · {width}px</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden flex items-center justify-center p-4">
                <img src={outputUrl} alt="GIF preview" className="max-h-64 rounded-xl" />
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={outputFileName}
                  className="flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download GIF
                </a>
                <button onClick={reset} className="px-6 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-colors">New</button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-white font-bold text-lg mb-2">Something went wrong</p>
              <p className="text-white/40 text-sm mb-6">Try a shorter video clip (under 30 seconds works best)</p>
              <button onClick={reset} className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">Try Again</button>
            </div>
          )}

          {/* SEO Content */}
          <div className="mt-20 space-y-8 text-white/60 leading-relaxed">
            <div>
              <h2 className="text-white font-black text-2xl mb-4">What is a Video to GIF Converter?</h2>
              <p>A video to GIF converter transforms a video clip into an animated GIF file. GIFs are widely used on social media, messaging apps, and websites to share short, looping animations without sound. They are universally supported — no video player needed.</p>
              <p className="mt-3">Toolify uses a two-pass conversion process with FFmpeg: first generating an optimized color palette from your video, then applying it to create a high-quality GIF. This results in much better color accuracy compared to single-pass converters.</p>
            </div>
            <div>
              <h2 className="text-white font-black text-2xl mb-4">Best Settings for Different Uses</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">WhatsApp / Telegram:</strong> 10 FPS, 320px — keeps file under 5MB limit</li>
                <li><strong className="text-white">Twitter / Reddit:</strong> 15 FPS, 480px — good balance of quality and size</li>
                <li><strong className="text-white">Website / Blog:</strong> 24 FPS, 640px — best visual quality</li>
                <li><strong className="text-white">Reaction GIF:</strong> 15 FPS, 320px — small, shareable, fast loading</li>
              </ul>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Convert Video to GIF — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Video", desc: "Drop a short video clip" },
                { step: "2", title: "Set Options", desc: "Choose FPS and GIF width" },
                { step: "3", title: "Convert", desc: "Click Convert to GIF" },
                { step: "4", title: "Download", desc: "Preview and save your GIF" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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
            🔒 Your files never leave your device · Processed with WebAssembly
          </p>
        </div>
      </main>
    </>
  );
}