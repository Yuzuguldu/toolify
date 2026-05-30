export default function Contact() {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <nav className="border-b border-white/5 px-6 py-4 flex items-center justify-between max-w-4xl mx-auto">
          <a href="/" className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">GET TOOLIFY</span>
            <span className="text-white/20 text-xs font-mono mt-1">.app</span>
          </a>
          <a href="/" className="text-white/40 text-sm hover:text-white transition-colors">← Back to Tools</a>
        </nav>
  
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="text-center mb-16">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-3xl mx-auto mb-4">✉️</div>
            <h1 className="text-4xl font-black text-white mb-4">Contact Us</h1>
            <p className="text-white/50 text-lg max-w-md mx-auto">
              Have a question, suggestion, or found a bug? We'd love to hear from you.
            </p>
          </div>
  
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Email */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <div className="text-3xl mb-3">📧</div>
              <h3 className="text-white font-black mb-2">Email</h3>
              <p className="text-white/40 text-sm mb-3">For general inquiries and support</p>
              <a href="mailto:gettoolify@gmail.com"
                className="text-orange-400 hover:underline font-bold">
                gettoolify@gmail.com
              </a>
            </div>
  
            {/* Bug report */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <div className="text-3xl mb-3">🐛</div>
              <h3 className="text-white font-black mb-2">Bug Reports</h3>
              <p className="text-white/40 text-sm mb-3">Found something broken? Let us know</p>
              <a href="mailto:gettoolify@gmail.com?subject=Bug Report"
                className="text-orange-400 hover:underline font-bold">
                Report a bug
              </a>
            </div>
  
            {/* Feature request */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <div className="text-3xl mb-3">💡</div>
              <h3 className="text-white font-black mb-2">Feature Requests</h3>
              <p className="text-white/40 text-sm mb-3">Have an idea for a new tool?</p>
              <a href="mailto:gettoolify@gmail.com?subject=Feature Request"
                className="text-orange-400 hover:underline font-bold">
                Suggest a feature
              </a>
            </div>
  
            {/* Business */}
            <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6">
              <div className="text-3xl mb-3">💼</div>
              <h3 className="text-white font-black mb-2">Business Inquiries</h3>
              <p className="text-white/40 text-sm mb-3">Partnerships and collaborations</p>
              <a href="mailto:gettoolify@gmail.com?subject=Business Inquiry"
                className="text-orange-400 hover:underline font-bold">
                Get in touch
              </a>
            </div>
          </div>
  
          {/* Response time */}
          <div className="bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/20 rounded-2xl p-6 text-center">
            <p className="text-white font-bold mb-1">⏱️ Response Time</p>
            <p className="text-white/50 text-sm">We typically respond within 24-48 hours on business days.</p>
          </div>
        </div>
  
        <footer className="border-t border-white/5 px-6 py-8 max-w-4xl mx-auto flex items-center justify-between text-white/20 text-sm">
          <span className="font-black text-white/40">GET TOOLIFY</span>
          <div className="flex gap-6">
            <a href="/about" className="hover:text-white/40 transition-colors">About</a>
            <a href="/privacy" className="hover:text-white/40 transition-colors">Privacy Policy</a>
            <a href="/terms" className="hover:text-white/40 transition-colors">Terms of Service</a>
          </div>
        </footer>
      </main>
    );
  }