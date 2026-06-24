"use client";

interface HeroProps {
  hideText?: boolean;
  isMobile?: boolean;
}

export default function ServicesHero({ hideText = false, isMobile = false }: HeroProps) {
  return (
    <div className="relative w-full h-full bg-[#F4EEDF]">
      
      {/* UNDERNEATH LAYER: Stationary text block card reveal anchor */}
      <div className="absolute bottom-0 left-0 w-full h-[320px] lg:top-0 lg:right-0 lg:left-auto lg:h-full lg:w-[550px] grid place-items-center !px-12 lg:!px-16 z-0">
        <div className="w-full max-w-[420px] text-left mx-auto">
          <p className="text-[#19211C] !text-[14px] md:!text-[16px]">
            From stunning pool renovations to high-end commercial builds, 
            we deliver tailored solutions with precision and care. Whether you're 
            upgrading an existing pool or starting from scratch, our expert team 
            ensures a seamless process and exceptional results.
          </p>
        </div>
      </div>

      {/* TOP LAYER: Full screen image container clipped with Inset values */}
      <div 
        className="services-hero-top-layer absolute inset-0 w-full h-full overflow-hidden z-10 will-change-[clip-path]"
        style={{ clipPath: "inset(0px 0px 0px 0px)" }}
      >
        <section className="relative w-full h-full bg-[#111]">
          <div
            className="service-hero-bg absolute left-0 right-0 bg-cover bg-center will-change-transform"
            style={{
              top: "-10%",
              bottom: "-10%",
              backgroundImage: "url('/servicehero.webp')",
              transform: "scale(1.3) translateZ(0)",
              backfaceVisibility: "hidden",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-[1]" />
          
          {!hideText && (
            <div className="hero-text-wrap section-container relative z-10 h-full flex flex-col justify-end !pb-22 will-change-[opacity,transform]">
              <div className="flex flex-col !gap-2 lg:!gap-6 leading-normal">
                <h1
                  className="hero-title text-[#F4EEDF] !font-[100]"
                  style={{
                    fontFamily: "var(--font-display)",
                  }}
                >
                  Expert Pool Solutions
                </h1>
                <p className="hero-desc text-[#F4EEDF] !mt-1">
                  Designed to Last
                </p>
              </div>
            </div>
          )}
        </section>
      </div>

    </div>
  );
}