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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !wrapperRef.current || !contentRef.current) return;

    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let instance: any;

    const initLocomotive = async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;

      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      instance = new LocomotiveScroll({
        lenisOptions: {
          /* Target wrapper and content directly instead of window/documentElement */
          wrapper: wrapperRef.current!,
          content: contentRef.current!,
          lerp: isMobileDevice ? 0.16 : 0.075,
          duration: isMobileDevice ? 0.6 : undefined,
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.5,
          syncTouch: false,
          easing: isMobileDevice ? undefined : (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
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
    <div
      ref={wrapperRef}
      className="fixed inset-0 w-full h-full overflow-y-auto overflow-x-hidden"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      <div ref={contentRef} className="flex flex-col min-h-[100lvh] w-full relative">
        <CustomScrollBar />
        {children}
      </div>
    </div>
  );
}