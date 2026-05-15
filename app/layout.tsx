import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Avista — AI proposals that win freelance work',
  description:
    'Avista writes proposals that read like you wrote them after coffee with the client. $15/month, capped at 30 proposals.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
