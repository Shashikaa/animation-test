"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";

interface SmoothScrollProps {
  children: React.ReactNode;
  onScrollReady?: () => void;
}

export default function SmoothScroll({ children, onScrollReady }: SmoothScrollProps) {
  const { preloaderDone, smootherRef } = useSite();
  const pathname = usePathname();
  const locomotiveRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const setVh = () => {
      // Avoid firing layout shifts while typing into input fields
      const activeTag = document.activeElement?.tagName;
      if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;

      const actualHeight = window.visualViewport?.height || window.innerHeight;
      document.documentElement.style.setProperty("--vh", `${actualHeight * 0.01}px`);
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
      window.removeEventListener("orientationchange", handleOrientationChange);
    };

    function handleOrientationChange() {
      setTimeout(setVh, 200);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let instance: any;

    const initLocomotive = async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;

      const isMobileDevice = window.innerWidth < 1024;

      instance = new LocomotiveScroll({
        lenisOptions: {
          wrapper: window,
          content: document.documentElement,
          lerp: 0.1,
          duration: 1.2,
          smoothWheel: true,
          wheelMultiplier: 1.1,
          // Touch adjustments to prevent keyboard scroll jams
          touchMultiplier: isMobileDevice ? 1.0 : 1.5,
          syncTouch: !isMobileDevice, 
          syncTouchLerp: 0.08,
        },
      });

      locomotiveRef.current = instance;

      if (smootherRef) {
        smootherRef.current = instance.lenisInstance || instance;
      }

      onScrollReady?.();
    };

    initLocomotive();

    return () => {
      if (locomotiveRef.current) {
        locomotiveRef.current.destroy();
        locomotiveRef.current = null;
      }
    };
  }, [onScrollReady, smootherRef]);

  useEffect(() => {
    if (!locomotiveRef.current) return;

    if (!preloaderDone) {
      if (typeof locomotiveRef.current.stop === "function") {
        locomotiveRef.current.stop();
      }
    } else {
      if (typeof locomotiveRef.current.start === "function") {
        locomotiveRef.current.start();
      }
      if (typeof locomotiveRef.current.scrollTo === "function") {
        locomotiveRef.current.scrollTo(0, { immediate: true });
      }
    }
  }, [pathname, preloaderDone]);

  return (
    <div className="flex flex-col min-h-[100svh] w-full">
      {children}
    </div>
  );
}