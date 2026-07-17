"use client";

import { useRef, useState, useEffect } from "react";
import WaveCanvas from "../WaveCanvas";

export default function SectionThree() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offscreen, setOffscreen] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setOffscreen(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-screen overflow-hidden"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      {/* ── DESKTOP: Wave Canvas Layer ── */}
      <div className="hidden md:block absolute inset-0 z-[1] pointer-events-auto w-full h-full">
        <WaveCanvas imageSrc="/sectiontwo.webp" />
      </div>

      {/* ── MOBILE: Static Background Image ── */}
      <div className="block md:hidden absolute inset-0 z-[1] w-full h-full">
        <img
          src="/marvin-van-mobile.webp"
          alt=""
          aria-hidden
          className="w-full h-full object-cover will-change-transform"
          style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
        />
      </div>

      {/* ── Content Layer ── */}
      <div className="section-container relative z-[2] h-full flex flex-col justify-between pb-10 md:pb-14 lg:pb-16">
        {/* TOP CONTENT */}
        <div className="flex flex-col !mt-44">
          <h2 className="s3-reveal-top reveal-text font-display text-[#F4EEDF] leading-[1.2] !font-[100]">
            Built on Trust <br />
          </h2>
          <p className="s3-reveal-top reveal-text font-body text-[#F4EEDF] text-sm md:text-base !mt-3">
            Driven by Excellence
          </p>
        </div>

        {/* BOTTOM RIGHT CONTENT */}
        <div className="flex justify-end">
          <p className="s3-reveal-bottom reveal-text font-body text-[#F4EEDF] text-right lg:text-left max-w-[250px] md:max-w-[280px] lg:max-w-[280px] !mb-33 md:!mb-80 lg:!mb-0">
            At Grand Pools, we create premium pools with expert craftsmanship, innovative design, and personalised service, delivering seamless experiences and exceptional results.
          </p>
        </div>
      </div>
    </section>
  );
}