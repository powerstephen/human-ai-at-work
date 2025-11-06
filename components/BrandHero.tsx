import Image from "next/image";

export default function BrandHero() {
  // Wrap in a zero-padding card so width/radius perfectly match the sections below
  return (
    <section className="section-card p-0">
      <div className="relative w-full overflow-hidden rounded-2xl">
        {/* Constrained height so it never covers the page */}
        <div className="relative h-[220px] sm:h-[260px] md:h-[320px] lg:h-[360px]">
          <Image
            src="/hero.png"
            alt="AI at Work — Brainster"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center select-none"
          />
        </div>
        {/* Gentle fade to background */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-brand-navy to-transparent" />
      </div>
    </section>
  );
}
