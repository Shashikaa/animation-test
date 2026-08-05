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

  useEffect(() => {
    if (typeof window === "undefined") return;

    let initialWidth = window.innerWidth;

    const setSvh = () => {
      const svh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--svh", `${svh}px`);
    };

    setSvh();

    const handleResize = () => {
      if (window.innerWidth !== initialWidth) {
        initialWidth = window.innerWidth;
        setSvh();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouchDevice = ScrollTrigger.isTouch > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
    
    if (isTouchDevice && !preloaderDone) {
      const preventTouch = (e: TouchEvent) => e.preventDefault();
      window.addEventListener("touchmove", preventTouch, { passive: false });
      return () => window.removeEventListener("touchmove", preventTouch);
    }
  }, [preloaderDone]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "DOMContentLoaded,load,visibilitychange"
    });

    const isTouchDevice = ScrollTrigger.isTouch > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (isTouchDevice) {
      if (thumbRef.current?.parentElement) {
        thumbRef.current.parentElement.style.display = "none";
      }
      onScrollReady?.();
      return;
    }

    const lenis = new Lenis({
      lerp: 0.14,
      wheelMultiplier: 1.4,
      touchMultiplier: 1.0,
      infinite: false,
      smoothWheel: true,
    });

    lenisRef.current = lenis;

    if (smootherRef) {
      smootherRef.current = lenis;
    }

    lenis.on("scroll", () => {
      ScrollTrigger.update();
    });

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(100, 16);

    let thumbVisible = false;

    const handleScroll = (e: any) => {
      const y = e.scroll; 

      if (!thumbRef.current) return;
      
      const limit = lenis.limit;
      const trackH = window.innerHeight;
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
      lenis.start();
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
    }, 100);

    return () => clearTimeout(refreshTimeout);
  }, [pathname, preloaderDone]);

  return (
    <>
      <div className="flex flex-col min-h-screen w-full">
        {children}
      </div>

      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "6px",
          height: "100%",
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