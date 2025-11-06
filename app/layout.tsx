// app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI at Work — Human Productivity ROI',
  description: 'Quantify time saved, payback, and retention impact from training teams to work effectively with AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* DO NOT add any classes that force white text or a blue hero here */}
      <body>{children}</body>
    </html>
  );
}
