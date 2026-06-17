"use client";

export default function SectionOne() {
  return (
    <section className="relative w-full h-[100lvh] overflow-hidden">

      {/* ── Desktop Background Image ── */}
      <div
        className="s1-bg absolute left-0 right-0 bg-cover bg-center will-change-transform hidden lg:block"
        style={{ top: "-10%", bottom: "-10%", backgroundImage: "url('/sectionOne.webp')" }}
      />
      
      {/* ── Mobile Background Image ── */}
      <div
        className="s1-bg absolute left-0 right-0 bg-cover bg-top will-change-transform block lg:hidden"
        style={{ top: "-10%", bottom: "-10%", backgroundImage: "url('/sectionOne-mobile.webp')" }}
      />

      {/* ── Content ── */}
      <div className="section-continer relative z-10 h-full flex items-end justify-end !pb-54">
        {/* FIX: Replaced inline visibility with lg:invisible, and fixed spacing properties */}
        <div
          className="s1-card w-full max-w-[280px] md:max-w-[330px] lg:max-w-[370px] flex flex-col justify-center gap-4 will-change-transform !py-8 !p-6 md:!p-8 lg:!p-10 lg:invisible"
          style={{
            background: "rgba(25, 33, 28, 0.4)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(42px)",
            boxShadow: "-5px -5px 25px rgba(255,255,255,0.02) inset",
          }}
        >
          <p className="text-[#F4EEDF] s1-reveal-text">
            At Grand Pools, we design and build pools that bring families together,
            blending craftsmanship, innovation, and lasting quality.
          </p>
        </div>
      </div>

    </section>
  );
}