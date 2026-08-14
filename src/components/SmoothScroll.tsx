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

    // ── Prevent Android Chrome address-bar collapse via touchmove lock ──
    const preventAndroidBarCollapse = (e: TouchEvent) => {
      // Prevents native Android browser compositor from hiding the address bar
      if (e.touches.length === 1) {
        // Allow inner scrollable elements if needed, otherwise prevent native scroll
        const target = e.target as HTMLElement;
        const isScrollableSubContainer = target.closest(".allow-native-scroll");
        if (!isScrollableSubContainer) {
          e.preventDefault();
        }
      }
    };

    // Attach non-passive listener to block native browser chrome movement on Android
    window.addEventListener("touchmove", preventAndroidBarCollapse, { passive: false });

    let instance: any;

    const initLocomotive = async () => {
      const LocomotiveScroll = (await import("locomotive-scroll")).default;

      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );

      instance = new LocomotiveScroll({
        lenisOptions: {
          wrapper: wrapperRef.current!,
          content: contentRef.current!,
          lerp: isMobileDevice ? 0.12 : 0.075,
          duration: isMobileDevice ? 0.8 : undefined,
          smoothWheel: true,
          wheelMultiplier: 1.0,
          touchMultiplier: 1.8,
          syncTouch: true, // Required on Android so Lenis handles touch delta manually
          syncTouchLerp: 0.1,
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
      window.removeEventListener("touchmove", preventAndroidBarCollapse);
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
      id="smooth-wrapper"
      className="fixed inset-0 w-full h-full overflow-hidden touch-none"
      style={{
        touchAction: "none",
        overscrollBehavior: "none",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div 
        ref={contentRef} 
        id="smooth-content" 
        className="flex flex-col min-h-[100lvh] w-full relative will-change-transform"
      >
        <CustomScrollBar />
        {children}
      </div>
    </div>
  );
}