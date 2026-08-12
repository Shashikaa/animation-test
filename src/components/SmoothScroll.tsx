"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import CustomScrollBar from "./CustomScrollBar";

interface SmoothScrollProps {
  children: React.ReactNode;
  onScrollReady?: () => void;
}

export default function SmoothScroll({ children, onScrollReady }: SmoothScrollProps) {
  const { preloaderDone, smootherRef } = useSite();
  const pathname = usePathname();
  const locomotiveRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let instance: any;

    const initLocomotive = async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;

      const isMobile = window.innerWidth <= 1024;

      instance = new LocomotiveScroll({
        lenisOptions: {
          wrapper: isMobile && containerRef.current ? containerRef.current : window,
          content: isMobile && containerRef.current ? (containerRef.current.firstElementChild as HTMLElement) : document.documentElement,
          lerp: 0.1,
          duration: 1.2,
          smoothWheel: true,
          wheelMultiplier: 1.1,
          touchMultiplier: 1.5,
          syncTouch: false,
          autoResize: true,
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
      locomotiveRef.current.stop();
    } else {
      locomotiveRef.current.start();
      locomotiveRef.current.scrollTo(0, { immediate: true });
    }
  }, [pathname, preloaderDone]);

  return (
    <div ref={containerRef} className="scroll-viewport flex flex-col w-full relative">
      <CustomScrollBar />
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}