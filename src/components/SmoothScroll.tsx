"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import { setScrollVelocity } from "../app/utils/scrollVelocity";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const thumbRef       = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { smootherRef, preloaderDone, setOnScrollReady } = useSite();
  const pathname = usePathname();

  useEffect(() => {
    const isTouch = ScrollTrigger.isTouch > 0;
    if (isTouch) return;

    const smoother = ScrollSmoother.create({
      wrapper:            "#smooth-wrapper",
      content:            "#smooth-content",
      smooth:             1.2,
      smoothTouch:        false,
      effects:            true,
      normalizeScroll:    false,
      ignoreMobileResize: true,
    });

    smoother.paused(true);
    smootherRef.current = smoother;
    gsap.ticker.lagSmoothing(0);

    let lastY        = 0;
    let lastTime     = performance.now();
    let thumbVisible = false;

    const onScroll = () => {
      ScrollTrigger.update();

      const now = performance.now();
      const dt  = now - lastTime || 1;
      const y   = window.scrollY;

      setScrollVelocity(Math.abs((y - lastY) / dt) * 1000);
      lastY    = y;
      lastTime = now;

      window.dispatchEvent(new Event("lenis-scroll"));

      if (!thumbRef.current) return;
      const limit  = document.documentElement.scrollHeight - window.innerHeight;
      const trackH = window.innerHeight;
      const thumbH = Math.max((trackH / (limit + trackH)) * trackH, 40);
      const maxTop = trackH - thumbH;
      const top    = limit > 0 ? (y / limit) * maxTop : 0;

      thumbRef.current.style.height    = `${thumbH}px`;
      thumbRef.current.style.transform = `translateY(${top}px)`;

      if (y > 1 && !thumbVisible) {
        thumbVisible = true;
        thumbRef.current.style.opacity = "1";
      }
      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        thumbVisible = false;
        if (thumbRef.current) thumbRef.current.style.opacity = "0";
      }, 800);
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;
      document.documentElement.style.pointerEvents = "";
      document.body.style.pointerEvents            = "";
      gsap.ticker.wake();
      smoother.paused(false);
      ScrollTrigger.update();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      clearTimeout(scrollTimerRef.current);
      setScrollVelocity(0);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      smoother.kill();
      smootherRef.current = null;
    };
  }, [smootherRef]);

  useEffect(() => {
    setOnScrollReady(() => {
      smootherRef.current?.paused(false);
    });
    return () => { setOnScrollReady(() => {}); };
  }, [setOnScrollReady, smootherRef]);

  useEffect(() => {
    if (!preloaderDone) return;
    const id = setTimeout(() => {
      smootherRef.current?.paused(false);
      ScrollTrigger.refresh();
    }, 50);
    return () => clearTimeout(id);
  }, [pathname, preloaderDone, smootherRef]);

  return (
    <>
      <div id="smooth-wrapper">
        <div id="smooth-content">
          {children}
        </div>
      </div>

      <div
        style={{
          position:      "fixed",
          top:           0,
          right:         0,
          width:         "6px",
          height:        "100lvh",
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