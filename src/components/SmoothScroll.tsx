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
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;

    const initLenis = async () => {
      const Lenis = (await import("lenis")).default;
      if (destroyed) return;

      const isMobile = window.matchMedia("(max-width: 767px)").matches;

instance = new Lenis({
  wrapper: window,
  content: document.documentElement,
  lerp: 0.12,
  duration: 0.8,
  smoothWheel: true,
  wheelMultiplier: 1.15,
  syncTouch: true,
  syncTouchLerp: 0.14,
  touchMultiplier: 1.8,
  easing: (t: number) =>
    Math.min(1, 1.001 - Math.pow(2, -9 * t)),
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