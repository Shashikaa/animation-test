"use client";

import { useState } from "react";

export default function SectionOne() {
  const [ctaHovered, setCtaHovered] = useState(false);

  return (
    <section
      className="section-1 absolute inset-0 z-10 overflow-hidden bg-cover bg-center"
      style={{
        backgroundImage: "url('/pool-house.webp')",
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/1" />

      {/* Content */}
      <div className="relative z-10 section-continer min-h-screen flex items-center !pb-[225px]">
        <div
          className="
            w-full
            gap-y-[40px]
            max-w-[572px]
            h-[264px]
     
          
            backdrop-blur-[42px]
            bg-[#19211C]/40
            !pl-[50px]
            !pr-[80px]
            flex
            flex-col
            justify-center
            shadow-[-5px_-5px_25px_rgba(255,255,255,0.02)_inset]
          "
        >
          <p className="text-[#F4EEDF] text-body leading-[1.5] font-light">
            With expert craftsmanship and attention to detail, we bring
            your vision to life. Whether you need a backyard retreat or a
            high-end commercial pool, our team ensures a seamless
            experience from design to completion.
          </p>

<a
  href="/contact"
  className="
    group
    relative
    mt-[44px]
    inline-block
    w-fit
    pb-[8px]
    text-[14px]
    font-medium
    uppercase
    text-[#F4EEDF]
    transition-opacity
    duration-200
    hover:opacity-70
  "
>
  Get a free consultation

<span
  className="
    absolute
    left-0
    right-0
    bottom-0
    h-px
    bg-[#F4EEDF]
    translate-y-[8px]
    transition-transform
    duration-300
    group-hover:translate-y-[6px]
  "
/>
</a>
        </div>
      </div>
    </section>
  );
}