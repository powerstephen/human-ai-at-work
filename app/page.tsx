// app/page.tsx
import Image from "next/image";
import RoiQuestionnaire from "@/components/RoiQuestionnaire";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO — same placement, zoomed OUT via object-contain */}
      <section className="relative w-full">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl border border-neutral-200">
            <div className="relative h-[260px] sm:h-[320px] md:h-[380px] lg:h-[420px]">
              <Image
                src="/hero.png"
                alt="AI at Work — ROI Calculator"
                fill
                priority
                className="object-contain object-center"
              />
            </div>
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
