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
      // lerp: 0.1 — the sweet spot for "buttery not laggy".
      // 0.05–0.06 felt like wading through mud; 0.1 gives the smooth
      // exponential decay you want while still responding immediately
      // to input. Think of it as 10% of the distance closed per frame
      // at 60fps — fast enough to feel live, slow enough to feel eased.
      lerp:               0.08,

      orientation:        "vertical",
      gestureOrientation: "vertical",
      smoothWheel:        true,

      // 0.8 — back to a natural wheel speed. The lower multipliers
      // (0.4–0.45) were making the page feel resistant, not smooth.
      // Buttery feel comes from lerp easing, not from slowing input.
      wheelMultiplier:    0.75,

      // 1.5 — natural touch speed
      touchMultiplier:    1.5,

      syncTouch:          false,
      infinite:           false,
      autoRaf:            false,
    });

    lenisRef.current = lenis;
    if (!preloaderDone) lenis.stop();

    lenis.on("scroll", ScrollTrigger.update);
    lenis.on("scroll", () => {
      window.dispatchEvent(new Event("lenis-scroll"));
    });

    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // ── Scrollbar thumb ─────────────────────────────────────────
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