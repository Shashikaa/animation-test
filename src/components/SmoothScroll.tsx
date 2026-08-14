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

      // Tailored options per platform to balance momentum vs native address bar behavior
      const lenisOptions = isIOS
        ? {
            wrapper: window,
            content: document.documentElement,
            lerp: 0.1, // Higher responsiveness for iOS touch gestures
            duration: undefined,
            smoothWheel: true,
            touchMultiplier: 2.2, // Increases momentum on iOS so 1 swipe moves further
            wheelMultiplier: 1.0,
            syncTouch: false, // Prevents fighting iOS Safari browser chrome collapse
            syncTouchLerp: 0.08,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            autoResize: true,
          }
        : isAndroid
        ? {
            wrapper: window,
            content: document.documentElement,
            lerp: 0.08,
            duration: undefined,
            smoothWheel: true,
            touchMultiplier: 1.5, // Natural scroll multiplier for Android Chrome
            wheelMultiplier: 1.0,
            syncTouch: false,
            syncTouchLerp: 0.08,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            autoResize: true,
          }
        : {
            // Desktop settings
            wrapper: window,
            content: document.documentElement,
            lerp: 0.075,
            duration: undefined,
            smoothWheel: true,
            wheelMultiplier: 1.0,
            touchMultiplier: 1.0,
            syncTouch: true,
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
    <div className="flex flex-col min-h-[100svh] w-full relative">
      <CustomScrollBar />
      {children}
    </div>
  );
}