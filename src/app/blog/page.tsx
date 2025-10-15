import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';
import BlogNav from '@/components/blog-nav';
import BlogFooter from '@/components/blog-footer';

export const metadata = {
  title: 'Blog | EdgeCodersHub',
  description: 'Projects, tutorials, and insights on building the future.',
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-[#0D1B2A] text-white">
      <BlogNav />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          backgroundPosition: 'center center'
        }}></div>
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-[#00F6FF]/10 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-[#FF6B00]/10 blur-3xl"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
            Projects & <span className="text-[#00F6FF]">Blog</span>
          </h1>
          <p className="mt-5 text-lg text-white/80 max-w-2xl">
            Share knowledge, ship products, uplift builders. Real-world guides, product insights, and developer stories.
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {posts.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur">
            <p className="text-white/60 text-lg">
              No posts yet. Start writing in{' '}
              <code className="bg-white/10 px-2 py-1 rounded text-[#00F6FF]">
                src/content/blog/
              </code>
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {posts.map((post) => (
              <article
                key={post.slug}
                className="rounded-3xl bg-white/5 ring-1 ring-white/10 backdrop-blur p-6 hover:bg-white/10 transition-all duration-300"
              >
                <Link href={`/blog/${post.slug}`}>
                  <h2 className="text-2xl sm:text-3xl font-bold text-white hover:text-[#00F6FF] transition-colors">
                    {post.title}
                  </h2>
                </Link>
                
                <div className="flex items-center gap-4 text-sm text-white/60 mt-3 mb-4">
                  <time dateTime={post.date}>
                    {new Date(post.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                  <span>•</span>
                  <span>{post.readingTime}</span>
                </div>

                <p className="text-white/80 mb-4 text-base sm:text-lg leading-relaxed">
                  {post.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-[#00F6FF]/10 text-[#00F6FF] ring-1 ring-[#00F6FF]/20 rounded-full text-sm font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <BlogFooter />
    </div>
  );
}