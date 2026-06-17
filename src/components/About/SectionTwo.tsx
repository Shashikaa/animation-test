"use client";

export default function SectionTwo() {
  return (
    <section className="relative w-full h-[100lvh] overflow-hidden">

      {/* ── Full bleed background image ── */}
      <div
        className="s2-bg absolute inset-0 bg-cover bg-center will-change-transform"
        style={{ top: "-15%", bottom: "-15%", backgroundImage: "url('/murray-st-prahran.webp')" }}
      />

      {/* ── Left bottom cream card ── */}
      <div
        className="s2-cream-card absolute z-10 bottom-0 left-0 flex flex-col gap-6 w-[80vw] max-w-[400px] lg:w-full lg:max-w-[540px]"
        style={{ 
          background: "#F4EEDF", 
          padding: "clamp(34px, 5vw, 56px)" 
        }}
      >
        <div className="flex flex-col gap-3">
          <h2
            className="s2-reveal-text !font-[100] text-[#162D24] !leading-[0.9]"
            style={{ fontFamily: "var(--font-display)", visibility: "visible" }}
          >
            A Passion for Pools
          </h2>
          <p
            className="s2-reveal-text text-[#000000]"
            style={{ fontFamily: "var(--font-body)", visibility: "visible" }}
          >
            A Commitment to Quality
          </p>
        </div>

        <p
          className="s2-reveal-text text-[#000000] !mt-2 !mb-6 lg:!mt-8 "
          style={{ fontFamily: "var(--font-body)", visibility: "visible" }}
        >
          Founded in 2021, Grand Pools combines 25+ years of experience to
          design and build exceptional pools, delivering quality craftsmanship,
          innovative solutions, and personalised service for residential and
          commercial projects across Melbourne.
        </p>
      </div>

    </section>
  );
}