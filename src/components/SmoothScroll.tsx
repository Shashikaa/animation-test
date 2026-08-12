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
      duration: 1.1,

      // Smooth but still responsive.
      easing: (t) => 1 - Math.pow(1 - t, 4),

      // Desktop wheel.
      smoothWheel: true,

      // Keep touch responsive.
      touchMultiplier: 1,
    });

    const onScroll = () => {
      ScrollTrigger.update();
    };

    lenis.on("scroll", onScroll);

    const raf = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(raf);

    // Prevent GSAP from applying its own lag smoothing
    // on top of Lenis.
    gsap.ticker.lagSmoothing(0);

    // Make sure ScrollTrigger knows about the initial layout.
    ScrollTrigger.refresh();

    return () => {
      lenis.off("scroll", onScroll);
      gsap.ticker.remove(raf);

      lenis.destroy();

      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return <>{children}</>;
}