"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import CustomScrollBar from "./CustomScrollBar";

interface SmoothScrollProps {
  children: React.ReactNode;
  onScrollReady?: () => void;
}

export default function SmoothScroll({
  children,
  onScrollReady,
}: SmoothScrollProps) {
  const { preloaderDone, smootherRef } = useSite();
  const pathname = usePathname();

  const lenisRef = useRef<any>(null);

  useEffect(() => {
    let lenis: any = null;
    let cancelled = false;

    const initLenis = async () => {
      const LenisModule = await import("lenis");

      if (cancelled) return;

      const Lenis = LenisModule.default;

      lenis = new Lenis({
        // ONE smooth-scroll engine.
        lerp: 0.075,

        smoothWheel: true,

        // Keep wheel movement natural.
        wheelMultiplier: 1,

        // Touch should feel responsive.
        touchMultiplier: 1.5,

        syncTouch: true,
        syncTouchLerp: 0.08,

        autoRaf: true,

        // Smooth easing for wheel input.
        easing: (t: number) =>
          Math.min(
            1,
            1.001 - Math.pow(2, -10 * t)
          ),
      });

      lenisRef.current = lenis;

      if (smootherRef) {
        smootherRef.current = lenis;
      }

      onScrollReady?.();
    };

    initLenis();

    return () => {
      cancelled = true;

      if (lenis) {
        lenis.destroy();
      }

      lenisRef.current = null;

      if (smootherRef) {
        smootherRef.current = null;
      }
    };
  }, [smootherRef, onScrollReady]);

  useEffect(() => {
    const lenis = lenisRef.current;

    if (!lenis) return;

    if (!preloaderDone) {
      lenis.stop();
      return;
    }

    lenis.start();

    // Always return to top when the route changes.
    requestAnimationFrame(() => {
      lenis.scrollTo(0, {
        immediate: true,
      });
    });
  }, [pathname, preloaderDone]);

  return (
    <div className="relative flex min-h-[100dvh] w-full flex-col">
      <CustomScrollBar />

      {children}
    </div>
  );
}