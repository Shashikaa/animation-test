"use client";

import { useRef } from "react";
import Image from "next/image";

interface ContactHeroProps {
  hideText?: boolean;
  isMobile?: boolean;
}

export default function ContactHero({
  hideText = false,
  isMobile = false,
}: ContactHeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  const desktopImg = "/contacthero.webp";
  const mobileImg = "/contacthero.webp";

  const bgImage = isMobile ? mobileImg : desktopImg;

  return (
    <section ref={sectionRef} className="relative w-full h-full overflow-hidden bg-[#111]">
      {/* BACKGROUND IMAGE CONTAINER */}
      <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 1 }}>
        <div
          className="contact-hero-bg absolute left-0 right-0"
          style={{
            top: "-10%",
            bottom: "-10%",
            willChange: "transform",
            backfaceVisibility: "hidden",
          }}
        >
          <Image
            src={bgImage}
            alt="Contact Grand Pools Hero"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-center"
          />
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-[2]" />

      {!hideText && (
        <div className="hero-text-wrap section-container relative z-10 h-full flex flex-col justify-end !pb-22 will-change-[opacity,transform]">
          <div className="flex flex-col !gap-4 lg:!gap-8">
            <h1
              className="hero-title text-[#F4EEDF] !font-[100]"
              style={{
                fontFamily: "var(--font-display)",
              }}
            >
              Let’s Bring Your
              <br />
              Dream Pool to Life
            </h1>
            <p className="hero-desc text-[#F4EEDF] max-w-[434px]">
              Have a question or ready to start your project? Get in touch with
              our friendly team. We’re here to help every step of the way, from
              planning to completion.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}