"use client";

import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const faqItems = [
  {
    q: "What video formats can I convert to MP3?",
    a: "Toolify supports all major video formats including MP4, AVI, MOV, WEBM, MKV, and more. As long as the video has an audio track, you can extract it as an MP3 file.",
  },
  {
    q: "What is the difference between 128k, 192k and 320k?",
    a: "These are audio bitrates — higher means better quality but larger file size. 128k is good for casual listening and messaging apps. 192k is the standard for most music. 320k is studio quality, ideal for professional use or audiophiles.",
  },
  {
    q: "Is my video uploaded to your servers?",
    a: "No. Everything happens in your browser. Your video file never leaves your device. We use WebAssembly to run the audio extraction locally, ensuring complete privacy.",
  },
  {
    q: "Can I extract audio from a YouTube video?",
    a: "Toolify works with video files on your device. To extract audio from a YouTube video, you would need to first download the video (ensure you have the rights to do so), then use our tool to extract the audio.",
  },
  {
    q: "How long does the conversion take?",
    a: "For most videos, conversion takes 1-3 minutes depending on the video length and your device's processing power. The first conversion may take slightly longer as the audio engine loads.",
  },
  {
    q: "Can I preview the audio before downloading?",
    a: "Yes! After conversion, Toolify shows a built-in audio player so you can preview the extracted MP3 before downloading it.",
  },
];

export default function VideoToMp3() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState(0);
  const [outputSize, setOutputSize] = useState(0);
  const [bitrate, setBitrate] = useState("192");
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

  const convert = async () => {
    if (!file) return;
    setStatus("loading");
    setProgress(0);
    try {
      const ffmpeg = await loadFFmpeg();
      setStatus("processing");
      ffmpeg.on("progress", ({ progress: p }) => { setProgress(Math.round(p * 100)); });
      await ffmpeg.writeFile("input.mp4", await fetchFile(file));
      await ffmpeg.exec(["-i", "input.mp4", "-vn", "-acodec", "libmp3lame", "-b:a", `${bitrate}k`, "output.mp3"]);
      const data = await ffmpeg.readFile("output.mp3");
      const blob = new Blob([data as unknown as BlobPart], { type: "audio/mp3" });
      setOutputSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setOutputUrl(null); setStatus("idle");
    setProgress(0); setOriginalSize(0); setOutputSize(0);
  };

  const outputFileName = file ? file.name.replace(/\.[^.]+$/, ".mp3") : "output.mp3";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Video to MP3 Converter – Toolify",
    "url": "https://gettoolify.app/video-to-mp3",
    "description": "Free online video to MP3 converter. Extract audio from any video file instantly in your browser.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl mx-auto mb-4">🎵</div>
            <h1 className="text-4xl font-black text-white mb-3">Video to MP3 Converter</h1>
            <p className="text-white/40 max-w-md mx-auto">
              Extract audio from any video file instantly. Choose your quality, preview the audio, and download your MP3. Free, no signup required.
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
                  ${isDragging ? "border-purple-500 bg-purple-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
                  ${file ? "cursor-default" : "cursor-pointer"}`}
              >
                <input ref={fileInputRef} type="file" accept="video/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {!file ? (
                  <>
                    <div className="text-5xl mb-4">🎬</div>
                    <p className="text-white font-bold text-lg mb-2">Drop your video here</p>
                    <p className="text-white/40 text-sm">or click to browse · MP4, AVI, MOV, WEBM supported</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">🎬</div>
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
                  <p className="text-white font-bold mb-4">Audio Quality</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "128", label: "128 kbps", desc: "Smaller file" },
                      { value: "192", label: "192 kbps", desc: "Balanced" },
                      { value: "320", label: "320 kbps", desc: "Best quality" },
                    ].map((b) => (
                      <button key={b.value} onClick={() => setBitrate(b.value)}
                        className={`p-4 rounded-xl border text-center transition-all ${
                          bitrate === b.value ? "border-purple-500 bg-purple-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                        <div className="font-bold text-sm">{b.label}</div>
                        <div className="text-xs mt-1 opacity-60">{b.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {file && (
                <button onClick={convert}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Extract MP3 →
                </button>
              )}
            </div>
          )}

          {status === "loading" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Loading audio engine...</p>
              <p className="text-white/40 text-sm mt-2">This only happens once</p>
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-6">🎵</div>
              <p className="text-white font-bold text-lg mb-6">Extracting audio...</p>
              <div className="max-w-sm mx-auto bg-white/5 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-300"
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
                  <p className="text-white/40 text-xs mb-1">Video Size</p>
                  <p className="text-white font-black text-xl">{formatSize(originalSize)}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">MP3 Size</p>
                  <p className="text-white font-black text-xl">{formatSize(outputSize)}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-2xl p-5 text-center">
                  <p className="text-purple-400/60 text-xs mb-1">Quality</p>
                  <p className="text-purple-400 font-black text-xl">{bitrate}k</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                <p className="text-white/40 text-xs mb-3">Preview</p>
                <audio src={outputUrl} controls className="w-full" />
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={outputFileName}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download MP3
                </a>
                <button onClick={reset}
                  className="px-6 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-colors">New</button>
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
              <h2 className="text-white font-black text-2xl mb-4">What is a Video to MP3 Converter?</h2>
              <p>A video to MP3 converter extracts the audio track from a video file and saves it as an MP3 file. This is useful when you want to listen to a conference recording, save a song from a video, or archive the audio from any video content without keeping the large video file.</p>
              <p className="mt-3">Toolify's converter works entirely in your browser using FFmpeg compiled to WebAssembly. This means you get professional-grade audio extraction without installing any software or uploading your files to the internet.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Why Extract Audio from Video?</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">Music & podcasts:</strong> Save audio from recorded concerts, interviews, or podcasts.</li>
                <li><strong className="text-white">Storage efficiency:</strong> An MP3 file is typically 10-20x smaller than the original video.</li>
                <li><strong className="text-white">Compatibility:</strong> MP3 plays on every device — phones, cars, speakers, and all music apps.</li>
                <li><strong className="text-white">Editing:</strong> Use the extracted audio in video editors, presentations, or other projects.</li>
                <li><strong className="text-white">Offline listening:</strong> Save audio lectures or language lessons for offline playback.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Understanding Audio Bitrates</h2>
              <p>Bitrate determines the quality and file size of your MP3. Higher bitrate = better quality = larger file.</p>
              <ul className="space-y-2 list-disc list-inside mt-3">
                <li><strong className="text-white">128 kbps:</strong> Good enough for voice recordings, podcasts, and casual listening. Files are smallest.</li>
                <li><strong className="text-white">192 kbps:</strong> The sweet spot for most music. Excellent quality with reasonable file size.</li>
                <li><strong className="text-white">320 kbps:</strong> Maximum quality MP3. Ideal for music production, archiving, or audiophile listening.</li>
              </ul>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Convert Video to MP3 — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Video", desc: "Drop your video or click to browse" },
                { step: "2", title: "Choose Quality", desc: "Select 128k, 192k or 320k bitrate" },
                { step: "3", title: "Extract", desc: "Click Extract MP3 and wait" },
                { step: "4", title: "Download", desc: "Preview and save your MP3 file" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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