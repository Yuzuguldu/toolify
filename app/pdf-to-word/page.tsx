"use client";

import { useState, useRef, useCallback } from "react";
import JSZip from "jszip";
import { Document, Packer, Paragraph, TextRun } from "docx";

const faqItems = [
  {
    q: "Does the converter preserve formatting?",
    a: "Toolify extracts text content from your PDF and creates a clean Word document. Basic text formatting like paragraphs and line breaks are preserved. However, complex layouts, tables, images, headers/footers, and decorative elements may not transfer perfectly — this is a limitation of browser-based PDF conversion.",
  },
  {
    q: "Why is the formatting different from the original PDF?",
    a: "PDFs store content as fixed visual layouts, not as structured text. Converting them back to editable Word format requires re-interpreting the layout, which can result in differences in spacing, fonts, and structure. For perfectly formatted conversions, a desktop application like Adobe Acrobat is recommended.",
  },
  {
    q: "Is my PDF uploaded to your servers?",
    a: "No. Toolify processes PDFs entirely in your browser using PDF.js and JSZip. Your file never leaves your device, ensuring complete privacy — especially important for confidential documents.",
  },
  {
    q: "What types of PDFs work best?",
    a: "Text-based PDFs (created from Word, Excel, or other digital sources) work best. Scanned PDFs that are essentially images of text require OCR (optical character recognition), which is not currently supported. If your PDF was created from a scanner, the extracted text may be empty.",
  },
  {
    q: "Can I edit the Word document after conversion?",
    a: "Yes. The output is a standard DOCX file that can be opened and edited in Microsoft Word, Google Docs, LibreOffice, and any other Word-compatible application.",
  },
  {
    q: "Is there a page limit for PDF conversion?",
    a: "There is no strict page limit, but very large PDFs (100+ pages) may take longer to process depending on your device. For best performance, convert large PDFs in smaller sections if needed.",
  },
];

export default function PdfToWord() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFile = (f: File) => {
    if (f.type !== "application/pdf") { alert("Please upload a PDF file."); return; }
    setFile(f); setOutputUrl(null); setStatus("idle");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const extractTextFromPdf = async (arrayBuffer: ArrayBuffer): Promise<{ text: string; pages: number }> => {
    const zip = await JSZip.loadAsync(arrayBuffer).catch(() => null);
    if (!zip) return { text: "", pages: 0 };

    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    const pages = pdf.numPages;
    const textParts: string[] = [];

    for (let i = 1; i <= pages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(" ");
      textParts.push(pageText);
    }

    return { text: textParts.join("\n\n"), pages };
  };

  const convert = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
      const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      const pages = pdf.numPages;
      setPageCount(pages);

      const paragraphs: Paragraph[] = [];
      for (let i = 1; i <= pages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item: any) => item.str).join(" ").trim();
        if (pageText) {
          pageText.split("\n").forEach((line) => {
            paragraphs.push(new Paragraph({ children: [new TextRun(line)] }));
          });
          if (i < pages) paragraphs.push(new Paragraph({ children: [new TextRun("")] }));
        }
      }

      setWordCount(0);
     

      const doc = new Document({
        sections: [{ properties: {}, children: paragraphs }],
      });
      const blob = await Packer.toBlob(doc);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => {
    setFile(null); setOutputUrl(null); setStatus("idle"); setPageCount(0); setWordCount(0);
  };

  const outputFileName = file ? file.name.replace(/\.pdf$/i, ".docx") : "converted.docx";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "PDF to Word Converter – Toolify",
    "url": "https://gettoolify.app/pdf-to-word",
    "description": "Free online PDF to Word converter. Extract text from PDF and download as DOCX instantly in your browser.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-3xl mx-auto mb-4">📄</div>
            <h1 className="text-4xl font-black text-white mb-3">PDF to Word Converter</h1>
            <p className="text-white/40 max-w-md mx-auto">Convert PDF documents to editable Word files instantly. No uploads, no signup — processed in your browser.</p>
          </div>

          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl px-5 py-4 mb-6 text-yellow-300 text-sm">
            ⚠️ <b>Note:</b> Text content is extracted. Complex layouts, images, and tables may be simplified.
          </div>

          {status === "idle" && (
            <div className="space-y-6">
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !file && fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-3xl p-12 text-center transition-all duration-300
                  ${isDragging ? "border-blue-500 bg-blue-500/10" : "border-white/10 hover:border-white/30 hover:bg-white/[0.02]"}
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
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-2xl">📄</div>
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
                <button onClick={convert}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Convert to Word →
                </button>
              )}
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Converting PDF to Word...</p>
              <p className="text-white/40 text-sm mt-2">Extracting text from all pages</p>
            </div>
          )}

          {status === "done" && outputUrl && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">PDF Size</p>
                  <p className="text-white font-black text-xl">{formatSize(file?.size || 0)}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Pages</p>
                  <p className="text-white font-black text-xl">{pageCount}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600/20 to-blue-400/20 border border-blue-500/30 rounded-2xl p-5 text-center">
                  <p className="text-blue-400/60 text-xs mb-1">Format</p>
                  <p className="text-blue-400 font-black text-xl">DOCX</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">📝</div>
                <p className="text-white font-bold">Your Word document is ready!</p>
                <p className="text-white/40 text-sm mt-1">Open with Microsoft Word, Google Docs, or LibreOffice</p>
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={outputFileName}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download DOCX
                </a>
                <button onClick={reset} className="px-6 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-colors">New</button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-white font-bold text-lg mb-2">Something went wrong</p>
              <p className="text-white/40 text-sm mb-6">Make sure your PDF contains selectable text (not a scanned image)</p>
              <button onClick={reset} className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">Try Again</button>
            </div>
          )}

          {/* SEO Content */}
          <div className="mt-20 space-y-8 text-white/60 leading-relaxed">
            <div>
              <h2 className="text-white font-black text-2xl mb-4">Why Convert PDF to Word?</h2>
              <p>PDFs are great for sharing documents — they look the same on every device and can't be accidentally edited. But when you need to actually edit the content, update information, or reuse text from a PDF, you need it in Word format. Converting to DOCX lets you edit freely in Microsoft Word, Google Docs, or any word processor.</p>
              <p className="mt-3">Toolify extracts text content from your PDF and creates a clean DOCX file instantly in your browser. No file uploads, no waiting — and your confidential documents stay private on your device.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Text-Based vs Scanned PDFs</h2>
              <p>There are two types of PDFs. Text-based PDFs (created from Word, Excel, or design software) contain actual text data that can be extracted. Scanned PDFs are essentially photos of paper documents — they look like text but are actually images, requiring OCR technology to extract.</p>
              <p className="mt-3">Toolify works best with text-based PDFs. If you can select and copy text in your PDF viewer, it will convert well. Scanned PDFs may produce empty or garbled output without OCR support.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & Security</h2>
              <p>PDF documents often contain sensitive information — contracts, invoices, medical records, or personal data. Toolify processes all conversions locally in your browser, meaning your PDF never reaches any server. This makes it the safest option for converting confidential documents.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Convert PDF to Word — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload PDF", desc: "Drop your PDF or click to browse" },
                { step: "2", title: "Convert", desc: "Click Convert to Word button" },
                { step: "3", title: "Wait", desc: "Text is extracted from all pages" },
                { step: "4", title: "Download", desc: "Save and open your DOCX file" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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