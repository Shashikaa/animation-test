"use client";

import { useEffect, useRef, useCallback } from "react";
import { useSite } from "@/src/app/context/SiteContext";

interface UseStackedScrollProps {
  totalSteps: number;
  shouldLoadRest: boolean;
}

export function useStackedScroll({ totalSteps, shouldLoadRest }: UseStackedScrollProps) {
  const scopeRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const fixedFrameRef = useRef<HTMLDivElement>(null);

  const rawProgress = useRef(0);
  const scrollVelocity = useRef(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(0);
  const scrollMetricsRef = useRef({ totalScrollable: 0, vh: 0, trackTopOffset: 0 });

  const { smootherRef } = useSite();

  const updateMetrics = useCallback(() => {
    if (!trackRef.current) return;
    const vh = window.innerHeight;
    const totalScrollable = totalSteps * vh;

    trackRef.current.style.height = `${totalScrollable + vh}px`;

    scrollMetricsRef.current = {
      totalScrollable,
      vh,
      trackTopOffset: window.scrollY + trackRef.current.getBoundingClientRect().top,
    };
  }, [totalSteps]);

  useEffect(() => {
    if (!shouldLoadRest) return;
    updateMetrics();

    window.addEventListener("resize", updateMetrics, { passive: true });
    return () => window.removeEventListener("resize", updateMetrics);
  }, [shouldLoadRest, updateMetrics]);

  useEffect(() => {
    if (!shouldLoadRest) return;

    const handleScroll = (e?: any) => {
      const scrollY = e?.scroll !== undefined ? e.scroll : window.scrollY;
      const { totalScrollable, trackTopOffset } = scrollMetricsRef.current;

      if (totalScrollable <= 0) return;

      const now = performance.now();
      const dt = Math.max(now - lastTime.current, 16);
      const dy = Math.abs(scrollY - lastScrollY.current);

      lastScrollY.current = scrollY;
      lastTime.current = now;

      // Track clean velocity normalized between 0 and 1
      scrollVelocity.current = Math.min((dy / dt) / 3, 1);

      const relativeScroll = scrollY - trackTopOffset;
      const trackBottom = relativeScroll + totalScrollable;

      if (fixedFrameRef.current) {
        if (relativeScroll >= 0 && trackBottom >= 0) {
          fixedFrameRef.current.style.position = "fixed";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        } else if (trackBottom < 0) {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "auto";
          fixedFrameRef.current.style.bottom = "0px";
        } else {
          fixedFrameRef.current.style.position = "absolute";
          fixedFrameRef.current.style.top = "0px";
          fixedFrameRef.current.style.bottom = "auto";
        }
      }

      // Pure 1:1 Scroll Mapping (Prevents messy state bugs)
      rawProgress.current = Math.min(Math.max(relativeScroll / totalScrollable, 0), 1);
    };

    const lenis = smootherRef?.current;
    if (lenis && typeof lenis.on === "function") {
      lenis.on("scroll", handleScroll);
    } else {
      window.addEventListener("scroll", handleScroll, { passive: true });
    }

    handleScroll();

    return () => {
      if (lenis && typeof lenis.off === "function") {
        lenis.off("scroll", handleScroll);
      } else {
        window.removeEventListener("scroll", handleScroll);
      }
    };
  }, [shouldLoadRest, smootherRef]);

  return { scopeRef, trackRef, fixedFrameRef, rawProgress, scrollVelocity, scrollMetricsRef };
}