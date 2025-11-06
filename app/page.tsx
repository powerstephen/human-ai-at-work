// app/page.tsx
import Image from "next/image";
import RoiQuestionnaire from "../components/RoiQuestionnaire";

export default function Home() {
  return (
    <main className="min-h-screen bg-white text-neutral-900">
      {/* HERO — flush with form width */}
      <section className="relative w-full pt-2 pb-0">
        <div className="mx-auto max-w-3xl px-4">
          <div className="relative h-[180px] sm:h-[200px] md:h-[220px]">
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

      {/* CONTENT — same width as hero */}
      <section className="mx-auto max-w-3xl px-4 py-8 md:py-10">
        <RoiQuestionnaire />
      </section>
    </main>
  );
}
