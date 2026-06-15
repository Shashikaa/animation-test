"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import { setScrollVelocity } from "../app/utils/scrollVelocity";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ─── Shared viewport-height helpers ────────────────────────────────────────
//
// WHY THIS EXISTS:
// On mobile, the browser address bar slides in/out as the user scrolls.
// When it hides, the visible viewport grows; when it shows, it shrinks.
// GSAP pins `.pin-all` at a fixed pixel height, so without correction the
// pinned element is shorter than the screen → a gap appears at the bottom.
//
// THE FIX (three layers, all in sync):
//  1. CSS custom property `--vh` on <html>  →  used by `.pin-all` in CSS as
//     a fallback before JS fires and as the source-of-truth for CSS calc().
//  2. Inline `style.height` on `.pin-all`  →  gives GSAP the correct value
//     when it measures the pin trigger's dimensions.
//  3. `.site-root::after` background fill  →  covers the momentary gap
//     between the address bar finishing its animation and JS updating the
//     above two values (handled purely in CSS / globals.css).
//
// We listen to `visualViewport "resize"` (fires once the bar is fully
// shown/hidden) rather than `"scroll"` (fires every pixel during animation).
// We NEVER call ScrollTrigger.refresh() here — ignoreMobileResize handles it.
// ───────────────────────────────────────────────────────────────────────────

export const getVvHeight = (): number =>
  (typeof visualViewport !== "undefined" && visualViewport != null
    ? visualViewport.height
    : null) ?? window.innerHeight;

/** Updates both the CSS custom prop and the element's inline height. */
export const syncVh = (): void => {
  const h = getVvHeight();

  // 1. CSS custom property — consumed by `.pin-all { height: calc(var(--vh) * 100) }`
  document.documentElement.style.setProperty("--vh", `${h * 0.01}px`);

  // 2. Inline style — consumed by GSAP when it measures the pin trigger
  const el = document.querySelector<HTMLElement>(".pin-all");
  if (el) el.style.height = `${h}px`;
};

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const thumbRef       = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const { lenisRef, preloaderDone, setOnScrollReady } = useSite();
  const pathname = usePathname();

  // ── Set --vh immediately on mount ──────────────────────────────────────
  // This runs before any section component renders, so the CSS custom prop
  // is correct on the very first paint — no layout shift.
  useEffect(() => {
    syncVh();

    const vv = typeof visualViewport !== "undefined" ? visualViewport : null;

    // "resize" fires once the address bar finishes showing/hiding.
    // "scroll" fires every pixel during the transition — too noisy.
    vv?.addEventListener("resize", syncVh);
    window.addEventListener("resize", syncVh);

    return () => {
      vv?.removeEventListener("resize", syncVh);
      window.removeEventListener("resize", syncVh);
    };
  }, []);

  // ── Create Lenis once ───────────────────────────────────────────────────
  useEffect(() => {
    const isTouch = ScrollTrigger.isTouch > 0;

    const lenis = new Lenis({
      lerp: isTouch ? 0.1 : 0.085,

      orientation:        "vertical",
      gestureOrientation: "vertical",
      smoothWheel:        true,

      wheelMultiplier: isTouch ? 1.0 : 0.85,

      syncTouch:       false,
      touchMultiplier: isTouch ? 1.5 : 1.5,

      infinite: false,
      autoRaf:  false,
      prevent: (node: Element) => node.closest("[data-lenis-prevent]") !== null,
    });

    lenisRef.current = lenis;
    lenis.stop();

    const tick = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onScroll = (e: { velocity?: number }) => {
      ScrollTrigger.update();
      setScrollVelocity(Math.abs(e.velocity ?? 0));
      window.dispatchEvent(new Event("lenis-scroll"));
    };

    lenis.on("scroll", onScroll);

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