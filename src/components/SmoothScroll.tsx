"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.4,
      wheelMultiplier: 3.0,
      touchMultiplier: 3.0,
      smoothWheel: true,
      easing: (t) => t,
    });

    let scrollTimer: ReturnType<typeof setTimeout>;
    let thumbVisible = false;

    lenis.on("scroll", ({ scroll, limit }: { scroll: number; limit: number }) => {
      ScrollTrigger.update();

      // Move thumb
      if (thumbRef.current) {
        const trackH = window.innerHeight;
        const thumbH = Math.max((trackH / (limit + trackH)) * trackH, 40);
        const maxTop = trackH - thumbH;
        const top = (scroll / limit) * maxTop;

        thumbRef.current.style.height = `${thumbH}px`;
        thumbRef.current.style.transform = `translateY(${top}px)`;
      }

      // Show/hide
      if (!thumbVisible && thumbRef.current) {
        thumbVisible = true;
        thumbRef.current.style.opacity = "1";
      }
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        thumbVisible = false;
        if (thumbRef.current) thumbRef.current.style.opacity = "0";
      }, 800);
    });

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove(tick);
      clearTimeout(scrollTimer);
    };
  }, []);

  return (
    <>
      {children}

      {/* Custom scrollbar thumb */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "4px",
          height: "100vh",
          zIndex: 99999,
          pointerEvents: "none",
        }}
      >
        <div
          ref={thumbRef}
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "4px",
            background: "rgba(255,255,255,0.35)",
            borderRadius: "999px",
            opacity: 0,
            transition: "opacity 0.3s ease, background 0.2s ease",
            willChange: "transform",
          }}
        />
      </div>
    </>
  );
}