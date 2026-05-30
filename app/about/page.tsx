export default function About() {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent"> GET TOOLIFY</span>
            <span className="text-white/20 text-xs font-mono mt-1">.app</span>
          </a>
          <a href="/" className="text-white/40 text-sm hover:text-white transition-colors">← Back to Tools</a>
        </nav>
  
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-3xl mx-auto mb-4">⚡</div>
            <h1 className="text-4xl font-black text-white mb-4">About Get Toolify</h1>
            <p className="text-white/50 text-lg max-w-xl mx-auto">
              We believe powerful file tools should be free, fast, and private — for everyone.
            </p>
          </div>
  
          <div className="space-y-12">
            {/* Mission */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
              <h2 className="text-xl font-black text-white mb-4">Our Mission</h2>
              <p className="text-white/60 leading-relaxed">
                Get Toolify was built with a simple idea: everyone deserves access to professional-grade file tools without paying expensive subscriptions or uploading their private files to unknown servers.
              </p>
              <p className="text-white/60 leading-relaxed mt-4">
                We process everything directly in your browser using WebAssembly and modern web technologies. Your files never leave your device — not even for a second.
              </p>
            </div>
  
            {/* What we offer */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
              <h2 className="text-xl font-black text-white mb-4">What We Offer</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { icon: "🎬", title: "Video Tools", desc: "Compress, convert, trim, and extract audio from videos" },
                  { icon: "🖼️", title: "Image Tools", desc: "Compress, resize, convert, and remove backgrounds" },
                  { icon: "📄", title: "PDF Tools", desc: "Merge, split, compress, convert PDFs and more" },
                ].map((item) => (
                  <div key={item.title} className="bg-white/5 rounded-xl p-4">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h3 className="text-white font-bold mb-1">{item.title}</h3>
                    <p className="text-white/40 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
  
            {/* Privacy first */}
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-8">
              <h2 className="text-xl font-black text-white mb-4">🔒 Privacy First</h2>
              <p className="text-white/60 leading-relaxed">
                Unlike most online tools, Get Toolify processes all files directly in your browser. We never upload, store, or analyze your files. What happens on your device, stays on your device.
              </p>
            </div>
  
            {/* Who built this */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8">
              <h2 className="text-xl font-black text-white mb-4">Who Built This</h2>
              <p className="text-white/60 leading-relaxed">
                Get Toolify was created by <span className="text-white font-bold">Murat Yüzügüldü</span>, an independent developer passionate about building tools that respect users' privacy and time.
              </p>
              <p className="text-white/60 leading-relaxed mt-4">
                Have a question or suggestion? We'd love to hear from you. Reach us at{" "}
                <a href="mailto:gettoolify@gmail.com" className="text-orange-400 hover:underline">gettoolify@gmail.com</a>
              </p>
            </div>
          </div>
        </div>
  
        <footer className="border-t border-white/5 px-6 py-8 max-w-4xl mx-auto flex items-center justify-between text-white/20 text-sm">
          <span className="font-black text-white/40">GET TOOLIFY</span>
          <div className="flex gap-6">
            <a href="/privacy" className="hover:text-white/40 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white/40 transition-colors">Terms of Service</a>
            <a href="/contact" className="hover:text-white/40 transition-colors">Contact</a>
          </div>
        </footer>
      </main>
    );
  }