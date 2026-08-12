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

  // Disable browser automatic scroll restoration
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // Lock scroll and delay downstream DOM mounting
  useEffect(() => {
    if (!preloaderDone || !scopeRef.current) return;

    const lenis = smootherRef?.current;
    const scope = scopeRef.current;

    // Lock scroll at origin during animation
    if (lenis && typeof lenis.stop === "function") {
      lenis.stop();
    }
    window.scrollTo(0, 0);

    // 1. Activate CSS transition
    scope.classList.add("hero-animate-active");

    // 2. Mount downstream components slightly before intro ends to prevent pop-in
    const mountRestTimer = setTimeout(() => {
      setShouldLoadRest(true);
    }, Math.max(0, introDurationMs - 400));

    // 3. Mark intro complete and allow smooth scrolling
    const completeTimer = setTimeout(() => {
      setIntroDone(true);
      scope.classList.add("hero-animate-done");
    }, introDurationMs);

    return () => {
      clearTimeout(mountRestTimer);
      clearTimeout(completeTimer);
    };
  }, [preloaderDone, scopeRef, smootherRef, introDurationMs]);

  return { introDone, preloaderDone, shouldLoadRest };
}