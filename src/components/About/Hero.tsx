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
    <section ref={sectionRef} className="relative w-full h-full overflow-hidden bg-[#111]">
      
      {/* LEFT HALF OF IMAGE */}
      <div
        className="about-hero-panel-left absolute inset-0 overflow-hidden"
        style={{ zIndex: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <div
          className="about-hero-bg absolute left-0 right-0"
          style={{
            top: "-10%",
            bottom: "-10%",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          <Image
            src={bgImage}
            alt="Grand Pools Hero"
            fill
            priority // <-- Instructs Next.js to preload this immediately at top priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      {/* RIGHT HALF OF IMAGE */}
      <div
        className="about-hero-panel-right absolute inset-0 overflow-hidden"
        style={{ zIndex: 1, clipPath: "inset(0% 0% 0% 0%)" }}
      >
        <div
          className="about-hero-bg absolute left-0 right-0"
          style={{
            top: "-10%",
            bottom: "-10%",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          <Image
            src={bgImage}
            alt="Grand Pools Hero"
            fill
            priority // <-- Instructs Next.js to preload this immediately at top priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-[2]" />

      <div 
        className="about-hero-text-wrap section-container relative z-10 h-full flex flex-col justify-end !pb-22"
      >
        <div className="flex flex-col !gap-4 lg:!gap-8 leading-normal">
          <h1
            className="hero-title text-[#F4EEDF] !font-[100]"
            style={{ 
              fontFamily: "var(--font-display)",
            }}
          >
            Designing Pools
          </h1>
          <p className="hero-desc text-[#F4EEDF] ">
            Creating Experiences
          </p>
        </div>
      </div>
    </section>
  );
}