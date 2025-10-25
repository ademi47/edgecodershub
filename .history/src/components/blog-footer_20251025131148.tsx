import Link from 'next/link';

export default function BlogFooter() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-white/10 bg-[#0D1B2A]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-sm text-white/70">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="font-semibold text-white">EdgeCodersHub</div>
            <div className="text-white/50">When tech falls, we rise.</div>
          </div>
          <nav className="flex gap-6">
            <Link href="/#about" className="hover:text-white">About</Link>
            <Link href="/#products" className="hover:text-white">Products</Link>
            <Link href="/#community" className="hover:text-white">Community</Link>
            <Link href="/#" className="hover:text-white">Contact</Link>
          </nav>
        </div>
        <div className="mt-6 text-xs text-white/50">
          © {currentYear} EdgeCodersHub. All rights reserved.
        </div>
        <div className="mt-2 text-xs text-white/50">
          Designed by{' '}
          <a 
            href="https://www.linkedin.com/in/thiekshana" 
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#00F6FF] hover:underline"
          >
            Thiek
          </a>{' '}
          with ♥️
        </div>
      </div>
    </footer>
  );
}