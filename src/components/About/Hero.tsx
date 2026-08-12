"use client";

import { useRef } from "react";
import Image from "next/image";

interface HeroProps {
  isMobile?: boolean;
}

export default function Hero({ isMobile = false }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const desktopImg = "/hero-about.webp";
  const mobileImg = "/hero-about-mobile.webp";
  const bgImage = isMobile ? mobileImg : desktopImg;

  return (
    <section 
      ref={sectionRef} 
      className="relative w-full h-full overflow-hidden bg-transparent [contain:strict] [transform:translateZ(0)]"
    >
      <style jsx>{`
        /* 
          Smooth Background Zoom: 
          Extended duration and ultra-smooth easing prevents the "rushed" feeling
        */
        .hero-bg-target {
          transform: translate3d(0, 0, 0) scale(${isMobile ? 1.25 : 1.3});
          transition: transform ${isMobile ? "2200ms" : "2000ms"} cubic-bezier(0.22, 1, 0.36, 1);
          will-change: transform;
        }

        /* 
          Text Reveal: 
          Added custom cubic-bezier and GPU hints for silk-smooth entry 
        */
        .hero-text-target {
          opacity: 0;
          transform: translate3d(0, 40px, 0);
          transition: transform 1400ms cubic-bezier(0.16, 1, 0.3, 1), opacity 1400ms cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }

        .hero-title-target {
          transition-delay: 200ms;
        }

        .hero-desc-target {
          transition-delay: 380ms;
        }

        :global(.hero-animate-active) .hero-bg-target {
          transform: translate3d(0, 0, 0) scale(1.1) !important;
        }

        :global(.hero-animate-active) .hero-text-target {
          opacity: 1 !important;
          transform: translate3d(0, 0, 0) !important;
        }
      `}</style>

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
              Designing Pools
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
                Designing Pools
              </h1>
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