"use client";

export default function SectionTwo() {
  return (
    <section className="relative w-full h-[100lvh] overflow-hidden">

      {/* ── Full bleed background image ── */}
      <div
        className="s2-bg absolute inset-0 bg-cover bg-center will-change-transform bg-[url('/sectiontwo-about-mobile.webp')] lg:bg-[url('/sectiontwo-about.webp')] "
      />

      {/* ── Left bottom cream card ── */}
<div
  className="s2-cream-card absolute z-10 bottom-16 left-[20px] md:left-[30px] lg:left-auto lg:right-20 flex flex-col gap-6 w-[80vw] max-w-[400px] lg:w-full lg:max-w-[490px]"
>
        <div className="flex flex-col gap-3">
          <h2
            className="s2-reveal-text !font-[100] text-[#FFFFFF] !leading-[0.9]"
            style={{ fontFamily: "var(--font-display)", visibility: "visible" }}
          >
            A Passion for Pools
          </h2>
          <p
            className="s2-reveal-text text-[#FFFFFF]"
            style={{ fontFamily: "var(--font-body)", visibility: "visible" }}
          >
            A Commitment to Quality
          </p>
        </div>

        <p
          className="s2-reveal-text text-[#FFFFFF] !mt-2 !mb-6 lg:!mt-8 "
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