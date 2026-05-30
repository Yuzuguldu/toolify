"use client";

import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const faqItems = [
  {
    q: "Does compressing a video reduce its quality?",
    a: "Our tool uses the H.264 codec with adjustable CRF values. At the 'Balanced' setting, the quality difference is barely noticeable while file size can be reduced by 40-70%. For maximum quality preservation, use the 'High Quality' setting.",
  },
  {
    q: "Is my video uploaded to your servers?",
    a: "No. Toolify processes all files directly in your browser using WebAssembly technology. Your video never leaves your device — not even for a millisecond. This means complete privacy and faster processing.",
  },
  {
    q: "What video formats are supported?",
    a: "Toolify supports MP4, AVI, MOV, WEBM, and most common video formats. The output is always in MP4 format, which is compatible with all devices and platforms.",
  },
  {
    q: "Is there a file size limit?",
    a: "There is no strict file size limit, but very large files (over 2GB) may be slow to process depending on your device's RAM and CPU. For best results, we recommend files under 500MB.",
  },
  {
    q: "Why does the first compression take longer?",
    a: "The first time you use the tool, it needs to load the FFmpeg WebAssembly engine (~30MB). After that, it's cached in your browser and subsequent compressions are much faster.",
  },
  {
    q: "Can I compress multiple videos at once?",
    a: "Currently, videos are processed one at a time. Batch processing is coming soon as a Pro feature.",
  },
];

