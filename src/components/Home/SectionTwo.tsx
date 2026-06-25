"use client";

import { useRef, useState, useEffect } from "react";
import WaveCanvas from "../WaveCanvas";

export default function SectionTwo() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offscreen, setOffscreen] = useState(false);
  const [canvasLoaded, setCanvasLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const desktopSrc = "/sectiontwo.webp";
    const mobileSrc = "/marvin-van-mobile.webp";

    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve(); 
      });
    };

    Promise.all([preloadImage(desktopSrc), preloadImage(mobileSrc)]).then(() => {});
  }, []);

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

  const activeBgImage = isMobile ? "/marvin-van-mobile.webp" : "/sectiontwo.webp";

  return (
    <section
      ref={sectionRef}
      className="relative w-full h-full overflow-hidden"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      {/* Background Layer Group — Images are set as the base layer here */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-500 s2-bg"
        style={{ backgroundImage: `url(${activeBgImage})` }}
      >
        
        {/* WebGL Wave Canvas Container — Overlays the background at 0.2 opacity */}
        <div 
          className="absolute inset-0 w-full h-full transition-opacity duration-700"
          style={{ 
            zIndex: 1,
            opacity: canvasLoaded ? 0.1 : 0, // Clamped to a max opacity of 0.2
          }}
        >
          <WaveCanvas 
            imageSrc={activeBgImage} 
            onReady={() => setCanvasLoaded(true)} 
          />
        </div>
        
      </div>

      {/* Content Overlay */}
      <div className="section-container relative z-[2] h-full flex flex-col justify-between pb-10 md:pb-14 lg:pb-16">
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