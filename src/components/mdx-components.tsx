import Link from 'next/link';
import { ReactNode } from 'react';

interface ComponentProps {
  children?: ReactNode;
  href?: string;
  src?: string;
  alt?: string;
}

export const mdxComponents = {
  
  h1: ({ children }: ComponentProps) => (
    <h1 className="text-3xl sm:text-4xl font-bold mt-8 mb-4 text-white">
      {children}
    </h1>
  ),
  h2: ({ children }: ComponentProps) => (
    <h2 className="text-2xl sm:text-3xl font-bold mt-8 mb-3 text-white">
      {children}
    </h2>
  ),
  h3: ({ children }: ComponentProps) => (
    <h3 className="text-xl sm:text-2xl font-semibold mt-6 mb-2 text-white">
      {children}
    </h3>
  ),
  p: ({ children }: ComponentProps) => (
    <p className="mb-4 leading-7 text-white/80">
      {children}
    </p>
  ),
  ul: ({ children }: ComponentProps) => (
    <ul className="list-disc list-inside mb-4 space-y-2 text-white/80 ml-4">
      {children}
    </ul>
  ),
  ol: ({ children }: ComponentProps) => (
    <ol className="list-decimal list-inside mb-4 space-y-2 text-white/80 ml-4">
      {children}
    </ol>
  ),
  li: ({ children }: ComponentProps) => (
    <li className="ml-4">{children}</li>
  ),
  code: ({ children }: ComponentProps) => (
    <code className="bg-white/10 px-2 py-0.5 rounded text-sm font-mono text-[#00F6FF]">
      {children}
    </code>
  ),
  pre: ({ children }: ComponentProps) => (
    <pre className="bg-[#1C1C1C] text-white p-4 rounded-xl overflow-x-auto mb-6 ring-1 ring-white/10">
      {children}
    </pre>
  ),
 a: ({ href, children }: ComponentProps) => {
    // Check if it's an external link or file
    const isExternal = href?.startsWith('http') || href?.endsWith('.js') || href?.endsWith('.pdf');
    
    if (isExternal || href?.startsWith('/scripts')) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#00F6FF] hover:underline font-medium"
        >
          {children}
        </a>
      );
    }
    
    return (
      <Link 
        href={href || '#'} 
        className="text-[#00F6FF] hover:underline font-medium"
      >
        {children}
      </Link>
    );
  },
  blockquote: ({ children }: ComponentProps) => (
    <blockquote className="border-l-4 border-[#00F6FF] pl-4 italic my-6 text-white/70 bg-white/5 py-2 rounded-r">
      {children}
    </blockquote>
  ),
  table: ({ children }: ComponentProps) => (
    <div className="overflow-x-auto mb-6">
      <table className="min-w-full border-collapse border border-white/20 rounded-lg overflow-hidden">
        {children}
      </table>
    </div>
  ),
  th: ({ children }: ComponentProps) => (
    <th className="border border-white/20 px-4 py-2 bg-white/10 font-semibold text-left text-white">
      {children}
    </th>
  ),
  td: ({ children }: ComponentProps) => (
    <td className="border border-white/20 px-4 py-2 text-white/80">
      {children}
    </td>
  ),
  hr: () => (
    <hr className="my-8 border-white/20" />
  ),
  strong: ({ children }: ComponentProps) => (
    <strong className="font-semibold text-white">{children}</strong>
  ),
  em: ({ children }: ComponentProps) => (
    <em className="italic text-white/90">{children}</em>
  ),
};