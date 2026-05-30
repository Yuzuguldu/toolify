export default function Terms() {
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
          <h1 className="text-4xl font-black text-white mb-4">Terms of Service</h1>
          <p className="text-white/40 text-sm mb-12">Last updated: May 2025</p>
  
          <div className="space-y-8 text-white/60 leading-relaxed">
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">1. Acceptance of Terms</h2>
              <p>By accessing and using Get Toolify, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">2. Description of Service</h2>
              <p>Get Toolify provides free online tools for processing video, image, and PDF files. All processing is performed client-side in your browser. We reserve the right to modify, suspend, or discontinue any part of the service at any time.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">3. User Responsibilities</h2>
              <p>You agree to use Get Toolify only for lawful purposes. You are solely responsible for:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>The files you process using our tools</li>
                <li>Ensuring you have the right to process and modify the files</li>
                <li>Not using our service to process copyrighted material without permission</li>
                <li>Not using our service for any illegal or harmful activities</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">4. Intellectual Property</h2>
              <p>The Get Toolify name, logo, website design, and underlying code are the intellectual property of Murat Yüzügüldü. You may not copy, reproduce, or distribute any part of Get Toolify without prior written permission.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">5. Disclaimer of Warranties</h2>
              <p>Get Toolify is provided "as is" without any warranties, express or implied. We do not guarantee that the service will be uninterrupted, error-free, or that the results will meet your requirements. Use the service at your own risk.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">6. Limitation of Liability</h2>
              <p>To the fullest extent permitted by law, Get Toolify and its owner shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the service, including but not limited to loss of data or files.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">7. Advertising</h2>
              <p>Get Toolify is free to use and is supported by advertising. By using our service, you agree that we may display advertisements on our website.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">8. Changes to Terms</h2>
              <p>We reserve the right to update these Terms of Service at any time. Continued use of the service after changes constitutes acceptance of the new terms.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">9. Contact</h2>
              <p>For any questions regarding these Terms of Service, contact us at:</p>
              <p className="mt-2"><a href="mailto:gettoolify@gmail.com" className="text-orange-400 hover:underline">gettoolify@gmail.com</a></p>
              <p className="mt-1">Murat Yüzügüldü</p>
            </section>
          </div>
        </div>
  
        <footer className="border-t border-white/5 px-6 py-8 max-w-4xl mx-auto flex items-center justify-between text-white/20 text-sm">
          <span className="font-black text-white/40">GET TOOLIFY</span>
          <div className="flex gap-6">
            <a href="/about" className="hover:text-white/40 transition-colors">About</a>
            <a href="/privacy" className="hover:text-white/40 transition-colors">Privacy Policy</a>
            <a href="/contact" className="hover:text-white/40 transition-colors">Contact</a>
          </div>
        </footer>
      </main>
    );
  }