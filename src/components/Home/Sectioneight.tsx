"use client";

import { useRef, useState, useEffect } from "react";
import WaveCanvas from "../WaveCanvas";

export default function SectionEight() {
  const sectionRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const personRef    = useRef<HTMLDivElement>(null);

  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // ── PRELOAD HIGH-PRIORITY WEBGL TEXTURES ──
  useEffect(() => {
    const desktopSrc = "/Forest.webp";
    const mobileSrc = "/ForestMob.webp";

    const preloadImage = (src: string) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve();
        img.onerror = () => resolve(); 
      });
    };

    Promise.all([preloadImage(desktopSrc), preloadImage(mobileSrc)]).then(() => {
      setAssetsLoaded(true);
    });
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {},
      { threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let mx = 0, my = 0;
    let pX = 0, pY = 0;
    let rafId: number;
    let running = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMouseMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      mx = (e.clientX - r.left)  / r.width  - 0.5;
      my = (e.clientY - r.top)   / r.height - 0.5;
      if (!running) { running = true; rafId = requestAnimationFrame(tick); }
    };

    const onMouseLeave = () => { mx = 0; my = 0; };

    const tick = () => {
      pX = lerp(pX, mx * 28, 0.08);
      pY = lerp(pY, my * 16, 0.08);

      if (personRef.current) {
        personRef.current.style.transform = `translate(${pX}px, ${pY}px)`;
      }

      const settled =
        Math.abs(pX - mx * 28) < 0.05 &&
        Math.abs(pY - my * 16) < 0.05;

      if (settled) { running = false; }
      else { rafId = requestAnimationFrame(tick); }
    };

    el.addEventListener("mousemove",  onMouseMove);
    el.addEventListener("mouseleave", onMouseLeave);
    return () => {
      el.removeEventListener("mousemove",  onMouseMove);
      el.removeEventListener("mouseleave", onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative w-full h-full overflow-hidden"
      style={{ transform: "translateZ(0)", backfaceVisibility: "hidden" }}
    >
      <link rel="preload" href="/Forest.webp" as="image" type="image/webp" />
      <link rel="preload" href="/ForestMob.webp" as="image" type="image/webp" />

      {/* ══════════════════════════════════════
          MOBILE + TABLET LAYOUT
      ══════════════════════════════════════ */}
      <div className="lg:!hidden !absolute !inset-0 !overflow-hidden section-container">
        {/* Layer 1: Static Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center transition-opacity duration-300"
          style={{ 
            backgroundImage: "url('/ForestMob.webp')",
            opacity: assetsLoaded ? 1 : 0 
          }}
        />
        
        {/* Layer 2: Wave Canvas Layer on Top with reduced opacity */}
        <div className="absolute inset-0 z-[1] opacity-10 pointer-events-none w-full h-full">
          {assetsLoaded && <WaveCanvas imageSrc="/ForestMob.webp" />}
        </div>

        <div className="!absolute !top-0 !right-0 !z-20 !flex !flex-col !items-end !gap-4 !pt-[27vh] !px-5">
          <h2 className="!text-[#F4EEDF] !text-right font-display">
            Water as Sanctuary.
          </h2>
          <p className="!text-[#F4EEDF] !text-right !text-[14px] !leading-snug font-body !max-w-[260px]">
            Designed to disappear into the landscape, not announce itself.
            The result isn't a pool. It's a quiet room you walk outside to find.
          </p>
        </div>
      </div>

      {/* ══════════════════════════════════════
          DESKTOP LAYOUT (Preserves structural panels)
      ══════════════════════════════════════ */}
      <div ref={containerRef} className="hidden lg:block absolute inset-0" style={{ overflow: "hidden" }}>

        {/* ══ LEFT panel ══ */}
        <div
          className="s8-panel-left absolute inset-0"
          style={{ clipPath: "inset(0% 50% 0% 0%)" }}
        >
          {/* Container syncing your GSAP 120% moving layers */}
          <div
            className="s8-bg-img absolute left-0 w-full bg-cover bg-top transition-opacity duration-300"
            style={{
              backgroundImage: "url('/Forest.webp')",
              top: 0, height: "120%",
              willChange: "transform",
              opacity: assetsLoaded ? 1 : 0
            }}
          >
            {/* Wave Canvas Layer on Top with reduced opacity */}
            <div className="absolute inset-0 z-[1] opacity-14 pointer-events-none w-full h-full">
              {assetsLoaded && <WaveCanvas imageSrc="/Forest.webp" />}
            </div>
          </div>
          

          <div className="absolute inset-0 z-10 pointer-events-none opacity-70" style={{ background: "#0000007A" }} />
          
          <div
            ref={personRef}
            className="absolute z-20"
            style={{
              bottom: -20, left: "-2%", width: "75%", height: "100%",
              willChange: "transform", pointerEvents: "none",
            }}
          >
            <img
              src="/person.png"
              alt=""
              style={{
                width: "100%", height: "100%", objectFit: "contain",
                objectPosition: "bottom left", mixBlendMode: "screen",
                display: "block", transform: "scaleX(-1)", zIndex: 100,
              }}
            />
          </div>
        </div>

        {/* ══ RIGHT panel ══ */}
        <div
          className="s8-panel-right absolute inset-0"
          style={{ clipPath: "inset(0% 0% 0% 50%)" }}
        >
          {/* Container syncing your GSAP 120% moving layers */}
          <div
            className="s8-bg-img absolute left-0 w-full bg-cover bg-top transition-opacity duration-300"
            style={{
              backgroundImage: "url('/Forest.webp')",
              top: 0, height: "120%",
              willChange: "transform",
              opacity: assetsLoaded ? 1 : 0
            }}
          >
            {/* Wave Canvas Layer on Top with reduced opacity */}
            <div className="absolute inset-0 z-[1] opacity-14 pointer-events-none w-full h-full">
              {assetsLoaded && <WaveCanvas imageSrc="/Forest.webp" />}
            </div>
          </div>
          

          <div className="absolute inset-0 z-10 pointer-events-none opacity-70" style={{ background: "#0000007A" }} />
          
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: 0,
              top: 0,
              height: "100%",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
              paddingLeft: "50%",
            }}
          >
            <div className="flex flex-col gap-5 text-left">
              <h2 className="s8-heading text-[#F4EEDF] font-display">
                Water as Sanctuary.
              </h2>
              <p className="s8-para text-[#F4EEDF] max-w-[300px] font-body">
                Designed to disappear into the landscape, not announce itself.
                The result isn't a pool. It's a quiet room you walk outside to find.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}