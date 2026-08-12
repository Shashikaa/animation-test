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
  const scrollWrapperRef = useRef<HTMLDivElement>(null);

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
          wrapper: isMobile && scrollWrapperRef.current ? scrollWrapperRef.current : window,
          content: isMobile && scrollWrapperRef.current ? (scrollWrapperRef.current.firstElementChild as HTMLElement) : document.documentElement,
          lerp: 0.1,
          duration: 1.2,
          smoothWheel: true,
          wheelMultiplier: 1.1,
          touchMultiplier: 1.5,
          syncTouch: true,
          autoResize: false,
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
    <div ref={scrollWrapperRef} className="scroll-wrapper-mobile flex flex-col min-h-[100vh] w-full relative">
      <CustomScrollBar />
      <div>
        {children}
      </div>
    </div>
  );
}