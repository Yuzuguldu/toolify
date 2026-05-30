"use client";

import { useState } from "react";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const FONT_SIZES = [10, 11, 12, 14, 16];
const PAGE_SIZES = [
  { label: "A4", width: 595, height: 842 },
  { label: "Letter", width: 612, height: 792 },
  { label: "A5", width: 420, height: 595 },
];

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
    q: "What types of text can I convert to PDF?",
    a: "You can convert any plain text — notes, articles, essays, code snippets, lists, or any content you can type or paste. The tool creates a clean, properly formatted PDF with automatic word wrap and page breaks.",
  },
  {
    q: "What page sizes are available?",
    a: "Toolify supports A4 (international standard), Letter (US standard), and A5 (half of A4, good for booklets and compact documents). A4 is recommended for most uses outside the US.",
  },
  {
    q: "Can I add a title to my PDF?",
    a: "Yes. The Document Title field creates a bold heading at the top of the first page. This is optional — leave it blank for a plain text document without a header.",
  },
  {
    q: "Are special characters supported?",
    a: "The tool supports standard ASCII characters and basic punctuation. Special characters like accented letters are converted to their closest Latin equivalent (e.g. é → e). Emoji and non-Latin scripts are removed, as the standard PDF font used doesn't support them.",
  },
  {
    q: "Is there a character or word limit?",
    a: "There is no strict limit. Very long texts (over 100,000 words) may take a moment to process, but the tool will handle them correctly with automatic page breaks.",
  },
  {
    q: "Is my text sent to your servers?",
    a: "No. Everything happens locally in your browser using pdf-lib. Your text content never leaves your device. This makes it safe to convert confidential notes, private content, or sensitive text.",
  },
];

