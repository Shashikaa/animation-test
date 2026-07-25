"use client";

import { useRef, useState, useEffect } from "react";
import WaveCanvas from "../WaveCanvas";

export default function SectionEight({ preloaderDone }: { preloaderDone?: boolean }) {
  const sectionRef   = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const personRef    = useRef<HTMLDivElement>(null);
  const bgParallaxRef = useRef<HTMLDivElement>(null);

  const [assetsLoaded] = useState(true);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;

      const moveX = (clientX / innerWidth) - 0.5;
      const moveY = (clientY / innerHeight) - 0.5;

      const bgIntensity = 6;
      const personIntensity = -45;

      if (bgParallaxRef.current) {
        bgParallaxRef.current.style.transform = `translate3d(${moveX * bgIntensity}px, ${moveY * bgIntensity}px, 0)`;
      }
      if (personRef.current) {
        personRef.current.style.transform = `translate3d(${moveX * personIntensity}px, ${moveY * personIntensity}px, 0)`;
      }
    };

    const handleMouseEnter = () => {
      if (bgParallaxRef.current) bgParallaxRef.current.style.transition = "none";
      if (personRef.current) personRef.current.style.transition = "none";
    };

    const handleMouseLeave = () => {
      if (bgParallaxRef.current) {
        bgParallaxRef.current.style.transition = "transform 0.6s ease-out";
        bgParallaxRef.current.style.transform = "translate3d(0,0,0)";
      }
      if (personRef.current) {
        personRef.current.style.transition = "transform 0.6s ease-out";
        personRef.current.style.transform = "translate3d(0,0,0)";
      }
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseenter", handleMouseEnter);
    container.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseenter", handleMouseEnter);
      container.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      className="relative w-full h-full overflow-hidden"
      style={{ transform: "translate3d(0,0,0)", backfaceVisibility: "hidden" }}
    >
      <link rel="preload" href="/Forest.webp" as="image" type="image/webp" />
      <link rel="preload" href="/ForestMob.webp" as="image" type="image/webp" />

      {/* MOBILE + TABLET LAYOUT */}
      <div className="lg:!hidden !absolute !inset-0 !overflow-hidden section-container">
        <div className="s8-mob-bg absolute inset-0 z-[1] w-full h-full overflow-hidden">
          <img 
            src="/ForestMob.webp" 
            alt="Forest" 
            className="w-full h-full object-cover" 
            style={{ 
              width: "100%", 
              height: "100%", 
              objectFit: "cover",
              opacity: assetsLoaded ? 1 : 0,
              transition: "opacity 0.3s"
            }}
          />
        </div>

        <div className="!absolute !top-0 !left-0 !z-20 !flex !flex-col !items-start !gap-7 !pt-[12vh] !px-5">
          <h2 className="s8-heading !text-[#F4EEDF] !text-left font-display">
            Water as Sanctuary.
          </h2>
          <p className="s8-para !text-[#F4EEDF] !text-left font-body max-w-[300px]">
            Designed to disappear into the landscape, not announce itself.
            The result isn't a pool. It's a quiet room you walk outside to find.
          </p>
        </div>
      </div>

      {/* DESKTOP LAYOUT */}
      <div ref={containerRef} className="hidden lg:block absolute inset-0" style={{ overflow: "hidden" }}>
        
        <div
          className="s8-bg-img absolute inset-0 w-full"
          style={{
            top: "-10%", 
            height: "120%",
            willChange: "transform",
            opacity: assetsLoaded ? 1 : 0,
            transition: "opacity 0.4s ease-out"
          }}
        >
          <div 
            ref={bgParallaxRef} 
            className="absolute inset-0 w-full h-full"
            style={{ willChange: "transform" }}
          >
            <div className="absolute inset-0 z-[1] pointer-events-none w-full h-full">
              <WaveCanvas imageSrc="/Forest.webp" preloaderDone={preloaderDone} />
            </div>
          </div>
        </div>
        
        {/* Dark Overlay */}
        <div 
          className="absolute inset-0 z-10 pointer-events-none opacity-10" 
          style={{ background: "linear-gradient(135deg, #162D24 0%, #094146 100%)" }} 
        />
        
        {/* Foreground Content Stack */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <div
            ref={personRef}
            className="absolute bottom-[-30px] left-[6vw] h-[105%] w-[75%]"
            style={{ willChange: "transform" }}
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

          <div className="absolute left-1/2 top-1/2 -translate-y-1/2 flex flex-col gap-5 text-left ">
            <h2 className="s8-heading text-[#F4EEDF] font-display whitespace-nowrap reveal-text">
              Water as Sanctuary.
            </h2>
            <p className="s8-para text-[#F4EEDF] font-body leading-relaxed max-w-[330px] reveal-text">
              Designed to disappear into the landscape, not announce itself.
              The result isn't a pool. It's a quiet room you walk outside to find.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}