"use client";

import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

type Mode = "trim" | "cut";

const faqItems = [
  {
    q: "What is the difference between Trim and Cut Out?",
    a: "Trim keeps only the part you select — you set a start and end time, and everything outside is removed. Cut Out removes a section from the middle — you select the unwanted part and the two remaining pieces are automatically joined together.",
  },
  {
    q: "Will trimming reduce video quality?",
    a: "Toolify re-encodes the video using H.264 with a high-quality CRF setting of 18, which preserves excellent visual quality. The quality difference from the original is minimal and not noticeable to most viewers.",
  },
  {
    q: "What video formats are supported?",
    a: "You can upload MP4, AVI, MOV, and most common video formats. The output is always saved as MP4, which is compatible with all devices and platforms.",
  },
  {
    q: "Is my video uploaded to your servers?",
    a: "No. All processing happens locally in your browser using WebAssembly. Your video file never leaves your device, ensuring complete privacy.",
  },
  {
    q: "How precise is the trimming?",
    a: "You can trim in 0.5-second increments using the slider, or use the ±0.5s, ±1s, and ±5s buttons for precise control. This gives you accurate cuts down to half a second.",
  },
  {
    q: "Can I remove multiple sections from one video?",
    a: "Currently, you can remove one section per operation. To remove multiple sections, download the result and process it again with the tool.",
  },
];

