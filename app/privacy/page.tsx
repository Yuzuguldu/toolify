export default function Privacy() {
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
          <h1 className="text-4xl font-black text-white mb-4">Privacy Policy</h1>
          <p className="text-white/40 text-sm mb-12">Last updated: May 2025</p>
  
          <div className="space-y-8 text-white/60 leading-relaxed">
  
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl p-6">
              <p className="text-green-400 font-bold text-lg mb-2">🔒 The Short Version</p>
              <p>Your files never leave your device. We don't upload, store, or process your files on our servers. Everything happens locally in your browser.</p>
            </div>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">1. Information We Collect</h2>
              <p>Get Toolify is designed to collect as little information as possible.</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li><span className="text-white font-bold">Files:</span> We do NOT collect, upload, or store any files you process. All file processing happens entirely in your browser.</li>
                <li><span className="text-white font-bold">Usage data:</span> We may collect anonymous, aggregated usage statistics (page views, tool usage counts) to improve our service. This data cannot be used to identify you.</li>
                <li><span className="text-white font-bold">Cookies:</span> We use minimal cookies necessary for the website to function. We do not use tracking or advertising cookies.</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">2. How Your Files Are Processed</h2>
              <p>All file processing on Get Toolify happens client-side using WebAssembly and browser APIs. This means:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li>Your files are processed entirely on your own device</li>
                <li>No file data is ever transmitted to our servers</li>
                <li>Files are automatically removed from memory when you close the browser tab</li>
                <li>We have no technical ability to access your files</li>
              </ul>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">3. Third-Party Services</h2>
              <p>We may use the following third-party services:</p>
              <ul className="list-disc list-inside mt-3 space-y-2">
                <li><span className="text-white font-bold">Google Analytics:</span> Anonymous usage statistics</li>
                <li><span className="text-white font-bold">Google AdSense:</span> Advertising to keep the service free</li>
                <li><span className="text-white font-bold">Cloudflare:</span> CDN and security services</li>
              </ul>
              <p className="mt-3">These services have their own privacy policies and may collect data according to their terms.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">4. Advertising</h2>
              <p>Get Toolify is free to use and supported by advertising. We use Google AdSense to display ads. Google may use cookies to serve ads based on your visit to our site and other sites on the Internet. You may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-orange-400 hover:underline">Google Ads Settings</a>.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">5. Data Security</h2>
              <p>Since we do not collect or store your files, there is no risk of your file data being compromised through our service. We use HTTPS encryption for all communications between your browser and our servers.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">6. Children's Privacy</h2>
              <p>Get Toolify is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">7. Changes to This Policy</h2>
              <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page with an updated date.</p>
            </section>
  
            <section>
              <h2 className="text-white font-black text-xl mb-3">8. Contact Us</h2>
              <p>If you have any questions about this Privacy Policy, please contact us at:</p>
              <p className="mt-2"><a href="mailto:gettoolify@gmail.com" className="text-orange-400 hover:underline">gettoolify@gmail.com</a></p>
              <p className="mt-1">Murat Yüzügüldü</p>
            </section>
          </div>
        </div>
  
        <footer className="border-t border-white/5 px-6 py-8 max-w-4xl mx-auto flex items-center justify-between text-white/20 text-sm">
          <span className="font-black text-white/40">GET TOOLIFY</span>
          <div className="flex gap-6">
            <a href="/about" className="hover:text-white/40 transition-colors">About</a>
            <a href="/terms" className="hover:text-white/40 transition-colors">Terms of Service</a>
            <a href="/contact" className="hover:text-white/40 transition-colors">Contact</a>
          </div>
        </footer>
      </main>
    );
  }