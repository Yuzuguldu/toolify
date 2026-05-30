"use client";

import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

type Format = "mp4" | "avi" | "mov";

const FORMAT_INFO: Record<Format, { label: string; desc: string; mime: string; vcodec: string; acodec: string }> = {
  mp4: { label: "MP4", desc: "Most compatible", mime: "video/mp4", vcodec: "libx264", acodec: "aac" },
  avi: { label: "AVI", desc: "Windows classic", mime: "video/avi", vcodec: "mpeg4", acodec: "mp3" },
  mov: { label: "MOV", desc: "Apple / iPhone", mime: "video/quicktime", vcodec: "libx264", acodec: "aac" },
};

const faqItems = [
  {
    q: "What video formats does Toolify support?",
    a: "Toolify supports converting between MP4, AVI, and MOV formats. MP4 is the most universally compatible format, MOV is ideal for Apple devices, and AVI is a classic Windows format.",
  },
  {
    q: "Why convert a video to a different format?",
    a: "Different devices and platforms require different video formats. iPhones work best with MOV, Windows media players prefer AVI, and MP4 works everywhere. Converting ensures your video plays correctly on any device.",
  },
  {
    q: "Will converting change the video quality?",
    a: "There is always a small quality loss when re-encoding video. However, Toolify uses high-quality settings (H.264 codec with fast preset) to minimize this. For most viewers, the difference is not noticeable.",
  },
  {
    q: "Is my video uploaded to your servers?",
    a: "No. All conversion happens locally in your browser using WebAssembly. Your video never leaves your device, ensuring complete privacy and security.",
  },
  {
    q: "Why is AVI larger than MP4?",
    a: "AVI uses older compression algorithms that are less efficient than modern H.264 used in MP4. An AVI file can be 2-3x larger than the equivalent MP4, but may be needed for compatibility with older devices or software.",
  },
  {
    q: "How long does conversion take?",
    a: "Conversion time depends on video length and your device's processing power. A typical 100MB video takes 1-3 minutes. The first conversion may take slightly longer as the engine loads.",
  },
];

