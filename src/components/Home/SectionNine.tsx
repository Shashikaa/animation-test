"use client";

export default function SectionNine() {
  return (
    <section className="s9-section relative w-full h-screen overflow-hidden bg-transparent">
      
      {/* ── BACKGROUND PANELS LAYER ── */}
      {/* DESKTOP ONLY: Kept identical to your original code */}
      <div className="absolute inset-0 z-10 hidden lg:flex flex-col lg:flex-row w-full h-full pointer-events-none">
        {/* LEFT PANEL */}
        <div className="s9-left-side absolute left-0 bottom-0 w-full lg:w-1/2 h-1/2 lg:h-full overflow-hidden pointer-events-auto bg-black">
          <div 
            className="s9-bg-img-left absolute inset-0 bg-cover bg-left w-[200%] h-full opacity-60 mix-blend-lighten"
            style={{ backgroundImage: "url('/secnine.webp')" }}
          />
          
          {/* Pinned Left Portion */}
          <div className="s9-native-title-wrapper-1 absolute top-1/2 right-0 -translate-y-1/2 w-[400px] hidden lg:block">
            <h2 className="s9-title-part1 text-[#F4EEDF] font-display text-[46px] leading-none text-right whitespace-nowrap select-none">
              Ready to<span className="inline-block w-[16px]">&nbsp;</span>
            </h2>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="s9-right-side absolute right-0 top-0 w-full lg:w-1/2 h-1/2 lg:h-full overflow-hidden pointer-events-auto bg-black">
          <div 
            className="s9-bg-img-right absolute inset-0 bg-cover bg-right w-[200%] h-full opacity-60 mix-blend-lighten"
            style={{ 
              backgroundImage: "url('/secnine.webp')",
              left: "-100%"
            }}
          />

          {/* Pinned Right Portion */}
          <div className="s9-native-title-wrapper-2 absolute top-1/2 left-0 -translate-y-1/2 w-[400px] hidden lg:block">
            <h2 className="s9-title-part2 text-[#F4EEDF] font-display text-[46px] leading-none text-left whitespace-nowrap select-none">
              Dive In?
            </h2>
          </div>
        </div>
      </div>

      {/* MOBILE & TABLET BACKGROUND: Single unified image, completely unsplit */}
      <div 
        className="absolute inset-0 z-10 block lg:hidden bg-cover bg-center  "
        style={{ backgroundImage: "url('/secnine.webp')" }}
      />

      {/* ── GLOBAL FOREGROUND LAYER FOR UNCLIPPED FLIGHT PATH ── */}
      <div className="s9-global-flight-container absolute inset-0 z-30 hidden lg:block pointer-events-none opacity-0 invisible">
        <div className="s9-flight-wrapper absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 flex items-center justify-center text-[#F4EEDF]">
          <div className="w-[400px] text-right whitespace-nowrap select-none">
            <h2 className="font-display text-[46px] leading-none inline-block">
              Ready to<span className="inline-block w-[16px]">&nbsp;</span>
            </h2>
          </div>
          <div className="w-[400px] text-left whitespace-nowrap select-none">
            <h2 className="font-display text-[46px] leading-none inline-block">
              Dive In?
            </h2>
          </div>
        </div>
      </div>

      {/* ── INTERACTION LAYER: DESKTOP FLIGHT LANDING TARGETS ── */}
      <div className="absolute inset-0 z-20 hidden lg:block pointer-events-none">
        <div className="absolute bottom-24 right-14 flex flex-col items-end justify-end h-full max-w-[500px]">
          
          {/* TARGET WRAPPER */}
          <div className="s9-target-wrapper relative w-full text-right opacity-0 select-none pointer-events-none">
            <h2 className="font-display text-[46px] leading-none inline-flex items-center justify-end gap-4 text-[#F4EEDF] whitespace-nowrap">
              <span>Ready to</span>
              <span>Dive In?</span>
            </h2>
          </div>

          {/* PHYSICAL LAYOUT GAP */}
          <div className="h-10 w-full block clear-both" />

          {/* Content Paragraph Framework */}
          <p className="s9-para-desktop max-w-[460px] text-[#F4EEDF] text-right opacity-0 pointer-events-auto !leading-[1.2] !pr-4">
            Don't hold back. As you swim along the sun-drenched water, delight in
            the kaleidoscope of shifting reflections and backyard panoramas that
            will leave you impressed. This is your private retreat — set your pace
            and enjoy it at your desire.
          </p>
        </div>
      </div>

      {/* ── MOBILE & TABLET OVERLAY LAYER ── */}
      {/* Positioned at top-right for mobile and tablets */}
      <div className="absolute top-32 right-6 md:right-10 z-40 flex flex-col items-end lg:hidden max-w-[320px] md:max-w-[450px] pointer-events-none">
        <h2 className="s9-title text-[#F4EEDF] font-display text-3xl md:text-4xl text-right w-full !mb-5">
          Ready to Dive In?
        </h2>
        <p className="s9-para-mobile text-[#F4EEDF] font-body text-right text-sm md:text-base leading-relaxed">
          Don't hold back. As you swim along the sun-drenched water, delight in
          the kaleidoscope of shifting reflections and backyard panoramas that
          will leave you impressed. This is your private retreat — set your pace
          and enjoy it at your desire.
        </p>
      </div>

    </section>
  );
}