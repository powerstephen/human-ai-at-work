// app/page.tsx
import Image from "next/image";
import RoiQuestionnaire from "../components/RoiQuestionnaire";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO — tighter, no extra white bands, full image visible */}
      <section className="relative w-full pt-0 pb-0">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Removed border/rounded wrapper that created white gutters */}
          <div className="relative h-[240px] sm:h-[300px] md:h-[360px] lg:h-[400px]">
            <Image
              src="/hero.png"
              alt="AI at Work — ROI Calculator"
              fill
              priority
              // Show full image without cropping; container height is tuned so it doesn’t look letterboxed
              className="object-contain object-center"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
            />
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <RoiQuestionnaire />
      </section>
    </main>
  );
}
