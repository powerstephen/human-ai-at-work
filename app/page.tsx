// app/page.tsx
import Image from "next/image";
import RoiQuestionnaire from "../components/RoiQuestionnaire";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* HERO — same width as the form (flush), smaller, proportional */}
      <section className="relative w-full pt-2 pb-0">
        <div className="mx-auto max-w-3xl px-4">
          <div className="relative h-[200px] sm:h-[220px] md:h-[240px]">
            <Image
              src="/hero.png"
              alt="AI at Work — ROI Calculator"
              fill
              priority
              className="object-contain object-center"
              sizes="(max-width: 768px) 100vw, 768px"
            />
          </div>
        </div>
      </section>

      {/* CONTENT — same max width as hero for a flush layout */}
      <section className="mx-auto max-w-3xl px-4 py-8 md:py-10">
        <RoiQuestionnaire />
      </section>
    </main>
  );
}
