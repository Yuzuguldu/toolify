"use client";


const features = [
  { icon: "⚡", title: "Unlimited Processing", desc: "No daily limits — process as many files as you need" },
  { icon: "🚫", title: "Ad-Free Experience", desc: "Clean interface with zero advertisements" },
  { icon: "📦", title: "Larger File Sizes", desc: "Up to 500MB per file instead of 100MB" },
  { icon: "⚙️", title: "Batch Processing", desc: "Process multiple files at once" },
  { icon: "🔒", title: "Priority Privacy", desc: "Your files are always processed first" },
  { icon: "🎯", title: "Advanced Settings", desc: "More control over quality and output options" },
];

  export default function ProPage() {
 

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
        <a href="/" className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">GET TOOLIFY</span>
          <span className="text-white/20 text-xs font-mono mt-1">.app</span>
        </a>
        <a href="/" className="text-white/40 text-sm hover:text-white transition-colors">← All Tools</a>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/20 to-pink-500/20 border border-orange-500/30 rounded-full px-4 py-2 text-sm font-bold text-orange-400 mb-6">
            ⚡ Coming Soon
          </div>
          <h1 className="text-5xl font-black text-white mb-4">
            Get Toolify{" "}
            <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">Pro</span>
          </h1>
          <p className="text-white/50 text-xl max-w-lg mx-auto">
            The same tools you love, without limits. No ads, no restrictions — just pure productivity.
          </p>
        </div>

        {/* Pricing preview */}
        <div className="bg-gradient-to-br from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-3xl p-8 text-center mb-16">
          <p className="text-white/40 text-sm font-bold mb-2">LAUNCHING SOON AT</p>
          <div className="flex items-end justify-center gap-3 mb-2">
            <span className="text-6xl font-black text-white">$3.99</span>
            <span className="text-white/40 text-xl mb-3">/month</span>
          </div>
          <p className="text-white/30 text-sm">or $29.99/year — save 2 months free</p>
          <div className="mt-6 flex items-center justify-center gap-2 text-green-400 text-sm font-bold">
            <span>✅</span>
            <span>Cancel anytime · No credit card required</span>
          </div>
        </div>

        {/* Features */}
        <div className="mb-16">
          <h2 className="text-white font-black text-2xl text-center mb-8">Everything in Pro</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((f, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 flex items-start gap-4">
                <span className="text-3xl">{f.icon}</span>
                <div>
                  <p className="text-white font-bold mb-1">{f.title}</p>
                  <p className="text-white/40 text-sm">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Free vs Pro */}
        <div className="mb-16">
          <h2 className="text-white font-black text-2xl text-center mb-8">Free vs Pro</h2>
          <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
            <div className="grid grid-cols-3 border-b border-white/[0.08]">
              <div className="p-4 text-white/40 text-sm font-bold">Feature</div>
              <div className="p-4 text-center text-white/40 text-sm font-bold border-x border-white/[0.08]">Free</div>
              <div className="p-4 text-center text-orange-400 text-sm font-bold">Pro</div>
            </div>
            {[
              { feature: "All 16 tools", free: "✅", pro: "✅" },
              { feature: "Daily processing limit", free: "10/day", pro: "Unlimited" },
              { feature: "Max file size", free: "100MB", pro: "500MB" },
              { feature: "Advertisements", free: "Yes", pro: "None" },
              { feature: "Batch processing", free: "❌", pro: "✅" },
              { feature: "Priority support", free: "❌", pro: "✅" },
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 border-b border-white/[0.05] last:border-0">
                <div className="p-4 text-white/60 text-sm">{row.feature}</div>
                <div className="p-4 text-center text-white/40 text-sm border-x border-white/[0.05]">{row.free}</div>
                <div className="p-4 text-center text-orange-400 text-sm font-bold">{row.pro}</div>
              </div>
            ))}
          </div>
        </div>

      
      </div>

      <footer className="border-t border-white/5 px-6 py-8 max-w-4xl mx-auto flex items-center justify-between text-white/20 text-sm">
        <span className="font-black text-white/40">GET TOOLIFY</span>
        <div className="flex gap-6">
          <a href="/about" className="hover:text-white/40 transition-colors">About</a>
          <a href="/privacy" className="hover:text-white/40 transition-colors">Privacy</a>
          <a href="/contact" className="hover:text-white/40 transition-colors">Contact</a>
        </div>
      </footer>
    </main>
  );
}