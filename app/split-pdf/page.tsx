"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

type Mode = "range" | "every" | "extract";

const faqItems = [
  {
    q: "What are the different split modes?",
    a: "Page Range keeps only a specific range of pages (e.g. pages 3-7). Split Every N Pages divides the PDF into equal chunks (e.g. every 5 pages creates separate files). Extract Pages lets you pick specific individual pages (e.g. pages 1, 3, 5) into a single new PDF.",
  },
  {
    q: "Can I extract non-consecutive pages?",
    a: "Yes. In Extract Pages mode, enter comma-separated page numbers like '1, 3, 5, 8' and those specific pages will be combined into a single new PDF in the order you specify.",
  },
  {
    q: "Will splitting reduce the quality of my PDF?",
    a: "No. Toolify uses pdf-lib to copy pages at the binary level — no re-encoding or quality loss. The split pages are identical in quality to the originals.",
  },
  {
    q: "Are my PDF files uploaded to your servers?",
    a: "No. All splitting happens locally in your browser. Your PDF never leaves your device, making this safe for confidential or sensitive documents.",
  },
  {
    q: "Can I split a password-protected PDF?",
    a: "Password-protected PDFs cannot be split without first removing the password. Open the PDF in Adobe Reader or a PDF viewer, print to PDF without a password, then use Toolify to split the unprotected version.",
  },
  {
    q: "Is there a page limit for splitting?",
    a: "There is no strict page limit. However, very large PDFs (500+ pages or 100MB+) may take longer to process. For best performance, we recommend splitting files under 50MB.",
  },
];

