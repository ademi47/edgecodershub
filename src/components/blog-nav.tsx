import Link from 'next/link';

export default function BlogNav() {
  return (
    <header className="sticky top-0 z-50 bg-[#0D1B2A]/80 backdrop-blur border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Link href="/" className="font-bold tracking-tight text-lg sm:text-xl flex items-center gap-2 text-white">
          EdgeCodersHub
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-white/80">
          <Link href="/#about" className="hover:text-white">About</Link>
          <Link href="/#mission" className="hover:text-white">Mission</Link>
          <Link href="/#products" className="hover:text-white">Products</Link>
          <Link href="/#community" className="hover:text-white">Community</Link>
          <Link href="/blog" className="text-white font-semibold">Blog</Link>
        </nav>
        <div className="flex items-center gap-3">
          <a 
            href="/#join"
            className="hidden sm:inline-flex px-4 py-2 rounded-xl bg-[#00F6FF]/10 text-[#00F6FF] ring-1 ring-[#00F6FF]/40 hover:bg-[#00F6FF]/20 transition"
          >
            Join the Hub
          </a>
          <a 
            href="/#products"
            className="inline-flex px-4 py-2 rounded-xl bg-[#FF6B00] hover:bg-orange-500 transition text-white"
          >
            Explore
          </a>
        </div>
      </div>
    </header>
  );
}