"use client";

import { useState, useEffect, RefObject } from "react";
import { useSite } from "@/src/app/context/SiteContext";

interface UseHeroIntroOptions {
  isMobile?: boolean;
}

export function useHeroIntro(
  scopeRef: RefObject<HTMLElement | null>,
  options: UseHeroIntroOptions = {}
) {
  const { preloaderDone } = useSite();
  const [introDone, setIntroDone] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (!introDone) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [introDone]);

  useEffect(() => {
    // ── GUARD: Wait until preloader is completely finished before starting ──
    if (!preloaderDone || !scopeRef.current) return;

    const scope = scopeRef.current;
    const isMobile = options.isMobile ?? false;

    let timer: NodeJS.Timeout;

    // Wait for frame stabilization after preloader disappears
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scope.classList.add("hero-animate-active");

          // Extended duration for a slower, more luxurious reveal (2800ms - 3000ms)
          const introDuration = isMobile ? 3000 : 2800;
          timer = setTimeout(() => {
            setIntroDone(true);
          }, introDuration);
        });
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (timer) clearTimeout(timer);
    };
  }, [preloaderDone, scopeRef, options.isMobile]); // Added preloaderDone to dependencies

  return { introDone, preloaderDone };
}