export default function SplitPdf() {
  const [file, setFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [mode, setMode] = useState<Mode>("range");
  const [rangeFrom, setRangeFrom] = useState(1);
  const [rangeTo, setRangeTo] = useState(1);
  const [everyN, setEveryN] = useState(1);
  const [extractPages, setExtractPages] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [outputs, setOutputs] = useState<{ url: string; name: string; size: number }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFile = async (f: File) => {
    if (f.type !== "application/pdf") { alert("Please upload a PDF file."); return; }
    setFile(f); setOutputs([]); setStatus("idle");
    try {
      const ab = await f.arrayBuffer();
      const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const count = doc.getPageCount();
      setPageCount(count);
      setRangeFrom(1); setRangeTo(count);
      setEveryN(1); setExtractPages("1");
    } catch { alert("Could not read PDF. Make sure it's a valid PDF file."); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const split = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const ab = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(ab, { ignoreEncryption: true });
      const baseName = file.name.replace(/\.pdf$/i, "");
      const results: { url: string; name: string; size: number }[] = [];

      if (mode === "range") {
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(srcDoc, Array.from({ length: rangeTo - rangeFrom + 1 }, (_, i) => rangeFrom - 1 + i));
        pages.forEach((p) => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
        results.push({ url: URL.createObjectURL(blob), name: `${baseName}_pages_${rangeFrom}-${rangeTo}.pdf`, size: blob.size });
      } else if (mode === "every") {
        let start = 0;
        let part = 1;
        while (start < pageCount) {
          const end = Math.min(start + everyN, pageCount);
          const newDoc = await PDFDocument.create();
          const indices = Array.from({ length: end - start }, (_, i) => start + i);
          const pages = await newDoc.copyPages(srcDoc, indices);
          pages.forEach((p) => newDoc.addPage(p));
          const bytes = await newDoc.save();
          const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
          results.push({ url: URL.createObjectURL(blob), name: `${baseName}_part${part}.pdf`, size: blob.size });
          start = end; part++;
        }
      } else if (mode === "extract") {
        const indices = extractPages.split(",").map((s) => parseInt(s.trim()) - 1).filter((i) => i >= 0 && i < pageCount);
        if (indices.length === 0) throw new Error("No valid pages");
        const newDoc = await PDFDocument.create();
        const pages = await newDoc.copyPages(srcDoc, indices);
        pages.forEach((p) => newDoc.addPage(p));
        const bytes = await newDoc.save();
        const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
        results.push({ url: URL.createObjectURL(blob), name: `${baseName}_extracted.pdf`, size: blob.size });
      }

      setOutputs(results);
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setPageCount(0); setOutputs([]);
    setStatus("idle"); setRangeFrom(1); setRangeTo(1);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PDF Splitter – Toolify",
    "url": "https://gettoolify.app/split-pdf",
    "description": "Free online PDF splitter. Extract pages, split by range, or separate every page instantly in your browser.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-3xl mx-auto mb-4">✂️</div>
            <h1 className="text-4xl font-black text-white mb-3">Split PDF Online Free</h1>
            <p className="text-white/40 max-w-md mx-auto">Extract pages, split by range, or separate every page. No uploads — processed instantly in your browser.</p>
          </div>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging ? "border-amber-500 bg-amber-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
                  ${file ? "cursor-default" : "cursor-pointer"}`}
              >
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {!file ? (
                  <>
                    <div className="text-5xl mb-4">📄</div>
                    <p className="text-white font-bold text-lg mb-2">Drop your PDF here</p>
                    <p className="text-white/40 text-sm">or click to browse</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-2xl">📄</div>
                      <div>
                        <p className="text-white font-bold truncate max-w-xs">{file.name}</p>
                        <p className="text-white/40 text-sm">{formatSize(file.size)} · {pageCount} pages</p>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); reset(); }}
                      className="text-white/30 hover:text-white/70 text-sm px-3 py-1 rounded-lg hover:bg-white/5">✕ Remove</button>
                  </div>
                )}
              </div>

              {file && pageCount > 0 && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { value: "range", label: "Page Range", icon: "📑", desc: "Keep a range of pages" },
                      { value: "every", label: "Split Every N", icon: "🔪", desc: "Split into equal parts" },
                      { value: "extract", label: "Extract Pages", icon: "📌", desc: "Pick specific pages" },
                    ] as const).map((m) => (
                      <button key={m.value} onClick={() => setMode(m.value)}
                        className={`p-4 rounded-xl border text-center transition-all ${mode === m.value ? "border-amber-500 bg-amber-500/20 text-white" : "border-white/10 text-white/50 hover:border-white/30"}`}>
                        <div className="text-2xl mb-1">{m.icon}</div>
                        <div className="font-bold text-sm">{m.label}</div>
                        <div className="text-xs mt-1 opacity-60">{m.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
                    {mode === "range" && (
                      <div className="space-y-4">
                        <p className="text-white font-bold">Select Page Range <span className="text-white/30 font-normal text-sm">(PDF has {pageCount} pages)</span></p>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-white/40 text-xs mb-1 block">From page</label>
                            <input type="number" min={1} max={rangeTo} value={rangeFrom}
                              onChange={(e) => setRangeFrom(Math.min(Number(e.target.value), rangeTo))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-lg focus:border-amber-500 focus:outline-none" />
                          </div>
                          <div>
                            <label className="text-white/40 text-xs mb-1 block">To page</label>
                            <input type="number" min={rangeFrom} max={pageCount} value={rangeTo}
                              onChange={(e) => setRangeTo(Math.max(Number(e.target.value), rangeFrom))}
                              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-lg focus:border-amber-500 focus:outline-none" />
                          </div>
                        </div>
                        <p className="text-white/40 text-sm">Will extract {rangeTo - rangeFrom + 1} page{rangeTo - rangeFrom + 1 !== 1 ? "s" : ""}</p>
                      </div>
                    )}

                    {mode === "every" && (
                      <div className="space-y-4">
                        <p className="text-white font-bold">Split Every N Pages <span className="text-white/30 font-normal text-sm">(PDF has {pageCount} pages)</span></p>
                        <input type="number" min={1} max={pageCount} value={everyN}
                          onChange={(e) => setEveryN(Math.max(1, Number(e.target.value)))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold text-lg focus:border-amber-500 focus:outline-none" />
                        <p className="text-white/40 text-sm">Will create {Math.ceil(pageCount / everyN)} file{Math.ceil(pageCount / everyN) !== 1 ? "s" : ""}</p>
                      </div>
                    )}

                    {mode === "extract" && (
                      <div className="space-y-4">
                        <p className="text-white font-bold">Enter Page Numbers <span className="text-white/30 font-normal text-sm">(comma separated, max page {pageCount})</span></p>
                        <input type="text" value={extractPages} placeholder="e.g. 1, 3, 5, 8"
                          onChange={(e) => setExtractPages(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white font-bold focus:border-amber-500 focus:outline-none" />
                        <p className="text-white/40 text-sm">These pages will be combined into one PDF</p>
                      </div>
                    )}
                  </div>

                  <button onClick={split}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                    Split PDF →
                  </button>
                </>
              )}
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Splitting PDF...</p>
            </div>
          )}

          {status === "done" && outputs.length > 0 && (
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-amber-500/10 to-yellow-500/10 border border-amber-500/20 rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">✂️</div>
                <p className="text-white font-bold text-lg">Split complete!</p>
                <p className="text-white/40 text-sm mt-1">{outputs.length} file{outputs.length > 1 ? "s" : ""} created</p>
              </div>
              <div className="space-y-3">
                {outputs.map((out, i) => (
                  <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 flex items-center justify-between">
                    <div>
                      <p className="text-white font-bold text-sm">{out.name}</p>
                      <p className="text-white/40 text-xs">{formatSize(out.size)}</p>
                    </div>
                    <a href={out.url} download={out.name}
                      className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity">
                      ⬇ Download
                    </a>
                  </div>
                ))}
              </div>
              <button onClick={reset} className="w-full bg-white/5 border border-white/10 text-white/60 font-bold py-4 rounded-2xl hover:bg-white/10 transition-colors">
                Split Another PDF
              </button>
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
              <h2 className="text-white font-black text-2xl mb-4">Why Split a PDF?</h2>
              <p>Large PDF files can be difficult to share, email, or navigate. Splitting lets you extract only the relevant pages — sending just the contract section of a 50-page legal document, or extracting specific product pages from a catalog. It's also useful for breaking up a large PDF into smaller, manageable chunks.</p>
              <p className="mt-3">Toolify offers three split modes: Page Range for keeping a specific section, Split Every N Pages for dividing into equal parts, and Extract Pages for picking individual pages. All processing happens locally in your browser with no quality loss.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Choosing the Right Split Mode</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">Page Range:</strong> Best when you want pages 10-20 of a report, or any continuous section of a PDF.</li>
                <li><strong className="text-white">Split Every N Pages:</strong> Best for dividing a 100-page document into 10-page chapters, or splitting a large invoice batch into individual invoices.</li>
                <li><strong className="text-white">Extract Pages:</strong> Best when you need specific non-consecutive pages — like pages 1, 5, and 12 from a form.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & Security</h2>
              <p>All PDF splitting happens locally in your browser using pdf-lib. Your files never leave your device — making this the safest option for splitting confidential contracts, medical records, financial statements, or any sensitive documents.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Split a PDF — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload PDF", desc: "Drop your PDF or browse files" },
                { step: "2", title: "Choose Mode", desc: "Range, Every N, or Extract Pages" },
                { step: "3", title: "Set Options", desc: "Enter page numbers or range" },
                { step: "4", title: "Download", desc: "Download your split PDF files" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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