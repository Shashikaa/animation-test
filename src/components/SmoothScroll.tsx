"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import CustomScrollBar from "./CustomScrollBar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") gsap.registerPlugin(ScrollTrigger);

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
    if ("scrollRestoration" in window.history) window.history.scrollRestoration = "manual";

    let instance: any;
    let tickerCallback: ((time: number) => void) | null = null;
    let scrollTimeout: ReturnType<typeof window.setTimeout> | null = null;
    let destroyed = false;

    const initLenis = async () => {
      const Lenis = (await import("lenis")).default;
      if (destroyed) return;

      const isMobile = window.matchMedia("(max-width: 767px)").matches;
      const isAndroid = typeof navigator !== "undefined" && /android/i.test(navigator.userAgent);

      instance = new Lenis({
        wrapper: window,
        content: document.documentElement,
        lerp: isAndroid ? 0.035 : isMobile ? 0.09 : 0.08,
        smoothWheel: true,
        wheelMultiplier: isAndroid ? 0.8 : isMobile ? 1.0 : 1,
        syncTouch: true,
        syncTouchLerp: isAndroid ? 0.03 : isMobile ? 0.06 : 0.08,
        touchMultiplier: isAndroid ? 0.75 : isMobile ? 1.15 : 1,
        easing: (t: number) => 1 - Math.pow(1 - t, 4),
        autoResize: true,
      });

      lenisRef.current = instance;
      if (smootherRef) smootherRef.current = instance;

      instance.on("scroll", () => {
        ScrollTrigger.update();
        document.documentElement.classList.add("is-scrolling");
        if (scrollTimeout) clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
          document.documentElement.classList.remove("is-scrolling");
        }, 120);
      });

      tickerCallback = (time: number) => instance?.raf(time * 1000);
      gsap.ticker.add(tickerCallback);
      gsap.ticker.lagSmoothing(1000, 16);
      onScrollReady?.();
    };

    initLenis();

    return () => {
      destroyed = true;
      if (tickerCallback) gsap.ticker.remove(tickerCallback);
      if (instance) instance.destroy();
      lenisRef.current = null;
      if (smootherRef && smootherRef.current === instance) smootherRef.current = null;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      document.documentElement.classList.remove("is-scrolling");
    };
  }, [onScrollReady, smootherRef]);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;

    if (!preloaderDone) {
      lenis.stop();
      return;
    }

    lenis.start();
    lenis.scrollTo(0, { immediate: true });

    const timer = setTimeout(() => ScrollTrigger.refresh(), 150);
    return () => clearTimeout(timer);
  }, [pathname, preloaderDone]);

  return (
    <div className="flex flex-col min-h-[100dvh] w-full relative">
      <CustomScrollBar />
      {children}
    </div>
  );
}