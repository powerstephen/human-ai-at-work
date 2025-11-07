import Image from "next/image";

export default function BrandHero() {
  return (
    <section className="w-full">
      <div className="relative w-full overflow-hidden rounded-2xl shadow-lg max-h-[420px]">
        {/* Constrained hero so it does NOT cover the page */}
        <div className="relative h-[220px] sm:h-[260px] md:h-[320px] lg:h-[380px]">
          <Image
            src="/hero.png"
            alt="AI at Work — Brainster"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center select-none"
          />
        </div>
        {/* Fade into background color so it blends nicely */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-brand-navy to-transparent" />
      </div>
    </section>
  );
}
