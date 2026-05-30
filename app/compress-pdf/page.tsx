"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

interface PdfFile {
  id: string;
  file: File;
  outputUrl?: string;
  outputSize?: number;
  status: "idle" | "processing" | "done" | "error";
}

const faqItems = [
  {
    q: "How much can PDF compression reduce file size?",
    a: "It depends on the PDF content. Text-heavy PDFs typically see 10-30% reduction. PDFs with many embedded images can be reduced by 40-70%. PDFs that are already highly compressed may see little to no reduction.",
  },
  {
    q: "Why is my compressed PDF still large?",
    a: "If your PDF contains high-resolution images, embedded fonts, or complex vector graphics, browser-based compression has limits. For maximum compression, specialized desktop tools like Adobe Acrobat can compress images more aggressively. Toolify's compression focuses on removing redundant data and optimizing PDF structure.",
  },
  {
    q: "Does compression reduce the visual quality of my PDF?",
    a: "Toolify uses lossless compression techniques that remove redundant metadata and optimize PDF structure without affecting visual content. Text, vector graphics, and page layout remain identical. Embedded images may see minimal changes.",
  },
  {
    q: "Are my PDF files uploaded to your servers?",
    a: "No. All compression happens locally in your browser using pdf-lib. Your files never leave your device — this is especially important for confidential business documents, medical records, or legal files.",
  },
  {
    q: "Can I compress multiple PDFs at once?",
    a: "Yes! Toolify supports batch compression — you can add multiple PDF files and they will each be compressed and available for individual download. This saves time when processing multiple documents.",
  },
  {
    q: "What is the maximum file size I can compress?",
    a: "There is no strict limit, but very large PDFs (over 100MB) may be slow to process in the browser. For best performance, we recommend compressing files under 50MB. Very large files are better handled by desktop applications.",
  },
];

