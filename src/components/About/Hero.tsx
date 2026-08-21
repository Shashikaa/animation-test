"use client";

import Image from "next/image";

interface HeroProps {
  isMobile?: boolean;
}

export default function Hero({ isMobile = false }: HeroProps) {
  const desktopImg = "/hero-about.webp";
  const mobileImg = "/hero-about-mobile.webp";
  const bgImage = isMobile ? mobileImg : desktopImg;

  return (
    <section className="relative w-full h-full overflow-hidden bg-transparent [contain:strict] [transform:translateZ(0)]">
      {/* LEFT HALF OF CURTAIN */}
      <div
        className="about-hero-panel-left absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
        style={{
          zIndex: 1,
          clipPath: isMobile ? "none" : "inset(0% 50% 0% 0%)",
          WebkitClipPath: isMobile ? "none" : "inset(0% 50% 0% 0%)",
        }}
      >
        <div className="hero-bg-target about-hero-bg absolute -top-[10%] -bottom-[10%] h-[120%] w-full [backface-visibility:hidden]">
          <Image
            src={bgImage}
            alt="Grand Pools Hero"
            fill
            priority
            quality={85}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-[2]" />
        <div className="about-hero-text-wrap section-container relative z-10 h-full flex flex-col justify-end !pb-22 w-full pointer-events-auto">
          <div className="flex flex-col !gap-4 lg:!gap-8 leading-normal">
            <h1
              className="hero-text-target hero-title-target text-[#F4EEDF] !font-[100]"
              style={{ fontFamily: "var(--font-display)" }}
            >
More Than Just a Pool
            </h1>
            <p className="hero-text-target hero-desc-target text-[#F4EEDF]">
              Creating Experiences
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT HALF OF CURTAIN (Desktop Only) */}
      {!isMobile && (
        <div
          className="about-hero-panel-right absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
          style={{
            zIndex: 1,
            clipPath: "inset(0% 0% 0% 50%)",
            WebkitClipPath: "inset(0% 0% 0% 50%)",
          }}
        >
          <div className="hero-bg-target about-hero-bg absolute -top-[10%] -bottom-[10%] h-[120%] w-full [backface-visibility:hidden]">
            <Image
              src={bgImage}
              alt="Grand Pools Hero"
              fill
              priority
              quality={85}
              sizes="100vw"
              className="object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-[2]" />
          <div className="about-hero-text-wrap section-container relative z-10 h-full flex flex-col justify-end !pb-22 w-full pointer-events-auto">
            <div className="flex flex-col !gap-4 lg:!gap-8 leading-normal">
              <h1
                className="hero-text-target hero-title-target text-[#F4EEDF] !font-[100]"
                style={{ fontFamily: "var(--font-display)" }}
              >
More Than Just a Pool              </h1>
              <p className="hero-text-target hero-desc-target text-[#F4EEDF]">
                Creating Experiences
              </p>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}