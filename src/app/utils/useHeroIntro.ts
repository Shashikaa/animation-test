"use client";

import { useEffect, useState, RefObject } from "react";
import { useSite } from "@/src/app/context/SiteContext";

interface UseHeroIntroOptions {
  isMobile?: boolean;
  introDurationMs?: number;
}

export function useHeroIntro(
  scopeRef: RefObject<HTMLElement | null>,
  options: UseHeroIntroOptions = {}
) {
  const { introDurationMs = 2800 } = options;
  const { preloaderDone, smootherRef } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const [shouldLoadRest, setShouldLoadRest] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (!preloaderDone || !scopeRef.current) return;

    const lenis = smootherRef?.current;
    const scope = scopeRef.current;

    // Lock initial scroll
    if (lenis && typeof lenis.stop === "function") {
      lenis.stop();
    }
    window.scrollTo(0, 0);

    // 1. Activate GPU animation layer synchronously
    scope.classList.add("hero-animate-active");

    // 2. Schedule downstream DOM mounting during idle time
    const deferMountTime = Math.max(800, introDurationMs - 1200);
    const mountTimer = setTimeout(() => {
      if ("requestIdleCallback" in window) {
        window.requestIdleCallback(() => setShouldLoadRest(true), { timeout: 300 });
      } else {
        setShouldLoadRest(true);
      }
    }, deferMountTime);

    // 3. WAKE UP LENIS EARLY (250ms before completion)
    // This allows Lenis to warm up its internal virtual scroll listener so inputs register on Frame 1
    const wakeLenisTimer = setTimeout(() => {
      if (lenis) {
        if (typeof lenis.resize === "function") lenis.resize();
        if (typeof lenis.start === "function") lenis.start();
      }
    }, Math.max(0, introDurationMs - 250));

    // 4. Complete intro phase
    const completeTimer = setTimeout(() => {
      setIntroDone(true);
      scope.classList.add("hero-animate-done");
      
      // Force immediate DOM scroll sync
      window.dispatchEvent(new Event("scroll"));
    }, introDurationMs);

    return () => {
      clearTimeout(mountTimer);
      clearTimeout(wakeLenisTimer);
      clearTimeout(completeTimer);
    };
  }, [preloaderDone, scopeRef, smootherRef, introDurationMs]);

  return { introDone, preloaderDone, shouldLoadRest };
}