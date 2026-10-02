"use client";

import { useRef, useEffect } from "react";

const SECTION_TWO_IMAGES = [
  "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=82",
  "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1600&q=82",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1400&q=80",
];

export default function SectionTwo() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Start downloading the reveal images as soon as Section 2 mounts.
    SECTION_TWO_IMAGES.forEach((src) => {
      const img = new Image();
      img.decoding = "async";
      img.src = src;
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-full overflow-hidden bg-[#0A1410] isolate select-none"
      style={{
        transform: "translate3d(0, 0, 0)",
        backfaceVisibility: "hidden",
        contain: "strict",
      }}
    >
      <link
        rel="preload"
        href="/sectiontwo.webp"
        as="image"
        type="image/webp"
      />

      {/* BASE BACKGROUND LAYER */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
        <img
          src="/sectiontwo.webp"
          alt="Architectural swimming pool excavation and concrete base construction"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          className="w-full h-full object-cover"
          style={{
            transform: "translate3d(0,0,0)",
            backfaceVisibility: "hidden",
          }}
        />
      </div>

      {/* MOBILE BACKGROUND LAYER 2 */}
      <div
        className="s2-mob-clip-bg-1 lg:hidden absolute inset-0 z-[1] overflow-hidden pointer-events-none transform-gpu"
        style={{
          opacity: 1,
          clipPath: "inset(0% 100% 0% 0%)",
          willChange: "clip-path",
          backfaceVisibility: "hidden",
        }}
      >
        <img
          src="/sliderimage1.webp"
          alt="Aerial overview of finished concrete lap pool and Bayside landscaping"
          decoding="async"
          draggable={false}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* MOBILE BACKGROUND LAYER 3 */}
      <div
        className="s2-mob-clip-bg-2 lg:hidden absolute inset-0 z-[2] overflow-hidden pointer-events-none transform-gpu"
        style={{
          opacity: 1,
          clipPath: "inset(0% 100% 0% 0%)",
          willChange: "clip-path",
          backfaceVisibility: "hidden",
        }}
      >
        <img
          src="/sliderimage2.webp"
          alt="Structural steel reinforcement and pool plumbing installation layout"
          decoding="async"
          draggable={false}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* MOBILE BACKGROUND LAYER 4 */}
      <div
        className="s2-mob-clip-bg-3 lg:hidden absolute inset-0 z-[3] overflow-hidden pointer-events-none transform-gpu"
        style={{
          opacity: 1,
          clipPath: "inset(0% 100% 0% 0%)",
          willChange: "clip-path",
          backfaceVisibility: "hidden",
        }}
      >
        <img
          src="/menu-about.webp"
          alt="Custom coping tile detailing and waterline pool finishes"
          decoding="async"
          draggable={false}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* CONTENT BLOCK OVERLAY */}
      <div className="section-container absolute inset-0 z-10 h-full flex flex-col justify-end pointer-events-none transform-gpu">
        <div className="s2-body flex flex-col items-end text-right gap-2 lg:gap-3 p-4 md:p-8 !mb-6 pointer-events-none">
          <p className="s2-body-text select-text pointer-events-auto text-[#F4EEDF] font-body text-sm md:text-base leading-relaxed text-right w-full max-w-[280px] md:max-w-[320px] lg:max-w-[360px]">
            From structural engineering to final wet-testing, we construct custom concrete pools engineered for Melbourne properties.
          </p>
        </div>
      </div>

      {/* CORE WORKSPACE GRID */}
      <div className="absolute inset-0 z-20 grid grid-cols-1 lg:grid-cols-2 w-full h-full pointer-events-none transform-gpu">
        {/* LEFT COLUMN: INITIAL TITLE */}
        <div className="relative h-full overflow-hidden !pt-30 md:!pt-66 lg:!pt-36">
          <div className="!mb-33 md:!mb-80 lg:!mb-0 h-[100px] !ml-[20px] md:!ml-[30px] lg:!ml-[65px]">
            <h2 className="s2-title-main select-text pointer-events-auto font-display text-[#F4EEDF] font-normal text-3xl md:text-5xl !mb-2 tracking-tight">
              One Pool at a Time
            </h2>

            <p className="s2-title-sub select-text pointer-events-auto font-body text-[#F4EEDF]/80 text-sm md:text-base tracking-wide">
              Bayside & Mornington Peninsula
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: DOUBLE LAYER STACK */}
        <div className="absolute top-0 right-0 bottom-0 left-1/2 hidden lg:block z-20 pointer-events-auto transform-gpu">
          {/* UNDERNEATH LAYER */}
          <div
            className="s2-right-img-frame-under absolute inset-0 w-full h-full z-10"
            style={{
              willChange: "clip-path, transform",
              transform: "translate3d(0,0,0)",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="w-full h-full relative overflow-hidden shadow-2xl">
              <img
                src="/sliderimage1.webp"
                alt="Custom concrete pool construction and structural layout"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                draggable={false}
                className="w-full h-full object-cover"
                style={{ transform: "translate3d(0,0,0)" }}
              />
            </div>
          </div>

          {/* TOP INITIAL LAYER */}
          <div
            className="s2-right-img-frame absolute inset-0 w-full h-full z-20"
            style={{
              willChange: "clip-path, transform",
              transform: "translate3d(0,0,0)",
              backfaceVisibility: "hidden",
            }}
          >
            <div className="w-full h-full relative overflow-hidden shadow-2xl">
              <img
                src="/menu-about.webp"
                alt="Architectural swimming pool layout and timber surround"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                draggable={false}
                className="w-full h-full object-cover"
                style={{ transform: "translate3d(0,0,0)" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* DESKTOP SCROLLING WORKSPACE GRID CONTAINER */}
      <div
        className="s2-scroll-content hidden lg:flex absolute left-4 md:left-8 lg:left-16 top-0 flex-col w-full max-w-[40%] z-30 pointer-events-none pt-[12vh] pb-16 opacity-0 transform-gpu"
        style={{
          willChange: "transform, opacity",
          transform: "translate3d(0, 100%, 0)",
          backfaceVisibility: "hidden",
        }}
      >
        <p className="select-text pointer-events-auto text-[#F4EEDF] font-body text-base leading-relaxed !text-left max-w-[320px]">
          Founder Lachlan Deleeuw brings over 25 years of structural construction experience to custom Bayside builds, managing every project from site appraisal to handover.
        </p>

        <p className="select-text pointer-events-auto text-[#F4EEDF] font-body text-base leading-relaxed !text-left max-w-[260px] !self-end !mt-[80px]">
          <span className="font-semibold text-lg block mb-1">Tailor-Made Designs</span>
          Shaped around your site's contours, natural light, and architecture.
        </p>

        <div className="w-full aspect-[4/3] max-w-[340px] overflow-hidden !mt-[40px] transform-gpu pointer-events-none rounded-sm">
          <img
            src="/p6.avif"
            alt="Architectural concrete pool detail in Toorak residence"
            loading="eager"
            decoding="async"
            draggable={false}
            className="w-full h-full object-cover"
            style={{ transform: "translate3d(0,0,0)" }}
          />
        </div>

        <p className="select-text pointer-events-auto text-[#F4EEDF] font-body text-sm leading-relaxed !text-left max-w-[290px] !mt-[60px]">
          <span className="font-semibold text-base block mb-1">Structural Precision</span>
          In-house concrete pouring, custom coping, and premium tile finishes.
        </p>

        <p className="select-text pointer-events-auto text-[#F4EEDF] font-body text-sm leading-relaxed !text-left max-w-[260px] !self-end !mt-[40px]">
          <span className="font-semibold text-base block mb-1">Seamless Handover</span>
          Including Pool Care+ setup, equipment guides, and warranty registration.
        </p>
      </div>

      {/* MOBILE & TABLET TEXT-ONLY SCROLL CONTAINER */}
      <div
        className="s2-mob-scroll-wrapper section-container lg:hidden relative w-full h-auto z-40 pointer-events-auto px-6 md:px-12 transform-gpu"
        style={{
          opacity: 0,
          willChange: "transform",
          transform: "translate3d(0, 100vh, 0)",
          backfaceVisibility: "hidden",
        }}
      >
        <div className="w-full flex flex-col py-[18vh] items-start">
          <p className="s2-mob-row1 select-text text-[#F4EEDF] font-body max-w-[320px] text-left text-sm md:text-base leading-relaxed">
            Founder Lachlan Deleeuw brings over 25 years of structural construction experience to custom Bayside builds, managing every project from site appraisal to handover.
          </p>

          <div className="s2-mob-row2 flex flex-col gap-1 text-left max-w-[300px] self-start !mt-[500px]">
            <p className="select-text text-[#F4EEDF] text-xl md:text-2xl font-bold">
              Tailor-Made Designs
            </p>

            <p className="select-text text-[#F4EEDF]/90 font-body text-xs md:text-sm leading-relaxed">
              Shaped around your site's contours, natural light, and architecture.
            </p>
          </div>

          <div className="s2-mob-row3 flex flex-col gap-1 text-left max-w-[300px] self-start !mt-[500px]">
            <p className="select-text text-[#F4EEDF] text-xl md:text-2xl font-bold">
              Structural Precision
            </p>

            <p className="select-text text-[#F4EEDF]/90 font-body text-xs md:text-sm leading-relaxed">
              In-house concrete pouring, custom coping, and premium tile finishes.
            </p>
          </div>

          <div className="s2-mob-row4 flex flex-col gap-1 max-w-[300px] text-left self-start !mt-[500px]">
            <p className="select-text text-[#F4EEDF] text-xl md:text-2xl font-bold">
              Seamless Handover
            </p>

            <p className="select-text text-[#F4EEDF]/90 font-body text-xs md:text-sm leading-relaxed">
              Including Pool Care+ setup, equipment guides, and warranty registration.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}