"use client";

import { useEffect, useRef } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useSite } from "../app/context/SiteContext";
import { setScrollVelocity } from "../app/utils/scrollVelocity";

gsap.registerPlugin(ScrollTrigger);

const MAX_SCROLL_PX_PER_FRAME = 190;
const MAX_PROGRESS_DELTA      = 0.009;

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const thumbRef       = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastScrollRef  = useRef<number>(-1);
  const { lenisRef, preloaderDone, setOnScrollReady } = useSite();

  useEffect(() => {
    const isTouch = ScrollTrigger.isTouch > 0;

    const lenis = new Lenis({
      lerp:               isTouch ? 0.06 : 0.08,
      orientation:        "vertical",
      gestureOrientation: "vertical",
      smoothWheel:        true,
      wheelMultiplier:    isTouch ? 0.7 : 0.75,
      syncTouch:          isTouch,
      syncTouchLerp:      0.075,
      touchMultiplier:    isTouch ? 0.8 : 1.5,
      infinite:           false,
      autoRaf:            false,
      prevent: (node: Element) => node.closest("[data-lenis-prevent]") !== null,
    });

    lenisRef.current = lenis;
    lenis.stop();

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

    let lastProgress = 0;

    const capProgress = () => {
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

    const onScroll = (e: { velocity?: number }) => {
      ScrollTrigger.update();
      setScrollVelocity(Math.abs(e.velocity ?? 0));
      window.dispatchEvent(new Event("lenis-scroll"));
    };

    lenis.on("scroll", onScroll);

    // ── Visibility change handler ─────────────────────────────────────────
    // DO NOT call ScrollTrigger.refresh() here — it recalculates pin geometry
    // and can reset scrub progress, causing a dead-scroll window.
    // ScrollTrigger.update() (no args) re-evaluates position only.
    const handleVisibilityChange = () => {
      if (document.visibilityState !== "visible") return;

      // Restore pointer events immediately
      document.documentElement.style.pointerEvents = "";
      document.body.style.pointerEvents = "";

      // Wake GSAP ticker — browsers pause rAF in background tabs
      gsap.ticker.wake();

      // Re-sync Lenis internal target to current scroll so it doesn't
      // jump when resuming after the tab was hidden
      if (lenisRef.current) {
        (lenisRef.current as any).targetScroll = lenisRef.current.scroll;
        lenisRef.current.start();
      }

      // Light re-evaluation only — no geometry recalculation
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
      gsap.ticker.remove(capProgress);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [lenisRef]);

  useEffect(() => {
    setOnScrollReady(() => {
      if (lenisRef.current) {
        lastScrollRef.current = lenisRef.current.scroll;
        lenisRef.current.start();
      }
    });
  }, [setOnScrollReady, lenisRef]);

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