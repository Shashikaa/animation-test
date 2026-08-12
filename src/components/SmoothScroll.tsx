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
    const lenis = new Lenis({
      duration: 1.2,

      easing: (t) =>
        Math.min(
          1,
          1.001 - Math.pow(2, -10 * t)
        ),

      /*
       * Desktop wheel.
       */
      smoothWheel: true,

      /*
       * Keep touch relatively close to native.
       *
       * Do NOT make this excessively high.
       */
      touchMultiplier: 1,

      /*
       * Prevent Lenis from trying to fight native touch
       * momentum.
       */
      syncTouch: false,
    });


    /*
     * Every Lenis scroll update tells ScrollTrigger to update.
     */
    lenis.on("scroll", ScrollTrigger.update);


    /*
     * GSAP drives Lenis.
     */
    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };


    gsap.ticker.add(updateTicker);


    /*
     * Prevent GSAP from compensating for frame drops by
     * artificially adjusting time.
     */
    gsap.ticker.lagSmoothing(0);


    return () => {
      gsap.ticker.remove(updateTicker);

      lenis.destroy();
    };
  }, []);


  return <>{children}</>;
}