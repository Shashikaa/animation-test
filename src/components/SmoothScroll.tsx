"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const thumbRef       = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
const lenis = new Lenis({
  duration:        1.6,       // long momentum tail
  wheelMultiplier: 0.9,       // heavier, more deliberate
  touchMultiplier: 1.0,
  smoothWheel:     true,
  easing:          (t) => 1 - Math.pow(1 - t, 4), // quartic ease-out — slow, drifting end
});
    let thumbVisible = false;

    lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) => {
      ScrollTrigger.update();

      // Move thumb
      if (thumbRef.current) {
        const trackH = window.innerHeight;
        const thumbH = Math.max((trackH / (limit + trackH)) * trackH, 40);
        const maxTop = trackH - thumbH;
        const top    = (scroll / limit) * maxTop;

        thumbRef.current.style.height    = `${thumbH}px`;
        thumbRef.current.style.transform = `translateY(${top}px)`;
      }

      // Show thumb
      if (!thumbVisible && thumbRef.current) {
        thumbVisible = true;
        thumbRef.current.style.opacity = "1";
      }

      // Hide thumb after idle — use ref so we don't recreate a closure every scroll
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        thumbVisible = false;
        if (thumbRef.current) thumbRef.current.style.opacity = "0";
      }, 800);
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    // Allow up to 33 ms before lag smoothing kicks in — prevents jank on slow devices
    // (lagSmoothing(0) disables this protection entirely, which causes jank instead)
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
      clearTimeout(scrollTimerRef.current);
    };
  }, []);

  return (
    <>
      {children}

      {/* Custom scrollbar thumb */}
      <div
        style={{
          position:      "fixed",
          top:           0,
          right:         0,
          width:         "4px",
          height:        "100vh",
          zIndex:        99999,
          pointerEvents: "none",
        }}
      >
        <div
          ref={thumbRef}
          style={{
            position:     "absolute",
            top:          0,
            right:        0,
            width:        "4px",
            background:   "rgba(255,255,255,0.35)",
            borderRadius: "999px",
            opacity:      0,
            transition:   "opacity 0.3s ease, background 0.2s ease",
            willChange:   "transform",
          }}
        />
      </div>
    </>
  );
}