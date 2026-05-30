"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument } from "pdf-lib";

interface PdfFile {
  id: string;
  file: File;
  pageCount: number;
}

const faqItems = [
  {
    q: "How many PDF files can I merge at once?",
    a: "There is no strict limit on the number of PDFs you can merge. However, very large files (each over 50MB) or merging 20+ files at once may be slow depending on your device's memory. For best performance, keep total file size under 200MB.",
  },
  {
    q: "Can I reorder the PDFs before merging?",
    a: "Yes. After adding your PDF files, use the up and down arrow buttons to reorder them. The final merged PDF will follow the order shown on screen.",
  },
  {
    q: "Will the quality of my PDFs change after merging?",
    a: "No. Toolify uses pdf-lib to merge PDFs at the binary level, preserving the original quality, fonts, images, and formatting of each file. The merged PDF is identical in quality to the originals.",
  },
  {
    q: "Are my PDF files uploaded to your servers?",
    a: "No. All merging happens locally in your browser using pdf-lib. Your files never leave your device, making this the safest option for merging confidential or sensitive documents.",
  },
  {
    q: "Can I merge password-protected PDFs?",
    a: "Password-protected PDFs cannot be merged without first removing the password protection. Open the PDF in a viewer, print it to a new PDF (without password), then use Toolify to merge the unprotected version.",
  },
  {
    q: "What happens to bookmarks and links in the original PDFs?",
    a: "The merged PDF preserves the page content exactly. Bookmarks and internal links from the original files may not transfer to the merged document, as these are complex structures that vary between PDF versions.",
  },
];

