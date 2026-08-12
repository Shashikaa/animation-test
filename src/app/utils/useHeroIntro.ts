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
    if (!scopeRef.current) return;

    const scope = scopeRef.current;
    const isMobile = options.isMobile ?? false;

    let timer: NodeJS.Timeout;

    // Use triple rAF to guarantee full render layout frame stabilization
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scope.classList.add("hero-animate-active");

          // Adjusted intro timings to sync seamlessly with CSS transitions
          const introDuration = isMobile ? 2200 : 2000;
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
  }, [scopeRef, options.isMobile]);

  return { introDone, preloaderDone };
}