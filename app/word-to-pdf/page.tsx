"use client";

import { useState, useRef, useCallback } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";

const sanitize = (str: string) =>
  str
    .replace(/ğ/g, "g").replace(/Ğ/g, "G")
    .replace(/ü/g, "u").replace(/Ü/g, "U")
    .replace(/ş/g, "s").replace(/Ş/g, "S")
    .replace(/ı/g, "i").replace(/İ/g, "I")
    .replace(/ö/g, "o").replace(/Ö/g, "O")
    .replace(/ç/g, "c").replace(/Ç/g, "C")
    .replace(/[^\x20-\x7E]/g, "");

const faqItems = [
  {
    q: "Does the converter preserve Word formatting?",
    a: "Toolify extracts text content from your Word document and creates a clean, readable PDF. Basic paragraph structure is preserved. However, complex formatting like tables, images, columns, headers/footers, and decorative elements may not transfer — this is a limitation of browser-based conversion without a full Word rendering engine.",
  },
  {
    q: "What Word file formats are supported?",
    a: "Toolify supports .docx format (Word 2007 and later). The older .doc format (Word 97-2003) may work but with limited compatibility. For best results, use modern .docx files.",
  },
  {
    q: "Is my Word document uploaded to your servers?",
    a: "No. Toolify reads your Word file locally in your browser using JSZip to parse the DOCX format. Your document never leaves your device — this is essential for confidential business documents, legal files, or personal content.",
  },
  {
    q: "Why do some characters look different in the PDF?",
    a: "Toolify uses standard PDF fonts (Helvetica) which support the Latin alphabet. Special characters, non-Latin scripts, or unusual symbols may be converted to their closest Latin equivalent or removed. This is a browser-based conversion limitation.",
  },
  {
    q: "Can I convert password-protected Word files?",
    a: "Password-protected Word documents cannot be converted without first removing the password. Open the document in Microsoft Word, remove the password protection, save, then convert with Toolify.",
  },
  {
    q: "What is the maximum file size for Word to PDF conversion?",
    a: "There is no strict limit, but very large Word files (over 50MB) may be slow to process. Most standard documents convert in seconds regardless of page count.",
  },
];

