"use client";

import { useEffect, useState, RefObject } from "react";
import { useSite } from "@/src/app/context/SiteContext";

interface UseHeroIntroOptions {
  isMobile?: boolean;
  introDurationMs?: number;
  unlockScrollEarlyMs?: number;
}

// useHeroIntro.ts

export function useHeroIntro(
  scopeRef: RefObject<HTMLElement | null>,
  options: UseHeroIntroOptions = {}
) {
  const { introDurationMs = 2800, unlockScrollEarlyMs = 1800 } = options;
  const { preloaderDone, smootherRef } = useSite();
  const [introDone, setIntroDone] = useState(false);
  const [shouldLoadRest, setShouldLoadRest] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    // Force strict native zero-reset on mount
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    const isReady = preloaderDone !== undefined ? preloaderDone : true;
    if (!isReady) return;

    const lenis = smootherRef?.current;

    if (lenis && typeof lenis.stop === "function") {
      lenis.stop();
    }

    let rafOne: number;
    let rafTwo: number;

    const startAnimation = () => {
      const scope = scopeRef.current;
      if (!scope) return false;

      rafOne = requestAnimationFrame(() => {
        rafTwo = requestAnimationFrame(() => {
          scope.classList.add("hero-animate-active");
        });
      });
      return true;
    };

    if (!startAnimation()) {
      const retryInterval = setInterval(() => {
        if (startAnimation()) clearInterval(retryInterval);
      }, 30);
      setTimeout(() => clearInterval(retryInterval), 1500);
    }

    // 1. Mount downstream components during main zoom
    const mountTimer = setTimeout(() => {
      setShouldLoadRest(true);
    }, 900);

    // 2. Smoothly enable Lenis scroll listening
    const unlockScrollTimer = setTimeout(() => {
      if (lenis) {
        // Zero out Lenis target scroll position before starting on iOS
        if (typeof lenis.scrollTo === "function") {
          lenis.scrollTo(0, { immediate: true });
        }
        if (typeof lenis.start === "function") {
          lenis.start();
        }
      }
    }, unlockScrollEarlyMs);

    // 3. Mark keyframe sequence finished & replace with static styles
    const completeTimer = setTimeout(() => {
      setIntroDone(true);
      if (scopeRef.current) {
        scopeRef.current.classList.remove("hero-animate-active");
        scopeRef.current.classList.add("hero-animate-done");
      }

      // iOS Safari Fix: Use double requestAnimationFrame instead of requestIdleCallback
      if (lenis && typeof lenis.resize === "function") {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            lenis.resize();
          });
        });
      }
    }, introDurationMs + 100);

    return () => {
      if (rafOne) cancelAnimationFrame(rafOne);
      if (rafTwo) cancelAnimationFrame(rafTwo);
      clearTimeout(mountTimer);
      clearTimeout(unlockScrollTimer);
      clearTimeout(completeTimer);
    };
  }, [preloaderDone, scopeRef, smootherRef, introDurationMs, unlockScrollEarlyMs]);

  return { introDone, preloaderDone, shouldLoadRest };
}