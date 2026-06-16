"use client";

export default function SectionTwo() {
  return (
    <section className="relative w-full h-[100lvh] overflow-hidden">

      {/* ── Full bleed background image ── */}
      <div
        className="s2-bg absolute inset-0 bg-cover bg-center will-change-transform"
        style={{ top: "-10%", bottom: "-10%", backgroundImage: "url('/murray-st-prahran.webp')" }}
      />

      {/* ── Left bottom cream card ── */}
      <div
        className="absolute z-10 bottom-0 left-0 flex flex-col gap-6 w-full max-w-[480px] lg:max-w-[540px]"
        style={{ background: "#F4EEDF", padding: "clamp(32px, 4vw, 56px)" }}
      >
        <div className="flex flex-col gap-3">
          <h2
            className="!font-[100] text-[#162D24]"
            style={{ fontFamily: "var(--font-display)" }}
          >
            A Passion for Pools
          </h2>
          <p
            className="text-[#000000] "
            style={{ fontFamily: "var(--font-body)" }}
          >
            A Commitment to Quality
          </p>
        </div>

        <p
          className="text-[#000000] !mt-8 !mb-4"
          style={{ fontFamily: "var(--font-body)" }}
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