export default function MergePdf() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const addFiles = async (newFiles: File[]) => {
    const pdfs = newFiles.filter((f) => f.type === "application/pdf");
    if (pdfs.length === 0) { alert("Please upload PDF files only."); return; }

    const processed: PdfFile[] = await Promise.all(
      pdfs.map(async (f) => {
        try {
          const ab = await f.arrayBuffer();
          const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
          return { id: Math.random().toString(36).slice(2), file: f, pageCount: doc.getPageCount() };
        } catch {
          return { id: Math.random().toString(36).slice(2), file: f, pageCount: 0 };
        }
      })
    );
    setFiles((prev) => [...prev, ...processed]);
    setOutputUrl(null);
    setStatus("idle");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    addFiles(Array.from(e.dataTransfer.files));
  }, []);

  const moveFile = (index: number, dir: -1 | 1) => {
    const newFiles = [...files];
    const target = index + dir;
    if (target < 0 || target >= newFiles.length) return;
    [newFiles[index], newFiles[target]] = [newFiles[target], newFiles[index]];
    setFiles(newFiles);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const merge = async () => {
    if (files.length < 2) { alert("Please add at least 2 PDF files."); return; }
    setStatus("processing");
    try {
      const merged = await PDFDocument.create();
      for (const pdfFile of files) {
        const ab = await pdfFile.file.arrayBuffer();
        const doc = await PDFDocument.load(ab, { ignoreEncryption: true });
        const pages = await merged.copyPages(doc, doc.getPageIndices());
        pages.forEach((p) => merged.addPage(p));
      }
      setTotalPages(merged.getPageCount());
      const bytes = await merged.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setOutputSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFiles([]); setOutputUrl(null); setStatus("idle"); setOutputSize(0); setTotalPages(0);
  };

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PDF Merger – Toolify",
    "url": "https://gettoolify.app/merge-pdf",
    "description": "Free online PDF merger. Combine multiple PDF files into one instantly in your browser.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-3xl mx-auto mb-4">🔗</div>
            <h1 className="text-4xl font-black text-white mb-3">Merge PDF Files Online</h1>
            <p className="text-white/40 max-w-md mx-auto">Combine multiple PDF files into one document. Reorder files, merge instantly — no uploads required.</p>
          </div>

          {status !== "done" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); }}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 hover:border-white/30 hover:bg-white/[0.02] rounded-3xl p-10 text-center cursor-pointer transition-all duration-300"
              >
                <input ref={fileInputRef} type="file" accept=".pdf" multiple className="hidden"
                  onChange={(e) => e.target.files && addFiles(Array.from(e.target.files))} />
                <div className="text-5xl mb-4">📄</div>
                <p className="text-white font-bold text-lg mb-2">Drop PDF files here</p>
                <p className="text-white/40 text-sm">or click to browse · Add multiple files</p>
              </div>

              {files.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-white font-bold">{files.length} file{files.length > 1 ? "s" : ""} · {files.reduce((a, f) => a + f.pageCount, 0)} pages total</p>
                    <button onClick={reset} className="text-white/30 hover:text-white/60 text-sm">Clear all</button>
                  </div>
                  {files.map((pf, i) => (
                    <div key={pf.id} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-5 py-4 flex items-center gap-4">
                      <span className="text-white/20 font-black text-lg w-6 text-center">{i + 1}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-bold truncate">{pf.file.name}</p>
                        <p className="text-white/40 text-xs">{formatSize(pf.file.size)} · {pf.pageCount} page{pf.pageCount !== 1 ? "s" : ""}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => moveFile(i, -1)} disabled={i === 0}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 flex items-center justify-center text-white/60 transition-colors">↑</button>
                        <button onClick={() => moveFile(i, 1)} disabled={i === files.length - 1}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 disabled:opacity-20 flex items-center justify-center text-white/60 transition-colors">↓</button>
                        <button onClick={() => removeFile(pf.id)}
                          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 flex items-center justify-center text-white/40 hover:text-red-400 transition-colors">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {files.length >= 2 && (
                <button onClick={merge}
                  className="w-full bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Merge {files.length} PDFs →
                </button>
              )}

              {files.length === 1 && (
                <p className="text-center text-white/30 text-sm">Add at least one more PDF to merge</p>
              )}
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-red-500/30 border-t-red-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Merging PDFs...</p>
              <p className="text-white/40 text-sm mt-2">Combining {files.length} files</p>
            </div>
          )}

          {status === "done" && outputUrl && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Files Merged</p>
                  <p className="text-white font-black text-xl">{files.length}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Total Pages</p>
                  <p className="text-white font-black text-xl">{totalPages}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-2xl p-5 text-center">
                  <p className="text-red-400/60 text-xs mb-1">Output Size</p>
                  <p className="text-red-400 font-black text-xl">{formatSize(outputSize)}</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">📎</div>
                <p className="text-white font-bold">Your merged PDF is ready!</p>
                <p className="text-white/40 text-sm mt-1">{totalPages} pages combined into one file</p>
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download="merged.pdf"
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download Merged PDF
                </a>
                <button onClick={reset} className="px-6 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-colors">New</button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-white font-bold text-lg mb-2">Something went wrong</p>
              <p className="text-white/40 text-sm mb-6">Make sure all files are valid PDF documents</p>
              <button onClick={reset} className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">Try Again</button>
            </div>
          )}

          {/* SEO Content */}
          <div className="mt-20 space-y-8 text-white/60 leading-relaxed">
            <div>
              <h2 className="text-white font-black text-2xl mb-4">Why Merge PDF Files?</h2>
              <p>Managing multiple PDF files can be frustrating — sending a report as 5 separate attachments, combining chapters of a book, or merging invoices for accounting. Merging PDFs creates a single, organized document that's easier to share, email, and archive.</p>
              <p className="mt-3">Toolify combines your PDFs instantly in the browser using pdf-lib, a professional-grade PDF library. The merged file preserves the original quality, fonts, and formatting of every page — no quality loss, no re-compression.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Common Uses for PDF Merging</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">Business reports:</strong> Combine multiple department reports into one presentation-ready document.</li>
                <li><strong className="text-white">Invoices & receipts:</strong> Merge monthly invoices for easy accounting and tax filing.</li>
                <li><strong className="text-white">Academic papers:</strong> Combine research chapters, appendices, and references into one submission.</li>
                <li><strong className="text-white">Legal documents:</strong> Merge contracts, signatures, and supporting documents into a complete package.</li>
                <li><strong className="text-white">Photo albums:</strong> Combine scanned photos or documents into a single PDF portfolio.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & Security</h2>
              <p>PDF files often contain sensitive business data, personal information, or confidential documents. Toolify merges all files locally in your browser — nothing is uploaded to any server. This makes it the safest way to merge PDFs containing private or sensitive content.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Merge PDFs — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload PDFs", desc: "Drop multiple PDF files at once" },
                { step: "2", title: "Reorder", desc: "Use arrows to set the right order" },
                { step: "3", title: "Merge", desc: "Click Merge and wait a moment" },
                { step: "4", title: "Download", desc: "Save your combined PDF file" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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