// components/BrandHero.tsx
"use client";

export default function BrandHero() {
  return (
    <div className="container-narrow pt-6 md:pt-10">
      {/* Image banner in a fixed aspect box to avoid overflow/cropping */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
        <div className="w-full" style={{ aspectRatio: "21/6" }}>
          {/* Use regular <img> to keep it simple on Vercel without next/image config */}
          <img
            src="/hero.png"
            alt="Human & AI Productivity ROI Calculator"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
