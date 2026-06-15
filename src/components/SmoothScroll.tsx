"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import { setScrollVelocity } from "../app/utils/scrollVelocity";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const thumbRef       = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { lenisRef, preloaderDone, setOnScrollReady } = useSite();
  const pathname = usePathname();

  // ── Create Lenis once ───────────────────────────────────────────────────
  useEffect(() => {
    const isTouch = ScrollTrigger.isTouch > 0;

    const lenis = new Lenis({
      // lerp controls how "buttery" the scroll feels — lower = smoother
      // glide, higher = snappier/more direct. 0.1 is a good buttery default.
      lerp: isTouch ? 0.1 : 0.085,

      orientation:        "vertical",
      gestureOrientation: "vertical",
      smoothWheel:        true,

      // Keep close to 1 so wheel input feels natural; let lerp do the
      // smoothing rather than scaling input down.
      wheelMultiplier: isTouch ? 1.0 : 1.0,

      syncTouch:       false,
      touchMultiplier: isTouch ? 1.5 : 1.5,

      infinite: false,
      autoRaf:  false,
      prevent: (node: Element) => node.closest("[data-lenis-prevent]") !== null,
    });

    lenisRef.current = lenis;
    lenis.stop();

    // ── RAF tick ─────────────────────────────────────────────────────────
    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // ── Scroll event ─────────────────────────────────────────────────────
    const onScroll = (e: { velocity?: number }) => {
      ScrollTrigger.update();
      setScrollVelocity(Math.abs(e.velocity ?? 0));
      window.dispatchEvent(new Event("lenis-scroll"));
    };

    lenis.on("scroll", onScroll);

    // ── Visibility change recovery ──────────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      document.documentElement.style.pointerEvents = "";
      document.body.style.pointerEvents            = "";

      gsap.ticker.wake();

      if (lenisRef.current) {
        lenisRef.current.start();
      }

      ScrollTrigger.update();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ── Custom scrollbar thumb ──────────────────────────────────────────
    let thumbVisible = false;

    const updateThumb = () => {
      if (isTouch || !thumbRef.current) return;

      const scroll = lenis.scroll;
      const limit  = lenis.limit;
      const trackH = visualViewport?.height ?? window.innerHeight;
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
      setScrollVelocity(0);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      lenis.off("scroll", onScroll);
      lenis.off("scroll", updateThumb);
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [lenisRef]);

  // ── Register the onScrollReady callback ─────────────────────────────────
  useEffect(() => {
    setOnScrollReady(() => {
      if (lenisRef.current) {
        lenisRef.current.start();
      }
    });

    return () => {
      setOnScrollReady(() => {});
    };
  }, [setOnScrollReady, lenisRef]);

  // ── Re-enable scroll on every route change ──────────────────────────────
  useEffect(() => {
    if (!preloaderDone) return;

    const id = setTimeout(() => {
      if (!lenisRef.current) return;

      lenisRef.current.start();
      ScrollTrigger.refresh();
    }, 50);

    return () => clearTimeout(id);
  }, [pathname, preloaderDone, lenisRef]);

  return (
    <>
      {children}

      {/* Custom scrollbar — desktop only */}
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