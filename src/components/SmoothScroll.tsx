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
  
  // Guard flags to prevent scroll resets from overwriting saved coordinates
  const isPopStateRef = useRef<boolean>(false);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const currentPathRef = useRef<string>(pathname);

  // Sync current path synchronously
  useEffect(() => {
    currentPathRef.current = pathname;
  }, [pathname]);

  // Set up screen vh custom property
  useEffect(() => {
    if (typeof window === "undefined") return;

    const setVh = () => {
      const vh = window.innerHeight * 0.01;
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
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
  }, []);

  // Detect browser Back/Forward (popstate)
  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    const handlePopState = () => {
      isPopStateRef.current = true;
      sessionStorage.setItem("is_popstate_navigation", "true");
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Initialize Lenis Smooth Scrolling (Runs once)
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isTouchDevice = ScrollTrigger.isTouch > 0 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

    ScrollTrigger.config({
      ignoreMobileResize: true,
      autoRefreshEvents: "DOMContentLoaded,load,visibilitychange",
    });

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

      // CRITICAL FIX: Do NOT save scroll position if this scroll event was caused by a programmatic reset to 0
      if (!isProgrammaticScrollRef.current && currentPathRef.current) {
        sessionStorage.setItem(`scroll_pos_${currentPathRef.current}`, y.toString());
      }

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

  // Route Change & Scroll Position Restoration
  useEffect(() => {
    if (!preloaderDone) return;

    const isPopStateNav = isPopStateRef.current || sessionStorage.getItem("is_popstate_navigation") === "true";

    if (isPopStateNav) {
      // BACK/FORWARD NAVIGATION: Restore saved scroll position
      const savedPos = sessionStorage.getItem(`scroll_pos_${pathname}`);
      const targetY = savedPos ? parseFloat(savedPos) : 0;

      isProgrammaticScrollRef.current = true;

      if (lenisRef.current) {
        lenisRef.current.start();
      }

      let attempts = 0;
      const maxAttempts = 12;

      const restoreScroll = () => {
        attempts++;
        if (lenisRef.current) {
          lenisRef.current.scrollTo(targetY, { immediate: true });
        } else {
          window.scrollTo(0, targetY);
        }
        ScrollTrigger.refresh();

        const currentScroll = lenisRef.current ? lenisRef.current.scroll : window.scrollY;
        if (Math.abs(currentScroll - targetY) > 5 && attempts < maxAttempts) {
          setTimeout(restoreScroll, 40);
        } else {
          // Allow normal scroll tracking again
          setTimeout(() => {
            isProgrammaticScrollRef.current = false;
          }, 100);
        }
      };

      restoreScroll();
      isPopStateRef.current = false;
      sessionStorage.removeItem("is_popstate_navigation");

    } else {
      // NORMAL LINK CLICK: Scroll to Top
      isProgrammaticScrollRef.current = true;

      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      } else {
        window.scrollTo(0, 0);
      }

      setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 100);
    }

    const refreshTimeout = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

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
          height: "100vh",
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