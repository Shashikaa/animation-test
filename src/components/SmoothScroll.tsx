"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import CustomScrollBar from "./CustomScrollBar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
      const Lenis = (await import("lenis")).default;

      instance = new Lenis({
        wrapper: window,
        content: document.documentElement,
        lerp: 0.08, // Slightly snappier tracking (from 0.055)
        duration: 1.2, // Faster response time (from 1.4)
        smoothWheel: true,
        wheelMultiplier: 1.0,
        // ── OPTIMIZED TOUCH SETTINGS FOR MOBILE SPEED & SMOOTHNESS ──
        touchMultiplier: 1.5, // Increased from 0.8 to give faster response to flicks
        syncTouch: true,
        syncTouchLerp: 0.08, // Increased from 0.04 to remove inertia lag on mobile
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -9 * t)),
        autoResize: true,
      });

      lenisRef.current = instance;

      if (smootherRef) {
        smootherRef.current = instance;
      }

      instance.on("scroll", () => {
        ScrollTrigger.update();
        document.documentElement.classList.add("is-scrolling");
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          document.documentElement.classList.remove("is-scrolling");
        }, 150);
      });

      tickerCallback = (time: number) => {
        instance.raf(time * 1000);
      };
      gsap.ticker.add(tickerCallback);
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

  useEffect(() => {
    if (!lenisRef.current) return;

    if (!preloaderDone) {
      lenisRef.current.stop();
    } else {
      lenisRef.current.start();
      lenisRef.current.scrollTo(0, { immediate: true });

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