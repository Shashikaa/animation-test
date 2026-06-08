"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "../app/context/SiteContext";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const thumbRef       = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { lenisRef, preloaderDone } = useSite();

  useEffect(() => {
    const lenis = new Lenis({
      duration:           1.4,
      easing:             (t: number) => 1 - Math.pow(1 - t, 4),
      orientation:        "vertical",
      gestureOrientation: "vertical",
      smoothWheel:        true,
      wheelMultiplier:    0.9,
      touchMultiplier:    1.8,
      syncTouch:          true,
      infinite:           false,
      autoRaf:            false,
    });

    lenisRef.current = lenis;
    if (!preloaderDone) lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);

    // Dispatch custom event so page.tsx knows Lenis has ticked at least once.
    // This is consumed by waitForLenisAndIdle() to gate ScrollTrigger.refresh().
    lenis.on("scroll", () => {
      window.dispatchEvent(new Event("lenis-scroll"));
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // ── Scrollbar thumb ───────────────────────────────────────────
    let thumbVisible = false;

    const updateThumb = () => {
      if (!thumbRef.current) return;
      const scroll = lenis.scroll;
      const limit  = lenis.limit;
      const trackH = window.innerHeight;
      const thumbH = Math.max((trackH / (limit + trackH)) * trackH, 40);
      const maxTop = trackH - thumbH;
      const top    = limit > 0 ? (scroll / limit) * maxTop : 0;
      thumbRef.current.style.height    = `${thumbH}px`;
      thumbRef.current.style.transform = `translateY(${top}px)`;

      if (scroll > 1 && !thumbVisible) {
        thumbVisible = true;
        thumbRef.current.style.opacity = "1";
      }
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        thumbVisible = false;
        if (thumbRef.current) thumbRef.current.style.opacity = "0";
      }, 800);
    };

    lenis.on("scroll", updateThumb);

    return () => {
      clearTimeout(scrollTimerRef.current);
      lenis.off("scroll", ScrollTrigger.update);
      lenis.off("scroll", updateThumb);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [preloaderDone, lenisRef]);

  return (
    <>
      {children}
      <div
        style={{
          position:      "fixed",
          top:           0,
          right:         0,
          width:         "6px",
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
            right:        "2px",
            width:        "4px",
            background:   "rgba(255,255,255,0.4)",
            borderRadius: "999px",
            opacity:      0,
            transition:   "opacity 0.3s ease",
            willChange:   "transform",
          }}
        />
      </div>
    </>
  );
}