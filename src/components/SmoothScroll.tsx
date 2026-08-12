"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface SmoothScrollProps {
  children: React.ReactNode;
  onScrollReady?: () => void;
}

export default function SmoothScroll({ children, onScrollReady }: SmoothScrollProps) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const { preloaderDone, smootherRef } = useSite();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  // 1. Set Viewport Height (--vh) to prevent dynamic address bar jumps on mobile
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setVh = () => {
      const actualHeight = window.visualViewport?.height || window.innerHeight;
      const vh = actualHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();

    let windowWidth = window.innerWidth;
    const handleResize = () => {
      if (window.innerWidth !== windowWidth) {
        windowWidth = window.innerWidth;
        setVh();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", setVh);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener("resize", setVh);
      }
    };
  }, []);

  // 2. Initialize Lenis + Sync with GSAP Ticker
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const isTouchDevice = ScrollTrigger.isTouch > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "DOMContentLoaded,load,visibilitychange",
    });

    if (isTouchDevice && thumbRef.current?.parentElement) {
      thumbRef.current.parentElement.style.display = "none";
    }

    const screenHeight = window.visualViewport?.height || window.innerHeight;
    const heightFactor = Math.min(Math.max(800 / screenHeight, 0.6), 1.2);

    const lenis = new Lenis({
      lerp: isTouchDevice ? 0.12 : 0.1 * heightFactor,
      wheelMultiplier: 1.1 * heightFactor,
      touchMultiplier: isTouchDevice ? 1.4 : 0.8 * heightFactor,
      infinite: false,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.08,
    });

    lenisRef.current = lenis;

    if (smootherRef) {
      smootherRef.current = lenis;
    }

    lenis.on("scroll", ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(100, 16);

    let thumbVisible = false;

    const handleScroll = (e: any) => {
      if (isTouchDevice || !thumbRef.current) return;

      const y = e.scroll;
      const limit = lenis.limit;
      const trackH = window.visualViewport?.height || window.innerHeight;
      const thumbH = Math.max((trackH / (limit + trackH)) * trackH, 40);
      const maxTop = trackH - thumbH;
      const top = limit > 0 ? (y / limit) * maxTop : 0;

      thumbRef.current.style.height = `${thumbH}px`;
      thumbRef.current.style.transform = `translate3d(0, ${top}px, 0)`;

      if (y > 1 && !thumbVisible) {
        thumbVisible = true;
        thumbRef.current.style.opacity = "1";
      }

      clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        thumbVisible = false;
        if (thumbRef.current) thumbRef.current.style.opacity = "0";
      }, 800);
    };

    lenis.on("scroll", handleScroll);

    if (!preloaderDone) {
      lenis.stop();
    } else {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          ScrollTrigger.refresh();
          lenis.start();
        });
      });
    }

    onScrollReady?.();

    return () => {
      clearTimeout(scrollTimerRef.current);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      if (smootherRef) {
        smootherRef.current = null;
      }
    };
  }, [smootherRef, preloaderDone, onScrollReady]);

  useEffect(() => {
    if (!preloaderDone) return;

    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }

    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => clearTimeout(refreshTimeout);
  }, [pathname, preloaderDone]);

  return (
    <>
      <div className="flex flex-col min-h-[100svh] w-full">
        {children}
      </div>

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "6px",
          height: "100svh",
          zIndex: 99999,
          pointerEvents: "none",
        }}
      >
        <div
          ref={thumbRef}
          style={{
            position: "absolute",
            top: 0,
            right: "2px",
            width: "4px",
            background: "rgba(255,255,255,0.4)",
            borderRadius: "999px",
            opacity: 0,
            transition: "opacity 0.3s ease",
            willChange: "transform",
          }}
        />
      </div>
    </>
  );
}