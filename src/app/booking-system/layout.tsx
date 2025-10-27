import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Book a Call | EdgeCodersHub',
  description: 'Schedule a call with EdgeCodersHub',
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}