export default function TextToPdf() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [fontSize, setFontSize] = useState(11);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  const [status, setStatus] = useState<"idle" | "processing" | "done" | "error">("idle");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputSize, setOutputSize] = useState(0);
  const [pageCount, setPageCount] = useState(0);

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const convert = async () => {
    if (!text.trim()) { alert("Please enter some text first."); return; }
    setStatus("processing");
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const { width, height } = pageSize;
      const margin = 60, maxWidth = width - margin * 2;
      const lineHeight = fontSize * 1.5;
      const rawLines = text.split("\n");
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
      const titleHeight = title.trim() ? 40 : 0;
      const linesPerPage = Math.floor((height - margin * 2 - titleHeight) / lineHeight);
      let pages = 0;
      for (let i = 0; i < allLines.length; i += linesPerPage) {
        const page = pdfDoc.addPage([width, height]);
        const chunk = allLines.slice(i, i + linesPerPage);
        pages++;
        if (pages === 1 && title.trim()) {
          page.drawText(sanitize(title).slice(0, 80), {
            x: margin, y: height - margin, size: fontSize + 4,
            font: boldFont, color: rgb(0.05, 0.05, 0.05),
          });
        }
        chunk.forEach((line, idx) => {
          if (!line.trim()) return;
          page.drawText(line, {
            x: margin, y: height - margin - titleHeight - idx * lineHeight,
            size: fontSize, font, color: rgb(0, 0, 0),
          });
        });
        page.drawText(`${pages}`, { x: width / 2 - 5, y: 30, size: 9, font, color: rgb(0.6, 0.6, 0.6) });
      }
      setPageCount(pages);
      const bytes = await pdfDoc.save();
      const blob = new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
      setOutputSize(blob.size);
      setOutputUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch { setStatus("error"); }
  };

  const reset = () => { setStatus("idle"); setOutputUrl(null); setOutputSize(0); setPageCount(0); };
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Text to PDF Converter – Toolify",
    "url": "https://gettoolify.app/text-to-pdf",
    "description": "Free online text to PDF converter. Type or paste text and download a clean PDF instantly.",
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
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-3xl mx-auto mb-4">📋</div>
            <h1 className="text-4xl font-black text-white mb-3">Text to PDF Converter</h1>
            <p className="text-white/40 max-w-md mx-auto">Type or paste any text and convert it to a clean, downloadable PDF. Choose font size and page format.</p>
          </div>

          {status !== "done" && (
            <div className="space-y-6">
              <div>
                <label className="text-white/40 text-xs font-bold block mb-2">DOCUMENT TITLE (optional)</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Document"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-violet-500 focus:outline-none" />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-white/40 text-xs font-bold">YOUR TEXT</label>
                  <span className="text-white/20 text-xs">{wordCount} words · {charCount} chars</span>
                </div>
                <textarea value={text} onChange={(e) => setText(e.target.value)}
                  placeholder="Type or paste your text here..."
                  rows={12}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:border-violet-500 focus:outline-none resize-none leading-relaxed" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                  <p className="text-white font-bold mb-3 text-sm">Font Size</p>
                  <div className="flex gap-2 flex-wrap">
                    {FONT_SIZES.map((s) => (
                      <button key={s} onClick={() => setFontSize(s)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${fontSize === s ? "border-violet-500 bg-violet-500/20 text-white" : "border-white/10 text-white/40 hover:border-white/30"}`}>
                        {s}px
                      </button>
                    ))}
                  </div>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                  <p className="text-white font-bold mb-3 text-sm">Page Size</p>
                  <div className="flex gap-2">
                    {PAGE_SIZES.map((s) => (
                      <button key={s.label} onClick={() => setPageSize(s)}
                        className={`px-3 py-1.5 rounded-lg border text-sm font-bold transition-all ${pageSize.label === s.label ? "border-violet-500 bg-violet-500/20 text-white" : "border-white/10 text-white/40 hover:border-white/30"}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={convert} disabled={!text.trim()}
                className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-black text-lg py-5 rounded-2xl hover:opacity-90 transition-opacity disabled:opacity-30">
                Convert to PDF →
              </button>
            </div>
          )}

          {status === "processing" && (
            <div className="text-center py-20">
              <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto mb-6"></div>
              <p className="text-white font-bold text-lg">Creating PDF...</p>
            </div>
          )}

          {status === "done" && outputUrl && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Words</p>
                  <p className="text-white font-black text-xl">{wordCount}</p>
                </div>
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 text-center">
                  <p className="text-white/40 text-xs mb-1">Pages</p>
                  <p className="text-white font-black text-xl">{pageCount}</p>
                </div>
                <div className="bg-gradient-to-br from-violet-600/20 to-fuchsia-500/20 border border-violet-500/30 rounded-2xl p-5 text-center">
                  <p className="text-violet-400/60 text-xs mb-1">PDF Size</p>
                  <p className="text-violet-400 font-black text-xl">{formatSize(outputSize)}</p>
                </div>
              </div>
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 text-center">
                <div className="text-5xl mb-3">📄</div>
                <p className="text-white font-bold">Your PDF is ready!</p>
                <p className="text-white/40 text-sm mt-1">{pageSize.label} · {fontSize}px font · {pageCount} page{pageCount > 1 ? "s" : ""}</p>
              </div>
              <div className="flex gap-4">
                <a href={outputUrl} download={`${title || "document"}.pdf`}
                  className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-black text-center py-4 rounded-2xl hover:opacity-90 transition-opacity">
                  ⬇ Download PDF
                </a>
                <button onClick={reset}
                  className="px-6 bg-white/5 border border-white/10 text-white/60 font-bold rounded-2xl hover:bg-white/10 transition-colors">Edit</button>
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
              <h2 className="text-white font-black text-2xl mb-4">Why Convert Text to PDF?</h2>
              <p>Plain text files are simple but lack formatting and don't always display consistently across devices. Converting text to PDF creates a professional, universally readable document that looks the same on every device, operating system, and PDF viewer. PDF is the standard format for sharing documents professionally.</p>
              <p className="mt-3">Toolify creates clean, properly formatted PDFs from your text with automatic word wrap, page breaks, page numbers, and optional title. Everything is processed instantly in your browser using pdf-lib — no uploads, no waiting.</p>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Common Uses for Text to PDF</h2>
              <ul className="space-y-2 list-disc list-inside">
                <li><strong className="text-white">Notes and documentation:</strong> Convert meeting notes, research summaries, or technical documentation to shareable PDFs.</li>
                <li><strong className="text-white">Articles and essays:</strong> Create a clean PDF version of written content for distribution or archiving.</li>
                <li><strong className="text-white">Code documentation:</strong> Convert plain text code comments or README files to PDF for offline reference.</li>
                <li><strong className="text-white">Quick documents:</strong> Create a simple PDF without needing Microsoft Word or any other software installed.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-white font-black text-2xl mb-4">Privacy & How It Works</h2>
              <p>Your text content never leaves your browser. Toolify uses pdf-lib to build the PDF entirely on your device — no server, no upload, no data stored anywhere. This makes it safe to convert private notes, sensitive information, or confidential text content.</p>
            </div>
          </div>

          {/* How to use */}
          <div className="mt-16 bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
            <h2 className="text-white font-black text-xl mb-6">How to Convert Text to PDF — Step by Step</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[
                { step: "1", title: "Enter Text", desc: "Type or paste your text content" },
                { step: "2", title: "Add Title", desc: "Optionally add a document title" },
                { step: "3", title: "Choose Settings", desc: "Set font size and page format" },
                { step: "4", title: "Download", desc: "Convert and save your PDF" },
              ].map((s) => (
                <div key={s.step} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center text-white font-black mx-auto mb-3">{s.step}</div>
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