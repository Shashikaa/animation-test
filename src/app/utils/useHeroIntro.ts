"use client";

import { useEffect, useState, RefObject } from "react";
import { useSite } from "@/src/app/context/SiteContext";

interface UseHeroIntroOptions {
  isMobile?: boolean;
  introDurationMs?: number;
  unlockScrollEarlyMs?: number;
}

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
    if (window.history.scrollRestoration) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const isReady = preloaderDone !== undefined ? preloaderDone : true;
    if (!isReady) return;

    const lenis = smootherRef?.current;

    if (lenis && typeof lenis.stop === "function") {
      lenis.stop();
      if (typeof lenis.scrollTo === "function") {
        lenis.scrollTo(0, { immediate: true });
      }
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

    const mountTimer = setTimeout(() => {
      setShouldLoadRest(true);
    }, 900);

    const unlockScrollTimer = setTimeout(() => {
      window.scrollTo(0, 0);
      if (lenis) {
        if (typeof lenis.scrollTo === "function") {
          lenis.scrollTo(0, { immediate: true });
        }
        if (typeof lenis.start === "function") {
          lenis.start();
        }
      }
    }, unlockScrollEarlyMs);

    const completeTimer = setTimeout(() => {
      setIntroDone(true);
      if (scopeRef.current) {
        scopeRef.current.classList.remove("hero-animate-active");
        scopeRef.current.classList.add("hero-animate-done");
      }

      if (lenis && typeof lenis.resize === "function") {
        lenis.resize();
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