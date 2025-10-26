import Link from 'next/link';

export default function BlogFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
<footer className="border-t border-white/10 bg-[#0D1B2A]">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-sm text-white/70">
    
    {/* Main Footer Content */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      
      {/* Company Info */}
      <div>
        <div className="font-bold text-lg text-white mb-2">EdgeCodersHub</div>
        <div className="text-white/50 mb-3">When tech falls, we rise.</div>
        <div className="text-xs text-white/60 space-y-1">
          <div><strong>UEN:</strong> 53512731J</div>
          <div>Enterprise Software Solutions, IT Consulting</div>
          <div>& Digital Innovation</div>
        </div>
      </div>
      
      {/* Contact Info */}
      <div>
        <div className="font-semibold text-white mb-3">Contact Us</div>
        <div className="text-xs text-white/60 space-y-2">
          <div className="flex items-start gap-2">
            <span>📍</span>
            <span>Blk 58 Bayshore Park<br />Singapore 469981</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📞</span>
            <span>+65 96326936</span>
          </div>
          <div className="flex items-center gap-2">
            <span>✉️</span>
            <a href="mailto:admin@thiek.com" className="hover:text-white transition-colors">
              admin@thiek.com
            </a>
          </div>
          <div className="flex items-center gap-2">
            <span>🌐</span>
            <span>edgecodershub.com</span>
          </div>
        </div>
      </div>
      
      {/* Quick Links */}
      <div>
        <div className="font-semibold text-white mb-3">Quick Links</div>
        <nav className="flex flex-col gap-2 text-xs text-white/60">
          <Link href="/#about" className="hover:text-white transition-colors">
            About Us
          </Link>
          <Link href="/#products" className="hover:text-white transition-colors">
            Products
          </Link>
          <Link href="/#community" className="hover:text-white transition-colors">
            Community
          </Link>
          <Link href="/#contact" className="hover:text-white transition-colors">
            Contact
          </Link>
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
        </nav>
      </div>
      
    </div>
    
    {/* Divider */}
    <div className="border-t border-white/10 pt-6">
      
      {/* Copyright & Credits */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
        <div className="text-center sm:text-left">
          <div>© {currentYear} EdgeCodersHub (UEN: 53512731J).</div>
          <div>All rights reserved. Registered in Singapore.</div>
        </div>
        <div className="text-center sm:text-right">
          Designed by{' '}
          <a 
            href="https://thiek.me"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00F6FF] hover:underline transition-colors"
          >
            Thiek
          </a>
          {' '}with ♥️
        </div>
      </div>
      
    </div>
    
  </div>
</footer>
  );
}