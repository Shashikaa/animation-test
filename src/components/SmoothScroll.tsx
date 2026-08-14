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
  const wrapperRef = useRef<HTMLDivElement>(null);

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
      const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;

      instance = new Lenis({
        // Binding to a wrapper prevents the window level scroll from hiding browser address bar
        wrapper: isTouchDevice && wrapperRef.current ? wrapperRef.current : window,
        content: isTouchDevice && wrapperRef.current ? (wrapperRef.current.firstElementChild as HTMLElement) : document.documentElement,
        lerp: 0.1,
        smoothWheel: true,
        wheelMultiplier: 1.0,
        syncTouch: false,
        touchMultiplier: isTouchDevice ? 1.5 : 1.0,
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
    <div 
      ref={wrapperRef}
      className="mobile-static-viewport flex flex-col min-h-[100dvh] w-full relative overflow-y-auto overflow-x-hidden"
    >
      <CustomScrollBar />
      <div className="w-full min-h-full">{children}</div>
    </div>
  );
}