export default function WordToPdf() {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const handleFile = (f: File) => {
    const valid = f.name.endsWith(".docx") || f.name.endsWith(".doc");
    if (!valid) { alert("Please upload a .docx or .doc file."); return; }
    setFile(f); setOutputUrl(null); setStatus("idle");
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  const extractTextFromDocx = async (arrayBuffer: ArrayBuffer): Promise<string> => {
    const zip = await JSZip.loadAsync(arrayBuffer);
    const docXml = await zip.file("word/document.xml")?.async("string");
    if (!docXml) throw new Error("Not a valid docx file");
    const paragraphs: string[] = [];
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(docXml, "application/xml");
    const paras = xmlDoc.getElementsByTagNameNS("*", "p");
    for (const para of Array.from(paras)) {
      const runs = para.getElementsByTagNameNS("*", "t");
      let paraText = "";
      for (const run of Array.from(runs)) paraText += run.textContent || "";
      paragraphs.push(paraText);
    }
    return paragraphs.join("\n");
  };

  const convert = async () => {
    if (!file) return;
    setStatus("processing");
    try {
      const arrayBuffer = await file.arrayBuffer();
      const rawText = await extractTextFromDocx(arrayBuffer);
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const pageWidth = 595, pageHeight = 842, margin = 60;
      const maxWidth = pageWidth - margin * 2;
      const lineHeight = 16, fontSize = 11;
      const rawLines = rawText.split("\n");
      const allLines: string[] = [];
      for (const line of rawLines) {
        const safeLine = sanitize(line);
        if (safeLine.trim() === "") { allLines.push(""); continue; }
        const words = safeLine.split(" ");
        let currentLine = "";
        for (const word of words) {
          if (font.widthOfTextAtSize(word, fontSize) > maxWidth) {
            if (currentLine) { allLines.push(currentLine); currentLine = ""; }
            let chunk = "";
            for (const char of word) {
              if (font.widthOfTextAtSize(chunk + char, fontSize) > maxWidth) { allLines.push(chunk); chunk = char; }
              else chunk += char;
            }
            if (chunk) currentLine = chunk;
            continue;
          }
          const testLine = currentLine ? currentLine + " " + word : word;
          const w = font.widthOfTextAtSize(testLine, fontSize);
          if (w > maxWidth && currentLine) { allLines.push(currentLine); currentLine = word; }
          else currentLine = testLine;
        }
        if (currentLine) allLines.push(currentLine);
      }
      const linesPerPage = Math.floor((pageHeight - margin * 2 - 30) / lineHeight);
      let pages = 0;
      for (let i = 0; i < allLines.length; i += linesPerPage) {
        const page = pdfDoc.addPage([pageWidth, pageHeight]);
        const chunk = allLines.slice(i, i + linesPerPage);
        pages++;
        if (pages === 1) {
          const title = sanitize(file.name.replace(/\.(docx|doc)$/, "")).slice(0, 60);
          page.drawText(title, { x: margin, y: pageHeight - margin, size: 14, font: boldFont, color: rgb(0.1, 0.1, 0.1) });
        }
        chunk.forEach((line, idx) => {
          if (!line.trim()) return;
          page.drawText(line, { x: margin, y: pageHeight - margin - 30 - idx * lineHeight, size: fontSize, font, color: rgb(0, 0, 0) });
        });
      }
      setPageCount(pages);
      const bytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setOutputSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => { setFile(null); setOutputUrl(null); setStatus("idle"); setOutputSize(0); setPageCount(0); };
  const outputFileName = file ? file.name.replace(/\.(docx|doc)$/, ".pdf") : "converted.pdf";

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Word to PDF Converter – Toolify",
    "url": "https://gettoolify.app/word-to-pdf",
    "description": "Free online Word to PDF converter. Convert DOCX files to PDF instantly in your browser.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-3xl mx-auto mb-4">📝</div>
            <h1 className="text-4xl font-black text-white mb-3">Word to PDF Converter</h1>
            <p className="text-white/40 max-w-md mx-auto">Convert Word documents to PDF instantly. No uploads — processed in your browser.</p>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl px-5 py-4 mb-6 text-blue-300 text-sm">
            💡 <b>Note:</b> Text content is preserved. Complex layouts, images, and tables may be simplified.
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
                <input ref={fileInputRef} type="file" accept=".docx,.doc" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                {!file ? (
                  <>
                    <div className="text-5xl mb-4">📝</div>
                    <p className="text-white font-bold text-lg mb-2">Drop your Word file here</p>
                    <p className="text-white/40 text-sm">or click to browse · .docx and .doc supported</p>
                  </>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-left">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-2xl">📝</div>
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
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity">
                  Convert to PDF →
                </button>
              )}
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Converting to PDF...</p>
              <p className="text-white/40 text-sm mt-2">Extracting text and building PDF</p>
            </div>
          )}

          {status === "done" && outputUrl && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Word Size</p>
                  <p className="text-white font-black text-xl">{formatSize(file?.size || 0)}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Pages</p>
                  <p className="text-white font-black text-xl">{pageCount}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-600/20 to-indigo-500/20 border border-blue-500/30 rounded-2xl p-5 text-center">
                  <p className="text-blue-400/60 text-xs mb-1">PDF Size</p>
                  <p className="text-blue-400 font-black text-xl">{formatSize(outputSize)}</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">📄</div>
                <p className="text-white font-bold">Your PDF is ready!</p>
                <p className="text-white/40 text-sm mt-1">Open with any PDF viewer</p>
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={outputFileName}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download PDF
                </a>
                <button onClick={reset} className="px-6 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-colors">New</button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">❌</div>
              <p className="text-white font-bold text-lg mb-2">Something went wrong</p>
              <p className="text-white/40 text-sm mb-6">Please try a different Word file</p>
              <button onClick={reset} className="bg-white/10 text-white px-6 py-3 rounded-xl hover:bg-white/20 transition-colors">Try Again</button>
            </div>
          )}

          {/* SEO Content */}
          <div className="mt-20 space-y-8 text-white/60 leading-relaxed">
            <div>
              <h2 className="text-white font-black text-2xl mb-4">Why Convert Word to PDF?</h2>
              <p>PDF is the universal standard for sharing documents — it looks the same on every device, can't be accidentally edited, and is accepted by almost every platform and institution. Converting your Word document to PDF ensures recipients see exactly what you intended, regardless of what software they have installed.</p>
              <p className="mt-3">Toolify converts Word documents to PDF instantly in your browser by extracting text content using JSZip and building a clean PDF with pdf-lib. No server uploads, no waiting, and your documents stay completely private.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">When to Use PDF Instead of Word</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">Job applications:</strong> CVs and cover letters should always be sent as PDF to preserve formatting.</li>
                <li><strong className="text-white">Official documents:</strong> Contracts, invoices, and reports are more professional and tamper-evident in PDF format.</li>
                <li><strong className="text-white">Sharing online:</strong> PDFs open in any browser without requiring Word or LibreOffice.</li>
                <li><strong className="text-white">Printing:</strong> PDFs maintain exact margins, fonts, and layout when printed on any device.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & Security</h2>
              <p>Word documents often contain sensitive business content, personal information, or confidential data. Toolify processes everything locally in your browser — your file never reaches any server. This makes it the safest option for converting private or confidential Word documents to PDF.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Convert Word to PDF — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Upload Word File", desc: "Drop your .docx or .doc file" },
                { step: "2", title: "Convert", desc: "Click Convert to PDF button" },
                { step: "3", title: "Wait", desc: "Text is extracted and PDF built" },
                { step: "4", title: "Download", desc: "Save your PDF file" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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
            🔒 Your files never leave your device · Processed with pdf-lib & JSZip
          </p>
        </div>
      </main>
    </>
  );
}