export default function TrimVideo() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [duration, setDuration] = useState(0);
  const [mode, setMode] = useState<Mode>("trim");
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(0);
  const [cutStart, setCutStart] = useState(0);
  const [cutEnd, setCutEnd] = useState(0);
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = (seconds % 60).toFixed(1);
    return `${m}:${s.padStart(4, "0")}`;
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
    const url = URL.createObjectURL(f);
    setFile(f); setFileUrl(url); setOutputUrl(null); setStatus("idle"); setProgress(0);
    const video = document.createElement("video");
    video.src = url;
    video.onloadedmetadata = () => {
      const d = Math.round(video.duration * 10) / 10;
      setDuration(d); setStartTime(0); setEndTime(d);
      setCutStart(Math.round(d * 0.25 * 10) / 10);
      setCutEnd(Math.round(d * 0.75 * 10) / 10);
    };
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const seekVideo = (time: number) => { if (videoRef.current) videoRef.current.currentTime = time; };

  const process = async () => {
    if (!file) return;
    setStatus("loading"); setProgress(0);
    try {
      const ffmpeg = await loadFFmpeg();
      setStatus("processing");
      ffmpeg.on("progress", ({ progress: p }) => { setProgress(Math.round(p * 100)); });
      const ext = file.name.split(".").pop() || "mp4";
      const inputName = `input.${ext}`;
      await ffmpeg.writeFile(inputName, await fetchFile(file));
      if (mode === "trim") {
        await ffmpeg.exec(["-i", inputName, "-ss", startTime.toString(), "-to", endTime.toString(), "-c:v", "libx264", "-c:a", "aac", "-crf", "18", "-preset", "fast", "output.mp4"]);
      } else {
        await ffmpeg.exec(["-i", inputName, "-ss", "0", "-to", cutStart.toString(), "-c:v", "libx264", "-c:a", "aac", "-crf", "18", "-preset", "fast", "part1.mp4"]);
        await ffmpeg.exec(["-i", inputName, "-ss", cutEnd.toString(), "-to", duration.toString(), "-c:v", "libx264", "-c:a", "aac", "-crf", "18", "-preset", "fast", "part2.mp4"]);
        await ffmpeg.writeFile("concat.txt", "file 'part1.mp4'\nfile 'part2.mp4'\n");
        await ffmpeg.exec(["-f", "concat", "-safe", "0", "-i", "concat.txt", "-c", "copy", "output.mp4"]);
      }
      const data = await ffmpeg.readFile("output.mp4");
      const blob = new Blob([data as unknown as BlobPart], { type: "video/mp4" });
      setOutputSize(blob.size); setOutputUrl(URL.createObjectURL(blob)); setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setFileUrl(null); setOutputUrl(null); setStatus("idle");
    setProgress(0); setOutputSize(0); setDuration(0);
  };

  const TimeControl = ({ label, value, onChange, min, max, color }: {
    label: string; value: number; onChange: (v: number) => void;
    min: number; max: number; color: string;
  }) => {
    const clamp = (v: number) => Math.round(Math.min(max, Math.max(min, v)) * 10) / 10;
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-white/60 text-sm font-bold">{label}</span>
          <span className={`font-black text-lg ${color}`}>{formatTime(value)}</span>
        </div>
        <input type="range" min={min} max={max} step={0.5} value={value}
          onChange={(e) => { const v = clamp(Number(e.target.value)); onChange(v); seekVideo(v); }}
          className="w-full accent-red-500" />
        <div className="grid grid-cols-5 gap-2">
          {([-5, -1, -0.5, 0.5, 1, 5] as number[]).map((step) => (
            <button key={step} onClick={() => { const v = clamp(value + step); onChange(v); seekVideo(v); }}
              className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg py-2 text-white/60 text-xs font-bold transition-colors col-span-1">
              {step > 0 ? `+${step}s` : `${step}s`}
            </button>
          ))}
        </div>
        <p className="text-white/20 text-xs text-right">{value}s</p>
      </div>
    );
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Video Trimmer – Toolify",
    "url": "https://gettoolify.app/trim-video",
    "description": "Free online video trimmer. Cut the start/end or remove any middle section. No upload required.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-red-900/50">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
                <line x1="8.12" y1="8.12" x2="12" y2="12"/>
              </svg>
            </div>
            <h1 className="text-4xl font-black text-white mb-3">Trim & Cut Video Online</h1>
            <p className="text-white/40 max-w-md mx-auto">Trim the start/end or cut out any unwanted section from your video. Preview, adjust, and download instantly.</p>
          </div>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging ? "border-red-500 bg-red-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
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
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-600 to-red-700 flex items-center justify-center">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/>
                          <line x1="20" y1="4" x2="8.12" y2="15.88"/><line x1="14.47" y1="14.48" x2="20" y2="20"/>
                          <line x1="8.12" y1="8.12" x2="12" y2="12"/>
                        </svg>
                      </div>
                      <div>
                        <p className="text-white font-bold truncate max-w-xs">{file.name}</p>
                        <p className="text-white/40 text-sm">{formatSize(file.size)} · Total: {formatTime(duration)}</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="text-white/30 hover:text-white/70 text-sm px-3 py-1 rounded-lg hover:bg-white/5">✕ Remove</button>
                  </div>
                )}
              </div>

              {fileUrl && (
                <div className="bg-black rounded-2xl overflow-hidden border border-white/10">
                  <video ref={videoRef} src={fileUrl} controls className="w-full max-h-52 object-contain" />
                </div>
              )}

              {file && duration > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setMode("trim")}
                      className={`p-5 rounded-2xl border text-center transition-all ${mode === "trim" ? "border-red-500 bg-red-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                      <div className="text-2xl mb-2">⬅️➡️</div>
                      <div className="font-black">Trim</div>
                      <div className="text-xs opacity-60 mt-1">Keep a specific part</div>
                    </button>
                    <button onClick={() => setMode("cut")}
                      className={`p-5 rounded-2xl border text-center transition-all ${mode === "cut" ? "border-red-500 bg-red-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                      <div className="text-2xl mb-2">✂️</div>
                      <div className="font-black">Cut Out</div>
                      <div className="text-xs opacity-60 mt-1">Remove a middle section</div>
                    </button>
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 space-y-6">
                    {mode === "trim" ? (
                      <>
                        <TimeControl label="Start Time" value={startTime} onChange={(v) => { if (v < endTime) setStartTime(v); }} min={0} max={duration - 0.5} color="text-red-400" />
                        <TimeControl label="End Time" value={endTime} onChange={(v) => { if (v > startTime) setEndTime(v); }} min={0.5} max={duration} color="text-red-400" />
                        <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                          <span className="text-white/40 text-sm">Kept duration</span>
                          <span className="text-white font-black">{formatTime(endTime - startTime)}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-3 text-orange-300 text-sm">
                          💡 Select the <b>start</b> and <b>end</b> of the section to remove. The rest will be joined together.
                        </div>
                        <TimeControl label="Cut From" value={cutStart} onChange={(v) => { if (v < cutEnd) setCutStart(v); }} min={0} max={duration - 0.5} color="text-orange-400" />
                        <TimeControl label="Cut To" value={cutEnd} onChange={(v) => { if (v > cutStart) setCutEnd(v); }} min={0.5} max={duration} color="text-orange-400" />
                        <div className="space-y-2">
                          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                            <span className="text-white/40 text-sm">Removed section</span>
                            <span className="text-red-400 font-black">{formatTime(cutEnd - cutStart)}</span>
                          </div>
                          <div className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                            <span className="text-white/40 text-sm">Remaining duration</span>
                            <span className="text-green-400 font-black">{formatTime(duration - (cutEnd - cutStart))}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <button onClick={process}
                    className="w-full bg-gradient-to-r from-rose-600 to-red-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                    {mode === "trim" ? "Trim Video ✂️" : "Cut Out & Merge ✂️"}
                  </button>
                </>
              )}
            </div>
          )}

          {status === "loading" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Loading trimmer...</p>
              <p className="text-white/40 text-sm mt-2">This only happens once</p>
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-6">✂️</div>
              <p className="text-white font-bold text-lg mb-2">{mode === "trim" ? "Trimming your video..." : "Cutting & merging..."}</p>
              <div className="max-w-sm mx-auto bg-white/5 rounded-full h-3 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-rose-600 to-red-500 rounded-full transition-all duration-300" style={{ width: `${Math.max(progress, 5)}%` }} />
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
                  <p className="text-white/40 text-xs mb-1">Output</p>
                  <p className="text-white font-black text-xl">{formatSize(outputSize)}</p>
                </div>
                <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-2xl p-5 text-center">
                  <p className="text-green-400/60 text-xs mb-1">Saved</p>
                  <p className="text-green-400 font-black text-xl">{Math.round((1 - outputSize / (file?.size || 1)) * 100)}%</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
                <video src={outputUrl} controls className="w-full max-h-64 object-contain bg-black" />
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={`trimmed_${file?.name}`}
                  className="flex-1 bg-gradient-to-r from-rose-600 to-red-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download Video
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
              <h2 className="text-white font-black text-2xl mb-4">How Does Video Trimming Work?</h2>
              <p>Video trimming is the process of removing unwanted parts from the beginning or end of a video. It's one of the most common video editing tasks — removing a shaky intro, cutting off a long outro, or extracting a specific clip from a longer recording.</p>
              <p className="mt-3">Toolify also offers a unique "Cut Out" feature that lets you remove a section from the middle of a video. The two remaining parts are automatically joined seamlessly, without any visible cuts or gaps.</p>
            </div>
            <div>
              <h2 className="text-white font-black text-2xl mb-4">When to Use Trim vs Cut Out</h2>
              <ul className="space-y-3 list-disc list-inside">
                <li><strong className="text-white">Use Trim when:</strong> You want to keep only a specific portion of the video — for example, extracting a 30-second highlight from a 10-minute recording.</li>
                <li><strong className="text-white">Use Cut Out when:</strong> You want to remove a specific segment from the middle — for example, removing a 5-second cough, mistake, or irrelevant section from an otherwise good recording.</li>
              </ul>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Trim a Video — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Video", desc: "Drop your video or browse files" },
                { step: "2", title: "Choose Mode", desc: "Trim start/end or Cut Out middle" },
                { step: "3", title: "Set Times", desc: "Use slider or ±buttons for precision" },
                { step: "4", title: "Download", desc: "Process and save your trimmed video" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-600 to-red-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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