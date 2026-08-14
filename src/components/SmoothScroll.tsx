"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import CustomScrollBar from "./CustomScrollBar";

interface SmoothScrollProps {
  children: React.ReactNode;
  onScrollReady?: () => void;
}

export default function SmoothScroll({ children, onScrollReady }: SmoothScrollProps) {
  const { preloaderDone, smootherRef } = useSite();
  const pathname = usePathname();
  const locomotiveRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let instance: any;

    const initLocomotive = async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;

      const ua = navigator.userAgent;
      const isAndroid = /Android/i.test(ua);
      const isIOS = /iPhone|iPad|iPod/i.test(ua);
      const isMobileDevice = isAndroid || isIOS;

      // Android-specific Lenis configuration
      const lenisOptions = isAndroid
        ? {
            wrapper: window,
            content: document.documentElement,
            lerp: 0.08, // Slightly higher for Android hardware to avoid jitter
            duration: undefined,
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 0.8, // Reduced multiplier for Android touch events
            syncTouch: false, // OFF on Android so Chrome doesn't fight Lenis compositor
            syncTouchLerp: 0.08,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            autoResize: true,
          }
        : {
            wrapper: window,
            content: document.documentElement,
            lerp: isMobileDevice ? 0.05 : 0.075,
            duration: isMobileDevice ? 1.2 : undefined,
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: isMobileDevice ? 0.6 : 2.0,
            syncTouch: true,
            syncTouchLerp: 0.045,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            autoResize: true,
          };

      instance = new LocomotiveScroll({ lenisOptions });

      locomotiveRef.current = instance;

      if (smootherRef) {
        smootherRef.current = instance.lenisInstance || instance;
      }

      onScrollReady?.();
    };

    initLocomotive();

    return () => {
      if (locomotiveRef.current) {
        locomotiveRef.current.destroy();
        locomotiveRef.current = null;
      }
    };
  }, [onScrollReady, smootherRef]);

  useEffect(() => {
    if (!locomotiveRef.current) return;

    if (!preloaderDone) {
      locomotiveRef.current.stop();
    } else {
      locomotiveRef.current.start();
      locomotiveRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname, preloaderDone]);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full relative">
      <CustomScrollBar />
      {children}
    </div>
  );
}