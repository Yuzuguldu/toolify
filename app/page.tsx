import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://gettoolify.app",
  },
};

export default function Home() {
 
  const videoTools = [
    {
      icon: "🎬",
      title: "Compress Video",
      description: "Reduce video file size without losing quality",
      href: "/compress-video",
      color: "from-orange-500 to-red-500",
      badge: "Popular",
    },
    {
      icon: "🎵",
      title: "Video to MP3",
      description: "Extract audio from any video file instantly",
      href: "/video-to-mp3",
      color: "from-purple-500 to-pink-500",
      badge: null,
    },
    {
      icon: "🎞️",
      title: "Video to GIF",
      description: "Convert video clips into animated GIFs",
      href: "/video-to-gif",
      color: "from-yellow-500 to-orange-500",
      badge: null,
    },
    {
      icon: "🔄",
      title: "Convert Video",
      description: "Convert between MP4, AVI, MOV, WEBM and more",
      href: "/convert-video",
      color: "from-teal-500 to-blue-500",
      badge: null,
    },
    {
      icon: "✂️",
      title: "Trim Video",
      description: "Cut and trim your video to the perfect length",
      href: "/trim-video",
      color: "from-red-500 to-pink-500",
      badge: null,
    },
  ];

  const imageTools = [
    {
      icon: "🖼️",
      title: "Compress Image",
      description: "Shrink JPG, PNG and WEBP files in seconds",
      href: "/compress-image",
      color: "from-blue-500 to-cyan-500",
      badge: "Popular",
    },
    {
      icon: "📐",
      title: "Resize Image",
      description: "Change image dimensions to any size you need",
      href: "/resize-image",
      color: "from-green-500 to-emerald-500",
      badge: null,
    },
    {
      icon: "🔁",
      title: "Convert Image",
      description: "Convert between JPG, PNG, WEBP, GIF formats",
      href: "/convert-image",
      color: "from-indigo-500 to-purple-500",
      badge: null,
    },
    {
      icon: "🪄",
      title: "Remove Background",
      description: "Remove image background instantly for free",
      href: "/remove-background",
      color: "from-pink-500 to-rose-500",
      badge: "New",
    },
  ];

  const pdfTools = [
    {
      icon: "📄",
      title: "PDF to Word",
      description: "Convert PDF documents to editable Word files",
      href: "/pdf-to-word",
      color: "from-blue-600 to-blue-400",
      badge: "Popular",
    },
    {
      icon: "🔗",
      title: "Merge PDF",
      description: "Combine multiple PDF files into one document",
      href: "/merge-pdf",
      color: "from-orange-500 to-yellow-400",
      badge: null,
    },
    {
      icon: "✂️",
      title: "Split PDF",
      description: "Split a PDF into separate pages or sections",
      href: "/split-pdf",
      color: "from-red-500 to-orange-400",
      badge: null,
    },
    {
      icon: "📦",
      title: "Compress PDF",
      description: "Reduce PDF file size while keeping quality",
      href: "/compress-pdf",
      color: "from-green-600 to-teal-400",
      badge: null,
    },
    {
      icon: "🖼️",
      title: "PDF to Image",
      description: "Convert PDF pages to JPG or PNG images",
      href: "/pdf-to-image",
      color: "from-purple-600 to-pink-400",
      badge: null,
    },
    {
      icon: "📝",
      title: "Word to PDF",
      description: "Convert Word documents to PDF instantly",
      href: "/word-to-pdf",
      color: "from-blue-600 to-indigo-500",
      badge: null,
    },
    {
      icon: "📋",
      title: "Text to PDF",
      description: "Convert any text to a clean PDF document",
      href: "/text-to-pdf",
      color: "from-violet-600 to-fuchsia-500",
      badge: "New",
    },
  ];

  const ToolCard = ({ tool }: { tool: typeof videoTools[0] }) => (
    <a
      href={tool.href}
      className="group relative bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 hover:bg-white/[0.07] hover:border-white/20 transition-all duration-300"
    >
      {tool.badge && (
        <span className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r ${tool.color} text-white`}>
          {tool.badge}
        </span>
      )}
      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300`}>
        {tool.icon}
      </div>
      <h3 className="text-white font-bold text-lg mb-1">{tool.title}</h3>
      <p className="text-white/40 text-sm leading-relaxed">{tool.description}</p>
      <div className="mt-4 flex items-center gap-1 text-white/20 text-xs group-hover:text-white/50 transition-colors">
        Use tool
        <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
      </div>
    </a>
  );

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      {/* NAV */}
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
            GET TOOLIFY
          </span>
          <span className="text-white/20 text-xs font-mono mt-1">.app</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-white/50">
          <a href="#tools" className="hover:text-white transition-colors">Tools</a>
          <a href="/about" className="hover:text-white transition-colors">About</a>
          <a href="/pro" className="bg-white text-black px-4 py-1.5 rounded-full text-xs font-bold hover:bg-white/90 transition-colors">
           Pro — Free
          </a>
        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-xs text-white/60 mb-8">
          <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
          100% Free · No signup · Files never leave your device
        </div>

        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6">
          <span className="text-white">All your</span>
          <br />
          <span className="bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500 bg-clip-text text-transparent">
            file tools.
          </span>
          <br />
          <span className="text-white/30">One place.</span>
        </h1>

        <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
          Compress, convert, and edit videos, images and PDFs — instantly in your browser.
          No uploads. No waiting. No cost.
        </p>

        <a href="#tools" className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition-opacity text-sm">
          Start for free ↓
        </a>

        <div className="flex items-center justify-center gap-12 mt-16 text-center">
          {[
            { value: "100%", label: "Free forever" },
            { value: "0s", label: "Upload time" },
            { value: "16+", label: "Tools available" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-black text-white">{stat.value}</div>
              <div className="text-white/40 text-sm mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TOOLS */}
      <section id="tools" className="max-w-7xl mx-auto px-6 pb-24 space-y-16">

        {/* Video Tools */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-sm">🎬</div>
            <h2 className="text-white font-black text-xl">Video Tools</h2>
            <span className="text-white/20 text-xs font-mono">{videoTools.length} tools</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {videoTools.map((tool) => <ToolCard key={tool.href} tool={tool} />)}
          </div>
        </div>

        {/* Image Tools */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-sm">🖼️</div>
            <h2 className="text-white font-black text-xl">Image Tools</h2>
            <span className="text-white/20 text-xs font-mono">{imageTools.length} tools</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {imageTools.map((tool) => <ToolCard key={tool.href} tool={tool} />)}
          </div>
        </div>

        {/* PDF Tools */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center text-sm">📄</div>
            <h2 className="text-white font-black text-xl">PDF Tools</h2>
            <span className="text-white/20 text-xs font-mono">{pdfTools.length} tools</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pdfTools.map((tool) => <ToolCard key={tool.href} tool={tool} />)}
          </div>
        </div>

      </section>

      {/* PRIVACY */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-3xl p-10 text-center">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-2xl font-black text-white mb-3">Your files never leave your device</h2>
          <p className="text-white/50 max-w-lg mx-auto text-sm">
            All processing happens directly in your browser using WebAssembly technology.
            We never see, store, or touch your files. Ever.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 px-6 py-8 max-w-7xl mx-auto text-white/70 text-sm">
        <div className="flex items-center justify-between mb-4">
          <span className="font-black text-white/100 text-lg">GET TOOLIFY</span>
          <span>© 2026 · Free forever</span>
        </div>
        <div className="flex flex-wrap gap-6 text-xs">
          <a href="/about" className="hover:text-white/50 transition-colors">About</a>
          <a href="/privacy" className="hover:text-white/50 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-white/50 transition-colors">Terms of Service</a>
          <a href="/contact" className="hover:text-white/50 transition-colors">Contact</a>
        </div>
      </footer>
    </main>
  );
}