export default function ConvertVideo() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [targetFormat, setTargetFormat] = useState<Format>("mp4");
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
    setFile(f); setOutputUrl(null); setStatus("idle"); setProgress(0);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const convert = async () => {
    if (!file) return;
    setStatus("loading"); setProgress(0);
    try {
      const ffmpeg = await loadFFmpeg();
      setStatus("processing");
      ffmpeg.on("progress", ({ progress: p }) => { setProgress(Math.round(p * 100)); });
      const ext = file.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;
      const outputName = `output.${targetFormat}`;
      const fmt = FORMAT_INFO[targetFormat];
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      await ffmpeg.exec(["-i", inputName, "-vcodec", fmt.vcodec, "-acodec", fmt.acodec, "-preset", "fast", outputName]);
      const data = await ffmpeg.readFile(outputName);
      const blob = new Blob([data as unknown as BlobPart], { type: fmt.mime });
      setOutputSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setOutputUrl(null); setStatus("idle"); setProgress(0); setOutputSize(0);
  };

  const outputFileName = file ? file.name.replace(/\.[^.]+$/, `.${targetFormat}`) : `output.${targetFormat}`;
  const sourceFormat = file?.name.split(".").pop()?.toUpperCase() || "";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Video Converter – Toolify",
    "url": "https://gettoolify.app/convert-video",
    "description": "Free online video converter. Convert between MP4, AVI, and MOV formats instantly in your browser.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-3xl mx-auto mb-4">🔄</div>
            <h1 className="text-4xl font-black text-white mb-3">Convert Video Online Free</h1>
            <p className="text-white/40 max-w-md mx-auto">Convert between MP4, AVI and MOV formats instantly in your browser. No uploads, no signup required.</p>
          </div>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging ? "border-teal-500 bg-teal-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
                  ${file ? "cursor-default" : "cursor-pointer"}`}
              >
                <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {!file ? (
                  <>
                    <div className="text-5xl mb-4">🎬</div>
                    <p className="text-white font-bold text-lg mb-2">Drop your video here</p>
                    <p className="text-white/40 text-sm">or click to browse · MP4, AVI, MOV supported</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-2xl">🎬</div>
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
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                  <p className="text-white font-bold mb-4">Convert to</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(Object.keys(FORMAT_INFO) as Format[]).map((fmt) => (
                      <button key={fmt} onClick={() => setTargetFormat(fmt)}
                        className={`p-5 rounded-xl border text-center transition-all ${targetFormat === fmt ? "border-teal-500 bg-teal-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                        <div className="font-black text-lg">{FORMAT_INFO[fmt].label}</div>
                        <div className="text-xs mt-1 opacity-60">{FORMAT_INFO[fmt].desc}</div>
                      </button>
                    ))}
                  </div>
                  {file && (
                    <div className="flex items-center justify-center gap-4 mt-5 bg-white/5 rounded-xl py-3">
                      <span className="text-white/40 text-sm font-bold">{sourceFormat || "SOURCE"}</span>
                      <span className="text-teal-400 text-xl">→</span>
                      <span className="text-teal-400 font-black">{FORMAT_INFO[targetFormat].label}</span>
                    </div>
                  )}
                </div>
              )}

              {file && (
                <button onClick={convert}
                  className="w-full bg-gradient-to-r from-teal-500 to-blue-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Convert to {targetFormat.toUpperCase()} →
                </button>
              )}
            </div>
          )}

          {status === "loading" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Loading converter...</p>
              <p className="text-white/40 text-sm mt-2">This only happens once</p>
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-6">🔄</div>
              <p className="text-white font-bold text-lg mb-2">Converting to {targetFormat.toUpperCase()}...</p>
              <div className="max-w-sm mx-auto bg-white/5 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-white/40 text-sm mt-3">{progress}% complete</p>
            </div>
          )}

          {status === "done" && outputUrl && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Original</p>
                  <p className="text-white font-black text-xl">{formatSize(file?.size || 0)}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Converted</p>
                  <p className="text-white font-black text-xl">{formatSize(outputSize)}</p>
                </div>
                <div className="bg-gradient-to-br from-teal-500/20 to-blue-500/20 border border-teal-500/30 rounded-2xl p-5 text-center">
                  <p className="text-teal-400/60 text-xs mb-1">Format</p>
                  <p className="text-teal-400 font-black text-xl">{targetFormat.toUpperCase()}</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
                <video src={outputUrl} controls className="w-full max-h-64 object-contain bg-black" />
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={outputFileName}
                  className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download {targetFormat.toUpperCase()}
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
              <h2 className="text-white font-black text-2xl mb-4">Why Convert Video Formats?</h2>
              <p>Different devices, operating systems, and platforms have their own preferred video formats. A video that plays perfectly on a Mac might not work on an older Windows PC, and vice versa. Converting to the right format ensures maximum compatibility.</p>
              <p className="mt-3">Toolify supports the three most common video formats: MP4 for universal compatibility, MOV for Apple devices, and AVI for Windows legacy software. All conversions happen locally in your browser with no file uploads required.</p>
            </div>
            <div>
              <h2 className="text-white font-black text-2xl mb-4">MP4 vs AVI vs MOV — Which to Choose?</h2>
              <ul className="space-y-3 list-disc list-inside">
                <li><strong className="text-white">MP4:</strong> The best choice for 95% of use cases. Works on all devices, browsers, social media platforms, and streaming services. Uses H.264 compression for small file sizes.</li>
                <li><strong className="text-white">MOV:</strong> Apple's native format. Best for iPhone, Mac, iMovie, and Final Cut Pro. Also supported on Windows with QuickTime. Good quality with slightly larger files.</li>
                <li><strong className="text-white">AVI:</strong> Microsoft's classic format. Required by some older software and legacy systems. Larger file sizes than MP4 but maximum compatibility with Windows applications.</li>
              </ul>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Convert Video Format — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Video", desc: "Drop your video or browse files" },
                { step: "2", title: "Choose Format", desc: "Select MP4, AVI, or MOV" },
                { step: "3", title: "Convert", desc: "Click the convert button" },
                { step: "4", title: "Download", desc: "Save your converted video" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-blue-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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