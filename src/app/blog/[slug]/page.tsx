import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getAllPosts, getPostBySlug } from '@/lib/blog';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { mdxComponents } from '@/components/mdx-components';
import BlogNav from '@/components/blog-nav';
import BlogFooter from '@/components/blog-footer';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) {
    return {};
  }

  return {
    title: `${post.title} | EdgeCodersHub`,
    description: post.description,
  };
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

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
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <Link 
            href="/blog" 
            className="inline-flex items-center text-[#00F6FF] hover:underline mb-6 text-sm"
          >
            ← Back to Blog
          </Link>

          <header>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight text-white">
              {post.title}
            </h1>
            
            <div className="flex items-center gap-4 text-white/60 mt-4 mb-6 text-sm">
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
          </header>
        </div>
      </section>

      {/* Article Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg prose-invert max-w-none">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
          />
        </div>
      </article>

      <BlogFooter />
    </div>
  );
}