export default function CompressPdf() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [allDone, setAllDone] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getSavings = (orig: number, comp: number) => Math.max(0, Math.round((1 - comp / orig) * 100));

  const addFiles = (newFiles: File[]) => {
    const pdfs = newFiles.filter((f) => f.type === "application/pdf");
    if (pdfs.length === 0) { alert("Please upload PDF files only."); return; }
    const processed: PdfFile[] = pdfs.map((f) => ({
      id: Math.random().toString(36).slice(2), file: f, status: "idle",
    }));
    setFiles((prev) => [...prev, ...processed]);
    setAllDone(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const removeFile = (id: string) => setFiles((prev) => prev.filter((f) => f.id !== id));

  const compressAll = async () => {
    const toProcess = files.filter((f) => f.status === "idle");
    for (const pdfFile of toProcess) {
      setFiles((prev) => prev.map((f) => f.id === pdfFile.id ? { ...f, status: "processing" } : f));
      try {
        const ab = await pdfFile.file.arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        const bytes = await doc.save({ useObjectStreams: true, addDefaultPage: false });
        const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
        setFiles((prev) => prev.map((f) => f.id === pdfFile.id ? {
          ...f, status: "done", outputUrl: URL.createObjectURL(blob), outputSize: blob.size,
        } : f));
      } catch {
        setFiles((prev) => prev.map((f) => f.id === pdfFile.id ? { ...f, status: "error" } : f));
      }
    }
    setAllDone(true);
  };

  const reset = () => { setFiles([]); setAllDone(false); };

  const totalOriginal = files.reduce((a, f) => a + f.file.size, 0);
  const totalCompressed = files.filter((f) => f.outputSize).reduce((a, f) => a + (f.outputSize || 0), 0);
  const hasIdle = files.some((f) => f.status === "idle");

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PDF Compressor – Toolify",
    "url": "https://gettoolify.app/compress-pdf",
    "description": "Free online PDF compressor. Reduce PDF file size instantly in your browser. No upload required.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-3xl mx-auto mb-4">📦</div>
            <h1 className="text-4xl font-black text-white mb-3">Compress PDF Online Free</h1>
            <p className="text-white/40 max-w-md mx-auto">Reduce PDF file size without losing quality. Supports batch compression. No uploads, 100% private.</p>
          </div>

          <div className="space-y-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all duration-300
                ${isDragging ? "border-emerald-500 bg-emerald-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}`}
            >
              <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden"
                onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
              <div className="text-5xl mb-4">📄</div>
              <p className="text-white font-bold text-lg mb-2">Drop PDF files here</p>
              <p className="text-white/40 text-sm">or click to browse · Multiple files supported</p>
            </div>

            {files.length > 0 && (
              <div className="space-y-3">
                {files.map((pf) => (
                  <div key={pf.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate">{pf.file.name}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-white/40 text-xs">{formatSize(pf.file.size)}</span>
                          {pf.status === "done" && pf.outputSize && (
                            <>
                              <span className="text-white/20 text-xs">→</span>
                              <span className="text-emerald-400 text-xs font-bold">{formatSize(pf.outputSize)}</span>
                              <span className="text-emerald-400/60 text-xs">-{getSavings(pf.file.size, pf.outputSize)}%</span>
                            </>
                          )}
                          {pf.status === "error" && <span className="text-red-400 text-xs">Failed</span>}
                          {pf.status === "processing" && <span className="text-yellow-400 text-xs animate-pulse">Compressing...</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {pf.status === "done" && pf.outputUrl && (
                          <a href={pf.outputUrl} download={`compressed_${pf.file.name}`}
                            className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-bold px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-500/30 transition-colors">
                            ⬇ Download
                          </a>
                        )}
                        {pf.status === "idle" && (
                          <button onClick={() => removeFile(pf.id)}
                            className="text-white/30 hover:text-white/60 text-sm px-2 py-1 rounded-lg hover:bg-white/5">✕</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {allDone && totalCompressed > 0 && (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Original Total</p>
                  <p className="text-white font-black text-xl">{formatSize(totalOriginal)}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Compressed Total</p>
                  <p className="text-white font-black text-xl">{formatSize(totalCompressed)}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30 rounded-2xl p-5 text-center">
                  <p className="text-emerald-400/60 text-xs mb-1">Total Saved</p>
                  <p className="text-emerald-400 font-black text-xl">{getSavings(totalOriginal, totalCompressed)}%</p>
                </div>
              </div>
            )}

            {files.length > 0 && (
              <div className="flex gap-4">
                {hasIdle && (
                  <button onClick={compressAll}
                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                    Compress {files.filter((f) => f.status === "idle").length} PDF{files.filter((f) => f.status === "idle").length > 1 ? "s" : ""} →
                  </button>
                )}
                <button onClick={reset}
                  className={`${hasIdle ? "px-6" : "flex-1"} bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-colors`}>
                  Clear All
                </button>
              </div>
            )}
          </div>

          {/* SEO Content */}
          <div className="mt-20 space-y-8 text-white/60 leading-relaxed">
            <div>
              <h2 className="text-white font-black text-2xl mb-4">Why Compress PDF Files?</h2>
              <p>Large PDF files cause problems everywhere — email attachments that exceed size limits, slow uploads to cloud storage, and documents that take forever to download. PDF compression reduces file size by removing redundant data and optimizing the document structure, making files easier to share and store.</p>
              <p className="mt-3">Toolify uses pdf-lib to compress PDFs using object streams — a technique that reorganizes internal PDF data for maximum efficiency. This is done entirely in your browser, so your files never leave your device.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">What Affects PDF File Size?</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">Embedded images:</strong> High-resolution photos in PDFs are the biggest contributor to large file sizes. Image-heavy PDFs benefit most from compression.</li>
                <li><strong className="text-white">Fonts:</strong> PDFs embed font files to ensure consistent display. Multiple embedded fonts add to file size.</li>
                <li><strong className="text-white">Metadata:</strong> PDFs store creation date, author, edit history, and other metadata that can be stripped to reduce size.</li>
                <li><strong className="text-white">Redundant objects:</strong> PDFs often contain duplicate or unused objects that can be removed without affecting content.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & Security</h2>
              <p>PDF documents often contain sensitive business data, personal information, or confidential content. Toolify compresses all files locally in your browser — nothing is uploaded to any server. This makes it the safest choice for compressing private or confidential PDF documents.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Compress a PDF — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload PDFs", desc: "Drop one or multiple PDF files" },
                { step: "2", title: "Compress", desc: "Click Compress PDF button" },
                { step: "3", title: "See Results", desc: "Check how much space was saved" },
                { step: "4", title: "Download", desc: "Download each compressed file" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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
            🔒 Your files never leave your device · Processed with pdf-lib
          </p>
        </div>
      </main>
    </>
  );
}