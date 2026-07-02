"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import { setScrollVelocity } from "../app/utils/scrollVelocity";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  const thumbRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  
  const { preloaderDone, smootherRef } = useSite();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const isMobile = typeof window !== "undefined" && /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    if (ScrollTrigger.isTouch > 0) return;

    const lenis = new Lenis({
      duration: 0.9,      
      wheelMultiplier: 1.2,  
      touchMultiplier: 1.0,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
    gsap.ticker.lagSmoothing(0);

    let lastY = 0;
    let lastTime = performance.now();
    let thumbVisible = false;

    const handleScroll = (e: any) => {
      const now = performance.now();
      const dt = now - lastTime || 1;
      const y = e.scroll; 

      // Only run state logic on Desktop to avoid breaking mobile main render-thread
      if (!isMobile) {
        setScrollVelocity(Math.abs((y - lastY) / dt) * 1000);
      }
      
      lastY = y;
      lastTime = now;

      if (!thumbRef.current) return;
      
      const limit = lenis.limit;
      const trackH = window.innerHeight;
      const thumbH = Math.max((trackH / (limit + trackH)) * trackH, 40);
      const maxTop = trackH - thumbH;
      const top = limit > 0 ? (y / limit) * maxTop : 0;

      // Use direct style updates over React states for scrollbar transformation
      thumbRef.current.style.height = `${thumbH}px`;
      thumbRef.current.style.transform = `translateY(${top}px)`;

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

    return () => {
      clearTimeout(scrollTimerRef.current);
      if (!isMobile) setScrollVelocity(0);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      if (smootherRef) {
        smootherRef.current = null;
      }
    };
  }, [smootherRef, preloaderDone]);

  useEffect(() => {
    if (!preloaderDone || !lenisRef.current) return;
    
    lenisRef.current.scrollTo(0, { immediate: true });
    
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 50);

    return () => clearTimeout(refreshTimeout);
  }, [pathname, preloaderDone]);

  return (
    <>
      <div className="flex flex-col min-h-screen w-full">
        {children}
      </div>

      {/* Custom scrollbar thumb */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "6px",
          height: "100lvh",
          zIndex: 99999,
          pointerEvents: "none",
        }}
      >
        <div
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