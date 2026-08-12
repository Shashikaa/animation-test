"use client";

import { useEffect } from "react";

import Lenis from "lenis";

import gsap from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    /*
     * Detect mobile once when the component mounts.
     *
     * Desktop:
     *   Lenis smooth wheel scrolling.
     *
     * Mobile:
     *   Native touch scrolling.
     *
     * This prevents Lenis from fighting the mobile browser's
     * viewport/address-bar behavior.
     */
    const isMobile = window.matchMedia(
      "(max-width: 767px)"
    ).matches;

    const lenis = new Lenis({
      /*
       * Desktop smooth scrolling.
       */
      duration: 1.2,

      easing: (t) =>
        Math.min(
          1,
          1.001 - Math.pow(2, -10 * t)
        ),

      /*
       * Desktop:
       * smooth mouse wheel.
       *
       * Mobile:
       * native browser touch scrolling.
       */
      smoothWheel: !isMobile,

      /*
       * Keep touch native.
       */
      syncTouch: false,

      /*
       * Do not amplify mobile touch movement.
       */
      touchMultiplier: 1,
    });

    /*
     * Every Lenis scroll update tells ScrollTrigger
     * to recalculate.
     */
    lenis.on("scroll", ScrollTrigger.update);

    /*
     * GSAP drives Lenis on desktop.
     *
     * On mobile Lenis still exists, but smoothWheel is disabled,
     * so native touch scrolling remains in control.
     */
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);

    /*
     * Prevent GSAP from artificially changing the time
     * after dropped frames.
     */
    gsap.ticker.lagSmoothing(0);

    /*
     * Refresh ScrollTrigger after everything has mounted.
     */
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });

    return () => {
      gsap.ticker.remove(updateTicker);

      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}