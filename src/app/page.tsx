// src/app/page.tsx

export const metadata = {
  title: 'EdgeCodersHub - Build the Future',
  description: 'Share knowledge, ship products, uplift builders.',
};

export default function HomePage() {
  return (
    <>
      {/* This will load your existing index.html content */}
      <iframe 
        src="/index.html" 
        style={{
          width: '100vw',
          height: '100vh',
          border: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          margin: 0,
          padding: 0
        }}
        title="EdgeCodersHub Home"
      />
    </>
  );
}