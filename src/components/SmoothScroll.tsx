"use client";

import React, { useEffect, useRef } from "react";
import Lenis from 'lenis';
import { useSite } from "../app/context/SiteContext";

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const { smootherRef, preloaderDone } = useSite();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current || !contentRef.current) return;

    // Initialize Lenis targeted at custom wrappers to lock mobile address bar
    const lenis = new Lenis({
      wrapper: wrapperRef.current,
      content: contentRef.current,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      syncTouch: false, // Disables native touch interception lag
      syncTouchLerp: 0.07,
      infinite: false,
    });

    smootherRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const animationId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(animationId);
      lenis.destroy();
      smootherRef.current = null;
    };
  }, [smootherRef]);

  // Sync preloader lock state with Lenis
  useEffect(() => {
    const lenis = smootherRef.current;
    if (!lenis) return;

    if (!preloaderDone) {
      lenis.stop();
    } else {
      lenis.start();
    }
  }, [preloaderDone, smootherRef]);

  return (
    <div
      ref={wrapperRef}
      className="scroll-wrapper fixed inset-0 w-full h-full overflow-hidden"
      style={{ height: "100vh", width: "100vw" }}
    >
      <div ref={contentRef} className="scroll-content min-h-full w-full">
        {children}
      </div>
    </div>
  );
}