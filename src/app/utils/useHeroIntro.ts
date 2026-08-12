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

  // Manual scroll restoration on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  // Manage body overflow during intro phase
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

  // Main Intro Sequence
  useEffect(() => {
    if (!preloaderDone || !scopeRef.current) return;

    const scope = scopeRef.current;
    const isMobile = options.isMobile ?? false;

    let timer: NodeJS.Timeout;

    // Frame stabilization before triggering class
    const frameId = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        scope.classList.add("hero-animate-active");

        const totalAnimationTime = isMobile ? 3000 : 2800;
        // Unlock scroll 250ms BEFORE animation visually ends
        const unlockOffset = 250;
        const introDuration = Math.max(0, totalAnimationTime - unlockOffset);

        timer = setTimeout(() => {
          setIntroDone(true);
        }, introDuration);
      });
    });

    return () => {
      cancelAnimationFrame(frameId);
      if (timer) clearTimeout(timer);
    };
  }, [preloaderDone, scopeRef, options.isMobile]);

  return { introDone, preloaderDone };
}