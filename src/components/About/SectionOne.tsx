"use client";

export default function SectionOne() {
  return (
    <section className="relative w-full h-[100lvh] overflow-hidden">

      {/* ── Desktop Background Image ── */}
      <div
        className="s1-bg absolute left-0 right-0 bg-cover bg-center will-change-transform hidden lg:block"
        style={{ top: "-10%", bottom: "-10%", backgroundImage: "url('/pool-renovation.webp')" }}
      />
      
      {/* ── Mobile Background Image ── */}
      <div
        className="s1-bg absolute left-0 right-0 bg-cover bg-top will-change-transform block lg:hidden"
        style={{ top: "-10%", bottom: "-10%", backgroundImage: "url('/pool-renovation-mobile.webp')" }}
      />

{/* ── Black Overlay ── */}
      <div 
        className="absolute inset-0 bg-black/20 pointer-events-none z-[1]" 
      />
      {/* ── Content ── */}
      <div className="section-container relative z-10 h-full flex items-start justify-start lg:!items-end !pb-24 !pt-32">
        <div
          className="w-full max-w-[280px] md:max-w-[330px] lg:max-w-[370px] flex flex-col justify-center gap-4 will-change-transform !py-8 md:!p-8 lg:!p-10"
        >
          {/* Mapped clean to your new single ScrollTrigger.onUpdate engine */}
          <p 
            className="text-[#F4EEDF] reveal-text"
          >
            At Grand Pools, we design and build pools that bring families together,
            blending craftsmanship, innovation, and lasting quality.
          </p>
        </div>
      </div>

    </section>
  );
}