"use client";

import Image from "next/image";

interface ContactHeroProps {
  hideText?: boolean;
  isMobile?: boolean;
}

export default function ContactHero({
  hideText = false,
  isMobile = false,
}: ContactHeroProps) {
  const desktopImg = "/contacthero.webp";
  const mobileImg = "/contacthero.webp";
  const bgImage = isMobile ? mobileImg : desktopImg;

  return (
    <section className="relative w-full h-full overflow-hidden bg-transparent [contain:strict] [transform:translateZ(0)]">
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-[1] overflow-hidden">
        <div className="hero-bg-target absolute -top-[10%] -bottom-[10%] h-[120%] w-full [backface-visibility:hidden]">
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

      {/* Overlay Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 z-[2]" />

      {/* Hero Content */}
      {!hideText && (
        <div className="section-container relative z-10 h-full flex flex-col justify-end !pb-22 w-full">
          <div className="flex flex-col !gap-4 lg:!gap-8 leading-normal">
            <h1
              className="hero-text-target hero-title-target text-[#F4EEDF] !font-[100]"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Let’s Bring Your
              <br />
              Dream Pool to Life
            </h1>
            <p className="hero-text-target hero-desc-target text-[#F4EEDF] max-w-[434px]">
              Have a question or are you ready to start your project? Get in touch with our friendly team. We’re here to help every step of the way, from planning to completion.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}