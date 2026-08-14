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
    let tickerCallback: (time: number, deltaTime: number, frame: number) => void;
    let scrollTimeout: NodeJS.Timeout;

    const initLenis = async () => {
      const Lenis = (await import("lenis")).default;

      // Check if user is on a touch device
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      instance = new Lenis({
        wrapper: window,
        content: document.documentElement,
        // Increased lerp from 0.055 to 0.1 for faster, snappier responsiveness
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        // ── ULTRA-SMOOTH MOBILE & ANDROID SETTINGS ──
        // Native mobile scrolling is already GPU-accelerated and smooth on 120Hz displays.
        // syncTouch: false prevents artificial input delay on touch screens.
        syncTouch: false,
        touchMultiplier: isTouchDevice ? 1.5 : 1.0, // Restores swift flick momentum
        autoResize: true,
      });

      lenisRef.current = instance;

      if (smootherRef) {
        smootherRef.current = instance;
      }

      // Sync Lenis scroll updates with GSAP ScrollTrigger
      instance.on("scroll", () => {
        ScrollTrigger.update();
        document.documentElement.classList.add("is-scrolling");
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          document.documentElement.classList.remove("is-scrolling");
        }, 150);
      });

      // Synchronize Lenis RAF with GSAP Ticker frame loop
      tickerCallback = (time: number) => {
        instance.raf(time * 1000);
      };
      
      gsap.ticker.add(tickerCallback);
      // lagSmoothing prevents visual jumps after heavy JS thread stalls
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