export default function CompressVideo() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(28);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getSavings = () => {
    if (!originalSize || !compressedSize) return 0;
    return Math.round((1 - compressedSize / originalSize) * 100);
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
    setOriginalSize(f.size);
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

  const compress = async () => {
    if (!file) return;
    setStatus("loading");
    setProgress(0);
    try {
      const ffmpeg = await loadFFmpeg();
      setStatus("processing");
      ffmpeg.on("progress", ({ progress: p }) => { setProgress(Math.round(p * 100)); });
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));
      await ffmpeg.exec(["-i", "input.mp4", "-vcodec", "libx264", "-crf", quality.toString(), "-preset", "fast", "-acodec", "aac", "-b:a", "128k", "output.mp4"]);
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data as unknown as BlobPart], { type: "video/mp4" });
      setCompressedSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setOutputUrl(null); setStatus("idle");
    setProgress(0); setOriginalSize(0); setCompressedSize(0);
  };

  const qualityLabel = quality <= 20 ? "High Quality" : quality <= 28 ? "Balanced" : "Small Size";
  const qualityColor = quality <= 20 ? "text-green-400" : quality <= 28 ? "text-yellow-400" : "text-orange-400";

  // Schema markup
  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Video Compressor – Toolify",
    "url": "https://gettoolify.app/compress-video",
    "description": "Free online video compressor. Reduce video file size without losing quality. No upload required.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Any",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
    "featureList": ["No upload required", "Browser-based processing", "MP4, AVI, MOV support", "Adjustable quality"],
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
          {/* H1 - tek ve açıklayıcı */}
          <div className="text-center mb-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-3xl mx-auto mb-4">🎬</div>
            <h1 className="text-4xl font-black text-white mb-3">Compress Video Online Free</h1>
            <p className="text-white/40 max-w-md mx-auto">
              Reduce your video file size by up to 80% without losing quality. Processed entirely in your browser — no uploads, no signup.
            </p>
          </div>

          {/* Tool */}
          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300 cursor-pointer
                  ${isDragging ? "border-orange-500 bg-orange-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
                  ${file ? "cursor-default" : "cursor-pointer"}`}
              >
                <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {!file ? (
                  <>
                    <div className="text-5xl mb-4">🎥</div>
                    <p className="text-white font-bold text-lg mb-2">Drop your video here</p>
                    <p className="text-white/40 text-sm">or click to browse · MP4, AVI, MOV, WEBM supported</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-2xl">🎬</div>
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
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-bold">Compression Level</span>
                    <span className={`text-sm font-bold ${qualityColor}`}>{qualityLabel}</span>
                  </div>
                  <input type="range" min={18} max={38} value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full accent-orange-500" />
                  <div className="flex justify-between text-xs text-white/30 mt-2">
                    <span>Best Quality</span><span>Smallest Size</span>
                  </div>
                </div>
              )}

              {file && (
                <button onClick={compress}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Compress Video →
                </button>
              )}
            </div>
          )}

          {status === "loading" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Loading video engine...</p>
              <p className="text-white/40 text-sm mt-2">This only happens once</p>
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-6">⚙️</div>
              <p className="text-white font-bold text-lg mb-6">Compressing your video...</p>
              <div className="max-w-sm mx-auto bg-white/5 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }} />
              </div>
              <p className="text-white/40 text-sm mt-3">{progress}% complete</p>
              <p className="text-white/20 text-xs mt-2">Processing in your browser — no data sent to servers</p>
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
                  <p className="text-green-400 font-black text-xl">{getSavings()}%</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
                <video src={outputUrl} controls className="w-full max-h-64 object-contain bg-black" />
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={`compressed_${file?.name}`}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download Compressed Video
                </a>
                <button onClick={reset}
                  className="px-6 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-colors">
                  New
                </button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-white font-bold text-lg mb-2">Something went wrong</p>
              <p className="text-white/40 text-sm mb-6">Please try a different video file</p>
              <button onClick={reset} className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">Try Again</button>
            </div>
          )}

          {/* About this tool - 600+ kelime SEO içeriği */}
          <div className="mt-20 space-y-8 text-white/60 leading-relaxed">
            <div>
              <h2 className="text-white font-black text-2xl mb-4">What is Video Compression?</h2>
              <p>Video compression is the process of reducing the file size of a video by encoding it more efficiently. Modern video files contain a massive amount of data — thousands of frames per second, each containing millions of pixels. Without compression, even a short 1-minute video could take up several gigabytes of storage.</p>
              <p className="mt-3">Toolify's video compressor uses the industry-standard H.264 codec with adjustable CRF (Constant Rate Factor) settings, allowing you to balance between file size and visual quality. This is the same technology used by YouTube, Netflix, and professional video editors worldwide.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Why Compress Your Videos?</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">Email attachments:</strong> Most email providers limit attachments to 25MB. Compress your video to share it directly via email.</li>
                <li><strong className="text-white">WhatsApp & Telegram:</strong> Messaging apps have file size limits. A compressed video loads faster and uses less mobile data.</li>
                <li><strong className="text-white">Website uploads:</strong> Smaller videos load faster on websites, improving user experience and SEO rankings.</li>
                <li><strong className="text-white">Storage space:</strong> Free up space on your phone, computer, or cloud storage by compressing large video files.</li>
                <li><strong className="text-white">Social media:</strong> Platforms like Instagram, TikTok, and Twitter have file size limits for video uploads.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">How to Use the Video Compressor</h2>
              <ol className="space-y-3 list-decimal list-inside">
                <li><strong className="text-white">Upload your video</strong> — drag and drop your video file onto the upload area, or click to browse your files. Supported formats include MP4, AVI, MOV, and WEBM.</li>
                <li><strong className="text-white">Choose compression level</strong> — use the slider to select between High Quality, Balanced, or Small Size. For most use cases, Balanced gives the best results.</li>
                <li><strong className="text-white">Click "Compress Video"</strong> — the compression process begins immediately in your browser. No waiting for uploads.</li>
                <li><strong className="text-white">Download your compressed video</strong> — once complete, preview your video and download it. The tool shows you exactly how much space you saved.</li>
              </ol>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & Security</h2>
              <p>Unlike most online video compressors, Toolify never uploads your video to any server. The entire compression process happens locally in your browser using WebAssembly — a technology that allows high-performance applications to run directly in web browsers.</p>
              <p className="mt-3">This means your private videos, sensitive recordings, or confidential content never leaves your device. We have absolutely no technical ability to access your files.</p>
            </div>
          </div>

          {/* How to use - quick steps */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Compress a Video — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload", desc: "Drop your video or click to browse" },
                { step: "2", title: "Adjust", desc: "Set compression level with the slider" },
                { step: "3", title: "Compress", desc: "Click the button and wait a moment" },
                { step: "4", title: "Download", desc: "Save your smaller video file" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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