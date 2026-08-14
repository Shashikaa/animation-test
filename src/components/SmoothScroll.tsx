"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import CustomScrollBar from "./CustomScrollBar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger plugin safely on client
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProps {
  children: React.ReactNode;
  onScrollReady?: () => void;
}

export default function SmoothScroll({ children, onScrollReady }: SmoothScrollProps) {
  const { preloaderDone, smootherRef } = useSite();
  const pathname = usePathname();
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let instance: any;
    let tickerCallback: (time: number) => void;
    let scrollTimeout: NodeJS.Timeout;

    const initLenis = async () => {
      // Dynamic import Lenis
      const Lenis = (await import("lenis")).default;

      instance = new Lenis({
        wrapper: window,
        content: document.documentElement,
        lerp: 0.075, // Golden ratio for smooth inertia
        duration: 1.2,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        touchMultiplier: 1.5,
        syncTouch: true,
        syncTouchLerp: 0.075,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential ease-out
        autoResize: true,
      });

      lenisRef.current = instance;

      if (smootherRef) {
        smootherRef.current = instance;
      }

      // 1. Sync Lenis scroll events directly with GSAP ScrollTrigger
      instance.on("scroll", (e: any) => {
        ScrollTrigger.update();

        // Performance Boost: Disable pointer-events globally while scrolling to boost FPS
        document.documentElement.classList.add("is-scrolling");
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          document.documentElement.classList.remove("is-scrolling");
        }, 150);
      });

      // 2. Drive Lenis through GSAP's optimized internal ticker
      tickerCallback = (time: number) => {
        instance.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);

      // 3. Disable GSAP lag smoothing to fix layout jumping / pin latency
      gsap.ticker.lagSmoothing(0);

      onScrollReady?.();
    };

    initLenis();

    return () => {
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      clearTimeout(scrollTimeout);
      document.documentElement.classList.remove("is-scrolling");
    };
  }, [onScrollReady, smootherRef]);

  // Handle route switching & preloader sync
  useEffect(() => {
    if (!lenisRef.current) return;

    if (!preloaderDone) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
      lenisRef.current.scrollTo(0, { immediate: true });
      
      // Force GSAP ScrollTrigger to recalculate all offsets/pins post-load
      setTimeout(() => {
        ScrollTrigger.refresh();
      }, 100);
    }
  }, [pathname, preloaderDone]);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full relative">
      <CustomScrollBar />
      {children}
    </div>
  );
}