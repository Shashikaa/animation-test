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

    // Detect touch-first environments cleanly
    const isTouchDevice = ScrollTrigger.isTouch > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    // If it's mobile, completely hide custom desktop scroll track layout
    if (isTouchDevice && thumbRef.current) {
      const parentTrack = thumbRef.current.parentElement;
      if (parentTrack) parentTrack.style.display = "none";
    }

    // Initialize Lenis. 
    // Optimization: If on mobile touch, sync using native configurations to avoid fighting the 13,000px GSAP pin
    const lenis = new Lenis({
      duration: isTouchDevice ? 0 : 0.9,       // 0 completely bypasses programmatic touch interception on mobile for pure buttery native scrolling
      wheelMultiplier: 1.2,  
      infinite: false,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    lenisRef.current = lenis;

    if (smootherRef) {
      smootherRef.current = lenis;
    }

    // Connect Lenis RAF loop into GSAP ticker
    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    let lastY = 0;
    let lastTime = performance.now();
    let thumbVisible = false;

    // Unified scroll execution thread
    const handleScroll = (e: any) => {
      // Keep ScrollTrigger calculated positions up to date
      ScrollTrigger.update();

      const now = performance.now();
      const dt = now - lastTime || 1;
      const y = e.scroll; 

      setScrollVelocity(Math.abs((y - lastY) / dt) * 1000);
      
      lastY = y;
      lastTime = now;

      // Skip custom desktop scrollbar updates if running on a touch device
      if (!thumbRef.current || isTouchDevice) return;
      
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

    // Structural Preloader Gate
    if (!preloaderDone) {
      lenis.stop();
    } else {
      lenis.start();
    }

    onScrollReady?.();

    return () => {
      clearTimeout(scrollTimerRef.current);
      setScrollVelocity(0);
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      if (smootherRef) {
        smootherRef.current = null;
      }
    };
  }, [smootherRef, preloaderDone, onScrollReady]);

  // Handle route change layout recalculation safely
  useEffect(() => {
    if (!preloaderDone) return;
    
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
    
    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 100); // 100ms provides a safer thread window for Next.js structural render hydration before refreshing triggers

    return () => clearTimeout(refreshTimeout);
  }, [pathname, preloaderDone]);

  return (
    <>
      <div className="flex flex-col min-h-screen w-full">
        {children}
      </div>

      {/* Custom desktop scrollbar thumb track */}
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
          ref={thumbRef}
          style={{
            position: "absolute",
            top: 0,
            right: "2px",
            width: "4px",
            background: "rgba(255,255,255,0.4)",
            borderRadius: "999px",
            opacity: 0,
            transition: "opacity 0.3s ease, transform 0.1s linear",
            willChange: "transform",
          }}
        />
      </div>
    </>
  );
}