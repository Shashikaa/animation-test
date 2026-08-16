"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useSite } from "../app/context/SiteContext";
import CustomScrollBar from "./CustomScrollBar";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);

  // --------------------------------------------------
  // FIX: Stop ScrollTrigger from refreshing every time
  // the Android address bar shows/hides mid-scroll.
  // --------------------------------------------------
  ScrollTrigger.config({
    ignoreMobileResize: true,
  });
}

interface SmoothScrollProps {
  children: React.ReactNode;
  onScrollReady?: () => void;
}

export default function SmoothScroll({
  children,
  onScrollReady,
}: SmoothScrollProps) {
  const { preloaderDone, smootherRef } = useSite();
  const pathname = usePathname();

  const lenisRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Prevent browser from restoring previous scroll position.
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }

    let instance: any = null;
    let tickerCallback: ((time: number) => void) | null = null;
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;

    let destroyed = false;

    const initLenis = async () => {
      const Lenis = (await import("lenis")).default;

      if (destroyed) return;

      // --------------------------------------------------
      // DEVICE DETECTION
      // --------------------------------------------------

      const isMobile = window.matchMedia(
        "(max-width: 767px)"
      ).matches;

      const isAndroid =
        typeof navigator !== "undefined" &&
        /android/i.test(navigator.userAgent);

      const isIOS =
        typeof navigator !== "undefined" &&
        /iphone|ipad|ipod/i.test(navigator.userAgent);

      // --------------------------------------------------
      // LENIS CONFIGURATION
      // --------------------------------------------------

      instance = new Lenis({
        wrapper: window,
        content: document.documentElement,

        /*
         * -----------------------------------------------
         * SMOOTHNESS
         * -----------------------------------------------
         *
         * Lower lerp = smoother/slower catch-up.
         *
         * We don't want this extremely low because your
         * About page has another interpolation layer.
         */

        lerp: isAndroid
          ? 0.055
          : isMobile
            ? 0.065
            : 0.07,

        /*
         * Smooth wheel scrolling.
         */

        smoothWheel: true,

        /*
         * -----------------------------------------------
         * WHEEL SPEED
         * -----------------------------------------------
         *
         * Slightly reduce wheel strength so fast wheel
         * movements don't travel too aggressively.
         */

        wheelMultiplier: isAndroid
          ? 0.85
          : isMobile
            ? 0.9
            : 0.9,

        /*
         * -----------------------------------------------
         * TOUCH
         * -----------------------------------------------
         *
         * Keep touch syncing enabled.
         *
         * The reduced multiplier prevents very aggressive
         * mobile swipes from feeling too violent.
         */

        syncTouch: true,

        syncTouchLerp: isAndroid
          ? 0.045
          : isMobile
            ? 0.05
            : 0.07,

        touchMultiplier: isAndroid
          ? 0.8
          : isMobile
            ? 0.9
            : 1,

        /*
         * -----------------------------------------------
         * FAST SCROLL CONTROL
         * -----------------------------------------------
         *
         * Your installed Lenis version expects:
         *
         * (data) => boolean
         *
         * So we MUST return true/false.
         *
         * Normal wheel movement:
         *     true  -> allowed
         *
         * Extremely aggressive wheel movement:
         *     false -> ignored
         *
         * This prevents an enormous wheel impulse from
         * instantly moving the page.
         */

        virtualScroll: (data) => {
          const maxDelta = isAndroid
            ? 45
            : isMobile
              ? 50
              : 55;

          /*
           * Normal scroll.
           */
          if (Math.abs(data.deltaY) <= maxDelta) {
            return true;
          }

          /*
           * Extremely fast wheel flick.
           *
           * Don't allow that single huge impulse.
           */
          return false;
        },

        /*
         * -----------------------------------------------
         * EASING
         * -----------------------------------------------
         */

        easing: (t: number) =>
          1 - Math.pow(1 - t, 4),

        /*
         * -----------------------------------------------
         * RESIZE
         * -----------------------------------------------
         */

        autoResize: true,
      });

      // --------------------------------------------------
      // STORE LENIS INSTANCE
      // --------------------------------------------------

      lenisRef.current = instance;

      if (smootherRef) {
        smootherRef.current = instance;
      }

      // --------------------------------------------------
      // LENIS SCROLL EVENT
      // --------------------------------------------------

      instance.on("scroll", () => {
        /*
         * Keep ScrollTrigger synchronized.
         */
        ScrollTrigger.update();

        /*
         * Add scrolling state.
         */
        document.documentElement.classList.add(
          "is-scrolling"
        );

        /*
         * Reset scroll-stop timer.
         */
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        /*
         * Remove scrolling class after scrolling stops.
         */
        scrollTimeout = setTimeout(() => {
          document.documentElement.classList.remove(
            "is-scrolling"
          );
        }, 120);
      });

      // --------------------------------------------------
      // GSAP RAF
      // --------------------------------------------------

      tickerCallback = (time: number) => {
        if (!instance) return;

        /*
         * GSAP gives seconds.
         *
         * Lenis expects milliseconds.
         */
        instance.raf(time * 1000);
      };

      gsap.ticker.add(tickerCallback);

      /*
       * Prevent large jumps after browser/frame stalls.
       */
      gsap.ticker.lagSmoothing(1000, 16);

      // --------------------------------------------------
      // READY
      // --------------------------------------------------

      onScrollReady?.();
    };

    initLenis();

    // ----------------------------------------------------
    // CLEANUP
    // ----------------------------------------------------

    return () => {
      destroyed = true;

      /*
       * Remove GSAP ticker.
       */
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
      }

      /*
       * Destroy Lenis.
       */
      if (instance) {
        instance.destroy();
      }

      /*
       * Clear refs.
       */
      lenisRef.current = null;

      if (
        smootherRef &&
        smootherRef.current === instance
      ) {
        smootherRef.current = null;
      }

      /*
       * Clear timeout.
       */
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }

      /*
       * Remove scrolling class.
       */
      document.documentElement.classList.remove(
        "is-scrolling"
      );
    };
  }, [onScrollReady, smootherRef]);

  // ------------------------------------------------------
  // PRELOADER + ROUTE CHANGE
  // ------------------------------------------------------

  useEffect(() => {
    const lenis = lenisRef.current;

    if (!lenis) return;

    /*
     * Lock scrolling while the preloader is active.
     */
    if (!preloaderDone) {
      lenis.stop();
      return;
    }

    /*
     * Enable scrolling.
     */
    lenis.start();

    /*
     * Reset scroll position on route change.
     */
    lenis.scrollTo(0, {
      immediate: true,
    });

    /*
     * Wait for page layout to settle, then refresh
     * ScrollTrigger measurements.
     */
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 150);

    return () => {
      clearTimeout(timer);
    };
  }, [pathname, preloaderDone]);

  // ------------------------------------------------------
  // RENDER
  // ------------------------------------------------------

  return (
    <div className="flex flex-col min-h-[100dvh] w-full relative">
      <CustomScrollBar />

      {children}
    </div>
  );
}