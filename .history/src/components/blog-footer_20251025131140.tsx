import Link from 'next/link';

export default function BlogFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
   <footer class="border-t border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-sm text-white/70">
        
        <!-- Main Footer Content -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            
            <!-- Company Info -->
            <div>
                <div class="font-bold text-lg text-white mb-2">EdgeCodersHub</div>
                <div class="text-white/50 mb-3">When tech falls, we rise.</div>
                <div class="text-xs text-white/60 space-y-1">
                    <div><strong>UEN:</strong> T251393304</div>
                    <div>Enterprise Software Solutions</div>
                    <div>& Digital Innovation</div>
                </div>
            </div>
            
            <!-- Contact Info -->
            <div>
                <div class="font-semibold text-white mb-3">Contact Us</div>
                <div class="text-xs text-white/60 space-y-2">
                    <div class="flex items-start gap-2">
                        <span>📍</span>
                        <span>Blk 58 Bayshore Park<br>Singapore 469981</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span>📞</span>
                        <span>+65 96326936</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <span>✉️</span>
                        <a href="mailto:admin@thiek.com" class="hover:text-white">admin@thiek.com</a>
                    </div>
                    <div class="flex items-center gap-2">
                        <span>🌐</span>
                        <span>edgecodershub.com</span>
                    </div>
                </div>
            </div>
            
            <!-- Quick Links -->
            <div>
                <div class="font-semibold text-white mb-3">Quick Links</div>
                <nav class="flex flex-col gap-2 text-xs text-white/60">
                    <a href="#about" class="hover:text-white transition-colors">About Us</a>
                    <a href="#products" class="hover:text-white transition-colors">Products</a>
                    <a href="#community" class="hover:text-white transition-colors">Community</a>
                    <a href="#contact" class="hover:text-white transition-colors">Contact</a>
                    <a href="/terms" class="hover:text-white transition-colors">Terms of Service</a>
                    <a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a>
                </nav>
            </div>
            
        </div>
        
        <!-- Divider -->
        <div class="border-t border-white/10 pt-6">
            
            <!-- Copyright & Credits -->
            <div class="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/50">
                <div class="text-center sm:text-left">
                    <div>© <span id="year"></span> EdgeCodersHub Pte Ltd (UEN: T251393304).</div>
                    <div>All rights reserved. Registered in Singapore.</div>
                </div>
                <div class="text-center sm:text-right">
                    Designed by <a href="https://www.linkedin.com/in/thiekshana" target="_blank"
                        class="text-ecBlue hover:underline transition-colors">Thiek</a> with ♥️
                </div>
            </div>
            
        </div>
        
    </div>
</footer>
  );
}