import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI at Work — Human Productivity ROI",
  description: "Estimate impact from training managers & teams to use AI effectively.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
