"use client";

import React, { useEffect } from "react";
import Lenis from 'lenis';
import { useSite } from "../app/context/SiteContext";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { smootherRef, preloaderDone } = useSite();

  useEffect(() => {
    // Initialize Lenis with syncTouch: false to prevent mobile address bar lag
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      syncTouch: false, // Prevents mobile browser address bar hide/show scroll stutter
      syncTouchLerp: 0.07,
      infinite: false,
    });

    smootherRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      smootherRef.current = null;
    };
  }, [smootherRef]);

  // Sync scroll lock state with preloader completion
  useEffect(() => {
    const lenis = smootherRef.current;
    if (!lenis) return;

    if (!preloaderDone) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [preloaderDone, smootherRef]);

  return <>{children}</>;
}