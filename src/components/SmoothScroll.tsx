"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import { setScrollVelocity } from "../app/utils/scrollVelocity";

gsap.registerPlugin(ScrollTrigger);

// ─── Constants ────────────────────────────────────────────────────────────────
const MAX_SCROLL_PX_PER_FRAME = 300;
const MAX_PROGRESS_DELTA      = 0.009;

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const thumbRef          = useRef<HTMLDivElement>(null);
  const scrollTimerRef    = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastScrollRef     = useRef<number>(-1);
  const { lenisRef, preloaderDone, setOnScrollReady } = useSite();
  const pathname          = usePathname();

  // ── Create Lenis once ───────────────────────────────────────────────────────
  useEffect(() => {
    const isTouch = ScrollTrigger.isTouch > 0;

    const lenis = new Lenis({
      // ── lerp ──────────────────────────────────────────────────────────────
      // Desktop lowered from 0.11 → 0.07. Higher values cause Lenis to snap
      // to the target scroll position too quickly, giving the scrubbed GSAP
      // timeline a "fast jump" character. 0.07 extends the deceleration tail
      // so the timeline has time to animate through its easing curves rather
      // than being dragged through them in a single burst.
      lerp: isTouch ? 0.09 : 0.07,

      orientation:        "vertical",
      gestureOrientation: "vertical",
      smoothWheel:        true,

      // ── wheelMultiplier ───────────────────────────────────────────────────
      // Desktop lowered from 1.0 → 0.75. The scrub timeline covers 17000px —
      // a full-speed wheel event at 1.0 moves the scroll target far enough to
      // advance several sections in one burst. 0.75 scales that down so each
      // wheel tick drives a more controlled distance, giving the lerp and speed
      // controller enough frames to ease between sections naturally.
      wheelMultiplier: isTouch ? 0.8 : 0.75,

      syncTouch:     false,
      syncTouchLerp: 0.09,

      touchMultiplier: isTouch ? 2.0 : 1.5,
      infinite:        false,
      autoRaf:         false,
      prevent: (node: Element) => node.closest("[data-lenis-prevent]") !== null,
    });

    lenisRef.current = lenis;
    lenis.stop();

    // ── RAF tick ───────────────────────────────────────────────────────────
    const tick = (time: number) => {
      if (lastScrollRef.current === -1) {
        lastScrollRef.current = lenis.scroll;
      }

      const target  = (lenis as any).targetScroll ?? lenis.scroll;
      const current = lenis.scroll;
      const delta   = target - current;
      const clamped = Math.sign(delta) * Math.min(Math.abs(delta), MAX_SCROLL_PX_PER_FRAME);

      if (Math.abs(delta) > MAX_SCROLL_PX_PER_FRAME) {
        (lenis as any).targetScroll = current + clamped;
      }

      lenis.raf(time * 1000);
      lastScrollRef.current = lenis.scroll;
    };

    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // ── Pinned ScrollTrigger progress cap ─────────────────────────────────
    let lastProgress = 0;

    const capProgress = () => {
      if (!(lenis as any).isScrolling) return;

      const st = ScrollTrigger.getAll().find(t => t.pin);
      if (!st) return;

      const raw        = st.progress;
      const maxAdvance = lastProgress + MAX_PROGRESS_DELTA;
      const maxRetreat = lastProgress - MAX_PROGRESS_DELTA;

      if (raw > maxAdvance) {
        st.scroll(st.start + maxAdvance * (st.end - st.start));
      } else if (raw < maxRetreat) {
        st.scroll(st.start + maxRetreat * (st.end - st.start));
      }
      lastProgress = st.progress;
    };

    gsap.ticker.add(capProgress, false);

    // ── Scroll event ───────────────────────────────────────────────────────
    const onScroll = (e: { velocity?: number }) => {
      ScrollTrigger.update();
      setScrollVelocity(Math.abs(e.velocity ?? 0));
      window.dispatchEvent(new Event("lenis-scroll"));
    };

    lenis.on("scroll", onScroll);

    // ── Visibility change recovery ─────────────────────────────────────────
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      document.documentElement.style.pointerEvents = "";
      document.body.style.pointerEvents            = "";

      gsap.ticker.wake();

      if (lenisRef.current) {
        (lenisRef.current as any).targetScroll = lenisRef.current.scroll;
        lenisRef.current.start();
      }

      ScrollTrigger.update();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // ── Custom scrollbar thumb ─────────────────────────────────────────────
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
      gsap.ticker.remove(capProgress);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [lenisRef]);

  // ── Register the onScrollReady callback ────────────────────────────────────
  // Called by the preloader (or anything else) to start scroll when ready.
  useEffect(() => {
    setOnScrollReady(() => {
      if (lenisRef.current) {
        lastScrollRef.current = lenisRef.current.scroll;
        lenisRef.current.start();
      }
    });

    // Cleanup: don't leave a stale callback pointing at an unmounted component
    return () => {
      setOnScrollReady(() => {});
    };
  }, [setOnScrollReady, lenisRef]);

  // ── Re-enable scroll on every route change ─────────────────────────────────
  // On the home page the preloader calls onScrollReady once. On every other
  // page, or when navigating BACK to a page, nothing calls lenis.start() —
  // so we do it here after a single paint-frame to let Next.js settle the DOM.
  useEffect(() => {
    // If the preloader is still running (first home visit) leave it in charge.
    if (!preloaderDone) return;

    const id = setTimeout(() => {
      if (!lenisRef.current) return;

      // Snap targetScroll to current position so there's no catch-up lurch
      (lenisRef.current as any).targetScroll = lenisRef.current.scroll;
      lastScrollRef.current = lenisRef.current.scroll;

      lenisRef.current.start();
      ScrollTrigger.refresh();
    }, 50); // one paint frame — enough for Next.js soft-nav to finish

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