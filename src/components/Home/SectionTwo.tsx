"use client";

import { useRef, useState, useEffect } from "react";
// 1. Swapped import from WaterBackground to LiquidCanvas
import LiquidCanvas from "../LiquidCanvas";

export default function SectionTwo() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offscreen, setOffscreen] = useState(false);
  // 2. Track asset initialization to prevent un-cached canvas flickering
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // ── PRELOAD HIGH-PRIORITY WEBGL TEXTURES ──
  useEffect(() => {
    const desktopSrc = "/sectwo.webp";
    const mobileSrc = "/marvin-van-mobile.webp";

    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Fallback smoothly if block fails
      });
    };

    Promise.all([preloadImage(desktopSrc), preloadImage(mobileSrc)]).then(() => {
      setAssetsLoaded(true);
    });
  }, []);

  // Pause canvas animations when off-screen
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
      className="relative w-full h-full overflow-hidden"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      {/* Dynamic Link Preload Tags injected into Head on-the-fly */}
      <link rel="preload" href="/sectwo.webp" as="image" type="image/webp" />
      <link rel="preload" href="/marvin-van-mobile.webp" as="image" type="image/webp" />

      {/* 3. Liquid Canvas Background — Handles responsive source swap inside WebGL */}
      <div 
        className="s2-bg absolute inset-0 z-0 transition-opacity duration-300"
        style={{ opacity: assetsLoaded ? 1 : 0 }}
      >
        {assetsLoaded && (
          <LiquidCanvas 
            imageSrc={typeof window !== "undefined" && window.innerWidth < 768 ? "/marvin-van-mobile.webp" : "/sectwo.webp"} 
        // Passing down the intersection observer state if LiquidCanvas supports it
          />
        )}
      </div>

      <div className="section-continer relative z-[2] h-full flex flex-col justify-between pb-10 md:pb-14 lg:pb-16">
        {/* TOP */}
        <div className="flex flex-col !mt-44">
          <h2 className="s2-title-main font-display text-[#F4EEDF] leading-[1.2] !font-[100]">
            Premium Pool <br />
          </h2>
          <p className="s2-title-sub font-body text-[#F4EEDF] text-sm md:text-base !mt-1">
            Solution For Every Need
          </p>
        </div>

        {/* BOTTOM RIGHT */}
        <div className="flex justify-end">
          <p className="s2-body font-body text-[#F4EEDF] text-right max-w-[220px] md:max-w-[280px] lg:max-w-[280px] !mb-33 md:!mb-80 lg:!mb-0">
            From renovations to new builds, we design and construct pools that
            combine style, functionality, and durability.
          </p>
        </div>
      </div>
    </section>
  );
}